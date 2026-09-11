import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://localhost:5175');await page.locator('#open-library').click();
 await page.locator('canvas[data-component=U7]').waitFor();
 const refs=await page.locator('[data-library-ref]').evaluateAll(els=>els.map(e=>e.dataset.libraryRef));
 for(const ref of refs){await page.locator(`[data-library-ref="${ref}"]`).click();await page.locator(`canvas[data-component="${ref}"]`).waitFor();assert.notEqual(await page.locator('canvas').getAttribute('data-model'),'simplified');assert.match(await page.locator('#model-bounds').innerText(),/mm/);
  if(['P1','S2','S3','U2','U6','U10','TP2','R1','C1','LED1','Q1','D5','U7','WIFI-C3'].includes(ref)){
   await page.locator('#component-viewer').screenshot({path:`/tmp/noware-model-${ref}.png`});
   await page.locator('#model-bottom').click();await page.locator('#component-viewer').screenshot({path:`/tmp/noware-model-${ref}-bottom.png`});
  }
 }
 assert.equal(refs.length,46);assert.deepEqual(errors,[]);console.log('All 46 library entries load named models; camera controls and model bounds checked.');
}finally{await browser.close()}
