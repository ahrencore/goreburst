
/* Gore Burst profile and optional private cloud-backup client.
   Snapshot backups are UNVERIFIED and never used for official rewards/leaderboards. */
const SUPABASE_URL='https://harqhhpobaepfkfeitmw.supabase.co';
const SUPABASE_KEY='sb_publishable_K9F36jgWZaMWywln6Wwaiw_4zJ7523C';
const AVATARS=['Mr Walker','Fortune Teller','Sad Clown Girl','Clown Boy','Haunted Doll','Strongman','The Magician','Balloon Seller','Masked Mime','Candy Booth Girl','Ferris Wheel Operator','Ticket Master','Acrobat','Ringmaster Assistant','Ghostly Guest'];
const KEYS=['Mr_Walker','Fortune_Teller','Sad_Clown_Girl','Clown_Boy','Haunted_Doll','Strongman','The_Magician','Balloon_Seller','Masked_Mime','Candy_Booth_Girl','Ferris_Wheel_Operator','Ticket_Master','Acrobat','Ringmaster_Assistant','Ghostly_Guest'];
const fallbackAvatar='assets/avatars/01_Mr_Walker.png';
const $p=id=>document.getElementById(id);
// Neon confirmations confined to the profile/administration features.
function gbprDialog(message,ask=false){return new Promise(resolve=>{
 const veil=document.createElement('div');veil.className='gbpr-dialog-veil';veil.setAttribute('role','presentation');
 const panel=document.createElement('div');panel.className='gbpr-dialog-box';panel.setAttribute('role','alertdialog');panel.setAttribute('aria-modal','true');
 const heading=document.createElement('h3');heading.textContent=ask?'✦ CONFIRM ACTION ✦':'✦ CARNIVAL NOTICE ✦';
 const copy=document.createElement('p');copy.textContent=String(message||'');
 const actions=document.createElement('div');actions.className='gbpr-dialog-actions';
 const finish=value=>{document.removeEventListener('keydown',esc);veil.remove();resolve(value)};
 const esc=e=>{if(e.key==='Escape'){e.preventDefault();finish(false)}};
 if(ask){const cancel=document.createElement('button');cancel.type='button';cancel.className='gbpr-btn secondary';cancel.textContent='CANCEL';cancel.onclick=()=>finish(false);actions.append(cancel)}
 const okay=document.createElement('button');okay.type='button';okay.className='gbpr-btn';okay.textContent=ask?'CONFIRM':'OK';okay.onclick=()=>finish(true);actions.append(okay);
 panel.append(heading,copy,actions);veil.append(panel);(document.getElementById('app')||document.body).append(veil);
 document.addEventListener('keydown',esc);okay.focus();
})}
const gbprConfirm=text=>gbprDialog(text,true);
const gbprAlert=text=>gbprDialog(text,false);
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
<form id="gbpr-auth-form" class="gbpr-form"><label>Email<input id="gbpr-email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"></label><label class="gbpr-signup-field gbpr-hide">Display name<input id="gbpr-signup-name" maxlength="30" placeholder="Your carnival name"></label><label class="gbpr-signup-field gbpr-hide">Username<input id="gbpr-signup-username" maxlength="20" minlength="3" placeholder="unique_username" autocapitalize="none" spellcheck="false"></label><label>Password<input id="gbpr-password" type="password" autocomplete="current-password" minlength="6" required placeholder="Your password"></label><button id="gbpr-auth-submit" class="gbpr-btn" type="submit">SIGN IN</button></form><p class="gbpr-error" id="gbpr-auth-status" aria-live="polite"></p></div>
<div id="gbpr-account-panel" class="gbpr-panel gbpr-hide"><div class="gbpr-tag">EDIT YOUR PROFILE</div>
<form id="gbpr-edit-form" class="gbpr-form"><label>Display name<input id="gbpr-new-name" maxlength="30" required placeholder="Carnival Guest"></label><label>Unique username (3–20 letters, numbers or underscores)<input id="gbpr-new-handle" maxlength="20" minlength="3" pattern="[a-zA-Z0-9_]{3,20}" placeholder="my_carnival_name"></label><button type="submit" class="gbpr-btn">SAVE PROFILE</button></form><p class="gbpr-error" id="gbpr-edit-status" aria-live="polite"></p></div>
<div class="gbpr-panel"><div class="gbpr-tag">CHOOSE A CARNIVAL AVATAR</div><div id="gbpr-avatar-list" class="gbpr-avatars"></div><p class="gbpr-muted" id="gbpr-avatar-help">Sign in to save your avatar to your online profile. You may preview the characters as a guest.</p><div class="gbpr-actions"><label class="gbpr-btn secondary" for="gbpr-upload">UPLOAD YOUR PHOTO</label><input id="gbpr-upload" type="file" accept="image/jpeg,image/png,image/webp" hidden></div><p class="gbpr-error" id="gbpr-upload-status" aria-live="polite"></p></div>
<div class="gbpr-panel" hidden aria-hidden="true" style="display:none"><div class="gbpr-tag">SAVE STATUS</div><p class="gbpr-muted gbpr-note"></p></div>
<div class="gbpr-panel" hidden aria-hidden="true" style="display:none"><div class="gbpr-tag">PRIVATE CLOUD BACKUP</div>
<p class="gbpr-muted">Signed-in progress loads automatically from Supabase. Local gameplay remains responsive while cloud saving is confirmed.</p>
<div class="gbpr-actions" style="display:none"><button type="button" class="gbpr-btn secondary" id="gbpr-download-backup">DOWNLOAD LOCAL SAVE</button><button type="button" class="gbpr-btn" id="gbpr-cloud-enable">CHECK CLOUD SAVE</button></div>
<div id="gbpr-cloud-choices" class="gbpr-hide" style="display:none;margin:12px 0;padding:12px;border:1px solid #aa609b;border-radius:12px;background:#281329">
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
prHub.innerHTML=`<div class="gbpr-hub-identity"></div><div class="gbpr-hub-stats"><div><small>LEVEL</small><strong id="gbpr-hub-level">1</strong></div><div><small>STARS</small><strong id="gbpr-hub-stars">0 ★</strong></div></div><div class="gbpr-hub-links"><button type="button" data-gbpr-nav="mail">✉ <span>MAILBOX</span></button><button type="button" data-gbpr-nav="friends">♧ <span>FRIENDS</span></button><button type="button" data-gbpr-nav="edit">✦ <span>EDIT PROFILE</span></button><button type="button" data-gbpr-nav="account">⚙ <span>ACCOUNT</span></button><button type="button" id="gb-admin-nav" data-gbpr-nav="admin" hidden style="display:none">⚿ <span>CONTROL ROOM</span></button></div>`;
prScroll.prepend(prHub);
prHub.querySelector('.gbpr-hub-identity').append(prHero);
const prScreen=(id,title)=>{const section=document.createElement('section');section.id='gbpr-screen-'+id;section.className='gbpr-screen gbpr-hide';section.innerHTML=`<div class="gbpr-subhead"><button type="button" class="gbpr-btn secondary" data-gbpr-home>‹ BACK</button><h3>${title}</h3></div>`;prScroll.append(section);return section};
const prEditScreen=prScreen('edit','EDIT PROFILE');prEditScreen.append(prEdit,prAvatar);
// Avatar and frame choices share Edit Profile. The existing upload form stays unchanged.
const prCustomizeTabs=document.createElement('div');prCustomizeTabs.className='gbpf-tabs';prCustomizeTabs.innerHTML='<button type="button" class="active" data-gbpf-tab="avatars">AVATARS</button><button type="button" data-gbpf-tab="frames">FRAMES</button>';
prEditScreen.insertBefore(prCustomizeTabs,prAvatar);
const prFramePanel=document.createElement('div');prFramePanel.className='gbpr-panel gbpr-hide';prFramePanel.id='gbpf-panel';
prFramePanel.innerHTML='<div class="gbpr-tag">PROFILE FRAMES</div><p class="gbpr-muted">Choose a frame for your profile.</p><div class="gbpf-preview"><img id="gbpf-preview-avatar" alt="Your avatar"><img id="gbpf-preview-border" alt="" hidden></div><div id="gbpf-options" class="gbpf-options"></div><p id="gbpf-status" class="gbpr-error" aria-live="polite"></p>';
prEditScreen.append(prFramePanel);
prCustomizeTabs.addEventListener('click',e=>{const b=e.target.closest('[data-gbpf-tab]');if(!b)return;const isFrames=b.dataset.gbpfTab==='frames';prAvatar.classList.toggle('gbpr-hide',isFrames);prFramePanel.classList.toggle('gbpr-hide',!isFrames);prCustomizeTabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));if(isFrames){window.gbpfRefresh?.();void window.gbGiftOwnershipRefresh?.();void window.gbPublishedFrameRefresh?.();void window.gbAlbumFrameRefresh?.()}});

const prAccountScreen=prScreen('account','ACCOUNT');prAccountScreen.append(prLogin,prSaveInfo,prCloud);
const prAccountSigned=document.createElement('div');prAccountSigned.className='gbpr-panel';prAccountSigned.innerHTML='<div class="gbpr-tag">ACCOUNT</div><p id="gbpr-simple-status" class="gbpr-muted"></p><button type="button" id="gbpr-signout" class="gbpr-btn secondary gbpr-hide">SIGN OUT</button><p id="gbpr-signout-status" class="gbpr-error" aria-live="polite"></p>';
prAccountScreen.insertBefore(prAccountSigned,prSaveInfo);
// Read-only wallet audit. This never writes or replaces the device's coin save.
const prWalletPanel=document.createElement('section');
prWalletPanel.className='gbpr-panel';prWalletPanel.hidden=true;prWalletPanel.style.display='none';
prWalletPanel.innerHTML='<div class="gbpr-tag">SUPABASE SKULL COINS</div><p id="gbpr-wallet-balance" class="gbpr-muted">Sign in to check your migrated balance.</p><button type="button" class="gbpr-btn secondary" id="gbpr-wallet-refresh">CHECK CLOUD BALANCE</button><p class="gbpr-muted">Read-only check. Your gameplay coin balance still uses the device save until the secure wallet update is installed.</p>';
prAccountScreen.insertBefore(prWalletPanel,prSaveInfo);
async function gbprCheckWallet(){
  const el=$p('gbpr-wallet-balance');
  if(!sb||!gbprRegistered()){el.textContent='Sign in to check your migrated balance.';return;}
  const uid=user.id;
  el.textContent='Checking Supabase…';
  try{
    const {data,error}=await sb.from('player_inventory').select('skull_coins').eq('player_id',uid).maybeSingle();
    if(error)throw error;
    if(!user||user.id!==uid)return;
    if(!data){el.textContent='No readable inventory record for this account.';return;}
    const amount=Number(data.skull_coins);
    if(!Number.isSafeInteger(amount)||amount<0)throw Error('Invalid wallet balance');
    el.textContent=amount.toLocaleString()+' Skull Coins in Supabase (read-only)';
  }catch(err){if(user?.id===uid)el.textContent='Unable to read cloud balance: '+(err.message||'Unknown error');}
}
$p('gbpr-wallet-refresh').addEventListener('click',()=>void gbprCheckWallet());

// Reward synchronization is scoped to completed, server-verified award receipts.
const prRewardSync=document.createElement('section');
prRewardSync.className='gbpr-panel';prRewardSync.hidden=true;prRewardSync.style.display='none';
prRewardSync.innerHTML='<div class="gbpr-tag">CLAIMED REWARDS</div><p class="gbpr-muted">Check confirmed event claims before syncing rewards to this device. Existing coins and boosters are never replaced by the server balance.</p><button type="button" class="gbpr-btn" id="gbpr-rewards-check">CHECK CLAIMED REWARDS</button><p class="gbpr-error" id="gbpr-rewards-status" aria-live="polite"></p>';
prAccountScreen.insertBefore(prRewardSync,prCloud);

