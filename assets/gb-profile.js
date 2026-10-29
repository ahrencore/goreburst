
/* Gore Burst profile and optional private cloud-backup client.
   Snapshot backups are UNVERIFIED and never used for official rewards/leaderboards. */
const SUPABASE_URL='https://harqhhpobaepfkfeitmw.supabase.co';
const SUPABASE_KEY='sb_publishable_K9F36jgWZaMWywln6Wwaiw_4zJ7523C';
const AVATARS=['Mr Walker','Fortune Teller','Sad Clown Girl','Clown Boy','Haunted Doll','Strongman','The Magician','Balloon Seller','Masked Mime','Candy Booth Girl','Ferris Wheel Operator','Ticket Master','Acrobat','Ringmaster Assistant','Ghostly Guest'];
const KEYS=['Mr_Walker','Fortune_Teller','Sad_Clown_Girl','Clown_Boy','Haunted_Doll','Strongman','The_Magician','Balloon_Seller','Masked_Mime','Candy_Booth_Girl','Ferris_Wheel_Operator','Ticket_Master','Acrobat','Ringmaster_Assistant','Ghostly_Guest'];
const fallbackAvatar='assets/avatars/01_Mr_Walker.png';
const $p=id=>document.getElementById(id);
// Friend-request indicator: position against the actual HUD avatar, never the whole screen.
const gbprHud=document.querySelector('#menu .top.art-hud');
const gbprPfpDot=document.createElement('span');
gbprPfpDot.id='gbpr-pfp-request-dot';
gbprPfpDot.hidden=true;
gbprPfpDot.setAttribute('aria-hidden','true');
gbprHud?.append(gbprPfpDot);
let gbprDotQueryId=0;
let gbprFriendsPending=false,gbprMailPending=false;
function gbprUpdatePfpNotice(){gbprPfpDot.hidden=!(gbprFriendsPending||gbprMailPending);}
async function gbprRefreshRequestDot(){
  const seq=++gbprDotQueryId;
  const friendsButton=prHub?.querySelector('[data-gbpr-nav="friends"]');
  if(!sb||!gbprRegistered()||!profile?.username){
    gbprFriendsPending=false;gbprUpdatePfpNotice();
    friendsButton?.classList.remove('gbpr-request-pending');
    return;
  }
  const {data,error}=await sb.rpc('gb_friend_list');
  if(seq!==gbprDotQueryId)return;
  if(error){return;} // Keep previous state on transient connection failures.
  const pending=Array.isArray(data)&&data.some(row=>row.kind==='incoming');
  gbprFriendsPending=pending;gbprUpdatePfpNotice();
  friendsButton?.classList.toggle('gbpr-request-pending',pending);
}
window.addEventListener('focus',()=>{void gbprRefreshRequestDot();void gbprRefreshMailDot()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){void gbprRefreshRequestDot();void gbprRefreshMailDot()}});
setInterval(()=>{if(!document.hidden){void gbprRefreshRequestDot();void gbprRefreshMailDot()}},30000);

const layer=document.createElement('aside');layer.id='gb-profile-layer';layer.setAttribute('aria-label','Player profile');layer.innerHTML=`
<div class="gbpr-top"><h2>✦ PLAYER PROFILE ✦</h2><button class="gbpr-close" id="gbpr-close" aria-label="Close profile">×</button></div>
<div class="gbpr-scroll">
<div class="gbpr-panel gbpr-hero"><img id="gbpr-current-avatar" src="${fallbackAvatar}" alt="Current avatar"><div><div class="gbpr-name" id="gbpr-display">Carnival Guest</div><div class="gbpr-handle" id="gbpr-handle">Guest player</div><div class="gbpr-level" id="gbpr-level">LEVEL 1 · Local progress</div></div></div>
<div id="gbpr-auth-panel" class="gbpr-panel"><div class="gbpr-tag">YOUR CARNIVAL ACCOUNT</div><p class="gbpr-muted">You can keep playing as a guest. Sign in to save your online profile and find other players later.</p>
<div class="gbpr-tabs"><button id="gbpr-login-tab" class="gbpr-btn">SIGN IN</button><button id="gbpr-signup-tab" class="gbpr-btn secondary">CREATE ACCOUNT</button></div>
<form id="gbpr-auth-form" class="gbpr-form"><label>Email<input id="gbpr-email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label><label>Password<input id="gbpr-password" type="password" autocomplete="current-password" minlength="6" required placeholder="Your password"></label><button id="gbpr-auth-submit" class="gbpr-btn" type="submit">SIGN IN</button></form><p class="gbpr-error" id="gbpr-auth-status" aria-live="polite"></p></div>
<div id="gbpr-account-panel" class="gbpr-panel gbpr-hide"><div class="gbpr-tag">EDIT YOUR PROFILE</div>
<form id="gbpr-edit-form" class="gbpr-form"><label>Display name<input id="gbpr-new-name" maxlength="30" required placeholder="Carnival Guest"></label><label>Unique username (3–20 letters, numbers or underscores)<input id="gbpr-new-handle" maxlength="20" minlength="3" pattern="[a-zA-Z0-9_]{3,20}" placeholder="my_carnival_name"></label><button type="submit" class="gbpr-btn">SAVE PROFILE</button></form><p class="gbpr-error" id="gbpr-edit-status" aria-live="polite"></p><button id="gbpr-signout" class="gbpr-btn secondary">SIGN OUT</button></div>
<div class="gbpr-panel"><div class="gbpr-tag">CHOOSE A CARNIVAL AVATAR</div><div id="gbpr-avatar-list" class="gbpr-avatars"></div><p class="gbpr-muted" id="gbpr-avatar-help">Sign in to save your avatar to your online profile. You may preview the characters as a guest.</p><div class="gbpr-actions"><label class="gbpr-btn secondary" for="gbpr-upload">UPLOAD YOUR PHOTO</label><input id="gbpr-upload" type="file" accept="image/jpeg,image/png,image/webp" hidden></div><p class="gbpr-error" id="gbpr-upload-status" aria-live="polite"></p></div>
<div class="gbpr-panel"><div class="gbpr-tag">SAVE STATUS</div><p class="gbpr-muted gbpr-note">Your progress is saved locally. Signed-in accounts can automatically back up changes after safely choosing which save to use. Official leaderboard scores remain separate.</p></div>
<div class="gbpr-panel"><div class="gbpr-tag">PRIVATE CLOUD BACKUP</div>
<p class="gbpr-muted">Safely sync your private gameplay backup. On a new device, review your local and cloud saves before replacing either. This does not register official leaderboard stars or grant coins.</p>
<div class="gbpr-actions"><button type="button" class="gbpr-btn secondary" id="gbpr-download-backup">DOWNLOAD LOCAL SAVE</button><button type="button" class="gbpr-btn" id="gbpr-cloud-enable">CHECK CLOUD SAVE</button></div>
<div id="gbpr-cloud-choices" class="gbpr-hide" style="margin:12px 0;padding:12px;border:1px solid #aa609b;border-radius:12px;background:#281329">
<p id="gbpr-cloud-comparison" class="gbpr-muted" style="white-space:pre-line"></p>
<div class="gbpr-actions"><button type="button" class="gbpr-btn secondary" id="gbpr-cloud-restore">RESTORE CLOUD TO THIS DEVICE</button><button type="button" class="gbpr-btn secondary" id="gbpr-cloud-use-local">USE THIS DEVICE'S SAVE</button></div>
<p class="gbpr-muted">Nothing is replaced until you choose. A safety copy is downloaded before restoring.</p>
</div>
<p class="gbpr-error" id="gbpr-cloud-status" aria-live="polite">Cloud backup is off. Your browser save is unchanged.</p></div>
</div>`;
document.getElementById('app').append(layer);

