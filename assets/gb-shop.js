/* Gore Burst Carnival Shop — server-priced purchases, account ownership, neon 3x3 frame gallery. */
(()=>{'use strict';
const ROOT='assets/';
const PRODUCTS={
 specials:[['rocket',250,'rocket-h.png','Rocket'],['clownbomb',350,'clownbomb.png','Clownbomb'],['ferris',400,'ferris.png','Ferris Wheel']],
 boosters:[['hammer',300,'booster-hammer.webp','Circus Hammer'],['watch',350,'booster-watch.webp',"Mr. Walker’s Watch"],['musicbox',350,'booster-musicbox.webp','Surprise Music Box'],['cards',350,'booster-cards.webp','Art of Distraction']],
 lives:[['lives_30m',700,null,'30m'],['lives_1h',1300,null,'1H'],['lives_2h',2400,null,'2H']],
 frames:[['frame_babybat',3000,'shop-frames/babybat.webp','Babybat'],['frame_emobaby',3000,'shop-frames/emobaby.webp','Emobaby'],['frame_clowngal',4000,'shop-frames/clowngal.webp','Clowngal'],['frame_heartballoon',4000,'shop-frames/heartballoon.webp','Heartballoon'],['frame_foxy',5000,'shop-frames/foxy.webp','Foxy'],['frame_cuteangel',5000,'shop-frames/cuteangel.webp','Cuteangel'],['frame_purplefluffy',5000,'shop-frames/purplefluffy.webp','Purplefluffy'],['frame_poseidon',6000,'shop-frames/poseidon.webp','Poseidon'],['frame_greek',6000,'shop-frames/greek.webp','Greek']]
};
const fmt=n=>Number(n||0).toLocaleString('en-US');const $=id=>document.getElementById(id);
const layer=document.createElement('section');layer.id='gbShopView';layer.className='view gbshop-view';layer.innerHTML=`<div class="gbshop-shell"><header class="gbshop-header"><button type="button" id="gbshopBack" class="gbshop-back">‹ BACK</button><h1>CARNIVAL SHOP</h1><span class="gbshop-balance"><img src="assets/coin-skull-new.png" alt=""> <b id="gbshopCoins">—</b></span></header><nav class="gbshop-tabs" aria-label="Shop categories"><button data-cat="specials">SPECIALS</button><button data-cat="boosters">BOOSTERS</button><button data-cat="lives">LIVES</button><button data-cat="frames">FRAMES</button></nav><div id="gbshopInfo" class="gbshop-info" role="status" aria-live="polite"></div><div id="gbshopScroll" class="gbshop-scroll"><div id="gbshopTiles" class="gbshop-tiles"></div></div></div><div id="gbshopModal" class="gbshop-modal" hidden><div class="gbshop-dialog" role="dialog" aria-modal="true" aria-labelledby="gbshopPreviewTitle"><button type="button" class="gbshop-close" id="gbshopModalClose" aria-label="Close">×</button><div id="gbshopPreviewTitle" class="gbshop-preview-title">PREVIEW</div><div class="gbshop-avatar-preview" id="gbshopPreview"><img id="gbshopAvatarImg" class="gbshop-avatar" alt="Your avatar"><img id="gbshopFrameImg" class="gbshop-frame" alt="Selected frame"></div><img id="gbshopItemImg" class="gbshop-item-preview" hidden alt=""><div id="gbshopProductText" class="gbshop-product-desc"></div><button type="button" id="gbshopBuy" class="gbshop-buy">BUY</button><div id="gbshopModalStatus" class="gbshop-status" aria-live="polite"></div></div></div>`;
$('app').appendChild(layer);
// Shared in-game neon dialog: confirmations, processing feedback, and receipts.
const notice=document.createElement('div');
notice.className='gbshop-notice'; notice.hidden=true;
notice.innerHTML='<div class="gbshop-notice-card" role="dialog" aria-modal="true" aria-labelledby="gbshopNoticeTitle"><div class="gbshop-notice-emblem">✦</div><h2 id="gbshopNoticeTitle"></h2><p id="gbshopNoticeMessage"></p><div class="gbshop-notice-actions"><button type="button" id="gbshopNoticeCancel" class="gbshop-notice-muted">CANCEL</button><button type="button" id="gbshopNoticeConfirm" class="gbshop-notice-primary">CONFIRM</button></div></div>';
layer.appendChild(notice);
const noticeTitle=$('gbshopNoticeTitle'),noticeMessage=$('gbshopNoticeMessage');
const noticeCancel=$('gbshopNoticeCancel'),noticeConfirm=$('gbshopNoticeConfirm');
function setNotice(title,message,{confirm='OK',cancel=null,locked=false}={}){
 noticeTitle.textContent=title;noticeMessage.textContent=message;
 noticeCancel.hidden=!cancel;noticeConfirm.textContent=confirm;
 noticeConfirm.disabled=locked;noticeCancel.disabled=locked;
 notice.hidden=false;
}
function askPurchase(label,price){
 setNotice('PURCHASE THIS ITEM?',`Buy ${label} for ${fmt(price)} Skull Coins?`,{confirm:'BUY NOW',cancel:'CANCEL'});
 return new Promise(resolve=>{
  const finish=answer=>{notice.hidden=true;noticeConfirm.onclick=null;noticeCancel.onclick=null;resolve(answer)};
  noticeConfirm.onclick=()=>finish(true); noticeCancel.onclick=()=>finish(false);
 });
}
function showOutcome(title,message){
 setNotice(title,message,{confirm:'CONTINUE'});
 noticeConfirm.onclick=()=>{notice.hidden=true;noticeConfirm.onclick=null;};
}

const tabs=[...layer.querySelectorAll('[data-cat]')];let cat='specials',balance=null,rows=[],busy=false,selected=null,uid='',pendingByItem={};
const pendingKey=id=>'gbshop-pending-v1:'+uid+':'+id;
// Each image has a slightly different transparent opening. Fit the PFP to the
// actual opening instead of forcing one photo size onto all nine frames.
const framePhotoFit={
 frame_babybat:[55.6,49.8,49.9],frame_emobaby:[44.8,48.8,54.6],
 frame_clowngal:[49.6,49.4,54.3],frame_heartballoon:[50.2,49.4,48.0],
 frame_foxy:[50.6,49.8,50.5],frame_cuteangel:[49.3,49.3,46.0],
 frame_purplefluffy:[47.4,48.3,47.0],frame_poseidon:[46.1,47.0,48.2],
 frame_greek:[42.1,46.5,47.3]
};
function getApi(){return window.gbShopApi||null}
function isFrame(id){return id.startsWith('frame_')}
function frameOwned(id){return rows.some(x=>x.item_id===id)}
function tile(product){const [id,price,src,label]=product,owned=isFrame(id)&&frameOwned(id);const lives=id.startsWith('lives_');return `<button type="button" class="gbshop-tile ${owned?'gbshop-owned':''}" data-item="${id}" aria-label="Preview ${label}, ${fmt(price)} Skull Coins"><span class="gbshop-art">${lives?`<span class="gbshop-heart">♥</span><strong class="gbshop-time">${label}</strong>`:`<img src="${ROOT+src}" alt="" loading="lazy">`}</span><span class="gbshop-price"><img src="assets/coin-skull-new.png" alt="">${owned?'OWNED':fmt(price)}</span></button>`}
function render(){tabs.forEach(x=>x.classList.toggle('active',x.dataset.cat===cat));$('gbshopTiles').className='gbshop-tiles gbshop-'+cat;$('gbshopTiles').innerHTML=PRODUCTS[cat].map(tile).join('');$('gbshopCoins').textContent=balance===null?'—':fmt(balance);$('gbshopInfo').textContent=cat==='frames'?'Tap a frame to preview it on your profile picture.':cat==='lives'?'Unlimited lives for the selected duration.':'Tap an icon to see its details and purchase.'}
async function refresh(){if(!getApi()){balance=null;rows=[];render();return}try{const result=await getApi().sync();uid=result.uid;balance=result.balance;rows=result.orders||[];for(const section of Object.values(PRODUCTS))for(const [item] of section){const pending=localStorage.getItem(pendingKey(item));if(pending&&rows.some(r=>r.id===pending))localStorage.removeItem(pendingKey(item))}window.dispatchEvent(new Event('gb-wallet-balance-changed'));render();return result}catch(e){render();$('gbshopInfo').textContent='Could not refresh the shop: '+(e.message||String(e));return null}}
async function openShop(){if(window.gbShopBlocked)return;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x===layer));cat='specials';render();void refresh()}
function closeShop(){if(busy)return;layer.classList.remove('active');if(typeof menu==='function')menu();else $('menu').classList.add('active')}
function openModal(id){const found=Object.values(PRODUCTS).flat().find(p=>p[0]===id);if(!found)return;selected=found;const [_,price,src,label]=found,frame=isFrame(id),lives=id.startsWith('lives_');$('gbshopPreviewTitle').textContent=frame?'YOUR FRAME PREVIEW':'SHOP ITEM';$('gbshopProductText').textContent=frame?'Permanent profile frame':lives?`Unlimited lives for ${label}`:label;$('gbshopModalStatus').textContent='';$('gbshopPreview').hidden=!frame;$('gbshopItemImg').hidden=frame||lives;$('gbshopItemImg').src=src?ROOT+src:'';
 if(frame){
   const preview=$('gbshopPreview');const fit=framePhotoFit[id]||[56,0,0];
   preview.style.setProperty('--gbshop-photo-size',fit[0]+'%');
   preview.style.setProperty('--gbshop-photo-x',fit[1]+'%');
   preview.style.setProperty('--gbshop-photo-y',fit[2]+'%');
   preview.style.setProperty('--gbshop-photo-clip', (fit[0]/1.4).toFixed(3)+'%');
   $('gbshopAvatarImg').src=$('gbMenuAvatar')?.src||'assets/avatars/01_Mr_Walker.png';
   $('gbshopFrameImg').src=ROOT+src;
 }
 if(lives){$('gbshopItemImg').hidden=true;$('gbshopProductText').textContent='♥ '+label+' unlimited lives';}
 const owned=frame&&frameOwned(id);$('gbshopBuy').disabled=owned||balance===null||balance<price;$('gbshopBuy').textContent=owned?'ALREADY OWNED':balance!==null&&balance<price?'NOT ENOUGH COINS':'BUY · '+fmt(price)+' COINS';$('gbshopModal').hidden=false;}