const prMailScreen=prScreen('mail','MAILBOX');
prMailScreen.insertAdjacentHTML('beforeend',`<section class="gbpr-panel"><div class="gbpr-tag">CARNIVAL MAIL</div><div class="gbpr-social-actions"><button type="button" class="gbpr-btn secondary" id="gbpr-mail-refresh">REFRESH</button></div><div id="gbpr-mail-list" aria-live="polite" class="gbpr-social-list">Loading mail…</div></section>`);
const prPublicScreen=prScreen('public','CARNIVAL PLAYER');
prPublicScreen.insertAdjacentHTML('beforeend',`<section class="gbpr-panel gbpr-public-panel"><div class="gbpr-tag">✦ CARNIVAL PLAYER ✦</div><div id="gbpr-public-content" aria-live="polite">Loading player…</div><button type="button" class="gbpr-btn secondary" id="gbpr-public-back">‹ BACK TO FRIENDS</button></section>`);
const prFriendsScreen=prScreen('friends','FRIENDS');
prFriendsScreen.insertAdjacentHTML('beforeend',`<section class="gbpr-panel"><div class="gbpr-tag">FIND YOUR CARNIVAL CREW</div><p id="gbpr-friends-note" class="gbpr-muted"></p><button type="button" class="gbpr-btn" id="gbpr-friends-account">ACCOUNT</button><div id="gbpr-friends-controls" class="gbpr-hide"><form id="gbpr-friend-search" class="gbpr-social-search"><input type="search" maxlength="20" minlength="3" placeholder="Search @username" aria-label="Find player by username" required><button type="submit" class="gbpr-btn">SEARCH</button></form><div id="gbpr-friend-results" class="gbpr-social-list" aria-live="polite"></div><div class="gbpr-tag" style="margin-top:16px">YOUR FRIENDS & REQUESTS</div><div id="gbpr-friend-list" class="gbpr-social-list" aria-live="polite"></div><button type="button" class="gbpr-btn secondary" id="gbpr-friends-refresh">REFRESH</button></div></section>`);
const prAdminScreen=prScreen('admin','CARNIVAL CONTROL ROOM');
prAdminScreen.insertAdjacentHTML('beforeend',`<section class="gbpr-panel gb-admin-panel">
<div class="gbpr-tag">PRIVATE ADMINISTRATION</div><p class="gbpr-muted">Authorized staff only. Unreleased frames never enter public profile inventories.</p>
<div id="gb-admin-role" class="gbpr-muted"></div>
<h3>✉ Send a letter to all current players</h3>
<form id="gb-admin-broadcast" class="gbpr-form"><label>Title<input id="gb-admin-title" maxlength="100" required></label><label>Message<textarea id="gb-admin-body" maxlength="3000" rows="5" required></textarea></label><button class="gbpr-btn" type="submit">SEND TO ALL PLAYERS</button></form>
<h3>✦ Private frame testing lab</h3><p class="gbpr-muted">PNG/WebP, up to 5 MB. Preview privately; approval does not automatically publish to the public store.</p>
<form id="gb-admin-frame-form" class="gbpr-form"><label>Frame title<input id="gb-admin-frame-title" maxlength="80" required></label><label>Artwork<input id="gb-admin-frame-file" type="file" accept="image/png,image/webp" required></label><button class="gbpr-btn" type="submit">UPLOAD TEST FRAME</button></form>
<div class="gb-admin-publish-controls"><div class="gbpr-tag">OWNER-ONLY GIFT CODE RELEASE</div><p class="gbpr-muted">Approve a test frame, enter a new code and claim limit here, then choose PUBLISH AS GIFT CODE beside that approved frame. Publishing is irreversible without a separate revocation action.</p><label>Gift code<input id="gb-admin-publish-code" maxlength="32" placeholder="WALKERSGIFT2026" autocomplete="off"></label><label>Maximum redemptions<input id="gb-admin-publish-limit" type="number" min="1" max="100000" value="500"></label></div><div id="gb-admin-test-frames" class="gb-admin-items"></div>
<h3>⚿ Username protection</h3><form id="gb-admin-username-form" class="gbpr-form"><label>Username<input id="gb-admin-username" maxlength="20" placeholder="username" required></label><div class="gbpr-actions"><button class="gbpr-btn" type="submit" data-mode="reserve">PROTECT</button><button class="gbpr-btn secondary" type="button" id="gb-admin-unreserve">RELEASE</button></div></form><div id="gb-admin-reserved-list" class="gb-admin-items"></div>
<p id="gb-admin-status" class="gbpr-error" aria-live="polite"></p><button type="button" id="gb-admin-refresh" class="gbpr-btn secondary">REFRESH CONTROL ROOM</button></section>`);
let prCurrent='hub';
function prNavigate(name){
 if(name==='admin'&&!gbAdminRole)return;
 prCurrent=name;prScroll.querySelectorAll('.gbpr-screen').forEach(s=>s.classList.toggle('gbpr-hide',s.id!==(name==='hub'?'gbpr-hub':'gbpr-screen-'+name)));
 const authLabel=prAccountScreen.querySelector('#gbpr-simple-status');if(authLabel)authLabel.textContent=gbprRegistered()?'Signed in to your Carnival account.':'Sign in or create an account to save your progress.';
 const f=prFriendsScreen.querySelector('#gbpr-friends-note');if(f)f.textContent=gbprRegistered()?(profile?.username?'Search by unique @username.':'Choose your unique @username under Edit Profile first.'):'Create an account and choose a unique @username to add friends.';
 prFriendsScreen.querySelector('#gbpr-friends-account').classList.toggle('gbpr-hide',!!(gbprRegistered()&&profile?.username));
 prFriendsScreen.querySelector('#gbpr-friends-controls').classList.toggle('gbpr-hide',!(gbprRegistered()&&profile?.username));
 if(name==='friends'&&gbprRegistered()&&profile?.username)gbprLoadFriends();
 if(name==='mail')void gbprLoadMail();
 if(name==='admin')void gbAdminRefresh();
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
let gbAdminRole=null;

// Cloud-validated continue purchases. A successful RPC is the only authority to grant +5 moves.
window.gbWalletIsSignedIn = () => !!(sb && user && !user.is_anonymous);
window.gbWalletContinueSpend = async (requestId) => {
  if (!sb) throw Error('Wallet unavailable: Supabase connection not ready.');
  if (!requestId) throw Error('Missing transaction ID.');
  const {data: sessionData, error: sessionError} = await sb.auth.getSession();
  if (sessionError || !sessionData?.session?.access_token) throw Error('Session expired. Please sign in again.');
  const { data: authData, error: authError } = await sb.auth.getUser();
  if (authError || !authData?.user || authData.user.is_anonymous) throw Error('A registered account is required for +5 Moves.');
  // Spend exactly once. A retry must reuse requestId, never generate another ID.
  const { data, error } = await sb.rpc('gb_wallet_continue_spend', {p_request_id: requestId});
  if (error) throw Error('Continue payment rejected: '+error.message);
  const receipt = Array.isArray(data) ? data[0] : data;
  const value = Number(receipt?.balance_after);
  if (!Number.isSafeInteger(value) || value < 0) throw Error('Payment returned an invalid receipt. Check cloud ledger.');
  // Read back the *same* receipt from server. Never grant moves without a ledger row.
  const {data: ledger, error: ledgerError} = await sb.from('gb_wallet_continue_ledger')
    .select('request_id,balance_after').eq('user_id',authData.user.id).eq('request_id',requestId).maybeSingle();
  if (ledgerError) throw Error('Cannot verify payment receipt: '+ledgerError.message);
  if (!ledger || Number(ledger.balance_after)!==value) throw Error('Payment could not be verified. Do not retry until cloud balance is checked.');
  window.gbWalletCache?.set(value);
  return value;
};

// Fast wallet display: cache only a balance verified by the server, scoped to the signed-in user.
// Never use a cached value to authorize an actual purchase; Supabase remains authoritative.
const gbWalletCacheKey=uid=>'gb-verified-wallet-v1:'+uid;
let gbWalletGeneration=0;
window.gbWalletCache={
 get(){if(!user||user.is_anonymous)return null;try{const row=JSON.parse(sessionStorage.getItem(gbWalletCacheKey(user.id))||'null');return row&&Number.isSafeInteger(row.balance)&&row.balance>=0?row.balance:null}catch{return null}},
 set(value){if(!user||user.is_anonymous)return;const b=Number(value);if(!Number.isSafeInteger(b)||b<0)return;gbWalletGeneration++;try{sessionStorage.setItem(gbWalletCacheKey(user.id),JSON.stringify({balance:b,time:Date.now()}))}catch{};window.dispatchEvent(new CustomEvent('gb-wallet-cache-updated',{detail:{balance:b,uid:user.id}}));},
 clear(){gbWalletGeneration++;}
};
// Read-only cloud balance, never credits or spends coins.
window.gbWalletGetCloudBalance = async () => {
  if (!sb) throw Error('Cloud wallet not connected.');
  if (!user || user.is_anonymous) throw Error('Sign in to see your cloud balance.');
  const uid=user.id, generation=gbWalletGeneration;
  const {data, error}=await sb.from('player_inventory').select('skull_coins').eq('player_id',uid).maybeSingle();
  if(error) throw Error(error.message);
  if(!data) throw Error('No cloud inventory for this account.');
  const amount=Number(data.skull_coins);
  if(!Number.isSafeInteger(amount)||amount<0) throw Error('Invalid cloud balance.');
  if(user?.id===uid && generation===gbWalletGeneration)window.gbWalletCache.set(amount);
  return amount;
};

// Server-computed, bounded coin rewards, recorded once per best outcome per level.
// The browser controls the match-3 simulation, so this is abuse-limiting rather than proof of gameplay.
window.gbWalletClaimLevelCoins=async(level,stars,points)=>{
  if(!sb)throw Error('Cloud connection not available');
  const {data:auth,error:authError}=await sb.auth.getUser();
  if(authError||!auth?.user||auth.user.is_anonymous)throw Error('Registered account required');
  if(!Number.isInteger(level)||level<1||level>10000||!Number.isInteger(stars)||stars<1||stars>3||!Number.isFinite(points)||points<0)throw Error('Invalid level result');
  const {data,error}=await sb.rpc('gb_claim_level_coin_reward_v2',{
    p_level:level,p_stars:stars,p_points:Math.floor(points)
  });
  if(error)throw Error(error.message);
  const result=Array.isArray(data)?data[0]:data;
  const balance_after=Number(result?.balance_after),credited=Number(result?.credited);
  if(!Number.isSafeInteger(balance_after)||balance_after<0||!Number.isInteger(credited)||credited<0||credited>1000)throw Error('Invalid cloud reward receipt');
  window.gbWalletCache?.set(balance_after);
  return {balance_after,credited};
};

// Server-authoritative Wheel of Misfortune: the draw, cost and coin prize share one transaction.
window.gbWheelCloudSpin = async (requestId) => {
  if (!sb || !requestId) throw Error('Cloud wallet is unavailable.');
  const {data:auth,error:authError}=await sb.auth.getUser();
  if(authError || !auth?.user || auth.user.is_anonymous) throw Error('Sign in to spin the wheel.');
  const {data,error}=await sb.rpc('gb_wheel_spin',{p_request_id:requestId});
  if(error)throw Error(error.message);
  const result=Array.isArray(data)?data[0]:data;
  const idx=Number(result?.prize_index),amount=Number(result?.balance_after),spins=Number(result?.spins_today);
  if(!Number.isInteger(idx)||idx<0||idx>=12||!Number.isSafeInteger(amount)||amount<0||!Number.isInteger(spins)||spins<1)throw Error('Invalid server wheel receipt.');
  return {prize_index:idx,balance_after:amount,spins_today:spins};
};

// Shop receipts are account-owned. Cloud backup authorization is NOT the same as
// account ownership: the former may be delayed by a save revision conflict.
// Never credit receipts to a device bound to another account. On an unbound
// browser, only match a meaningful local save to this user's cloud progression.
async function gbShopCanDeliverToLocal(uid){
  if(!uid||!user||user.id!==uid)return false;
  const bound=localStorage.getItem(cloudBindingKey);
  if(bound && bound!==uid)return false;
  const local=readLocalGameSave();
  if(local.gbShopOwner && local.gbShopOwner!==uid)return false;
  if(canAutoBackup()||bound===uid)return true;
  if(!sb||gbprFreshGameShell(local))return false;
  const {data:cloud,error}=await sb.from('player_cloud_backups')
    .select('snapshot').eq('player_id',uid).maybeSingle();
  if(error||!cloud?.snapshot)return false;
  const remote=validSnapshot(cloud.snapshot);
  const best=x=>saveFingerprint(x&&typeof x.best==='object'?x.best:{});
  // Level and per-level best-stars are an identity fingerprint, not a fallback
  // to simply trust whichever account is currently signed in.
  return Number(local.current)===Number(remote.current) &&
    best(local)===best(remote) &&
    retainsClaimReceipts(local,remote) && retainsClaimReceipts(remote,local);
}

// The storefront never receives a privileged key; authenticated user RPCs only.
window.gbShopApi={
  async sync(){
    if(!sb)throw Error('Supabase is not connected.');
    const {data:auth,error:authError}=await sb.auth.getUser();
    const who=auth?.user;
    if(authError||!who||who.is_anonymous)throw Error('Sign in with a registered account to use the Shop.');
    const {data:orders,error:ordersError}=await sb.from('gb_shop_purchases').select('id,item_id,expires_at,created_at').eq('player_id',who.id).order('created_at',{ascending:true}).limit(1000);
    if(ordersError)throw Error('Shop inventory unavailable: '+ordersError.message+'. Install the included SQL first.');
    gbShopFrameOwned=new Set((orders||[]).map(o=>o.item_id).filter(id=>gbShopFrameIds.includes(id)));
    gbpfPaint();
    // Payment and ownership belong to the signed-in Supabase account. Gameplay
    // consumables are delivered only into a verified device save for THAT account.
    // Keeping receipts on the server makes a purchase safe even if local progress
    // is still being restored; later sync applies each receipt at most once.
    const consumables=(orders||[]).filter(x=>!String(x.item_id).startsWith('frame_'));
    const deliveryReady=consumables.length>0 ? await gbShopCanDeliverToLocal(who.id) : true;
    const deliveryPending=!deliveryReady && consumables.length>0;
    if(deliveryReady){
      if(typeof window.gbShopApplyOrder!=='function')
        throw Error('Gameplay inventory is not ready; your paid receipt remains saved.');
      const locallyApplied=readLocalGameSave().gbShopAppliedOrders||{};
      for(const receipt of consumables){
        if(locallyApplied[receipt.id])continue;
        if(user?.id!==who.id)throw Error('Account changed during shop sync.');
        window.gbShopApplyOrder(receipt,who.id);
      }
    } else if(deliveryPending){
      console.info('Shop receipt safely retained. The browser save is not yet verified for this account.');
    }
    const balance=await window.gbWalletGetCloudBalance();
    return {uid:who.id,balance,orders:orders||[],deliveryPending};
  },
  async purchase(itemId,requestId){
    if(!sb)throw Error('Supabase is not connected.');
    // Server-priced purchases are tied to the authenticated account, never to
    // the browser's local save state. Consumables can be purchased even while
    // a device is restoring; sync() defers local delivery until account binding
    // is verified, protecting other accounts' saves.
    if(!user||user.is_anonymous)throw Error('Sign in with a registered account.');
    const {data,error}=await sb.rpc('gb_shop_purchase',{p_item_id:itemId,p_request_id:requestId});
    if(error)throw Error(error.message);
    const row=Array.isArray(data)?data[0]:data;
    if(!row||!Number.isSafeInteger(Number(row.balance_after)))throw Error('Invalid shop purchase receipt.');
    window.gbWalletCache?.set(Number(row.balance_after));
    window.dispatchEvent(new Event('gb-wallet-balance-changed'));
    return row;
  }
};

// Frame IDs intentionally have no player-facing names. Never trust client claims for paid/unlocked frames.
const GBPF_PATH='assets/profile-frames/';
const gbShopFrameIds=['babybat','emobaby','clowngal','heartballoon','foxy','cuteangel','purplefluffy','poseidon','greek'].map(s=>'frame_'+s);
let gbShopFrameOwned=new Set();
let gbPublishedFrameOwned=new Set();const gbPublishedFrameUrls=new Map();


const gbpfFile=id=>gbPublishedFrameUrls.has(String(id))?gbPublishedFrameUrls.get(String(id)):gbShopFrameIds.includes(String(id))?'assets/shop-frames/'+String(id).slice(6)+'.webp':id==='hungry_gate'?GBPF_PATH+'hungry_gate.png':/^album_completion_0[2-9]$/.test(String(id))?'assets/collectibles/completion-frames/completion_'+String(id).slice(-2)+'.webp':/^[1-5]$/.test(String(id))?GBPF_PATH+'frame_0'+id+'.png':/^gift_(0[1-9]|1[0-9])$/.test(String(id))?GBPF_PATH+id+'.png':'';
const gbpfNormalize=id=>/^custom_[a-f0-9]{12}$/.test(String(id))?String(id):gbShopFrameIds.includes(String(id))?String(id):id==='hungry_gate'?'hungry_gate':/^album_completion_0[2-9]$/.test(String(id))?String(id):/^[1-5]$/.test(String(id))?String(id):/^gift_(0[1-9]|1[0-9])$/.test(String(id))?String(id):'none';
let gbAlbumFrameOwned=new Set();
window.gbAlbumFrameRefresh=async()=>{
 if(!sb||!user||user.is_anonymous){gbAlbumFrameOwned=new Set();gbpfPaint();return;}
 // Read verified entitlements directly, independently of the collection-status RPC.
 // Every user with a completed personal round owns its exclusive frame permanently.
 let ids=[];
 const direct=await sb.rpc('gb_owned_completion_frames');
 if(!direct.error&&Array.isArray(direct.data)){
  ids=direct.data.map(x=>typeof x==='string'?x:x?.frame_id).filter(Boolean);
 }else{
  const fallback=await sb.rpc('gb_album_reward_status');
  if(fallback.error){
   console.warn('Completion frame lookup:',direct.error?.message||fallback.error.message);
   const status=$p('gbpf-status');
   if(status)status.textContent='Unable to refresh completion frames: '+(direct.error?.message||fallback.error.message);
   return;
  }
  ids=Array.isArray(fallback.data?.owned_grand_frames)?fallback.data.owned_grand_frames:[];
 }
 gbAlbumFrameOwned=new Set(ids.map(String).filter(id=>id==='hungry_gate'||/^album_completion_0[2-9]$/.test(id)));
 const status=$p('gbpf-status');
 if(status&&status.textContent.startsWith('Unable to refresh completion frames:'))status.textContent='';
 gbpfPaint();
};
let gbGiftOwned=new Set();
window.gbPublishedFrameRefresh=async()=>{
 if(!sb||!user||user.is_anonymous){gbPublishedFrameOwned.clear();gbPublishedFrameUrls.clear();gbpfPaint();return;}
 const {data,error}=await sb.rpc('gb_owned_published_frames');
 if(error){console.warn('Published frame lookup:',error.message);return;}
 gbPublishedFrameOwned=new Set();gbPublishedFrameUrls.clear();
 for(const row of data||[]){gbPublishedFrameOwned.add(row.frame_id);gbPublishedFrameUrls.set(row.frame_id,sb.storage.from('gb-published-frames').getPublicUrl(row.storage_path).data.publicUrl);}
 gbpfPaint();
};
window.gbGiftOwnershipRefresh=async()=>{if(!sb||!user||user.is_anonymous){gbGiftOwned=new Set();gbpfPaint();return;}const {data,error}=await sb.rpc('gb_owned_gift_frames');if(error){console.warn('Gift frames lookup:',error.message);const status=$p('gbpf-status');if(status)status.textContent='Could not refresh claimed frames: '+error.message;return;}const status=$p('gbpf-status');if(status&&status.textContent.startsWith('Could not refresh claimed frames:'))status.textContent='';gbGiftOwned=new Set((data||[]).map(x=>x.frame_id));gbpfPaint();};
const gbpfLocalKey=()=>user?.id?'gbpf-equipped-'+user.id:'gbpf-equipped-guest';
const gbpfLocal=()=>{try{return gbpfNormalize(localStorage.getItem(gbpfLocalKey())||'none')}catch{return 'none'}};
// Each paid frame has a different transparent opening. Keep the avatar clipped
// to that opening rather than assuming 70% fits all designs.
const gbpfShopHole={
 frame_babybat:[55.6,49.8,49.9],frame_emobaby:[44.8,48.8,54.6],
 frame_clowngal:[49.6,49.4,54.3],frame_heartballoon:[50.2,49.4,48.0],
 frame_foxy:[50.6,49.8,50.5],frame_cuteangel:[49.3,49.3,46.0],
 frame_purplefluffy:[47.4,48.3,47.0],frame_poseidon:[46.1,47.0,48.2],
 frame_greek:[42.1,46.5,47.3]
};
const gbpfFit=(el,id)=>{
 if(!el)return;
 const fit=gbpfShopHole[id];
 el.classList.toggle('gbpf-paid-fit',Boolean(fit));
 if(fit){el.style.setProperty('--gbpf-hole-size',fit[0]+'%');el.style.setProperty('--gbpf-hole-x',fit[1]+'%');el.style.setProperty('--gbpf-hole-y',fit[2]+'%');el.style.setProperty('--gbpf-photo-clip',(fit[0]/1.4).toFixed(3)+'%');}
 else{el.style.removeProperty('--gbpf-hole-size');el.style.removeProperty('--gbpf-hole-x');el.style.removeProperty('--gbpf-hole-y');el.style.removeProperty('--gbpf-photo-clip');}
};
const gbpfCurrent=()=>gbpfNormalize(profile?.equipped_frame??gbpfLocal());
const gbpfSetLocal=id=>{try{localStorage.setItem(gbpfLocalKey(),id)}catch{}};
function gbpfDecorate(el,id){
 if(!el)return;
 let wrap=el.closest('.gbpf-hero-avatar-wrap');
 if(!wrap){wrap=document.createElement('span');wrap.className='gbpf-hero-avatar-wrap';el.parentNode.insertBefore(wrap,el);wrap.appendChild(el)}
 wrap.querySelectorAll('.gbpf-overlay').forEach(x=>x.remove());
 gbpfFit(wrap,id);
 el.classList.add('gbpf-avatar-img');
 const src=gbpfFile(id);
 if(!src)return;
 const frame=document.createElement('img');frame.src=src;frame.className='gbpf-overlay';frame.alt='';frame.setAttribute('aria-hidden','true');wrap.appendChild(frame);
}
function gbpfPaint(){const selected=gbpfCurrent();gbpfFit(prFramePanel.querySelector('.gbpf-preview'),selected);const hero=$p('gbpr-current-avatar');gbpfDecorate(hero,selected);const avatar=$p('gbpf-preview-avatar');if(avatar)avatar.src=avatarUrl();const border=$p('gbpf-preview-border');if(border){border.src=gbpfFile(selected)||'';border.hidden=!gbpfFile(selected)};
 const hud=document.getElementById('gbMenuAvatar');if(hud){const old=document.getElementById('gbpf-hud-frame');if(old)old.remove();if(gbpfFile(selected)){const overlay=document.createElement('img');overlay.id='gbpf-hud-frame';overlay.src=gbpfFile(selected);overlay.alt='';overlay.setAttribute('aria-hidden','true');hud.insertAdjacentElement('afterend',overlay)}}
 const choices=$p('gbpf-options');if(choices){choices.innerHTML=['none','1','2','3','4','5',...Array.from(gbAlbumFrameOwned),...Array.from({length:19},(_,i)=>'gift_'+String(i+1).padStart(2,'0')).filter(id=>gbGiftOwned.has(id)),...gbShopFrameIds.filter(id=>gbShopFrameOwned.has(id)),...Array.from(gbPublishedFrameOwned)].map(id=>{const locked=((id==='hungry_gate'||id.startsWith('album_completion_'))&&!gbAlbumFrameOwned.has(id))||(id.startsWith('gift_')&&!gbGiftOwned.has(id))||(id.startsWith('frame_')&&!gbShopFrameOwned.has(id));const chosen=id===selected;const inner=gbpfFile(id)?'<img src="'+gbpfFile(id)+'" alt="">':'<span class="gbpf-empty">○</span>';return '<button type="button" data-gbpf-frame="'+id+'" class="gbpf-choice '+(chosen?'selected ':'')+(locked?'locked':'')+'" aria-label="'+(locked?'Locked frame':id==='none'?'No frame':'Profile frame '+id)+'" aria-pressed="'+chosen+'">'+inner+(locked?'<span class="gbpf-lock">🔒</span>':'')+(chosen?'<span class="gbpf-tick">✓</span>':'')+'</button>'}).join('')}
}
window.gbpfRefresh=gbpfPaint;
prFramePanel.addEventListener('click',async e=>{const button=e.target.closest('[data-gbpf-frame]');if(!button)return;const id=gbpfNormalize(button.dataset.gbpfFrame);const status=$p('gbpf-status');if((id==='hungry_gate'||id.startsWith('album_completion_'))&&!gbAlbumFrameOwned.has(id)){status.textContent='This exclusive completion frame was not awarded to your account.';return}if(id.startsWith('gift_')&&!gbGiftOwned.has(id)){status.textContent='Locked: redeem its gift code in Settings.';return}if(id.startsWith('frame_')&&!gbShopFrameOwned.has(id)){status.textContent='Purchase this frame in the Carnival Shop first.';return}
 if(id.startsWith('custom_')&&!gbPublishedFrameOwned.has(id)){status.textContent='This gift frame has not been claimed by your account. Refresh your frames.';void window.gbPublishedFrameRefresh?.();return}
 if(sb&&gbprRegistered()){status.textContent='Saving frame…';const isGift=id.startsWith('gift_')||id.startsWith('custom_');const result=isGift?await sb.rpc('gb_equip_claimed_gift_frame',{p_frame_id:id}):await sb.from('profiles').update({equipped_frame:id}).eq('id',user.id);if(result.error){status.textContent='Could not equip frame: '+result.error.message;return}profile={...profile,equipped_frame:id}}
 gbpfSetLocal(id);status.textContent='Frame equipped!';gbpfPaint();});

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
function refresh(){syncMenuAvatar();queueMicrotask(gbpfPaint);const signed=gbprRegistered();$p('gbpr-auth-panel').classList.toggle('gbpr-hide',signed);$p('gbpr-account-panel').classList.toggle('gbpr-hide',!signed);$p('gbpr-signout').classList.toggle('gbpr-hide',!signed);$p('gbpr-display').textContent=profile?.display_name||'Carnival Guest';$p('gbpr-handle').textContent=profile?.username?'@'+profile.username:(signed?'Choose a unique username':'Guest player');$p('gbpr-level').textContent='LEVEL '+localLevel()+' · Cloud progress';$p('gbpr-current-avatar').src=avatarUrl();$p('gbpr-new-name').value=profile?.display_name||'Carnival Guest';$p('gbpr-new-handle').value=profile?.username||'';$p('gbpr-avatar-help').textContent=signed?'Tap any character to save it. You can also upload your own photo.':'Sign in to save a PFP to your account. Tap to preview characters.';document.querySelectorAll('.gbpr-avatar').forEach((b,i)=>b.classList.toggle('chosen',(avatarPreview!==null?avatarPreview:avatarIndex(profile?.avatar_key))===i));}
function view(open){layer.classList.toggle('open',open);if(open){avatarPreview=null;refresh();prUpdateHub();void gbprRefreshMailDot();prNavigate('hub');void gbprRefreshRequestDot();$p('gbpr-close').focus()}}
$p('gbpr-close').onclick=()=>view(false);
document.getElementById('profile').addEventListener('click',()=>view(true));
layer.addEventListener('pointerdown',e=>e.stopPropagation());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&layer.classList.contains('open'))view(false)});
$p('gbpr-avatar-list').innerHTML=AVATARS.map((name,i)=>`<button type="button" class="gbpr-avatar" data-index="${i}"><img loading="lazy" src="${avatarFile(i)}" alt=""></button>`).join('');

