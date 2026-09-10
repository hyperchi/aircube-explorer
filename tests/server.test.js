import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server.js';
import {createSession,sessionCookie} from '../lib/session.js';
test('Cloud Run server protects assets and exposes only login and health',async()=>{
 process.env.SESSION_SECRET='test-only-secret'.repeat(4);
 const server=createApp().listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const url of ['/','/board.json','/source/AirCube.kicad_pcb','/source/AirCube.kicad_sch']){
   const r=await fetch(base+url,{redirect:'manual'});assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/login.html');
  }
  assert.equal((await fetch(base+'/api/health')).status,200);
  assert.equal((await fetch(base+'/login.html')).status,200);
  const token=await createSession({email:'person@noso.so',sub:'123'},{secret:process.env.SESSION_SECRET,domain:'noso.so'});
  const r=await fetch(base+'/board.json',{headers:{cookie:sessionCookie(token)}});assert.equal(r.status,200);assert.equal((await r.json()).tracks.length,301);assert.equal(r.headers.get('cache-control'),'private, no-store');
 }finally{await new Promise(r=>server.close(r));delete process.env.SESSION_SECRET;}
});
