
/* Gore Burst profile and optional private cloud-backup client.
   Snapshot backups are UNVERIFIED and never used for official rewards/leaderboards. */
const SUPABASE_URL='https://harqhhpobaepfkfeitmw.supabase.co';
const SUPABASE_KEY='sb_publishable_K9F36jgWZaMWywln6Wwaiw_4zJ7523C';
const AVATARS=['Mr Walker','Fortune Teller','Sad Clown Girl','Clown Boy','Haunted Doll','Strongman','The Magician','Balloon Seller','Masked Mime','Candy Booth Girl','Ferris Wheel Operator','Ticket Master','Acrobat','Ringmaster Assistant','Ghostly Guest'];
const KEYS=['Mr_Walker','Fortune_Teller','Sad_Clown_Girl','Clown_Boy','Haunted_Doll','Strongman','The_Magician','Balloon_Seller','Masked_Mime','Candy_Booth_Girl','Ferris_Wheel_Operator','Ticket_Master','Acrobat','Ringmaster_Assistant','Ghostly_Guest'];
const fallbackAvatar='assets/avatars/01_Mr_Walker.png';
const $p=id=>document.getElementById(id);
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
<div class="gbpr-panel"><div class="gbpr-tag">SAVE STATUS</div><p class="gbpr-muted gbpr-note">Your level, coins, boosters and stars are still saved in this browser. Your existing progress stays on this device. Private cloud backup is opt-in and cannot overwrite local progress automatically.</p></div>
<div class="gbpr-panel"><div class="gbpr-tag">PRIVATE CLOUD BACKUP</div>
<p class="gbpr-muted">Keep an extra copy of your existing gameplay progress in your own Supabase account. This does not register official leaderboard stars or grant coins.</p>
<div class="gbpr-actions"><button type="button" class="gbpr-btn secondary" id="gbpr-download-backup">DOWNLOAD SAVE FILE</button><button type="button" class="gbpr-btn" id="gbpr-cloud-enable">ENABLE CLOUD BACKUP</button></div>
<p class="gbpr-error" id="gbpr-cloud-status" aria-live="polite">Cloud backup is off. Your browser save is unchanged.</p></div>
</div>`;
document.getElementById('app').append(layer);
let sb=null,user=null,profile=null,signup=false,working=false,avatarPreview=null;
const avatarFile=i=>'assets/avatars/'+String(i+1).padStart(2,'0')+'_'+KEYS[i]+'.png';
const avatarKey=i=>String(i+1).padStart(2,'0')+'_'+KEYS[i];
const avatarIndex=key=>Math.max(0,KEYS.findIndex((x,i)=>avatarKey(i)===key));
const safe=(s)=>String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const localLevel=()=>{try{const data=JSON.parse(localStorage.getItem('gb-playable-v4')||'{}');return Math.max(1,Number(data.current)||1)}catch{return 1}};
function setMessage(id,txt,success=false){const el=$p(id);el.textContent=txt;el.classList.toggle('gbpr-success',success)}
function avatarUrl(){if(avatarPreview!==null)return avatarFile(avatarPreview);if(!user){const ix=Number(localStorage.getItem('gb-guest-avatar'));if(Number.isInteger(ix)&&ix>=0&&ix<15)return avatarFile(ix)}if(profile?.avatar_path){return SUPABASE_URL+'/storage/v1/object/public/avatars/'+profile.avatar_path.split('/').map(encodeURIComponent).join('/')}return avatarFile(avatarIndex(profile?.avatar_key))}
function syncMenuAvatar(){const el=document.getElementById('gbMenuAvatar');if(el){el.src=avatarUrl();el.onerror=()=>{el.onerror=null;el.src=fallbackAvatar}}}
function refresh(){syncMenuAvatar();const signed=!!user;$p('gbpr-auth-panel').classList.toggle('gbpr-hide',signed);$p('gbpr-account-panel').classList.toggle('gbpr-hide',!signed);$p('gbpr-display').textContent=profile?.display_name||'Carnival Guest';$p('gbpr-handle').textContent=profile?.username?'@'+profile.username:(signed?'Choose a unique username':'Guest player');$p('gbpr-level').textContent='LEVEL '+localLevel()+' · Local progress';$p('gbpr-current-avatar').src=avatarUrl();$p('gbpr-new-name').value=profile?.display_name||'Carnival Guest';$p('gbpr-new-handle').value=profile?.username||'';$p('gbpr-avatar-help').textContent=signed?'Tap any character to save it. You can also upload your own photo.':'Sign in to save a PFP to your account. Tap to preview characters.';document.querySelectorAll('.gbpr-avatar').forEach((b,i)=>b.classList.toggle('chosen',(avatarPreview!==null?avatarPreview:avatarIndex(profile?.avatar_key))===i));}
function view(open){layer.classList.toggle('open',open);if(open){avatarPreview=null;refresh();$p('gbpr-close').focus()}}
$p('gbpr-close').onclick=()=>view(false);
document.getElementById('profile').addEventListener('click',()=>view(true));
layer.addEventListener('pointerdown',e=>e.stopPropagation());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&layer.classList.contains('open'))view(false)});
$p('gbpr-avatar-list').innerHTML=AVATARS.map((name,i)=>`<button type="button" class="gbpr-avatar" data-index="${i}"><img loading="lazy" src="${avatarFile(i)}" alt=""></button>`).join('');
async function fetchProfile(){if(!sb||!user)return;const {data,error}=await sb.from('profiles').select('id,username,display_name,avatar_key,avatar_path').eq('id',user.id).maybeSingle();if(error){setMessage('gbpr-edit-status',error.message);return}profile=data||null;refresh();window.gbCloudReady?.()}
for(const el of document.querySelectorAll('.gbpr-avatar'))el.onclick=async()=>{const i=Number(el.dataset.index);avatarPreview=i;refresh();if(!user||!sb){try{localStorage.setItem('gb-guest-avatar',String(i))}catch(e){};return;}setMessage('gbpr-upload-status','Saving avatar…');const {error}=await sb.from('profiles').update({avatar_key:avatarKey(i),avatar_path:null}).eq('id',user.id);if(error){setMessage('gbpr-upload-status',error.message);return}profile={...profile,avatar_key:avatarKey(i),avatar_path:null};avatarPreview=null;setMessage('gbpr-upload-status','Avatar saved!',true);refresh()};
function setAuthMode(isSignup){signup=isSignup;$p('gbpr-auth-submit').textContent=signup?'CREATE ACCOUNT':'SIGN IN';$p('gbpr-login-tab').classList.toggle('secondary',signup);$p('gbpr-signup-tab').classList.toggle('secondary',!signup);$p('gbpr-password').autocomplete=signup?'new-password':'current-password';setMessage('gbpr-auth-status','')}
$p('gbpr-login-tab').onclick=()=>setAuthMode(false);$p('gbpr-signup-tab').onclick=()=>setAuthMode(true);
$p('gbpr-auth-form').onsubmit=async e=>{e.preventDefault();if(!sb){setMessage('gbpr-auth-status','Connection not ready. Check internet and reload.');return}if(working)return;working=true;$p('gbpr-auth-submit').disabled=true;const email=$p('gbpr-email').value.trim(),password=$p('gbpr-password').value;setMessage('gbpr-auth-status',signup?'Creating account…':'Signing in…');try{const {data,error}=signup?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});if(error)throw error;setMessage('gbpr-auth-status',data.session?'Welcome to the freakshow!':'Account created. Check your email for a confirmation link.',true);if(data.session){user=data.user;await fetchProfile()}}catch(err){setMessage('gbpr-auth-status',err.message||'Authentication failed')}finally{working=false;$p('gbpr-auth-submit').disabled=false}};
$p('gbpr-edit-form').onsubmit=async e=>{e.preventDefault();if(!sb||!user)return;const username=$p('gbpr-new-handle').value.trim().toLowerCase();const display_name=$p('gbpr-new-name').value.trim();if(username&&!/^[a-z0-9_]{3,20}$/.test(username)){setMessage('gbpr-edit-status','Username must be 3–20 letters, numbers or underscores.');return}if(!display_name){setMessage('gbpr-edit-status','Choose a display name.');return}setMessage('gbpr-edit-status','Saving…');const {error}=await sb.from('profiles').update({username:username||null,display_name}).eq('id',user.id);if(error){setMessage('gbpr-edit-status',error.code==='23505'?'This username is already taken.':error.message);return}profile={...profile,username:username||null,display_name};setMessage('gbpr-edit-status','Profile updated!',true);refresh()};
$p('gbpr-signout').onclick=async()=>{if(!sb)return;const {error}=await sb.auth.signOut();if(error){setMessage('gbpr-edit-status',error.message);return}user=null;profile=null;avatarPreview=null;refresh()};
$p('gbpr-upload').onchange=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!user||!sb){setMessage('gbpr-upload-status','Please sign in before uploading a photo.');return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setMessage('gbpr-upload-status','Choose a JPG, PNG or WebP image.');return}if(file.size>8*1024*1024){setMessage('gbpr-upload-status','Choose an image smaller than 8 MB.');return}
 setMessage('gbpr-upload-status','Preparing photo…');try{const bmp=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing unavailable');const d=Math.min(bmp.width,bmp.height);ctx.drawImage(bmp,(bmp.width-d)/2,(bmp.height-d)/2,d,d,0,0,512,512);bmp.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.84));if(!blob)throw Error('Could not prepare photo');const path=user.id+'/profile-'+Date.now()+'.webp';setMessage('gbpr-upload-status','Uploading photo…');const upload=await sb.storage.from('avatars').upload(path,blob,{contentType:'image/webp',upsert:false});if(upload.error)throw upload.error;const updated=await sb.from('profiles').update({avatar_path:path}).eq('id',user.id);if(updated.error)throw updated.error;profile={...profile,avatar_path:path};avatarPreview=null;setMessage('gbpr-upload-status','Photo uploaded!',true);refresh()}catch(err){setMessage('gbpr-upload-status',err.message||'Upload failed')}};
async function connect(){try{const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const {data,error}=await sb.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')setMessage('gbpr-auth-status',error.message);user=data?.user||null;if(user)await fetchProfile();else refresh();sb.auth.onAuthStateChange((event,session)=>{const next=session?.user||null;if(next?.id!==user?.id){user=next;profile=null;refresh();if(user)setTimeout(fetchProfile,0)}})}catch(err){setMessage('gbpr-auth-status','Cannot connect to Supabase. Check internet access and reload.');console.warn('Gore Burst profile connection:',err)}}
// A separate, private, opt-in cloud backup. Never imported automatically.
const cloudSaveKey='gb-cloud-backup-enabled-v1';
const cloudEnabled=()=>!!user&&localStorage.getItem(cloudSaveKey+':'+user.id)==='true';
let cloudBusy=false,cloudQueued=false,cloudTimer=null;
function readLocalGameSave(){
  try{const raw=localStorage.getItem('gb-playable-v4');if(!raw)throw Error('No local game save found');
    const obj=JSON.parse(raw);
    if(!obj||typeof obj!=='object'||Array.isArray(obj)||!Number.isFinite(Number(obj.current)))throw Error('Invalid local save');
    if(raw.length>200000)throw Error('Save too large for cloud backup');return obj;
  }catch(e){throw Error('Cannot read local game progress: '+e.message)}
}
function cloudStatus(msg,good=false){setMessage('gbpr-cloud-status',msg,good)}
$p('gbpr-download-backup').onclick=()=>{
  try{const data=JSON.stringify(readLocalGameSave(),null,2);const blob=new Blob([data],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='goreburst-local-save-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
    cloudStatus('A copy of your browser save was downloaded. Keep it somewhere safe.',true);
  }catch(e){cloudStatus(e.message)}
};
async function cloudUpload(){
  if(cloudBusy){cloudQueued=true;return}
  if(!sb||!user||!cloudEnabled())return;
  cloudBusy=true;
  try{
    const snapshot=readLocalGameSave();
    const {data:existing,error:readError}=await sb.from('player_cloud_backups').select('save_revision').eq('player_id',user.id).maybeSingle();
    if(readError)throw readError;
    const revision=Number(existing?.save_revision||0)+1;
    const {error}=await sb.from('player_cloud_backups').upsert({player_id:user.id,snapshot,save_revision:revision,updated_at:new Date().toISOString()},{onConflict:'player_id'});
    if(error)throw error;
    cloudStatus('Private backup saved to Supabase. Local save is unchanged.',true);
  }catch(e){cloudStatus('Backup failed: '+(e.message||'Unknown error'))}
  finally{cloudBusy=false;if(cloudQueued){cloudQueued=false;queueCloudUpload()}}
}
function queueCloudUpload(){
  if(!cloudEnabled()||!user)return;
  clearTimeout(cloudTimer);cloudTimer=setTimeout(cloudUpload,1800);
}
$p('gbpr-cloud-enable').onclick=async()=>{
  if(!user||!sb){cloudStatus('Sign in to your account before enabling backup.');return;}
  let local;
  try{local=readLocalGameSave()}catch(e){cloudStatus(e.message);return;}
  const {data:old,error}=await sb.from('player_cloud_backups').select('snapshot,updated_at').eq('player_id',user.id).maybeSingle();
  if(error){cloudStatus('Could not inspect existing cloud backup: '+error.message);return}
  if(old){
    if(!confirm('A cloud backup already exists for this account (saved '+new Date(old.updated_at).toLocaleString()+'). Uploading this device will REPLACE that private backup. Your existing device save is not changed. Continue?'))return;
  }else if(!confirm('Back up the current device progress (Level '+Number(local.current||1)+') to your private Supabase account? This will NOT add stars to official leaderboards or change your local save.'))return;
  try{localStorage.setItem(cloudSaveKey+':'+user.id,'true')}catch(e){cloudStatus('Unable to enable local preference');return}
  cloudStatus('Uploading your device save…');await cloudUpload();
};
window.addEventListener('gb-local-save-changed',queueCloudUpload);
window.addEventListener('online',queueCloudUpload);
// Only run automatically after user opted in AND their authenticated session is loaded.
window.gbCloudReady=()=>{if(user&&cloudEnabled())queueCloudUpload()};
refresh();connect();
