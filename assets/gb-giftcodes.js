/* Gore Burst gift-code popup. Redeeming is exclusively handled by Supabase RPC. */
(()=>{'use strict';
const openBtn=document.getElementById('gbGiftOpen');if(!openBtn)return;
const dialog=document.createElement('div');dialog.id='gbGiftModal';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','Redeem gift code');dialog.hidden=true;
dialog.innerHTML='<section class="gb-gift-card"><button class="gb-gift-x" id="gbGiftX" type="button" aria-label="Close">×</button><h2>🎁 GIFT CODE</h2><p>A little something from Mr. Walker.</p><form id="gbGiftForm"><input id="gbGiftInput" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="32" placeholder="ENTER GIFT CODE" aria-label="Gift code" required><button type="submit" id="gbGiftRedeem">REDEEM</button></form><div id="gbGiftMessage" role="status" aria-live="polite"></div><img id="gbGiftRewardImg" alt="Unlocked frame" hidden><button type="button" id="gbGiftDone">CLOSE</button></section>';
(document.getElementById('app')||document.body).append(dialog);
const input=dialog.querySelector('#gbGiftInput'),msg=dialog.querySelector('#gbGiftMessage'),img=dialog.querySelector('#gbGiftRewardImg'),submit=dialog.querySelector('#gbGiftRedeem');
const close=()=>{dialog.hidden=true;};
const open=()=>{document.getElementById('gbSettings')?.classList.remove('open');dialog.hidden=false;msg.textContent='';img.hidden=true;input.value='';input.focus();};
openBtn.addEventListener('click',open);
dialog.querySelector('#gbGiftX').addEventListener('click',close);dialog.querySelector('#gbGiftDone').addEventListener('click',close);
dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)close()});
dialog.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const code=input.value.trim().toUpperCase().replace(/\s+/g,'');if(!/^[A-Z0-9-]{4,32}$/.test(code)){msg.textContent='Please enter a valid code.';return;}
submit.disabled=true;msg.textContent='Checking your code…';img.hidden=true;
try{
 // Cache a single promise so repeated redemptions don't spawn auth clients.
 const client=await (window.gbGiftSupabaseClientPromise ||= import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm').then(({createClient})=>createClient('https://harqhhpobaepfkfeitmw.supabase.co','sb_publishable_K9F36jgWZaMWywln6Wwaiw_4zJ7523C',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}})).catch(error=>{window.gbGiftSupabaseClientPromise=null;throw error}));
 const {data:{user},error:authError}=await client.auth.getUser();if(authError||!user||user.is_anonymous){msg.textContent='Log in to your account to claim gift codes.';return;}
 // Try newer multi-reward codes first (atomic coins + optional frame).
 const bundle=await client.rpc('gb_redeem_bundle_code',{p_code:code});
 if(!bundle.error && bundle.data?.success){
  msg.textContent='GIFT CLAIMED! '+(Number(bundle.data.coins)>0?Number(bundle.data.coins).toLocaleString()+' Skull Coins added. ':'')+(bundle.data.frame_id?'Your frame is in Edit Profile → Frames.':'');
  if(bundle.data.frame_id&&bundle.data.storage_path){img.src=client.storage.from('gb-published-frames').getPublicUrl(bundle.data.storage_path).data.publicUrl;img.hidden=false;}
  await window.gbGiftOwnershipRefresh?.();await window.gbPublishedFrameRefresh?.();
  return;
 }
 if(bundle.error && !/function.*does not exist|could not find the function/i.test(bundle.error.message||'')){
  msg.textContent=bundle.error.message;return;
 }
 // Existing codes retain their original RPC; new Control Room codes use a separate secured RPC.
 let {data,error}=await client.rpc('gb_redeem_frame_code',{p_code:code});
 let published=false;
 if(error || !(Array.isArray(data)?data[0]:data)?.success){
   const second=await client.rpc('gb_redeem_published_frame_code',{p_code:code});
   if(!second.error && second.data?.success){data=second.data;error=null;published=true;}
   else {msg.textContent=second.error?.message||error?.message||(Array.isArray(data)?data[0]:data)?.message||'Code could not be redeemed.';return;}
 }
 const result=Array.isArray(data)?data[0]:data;if(!result?.success){msg.textContent=result?.message||'Code could not be redeemed.';return;}
 msg.textContent='GIFT CLAIMED! Your new frame is in Edit Profile → Frames.';
 img.src=published?client.storage.from('gb-published-frames').getPublicUrl(result.storage_path).data.publicUrl:'assets/profile-frames/'+result.frame_id+'.png';
 img.hidden=false;
 await Promise.all([window.gbGiftOwnershipRefresh?.(),window.gbPublishedFrameRefresh?.()]);window.gbpfRefresh?.();
}catch(err){msg.textContent='Connection error. Please try again.';console.warn(err)}finally{submit.disabled=false}
});
})();
