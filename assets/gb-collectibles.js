/* Gore Burst Collectibles UI preview. No cloud writes, no economy mutations. */
(()=>{'use strict';
const promoMenuStyle=document.createElement('style');promoMenuStyle.textContent='\n/* Collectibles lobby visual-only update: scoped to existing menu. */\n.gbc-total .gbc-completion-rewards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;align-items:end;margin:8px 0 10px}\n.gbc-total .gbc-completion-prize{display:flex;min-width:0;align-items:center;justify-content:center;flex-direction:column;gap:2px;position:relative}\n.gbc-total .gbc-completion-prize:not(:last-child){border-right:1px solid rgba(251,139,235,.3)}\n.gbc-total .gbc-completion-prize img{display:block;width:48px;height:48px;max-width:90%;object-fit:contain;filter:drop-shadow(0 0 6px rgba(254,72,202,.5))}\n.gbc-total .gbc-completion-prize b{font-size:12px;line-height:1.2;color:#ffe29a;text-shadow:0 0 6px #d638a3}\n.gbc-total .gbc-frame-prize img{animation:gbcHungryGlow 3.6s ease-in-out infinite}\n@keyframes gbcHungryGlow{0%,100%{filter:drop-shadow(0 0 3px #e531b2)}50%{filter:drop-shadow(0 0 11px #ff40bf) drop-shadow(0 0 3px #ff9e36)}}\n.gbc-album-pic img{width:100%;height:100%;object-fit:contain;object-position:center;display:block;filter:none}\n@media(prefers-reduced-motion:reduce){.gbc-total .gbc-frame-prize img{animation:none}}\n';document.head.appendChild(promoMenuStyle);
const A='assets/', albums=[
['Mr. Walker','walker.webp','#c73b86'],['Broken Toys','bear.png','#b36c8b'],['Twisted Carnival','star.png','#e2a456'],['Laughing Nightmares','clownbomb.png','#a649ad'],['Jarred Curiosities','ghost-green.png','#40a98a'],['Midnight Rides','ferris.png','#456fc2'],['Forbidden Tricks','booster-cards.webp','#8b5cc7'],['Freakshow Faces','rabbit.png','#bd5779'],['Cursed Keepsakes','heart.png','#a9366f'],['Ghostly Attractions','ghost-blue.png','#46a6bc'],['The Puppet Theatre','booster-musicbox.webp','#a66fbd'],['The Crooked Menagerie','bear.png','#72a884']
];
const promoNames=["mr_walker", "broken_toys", "twisted_carnival", "laughing_nightmares", "jarred_curiosities", "midnight_rides", "forbidden_tricks", "freakshow_faces", "cursed_keepsakes", "ghostly_attractions", "the_puppet_theatre", "the_crooked_menagerie"];
const names=['Mr. Walker?','One, Two, Peekaboo','Three, Four, Hear Him Roar','Five, Six, Crucifix','Seven, Eight, Stay Awake','Nine, Ten, Look Again','Always Watching','Something in Darkness','Eyes Everywhere'];
const rarities=[1,1,2,2,3,3,4,4,5];
const files=['01-mr-walker.png','02-peekaboo.png','03-roar.png','04-crucifix.png','05-stay-awake.png','06-look-again.png','07-always-watching.png','08-darkness.png','09-eyes-everywhere.png'];
const brokenFiles=['01-teddy-needs-a-hug.png', '02-missing-an-eye.png', '03-dolly-dearest.png', '04-batteries-not-included.png', '05-the-wrong-stuffing.png', '06-playtimes-over.png', '07-the-dollhouse-family.png', '08-nobodys-favourite.png', '09-toymakers-last-creation.png'];
const twistedFiles=['01_admit_one.png', '02_cotton_candy.png', '03_step_right_up.png', '04_the_wrong_tent.png', '05_funhouse_rules.png', '06_the_midnight_parade.png', '07_the_tent_that_breathes.png', '08_no_way_out.png', '09_the_carnival_is_alive.png'];
const laughingFiles=['01_honk_honk.png','02_smile_for_me.png','03_funny_business.png','04_the_balloon_man.png','05_laughing_gas.png','06_too_many_teeth.png','07_the_crying_clown.png','08_a_very_bad_joke.png','09_the_last_laugh.png'];
const otherCards=[
['Teddy Needs a Hug','Missing an Eye','Dolly Dearest','Batteries Not Included','The Wrong Stuffing',"Playtime’s Over",'The Dollhouse Family',"Nobody’s Favourite",'The Toymaker’s Last Creation'],
['Admit One','Cotton Candy','Step Right Up','The Wrong Tent','Funhouse Rules','The Midnight Parade','The Tent That Breathes','No Way Out','The Carnival Is Alive'],
['Honk Honk!','Smile for Me','Funny Business','The Balloon Man','Laughing Gas','Too Many Teeth','The Crying Clown','A Very Bad Joke','The Last Laugh'],
['Pickled Eyeballs',"Something’s Floating",'The Talking Jar','Do Not Shake','The Two-Headed Specimen','Growing Pains','A Jar Full of Screams',"The Collector’s Favourite",'The Thing That Shouldn’t Exist'],
['One More Round','The Dizzy Horse','Up We Go!','The Broken Carousel','The Upside-Down Ride','Stuck at the Top','The Ghost Train','The Endless Loop','The Ferris Wheel to Nowhere'],
['Pick a Card','Nothing Up My Sleeve','Now You See Me','The Disappearing Assistant','A Lovely Saw Trick','Wrong Rabbit',"The Magician’s Secret",'The Impossible Escape','The Trick That Never Ends'],
['The Bearded Lady','Mr. Stretch','Double Trouble','The Human Pretzel','The Living Statue','The Man With No Shadow','The Thousand-Faced Woman','The Boy Who Never Blinked','The Face Beneath the Face'],
["Grandma’s Locket",'The Unlucky Penny','A Broken Music Box','The Birthday Photograph','The Mirror That Remembers','The Wedding Ring','Letters From the Dead','The Clock That Runs Backwards','The Last Thing You Ever Owned'],
['Boo!','The Empty Seat','Haunted Housekeeping','The Ghost in the Booth','Room Thirteen','The Invisible Queue','The Haunted Portrait','The Door That Follows You','A Thousand Uninvited Guests'],
['Pull My Strings','Little Wooden Boy','The Dancing Marionette','Splinters & Secrets',"The Puppet’s Revenge",'Cut the Strings','The Puppet Master','The Empty Stage',"Who’s Controlling Who?"],
['The Three-Eyed Cat','A Very Strange Duck','The Two-Headed Goat','The Dancing Spider','The Crooked Giraffe','The Wolf With Human Teeth','The Hundred-Legged Horse','The Beast in the Mirror',"Nature’s Biggest Mistake"]
];
const rewards=[['300','booster-watch.webp','ferris.png'],['350','ferris.png','booster-musicbox.webp'],['400','rocket-h.png','booster-hammer.webp'],['450','booster-watch.webp','booster-hammer.webp'],['500','rocket-h.png','booster-cards.webp'],['550','ferris.png','booster-hammer.webp'],['600','clownbomb.png','booster-watch.webp'],['650','rocket-h.png','booster-musicbox.webp'],['700','ferris.png','booster-cards.webp'],['750','clownbomb.png','booster-watch.webp'],['800','rocket-h.png','booster-cards.webp'],['850','ferris.png','booster-musicbox.webp']];
const rewardDetails=[['1 Mr. Walker’s Watch','1 Ferris Wheel'],['1 Ferris Wheel','1 Surprise Music Box'],['1 Rocket','2 Circus Hammers'],['2 Mr. Walker’s Watches','2 Circus Hammers'],['2 Rockets','2 Art of Distraction'],['3 Ferris Wheels','2 Circus Hammers'],['3 Clownbombs','2 Mr. Walker’s Watches'],['3 Rockets','2 Surprise Music Boxes'],['3 Ferris Wheels','3 Art of Distraction'],['3 Clownbombs','3 Mr. Walker’s Watches'],['4 Rockets','2 Art of Distraction'],['4 Ferris Wheels','2 Surprise Music Boxes']];

// Permanent 12-album artwork registry. New album PNGs use
// assets/collectibles/<album-slug>/01_card_title.png through 09_card_title.png.
// Existing approved album filenames remain supported.
const folders=['mr-walker','broken-toys','twisted-carnival','laughing-nightmares',
'jarred-curiosities','midnight-rides','forbidden-tricks','freakshow-faces',
'cursed-keepsakes','ghostly-attractions','the-puppet-theatre','the-crooked-menagerie'];
const legacy=[files,brokenFiles,twistedFiles,laughingFiles];
const exact={
  6:['01_pick_a_card.png','02_nothing_up_my_sleeve.png','03_now_you_see_me.png','04_the_disappearing_assistant.png','05_a_lovely_saw_trick.png','06_wrong_rabbit.png','07_the_magicians_secret.png','08_the_impossible_escape.png','09_the_trick_that_never_ends.png'],
  7:['01_the_bearded_lady.png','02_mr_stretch.png','03_double_trouble.png','04_the_human_pretzel.png','05_the_living_statue.png','06_the_man_with_no_shadow.png','07_the_thousand_faced_woman.png','08_the_boy_who_never_blinked.png','09_the_face_beneath_the_face.png'],
  8:['01_grandmas_locket.png','02_the_unlucky_penny.png','03_a_broken_music_box.png','04_the_birthday_photograph.png','05_the_mirror_that_remembers.png','06_the_wedding_ring.png','07_letters_from_the_dead.png','08_the_clock_that_runs_backwards.png','09_the_last_thing_you_ever_owned.png']
};
const albumNames=i=>i===0?names:otherCards[i-1];
const slug=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[’']/g,'').replace(/&/g,'and').toLowerCase()
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const candidates=(i,k)=>{
 const n=String(k+1).padStart(2,'0'), name=albumNames(i)[k], hy=slug(name), un=hy.replace(/-/g,'_');
 const stems=[
  ...(exact[i]?[exact[i][k]]:[]),
  ...(legacy[i]?[legacy[i][k]]:[]),
  `${n}_${un}.png`,`${n}-${hy}.png`,`${n}-${un}.png`,`${n}_${hy}.png`,
  `${n}.png`,`${hy}.png`,`${un}.png`,
  `${folders[i]}-${n}-${hy}.png`,`${n}_${un}.webp`,`${n}-${hy}.webp`
 ];
 const dirs=[folders[i], ...(i===10?['puppet-theatre']:[]),...(i===11?['crooked-menagerie']:[])];
 return [...new Set(dirs.flatMap(dir=>stems.map(f=>`${A}collectibles/${dir}/${f}`)))];
};
const art=(i,k,name)=>`<img data-gbc-album="${i}" data-gbc-card="${k}" data-gbc-try="0" src="${candidates(i,k)[0]}" alt="${esc(name)}">`;
const blurbs={
 0:'The ringmaster who knows considerably more than he should.',
 1:"The toys have been waiting for someone to play with them. Unfortunately, they're not very nice.",
 2:'Come one, come all. Leaving is entirely "optional".',
 3:'Nine reasons why you should never trust a clown.',
 4:'Everything has been preserved. Some things are still moving.',
 5:"Please keep your hands and feet inside the ride. You'll need them.",
 6:"Magic isn't supposed to work like this.",
 7:'Every face has a story. Some have several faces.',
 8:'Some souvenirs really should have stayed in the gift shop.',
 9:'Hm, I wonder who wrote all these excellent reviews?',
 10:"The strings move, but nobody's holding them.",
 11:'Creatures that evolution would rather not discuss.'
};

const screen=document.createElement('section');screen.id='gbCollectView';screen.className='view';screen.setAttribute('aria-label','Collectibles');
screen.innerHTML='<div class="gbc-root"><header class="gbc-bar"><button type="button" class="gbc-btn" id="gbcBack">‹ BACK</button><div class="gbc-bar-title" id="gbcBarTitle">COLLECTIBLES</div><button class="gbc-btn" type="button" id="gbcHome">HOME</button></header><div class="gbc-scroll" id="gbcContent"></div></div><div class="gbc-card-modal" id="gbcModal" hidden></div>';
document.getElementById('app').appendChild(screen);
const $=id=>document.getElementById(id);let page=-1;
// Read-only ownership integration. Only trusted server jobs may mutate inventory.
let owned=new Map(), inventoryReady=false, inventoryError='', packs={carnival:0,freakshow:0,nightmare:0}, packBusy=false, packDb=null, packUser=null;
const cardKey=(a,k)=>String(a+1).padStart(2,'0')+'_'+String(k+1).padStart(2,'0');
const qty=(a,k)=>owned.get(cardKey(a,k))||0;
const setCount=a=>albumNames(a).filter((_,k)=>qty(a,k)>0).length;
const ownTotal=()=>albums.reduce((t,_,i)=>t+setCount(i),0);
async function loadOwnership(){
 inventoryReady=false;inventoryError='';owned=new Map();packs={carnival:0,freakshow:0,nightmare:0};packDb=null;packUser=null;
 try{
  if(typeof SUPABASE_URL==='undefined'||typeof SUPABASE_KEY==='undefined')throw Error('Cloud connection unavailable');
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const db=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data:auth,error:authErr}=await db.auth.getUser();
  if(authErr||!auth?.user)throw Error('Sign in to load your collection');
  const {data,error}=await db.from('gb_card_inventory').select('card_id,quantity').eq('user_id',auth.user.id).gt('quantity',0);
  if(error)throw error;
  for(const row of data||[])if(/^\d{2}_\d{2}$/.test(row.card_id))owned.set(row.card_id,Math.max(0,Number(row.quantity)||0));
  packDb=db;packUser=auth.user.id;
  const {data:balance,error:balanceErr}=await db.from('gb_card_pack_balances').select('pack_type,quantity').eq('user_id',auth.user.id);
  if(balanceErr)throw balanceErr;
  for(const b of balance||[])if(Object.hasOwn(packs,b.pack_type))packs[b.pack_type]=Math.max(0,Number(b.quantity)||0);
  inventoryReady=true;
 }catch(e){inventoryError=e?.message||'Collection unavailable';}
 if(screen.classList.contains('active'))page<0?lobby():album(page);
}
const ownedArt=(i,k,name)=>qty(i,k)>0?art(i,k,name):'<span class="gbc-unowned" aria-hidden="true">?</span>';
const extraBadge=(i,k)=>qty(i,k)>1?`<span class="gbc-extra">×${qty(i,k)-1}</span>`:'';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const view=id=>{document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id))};

