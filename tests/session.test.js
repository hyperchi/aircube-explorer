import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSession,readSession,sessionCookie,clearSessionCookie,SESSION_SECONDS,allowedEmail} from '../lib/session.js';
const config={secret:'test-secret-'.repeat(4),domain:'example.com',now:1800000000000};
test('session lasts exactly 30 days without extending on read',async()=>{
 const token=await createSession({email:'person@example.com',sub:'123'},config);
 assert.equal((await readSession(token,{...config,now:config.now+(SESSION_SECONDS-1)*1000})).email,'person@example.com');
 assert.equal(await readSession(token,{...config,now:config.now+SESSION_SECONDS*1000}),null);
 assert.match(sessionCookie(token),/Max-Age=2592000/);
 assert.match(sessionCookie(token),/HttpOnly; Secure; SameSite=Lax/);
 assert.match(clearSessionCookie(),/Max-Age=0/);
});
test('rejects forged cookies and other domains',async()=>{
 const token=await createSession({email:'person@example.com',sub:'123'},config);
 assert.equal(await readSession(token,{...config,secret:'different-secret'.repeat(4)}),null);
 assert.equal(await readSession(token,{...config,domain:'other.com'}),null);
 assert.equal(await readSession('forged',config),null);
 for(const email of ['person@example.com.evil.com','person@sub.example.com','person@evil.com','person@@example.com'])assert.equal(allowedEmail(email,'example.com'),false);
 await assert.rejects(createSession({email:'person@evil.com',sub:'123'},config));
});
