import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {readSession,getCookie,SESSION_COOKIE,SESSION_SECONDS} from '../lib/session.js';
import handler from '../api/auth.js';
import middleware from '../middleware.js';
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},status(n){this.statusCode=n;return this;},json(data){this.body=data;return this;}}}
function request(action,method='GET',extra={}){return {url:'/api/auth?action='+action,method,headers:{origin:'https://aircube-explorer.vercel.app','content-type':'application/json',...extra.headers},body:extra.body};}
test('complete identity exchange, route protection, logout and invalid identities',async()=>{
 process.env.SESSION_SECRET='test-only-secret'.repeat(4);process.env.GOOGLE_CLIENT_ID='test-client';
 const originalFetch=globalThis.fetch;
 const {privateKey,publicKey}=await generateKeyPair('RS256');
 const publicJwk={...await exportJWK(publicKey),kid:'test-key',alg:'RS256',use:'sig'};
 globalThis.fetch=async url=>{assert.equal(String(url),'https://www.googleapis.com/oauth2/v3/certs');return Response.json({keys:[publicJwk]})};
 try{
  const config=response();await handler(request('config'),config);assert.equal(config.statusCode,200);
  const cookie=config.headers['set-cookie'].split(';')[0];
  const identity={email:'person@noso.so',email_verified:true,hd:'noso.so',nonce:config.body.nonce};
  const token=async(payload,expires='5m')=>new SignJWT(payload).setProtectedHeader({alg:'RS256',kid:'test-key'}).setSubject('123').setIssuer('https://accounts.google.com').setAudience('test-client').setIssuedAt().setExpirationTime(expires).sign(privateKey);
  const exchange=async(payload,headers={})=>{const r=response();await handler(request('login','POST',{headers:{cookie,...headers},body:{credential:await token(payload)}}),r);return r;};
  const good=await exchange(identity);assert.equal(good.statusCode,200);
  const sessionCookie=good.headers['set-cookie'][0];assert.match(sessionCookie,/Max-Age=2592000/);
  assert.equal((await readSession(getCookie(sessionCookie,SESSION_COOKIE),{secret:process.env.SESSION_SECRET,domain:'noso.so'})).email,'person@noso.so');
  for(const path of ['/','/board.json','/source/AirCube.kicad_pcb','/assets/main.js']){
   assert.equal((await middleware(new Request('https://aircube-explorer.vercel.app'+path))).status,303);
   const authorized=await middleware(new Request('https://aircube-explorer.vercel.app'+path,{headers:{cookie:sessionCookie}}));
   assert.equal(authorized.status,200);assert.equal(authorized.headers.get('cache-control'),'private, no-store');
  }
  assert.equal((await exchange({...identity,hd:'evil.com'})).statusCode,403);
  assert.equal((await exchange({...identity,email_verified:false})).statusCode,403);
  assert.equal((await exchange({...identity,nonce:'wrong'})).statusCode,401);
  assert.equal((await exchange(identity,{cookie:''})).statusCode,401);
  assert.equal((await exchange(identity,{origin:'https://evil.com'})).statusCode,403);
  const logout=response();await handler(request('logout','POST'),logout);assert.match(logout.headers['set-cookie'][0],/Max-Age=0/);
 }finally{globalThis.fetch=originalFetch;delete process.env.SESSION_SECRET;delete process.env.GOOGLE_CLIENT_ID;}
});
