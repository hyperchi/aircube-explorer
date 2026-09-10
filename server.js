import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import auth from './api/auth.js';
import {readSession,getCookie,SESSION_COOKIE} from './lib/session.js';
import {ALLOWED_DOMAIN} from './lib/auth-policy.js';

export function createApp(){
 const app=express();
 const dist=fileURLToPath(new URL('./dist/',import.meta.url));
 app.disable('x-powered-by');
 app.use((req,res,next)=>{res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Cross-Origin-Opener-Policy','same-origin-allow-popups');next()});
 app.get('/api/health',(req,res)=>res.status(200).send('ok'));
 app.all('/api/auth',express.json({limit:'20kb'}),auth);
 for(const file of ['login.html','login.js'])app.get('/'+file,(req,res)=>res.sendFile(path.join(dist,file)));
 app.use(async(req,res,next)=>{
  const session=await readSession(getCookie(req.headers.cookie,SESSION_COOKIE),{secret:process.env.SESSION_SECRET,domain:ALLOWED_DOMAIN});
  if(!session)return res.redirect(303,'/login.html');
  next();
 });
 app.use(express.static(dist,{dotfiles:'deny',etag:false,lastModified:false,setHeaders:res=>res.setHeader('Cache-Control','private, no-store')}));
 app.use((req,res)=>res.status(404).send('Not found'));
 app.use((err,req,res,next)=>{res.status(err.status===413?413:400).json({error:'Request could not be processed.'})});
 return app;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const server=createApp().listen(Number(process.env.PORT)||8080,'0.0.0.0',()=>console.log('noware server ready'));
 process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
}
