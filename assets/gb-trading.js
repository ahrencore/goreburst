/* Gore Burst friend-to-friend collectible trading.
   Requires SQL setup; no wallet, save, frame or leaderboard modifications. */
(()=>{'use strict';
const SB_URL='https://harqhhpobaepfkfeitmw.supabase.co';
const SB_KEY='sb_publishable_K9F36jgWZaMWywln6Wwaiw_4zJ7523C';
let dbPromise=null, currentCard=null, sending=false, claiming=false, activeTab='inbox';
let knownUid=null;
const $=s=>document.querySelector(s);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function db(){return dbPromise||(dbPromise=import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
 .then(({createClient})=>createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})));}
async function signed(){const client=await db();const {data,error}=await client.auth.getUser();if(error||!data.user)throw Error('Sign in to trade cards.');return [client,data.user];}
const sheet=document.createElement('style');sheet.textContent=`
#gb-profile-layer #gbpr-mail-list[hidden],#gb-profile-layer #gbtrade-mail-list[hidden],#gb-profile-layer #gbtrade-daily[hidden]{display:none!important}
#gb-profile-layer .gbtrade-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 10px}
#gb-profile-layer .gbtrade-tabs button{min-height:38px;border-radius:999px;background:#30163d;color:#e9c2fa;border:1px solid #9756a9;font-weight:800}
#gb-profile-layer .gbtrade-tabs button.active{border-color:#ff9cea;background:#6d2c76;color:white;box-shadow:0 0 8px #ec5bc875}
#gb-profile-layer .gbtrade-dot[hidden]{display:none!important}
/* One original HUD PFP dot for friends, normal mail, OR trades. No extra dot element. */
#menu .top.art-hud > #gbpr-pfp-request-dot.gbtrade-unclaimed[hidden]{display:block!important}
/* Reuse the existing Mailbox top-right pseudo-dot, never append a second dot. */
#gb-profile-layer #gbpr-hub.gbtrade-unclaimed .gbpr-hub-links button[data-gbpr-nav="mail"]{position:relative}
#gb-profile-layer #gbpr-hub.gbtrade-unclaimed .gbpr-hub-links button[data-gbpr-nav="mail"]::after{content:"";position:absolute;top:9px;right:12px;width:10px;height:10px;border-radius:50%;border:0;background:#ff193b;box-shadow:0 0 8px 2px #ff294e;pointer-events:none}
#gb-profile-layer .gbtrade-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff3a64;box-shadow:0 0 7px #ff3a64;margin:0 2px 1px 6px}
#gb-profile-layer .gbtrade-entry{display:flex;align-items:center;gap:10px;border:1px solid #a75cca;border-radius:14px;background:#271336;padding:10px;margin:9px 0}
#gb-profile-layer .gbtrade-entry img{width:56px;height:82px;object-fit:contain;flex-shrink:0}
#gb-profile-layer .gbtrade-entry .gbtrade-copy{min-width:0;flex:1;color:#f7d5f1;font-size:12px}
#gb-profile-layer .gbtrade-entry b{display:block;font-size:13px;color:#ffe2aa}
#gb-profile-layer .gbtrade-entry small{display:block;color:#d9bedb;margin-top:4px}
#gb-profile-layer .gbtrade-entry button{border:1px solid #ffc1ec;border-radius:10px;padding:9px;background:#833382;color:#fff;font-weight:800}
#gb-profile-layer .gbtrade-entry button:disabled{opacity:.5}
#gb-profile-layer #gbtrade-daily{font-size:11px;color:#efc5ed;text-align:center;margin:4px}
#gbtrade-send-overlay{position:fixed;inset:0;z-index:999995;background:#09050de8;display:grid;place-items:center;padding:14px}
#gbtrade-send-overlay[hidden]{display:none!important}
#gbtrade-send-overlay .gbtrade-dialog{background:linear-gradient(160deg,#411a50,#180d29);border:2px solid #db83e9;border-radius:19px;padding:17px;max-width:390px;width:100%;max-height:86vh;overflow:auto;color:#fbe7ff;text-align:center;box-shadow:0 0 20px #a743cb65}
#gbtrade-send-overlay .gbtrade-title{font-size:19px;color:#ffe4af;font-weight:850;margin:4px 0 12px}
#gbtrade-send-overlay .gbtrade-card{height:145px;max-width:125px;object-fit:contain;display:block;margin:4px auto}
#gbtrade-send-overlay button{border-radius:12px;background:#78317c;color:white;border:1px solid #f1a5ed;min-height:40px;padding:8px 12px;margin:5px;font-weight:800}
#gbtrade-send-overlay button:disabled{opacity:.5}
#gbtrade-send-overlay .gbtrade-friend{width:95%;display:flex;align-items:center;justify-content:space-between;text-align:left;margin:7px auto;background:#2b153a}
#gbtrade-send-overlay .gbtrade-status{font-size:12px;color:#f9d2ee;min-height:20px;white-space:pre-wrap}
`;document.head.appendChild(sheet);
const overlay=document.createElement('div');overlay.id='gbtrade-send-overlay';overlay.hidden=true;
overlay.innerHTML='<div class="gbtrade-dialog" role="dialog" aria-modal="true" aria-label="Trade duplicate card"><button type="button" id="gbtrade-close">✕ CLOSE</button><div class="gbtrade-title">SEND A DUPLICATE</div><img id="gbtrade-art" class="gbtrade-card" alt=""><div id="gbtrade-card-name"></div><p id="gbtrade-count">Trade Limit 0/5</p><div id="gbtrade-friends">Loading friends…</div><p id="gbtrade-status" class="gbtrade-status"></p></div>';
document.body.appendChild(overlay);
$('#gbtrade-close').onclick=()=>{if(!sending){overlay.hidden=true;currentCard=null;}};
overlay.addEventListener('click',e=>{if(e.target===overlay&&!sending){overlay.hidden=true;currentCard=null;}});
function cardImage(card){const [a,k]=String(card||'').split('_').map(Number);
 const candidate=document.querySelector(`[data-gbc-album="${a-1}"][data-gbc-card="${k-1}"]`);
 return candidate?.getAttribute('src')||'';
}
window.gbTradeOpenCard=async function(card){
 if(sending)return;
 currentCard=card;overlay.hidden=false;
 $('#gbtrade-card-name').textContent=card.title||'Collectible Card';
 $('#gbtrade-art').src=card.artUrl||'';
 $('#gbtrade-status').textContent='';
 $('#gbtrade-friends').textContent='Loading your accepted friends…';
 try{
  const [client]=await signed();
  const [{data:friends,error:friendError},{data:count,error:countError}]=await Promise.all([
    client.rpc('gb_friend_list'),client.rpc('gb_trade_daily_count')
  ]);
  if(friendError)throw friendError;if(countError)throw countError;
  const used=Number(count)||0;
  $('#gbtrade-count').textContent=`Trade Limit ${used}/5`;
  const eligible=(friends||[]).filter(f=>['accepted','friend','friends'].includes(f.kind)&&f.other_id);
  if(!eligible.length){$('#gbtrade-friends').textContent='Add and accept a friend before sending cards.';return;}
  $('#gbtrade-friends').innerHTML=eligible.map(f=>`<button type="button" class="gbtrade-friend" data-trade-friend="${safe(f.other_id)}" ${used>=5?'disabled':''}><span>${safe(f.display_name||f.username||'Friend')}</span><span>GIFT CARD ›</span></button>`).join('');
  $('#gbtrade-friends').querySelectorAll('[data-trade-friend]').forEach(btn=>btn.onclick=async()=>{
   if(sending||!currentCard)return;
   const who=btn.querySelector('span')?.textContent||'this friend';
   if(!confirm(`Send ONE extra copy of ${currentCard.title} to ${who}? Your first copy stays yours.`))return;
   sending=true;$('#gbtrade-status').textContent='Sending securely…';
   for(const b of $('#gbtrade-friends').querySelectorAll('button'))b.disabled=true;
   try{
    const {error}=await client.rpc('gb_trade_send',{p_recipient:btn.dataset.tradeFriend,p_card_id:currentCard.card_id});
    if(error)throw error;
    $('#gbtrade-status').textContent=`Sent! ${who} can claim the card in Carnival Mail → Trades.`;
    $('#gbtrade-count').textContent=`Trade Limit ${Math.min(5,used+1)}/5`;
    const cardModal=document.getElementById('gbcModal');if(cardModal)cardModal.hidden=true;
    window.gbTradeReloadCollection?.();
    setTimeout(()=>{overlay.hidden=true;currentCard=null;},1800);
   }catch(e){$('#gbtrade-status').textContent='Not sent: '+(e.message||'Unknown error');
     for(const b of $('#gbtrade-friends').querySelectorAll('button'))b.disabled=false;}
   finally{sending=false;}
  });
 }catch(e){$('#gbtrade-friends').textContent='Trading unavailable: '+(e.message||'Connection failed');}
};