const packTypes=[['carnival',3,3],['freakshow',4,4],['nightmare',5,5]];
const packWrapper=(type,stars)=>`<span class="gbc-pack-art" aria-hidden="true"><span class="gbc-pack-motif">${'★'.repeat(stars)}</span></span>`;
const packView=()=>`<section class="gbc-pack-zone"><h2>CARD PACKS</h2><div class="gbc-packs">${packTypes.map(([key,count,max])=>`<div class="gbc-pack gbc-pack-${key}"><button class="gbc-pack-pick" type="button" data-open-pack="${key}" aria-label="Open ${key} pack, ${count} cards, up to ${max} stars" ${(!inventoryReady||!packs[key]||packBusy)?'disabled':''}>${packWrapper(key,max)}</button><span class="gbc-pack-owned">×${inventoryReady?packs[key]:'—'}</span><button type="button" data-open-pack="${key}" ${(!inventoryReady||!packs[key]||packBusy)?'disabled':''}>OPEN</button></div>`).join('')}</div></section>`;
let revealedCards=[],revealStep=0;
function renderPackReveal(){
 const modal=$('gbcModal');if(modal.hidden)return;
 const visible=revealedCards.slice(0,revealStep).map(row=>{
  const [ai,ki]=row.card_id.split('_').map(v=>Number(v)-1),name=albumNames(ai)[ki];
  return `<div class="gbc-reveal-card">${art(ai,ki,name)}<div class="gbc-card-stars">${'★'.repeat(rarities[ki])}</div><strong>${esc(name)}</strong><span class="${row.is_new?'gbc-new':'gbc-duplicate'}">${row.is_new?'NEW':'+1'}</span></div>`;
 }).join('');
 const pending=revealedCards.length-revealStep;
 modal.innerHTML=`<div class="gbc-card-pane gbc-pack-reveal" role="dialog" aria-modal="true" aria-label="Opened card pack"><h3>${pending?'REVEAL YOUR CARDS':'PACK RESULTS'}</h3><div class="gbc-reveal-grid">${visible}${pending?`<button class="gbc-face-down" id="gbcFlipNext" aria-label="Reveal next card"><span class="gbc-cardback-star">✦</span><small>TAP TO REVEAL</small></button>`:''}</div><div class="gbc-modal-actions">${pending?'<button class="gbc-btn" id="gbcRevealAll" type="button">REVEAL ALL</button>':'<button class="gbc-btn" id="gbcCloseCard" type="button">VIEW ALBUMS</button>'}</div></div>`;
}
async function openPack(type){
 if(packBusy||!inventoryReady||!packDb||!packUser||!Object.hasOwn(packs,type)||packs[type]<1)return;
 packBusy=true;lobby();
 try{
  // Server commits the entire draw before any card is presented; the user cannot draw twice by tapping the pack.
  const {data,error}=await packDb.rpc('gb_open_card_pack',{p_pack_type:type});
  if(error)throw error;
  const expected={carnival:3,freakshow:4,nightmare:5}[type];
  if(!Array.isArray(data)||data.length!==expected||data.some(row=>!/^\d{2}_\d{2}$/.test(row.card_id||'')))throw Error('Pack opened, but its results could not be displayed. Check your albums.');
  revealedCards=data;revealStep=0;
  await loadOwnership();
  $('gbcModal').hidden=false;
  renderPackReveal();
 }catch(e){window.alert(e?.message||'Pack could not be opened. Please check your collection before trying again.');}
 finally{packBusy=false;if($('gbcModal').hidden&&screen.classList.contains('active'))lobby();}
}