// Compact player hub: existing forms and cloud recovery remain intact in their own screens.
const prScroll=layer.querySelector('.gbpr-scroll');
const prPanels=[...prScroll.children];
const prHero=prPanels[0],prLogin=prPanels[1],prEdit=prPanels[2],prAvatar=prPanels[3],prSaveInfo=prPanels[4],prCloud=prPanels[5];
const prHub=document.createElement('section');prHub.id='gbpr-hub';prHub.className='gbpr-screen';
prHub.innerHTML=`<div class="gbpr-hub-identity"></div><div class="gbpr-hub-stats"><div><small>LEVEL</small><strong id="gbpr-hub-level">1</strong></div><div><small>STARS</small><strong id="gbpr-hub-stars">0 ★</strong></div></div><div class="gbpr-hub-links"><button type="button" data-gbpr-nav="mail">✉ <span>MAILBOX</span></button><button type="button" data-gbpr-nav="friends">♧ <span>FRIENDS</span></button><button type="button" data-gbpr-nav="edit">✦ <span>EDIT PROFILE</span></button><button type="button" data-gbpr-nav="account">⚙ <span>ACCOUNT</span></button></div>`;
prScroll.prepend(prHub);
prHub.querySelector('.gbpr-hub-identity').append(prHero);
const prScreen=(id,title)=>{const section=document.createElement('section');section.id='gbpr-screen-'+id;section.className='gbpr-screen gbpr-hide';section.innerHTML=`<div class="gbpr-subhead"><button type="button" class="gbpr-btn secondary" data-gbpr-home>‹ BACK</button><h3>${title}</h3></div>`;prScroll.append(section);return section};
const prEditScreen=prScreen('edit','EDIT PROFILE');prEditScreen.append(prEdit,prAvatar);
const prAccountScreen=prScreen('account','ACCOUNT');prAccountScreen.append(prLogin,prSaveInfo,prCloud);
const prAccountSigned=document.createElement('div');prAccountSigned.className='gbpr-panel';prAccountSigned.innerHTML='<div class="gbpr-tag">ACCOUNT STATUS</div><p id="gbpr-simple-status" class="gbpr-muted"></p>';
prAccountScreen.insertBefore(prAccountSigned,prSaveInfo);
const prMailScreen=prScreen('mail','MAILBOX');
prMailScreen.insertAdjacentHTML('beforeend',`<section class="gbpr-panel"><div class="gbpr-tag">CARNIVAL MAIL</div><div class="gbpr-social-actions"><button type="button" class="gbpr-btn secondary" id="gbpr-mail-refresh">REFRESH</button></div><div id="gbpr-mail-list" aria-live="polite" class="gbpr-social-list">Loading mail…</div><p class="gbpr-muted">Event prizes will become claimable after the reward distribution system is approved and activated.</p></section>`);
const prFriendsScreen=prScreen('friends','FRIENDS');
prFriendsScreen.insertAdjacentHTML('beforeend',`<section class="gbpr-panel"><div class="gbpr-tag">FIND YOUR CARNIVAL CREW</div><p id="gbpr-friends-note" class="gbpr-muted"></p><button type="button" class="gbpr-btn" id="gbpr-friends-account">ACCOUNT</button><div id="gbpr-friends-controls" class="gbpr-hide"><form id="gbpr-friend-search" class="gbpr-social-search"><input type="search" maxlength="20" minlength="3" placeholder="Search @username" aria-label="Find player by username" required><button type="submit" class="gbpr-btn">SEARCH</button></form><div id="gbpr-friend-results" class="gbpr-social-list" aria-live="polite"></div><div class="gbpr-tag" style="margin-top:16px">YOUR FRIENDS & REQUESTS</div><div id="gbpr-friend-list" class="gbpr-social-list" aria-live="polite"></div><button type="button" class="gbpr-btn secondary" id="gbpr-friends-refresh">REFRESH</button></div></section>`);
let prCurrent='hub';
function prNavigate(name){
 prCurrent=name;prScroll.querySelectorAll('.gbpr-screen').forEach(s=>s.classList.toggle('gbpr-hide',s.id!==(name==='hub'?'gbpr-hub':'gbpr-screen-'+name)));
 const authLabel=prAccountScreen.querySelector('#gbpr-simple-status');if(authLabel)authLabel.textContent=gbprRegistered()?'Signed in. Your account and cloud recovery options are below.':'Playing as a guest. Create an account to secure your progress.';
 const f=prFriendsScreen.querySelector('#gbpr-friends-note');if(f)f.textContent=gbprRegistered()?(profile?.username?'Search by unique @username.':'Choose your unique @username under Edit Profile first.'):'Create an account and choose a unique @username to add friends.';
 prFriendsScreen.querySelector('#gbpr-friends-account').classList.toggle('gbpr-hide',!!(gbprRegistered()&&profile?.username));
 prFriendsScreen.querySelector('#gbpr-friends-controls').classList.toggle('gbpr-hide',!(gbprRegistered()&&profile?.username));
 if(name==='friends'&&gbprRegistered()&&profile?.username)gbprLoadFriends();
 if(name==='mail')gbprLoadMail();
 prScroll.scrollTop=0;
}
prScroll.querySelectorAll('[data-gbpr-nav]').forEach(b=>b.onclick=()=>prNavigate(b.dataset.gbprNav));
prScroll.querySelectorAll('[data-gbpr-home]').forEach(b=>b.onclick=()=>prNavigate('hub'));
prFriendsScreen.querySelector('#gbpr-friends-account').onclick=()=>prNavigate(gbprRegistered()?'edit':'account');
const prUpdateHub=()=>{
 const level=prHub.querySelector('#gbpr-hub-level'),stars=prHub.querySelector('#gbpr-hub-stars');
 if(level)level.textContent=String(localLevel());
 let best={};try{best=JSON.parse(localStorage.getItem('gb-playable-v4')||'{}').best||{}}catch{}
 if(stars)stars.textContent=Object.values(best).reduce((n,v)=>n+Math.max(0,Math.min(3,Number(v)||0)),0)+' ★';
};