function initMail(){
 const list=$('#gbpr-mail-list'), mailScreen=$('#gbpr-screen-mail');
 if(!list||!mailScreen||$('#gbtrade-tab-trades'))return false;
 const panel=list.parentElement;
 const tabs=document.createElement('div');tabs.className='gbtrade-tabs';tabs.innerHTML='<button type="button" id="gbtrade-tab-inbox" class="active">INBOX <span id="gbtrade-inbox-badge" class="gbtrade-dot" hidden></span></button><button type="button" id="gbtrade-tab-trades">TRADES <span id="gbtrade-new-badge" class="gbtrade-dot" hidden></span></button>';
 panel.insertBefore(tabs,list);
 const trades=document.createElement('div');trades.id='gbtrade-mail-list';trades.hidden=true;trades.innerHTML='Loading trades…';list.after(trades);
 const daily=document.createElement('p');daily.id='gbtrade-daily';daily.textContent='Trade Limit 0/5';trades.before(daily);daily.hidden=true;
 $('#gbtrade-tab-inbox').onclick=()=>setTab('inbox');
 $('#gbtrade-tab-trades').onclick=()=>setTab('trades');
 // Refresh button refreshes both tabs, preserving existing inbox behavior.
 $('#gbpr-mail-refresh')?.addEventListener('click',()=>{setTimeout(()=>void updateTradeDot(),300);if(activeTab==='trades')void loadTrades();});
 return true;
}
function setTab(tab){activeTab=tab;
 const list=$('#gbpr-mail-list'), trades=$('#gbtrade-mail-list'),daily=$('#gbtrade-daily');
 if(!list||!trades)return;
 list.hidden=tab!=='inbox';trades.hidden=tab!=='trades';daily.hidden=tab!=='trades';
 $('#gbtrade-tab-inbox').classList.toggle('active',tab==='inbox');
 $('#gbtrade-tab-trades').classList.toggle('active',tab==='trades');
 if(tab==='trades')void loadTrades();
}
async function loadTrades(){
 const host=$('#gbtrade-mail-list');if(!host)return;
 host.textContent='Loading your cards…';
 try{
  const [client,u]=await signed();
  const [{data:rows,error},{data:count,error:countError}]=await Promise.all([
   client.rpc('gb_trade_inbox'),client.rpc('gb_trade_daily_count')]);
  if(error)throw error;if(countError)throw countError;
  $('#gbtrade-daily').textContent=`Trade Limit ${Number(count)||0}/5`;
  if(!rows?.length){host.innerHTML='<p class="gbpr-muted">No traded cards yet. Received cards will appear here until claimed.</p>';void updateTradeDot();return;}
  host.innerHTML=rows.map(t=>{
   const card=String(t.card_id||''), meta=window.gbTradeCardMeta?.(card);
   return `<div class="gbtrade-entry">${meta?.artUrl?`<img src="${safe(meta.artUrl)}" alt="${safe(meta.title)}">`:``}<div class="gbtrade-copy"><b>${safe(meta?.title||`Card ${card}`)}</b><span>From ${safe(t.sender_name||'Carnival Friend')}</span><small>${new Date(t.sent_at).toLocaleDateString()}</small></div><button type="button" data-claim-trade="${safe(t.trade_id)}" ${t.claimed_at?'disabled':''}>${t.claimed_at?'CLAIMED':'CLAIM GIFT'}</button></div>`;
  }).join('');
  host.querySelectorAll('[data-claim-trade]').forEach(b=>b.onclick=async()=>{
   if(claiming)return;claiming=true;b.disabled=true;b.textContent='CLAIMING…';
   const id=b.dataset.claimTrade;
   try{const {data:result,error}=await client.rpc('gb_trade_claim',{p_trade_id:id});
    if(error)throw error;
    b.textContent='CLAIMED';
    window.gbTradeReloadCollection?.();
    void updateTradeDot();
   }catch(e){b.disabled=false;b.textContent='CLAIM GIFT';alert('Claim failed: '+(e.message||'Unknown error'));}
   finally{claiming=false;}
  });
  void updateTradeDot();
 }catch(e){host.textContent='Trades unavailable: '+(e.message||'Unknown error');}
}
// Refresh both inbox badges and the existing (single) Mailbox/PFP notices.
// No extra dot elements are added to the Mailbox or main menu.
let noticeSeq=0;
function applyNotices(tradePending, inboxPending){
 const trades=$('#gbtrade-new-badge'), inbox=$('#gbtrade-inbox-badge');
 if(trades)trades.hidden=!tradePending;
 if(inbox)inbox.hidden=!inboxPending;
 const hub=$('#gbpr-hub');
 if(hub)hub.classList.toggle('gbtrade-unclaimed',tradePending);
 const pfp=$('#gbpr-pfp-request-dot');
 if(pfp)pfp.classList.toggle('gbtrade-unclaimed',tradePending);
 // The normal inbox/friend indicators remain owned by gb-profile.js.
 // The PFP CSS above keeps the existing dot visible for an unclaimed trade.
 document.querySelectorAll('#gbpr-hub .gbtrade-hub-dot').forEach(dot=>dot.remove());
}
async function updateTradeDot(){
 if(!$('#gbtrade-tab-trades'))return;
 const seq=++noticeSeq;
 try{
  const [client,u]=await signed();
  if(seq!==noticeSeq)return;
  if(knownUid!==u.id){knownUid=u.id;applyNotices(false,false);}
  const [trades,inbox]=await Promise.all([
   client.rpc('gb_trade_inbox'),
   client.from('gb_inbox').select('category,claimed_at,read_at').eq('recipient',u.id).limit(100)
  ]);
  if(seq!==noticeSeq)return;
  if(trades.error)throw trades.error;
  const tradePending=(trades.data||[]).some(t=>!t.claimed_at);
  // A failed inbox fetch should not erase a previously displayed inbox badge.
  const inboxBadge=$('#gbtrade-inbox-badge');
  const inboxPending=inbox.error
   ? Boolean(inboxBadge&&!inboxBadge.hidden)
   : (inbox.data||[]).some(m=>(m.category==='event_reward'&&!m.claimed_at)||!m.read_at);
  applyNotices(tradePending,inboxPending);
 }catch(_){
  // Don't erase indicators after a transient connection error.
 }
}

const setup=()=>{if(initMail()){void updateTradeDot();return true;}return false;};
if(!setup()){
 let tries=0;const timer=setInterval(()=>{tries++;if(setup()||tries>80)clearInterval(timer);},250);
}
const oldMailButton=()=>$('#gbpr-hub [data-gbpr-nav="mail"]');
document.addEventListener('click',e=>{if(e.target.closest('[data-gbpr-nav="mail"]')){setTab('inbox');setTimeout(updateTradeDot,100);}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void updateTradeDot();});
window.addEventListener('focus',()=>void updateTradeDot());
document.addEventListener('click',e=>{if(e.target.closest('#gbpr-screen-mail [data-mail-open], #gbpr-screen-mail [data-mail-claim], #gbpr-screen-mail [data-inbox-claim]')){setTimeout(()=>void updateTradeDot(),500);setTimeout(()=>void updateTradeDot(),1800);}});
setInterval(()=>{if(!document.hidden)void updateTradeDot();},30000);
})();