// Admin authorization is checked via a SECURITY DEFINER RPC; no public roles table access.
async function gbAdminCheck(){
 const nav=$p('gb-admin-nav');gbAdminRole=null;
 if(sb&&gbprRegistered()){
  const r=await sb.rpc('gb_my_admin_role');
  if(!r.error&&['owner','admin'].includes(r.data))gbAdminRole=r.data;
 }
 if(nav){nav.hidden=!gbAdminRole;nav.style.display=gbAdminRole?'':'none';}
 if(!gbAdminRole&&prCurrent==='admin')prNavigate('hub');
}
function gbAdminNote(message,ok=false){const el=$p('gb-admin-status');if(el){el.textContent=message;el.style.color=ok?'#98f2c1':'';}}
async function gbAdminRefresh(){
 if(!sb||!gbAdminRole)return;
 $p('gb-admin-role').textContent=gbAdminRole==='owner'?'OWNER ACCESS':'ADMIN ACCESS';const releaseArea=prAdminScreen.querySelector('.gb-admin-publish-controls');if(releaseArea)releaseArea.hidden=gbAdminRole!=='owner';
 const [names,frames]=await Promise.all([sb.rpc('gb_admin_list_reserved'),sb.from('gb_admin_test_frames').select('id,title,storage_path,status,created_at').order('created_at',{ascending:false}).limit(50)]);
 $p('gb-admin-reserved-list').textContent=names.error?'Unable to list usernames: '+names.error.message:(names.data||[]).map(x=>'@'+x.username).join(' · ')||'No protected usernames';
 const area=$p('gb-admin-test-frames');area.replaceChildren();
 if(frames.error){area.textContent='Unable to load frames: '+frames.error.message;return;}
 if(!frames.data?.length){area.textContent='No test frames yet.';return;}
 for(const f of frames.data){
  const item=document.createElement('div');item.className='gb-admin-frame-item';
  const image=document.createElement('img');image.alt=f.title;image.loading='lazy';
  const signed=await sb.storage.from('gb-admin-test-frames').createSignedUrl(f.storage_path,120);
  if(!signed.error)image.src=signed.data.signedUrl;
  const details=document.createElement('div');const title=document.createElement('strong');title.textContent=f.title;
  const line=document.createElement('p');line.textContent=f.status.toUpperCase();details.append(title,line);
  const test=document.createElement('button');test.type='button';test.className='gbpr-btn secondary';test.textContent='PREVIEW';
  test.onclick=()=>{
   const previous=$p('gb-admin-frame-preview');previous?.remove();
   // Use the same circle/frame geometry as the player's real profile.
   const preview=document.createElement('div');preview.id='gb-admin-frame-preview';preview.className='gb-admin-frame-preview gbpr-hero';
   const wrap=document.createElement('span');wrap.className='gbpf-hero-avatar-wrap';
   const avatar=document.createElement('img');avatar.src=avatarUrl();avatar.alt='Your profile photo';avatar.className='gbpf-avatar-img';
   const overlay=document.createElement('img');overlay.alt='Test frame';overlay.src=image.src;overlay.className='gbpf-overlay';overlay.setAttribute('aria-hidden','true');
   wrap.append(avatar,overlay);preview.append(wrap);item.append(preview);
   gbpfFit(wrap,'none'); // Universal 70% circle used by normal profile and completion frames.
  };
  details.append(test);
  if(gbAdminRole==='owner'){
   const sel=document.createElement('select');['draft','testing','approved'].forEach(x=>{const o=document.createElement('option');o.value=x;o.textContent=x.toUpperCase();o.selected=x===f.status;sel.append(o)});
   sel.onchange=async()=>{const res=await sb.rpc('gb_admin_set_test_frame_status',{p_id:f.id,p_status:sel.value});gbAdminNote(res.error?res.error.message:'Status updated. Frame remains private.',!res.error);if(res.error)sel.value=f.status;else{f.status=sel.value;void gbAdminRefresh();}};details.append(sel);
   if(f.status==='approved'){
    const codeBtn=document.createElement('button');codeBtn.type='button';codeBtn.className='gbpr-btn';codeBtn.textContent='PUBLISH AS GIFT CODE';
    codeBtn.onclick=()=>gbAdminPublishGift(f,image.src);
    details.append(codeBtn);
   }
  }
  item.append(image,details);area.append(item);
 }
}
async function gbAdminPublishGift(frame,privateUrl){
 if(gbAdminRole!=='owner'||frame.status!=='approved')return;
 const codeInput=$p('gb-admin-publish-code');const limitInput=$p('gb-admin-publish-limit');
 const code=(codeInput?.value||'').trim().toUpperCase();const limit=Number(limitInput?.value);
 if(!/^[A-Z0-9-]{4,32}$/.test(code)){gbAdminNote('Enter a code of 4–32 letters, digits or hyphens.');return;}
 if(!Number.isSafeInteger(limit)||limit<1||limit>100000){gbAdminNote('Enter a maximum of 1–100,000 claims.');return;}
 if(!await gbprConfirm('Publish '+frame.title+' as a real redeemable frame with code '+code+' and '+limit+' maximum claims? This makes its artwork publicly accessible, but only code redeemers can equip it.'))return;
 try{
  const ext=frame.storage_path.toLowerCase().endsWith('.webp')?'.webp':'.png';
  const publicPath='published/'+frame.id+ext;
  const download=await sb.storage.from('gb-admin-test-frames').download(frame.storage_path);
  if(download.error)throw download.error;
  const uploaded=await sb.storage.from('gb-published-frames').upload(publicPath,download.data,{upsert:false,contentType:ext==='.png'?'image/png':'image/webp'});
  if(uploaded.error && !/already exists|duplicate/i.test(uploaded.error.message||''))throw uploaded.error;
  const result=await sb.rpc('gb_publish_test_frame_code',{p_test_id:frame.id,p_code:code,p_limit:limit,p_storage_path:publicPath});
  if(result.error)throw result.error;
  gbAdminNote('Gift code '+code+' published! Players can redeem it in Settings → Gift Code.',true);
  await gbprAlert('Gift code '+code+' is live. The frame can now be redeemed by up to '+limit+' players.');
 }catch(e){gbAdminNote('Publishing failed: '+(e?.message||e));await gbprAlert('Gift-code publishing failed: '+(e?.message||e))}
}
$p('gb-admin-broadcast').onsubmit=async e=>{
 e.preventDefault();if(!gbAdminRole)return;
 const title=$p('gb-admin-title').value.trim(),body=$p('gb-admin-body').value.trim();
 if(!await gbprConfirm('Send this letter to players registered right now? Future signups will not receive it.'))return;
 const r=await sb.rpc('gb_send_announcement',{p_title:title,p_body:body});gbAdminNote(r.error?r.error.message:'Letter sent to all currently registered players. Find it in the regular Mailbox.',!r.error);
 if(!r.error){e.target.reset();await gbprAlert('Your letter has been sent to currently registered players.')} 
};
$p('gb-admin-username-form').onsubmit=async e=>{e.preventDefault();await gbAdminUsernameChange(true);};
$p('gb-admin-unreserve').onclick=()=>gbAdminUsernameChange(false);
async function gbAdminUsernameChange(reserve){
 if(!gbAdminRole)return;
 const n=$p('gb-admin-username').value.trim().toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(n)){gbAdminNote('Use 3–20 letters, numbers or underscores.');return;}
 const r=await sb.rpc('gb_admin_reserve_username',{p_username:n,p_reserve:reserve});gbAdminNote(r.error?r.error.message:reserve?'Username protected.':'Username released.',!r.error);if(!r.error)void gbAdminRefresh();
}
$p('gb-admin-frame-form').onsubmit=async e=>{
 e.preventDefault();if(!gbAdminRole||!user)return;
 const f=$p('gb-admin-frame-file').files?.[0],title=$p('gb-admin-frame-title').value.trim();
 if(!f||!['image/png','image/webp'].includes(f.type)||f.size>5242880||!title){gbAdminNote('Choose a PNG or WebP under 5MB and enter a title.');return;}
 const path=user.id+'/'+crypto.randomUUID()+(f.type==='image/png'?'.png':'.webp');
 const upload=await sb.storage.from('gb-admin-test-frames').upload(path,f,{contentType:f.type,upsert:false});
 if(upload.error){gbAdminNote(upload.error.message);return;}
 const saved=await sb.from('gb_admin_test_frames').insert({title,storage_path:path,created_by:user.id});
 if(saved.error){await sb.storage.from('gb-admin-test-frames').remove([path]);gbAdminNote(saved.error.message);return;}
 gbAdminNote('Private test frame uploaded!',true);e.target.reset();void gbAdminRefresh();
};
$p('gb-admin-refresh').onclick=()=>gbAdminRefresh();

