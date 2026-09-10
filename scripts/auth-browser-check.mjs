import {chromium} from '@playwright/test';
import {isIP} from 'node:net';
const base=process.env.TEST_URL||'https://noware.so';
const ip=process.env.TEST_RESOLVE_IP;
if(ip&&isIP(ip)!==4)throw Error('TEST_RESOLVE_IP must be an IPv4 address');
const args=ip?[`--host-resolver-rules=MAP ${new URL(base).hostname} ${ip}`]:[];
const b=await chromium.launch({channel:'chrome',headless:true,args});
try{
 const p=await b.newPage({viewport:{width:1440,height:1000}});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.text().includes('GSI_LOGGER'))errors.push(m.text())});
 await p.goto(base,{timeout:20000});
 if(!p.url().endsWith('/login.html'))throw Error('Root did not redirect to login');
 await p.locator('#google-button iframe').waitFor({state:'visible',timeout:15000});
 for(const path of ['/board.json','/source/AirCube.kicad_pcb','/source/AirCube.kicad_sch']){
  const r=await p.evaluate(async path=>{const r=await fetch(path,{credentials:'omit'});return {status:r.status,url:r.url}},path);
  if(r.status!==200||!r.url.endsWith('/login.html'))throw Error('Unauthenticated route accessible: '+path);
 }
 const sessionStatus=await p.evaluate(async()=> (await fetch('/api/auth?action=session',{credentials:'omit'})).status);
 if(sessionStatus!==401)throw Error('Missing session was accepted');
 await p.setViewportSize({width:390,height:844});
 await p.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth,null,{timeout:5000});
 await p.locator('#google-button iframe').waitFor({state:'visible',timeout:10000});
 await p.screenshot({path:'/tmp/noware-live-login-mobile.png',fullPage:true});
 if(errors.length)throw Error(errors.join('; '));
 console.log('Live HTTPS, login redirect, Google button, unauthenticated data/download restrictions and desktop-to-mobile layout passed.');
 if(ip)console.log(`Used ${ip} to bypass stale local DNS; all HTTPS requests still went through the real Cloudflare endpoint.`);
 console.log('A real Noso account must still complete the final sign-in/session/logout check.');
}finally{await b.close()}
