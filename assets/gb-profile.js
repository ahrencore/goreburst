
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
$p('gbpr-signout').onclick=async()=>{if(!sb)return;const {error}=await sb.auth.signOut();if(error){setMessage('gbpr-edit-status',error.message);return}user=null;profile=null;avatarPreview=null;cloudReset();refresh()};
$p('gbpr-upload').onchange=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!user||!sb){setMessage('gbpr-upload-status','Please sign in before uploading a photo.');return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setMessage('gbpr-upload-status','Choose a JPG, PNG or WebP image.');return}if(file.size>8*1024*1024){setMessage('gbpr-upload-status','Choose an image smaller than 8 MB.');return}
 setMessage('gbpr-upload-status','Preparing photo…');try{const bmp=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing unavailable');const d=Math.min(bmp.width,bmp.height);ctx.drawImage(bmp,(bmp.width-d)/2,(bmp.height-d)/2,d,d,0,0,512,512);bmp.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.84));if(!blob)throw Error('Could not prepare photo');const path=user.id+'/profile-'+Date.now()+'.webp';setMessage('gbpr-upload-status','Uploading photo…');const upload=await sb.storage.from('avatars').upload(path,blob,{contentType:'image/webp',upsert:false});if(upload.error)throw upload.error;const updated=await sb.from('profiles').update({avatar_path:path}).eq('id',user.id);if(updated.error)throw updated.error;profile={...profile,avatar_path:path};avatarPreview=null;setMessage('gbpr-upload-status','Photo uploaded!',true);refresh()}catch(err){setMessage('gbpr-upload-status',err.message||'Upload failed')}};
async function connect(){try{const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const {data,error}=await sb.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')setMessage('gbpr-auth-status',error.message);user=data?.user||null;if(user)await fetchProfile();else refresh();sb.auth.onAuthStateChange((event,session)=>{const next=session?.user||null;if(next?.id!==user?.id){user=next;profile=null;refresh();if(user)setTimeout(fetchProfile,0)}})}catch(err){setMessage('gbpr-auth-status','Cannot connect to Supabase. Check internet access and reload.');console.warn('Gore Burst profile connection:',err)}}
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
  if(cloudChecking||!sb||!user)return;
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
  if(!user)return;
  if(cloudActiveAccount!==user.id){cloudReset();cloudActiveAccount=user.id;}
  checkCloudSave(false);
};
refresh();connect();


// Ghost Parade: authenticated read-only database queries.
// Ghost Parade beta uses best stars synced from private backups; not anti-cheat verified.
window.gbGhostParadeFetch=async function(){
  if(!sb)return {error:'Supabase has not finished initializing. Try again.'};
  const {data:{session},error:authError}=await sb.auth.getSession();
  if(authError||!session)return {error:'Sign into your Gore Burst account to view server rankings.'};
  const [boardResult,backupResult]=await Promise.all([
    sb.rpc('ghost_parade_top10'),
    sb.rpc('ghost_parade_my_backup_summary')
  ]);
  if(boardResult.error)return {error:'Leaderboard query failed: '+boardResult.error.message};
  if(backupResult.error)return {error:'Cloud status query failed: '+backupResult.error.message};
  return {rows:boardResult.data||[],backup:backupResult.data||null};
};

window.gbGhostAvatarUrl=function(record){
  if(record?.avatar_path){
    const safePath=String(record.avatar_path).split('/').map(encodeURIComponent).join('/');
    return SUPABASE_URL+'/storage/v1/object/public/avatars/'+safePath;
  }
  return avatarFile(avatarIndex(record?.avatar_key));
};
