import {chromium} from '@playwright/test';
const base=process.env.TEST_URL||'https://aircube-explorer.vercel.app';
for(const path of ['/','/board.json','/source/AirCube.kicad_pcb','/source/AirCube.kicad_sch']){
 const r=await fetch(base+path,{redirect:'manual'});
 if(r.status!==303||!r.headers.get('location')?.endsWith('/login.html'))throw Error('Unauthenticated route accessible: '+path);
}
const b=await chromium.launch({channel:'chrome',headless:true});
try{
 const p=await b.newPage({viewport:{width:390,height:844}});
 const googleErrors=[];p.on('console',m=>{if(m.text().includes('GSI_LOGGER'))googleErrors.push(m.text())});
 await p.goto(base);
 await p.locator('#message').filter({hasText:'Only Noso'}).waitFor();
 await p.screenshot({path:'/tmp/noware-login.png',fullPage:true});
 if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Login page overflows on mobile');
 const button=p.locator('#google-button iframe');
 try{await button.waitFor({state:'visible',timeout:10000});console.log('Google button visible. A real Noso user must complete the final sign-in check.');}
 catch{throw Error('Google sign-in client configuration required: '+googleErrors.join('; '));}
 console.log('Production auth gate and mobile login page checks passed.');
}finally{await b.close()}