// Admin broadcasts use the SAME inbox rows and letter view as Mr. Walker's mail.
// Their eligibility is checked in Supabase using recipient creation time.
async function gbLoadGlobalAnnouncements(){return gbprLoadMail();}

async function fetchProfile(){if(!sb||!user)return;const {data,error}=await sb.from('profiles').select('id,username,display_name,avatar_key,avatar_path,equipped_frame').eq('id',user.id).maybeSingle();if(error){setMessage('gbpr-edit-status',error.message);return}profile=data||null;refresh();void gbAdminCheck();void window.gbGiftOwnershipRefresh?.();void window.gbPublishedFrameRefresh?.();void window.gbAlbumFrameRefresh?.();void window.gbShopApi?.sync().catch(()=>{});void gbprRefreshRequestDot();if(gbprRegistered())window.gbCloudReady?.()}
for(const el of document.querySelectorAll('.gbpr-avatar'))el.onclick=async()=>{const i=Number(el.dataset.index);avatarPreview=i;refresh();if(!gbprRegistered()||!sb){try{localStorage.setItem('gb-guest-avatar',String(i))}catch(e){};return;}setMessage('gbpr-upload-status','Saving avatar…');const {error}=await sb.from('profiles').update({avatar_key:avatarKey(i),avatar_path:null}).eq('id',user.id);if(error){setMessage('gbpr-upload-status',error.message);return}profile={...profile,avatar_key:avatarKey(i),avatar_path:null};avatarPreview=null;setMessage('gbpr-upload-status','Avatar saved!',true);refresh()};
function setAuthMode(isSignup){signup=isSignup;document.querySelectorAll('.gbpr-signup-field').forEach(el=>el.classList.toggle('gbpr-hide',!signup));$p('gbpr-signup-name').required=signup;$p('gbpr-signup-username').required=signup;$p('gbpr-auth-submit').textContent=signup?'CREATE ACCOUNT':'SIGN IN';$p('gbpr-login-tab').classList.toggle('secondary',signup);$p('gbpr-signup-tab').classList.toggle('secondary',!signup);$p('gbpr-password').autocomplete=signup?'new-password':'current-password';setMessage('gbpr-auth-status','')}
$p('gbpr-login-tab').onclick=()=>setAuthMode(false);$p('gbpr-signup-tab').onclick=()=>setAuthMode(true);
$p('gbpr-auth-form').onsubmit=async e=>{
 e.preventDefault();if(!sb){setMessage('gbpr-auth-status','Connection not ready.');return}
 if(working)return;working=true;$p('gbpr-auth-submit').disabled=true;
 const email=$p('gbpr-email').value.trim(),password=$p('gbpr-password').value;
 const signupName=$p('gbpr-signup-name').value.trim(),signupUsername=$p('gbpr-signup-username').value.trim().toLowerCase();
 if(signup&&(!signupName||! /^[a-z0-9_]{3,20}$/.test(signupUsername))){setMessage('gbpr-auth-status','Enter a display name and a username of 3–20 letters, numbers or underscores.');working=false;$p('gbpr-auth-submit').disabled=false;return;}
 if(signup){const check=await sb.rpc('gb_username_available',{p_username:signupUsername});if(check.error){setMessage('gbpr-auth-status','Username check unavailable. Please try again after the database update.');working=false;$p('gbpr-auth-submit').disabled=false;return;}if(!check.data){setMessage('gbpr-auth-status','This username is already taken.');working=false;$p('gbpr-auth-submit').disabled=false;return;}}
 setMessage('gbpr-auth-status',signup?'Securing your carnival account…':'Signing in…');
 try{
  let result;
  if(signup&&gbprIsGuest()){
   // Convert this exact anonymous identity; never create a second account ID.
   result=await sb.auth.updateUser({email,password,data:{display_name:signupName,username:signupUsername}});
   if(result.error)throw result.error;
   setMessage('gbpr-auth-status','Check your email for a confirmation link. Keep this browser session until confirmed.',true);
  }else if(signup){
   result=await sb.auth.signUp({email,password,options:{data:{display_name:signupName,username:signupUsername}}});if(result.error)throw result.error;
   setMessage('gbpr-auth-status',result.data?.session?'Welcome!':'Check your email to confirm your account.',true);
  }else{
   if(gbprIsGuest()&&!await gbprConfirm('Signing into a different account will replace the current guest login on this browser. Guest progress is backed up locally, but it will not be attributed to the other account. Continue?'))return;
   result=await sb.auth.signInWithPassword({email,password});if(result.error)throw result.error;
   setMessage('gbpr-auth-status','Welcome back!',true);
  }
  if(result?.data?.user){
   // Persist identity BEFORE switching into the game: the cloud restore can
   // reload the page, which previously interrupted the profile write.
   let setupError=null;
   if(signup&&result.data.session){
    const identity={display_name:signupName,username:signupUsername};
    // The signup trigger may already have created a default profile row.
    // UPDATE preserves its avatar, frames and all other progress fields.
    let saved=await sb.from('profiles').update(identity).eq('id',result.data.user.id).select('id').maybeSingle();
    if(!saved.error&&!saved.data){
     saved=await sb.from('profiles').insert({id:result.data.user.id,...identity}).select('id').maybeSingle();
    }
    setupError=saved.error;
   }
   if(setupError){
    setMessage('gbpr-auth-status',setupError.code==='23505'?'Account created, but this username is already taken. Please choose another in Edit Profile.':'Account created, but profile details could not be saved: '+setupError.message);
   }
   await gbSwitchIdentity(result.data.user);
   if(signup&&!setupError&&result.data.session)setMessage('gbpr-auth-status','Welcome to the Carnival!',true);
  }
 }catch(err){setMessage('gbpr-auth-status',err.message||'Authentication failed')}
 finally{working=false;$p('gbpr-auth-submit').disabled=false}
};
$p('gbpr-edit-form').onsubmit=async e=>{e.preventDefault();if(!sb||!gbprRegistered())return;const username=$p('gbpr-new-handle').value.trim().toLowerCase();const display_name=$p('gbpr-new-name').value.trim();if(username&&!/^[a-z0-9_]{3,20}$/.test(username)){setMessage('gbpr-edit-status','Username must be 3–20 letters, numbers or underscores.');return}if(!display_name){setMessage('gbpr-edit-status','Choose a display name.');return}setMessage('gbpr-edit-status','Saving…');const {error}=await sb.from('profiles').update({username:username||null,display_name}).eq('id',user.id);if(error){setMessage('gbpr-edit-status',error.code==='23505'?'This username is already taken.':error.message);return}profile={...profile,username:username||null,display_name};setMessage('gbpr-edit-status','Profile updated!',true);refresh()};
$p('gbpr-signout').onclick=async()=>{if(!sb)return;const leaving=user?.id;if(gbprRegistered()&&canAutoBackup()){
 try{const state=readLocalGameSave();if(cloudCursor(leaving)?.fingerprint!==saveFingerprint(state)){
  const synced=await cloudUpload(true);
  if(!synced||cloudCursor(leaving)?.fingerprint!==saveFingerprint(readLocalGameSave()))throw Error('Cloud save not yet confirmed');
 }}catch(e){setMessage('gbpr-signout-status','Sign-out paused to protect unsaved progress: '+(e?.message||'Cloud unavailable'));return}
 }const {error}=await sb.auth.signOut();if(error){setMessage('gbpr-signout-status',error.message);return}gbLocalSafetyCopy('logout',leaving);window.gbWalletCache?.clear?.();window.gbAccountReadyForPlay=false;localStorage.removeItem('gb-playable-v4');localStorage.removeItem(cloudBindingKey);localStorage.removeItem(gbInstalledOwnerKey);localStorage.removeItem(gbGuestOwnerKey);sessionStorage.removeItem(gbCloudReloadKey);cloudReset();location.reload()};