let sb=null,user=null,profile=null,signup=false,working=false,avatarPreview=null;
const gbprIsGuest=()=>Boolean(user?.is_anonymous);
const gbprRegistered=()=>Boolean(user&&!user.is_anonymous);
const avatarFile=i=>'assets/avatars/'+String(i+1).padStart(2,'0')+'_'+KEYS[i]+'.png';
const avatarKey=i=>String(i+1).padStart(2,'0')+'_'+KEYS[i];
const avatarIndex=key=>Math.max(0,KEYS.findIndex((x,i)=>avatarKey(i)===key));
const safe=(s)=>String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const localLevel=()=>{try{const data=JSON.parse(localStorage.getItem('gb-playable-v4')||'{}');return Math.max(1,Number(data.current)||1)}catch{return 1}};
function setMessage(id,txt,success=false){const el=$p(id);el.textContent=txt;el.classList.toggle('gbpr-success',success)}
function avatarUrl(){if(avatarPreview!==null)return avatarFile(avatarPreview);if(!user){const ix=Number(localStorage.getItem('gb-guest-avatar'));if(Number.isInteger(ix)&&ix>=0&&ix<15)return avatarFile(ix)}if(profile?.avatar_path){return SUPABASE_URL+'/storage/v1/object/public/avatars/'+profile.avatar_path.split('/').map(encodeURIComponent).join('/')}return avatarFile(avatarIndex(profile?.avatar_key))}
function syncMenuAvatar(){const el=document.getElementById('gbMenuAvatar');if(el){el.src=avatarUrl();el.onerror=()=>{el.onerror=null;el.src=fallbackAvatar}}}
function refresh(){syncMenuAvatar();const signed=gbprRegistered();$p('gbpr-auth-panel').classList.toggle('gbpr-hide',signed);$p('gbpr-account-panel').classList.toggle('gbpr-hide',!signed);$p('gbpr-display').textContent=profile?.display_name||'Carnival Guest';$p('gbpr-handle').textContent=profile?.username?'@'+profile.username:(signed?'Choose a unique username':'Guest player');$p('gbpr-level').textContent='LEVEL '+localLevel()+' · Local progress';$p('gbpr-current-avatar').src=avatarUrl();$p('gbpr-new-name').value=profile?.display_name||'Carnival Guest';$p('gbpr-new-handle').value=profile?.username||'';$p('gbpr-avatar-help').textContent=signed?'Tap any character to save it. You can also upload your own photo.':'Sign in to save a PFP to your account. Tap to preview characters.';document.querySelectorAll('.gbpr-avatar').forEach((b,i)=>b.classList.toggle('chosen',(avatarPreview!==null?avatarPreview:avatarIndex(profile?.avatar_key))===i));}
function view(open){layer.classList.toggle('open',open);if(open){avatarPreview=null;refresh();prUpdateHub();void gbprRefreshMailDot();prNavigate('hub');void gbprRefreshRequestDot();$p('gbpr-close').focus()}}
$p('gbpr-close').onclick=()=>view(false);
document.getElementById('profile').addEventListener('click',()=>view(true));
layer.addEventListener('pointerdown',e=>e.stopPropagation());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&layer.classList.contains('open'))view(false)});
$p('gbpr-avatar-list').innerHTML=AVATARS.map((name,i)=>`<button type="button" class="gbpr-avatar" data-index="${i}"><img loading="lazy" src="${avatarFile(i)}" alt=""></button>`).join('');
async function fetchProfile(){if(!sb||!user)return;const {data,error}=await sb.from('profiles').select('id,username,display_name,avatar_key,avatar_path').eq('id',user.id).maybeSingle();if(error){setMessage('gbpr-edit-status',error.message);return}profile=data||null;refresh();void gbprRefreshRequestDot();if(gbprRegistered())window.gbCloudReady?.()}
for(const el of document.querySelectorAll('.gbpr-avatar'))el.onclick=async()=>{const i=Number(el.dataset.index);avatarPreview=i;refresh();if(!gbprRegistered()||!sb){try{localStorage.setItem('gb-guest-avatar',String(i))}catch(e){};return;}setMessage('gbpr-upload-status','Saving avatar…');const {error}=await sb.from('profiles').update({avatar_key:avatarKey(i),avatar_path:null}).eq('id',user.id);if(error){setMessage('gbpr-upload-status',error.message);return}profile={...profile,avatar_key:avatarKey(i),avatar_path:null};avatarPreview=null;setMessage('gbpr-upload-status','Avatar saved!',true);refresh()};
function setAuthMode(isSignup){signup=isSignup;$p('gbpr-auth-submit').textContent=signup?'CREATE ACCOUNT':'SIGN IN';$p('gbpr-login-tab').classList.toggle('secondary',signup);$p('gbpr-signup-tab').classList.toggle('secondary',!signup);$p('gbpr-password').autocomplete=signup?'new-password':'current-password';setMessage('gbpr-auth-status','')}
$p('gbpr-login-tab').onclick=()=>setAuthMode(false);$p('gbpr-signup-tab').onclick=()=>setAuthMode(true);
$p('gbpr-auth-form').onsubmit=async e=>{
 e.preventDefault();if(!sb){setMessage('gbpr-auth-status','Connection not ready.');return}
 if(working)return;working=true;$p('gbpr-auth-submit').disabled=true;
 const email=$p('gbpr-email').value.trim(),password=$p('gbpr-password').value;
 setMessage('gbpr-auth-status',signup?'Securing your carnival account…':'Signing in…');
 try{
  let result;
  if(signup&&gbprIsGuest()){
   // Convert this exact anonymous identity; never create a second account ID.
   result=await sb.auth.updateUser({email,password});
   if(result.error)throw result.error;
   setMessage('gbpr-auth-status','Check your email for a confirmation link. Keep this browser session until confirmed.',true);
  }else if(signup){
   result=await sb.auth.signUp({email,password});if(result.error)throw result.error;
   setMessage('gbpr-auth-status',result.data?.session?'Welcome!':'Check your email to confirm your account.',true);
  }else{
   if(gbprIsGuest()&&!confirm('Signing into a different account will replace the current guest login on this browser. Your local level save stays here, but the guest account may be unrecoverable. Continue?'))return;
   result=await sb.auth.signInWithPassword({email,password});if(result.error)throw result.error;
   setMessage('gbpr-auth-status','Welcome back!',true);
  }
  if(result?.data?.user){user=result.data.user;await fetchProfile();}
 }catch(err){setMessage('gbpr-auth-status',err.message||'Authentication failed')}
 finally{working=false;$p('gbpr-auth-submit').disabled=false}
};
$p('gbpr-edit-form').onsubmit=async e=>{e.preventDefault();if(!sb||!gbprRegistered())return;const username=$p('gbpr-new-handle').value.trim().toLowerCase();const display_name=$p('gbpr-new-name').value.trim();if(username&&!/^[a-z0-9_]{3,20}$/.test(username)){setMessage('gbpr-edit-status','Username must be 3–20 letters, numbers or underscores.');return}if(!display_name){setMessage('gbpr-edit-status','Choose a display name.');return}setMessage('gbpr-edit-status','Saving…');const {error}=await sb.from('profiles').update({username:username||null,display_name}).eq('id',user.id);if(error){setMessage('gbpr-edit-status',error.code==='23505'?'This username is already taken.':error.message);return}profile={...profile,username:username||null,display_name};setMessage('gbpr-edit-status','Profile updated!',true);refresh()};
$p('gbpr-signout').onclick=async()=>{if(!sb)return;const {error}=await sb.auth.signOut();if(error){setMessage('gbpr-edit-status',error.message);return}user=null;profile=null;avatarPreview=null;cloudReset();refresh();void gbprRefreshRequestDot();void gbprRefreshMailDot()};
$p('gbpr-upload').onchange=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!user||!sb){setMessage('gbpr-upload-status','Please sign in before uploading a photo.');return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setMessage('gbpr-upload-status','Choose a JPG, PNG or WebP image.');return}if(file.size>8*1024*1024){setMessage('gbpr-upload-status','Choose an image smaller than 8 MB.');return}
 setMessage('gbpr-upload-status','Preparing photo…');try{const bmp=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing unavailable');const d=Math.min(bmp.width,bmp.height);ctx.drawImage(bmp,(bmp.width-d)/2,(bmp.height-d)/2,d,d,0,0,512,512);bmp.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.84));if(!blob)throw Error('Could not prepare photo');const path=user.id+'/profile-'+Date.now()+'.webp';setMessage('gbpr-upload-status','Uploading photo…');const upload=await sb.storage.from('avatars').upload(path,blob,{contentType:'image/webp',upsert:false});if(upload.error)throw upload.error;const updated=await sb.from('profiles').update({avatar_path:path}).eq('id',user.id);if(updated.error)throw updated.error;profile={...profile,avatar_path:path};avatarPreview=null;setMessage('gbpr-upload-status','Photo uploaded!',true);refresh()}catch(err){setMessage('gbpr-upload-status',err.message||'Upload failed')}};
async function connect(){
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data,error}=await sb.auth.getUser();
  if(error&&error.name!=='AuthSessionMissingError')setMessage('gbpr-auth-status',error.message);
  user=data?.user||null;
  sb.auth.onAuthStateChange((event,session)=>{
   const next=session?.user||null;
   if(next?.id!==user?.id||next?.is_anonymous!==user?.is_anonymous){
    user=next;profile=null;refresh();void gbprRefreshRequestDot();void gbprRefreshMailDot();if(user)setTimeout(fetchProfile,0);
   }
  });
  if(!user){
   // Anonymous auth is optional on the Supabase dashboard. Keep local gameplay usable if disabled.
   const attempt=await sb.auth.signInAnonymously();
   if(attempt.error){console.info('Gore Burst guest online identity unavailable:',attempt.error.message);}
   else user=attempt.data.user;
  }
  if(user){await fetchProfile();void gbprRefreshMailDot();}else {refresh();void gbprRefreshRequestDot();void gbprRefreshMailDot();} if(gbprIsGuest())void gbUploadGuestStars();
 }catch(err){setMessage('gbpr-auth-status','Cannot connect to Supabase. Local gameplay remains available.');console.warn('Gore Burst profile connection:',err)}
}
// Social backend: registered accounts only. Guest play and game saves remain unchanged.
const gbprSocialMessage=(text)=>`<div class="gbpr-social-empty">${safe(text)}</div>`;
const gbprSocialAvatar=r=>{let url=fallbackAvatar;try{url=window.gbGhostAvatarUrl?.(r)||avatarFile(avatarIndex(r?.avatar_key))}catch{}return safe(url)};
const gbprFriendCard=(r,actions)=>`<div class="gbpr-social-card"><img src="${gbprSocialAvatar(r)}" alt=""><span><b>${safe(r.display_name||'Carnival Guest')}</b><small>@${safe(r.username||'unknown')}</small></span><div class="gbpr-social-card-actions">${actions}</div></div>`;
// Welcome gift: one-time, per-account local inventory application.
// The SQL RPC owns the claim; this receipt prevents replay on the same game save.
window.gbWelcomeApplyGift=function(accountId,mailId,grant,claimedAt){
 try{
  if(!accountId||!mailId||!grant||typeof save==='undefined'||typeof persist!=='function')return false;
  save.gbWelcomeReceipts=save.gbWelcomeReceipts||{};
  const receipt=accountId+':'+mailId;
  if(save.gbWelcomeReceipts[receipt])return true;
  if(!save.preSpecials)save.preSpecials={RV:0,CB:0,FW:0};
  for(const item of ['RV','CB','FW']){
    const amount=Number(grant[item]||0);
    if(amount!==1)return false;
  }
  for(const item of ['RV','CB','FW'])save.preSpecials[item]=Math.max(0,Number(save.preSpecials[item])||0)+1;
  // Claim timestamp comes from the trusted database RPC, so replays cannot restart the hour.
  const until=new Date(claimedAt).getTime()+3600000;
  if(Number.isFinite(until))save.gbUnlimitedLivesUntil=Math.max(Number(save.gbUnlimitedLivesUntil)||0,until);
  save.gbWelcomeReceipts[receipt]=true;
  persist();
  if(typeof lifeText==='function')lifeText();
  return true;
 }catch(e){console.warn('Welcome reward apply:',e);return false}
};
// Keep normal gameplay life rules unchanged except during the one-hour welcome benefit.
if(typeof consumeFailedLife==='function' && typeof canAttempt==='function' && typeof lifeText==='function'){
 const gbOriginalConsumeFailedLife=consumeFailedLife,gbOriginalCanAttempt=canAttempt,gbOriginalLifeText=lifeText;
 const gbHasUnlimitedLives=()=>typeof save!=='undefined' && Number(save.gbUnlimitedLivesUntil||0)>Date.now();
 consumeFailedLife=function(){if(gbHasUnlimitedLives()){gbOriginalLifeText();return;}return gbOriginalConsumeFailedLife();};
 canAttempt=function(){if(gbHasUnlimitedLives())return true;return gbOriginalCanAttempt();};
 lifeText=function(){gbOriginalLifeText();if(gbHasUnlimitedLives()){
    const el=document.getElementById('lives');if(el){el.textContent='∞';el.title='Unlimited lives until '+new Date(save.gbUnlimitedLivesUntil).toLocaleTimeString();}
    const countdown=document.getElementById('lifeCountdown');if(countdown){const secs=Math.max(0,Math.ceil((save.gbUnlimitedLivesUntil-Date.now())/1000));countdown.textContent=Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');countdown.style.display='block';}
  }};
}
let gbprMailItems=[];
function gbprMailPendingCheck(m){return (m.category==='event_reward'&&!m.claimed_at)||!m.read_at;}
async function gbprRefreshMailDot(){
 const button=prHub?.querySelector('[data-gbpr-nav="mail"]');
 if(!sb||!user){gbprMailPending=false;button?.classList.remove('gbpr-mail-pending');gbprUpdatePfpNotice();return;}
 const {data,error}=await sb.from('gb_inbox').select('id,category,claimed_at,read_at').eq('recipient',user.id).limit(100);
 if(error)return;
 gbprMailPending=!!data?.some(gbprMailPendingCheck);
 button?.classList.toggle('gbpr-mail-pending',gbprMailPending);
 gbprUpdatePfpNotice();
}
async function gbprLoadMail(){
 const host=$p('gbpr-mail-list');if(!host)return;
 if(!user){host.innerHTML=gbprSocialMessage('Sign in to see official mail.');return}
 if(!sb){host.innerHTML=gbprSocialMessage('Connecting…');return}
 host.textContent='Loading mail…';
 const {data,error}=await sb.from('gb_inbox').select('id,title,body,category,created_at,claimed_at,read_at,source_event,reward').eq('recipient',user.id).order('created_at',{ascending:false}).limit(60);
 if(!host.isConnected)return;
 if(error){host.innerHTML=gbprSocialMessage('Mailbox unavailable: '+error.message);return}
 gbprMailItems=data||[];
 gbprRefreshMailDot();
 gbprDrawMailList();
}
function gbprDrawMailList(){
 const host=$p('gbpr-mail-list');if(!host)return;
 if(!gbprMailItems.length){host.innerHTML=gbprSocialMessage('No mail yet.');return}
 host.innerHTML=gbprMailItems.map(m=>`<button type="button" class="gbpr-inbox-row ${gbprMailPendingCheck(m)?'gbpr-inbox-unread':''}" data-mail-open="${m.id}"><span class="gbpr-inbox-envelope">✉</span><span class="gbpr-inbox-title"><b>${safe(m.title)}</b><small>${m.source_event==='welcome_gift'?'A letter from Mr. Walker':'Official Carnival Mail'}</small></span><span class="gbpr-inbox-status">${m.category==='event_reward'&&!m.claimed_at?'<i class="gbpr-mail-dot"></i>':!m.read_at?'<i class="gbpr-mail-dot"></i>':'›'}</span></button>`).join('');
 host.querySelectorAll('[data-mail-open]').forEach(b=>b.onclick=()=>gbprOpenMail(b.dataset.mailOpen));
}
async function gbprOpenMail(id){
 const m=gbprMailItems.find(x=>x.id===id);if(!m)return;
 const host=$p('gbpr-mail-list');
 if(!m.read_at){
  const {error}=await sb.rpc('gb_mail_mark_read',{p_mail:m.id});
  if(!error)m.read_at=new Date().toISOString();
  void gbprRefreshMailDot();
 }
 const welcome=m.source_event==='welcome_gift';
 const testCoins=m.source_event==='reward_claim_test' && m.reward?.coins===100;
 host.innerHTML=`<div class="gbpr-open-letter ${welcome?'gbpr-welcome-mail':''}"><button type="button" class="gbpr-btn secondary gbpr-letter-back" id="gbpr-mail-back">‹ INBOX</button><div class="gbpr-tag">${welcome?'✦ AN OFFICIAL INVITATION ✦':'OFFICIAL MAIL'}</div><h3>${safe(m.title)}</h3><small>${new Date(m.created_at).toLocaleDateString()}</small><p>${safe(m.body)}</p>${welcome?`<div class="gbpr-welcome-gifts"><div><span>♥</span><b>UNLIMITED LIVES</b><small>1 HOUR</small></div><div><img src="assets/rocket-h.png" alt="Rocket"><b>ROCKET</b><small>×1</small></div><div><img src="assets/clownbomb.png" alt="Clownbomb"><b>CLOWNBOMB</b><small>×1</small></div><div><img src="assets/ferris.png" alt="Ferris Wheel"><b>FERRIS WHEEL</b><small>×1</small></div></div><button type="button" class="gbpr-btn gbpr-welcome-claim" id="gbpr-letter-claim" ${m.claimed_at?'disabled':''}>${m.claimed_at?'CLAIMED':'✦ CLAIM MY GIFTS ✦'}</button>`:testCoins?`<div class="gbpr-test-prize"><img src="assets/coin-skull-new.png" alt="Skull Coins"><strong>100 SKULL COINS</strong></div><button type="button" class="gbpr-btn gbpr-test-claim" id="gbpr-test-claim" ${m.claimed_at?'disabled':''}>${m.claimed_at?'CLAIMED':'✦ CLAIM 100 COINS ✦'}</button><p class="gbpr-muted" id="gbpr-test-status">Test reward · credited to Supabase inventory</p>`:m.category==='event_reward'?'<em>Other event rewards are not claimable yet.</em>':''}</div>`;
 host.querySelector('#gbpr-mail-back').onclick=gbprDrawMailList;
 const testClaim=host.querySelector('#gbpr-test-claim');
 if(testClaim)testClaim.onclick=async()=>{
  testClaim.disabled=true;testClaim.textContent='CLAIMING…';
  const status=host.querySelector('#gbpr-test-status');
  try{
   const {data,error}=await sb.rpc('gb_claim_test_100_coins',{p_mail:m.id});
   if(error)throw error;
   const result=Array.isArray(data)?data[0]:null;
   if(!result)throw Error('No claim confirmation returned');
   m.claimed_at=new Date().toISOString();
   testClaim.textContent='CLAIMED';
   status.textContent='Server credit confirmed. Supabase Skull Coins: '+Number(result.new_coin_balance).toLocaleString()+'. Game HUD sync is not yet verified.';
   void gbprRefreshMailDot();
  }catch(err){testClaim.disabled=false;testClaim.textContent='✦ CLAIM 100 COINS ✦';status.textContent='Claim not confirmed: '+(err.message||'Unknown error');}
 };

 const claim=host.querySelector('#gbpr-letter-claim');if(claim)claim.onclick=async()=>{
  claim.disabled=true;claim.textContent='CLAIMING…';
  try{
   const {data:rows,error}=await sb.rpc('gb_welcome_claim',{p_mail:m.id});if(error)throw error;
   const gift=rows?.[0];if(!gift)throw Error('No gift returned');
   if(typeof window.gbWelcomeApplyGift!=='function')throw Error('Game reward hook not loaded.');
   if(!window.gbWelcomeApplyGift(user.id,gift.mail_id,gift.reward_data,gift.claimed_at))throw Error('Could not apply gift to game save');
   m.claimed_at=gift.claimed_at||new Date().toISOString();claim.textContent='CLAIMED';
   void gbprRefreshMailDot();
  }catch(e){claim.disabled=false;claim.textContent='✦ CLAIM MY GIFTS ✦';alert(e.message||'Claim failed')}
 };
}
async function gbprLoadFriends(){
 const host=$p('gbpr-friend-list');if(!host||!gbprRegistered()||!profile?.username||!sb)return;
 host.textContent='Loading friends…';
 const {data,error}=await sb.rpc('gb_friend_list');if(!host.isConnected)return;
 if(error){host.innerHTML=gbprSocialMessage('Friends unavailable. Complete the social SQL setup first.');return}
 if(!data?.length){host.innerHTML=gbprSocialMessage('No friends or pending requests yet.');return}
 host.innerHTML=data.map(r=>gbprFriendCard(r,r.kind==='incoming'?`<button data-gbpr-action="accept" data-id="${r.link_id}">ACCEPT</button><button data-gbpr-action="decline" data-id="${r.link_id}">DECLINE</button>`:r.kind==='outgoing'?`<button data-gbpr-action="remove" data-id="${r.link_id}">CANCEL</button>`:`<button data-gbpr-action="remove" data-id="${r.link_id}">REMOVE</button>`)).join('');
 host.querySelectorAll('[data-gbpr-action]').forEach(b=>b.onclick=async()=>{b.disabled=true;const {error}=await sb.rpc('gb_friend_action',{p_link:b.dataset.id,p_action:b.dataset.gbprAction});if(error)alert(error.message);await gbprLoadFriends();await gbprRefreshRequestDot()});
}
prMailScreen.querySelector('#gbpr-mail-refresh').onclick=gbprLoadMail;
prFriendsScreen.querySelector('#gbpr-friends-refresh').onclick=gbprLoadFriends;
prFriendsScreen.querySelector('#gbpr-friend-search').onsubmit=async e=>{
 e.preventDefault();const host=$p('gbpr-friend-results');if(!sb||!gbprRegistered()||!profile?.username)return;
 const q=e.currentTarget.querySelector('input').value.trim().replace(/^@/,'');if(q.length<3){host.innerHTML=gbprSocialMessage('Enter at least three characters.');return}
 host.textContent='Searching…';
 const {data,error}=await sb.rpc('gb_friend_search',{p_query:q});if(error){host.innerHTML=gbprSocialMessage(error.message);return}
 if(!data?.length){host.innerHTML=gbprSocialMessage('No matching players.');return}
 host.innerHTML=data.map(r=>gbprFriendCard(r,`<button data-gbpr-add="${r.id}">ADD</button>`)).join('');
 host.querySelectorAll('[data-gbpr-add]').forEach(b=>b.onclick=async()=>{b.disabled=true;const {data,error}=await sb.rpc('gb_friend_request',{p_target:b.dataset.gbprAdd});if(error){alert(error.message);b.disabled=false}else{b.textContent='SENT';await gbprLoadFriends()}});
};
// Private cloud backups are NOT verified match results or official leaderboard data.
// Every account gets a separate device binding to prevent silent cross-account writes.
const cloudSaveKey='gb-cloud-backup-enabled-v2';
const cloudBindingKey='gb-cloud-device-account-v2';
const cloudSyncCursorKey='gb-cloud-sync-cursor-v3:';
let cloudRetryTimer=null,cloudRetryDelay=4000;
// Stable, order-independent snapshots: JSON property ordering must not masquerade as a conflict.
function stableValue(v){
  if(Array.isArray(v))return v.map(stableValue);
  if(v && typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stableValue(v[k])]));
  return v;
}
const saveFingerprint=(obj)=>JSON.stringify(stableValue(obj));
function localDominatesCloud(local,cloud){
  // Only used for the SAME ACCOUNT already authorized to auto-backup on this device.
  // Don't overwrite progress earned on a second device, or a new, unrelated save.
  if(Number(local.current||1)<Number(cloud.current||1))return false;
  const lb=local.best||{},cb=cloud.best||{};
  return Object.keys(cb).every(k=>Number(lb[k]||0)>=Number(cb[k]||0));
}
function cloudCursor(uid){try{return JSON.parse(localStorage.getItem(cloudSyncCursorKey+uid)||'null')}catch{return null}}
function rememberCloudBaseline(uid,snapshot,revision){
  try{localStorage.setItem(cloudSyncCursorKey+uid,JSON.stringify({fingerprint:saveFingerprint(snapshot),revision:Number(revision)}))}catch(e){}
}
function scheduleRetry(){
  if(!canAutoBackup()||!navigator.onLine)return;
  clearTimeout(cloudRetryTimer);
  cloudRetryTimer=setTimeout(()=>{if(canAutoBackup())cloudUpload()},cloudRetryDelay);
  cloudRetryDelay=Math.min(60000,Math.ceil(cloudRetryDelay*1.8));
}