async function purchase(){
 if(!selected||busy)return;
 const [id,price,,label]=selected;
 if(isFrame(id)&&frameOwned(id))return;
 if(balance===null||balance<price){showOutcome('NOT ENOUGH COINS','You need more Skull Coins for this purchase.');return;}
 if(!await askPurchase(label,price))return;
 busy=true;
 $('gbshopBuy').disabled=true;
 setNotice('CONFIRMING PURCHASE','The carnival is securely processing your purchase…',{confirm:'PROCESSING…',locked:true});
 try{
  if(!getApi())throw Error('Account connection is not ready. Sign in first.');
  // Preserve the same request ID after a transient error; prevents duplicate charges on retries.
  const request=pendingByItem[id]||localStorage.getItem(pendingKey(id))||crypto.randomUUID();
  pendingByItem[id]=request;localStorage.setItem(pendingKey(id),request);
  const receipt=await getApi().purchase(id,request);
  balance=Number(receipt.balance_after);
  $('gbshopCoins').textContent=fmt(balance);
  $('gbshopBuy').textContent='PURCHASED';
  $('gbshopBuy').disabled=true;
  showOutcome('PURCHASE SUCCESSFUL!',`${label} purchased! Your remaining balance is ${fmt(balance)} Skull Coins.`);
  // Don't hold success feedback hostage to the expensive cloud inventory sync.
  // Receipt delivery is still verified against the matching account by gbShopApi.sync.
  void refresh().then(latest=>{
   if(latest){
    delete pendingByItem[id];localStorage.removeItem(pendingKey(id));
    if(latest.deliveryPending)$('gbshopModalStatus').textContent='Purchase saved to your account. Inventory delivery is pending account-save verification.';
    else $('gbshopModalStatus').textContent=isFrame(id)?'Frame available in Edit Profile → Frames.':'Purchase confirmed and inventory synchronized.';
   }else $('gbshopModalStatus').textContent='Purchase confirmed; cloud inventory will synchronize on the next refresh.';
  }).catch(()=>{$('gbshopModalStatus').textContent='Purchase confirmed; inventory display needs a refresh.';});
 }catch(e){
  showOutcome('PURCHASE NOT CONFIRMED',(e.message||String(e))+'. Check your wallet and purchase history before retrying.');
  $('gbshopBuy').disabled=false;
 }finally{busy=false;}
}
$('shop').addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openShop()},true);
$('gbshopBack').onclick=closeShop;
tabs.forEach(x=>x.addEventListener('click',()=>{cat=x.dataset.cat;render()}));
$('gbshopTiles').addEventListener('click',e=>{const btn=e.target.closest('[data-item]');if(btn)openModal(btn.dataset.item)});
$('gbshopModalClose').onclick=()=>{if(!busy)$('gbshopModal').hidden=true};
$('gbshopModal').addEventListener('click',e=>{if(e.target===$('gbshopModal')&&!busy)$('gbshopModal').hidden=true});
$('gbshopBuy').onclick=purchase;
window.addEventListener('gb-shop-order-available',()=>{if(layer.classList.contains('active'))refresh()});
window.gbShopOpen=openShop;
})();