function lobby(){page=-1;$('gbcBarTitle').textContent='COLLECTIBLES';$('gbcBack').textContent='‹ BACK';$('gbcContent').innerHTML='<h1 class="gbc-headline">THE CURSED COLLECTION</h1><p class="gbc-sub">12 albums · 108 cards · One very strange carnival</p><div class="gbc-total"><strong>COMPLETE THE COLLECTION</strong><div class="gbc-completion-rewards" aria-label="Completion rewards"><div class="gbc-completion-prize"><img src="assets/coin-skull-new.png" alt="Skull Coins"><b>10,000</b></div><div class="gbc-completion-prize"><img src="assets/heart.png" alt="Lives"><b>24H</b></div><div class="gbc-completion-prize gbc-frame-prize" title="Exclusive special profile frame"><img src="assets/collectibles/reward-icons/hungry_gate_frame.png" alt="Special profile frame"><b>×1</b></div></div><div class="gbc-progress"><span style="width:0%"></span></div><small>'+(inventoryReady?(ownTotal()+' / 108 collected'):('Collection unavailable · '+esc(inventoryError||'Loading')))+'</small></div><div class="gbc-albums">'+albums.map((a,i)=>`<button class="gbc-album ${i===0?'featured':''}" type="button" data-album="${i}" aria-label="Open ${esc(a[0])}"><span class="gbc-album-pic" style="--gbc-light:${a[2]}"><img src="${A}collectibles/album-promos/${String(i+1).padStart(2,'0')}_${promoNames[i]}.png" alt="" loading="lazy"></span><span class="gbc-album-name">${esc(a[0])}</span><span class="gbc-count">${inventoryReady?setCount(i):'—'} / 9</span><span class="gbc-tiny">VIEW ALBUM</span></button>`).join('')+'</div>'+packView()+'<p class="gbc-note">'+(inventoryReady?'Find collectible cards in packs to fill your albums.':'Sign in to load your collection.')+'</p>';const progress=$('gbcContent').querySelector('.gbc-progress span');if(progress)progress.style.width=(inventoryReady?Math.round(ownTotal()/108*100):0)+'%';$('gbcContent').scrollTop=0;}
function rewardCount(text){const match=String(text).match(/^\s*(\d+)/);return '×'+(match?match[1]:'1');}
function album(i){
 page=i;const a=albums[i], arr=albumNames(i),rr=rewards[i];
 $('gbcBarTitle').textContent='ALBUM';$('gbcBack').textContent='‹ ALBUMS';
 const description=blurbs[i];
 $('gbcContent').innerHTML=`<div class="gbc-person gbc-person-text"><div><h2>${esc(a[0])}</h2><p>${esc(description)}</p></div></div><div class="gbc-rewards"><div class="gbc-reward"><img src="${A}coin-skull-new.png" alt=""><b>${rr[0]}</b></div><div class="gbc-reward"><img src="${A+rr[1]}" alt=""><b>${rewardCount(rewardDetails[i][0])}</b></div><div class="gbc-reward"><img src="${A+rr[2]}" alt=""><b>${rewardCount(rewardDetails[i][1])}</b></div></div><div class="gbc-claim-row"><button class="gbc-btn gbc-claim" type="button" id="gbcClaimSet">CLAIM</button></div><div class="gbc-cards">${arr.map((name,k)=>`<button class="gbc-card" type="button" data-card="${k}" aria-label="View card ${esc(name)}">${ownedArt(i,k,name)}${extraBadge(i,k)}<span class="gbc-card-stars">${'★'.repeat(rarities[k])}</span><span class="gbc-card-label">${esc(name)}</span></button>`).join('')}</div><p class="gbc-note">${inventoryReady?'Only collected cards are revealed.':'Your collection could not be loaded.'}</p>`;
 $('gbcContent').scrollTop=0;
}
function card(k){
 if(page<0)return;
 const name=albumNames(page)[k];
 if(!inventoryReady||qty(page,k)<1)return;
 $('gbcModal').innerHTML=`<div class="gbc-card-pane" role="dialog" aria-modal="true" aria-label="Card detail">${art(page,k,name)}<h3>${esc(name)}</h3><div class="gbc-card-stars">${'★'.repeat(rarities[k])}</div><p>Album: ${esc(albums[page][0])}<br>Owned: ${qty(page,k)} · Extras: ${Math.max(0,qty(page,k)-1)}<br>Friend trading coming later.</p><div class="gbc-modal-actions"><button class="gbc-btn" type="button" id="gbcCloseCard">CLOSE</button><button class="gbc-btn" type="button" disabled title="Trading is not active yet">TRADE · SOON</button></div></div>`;
 $('gbcModal').hidden=false;
}
// Image fallbacks work on both the album grid and the full-size popup.
// Missing assets display a named placeholder; they never hide the album.
screen.addEventListener('error',e=>{
 const img=e.target;
 if(!(img instanceof HTMLImageElement)||!img.hasAttribute('data-gbc-album'))return;
 const i=Number(img.dataset.gbcAlbum),k=Number(img.dataset.gbcCard),tries=candidates(i,k);
 const next=Number(img.dataset.gbcTry||'0')+1;
 if(next<tries.length){img.dataset.gbcTry=String(next);img.src=tries[next];return;}
 const missing=document.createElement('span');
 missing.className='gbc-placeholder';
 missing.textContent='✧';
 missing.title='Artwork not uploaded or filename mismatch: '+folders[i]+' card '+String(k+1).padStart(2,'0');
 img.replaceWith(missing);
},true);
$('gbcContent').addEventListener('click',e=>{const packBtn=e.target.closest('[data-open-pack]');if(packBtn){void openPack(packBtn.dataset.openPack);return;}if(e.target.closest('#gbcClaimSet')){window.alert(inventoryReady&&setCount(page)===9?'Album reward claiming will be activated with the secure rewards system.':'Complete this set first!');return;}const a=e.target.closest('[data-album]');if(a){album(+a.dataset.album);return}const c=e.target.closest('[data-card]');if(c)card(+c.dataset.card)});
$('gbcBack').addEventListener('click',()=>page<0?view('menu'):lobby());$('gbcHome').addEventListener('click',()=>view('menu'));
$('gbcModal').addEventListener('click',e=>{if(e.target.closest('#gbcFlipNext')){revealStep=Math.min(revealedCards.length,revealStep+1);renderPackReveal();return;}if(e.target.closest('#gbcRevealAll')){revealStep=revealedCards.length;renderPackReveal();return;}if(e.target.id==='gbcCloseCard'){revealedCards=[];$('gbcModal').hidden=true;lobby();return;}if(e.target.id==='gbcModal'&&revealStep>=revealedCards.length){$('gbcModal').hidden=true;lobby();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&screen.classList.contains('active')){if(!$('gbcModal').hidden){if(!revealedCards.length||revealStep>=revealedCards.length){$('gbcModal').hidden=true;revealedCards=[];lobby();}}else if(page>=0)lobby();else view('menu')}});
const tab=$('collectibles');if(tab)tab.onclick=()=>{lobby();view('gbCollectView');void loadOwnership()};
})();