let cloudBusy=false,cloudQueued=false,cloudTimer=null,cloudChecking=false;
let cloudCandidate=null,cloudAuthorized=false,cloudKnownRevision=null,cloudActiveAccount=null;
let cloudCheckedFingerprint=null;
const cloudPanel=()=>document.getElementById('gbpr-cloud-choices');
function cloudStatus(msg,good=false){setMessage('gbpr-cloud-status',msg,good)}
function readLocalGameSave(){
  const raw=localStorage.getItem('gb-playable-v4');
  if(!raw)return {current:1,best:{},coins:0,lives:5,lifeTick:Date.now(),preSpecialsGranted:false,preSpecials:{RV:0,CB:0,FW:0},boosterInventory:{hammer:0,watch:0,cards:0,musicbox:0},boosterGrants:{}};
  const obj=JSON.parse(raw);
  if(!obj||typeof obj!=='object'||Array.isArray(obj)||!Number.isInteger(Number(obj.current))||Number(obj.current)<1)throw Error('Invalid local save');
  if(raw.length>200000)throw Error('Local save is too large for cloud backup');
  return obj;
}
function validSnapshot(obj){
  if(!obj||typeof obj!=='object'||Array.isArray(obj)||!Number.isInteger(Number(obj.current))||Number(obj.current)<1)throw Error('Cloud snapshot has an invalid level');
  if(typeof obj.best!=='object'||obj.best===null||Array.isArray(obj.best))throw Error('Cloud snapshot has invalid star records');
  if(JSON.stringify(obj).length>200000)throw Error('Cloud snapshot exceeds the safe size');
  return obj;
}
function saveSummary(obj){
  const stars=Object.values(obj.best||{}).reduce((n,v)=>n+Math.max(0,Math.min(3,Number(v)||0)),0);
  return 'Level '+(Number(obj.current)||1)+' · '+stars+' total best-stars · '+(Number(obj.coins)||0)+' Skull Coins';
}
function downloadBackup(obj,label){
  const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
  const u=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=u;a.download='goreburst-'+label+'-'+new Date().toISOString().slice(0,10)+'.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(u),3000);
}
$p('gbpr-download-backup').onclick=()=>{
  try{downloadBackup(readLocalGameSave(),'local-save');cloudStatus('Local save downloaded. Keep the file somewhere safe.',true)}catch(e){cloudStatus(e.message)}
};
function cloudReset(){
  cloudAuthorized=false;cloudActiveAccount=null;cloudCandidate=null;cloudKnownRevision=null;
  cloudCheckedFingerprint=null;cloudQueued=false;clearTimeout(cloudTimer);clearTimeout(cloudRetryTimer);
  cloudPanel().classList.add('gbpr-hide');
  $p('gbpr-cloud-enable').textContent='CHECK CLOUD SAVE';
}
function cloudEnableForAccount(){
  if(!user)return;
  localStorage.setItem(cloudSaveKey+':'+user.id,'true');
  localStorage.setItem(cloudBindingKey,user.id);
  cloudActiveAccount=user.id;cloudAuthorized=true;
  $p('gbpr-cloud-enable').textContent='CHECK CLOUD SAVE';
  cloudPanel().classList.add('gbpr-hide');
}
function canAutoBackup(){
  return !!sb&&!!user&&cloudAuthorized&&cloudActiveAccount===user.id&&
    localStorage.getItem(cloudSaveKey+':'+user.id)==='true'&&
    localStorage.getItem(cloudBindingKey)===user.id;
}
async function fetchCloudRecord(id){
  const {data,error}=await sb.from('player_cloud_backups').select('snapshot,save_revision,updated_at').eq('player_id',id).maybeSingle();
  if(error)throw error;
  return data;
}
async function checkCloudSave(initiated=false){
  if(cloudChecking||!sb||!gbprRegistered())return;
  cloudChecking=true;const uid=user.id;cloudPanel().classList.add('gbpr-hide');
  if(initiated)cloudStatus('Comparing this device with Supabase…');
  try{
    const local=readLocalGameSave(), cloud=await fetchCloudRecord(uid);
    if(!user||user.id!==uid)return;
    if(cloud)validSnapshot(cloud.snapshot);
    cloudCandidate=cloud;
    cloudKnownRevision=cloud?Number(cloud.save_revision):null;
    cloudCheckedFingerprint=saveFingerprint(local);
    const bound=localStorage.getItem(cloudBindingKey);
    if(bound && bound!==uid){
      cloudReset();cloudCandidate=cloud;cloudKnownRevision=cloud?Number(cloud.save_revision):null;
      showCloudChoices(local,cloud,'This browser was last connected to a different account. Choose how to handle its save.');
      return;
    }
    if(cloud && saveFingerprint(cloud.snapshot)!==saveFingerprint(local)){
      const cursor=cloudCursor(uid);
      // A saved synchronization cursor proves which cloud version this device last
      // accepted. Only upload changes when the cloud still matches THAT baseline.
      if(cursor && cursor.fingerprint===saveFingerprint(cloud.snapshot) &&
          Number(cursor.revision)===Number(cloud.save_revision) && bound===uid &&
          localStorage.getItem(cloudSaveKey+':'+uid)==='true'){
        cloudEnableForAccount();
        cloudStatus('New device progress detected. Automatically syncing to Supabase…',true);
        queueCloudUpload();
        return;
      }
      // Migration of earlier versions: they never stored a dependable sync cursor.
      // For a previously bound and enabled account on this browser, advance from
      // the existing cloud revision when local progress is a superset of cloud stars.
      // Revisions are still checked atomically at upload time.
      if(bound===uid && localStorage.getItem(cloudSaveKey+':'+uid)==='true' &&
         (!cursor || Number(cursor.revision)===Number(cloud.save_revision)) &&
         localDominatesCloud(local,cloud.snapshot)){
        cloudKnownRevision=Number(cloud.save_revision);
        rememberCloudBaseline(uid,cloud.snapshot,cloudKnownRevision);
        cloudEnableForAccount();
        cloudStatus('Existing device recognised. Uploading newer progress automatically…',true);
        queueCloudUpload();
        return;
      }
      cloudAuthorized=false;
      showCloudChoices(local,cloud,'A different cloud save exists. Review both saves before changing devices.');
      return;
    }
    if(!cloud){
      cloudAuthorized=false;
      const fresh=Number(local.current)<=1&&Object.keys(local.best||{}).length===0&&Number(local.coins||0)===0;
      if(!fresh){
        showCloudChoices(local,null,'No cloud backup exists for this account. Review your existing device progress before uploading it for the first time.');
        return;
      }
      cloudEnableForAccount();
      cloudStatus('New player: cloud backups enabled automatically.',true);
      queueCloudUpload();
      return;
    }
    rememberCloudBaseline(uid,local,cloud.save_revision);
    cloudEnableForAccount();
    cloudStatus('Cloud backup matched this device. New stars now sync automatically.',true);
  }catch(e){cloudAuthorized=false;cloudStatus('Cloud comparison failed. Local save remains safe: '+(e.message||'Unknown error'))}
  finally{cloudChecking=false;if(canAutoBackup())queueCloudUpload()}
}
function showCloudChoices(local,cloud,reason){
  cloudPanel().classList.remove('gbpr-hide');
  $p('gbpr-cloud-restore').disabled=!cloud;
  $p('gbpr-cloud-restore').style.display=cloud?'':'none';
  $p('gbpr-cloud-use-local').textContent=cloud?'REPLACE CLOUD WITH THIS DEVICE':'BACK UP THIS DEVICE';
  $p('gbpr-cloud-comparison').textContent=reason+'\n\nON THIS DEVICE: '+saveSummary(local)+
    '\nIN CLOUD: '+(cloud?saveSummary(cloud.snapshot)+' (saved '+new Date(cloud.updated_at).toLocaleString()+')':'No backup yet');
  cloudStatus('Review both saves and choose what to do. No files have been changed.');
}
$p('gbpr-cloud-enable').onclick=()=>checkCloudSave(true);
$p('gbpr-cloud-restore').onclick=async()=>{
  if(!sb||!user||!cloudCandidate)return;
  const uid=user.id;
  try{
    const current=readLocalGameSave(),candidate=validSnapshot(cloudCandidate.snapshot);
    if(!confirm('Restore the cloud save ('+saveSummary(candidate)+') onto THIS device? Your current device save will be downloaded and retained as a local safety copy. The game will reload.'))return;
    // Check that cloud hasn't been changed by another device since comparison.
    const latest=await fetchCloudRecord(uid);
    if(!user||user.id!==uid)throw Error('Account changed. Please retry.');
    if(!latest||Number(latest.save_revision)!==Number(cloudCandidate.save_revision))throw Error('Cloud backup changed since review. Check Cloud Save again.');
    downloadBackup(current,'before-restore');
    const safeKey='gb-cloud-pre-restore:'+uid+':'+Date.now();
    localStorage.setItem(safeKey,JSON.stringify(current));
    // Do not overwrite other profile preferences, cached account, or unrelated browser data.
    localStorage.setItem('gb-playable-v4',JSON.stringify(candidate));
    rememberCloudBaseline(uid,candidate,latest.save_revision);cloudEnableForAccount();cloudStatus('Restored! Reloading the game…',true);
    location.reload();
  }catch(e){cloudStatus('Restore stopped safely: '+(e.message||'Unknown error'))}
};
$p('gbpr-cloud-use-local').onclick=async()=>{
  if(!user||!sb)return;
  try{
    const local=readLocalGameSave();const uid=user.id;
    if(!confirm("Use this device's save ("+saveSummary(local)+") as the cloud backup? "+(cloudCandidate?'This REPLACES the existing cloud copy after another check.':'This creates the first cloud backup.')+' It does not add verified leaderboard stars.'))return;
    const latest=await fetchCloudRecord(uid);
    if(!user||user.id!==uid)throw Error('Account changed. Check again.');
    if(Number(latest?.save_revision??0)!==Number(cloudKnownRevision??0))throw Error('Cloud save changed since review. Check again before uploading.');
    // Do not authorize background writes before explicit first upload succeeds.
    cloudActiveAccount=uid;cloudAuthorized=true;
    cloudKnownRevision=latest?Number(latest.save_revision):null;
    await cloudUpload(true);
    if(!canAutoBackup()){ // upload method enables only on confirmed success below
      cloudStatus('Upload was not confirmed. No automatic backup enabled.');
    }
  }catch(e){cloudAuthorized=false;cloudStatus('Upload cancelled safely: '+(e.message||'Unknown error'))}
};
async function cloudUpload(force=false){
  if(cloudBusy){cloudQueued=true;return false}
  if(!sb||!user||(!force&&!canAutoBackup()))return false;
  cloudBusy=true;const uid=user.id;
  try{
    const snapshot=readLocalGameSave();
    cloudStatus('Saving progress to Supabase…');
    const existing=await fetchCloudRecord(uid);
    if(!user||user.id!==uid)throw Error('Account changed during upload');
    // Never silently overwrite unseen cloud revisions (e.g. another device updated it).
    if(Number(existing?.save_revision??0)!==Number(cloudKnownRevision??0)){
      cloudAuthorized=false;cloudPanel().classList.add('gbpr-hide');
      cloudStatus('Cloud changed on another device. Auto-backup paused; tap CHECK CLOUD SAVE to resolve.');
      return false;
    }
    const revision=Number(existing?.save_revision??0)+1;
    if(existing){
      // Atomic compare-and-swap: a second device cannot overwrite a newer revision.
      const {data,error}=await sb.from('player_cloud_backups')
        .update({snapshot,save_revision:revision,updated_at:new Date().toISOString()})
        .eq('player_id',uid).eq('save_revision',Number(existing.save_revision))
        .select('save_revision');
      if(error)throw error;
      if(!data||data.length!==1){
        cloudAuthorized=false;
        cloudStatus('Another device changed the cloud save. Check Cloud Save to resolve safely.');
        return false;
      }
    }else{
      // INSERT never replaces an existing cloud record.
      const {error}=await sb.from('player_cloud_backups')
        .insert({player_id:uid,snapshot,save_revision:revision,updated_at:new Date().toISOString()});
      if(error)throw error;
    }
    if(!user||user.id!==uid)throw Error('Account changed during upload');
    cloudKnownRevision=revision;
    rememberCloudBaseline(uid,snapshot,revision);
    try{localStorage.setItem('gb-cloud-last-success:'+uid,new Date().toISOString())}catch(e){}
    cloudRetryDelay=4000;clearTimeout(cloudRetryTimer);
    cloudEnableForAccount();
    cloudStatus('Cloud saved automatically · '+new Date().toLocaleTimeString()+' · revision '+revision,true);
    // If a game action happened while the request was in flight, upload it too.
    if(saveFingerprint(readLocalGameSave())!==saveFingerprint(snapshot))cloudQueued=true;
    return true;
  }catch(e){
    // Network problems are transient: keep auto-sync authorized and retry safely.
    // Actual revision conflicts are handled above, never force-overwritten.
    cloudStatus('Cloud upload delayed; your local stars are safe. Retrying automatically: '+(e.message||'Network error'));
    scheduleRetry();return false;
  }
  finally{cloudBusy=false;if(cloudQueued){cloudQueued=false;queueCloudUpload()}}
}
function queueCloudUpload(){
  if(!canAutoBackup())return;
  try{
    if(cloudCursor(user.id)?.fingerprint===saveFingerprint(readLocalGameSave()))return;
  }catch(e){}
  clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>cloudUpload(),1800);
}
window.addEventListener('gb-local-save-changed',queueCloudUpload);
window.addEventListener('online',()=>{if(canAutoBackup())queueCloudUpload();else if(user)checkCloudSave(false)});
window.addEventListener('pageshow',()=>{if(canAutoBackup())queueCloudUpload()});
// Catch changes not dispatched by legacy code and retry interrupted uploads.
setInterval(()=>{if(canAutoBackup()&&!cloudBusy&&!cloudChecking&&navigator.onLine)queueCloudUpload()},20000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&canAutoBackup())queueCloudUpload()});
window.gbCloudReady=()=>{
  if(!gbprRegistered())return;
  if(cloudActiveAccount!==user.id){cloudReset();cloudActiveAccount=user.id;}
  checkCloudSave(false);
};
refresh();connect();


