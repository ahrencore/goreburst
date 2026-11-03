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
const tabs=[...layer.querySelectorAll('[data-cat]')];let cat='specials',balance=null,rows=[],busy=false,selected=null,uid='',pendingByItem={};
const pendingKey=id=>'gbshop-pending-v1:'+uid+':'+id;
// The universal frame renderer positions photographs from transparent artwork.
// No manual per-frame dimensions are needed here.
function getApi(){return window.gbShopApi||null}
function isFrame(id){return id.startsWith('frame_')}
function frameOwned(id){return rows.some(x=>x.item_id===id)}
function tile(product){const [id,price,src,label]=product,owned=isFrame(id)&&frameOwned(id);const lives=id.startsWith('lives_');return `<button type="button" class="gbshop-tile ${owned?'gbshop-owned':''}" data-item="${id}" aria-label="Preview ${label}, ${fmt(price)} Skull Coins"><span class="gbshop-art">${lives?`<span class="gbshop-heart">♥</span><strong class="gbshop-time">${label}</strong>`:`<img src="${ROOT+src}" alt="" loading="lazy">`}</span><span class="gbshop-price"><img src="assets/coin-skull-new.png" alt="">${owned?'OWNED':fmt(price)}</span></button>`}
function render(){tabs.forEach(x=>x.classList.toggle('active',x.dataset.cat===cat));$('gbshopTiles').className='gbshop-tiles gbshop-'+cat;$('gbshopTiles').innerHTML=PRODUCTS[cat].map(tile).join('');$('gbshopCoins').textContent=balance===null?'—':fmt(balance);$('gbshopInfo').textContent=cat==='frames'?'Tap a frame to preview it on your profile picture.':cat==='lives'?'Unlimited lives for the selected duration.':'Tap an icon to see its details and purchase.'}
async function refresh(){if(!getApi()){balance=null;rows=[];render();return}try{const result=await getApi().sync();uid=result.uid;balance=result.balance;rows=result.orders||[];for(const section of Object.values(PRODUCTS))for(const [item] of section){const pending=localStorage.getItem(pendingKey(item));if(pending&&rows.some(r=>r.id===pending))localStorage.removeItem(pendingKey(item))}window.dispatchEvent(new Event('gb-wallet-balance-changed'));render()}catch(e){balance=null;render();$('gbshopInfo').textContent='Could not load the shop: '+(e.message||String(e))}}
async function openShop(){if(window.gbShopBlocked)return;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x===layer));cat='specials';balance=null;rows=[];render();await refresh()}
function closeShop(){if(busy)return;layer.classList.remove('active');if(typeof menu==='function')menu();else $('menu').classList.add('active')}
function openModal(id){const found=Object.values(PRODUCTS).flat().find(p=>p[0]===id);if(!found)return;selected=found;const [_,price,src,label]=found,frame=isFrame(id),lives=id.startsWith('lives_');$('gbshopPreviewTitle').textContent=frame?'YOUR FRAME PREVIEW':'SHOP ITEM';$('gbshopProductText').textContent=frame?'Permanent profile frame':lives?`Unlimited lives for ${label}`:label;$('gbshopModalStatus').textContent='';$('gbshopPreview').hidden=!frame;$('gbshopItemImg').hidden=frame||lives;$('gbshopItemImg').src=src?ROOT+src:'';
 if(frame){
   // A single shared renderer crops the avatar to this frame's real transparent opening.
   $('gbshopAvatarImg').src=$('gbMenuAvatar')?.src||'assets/avatars/01_Mr_Walker.png';
   $('gbshopFrameImg').src=ROOT+src;
 }
 if(lives){$('gbshopItemImg').hidden=true;$('gbshopProductText').textContent='♥ '+label+' unlimited lives';}
 const owned=frame&&frameOwned(id);$('gbshopBuy').disabled=owned||balance===null||balance<price;$('gbshopBuy').textContent=owned?'ALREADY OWNED':balance!==null&&balance<price?'NOT ENOUGH COINS':'BUY · '+fmt(price)+' COINS';$('gbshopModal').hidden=false;}
async function purchase(){if(!selected||busy)return;const [id,price,,label]=selected;if(isFrame(id)&&frameOwned(id))return;if(balance===null||balance<price){$('gbshopModalStatus').textContent='Not enough Skull Coins.';return}
 if(!window.confirm('Purchase '+label+' for '+fmt(price)+' Skull Coins?'))return;
 busy=true;$('gbshopBuy').disabled=true;$('gbshopModalStatus').textContent='Confirming payment with Supabase…';
 try{
  if(!getApi())throw Error('Account connection is not ready. Sign in first.');
  // The same request ID is reused after a connection failure; never generate a second charge on retry.
  const request=pendingByItem[id]||localStorage.getItem(pendingKey(id))||crypto.randomUUID();pendingByItem[id]=request;localStorage.setItem(pendingKey(id),request);
  const receipt=await getApi().purchase(id,request);
  // The RPC receipt is the payment authority. Do not ask the user to buy again
  // just because the follow-up inventory read was temporarily unavailable.
  balance=Number(receipt.balance_after);
  $('gbshopCoins').textContent=fmt(balance);
  $('gbshopBuy').textContent='PURCHASED';$('gbshopBuy').disabled=true;
  $('gbshopModalStatus').textContent=isFrame(id)
     ? 'Purchased! Your frame is permanently owned. Updating your Frames list…'
     : 'Purchased! Updating your game inventory…';
  try{
    await refresh();
    delete pendingByItem[id];localStorage.removeItem(pendingKey(id));
    $('gbshopModalStatus').textContent=isFrame(id)
       ? 'Purchased! Find your frame under Edit Profile → Frames.'
       : 'Purchased! Your item has been added to your game.';
  }catch(syncError){
    $('gbshopModalStatus').textContent='Purchase confirmed. The inventory display needs a refresh; do not buy again.';
  }
 }catch(e){$('gbshopModalStatus').textContent='Purchase could not be confirmed: '+(e.message||String(e))+'. Check your balance and purchase history before retrying.';}
 finally{busy=false;}
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