$p('gbpr-upload').onchange=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!user||!sb){setMessage('gbpr-upload-status','Please sign in before uploading a photo.');return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setMessage('gbpr-upload-status','Choose a JPG, PNG or WebP image.');return}if(file.size>8*1024*1024){setMessage('gbpr-upload-status','Choose an image smaller than 8 MB.');return}
 setMessage('gbpr-upload-status','Preparing photo…');try{const bmp=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing unavailable');const d=Math.min(bmp.width,bmp.height);ctx.drawImage(bmp,(bmp.width-d)/2,(bmp.height-d)/2,d,d,0,0,512,512);bmp.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.84));if(!blob)throw Error('Could not prepare photo');const path=user.id+'/profile-'+Date.now()+'.webp';setMessage('gbpr-upload-status','Uploading photo…');const upload=await sb.storage.from('avatars').upload(path,blob,{contentType:'image/webp',upsert:false});if(upload.error)throw upload.error;const updated=await sb.from('profiles').update({avatar_path:path}).eq('id',user.id);if(updated.error)throw updated.error;profile={...profile,avatar_path:path};avatarPreview=null;setMessage('gbpr-upload-status','Photo uploaded!',true);refresh()}catch(err){setMessage('gbpr-upload-status',err.message||'Upload failed')}};
// A registered account is not silently converted into a guest when its token
// cannot be restored. Startup awaits identity before gameplay is allowed.
let gbIdentityGeneration=0;
let gbIdentityLoadingUid=null;
const gbInstalledOwnerKey='gb-installed-progress-owner-v1';
const gbRememberedRegisteredKey='gb-last-registered-user-v1';
const gbGuestOwnerKey='gb-guest-progress-owner-v1';
const gbCloudReloadKey='gb-cloud-reload-once-v1';
const gbBlankProgress=()=>({current:1,best:{},coins:0,lives:5,lifeTick:Date.now(),preSpecialsGranted:false,preSpecials:{RV:0,CB:0,FW:0},boosterInventory:{hammer:0,watch:0,cards:0,musicbox:0},boosterGrants:{}});
function gbLocalSafetyCopy(reason,uid){
 try{
  const raw=localStorage.getItem('gb-playable-v4');
  if(raw&&raw!=='null'){
   const key='gb-safe-save:'+reason+':'+(uid||'unlinked')+':'+Date.now();
   localStorage.setItem(key,raw);
  }
 }catch(e){console.warn('Unable to create local save backup:',e)}
}
function gbInstalledOwner(){return localStorage.getItem(gbInstalledOwnerKey)||localStorage.getItem(cloudBindingKey)||null}
function gbSnapshotStarsMerge(cloud,local){
 // Migration only. Never sum purchases, coins, boosters, lives or claimed rewards.
 const merged={...cloud,best:{...(cloud.best||{})},bestCoins:{...(cloud.bestCoins||{})}};
 let improved=false;
 for(const [k,v] of Object.entries(local.best||{})){
  if(!/^\d+$/.test(k)||Number(k)<1||Number(k)>100000)continue;
  const stars=Number(v);
  if(!Number.isInteger(stars)||stars<0||stars>3)continue;
  if(stars>Number(merged.best[k]||0)){merged.best[k]=stars;improved=true}
 }
 for(const [k,v] of Object.entries(local.bestCoins||{})){
  if(!/^\d+$/.test(k)||!Number.isSafeInteger(Number(v))||Number(v)<0)continue;
  if(Number(v)>Number(merged.bestCoins[k]||0)){merged.bestCoins[k]=Number(v);improved=true}
 }
 const highest=Object.keys(merged.best).reduce((n,k)=>Number(merged.best[k])>0?Math.max(n,Number(k)+1):n,1);
 const next=Math.max(1,Number(cloud.current)||1,Number(local.current)||1,highest);
 if(next>Number(merged.current||1)){merged.current=next;improved=true}
 return {snapshot:merged,improved};
}
async function gbInitializeCloudIdentity(who,generation){
 const uid=who.id;
 window.gbAccountReadyForPlay=false;
 const oldOwner=gbInstalledOwner();
 const raw=localStorage.getItem('gb-playable-v4');
 const local=readLocalGameSave();
 if(who.is_anonymous){
  // An anonymous player may use only the browser save explicitly bound to that
  // SAME anonymous id. In particular: never upload the last registered save.
  const isOwnGuest=localStorage.getItem(gbGuestOwnerKey)===uid && !oldOwner;
  if(!isOwnGuest){
   gbLocalSafetyCopy('before-guest',oldOwner);
   localStorage.setItem('gb-playable-v4',JSON.stringify(gbBlankProgress()));
   localStorage.removeItem(cloudBindingKey);
   localStorage.removeItem(gbInstalledOwnerKey);
   localStorage.setItem(gbGuestOwnerKey,uid);
   sessionStorage.setItem(gbCloudReloadKey,'guest:'+uid);
   location.reload();return false;
  }
  if(generation!==gbIdentityGeneration)return false;
  window.gbAccountReadyForPlay=true;
  document.querySelector('#current')?.replaceChildren(document.createTextNode('Level '+local.current));
  return true;
 }
 localStorage.setItem(gbRememberedRegisteredKey,uid);
 const cloud=await fetchCloudRecord(uid);
 if(generation!==gbIdentityGeneration||user?.id!==uid)return false;
 let selected;
 let baseline=null,rev=0;
 if(cloud){
  baseline=validSnapshot(cloud.snapshot);rev=Number(cloud.save_revision)||0;
  // Legacy migration: only use locally earned stars if the pre-existing save
  // is explicitly bound to this SAME account. Never copy consumable inventory.
  if(oldOwner===uid){
   const baselineCursor=cloudCursor(uid);
   if(Number(baselineCursor?.revision)===rev && localDominatesCloud(local,baseline))
     selected=local; // Account-owned pending progress not yet committed.
   else selected=gbSnapshotStarsMerge(baseline,local).snapshot;
  }else selected=baseline;
 }else if(oldOwner===uid || (localStorage.getItem(gbGuestOwnerKey)===uid && !oldOwner)){
  // No cloud record: a previously bound account can migrate its own save once.
  selected=validSnapshot(local);
 }else{
  // An unowned legacy save is ambiguous: archive it, never attribute it to the
  // newly signed-in account. A fresh account starts on its own cloud record.
  selected=gbBlankProgress();
 }
 const {data:wallet,error:walletError}=await sb.from('player_inventory')
   .select('skull_coins').eq('player_id',uid).maybeSingle();
 if(walletError)throw walletError;
 if(!wallet||!Number.isSafeInteger(Number(wallet.skull_coins)))throw Error('Cloud wallet not ready; gameplay paused to protect progress.');
 selected={...selected,coins:Number(wallet.skull_coins)};
 if(generation!==gbIdentityGeneration||user?.id!==uid)return false;
 const marker=sessionStorage.getItem(gbCloudReloadKey);
 const installed=marker==='account:'+uid && saveFingerprint(local)===saveFingerprint(selected);
 if(marker==='account:'+uid)sessionStorage.removeItem(gbCloudReloadKey);
 // Preserve the old value for recovery before modifying the boot-time save.
 if(!installed && (raw!==JSON.stringify(selected) || oldOwner!==uid)){
  gbLocalSafetyCopy('before-cloud-install',oldOwner||uid);
  localStorage.setItem('gb-playable-v4',JSON.stringify(selected));
  localStorage.setItem(gbInstalledOwnerKey,uid);
  localStorage.setItem(cloudBindingKey,uid);
  localStorage.removeItem(gbGuestOwnerKey);
  // Keep server revision metadata when rebooting. Do not write an unverified
  // local snapshot over a different account's cloud backup.
  if(cloud)rememberCloudBaseline(uid,baseline,rev);
  sessionStorage.setItem(gbCloudReloadKey,'account:'+uid);
  location.reload();return false;
 }
 localStorage.setItem(gbInstalledOwnerKey,uid);
 localStorage.setItem(cloudBindingKey,uid);
 localStorage.removeItem(gbGuestOwnerKey);
 cloudKnownRevision=cloud?rev:null;
 if(cloud){rememberCloudBaseline(uid,baseline,rev)}
 cloudEnableForAccount();
 // If a legitimate legacy save contained additional verified level stars,
 // the normal compare-and-swap cloud uploader can sync this account's merge.
 if(!cloud || saveFingerprint(selected)!==saveFingerprint(baseline)){
   if(!cloud)void cloudUpload(true);else queueCloudUpload();
  }
 if(generation!==gbIdentityGeneration||user?.id!==uid)return false;
 window.gbAccountReadyForPlay=true;
 const el=document.getElementById('current');if(el)el.textContent='Level '+Number(selected.current||1);
 refresh();return true;
}
async function gbSwitchIdentity(next){
 const generation=++gbIdentityGeneration;
 gbIdentityLoadingUid=next?.id||null;
 user=next||null;profile=null;gbAdminRole=null;const nav=$p('gb-admin-nav');if(nav){nav.hidden=true;nav.style.display='none';}
 window.gbAccountReadyForPlay=false;
 window.gbWalletCache?.clear?.();
 if(!next){refresh();setMessage('gbpr-auth-status','Sign in to load your cloud progress.');return}
 try{
  const ready=await gbInitializeCloudIdentity(next,generation);
  if(!ready ||generation!==gbIdentityGeneration || user?.id!==next.id)return;
  await fetchProfile();
  if(next.is_anonymous)void gbUploadGuestStars();
 }catch(err){
  window.gbAccountReadyForPlay=false;
  console.warn('Cloud account initialization:',err);
  setMessage('gbpr-auth-status','Could not load your account from Supabase. Reconnect or sign in again. '+(err?.message||''));
 }
}
async function connect(){
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data:sessionData,error:sessionError}=await sb.auth.getSession();
  if(sessionError)throw sessionError;
  let startupUser=sessionData?.session?.user||null;
  if(startupUser){
   const {data:verified,error:verifyError}=await sb.auth.getUser();
   if(verifyError){
    // A temporary network/token problem is NOT a reason to create a guest.
    setMessage('gbpr-auth-status','Account verification unavailable. Reconnect to restore your session.');
    throw verifyError;
   }
   startupUser=verified?.user||null;
  }
  sb.auth.onAuthStateChange((event,session)=>{
   if(event==='TOKEN_REFRESHED')return;
   const next=session?.user||null;
   if(next?.id===user?.id&&window.gbAccountReadyForPlay)return;
   // Run Supabase operations outside the auth callback to avoid auth-lock deadlocks.
   setTimeout(()=>void gbSwitchIdentity(next),0);
  });
  if(!startupUser){
   // Never silently replace an existing registered account with a guest.
   if(localStorage.getItem(gbRememberedRegisteredKey)){
    window.gbAccountReadyForPlay=false;
    setMessage('gbpr-auth-status','Your account needs sign-in. Existing progress is preserved.');
    refresh();return;
   }
   // First-time visitors may still use isolated guest sessions.
   const result=await sb.auth.signInAnonymously();
   if(result.error)throw result.error;
   startupUser=result.data?.user||null;
  }
  if(startupUser)await gbSwitchIdentity(startupUser);
  else refresh();
 }catch(err){
  window.gbAccountReadyForPlay=false;
  setMessage('gbpr-auth-status','Could not verify cloud identity. Your game data has not been deleted.');
  console.warn('Gore Burst profile connection:',err);
 }
}
// Social backend: registered accounts only. Guest play and game saves remain unchanged.
const gbprSocialMessage=(text)=>`<div class="gbpr-social-empty">${safe(text)}</div>`;
const gbprSocialAvatar=r=>{let url=fallbackAvatar;try{url=window.gbGhostAvatarUrl?.(r)||avatarFile(avatarIndex(r?.avatar_key))}catch{}return safe(url)};
async function gbprOpenPublicProfile(targetId){
 if(!sb||!gbprRegistered()||!targetId)return;
 prNavigate('public');
 const host=$p('gbpr-public-content');host.textContent='Opening carnival profile…';
 const {data,error}=await sb.rpc('gb_friend_public_profile',{p_friend:targetId});
 if(prCurrent!=='public')return;
 if(error||!data?.length){host.textContent=error?.message||'Profile unavailable.';return}
 const r={...data[0]};
 const [matchedFrame]=await gbpfPublicFrames([{user_id:targetId}]);
 if(matchedFrame)r.equipped_frame=matchedFrame.equipped_frame;
 if(prCurrent!=='public')return;
 host.innerHTML=`<span class="gbpf-public-wrap"><img class="gbpr-public-avatar" src="${gbprSocialAvatar(r)}" alt="Player avatar">${gbpfFile(gbpfNormalize(r.equipped_frame))?'<img class="gbpf-overlay" src="'+gbpfFile(gbpfNormalize(r.equipped_frame))+'" alt="">':''}</span><h3>${safe(r.display_name||'Carnival Guest')}</h3><p class="gbpr-public-handle">@${safe(r.username||'unknown')}</p><div class="gbpr-public-stats"><div><small>LEVEL</small><strong>${Math.max(1,Math.min(100000,Number(r.player_level)||1))}</strong></div><div><small>STARS</small><strong>${Math.max(0,Math.min(300000,Number(r.total_stars)||0))} ★</strong></div></div>`;
}
prPublicScreen.querySelector('#gbpr-public-back').onclick=()=>prNavigate('friends');
const gbprFriendCard=(r,actions)=>`<div class="gbpr-social-card"><span class="gbpf-social-avatar"><img src="${gbprSocialAvatar(r)}" alt="">${gbpfFile(gbpfNormalize(r.equipped_frame))?`<img class="gbpf-social-frame" src="${gbpfFile(gbpfNormalize(r.equipped_frame))}" alt="">`:``}</span><span><b>${safe(r.display_name||'Carnival Guest')}</b><small>@${safe(r.username||'unknown')}</small></span><div class="gbpr-social-card-actions">${actions}</div></div>`;
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
let gbprHiddenMailIds=new Set();
async function gbprHideMail(id){
 const m=gbprMailItems.find(x=>x.id===id);
 if(!m||!sb||!user)return;
 if((m.category==='event_reward'||m.source_event==='welcome_gift'||m.source_event==='reward_claim_test')&&!m.claimed_at){
  await gbprAlert('Claim your reward before deleting this letter.');return;
 }
 if(!await gbprConfirm('Delete this letter from your inbox? This cannot be undone.'))return;
 const result=await sb.rpc('gb_hide_my_mail',{p_id:id,p_broadcast:m.category==='admin_broadcast'});
 if(result.error){await gbprAlert('Could not delete: '+result.error.message);return;}
 gbprHiddenMailIds.add(id);
 gbprMailItems=gbprMailItems.filter(x=>x.id!==id);
 gbprDrawMailList();
 void gbprRefreshMailDot();
 await gbprAlert('Letter deleted from your inbox.');
}
function gbprMailPendingCheck(m){return (m.category==='event_reward'&&!m.claimed_at)||!m.read_at;}
async function gbprRefreshMailDot(){
 const button=prHub?.querySelector('[data-gbpr-nav="mail"]');
 if(!sb||!user){gbprMailPending=false;button?.classList.remove('gbpr-mail-pending');gbprUpdatePfpNotice();return;}
 const [{data,error},hidden]=await Promise.all([sb.from('gb_inbox').select('id,category,claimed_at,read_at').eq('recipient',user.id).limit(100),sb.rpc('gb_get_hidden_mail')]);
 if(!hidden.error)gbprHiddenMailIds=new Set(hidden.data||[]);
 if(error)return;
 gbprMailPending=!!data?.filter(x=>!gbprHiddenMailIds.has(x.id)).some(gbprMailPendingCheck);
 if(gbprRegistered()){
  const announcements=await sb.rpc('gb_read_announcements');
  if(!announcements.error&&announcements.data?.some(a=>!a.read_at&&!gbprHiddenMailIds.has(a.id)))gbprMailPending=true;
 }
 button?.classList.toggle('gbpr-mail-pending',gbprMailPending);
 gbprUpdatePfpNotice();
}
async function gbprLoadMail(){
 const host=$p('gbpr-mail-list');if(!host)return;
 if(!user){host.innerHTML=gbprSocialMessage('Sign in to see official mail.');return}
 if(!sb){host.innerHTML=gbprSocialMessage('Connecting…');return}
 host.textContent='Loading mail…';
 const [mail,announcements,hidden]=await Promise.all([
  sb.from('gb_inbox').select('id,title,body,category,created_at,claimed_at,read_at,source_event,reward').eq('recipient',user.id).order('created_at',{ascending:false}).limit(60),
  gbprRegistered()?sb.rpc('gb_read_announcements'):Promise.resolve({data:[],error:null}),
  sb.rpc('gb_get_hidden_mail')
 ]);
 if(!host.isConnected)return;
 if(mail.error){host.innerHTML=gbprSocialMessage('Mailbox unavailable: '+mail.error.message);return;}
 if(announcements.error){console.warn('Broadcast mailbox:',announcements.error.message);}
 if(!hidden.error)gbprHiddenMailIds=new Set(hidden.data||[]);
 const broadcasts=(announcements.error?[]:announcements.data||[]).map(a=>({
  id:a.id,title:a.title,body:a.body,created_at:a.created_at,read_at:a.read_at,
  category:'admin_broadcast',source_event:'admin_broadcast',claimed_at:null,reward:null
 }));
 gbprMailItems=[...(mail.data||[]),...broadcasts].filter(m=>!gbprHiddenMailIds.has(m.id)).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,100);
 void gbprRefreshMailDot();
 gbprDrawMailList();
}
// Visual-only rewards: display actual Gore Burst item icons from the attached server reward.
// Does not issue or alter a single prize.
function gbprEventRewardIcons(reward){
 if(!reward||typeof reward!=='object'||Array.isArray(reward))return '';
 const specs=[
  ['coins','assets/coin-skull-new.png','Skull Coins'],
  ['RV','assets/rocket-h.png','Rocket'],
  ['CB','assets/clownbomb.png','Clownbomb'],
  ['FW','assets/ferris.png','Ferris Wheel'],
  ['hammer','assets/booster-hammer.webp','Circus Hammer'],
  ['watch','assets/booster-watch.webp',"Mr. Walker's Watch"],
  ['cards','assets/booster-cards.webp','Art of Distraction'],
  ['musicbox','assets/booster-musicbox.webp','Surprise Music Box']
 ];
 const items=specs.filter(([key])=>Number.isSafeInteger(reward[key])&&reward[key]>0).map(([key,src,name])=>
  `<span class="gbpr-event-loot-item"><img src="${src}" alt="${safe(name)}" loading="lazy"><span>${Number(reward[key]).toLocaleString()}${key==='coins'?'':' ×'}</span></span>`
 ).join('');
 return items?`<div class="gbpr-event-loot-grid" aria-label="Event reward items">${items}</div>`:'';
}
function gbprDrawMailList(){
 const host=$p('gbpr-mail-list');if(!host)return;
 if(!gbprMailItems.length){host.innerHTML=gbprSocialMessage('No mail yet.');return}
 host.innerHTML=gbprMailItems.map(m=>`<div class="gbpr-inbox-entry"><button type="button" class="gbpr-inbox-row ${gbprMailPendingCheck(m)?'gbpr-inbox-unread':''}" data-mail-open="${m.id}"><span class="gbpr-inbox-envelope">✉</span><span class="gbpr-inbox-title"><b>${safe(m.title)}</b><small>${m.source_event==='welcome_gift'||m.category==='admin_broadcast'?'A letter from Mr. Walker':'Official Carnival Mail'}</small></span><span class="gbpr-inbox-status">${m.category==='event_reward'&&!m.claimed_at?'<i class="gbpr-mail-dot"></i>':!m.read_at?'<i class="gbpr-mail-dot"></i>':'›'}</span></button><button type="button" class="gbpr-mail-delete" data-mail-delete="${m.id}" aria-label="Delete ${safe(m.title)}" title="Delete letter" ${((m.category==='event_reward'||m.source_event==='welcome_gift'||m.source_event==='reward_claim_test')&&!m.claimed_at)?'disabled title="Claim reward first"':''}>✕</button></div>`).join('');
 host.querySelectorAll('[data-mail-open]').forEach(b=>b.onclick=()=>gbprOpenMail(b.dataset.mailOpen));
 host.querySelectorAll('[data-mail-delete]').forEach(b=>b.onclick=()=>gbprHideMail(b.dataset.mailDelete));
}
async function gbprOpenMail(id){
 const m=gbprMailItems.find(x=>x.id===id);if(!m)return;
 const host=$p('gbpr-mail-list');
 if(!m.read_at){
  const {error}=m.category==='admin_broadcast'
   ?await sb.rpc('gb_mark_announcement_read',{p_id:m.id})
   :await sb.rpc('gb_mail_mark_read',{p_mail:m.id});
  if(!error)m.read_at=new Date().toISOString();
  void gbprRefreshMailDot();
 }
 const welcome=m.source_event==='welcome_gift';
 const broadcast=m.category==='admin_broadcast';
 const testCoins=m.source_event==='reward_claim_test' && m.reward?.coins===100;
 const eventAward=m.category==='event_reward' && !welcome && !testCoins;
 host.innerHTML=`<div class="gbpr-open-letter ${welcome?'gbpr-welcome-mail':''}"><button type="button" class="gbpr-btn secondary gbpr-letter-back" id="gbpr-mail-back">‹ INBOX</button><div class="gbpr-tag">${welcome?'✦ AN OFFICIAL INVITATION ✦':broadcast?'✦ A LETTER FROM MR. WALKER ✦':'OFFICIAL MAIL'}</div><h3>${safe(m.title)}</h3><small>${new Date(m.created_at).toLocaleDateString()}</small><p>${safe(m.body)}</p>${welcome?`<div class="gbpr-welcome-gifts"><div><span>♥</span><b>UNLIMITED LIVES</b><small>1 HOUR</small></div><div><img src="assets/rocket-h.png" alt="Rocket"><b>ROCKET</b><small>×1</small></div><div><img src="assets/clownbomb.png" alt="Clownbomb"><b>CLOWNBOMB</b><small>×1</small></div><div><img src="assets/ferris.png" alt="Ferris Wheel"><b>FERRIS WHEEL</b><small>×1</small></div></div><button type="button" class="gbpr-btn gbpr-welcome-claim" id="gbpr-letter-claim" ${m.claimed_at?'disabled':''}>${m.claimed_at?'CLAIMED':'✦ CLAIM MY GIFTS ✦'}</button>`:testCoins?`<div class="gbpr-test-prize"><img src="assets/coin-skull-new.png" alt="Skull Coins"><strong>100 SKULL COINS</strong></div><button type="button" class="gbpr-btn gbpr-test-claim" id="gbpr-test-claim" ${m.claimed_at?'disabled':''}>${m.claimed_at?'CLAIMED':'✦ CLAIM 100 COINS ✦'}</button><button type="button" class="gbpr-btn secondary" id="gbpr-test-sync" ${!m.claimed_at?'hidden':''}>SYNC CLAIMED GIFT TO THIS DEVICE</button><p class="gbpr-muted" id="gbpr-test-status">${m.claimed_at?'CLAIMED':''}</p>`:eventAward?`${gbprEventRewardIcons(m.reward)||'<div class="gbpr-test-prize"><strong>EVENT PRIZE</strong></div>'}<button type="button" class="gbpr-btn gbpr-test-claim" id="gbpr-event-award-claim" ${m.claimed_at?'disabled':''}>${m.claimed_at?'CLAIMED':'✦ CLAIM EVENT PRIZE ✦'}</button><p class="gbpr-muted" id="gbpr-event-award-status">${m.claimed_at?'CLAIMED':''}</p>`:''}</div>`;
 host.querySelector('#gbpr-mail-back').onclick=gbprDrawMailList;
 const eventClaim=host.querySelector('#gbpr-event-award-claim');
 if(eventClaim)eventClaim.onclick=async()=>{
   const status=host.querySelector('#gbpr-event-award-status');
   if(!sb||!user){status.textContent='Please sign in first.';return}
   eventClaim.disabled=true;eventClaim.textContent='VERIFYING PRIZE…';
   try{
     const {data,error}=await sb.rpc('gb_claim_event_mail',{p_mail:m.id});
     if(error)throw error;
     const result=Array.isArray(data)?data[0]:null;
     if(!result?.award_id)throw Error('No verified award returned.');
     m.claimed_at=new Date().toISOString();eventClaim.textContent='CLAIMED';
     status.textContent='Prize claimed! Updating your game inventory…';
     const sync=await gbRewardCheck({automatic:true,statusElement:status});
     if(!sync?.applied)status.textContent='Prize saved. If your inventory has not refreshed, reopen the game.';
     void gbprRefreshMailDot();
   }catch(err){eventClaim.disabled=false;eventClaim.textContent='✦ CLAIM EVENT PRIZE ✦';status.textContent='Claim unavailable: '+(err.message||'Not approved yet');}
 };

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
   const syncBtn=host.querySelector('#gbpr-test-sync');if(syncBtn)syncBtn.hidden=false;
   status.textContent='Server credit confirmed. Supabase Skull Coins: '+Number(result.new_coin_balance).toLocaleString()+'. Tap SYNC to add the claimed reward to this device once.';
   void gbprRefreshMailDot();
  }catch(err){testClaim.disabled=false;testClaim.textContent='✦ CLAIM 100 COINS ✦';status.textContent='Claim not confirmed: '+(err.message||'Unknown error');}
 };

 const testSync=host.querySelector('#gbpr-test-sync');
 if(testSync)testSync.onclick=async()=>{
   const status=host.querySelector('#gbpr-test-status');
   testSync.disabled=true;
   try{
     if(!user||!sb)throw Error('Sign in with the account that claimed this reward.');
     const uid=user.id;
     const bound=localStorage.getItem('gb-cloud-device-account-v2');
     if(bound&&bound!==uid)throw Error('This device save is linked to another player. Open Account → CHECK CLOUD SAVE first; no coins were changed.');
     const {data,error}=await sb.rpc('gb_test_claim_receipt',{p_mail:m.id});
     if(error)throw error;
     const receipt=Array.isArray(data)?data[0]:null;
     if(!receipt||receipt.reward_coins!==100||!receipt.completed_at||!receipt.award_id)throw Error('The server has not confirmed this exact 100-coin claim.');
     const key='gb-playable-v4',raw=localStorage.getItem(key);
     if(!raw)throw Error('No local game save found; no coins changed.');
     const snap=JSON.parse(raw);
     if(!snap||typeof snap!=='object'||Array.isArray(snap)||!Number.isInteger(Number(snap.current))||Number(snap.current)<1)throw Error('Invalid local save; no coins changed.');
     const receipts=(snap.gbServerRewardReceipts&&typeof snap.gbServerRewardReceipts==='object'&&!Array.isArray(snap.gbServerRewardReceipts))?snap.gbServerRewardReceipts:{};
     const receiptKey=uid+':'+receipt.award_id;
     if(receipts[receiptKey]){status.textContent='Already synchronized to this device; no extra coins added.';testSync.textContent='ALREADY SYNCED';return;}
     const coins=Number(snap.coins);
     if(!Number.isSafeInteger(coins)||coins<0||coins>2000000000)throw Error('Unexpected coin balance; no coins changed.');
     const confirmed=await gbprConfirm('Add the 100 already-claimed Skull Coins to THIS device’s current '+coins.toLocaleString()+'-coin save? The game will reload. Only do this on your second account.');
     if(!confirmed)return;
     const backupKey='gb-before-claim-sync:'+uid+':'+receipt.award_id;
     // Do not overwrite an existing safety copy.
     if(localStorage.getItem(backupKey)===null)localStorage.setItem(backupKey,raw);
     snap.coins=coins+100;
     snap.gbServerRewardReceipts={...receipts,[receiptKey]:{amount:100,completed_at:receipt.completed_at}};
     localStorage.setItem(key,JSON.stringify(snap));
     // Existing authorized cloud backups will upload this new receipt after reload.
     // Otherwise the account screen requires explicit CHECK CLOUD SAVE review.
     try{sessionStorage.setItem('gb-post-test-sync-cloud-review',uid)}catch(_){}
     location.reload();
   }catch(err){status.textContent='Sync stopped: '+(err.message||'Unknown error')}
   finally{testSync.disabled=false}
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
  }catch(e){claim.disabled=false;claim.textContent='✦ CLAIM MY GIFTS ✦';void gbprAlert(e.message||'Claim failed')}
 };
}
async function gbprLoadFriends(){
 const host=$p('gbpr-friend-list');if(!host||!gbprRegistered()||!profile?.username||!sb)return;
 host.textContent='Loading friends…';
 const {data,error}=await sb.rpc('gb_friend_list');if(!host.isConnected)return;
 if(error){host.innerHTML=gbprSocialMessage('Friends unavailable. Complete the social SQL setup first.');return}
 if(!data?.length){host.innerHTML=gbprSocialMessage('No friends or pending requests yet.');return}
 const frameRecords=await gbpfPublicFrames(data.map(r=>({user_id:r.other_id||r.user_id||r.id})));
 const frameMap=new Map(frameRecords.map(r=>[String(r.id),r.equipped_frame]));
 data.forEach(r=>{r.equipped_frame=frameMap.get(String(r.other_id||r.user_id||r.id))||r.equipped_frame});
 host.innerHTML=data.map(r=>gbprFriendCard(r,r.kind==='incoming'?`<button data-gbpr-action="accept" data-id="${r.link_id}">ACCEPT</button><button data-gbpr-action="decline" data-id="${r.link_id}">DECLINE</button>`:r.kind==='outgoing'?`<button data-gbpr-action="remove" data-id="${r.link_id}">CANCEL</button>`:`<button data-gbpr-view="${r.other_id}">VIEW PROFILE</button><button data-gbpr-action="remove" data-id="${r.link_id}">REMOVE</button>`)).join('');
 host.querySelectorAll('[data-gbpr-view]').forEach(b=>b.onclick=()=>gbprOpenPublicProfile(b.dataset.gbprView));
 host.querySelectorAll('[data-gbpr-action]').forEach(b=>b.onclick=async()=>{b.disabled=true;const {error}=await sb.rpc('gb_friend_action',{p_link:b.dataset.id,p_action:b.dataset.gbprAction});if(error)await gbprAlert(error.message);await gbprLoadFriends();await gbprRefreshRequestDot()});
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
 host.querySelectorAll('[data-gbpr-add]').forEach(b=>b.onclick=async()=>{b.disabled=true;const {data,error}=await sb.rpc('gb_friend_request',{p_target:b.dataset.gbprAdd});if(error){await gbprAlert(error.message);b.disabled=false}else{b.textContent='SENT';await gbprLoadFriends()}});
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
// Reward receipts are monotonic: an older save must never erase a confirmed claim.
function claimReceipts(snapshot){
  const x=snapshot?.gbServerRewardReceipts;
  return x&&typeof x==='object'&&!Array.isArray(x)?x:{};
}
function retainsClaimReceipts(candidate,baseline){
  const have=claimReceipts(candidate), required=claimReceipts(baseline);
  return Object.keys(required).every(k=>
    Object.prototype.hasOwnProperty.call(have,k) &&
    saveFingerprint(have[k])===saveFingerprint(required[k])
  );
}

// Generic completed-event claim receipts. Does not approve or pay event awards.
// Important: a receipt cannot prove whether its rewards were already included in
// an unrelated older save; ambiguous accounts must be reviewed before merge.
let gbRewardSyncBusy=false;
async function gbRewardCheck(options={}){
 const automatic=!!options?.automatic;
 const out=options?.statusElement||$p('gbpr-rewards-status'),btn=$p('gbpr-rewards-check');
 if(!out)return {applied:false,message:'Sync panel unavailable.'};
 if(gbRewardSyncBusy)return {applied:false,message:'Sync already in progress.'};
 gbRewardSyncBusy=true;if(btn)btn.disabled=true;out.textContent='Checking verified claims…';
 try{
   if(!user||!sb)throw Error('Sign in to check claimed rewards.');
   const uid=user.id;
   const bound=localStorage.getItem(cloudBindingKey);
   if(bound!==uid)throw Error('This save is not confirmed for this account. Open CHECK CLOUD SAVE and link this device before syncing.');
   const raw=localStorage.getItem('gb-playable-v4');
   if(!raw)throw Error('No existing game save on this device.');
   const snap=validSnapshot(JSON.parse(raw));
   const {data,error}=await sb.rpc('gb_completed_reward_receipts');
   if(error)throw error;
   if(user.id!==uid)throw Error('Account changed. Try again.');
   const rewards=Array.isArray(data)?data:[];
   const receipts=claimReceipts(snap);
   const missing=rewards.filter(r=>r.award_id && !receipts[uid+':'+r.award_id]);
   if(!missing.length){out.textContent='All completed event claims are already recorded on this device.';return {applied:true,alreadyRecorded:true}}
   const amounts={coins:0,RV:0,CB:0,FW:0,hammer:0,watch:0,cards:0,musicbox:0};
   for(const row of missing){
     const reward=row.reward_data;
     if(!reward||typeof reward!=='object'||Array.isArray(reward))throw Error('Invalid reward receipt.');
     for(const [key,n] of Object.entries(reward)){
       if(!(key in amounts)||!Number.isSafeInteger(n)||n<0||n>1000000)throw Error('Unexpected reward type or amount: '+key);
       amounts[key]+=n;
     }
   }
   // A cloud snapshot that already contains a receipt indicates that the award
   // is already in cloud balances: restore/reconcile that save, never add twice.
   const cloud=await fetchCloudRecord(uid);
   if(cloud){
     const cloudReceipts=claimReceipts(cloud.snapshot);
     const overlap=missing.filter(r=>cloudReceipts[uid+':'+r.award_id]);
     if(overlap.length)throw Error('Some claims are already in your cloud save. Use CHECK CLOUD SAVE to reconcile; no rewards were added.');
     if(cloudAuthorized && Number(cloud.save_revision)!==Number(cloudKnownRevision??0))throw Error('Cloud changed elsewhere. Check Cloud Save before applying rewards.');
   }
   const coins=Number(snap.coins);
   if(!Number.isSafeInteger(coins)||coins<0)throw Error('Invalid local coin balance.');
   const pre={RV:0,CB:0,FW:0,...(snap.preSpecials||{})};
   const boosters={hammer:0,watch:0,cards:0,musicbox:0,...(snap.boosterInventory||{})};
   const summary=Object.entries(amounts).filter(([,n])=>n>0).map(([k,n])=>k+' ×'+n).join(' · ')||'No items';
   out.textContent=missing.length+' confirmed claim(s) need review: '+summary;
   if(!automatic && !await gbprConfirm('Add these '+missing.length+' completed claim(s) to THIS device exactly once? '+summary+'\n\nOnly continue if you have not already received these items through another restore or manual sync. A local safety copy will be saved.'))return {applied:false,message:'Sync cancelled.'};
   // Require a stable local snapshot across the asynchronous server checks.
   if(localStorage.getItem('gb-playable-v4')!==raw||user.id!==uid)throw Error('Game save changed during review. Please check again.');
   const next=structuredClone(snap);
   next.coins=coins+amounts.coins;
   next.preSpecials={...pre,RV:Number(pre.RV)+amounts.RV,CB:Number(pre.CB)+amounts.CB,FW:Number(pre.FW)+amounts.FW};
   next.boosterInventory={...boosters,hammer:Number(boosters.hammer)+amounts.hammer,watch:Number(boosters.watch)+amounts.watch,cards:Number(boosters.cards)+amounts.cards,musicbox:Number(boosters.musicbox)+amounts.musicbox};
   for(const val of [next.coins,...Object.values(next.preSpecials),...Object.values(next.boosterInventory)])if(!Number.isSafeInteger(val)||val<0)throw Error('Unsafe resource amount; no changes made.');
   const marked={...receipts};
   for(const r of missing)marked[uid+':'+r.award_id]={reward:r.reward_data,completed_at:r.completed_at};
   next.gbServerRewardReceipts=marked;
   const backup='gb-before-event-sync:'+uid+':'+Date.now();
   localStorage.setItem(backup,raw);
   localStorage.setItem('gb-playable-v4',JSON.stringify(next));
   try{sessionStorage.setItem('gb-post-test-sync-cloud-review',uid)}catch(_){}
   location.reload();
   return {applied:true};
 }catch(e){const message='Sync stopped safely: '+(e?.message||'Unknown error');out.textContent=message;return {applied:false,message}}
 finally{gbRewardSyncBusy=false;if(btn)btn.disabled=false}
}
$p('gbpr-rewards-check').onclick=gbRewardCheck;

function localDominatesCloud(local,cloud){
  // Only used for the SAME ACCOUNT already authorized to auto-backup on this device.
  // Never reduce the cloud's unlocked level or per-level best-star records.
  if(Number(local.current||1)<Number(cloud.current||1))return false;
  const lb=local.best||{},cb=cloud.best||{};
  if(!Object.keys(cb).every(k=>Number(lb[k]||0)>=Number(cb[k]||0)))return false;
  // Keep historical best coin-reward records from disappearing as well.
  const lbc=local.bestCoins||{},cbc=cloud.bestCoins||{};
  if(!Object.keys(cbc).every(k=>Number(lbc[k]||0)>=Number(cbc[k]||0)))return false;
  return retainsClaimReceipts(local,cloud);
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
// A new browser/guest shell can be replaced without discarding gameplay progress.
// Do not auto-restore a device with any earned stars, level advancement, items,
// claimed receipts, or a save bound to a different account.
function gbprFreshGameShell(snapshot){
  if(Number(snapshot?.current||1)!==1)return false;
  if(Object.keys(snapshot?.best||{}).some(k=>Number(snapshot.best[k])>0))return false;
  if(Object.keys(snapshot?.bestCoins||{}).some(k=>Number(snapshot.bestCoins[k])>0))return false;
  if(Object.keys(claimReceipts(snapshot)).length)return false;
  // Wallet coins are now server-owned; a newly signed-in Level 1 browser can
  // already display the real Supabase balance without having any level progress.
  // Do not mistake those cloud coins for local gameplay advancement.
  // Preserve every meaningful local item/receipt/progression safeguard below.
  if(Object.values(snapshot?.preSpecials||{}).some(v=>Number(v)>0))return false;
  if(Object.values(snapshot?.boosterInventory||{}).some(v=>Number(v)>0))return false;
  if(Object.values(snapshot?.boosterGrants||{}).some(Boolean))return false;
  if(snapshot?.preSpecialsGranted)return false;
  return true;
}
// Read-only wallet lookup is mandatory before restoring. A stale snapshot coin
// field must not replace the server-owned Skull Coin balance.
async function gbprAutoRestoreFresh(uid,local,cloud){
  if(!cloud || !gbprFreshGameShell(local))return false;
  const bound=localStorage.getItem(cloudBindingKey);
  if(bound && bound!==uid)return false;
  const oldRaw=localStorage.getItem('gb-playable-v4');
  const snapshot=validSnapshot(cloud.snapshot);
  if(!retainsClaimReceipts(snapshot,local))return false;
  const {data:wallet,error:walletError}=await sb.from('player_inventory')
    .select('skull_coins').eq('player_id',uid).maybeSingle();
  if(walletError||!wallet)throw Error('Cloud wallet unavailable. Automatic progress restore paused.');
  const cloudCoins=Number(wallet.skull_coins);
  if(!Number.isSafeInteger(cloudCoins)||cloudCoins<0)throw Error('Invalid cloud wallet. Automatic restore paused.');
  // Re-check the revision so a newer cloud save is never replaced by an old one.
  const latest=await fetchCloudRecord(uid);
  if(!latest||Number(latest.save_revision)!==Number(cloud.save_revision))throw Error('Cloud progress changed. Tap CHECK CLOUD SAVE.');
  if(!user||user.id!==uid||localStorage.getItem('gb-playable-v4')!==oldRaw)
    throw Error('Account or browser save changed. Automatic restore paused.');
  const latestSnapshot=validSnapshot(latest.snapshot);
  if(!retainsClaimReceipts(latestSnapshot,local))return false;
  const key='gb-cloud-before-auto-restore:'+uid+':'+Date.now();
  localStorage.setItem(key,JSON.stringify(local)); // recoverable safety copy
  const restored={...latestSnapshot,coins:cloudCoins};
  localStorage.setItem('gb-playable-v4',JSON.stringify(restored));
  rememberCloudBaseline(uid,latestSnapshot,latest.save_revision);
  cloudEnableForAccount();
  cloudStatus('Your account progress is loading automatically…',true);
  location.reload(); // main-game state is initialized on page load
  return true;
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
    // A truly empty browser must restore the signed-in account's COMPLETE cloud
    // snapshot before the claim-receipt guard. That guard protects meaningful
    // existing saves; it must not prevent a blank device from acquiring receipts
    // and level progress already present on its own cloud account.
    const initialBound=localStorage.getItem(cloudBindingKey);
    if(cloud && (!initialBound || initialBound===uid) && gbprFreshGameShell(local) &&
       (Number(cloud.snapshot.current||1)>1 || Object.keys(cloud.snapshot.best||{}).length>0 ||
        Object.keys(claimReceipts(cloud.snapshot)).length>0)){
      if(await gbprAutoRestoreFresh(uid,local,cloud))return;
    }
    // If another device already saved a claimed reward, pause rather than
    // overwriting it with this device's older local snapshot.
    if(cloud && !retainsClaimReceipts(local,cloud.snapshot)){
      cloudAuthorized=false;
      cloudCandidate=cloud;
      cloudKnownRevision=Number(cloud.save_revision);
      showCloudChoices(local,cloud,'This device is missing reward claims saved in the cloud. Restore the cloud copy or reconcile your game save before uploading.');
      $p('gbpr-cloud-use-local').disabled=true;
      cloudStatus('Cloud has claimed rewards missing here. Upload blocked to protect them.');
      return;
    }
    $p('gbpr-cloud-use-local').disabled=false;
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
          localStorage.getItem(cloudSaveKey+':'+uid)==='true' &&
          localDominatesCloud(local,cloud.snapshot)){
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
  finally{
    cloudChecking=false;
    if(canAutoBackup()){
      queueCloudUpload();
      // Once cloud identity has been checked, re-read shop receipts. Delayed
      // delivery is safe here because sync() independently checks binding.
      // A pending location.reload() cancels this timer on fresh-device restore.
      const expectedUid=uid;
      setTimeout(()=>{
        if(user?.id===expectedUid && canAutoBackup())
          void window.gbShopApi?.sync().catch(e=>console.warn('Shop receipt sync:',e?.message||e));
      },1000);
    }
  }
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
    if(!await gbprConfirm('Restore the cloud save ('+saveSummary(candidate)+') onto THIS device? Your current device save will be downloaded and retained as a local safety copy. The game will reload.'))return;
    // Check that cloud hasn't been changed by another device since comparison.
    const latest=await fetchCloudRecord(uid);
    if(!user||user.id!==uid)throw Error('Account changed. Please retry.');
    if(!latest||Number(latest.save_revision)!==Number(cloudCandidate.save_revision))throw Error('Cloud backup changed since review. Check Cloud Save again.');
    if(!retainsClaimReceipts(candidate,current))throw Error('Restore blocked: the cloud copy lacks rewards already claimed on this device. Keep this save and reconcile first.');
    downloadBackup(current,'before-restore');
    const safeKey='gb-cloud-pre-restore:'+uid+':'+Date.now();
    localStorage.setItem(safeKey,JSON.stringify(current));
    // Never let an old cloud backup replace the device's coin field during wallet migration.
    // Coin balance authority is public.player_inventory, not a cloud backup snapshot.
    // Other restored progress and reward receipts retain their normal safeguards.
    const protectedCoinValue=Number(current.coins);
    if(!Number.isSafeInteger(protectedCoinValue)||protectedCoinValue<0)
      throw Error('Current device coin value is invalid. Restore cancelled.');
    const restored={...candidate,coins:protectedCoinValue};
    localStorage.setItem('gb-playable-v4',JSON.stringify(restored));
    rememberCloudBaseline(uid,latest.snapshot,latest.save_revision);cloudEnableForAccount();cloudStatus('Restored game progress without replacing device coins. Reloading…',true);
    location.reload();
  }catch(e){cloudStatus('Restore stopped safely: '+(e.message||'Unknown error'))}
};
$p('gbpr-cloud-use-local').onclick=async()=>{
  if(!user||!sb)return;
  try{
    const local=readLocalGameSave();const uid=user.id;
    if(!await gbprConfirm("Use this device's save ("+saveSummary(local)+") as the cloud backup? "+(cloudCandidate?'This REPLACES the existing cloud copy after another check.':'This creates the first cloud backup.')+' It does not add verified leaderboard stars.'))return;
    const latest=await fetchCloudRecord(uid);
    if(!user||user.id!==uid)throw Error('Account changed. Check again.');
    if(latest && !localDominatesCloud(local,latest.snapshot))
      throw Error('Upload blocked: this device is behind the cloud in level, stars, best rewards or claim receipts. Keep the newer cloud save; use CHECK CLOUD SAVE to compare.');
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
    if(existing && !localDominatesCloud(snapshot,existing.snapshot)){
      // This check also covers the manual 'REPLACE CLOUD WITH THIS DEVICE' action.
      // Do not retry a regressed snapshot: it cannot safely replace cloud progress.
      cloudAuthorized=false;
      cloudStatus('Cloud upload blocked: this device is behind saved level, stars, best rewards or claim receipts. CHECK CLOUD SAVE to compare without overwriting progress.');
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
window.gbCloudSaveNow=()=>gbprRegistered()&&window.gbAccountReadyForPlay&&canAutoBackup()?cloudUpload(true):Promise.resolve(false);
window.gbCloudReady=()=>{if(gbprRegistered()&&window.gbAccountReadyForPlay&&canAutoBackup())queueCloudUpload();};
refresh();connect();


// Ghost Parade: authenticated read-only database queries.
// Ghost Parade beta uses best stars synced from private backups; not anti-cheat verified.
// Guest Ghost Parade beta scores: server tracks each level's best stars once.
// Kept separate from cloud saves and prizes; browser-supplied stars are not anti-cheat verified.
let gbGuestStarsUploading=false,gbGuestStarsQueued=false;
async function gbUploadGuestStars(){
 if(!sb||!user||!gbprIsGuest()||gbGuestStarsUploading||!window.gbAccountReadyForPlay||localStorage.getItem(gbGuestOwnerKey)!==user.id||gbInstalledOwner())return;
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
  const [registered,guests,simulated]=await Promise.all([sb.rpc('ghost_parade_top10'),sb.rpc('gb_guest_stars_top10'),sb.rpc('gb_bot_ghost_parade')]);
  if(registered.error)return {error:'Leaderboard query failed: '+registered.error.message};
  if(guests.error)return {error:'Guest leaderboard setup required: '+guests.error.message};
  if(simulated.error)return {error:'Ghost Parade participants unavailable: '+simulated.error.message};
  const combined=new Map();
  for(const r of [...(registered.data||[]),...(guests.data||[]),...(simulated.data||[])]){
    const id=String(r.user_id||r.player_id||r.id||(r.is_bot?'bot-'+r.display_name:'guest-'+r.display_name));
    const prev=combined.get(id);
    if(!prev||Number(r.total_stars||0)>Number(prev.total_stars||0))combined.set(id,r);
  }
  const sorted=[...combined.values()].sort((a,b)=>Number(b.total_stars||0)-Number(a.total_stars||0)).slice(0,10).map((r,i)=>({...r,rank_position:i+1}));
  return {rows:sorted,backup:null};
};

// Display-only leaderboard frame enrichment. Never writes a score or a profile.
// RPC rows may have different account-id keys; guest rows have no registered frame.
// Read-only public frame lookup. Matching uses account IDs first, then unique usernames,
// then unique avatar storage paths; nonunique display names are never guessed.
async function gbpfPublicFrames(rows){
 if(!sb||!Array.isArray(rows)||!rows.length)return [];
 const idOf=r=>String(r.user_id||r.player_id||r.profile_id||r.account_id||r.id||'');
 const valid=s=>/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(s);
 const uniq=arr=>[...new Set(arr.filter(Boolean))];
 const ids=uniq(rows.map(idOf).filter(valid));
 const usernames=uniq(rows.map(r=>String(r.username||'').replace(/^@/,'').trim().toLowerCase()));
 const paths=uniq(rows.map(r=>String(r.avatar_path||'').trim()));
 const names=uniq(rows.map(r=>String(r.display_name||'').trim()));
 try{
  const {data,error}=await sb.rpc('gb_public_frame_lookup',{p_ids:ids,p_usernames:usernames,p_avatar_paths:paths,p_display_names:names});
  if(!error&&Array.isArray(data))return data;
  // This can be a version mismatch before the optional SQL is installed.
 }catch(_){}
 return [];
}
window.gbLeaderboardAddFrames=async function(rows){
 if(!Array.isArray(rows)||!rows.length)return rows||[];
 const candidates=await gbpfPublicFrames(rows);
 const idOf=r=>String(r.user_id||r.player_id||r.profile_id||r.account_id||r.id||'');
 const findUnique=(key,val)=>{
  if(!val)return null;
  const matches=candidates.filter(p=>String(p[key]||'').trim().toLowerCase()===String(val).trim().toLowerCase());
  return matches.length===1?matches[0]:null;
 };
 return rows.map(r=>{
  if(r.is_bot)return {...r,equipped_frame:gbpfNormalize(r.equipped_frame)};
  const id=idOf(r);
  const matched=findUnique('id',id)||findUnique('username',String(r.username||'').replace(/^@/,''))||findUnique('avatar_path',r.avatar_path)||findUnique('display_name',r.display_name);
  let selected=gbpfNormalize(matched?.equipped_frame??r.equipped_frame);
  if(selected==='none'&&user&&id===String(user.id))selected=gbpfCurrent();
  return {...r,equipped_frame:selected};
 });
};
window.gbLeaderboardAvatarHtml=function(r,avatarClass,escapeFn){
  const escape=typeof escapeFn==='function'?escapeFn:(v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'));
  const src=window.gbGhostAvatarUrl?.(r)||fallbackAvatar;
  const frame=gbpfFile(gbpfNormalize(r?.equipped_frame));
  return '<span class="gbpf-rank-avatar"><img class="'+avatarClass+'" src="'+escape(src)+'" alt="" loading="lazy">'+(frame?'<img class="gbpf-rank-overlay" src="'+escape(frame)+'" alt="" loading="lazy">':'')+'</span>';
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
  const {data,error}=await sb.rpc('gb_bot_clash_leaderboard');
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
// Weekly Nightmare progress is submitted only through a one-time server-issued stage session.
window.gbWeeklySessionStart=async function(stage){
 if(!sb||!user)throw new Error('Online player identity unavailable');
 const {data,error}=await sb.rpc('gb_weekly_session_start',{p_stage:Number(stage)});
 if(error)throw new Error(error.message);
 return data;
};
window.gbWeeklyVerifiedComplete=async function(session,stage){
 if(!sb||!user||!session)throw new Error('Weekly session missing');
 const {error}=await sb.rpc('gb_weekly_session_complete',{p_session:session,p_stage:Number(stage)});
 if(error)throw new Error(error.message);
 return {ok:true};
};
window.gbWeeklyTop10=async function(){if(!sb)return {rows:[],error:'Offline'};const {data,error}=await sb.rpc('gb_bot_weekly_leaderboard');return {rows:data||[],error:error?.message||null}};


// Server-issued Creepy Sudoku sessions (independent of visual Events UI).
window.gbSudokuVerifiedStart=async function(difficulty){
  if(!sb||!user)throw new Error('Online player session required');
  const {data,error}=await sb.rpc('gb_sudoku_session_start',{p_difficulty:difficulty});
  if(error)throw error;return data;
};
window.gbSudokuVerifiedFinish=async function(sessionId,board){
  if(!sb||!user)throw new Error('Online player session required');
  const {data,error}=await sb.rpc('gb_sudoku_session_finish',{p_session:sessionId,p_board:board});
  if(error)throw error;return data;
};

// Haunting Tetris score sessions; no UI artwork or CSS changes.
window.gbTetrisSessionStart=async function(){
  if(!sb||!user)return null;
  const {data,error}=await sb.rpc('gb_tetris_session_start');
  if(error)throw error;return data;
};
window.gbTetrisSessionScore=async function(sessionId,lines){
  if(!sb||!user||!sessionId)return;
  const n=Number(lines);if(!Number.isInteger(n)||n<1||n>4)return;
  const {error}=await sb.rpc('gb_tetris_session_score',{p_session:sessionId,p_lines:n});
  if(error)throw error;
};