// Ghost Parade: authenticated read-only database queries.
// Ghost Parade beta uses best stars synced from private backups; not anti-cheat verified.
// Guest Ghost Parade beta scores: server tracks each level's best stars once.
// Kept separate from cloud saves and prizes; browser-supplied stars are not anti-cheat verified.
let gbGuestStarsUploading=false,gbGuestStarsQueued=false;
async function gbUploadGuestStars(){
 if(!sb||!user||!gbprIsGuest()||gbGuestStarsUploading)return;
 gbGuestStarsUploading=true;
 try{
  const best=readLocalGameSave().best||{};
  const batch=Object.entries(best).filter(([k,v])=>/^\d+$/.test(String(k))&&Number(k)>0&&Number(k)<=100000&&Number.isInteger(Number(v))&&Number(v)>=1&&Number(v)<=3).map(([level,stars])=>({level:Number(level),stars:Number(stars)}));
  if(batch.length){const {error}=await sb.rpc('gb_guest_stars_submit',{p_entries:batch});if(error)console.warn('Ghost Parade guest stars:',error.message)}
 }catch(e){console.warn('Guest stars sync:',e?.message||e)}
 finally{gbGuestStarsUploading=false}
}
window.addEventListener('gb-local-save-changed',()=>{if(gbprIsGuest()&&!gbGuestStarsQueued){gbGuestStarsQueued=true;setTimeout(()=>{gbGuestStarsQueued=false;void gbUploadGuestStars()},1400)}});
window.addEventListener('pageshow',()=>{if(gbprIsGuest())void gbUploadGuestStars()});
setInterval(()=>{if(gbprIsGuest()&&navigator.onLine)void gbUploadGuestStars()},30000);
window.gbGhostParadeFetch=async function(){
  if(!sb)return {error:'Supabase has not finished initializing. Try again.'};
  const {data:{session},error:authError}=await sb.auth.getSession();
  if(authError||!session)return {error:'Online player identity is starting. Try Refresh.'};
  if(gbprIsGuest())await gbUploadGuestStars();
  const [registered,guests]=await Promise.all([sb.rpc('ghost_parade_top10'),sb.rpc('gb_guest_stars_top10')]);
  if(registered.error)return {error:'Leaderboard query failed: '+registered.error.message};
  if(guests.error)return {error:'Guest leaderboard setup required: '+guests.error.message};
  const combined=new Map();
  for(const r of [...(registered.data||[]),...(guests.data||[])]){
    const id=String(r.user_id||r.player_id||r.id||('guest-'+r.display_name));
    const prev=combined.get(id);
    if(!prev||Number(r.total_stars||0)>Number(prev.total_stars||0))combined.set(id,r);
  }
  const sorted=[...combined.values()].sort((a,b)=>Number(b.total_stars||0)-Number(a.total_stars||0)).slice(0,10).map((r,i)=>({...r,rank_position:i+1}));
  return {rows:sorted,backup:null};
};

