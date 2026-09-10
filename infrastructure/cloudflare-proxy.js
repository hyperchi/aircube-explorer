// Cloudflare only terminates the custom-domain TLS connection and forwards
// requests. The app, files, authentication, and sessions run on Google Cloud Run.
export default {
 async fetch(request, env) {
  const incoming=new URL(request.url);
  if(incoming.protocol!=='https:')return Response.redirect('https://noware.so'+incoming.pathname+incoming.search,308);
  const origin=new URL(env.CLOUD_RUN_ORIGIN);
  if(!origin.hostname.endsWith('.run.app')||origin.protocol!=='https:')return new Response('Origin not configured',{status:503});
  origin.pathname=incoming.pathname;origin.search=incoming.search;
  const headers=new Headers(request.headers);
  headers.delete('host');
  headers.set('X-Noware-Public-Host','noware.so');
  const forwarded=new Request(origin,{method:request.method,headers,body:['GET','HEAD'].includes(request.method)?undefined:request.body,redirect:'manual'});
  const upstream=await fetch(forwarded,{cf:{cacheTtl:0,cacheEverything:false}});
  const result=new Response(upstream.body,upstream);
  result.headers.set('Cache-Control','private, no-store');
  const location=result.headers.get('location');
  if(location?.startsWith(env.CLOUD_RUN_ORIGIN))result.headers.set('location',location.replace(env.CLOUD_RUN_ORIGIN,'https://noware.so'));
  return result;
 }
};
