const message = document.querySelector('#message');
const fail = text => {message.textContent=text;document.querySelector('#retry').style.display='inline-block';};
async function init() {
  try {
    const session = await fetch('/api/auth?action=session');
    if(session.ok){location.replace('/');return;}
    const response = await fetch('/api/auth?action=config');
    const config = await response.json();
    if(!response.ok)throw Error(config.error);
    const script = document.createElement('script');
    script.src='https://accounts.google.com/gsi/client';
    script.async=true;
    await new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(Error('Google sign-in could not load. Check your connection and try again.'));document.head.append(script);});
    google.accounts.id.initialize({client_id:config.clientId,hd:config.domain,nonce:config.nonce,auto_select:false,callback:async({credential})=>{
      message.textContent='Verifying your Noso account…';
      try {
        const result=await fetch('/api/auth?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential})});
        const data=await result.json();
        if(!result.ok)throw Error(data.error);
        location.replace('/');
      }catch(e){fail(e.message||'Sign-in failed. Please try again.');}
    }});
    google.accounts.id.renderButton(document.querySelector('#google-button'),{theme:'outline',size:'large',shape:'pill',text:'signin_with',width:Math.min(340,innerWidth-120)});
    message.textContent='Only Noso Google Workspace accounts can sign in.';
  }catch(e){fail(e.message||'Sign-in is unavailable. Please try again later.');}
}
init();