window.gbGhostAvatarUrl=function(record){
  if(record?.avatar_path){
    const safePath=String(record.avatar_path).split('/').map(encodeURIComponent).join('/');
    return SUPABASE_URL+'/storage/v1/object/public/avatars/'+safePath;
  }
  return avatarFile(avatarIndex(record?.avatar_key));
};

// RESTORED: online Carnival Clash + Weekly Nightmare integrations lost during profile hub update.
// Carnival Clash beta: browser-submitted scores are NOT server-verified; do not award prizes from them.
window.gbClashLeaderboardFetch=async function(){
  if(!sb)return {error:'Supabase connection is starting. Try Refresh Rankings.'};
  const {data,error}=await sb.rpc('carnival_clash_top10');
  return error?{error:'Carnival Clash database setup required: '+error.message}:{rows:data||[]};
};
window.gbClashSubmit=async function(game,points){
  if(!sb||!user)return; // offline local mode
  const kind=String(game);const pts=Number(points);
  if(!(kind==='tetris'&&[10,20,30,40].includes(pts)||{sudoku_easy:50,sudoku_medium:100,sudoku_hard:150}[kind]===pts))return;
  const {error}=await sb.rpc('carnival_clash_submit_beta',{p_game:kind,p_points:pts,p_event_id:crypto.randomUUID()});
  if(error)console.warn('Carnival Clash beta submission:',error.message);
};

// Weekly Nightmare beta reporting: only stage totals; prizes must await trusted validation.
window.gbWeeklySubmit=async function(stages){if(!sb||!user)return {error:'Online player identity unavailable'};const {error}=await sb.rpc('weekly_nightmare_submit_beta',{p_stages:Number(stages)});if(error)throw error;return {ok:true}};
window.gbWeeklyTop10=async function(){if(!sb)return {rows:[],error:'Offline'};const {data,error}=await sb.rpc('weekly_nightmare_top10');return {rows:data||[],error:error?.message||null}};

