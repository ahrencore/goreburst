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
const optimizedCardFiles=new Set(["album-promos/01_mr_walker.webp", "album-promos/02_broken_toys.webp", "album-promos/03_twisted_carnival.webp", "album-promos/04_laughing_nightmares.webp", "album-promos/05_jarred_curiosities.webp", "album-promos/06_midnight_rides.webp", "album-promos/07_forbidden_tricks.webp", "album-promos/08_freakshow_faces.webp", "album-promos/09_cursed_keepsakes.webp", "album-promos/10_ghostly_attractions.webp", "album-promos/11_the_puppet_theatre.webp", "album-promos/12_the_crooked_menagerie.webp", "broken-toys/01-teddy-needs-a-hug.webp", "broken-toys/02-missing-an-eye.webp", "broken-toys/03-dolly-dearest.webp", "broken-toys/04-batteries-not-included.webp", "broken-toys/05-the-wrong-stuffing.webp", "broken-toys/06-playtimes-over.webp", "broken-toys/07-the-dollhouse-family.webp", "broken-toys/08-nobodys-favourite.webp", "broken-toys/09-toymakers-last-creation.webp", "crooked-menagerie/01_the_three_eyed_cat.webp", "crooked-menagerie/02_a_very_strange_duck.webp", "crooked-menagerie/03_the_two_headed_goat.webp", "crooked-menagerie/04_the_dancing_spider.webp", "crooked-menagerie/05_the_crooked_giraffe.webp", "crooked-menagerie/06_the_wolf_with_human_teeth.webp", "crooked-menagerie/07_the_hundred_legged_horse.webp", "crooked-menagerie/08_the_beast_in_the_mirror.webp", "crooked-menagerie/09_natures_biggest_mistake.webp", "cursed-keepsakes/01_grandmas_locket.webp", "cursed-keepsakes/02_the_unlucky_penny.webp", "cursed-keepsakes/03_a_broken_music_box.webp", "cursed-keepsakes/04_the_birthday_photograph.webp", "cursed-keepsakes/05_the_mirror_that_remembers.webp", "cursed-keepsakes/06_the_wedding_ring.webp", "cursed-keepsakes/07_letters_from_the_dead.webp", "cursed-keepsakes/08_the_clock_that_runs_backwards.webp", "cursed-keepsakes/09_the_last_thing_you_ever_owned.webp", "forbidden-tricks/01_pick_a_card.webp", "forbidden-tricks/02_nothing_up_my_sleeve.webp", "forbidden-tricks/03_now_you_see_me.webp", "forbidden-tricks/04_the_disappearing_assistant.webp", "forbidden-tricks/05_a_lovely_saw_trick.webp", "forbidden-tricks/06_wrong_rabbit.webp", "forbidden-tricks/07_the_magicians_secret.webp", "forbidden-tricks/08_the_impossible_escape.webp", "forbidden-tricks/09_the_trick_that_never_ends.webp", "freakshow-faces/01_the_bearded_lady.webp", "freakshow-faces/02_mr_stretch.webp", "freakshow-faces/03_double_trouble.webp", "freakshow-faces/04_the_human_pretzel.webp", "freakshow-faces/05_the_living_statue.webp", "freakshow-faces/06_the_man_with_no_shadow.webp", "freakshow-faces/07_the_thousand_faced_woman.webp", "freakshow-faces/08_the_boy_who_never_blinked.webp", "freakshow-faces/09_the_face_beneath_the_face.webp", "ghostly-attractions/01_boo.webp", "ghostly-attractions/02_the_empty_seat.webp", "ghostly-attractions/03_haunted_housekeeping.webp", "ghostly-attractions/04_the_ghost_in_the_booth.webp", "ghostly-attractions/05_room_thirteen.webp", "ghostly-attractions/06_the_invisible_queue.webp", "ghostly-attractions/07_the_haunted_portrait.webp", "ghostly-attractions/08_the_door_that_follows_you.webp", "ghostly-attractions/09_a_thousand_uninvited_guests.webp", "jarred-curiosities/01_pickled_eyeballs.webp", "jarred-curiosities/02_somethings_floating.webp", "jarred-curiosities/03_the_talking_jar.webp", "jarred-curiosities/04_do_not_shake.webp", "jarred-curiosities/05_the_two_headed_specimen.webp", "jarred-curiosities/06_growing_pains.webp", "jarred-curiosities/07_a_jar_full_of_screams.webp", "jarred-curiosities/08_the_collectors_favourite.webp", "jarred-curiosities/09_the_thing_that_shouldnt_exist.webp", "laughing-nightmares/01_honk_honk.webp", "laughing-nightmares/02_smile_for_me.webp", "laughing-nightmares/03_funny_business.webp", "laughing-nightmares/04_the_balloon_man.webp", "laughing-nightmares/05_laughing_gas.webp", "laughing-nightmares/06_too_many_teeth.webp", "laughing-nightmares/07_the_crying_clown.webp", "laughing-nightmares/08_a_very_bad_joke.webp", "laughing-nightmares/09_the_last_laugh.webp", "mr-walker/01-mr-walker.webp", "mr-walker/02-peekaboo.webp", "mr-walker/03-roar.webp", "mr-walker/04-crucifix.webp", "mr-walker/05-stay-awake.webp", "mr-walker/06-look-again.webp", "mr-walker/07-always-watching.webp", "mr-walker/08-darkness.webp", "mr-walker/09-eyes-everywhere.webp", "mr-walker/album-mr-walker.webp", "reward-icons/hungry_gate_frame.webp", "twisted-carnival/01_admit_one.webp", "twisted-carnival/03_step_right_up.webp", "twisted-carnival/04_the_wrong_tent.webp", "twisted-carnival/07_the_tent_that_breathes.webp"]);
const albumNames=i=>i===0?names:otherCards[i-1];
const slug=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[’']/g,'').replace(/&/g,'and').toLowerCase()
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const curio3Files=['01_admit_one','02_cotton_candy','03_step_right_up','04_the_wrong_tent','05_funhouse_rules','06_the_midnight_parade','07_the_tent_that_breathes','08_no_way_out','09_the_carnival_is_alive'];
const candidates=(i,k)=>{
 if(i===2){const stem=curio3Files[k];return [`${A}collectibles/twisted-carnival/${stem}.webp`,`${A}collectibles/twisted-carnival/${stem}.png`];}
 const n=String(k+1).padStart(2,'0'), name=albumNames(i)[k], hy=slug(name), un=hy.replace(/-/g,'_');
 const stems=[
  ...(exact[i]?[exact[i][k]]:[]),
  ...(legacy[i]?[legacy[i][k]]:[]),
  `${n}_${un}.png`,`${n}-${hy}.png`,`${n}-${un}.png`,`${n}_${hy}.png`,
  `${n}.png`,`${hy}.png`,`${un}.png`,
  `${folders[i]}-${n}-${hy}.png`,`${n}_${un}.webp`,`${n}-${hy}.webp`
 ];
 const dirs=[folders[i], ...(i===10?['puppet-theatre']:[]),...(i===11?['crooked-menagerie']:[])];
 return [...new Set(dirs.flatMap(dir=>stems.flatMap(f=>{
  const png=`${A}collectibles/${dir}/${f}`;
  const webp=f.endsWith('.png')?`${A}collectibles/${dir}/${f.slice(0,-4)}.webp`:null;
  return webp&&optimizedCardFiles.has(`${dir}/${f.slice(0,-4)}.webp`)?[webp,png]:[png];
 })))];
};
const art=(i,k,name)=>`<img data-gbc-album="${i}" data-gbc-card="${k}" data-gbc-try="0" loading="lazy" decoding="async" ${i===2?'style="width:70%!important;height:auto!important;aspect-ratio:1/1!important;max-width:70%!important;max-height:70%!important;object-fit:contain!important;margin:auto!important;border:0!important;box-shadow:none!important"':''} src="${candidates(i,k)[0]}" alt="${esc(name)}">`;
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
// Public Supabase project configuration, shared with the profile client.
// These are publishable client credentials; never place service-role keys here.
const SUPABASE_URL='https://harqhhpobaepfkfeitmw.supabase.co';
const SUPABASE_KEY='sb_publishable_K9F36jgWZaMWywln6Wwaiw_4zJ7523C';
const $=id=>document.getElementById(id);let page=-1;
// Read-only ownership integration. Only trusted server jobs may mutate inventory.
let owned=new Map(), inventoryReady=false, inventoryError='', packs={carnival:0,freakshow:0,nightmare:0}, packBusy=false, packDb=null, packUser=null, cloudCoins=null, buyBusy=false;
const cardKey=(a,k)=>String(a+1).padStart(2,'0')+'_'+String(k+1).padStart(2,'0');
const qty=(a,k)=>owned.get(cardKey(a,k))||0;
const setCount=a=>albumNames(a).filter((_,k)=>qty(a,k)>0).length;
const ownTotal=()=>albums.reduce((t,_,i)=>t+setCount(i),0);
async function loadOwnership(){
 inventoryReady=false;inventoryError='';owned=new Map();packs={carnival:0,freakshow:0,nightmare:0};packDb=null;packUser=null;cloudCoins=null;
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
  const {data:wallet,error:walletErr}=await db.from('player_inventory').select('skull_coins').eq('player_id',auth.user.id).maybeSingle();
  if(walletErr)throw walletErr;
  cloudCoins=wallet&&Number.isSafeInteger(Number(wallet.skull_coins))?Number(wallet.skull_coins):null;
  const {data:balance,error:balanceErr}=await db.from('gb_card_pack_balances').select('pack_type,quantity').eq('user_id',auth.user.id);
  if(balanceErr)throw balanceErr;
  for(const b of balance||[])if(Object.hasOwn(packs,b.pack_type))packs[b.pack_type]=Math.max(0,Number(b.quantity)||0);
  inventoryReady=true;
 }catch(e){inventoryError=e?.message||'Collection unavailable';}
 if(screen.classList.contains('active'))page<0?lobby():album(page);
}
const ownedArt=(i,k,name)=>qty(i,k)>0?art(i,k,name):'<span class="gbc-unowned" aria-hidden="true">?</span>';
window.gbTradeReloadCollection=loadOwnership;
window.gbTradeCardMeta=(id)=>{const match=/^(0[1-9]|1[0-2])_0[1-9]$/.exec(String(id));if(!match)return null;const [a,k]=id.split('_').map(Number);if(!albumNames(a-1)?.[k-1])return null;return {title:albumNames(a-1)[k-1],artUrl:candidates(a-1,k-1)[0]};};
const extraBadge=(i,k)=>qty(i,k)>1?`<span class="gbc-extra">×${qty(i,k)-1}</span>`:'';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const view=id=>{document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id))};

const packTypes=[['carnival',3,3],['freakshow',4,4],['nightmare',5,5]];
const packWrapper=(type,stars)=>`<span class="gbc-pack-art" aria-hidden="true"><span class="gbc-pack-motif">${'★'.repeat(stars)}</span></span>`;
const packPrices={carnival:600,freakshow:900,nightmare:1200};
const packView=()=>`<section class="gbc-pack-zone"><h2>CARD PACKS</h2><p class="gbc-note">Supabase Skull Coins: ${cloudCoins===null?'—':cloudCoins.toLocaleString()}</p><div class="gbc-packs">${packTypes.map(([key,count,max])=>`<div class="gbc-pack gbc-pack-${key}"><button class="gbc-pack-pick" type="button" data-open-pack="${key}" aria-label="Open ${key} pack, ${count} cards, up to ${max} stars" ${(!inventoryReady||!packs[key]||packBusy||buyBusy)?'disabled':''}>${packWrapper(key,max)}</button><span class="gbc-pack-owned">×${inventoryReady?packs[key]:'—'}</span><button type="button" data-open-pack="${key}" ${(!inventoryReady||!packs[key]||packBusy||buyBusy)?'disabled':''}>OPEN</button><button type="button" data-buy-pack="${key}" ${(!inventoryReady||!packDb||buyBusy||cloudCoins===null||cloudCoins<packPrices[key])?'disabled':''}>BUY · ${packPrices[key].toLocaleString()} COINS</button></div>`).join('')}</div></section>`;
// Reuse the same id for a retry if the network drops after the server commits.
const pendingPurchases={};
async function buyPack(type){
 if(buyBusy||packBusy||!inventoryReady||!packDb||!packUser||!Object.hasOwn(packPrices,type))return;
 if(cloudCoins===null||cloudCoins<packPrices[type]){alert('Not enough Supabase Skull Coins.');return;}
 if(!window.confirm(`Buy one ${type} pack for ${packPrices[type]} Skull Coins?`))return;
 buyBusy=true;lobby();
 try{
  const purchaseId=pendingPurchases[type]||(pendingPurchases[type]=crypto.randomUUID());
  const {data,error}=await packDb.rpc('gb_buy_card_pack',{p_pack_type:type,p_purchase_id:purchaseId});
  if(error)throw error;
  const result=Array.isArray(data)?data[0]:data;
  if(!result||!Number.isFinite(Number(result.balance_after)))throw Error('Purchase response could not be verified. Check your pack balance before retrying.');
  delete pendingPurchases[type];
  await loadOwnership();lobby();
  alert('Pack purchased! Tap OPEN to reveal your cards.');
 }catch(e){alert('Purchase not confirmed: '+(e?.message||'Unknown error')+'\nCheck your balance and pack count before retrying.');}
 finally{buyBusy=false;if(screen.classList.contains('active'))lobby();}
}

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

function lobby(){page=-1;$('gbcBarTitle').textContent='COLLECTIBLES';$('gbcBack').textContent='‹ BACK';$('gbcContent').innerHTML='<h1 class="gbc-headline">THE CURSED COLLECTION</h1><p class="gbc-sub">12 albums · 108 cards · One very strange carnival</p><div class="gbc-total"><strong>COMPLETE THE COLLECTION</strong><div class="gbc-completion-rewards" aria-label="Completion rewards"><div class="gbc-completion-prize"><img src="assets/coin-skull-new.png" alt="Skull Coins"><b>15,000</b></div><div class="gbc-completion-prize"><img src="assets/heart.png" alt="Lives"><b>24H</b></div><div class="gbc-completion-prize gbc-frame-prize" title="Exclusive special profile frame"><img src="assets/collectibles/reward-icons/hungry_gate_frame.webp" alt="Special profile frame" data-gbc-fallback="png"><b>×1</b></div></div><div class="gbc-progress"><span style="width:0%"></span></div><small>'+(inventoryReady?(ownTotal()+' / 108 collected'):('Collection unavailable · '+esc(inventoryError||'Loading')))+'</small></div><div class="gbc-albums">'+albums.map((a,i)=>`<button class="gbc-album ${i===0?'featured':''}" type="button" data-album="${i}" aria-label="Open ${esc(a[0])}"><span class="gbc-album-pic" style="--gbc-light:${a[2]}"><img src="${A}collectibles/album-promos/${String(i+1).padStart(2,'0')}_${promoNames[i]}.webp" alt="" loading="lazy" data-gbc-fallback="png"></span><span class="gbc-album-name">${esc(a[0])}</span><span class="gbc-count">${inventoryReady?setCount(i):'—'} / 9</span><span class="gbc-tiny">VIEW ALBUM</span></button>`).join('')+'</div>'+packView()+`<div class="gbcf-testbar"><button type="button" class="gbcf-testbutton" id="gbcfOpenTest">PREVIEW COMPLETION FRAMES</button><small>Preview only · does not unlock frames or grant rewards</small></div>`+'<p class="gbc-note">'+(inventoryReady?'Find collectible cards in packs to fill your albums.':'Sign in to load your collection.')+'</p>';const progress=$('gbcContent').querySelector('.gbc-progress span');if(progress)progress.style.width=(inventoryReady?Math.round(ownTotal()/108*100):0)+'%';$('gbcContent').scrollTop=0;}
function rewardCount(text){const match=String(text).match(/^\s*(\d+)/);return '×'+(match?match[1]:'1');}
function album(i){
 page=i;const a=albums[i], arr=albumNames(i),rr=rewards[i];
 $('gbcBarTitle').textContent='ALBUM';$('gbcBack').textContent='‹ ALBUMS';
 const description=blurbs[i];
 $('gbcContent').innerHTML=`<div class="gbc-person gbc-person-text"><div><h2>${esc(a[0])}</h2><p>${esc(description)}</p></div></div><div class="gbc-rewards"><div class="gbc-reward"><img src="${A}coin-skull-new.png" alt=""><b>${rr[0]}</b></div><div class="gbc-reward"><img src="${A+rr[1]}" alt=""><b>${rewardCount(rewardDetails[i][0])}</b></div><div class="gbc-reward"><img src="${A+rr[2]}" alt=""><b>${rewardCount(rewardDetails[i][1])}</b></div></div><div class="gbc-claim-row"><button class="gbc-btn gbc-claim" type="button" id="gbcClaimSet">CLAIM</button></div><div class="gbc-cards">${arr.map((name,k)=>`<button class="gbc-card ${(i===0||i===1||i===2)?'gbc-card-curio':''}" type="button" data-card="${k}" aria-label="View card ${esc(name)}">${(i===0||i===1||i===2)?`<span class="gbc-curio-slot">${ownedArt(i,k,name)}</span>`:ownedArt(i,k,name)}${extraBadge(i,k)}<span class="gbc-card-stars">${'★'.repeat(rarities[k])}</span><span class="gbc-card-label">${esc(name)}</span></button>`).join('')}</div><p class="gbc-note">${inventoryReady?'Only collected cards are revealed.':'Your collection could not be loaded.'}</p>`;
 $('gbcContent').scrollTop=0;
}
function card(k){
 if(page<0)return;
 const name=albumNames(page)[k];
 if(!inventoryReady||qty(page,k)<1)return;
 $('gbcModal').innerHTML=`<div class="gbc-card-pane" role="dialog" aria-modal="true" aria-label="Card detail">${art(page,k,name)}<h3>${esc(name)}</h3><div class="gbc-card-stars">${'★'.repeat(rarities[k])}</div><p>Album: ${esc(albums[page][0])}<br>Owned: ${qty(page,k)} · Extras: ${Math.max(0,qty(page,k)-1)}<br>Send an extra copy to an accepted friend.</p><div class="gbc-modal-actions"><button class="gbc-btn" type="button" id="gbcCloseCard">CLOSE</button><button class="gbc-btn" type="button" id="gbcTradeCard" ${qty(page,k)<2?'disabled title="You must keep your first copy"':''}>TRADE</button></div></div>`;
 $('gbcModal').hidden=false;
 const tradeButton=$('gbcTradeCard');
 if(tradeButton)tradeButton.onclick=()=>{
  if(typeof window.gbTradeOpenCard!=='function'){alert('Trading is still loading. Try again in a moment.');return;}
  window.gbTradeOpenCard({card_id:cardKey(page,k),title:name,artUrl:candidates(page,k)[0]});
 };
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
$('gbcContent').addEventListener('click',e=>{if(e.target.closest('#gbcfOpenTest')){gbcfOpen();return;}const buyBtn=e.target.closest('[data-buy-pack]');if(buyBtn){void buyPack(buyBtn.dataset.buyPack);return;}const packBtn=e.target.closest('[data-open-pack]');if(packBtn){void openPack(packBtn.dataset.openPack);return;}if(e.target.closest('#gbcClaimSet')){window.alert(inventoryReady&&setCount(page)===9?'Album reward claiming will be activated with the secure rewards system.':'Complete this set first!');return;}const a=e.target.closest('[data-album]');if(a){album(+a.dataset.album);return}const c=e.target.closest('[data-card]');if(c)card(+c.dataset.card)});
$('gbcBack').addEventListener('click',()=>page<0?view('menu'):lobby());$('gbcHome').addEventListener('click',()=>view('menu'));
$('gbcModal').addEventListener('click',e=>{if(e.target.closest('#gbcFlipNext')){revealStep=Math.min(revealedCards.length,revealStep+1);renderPackReveal();return;}if(e.target.closest('#gbcRevealAll')){revealStep=revealedCards.length;renderPackReveal();return;}if(e.target.id==='gbcCloseCard'){revealedCards=[];$('gbcModal').hidden=true;lobby();return;}if(e.target.id==='gbcModal'&&revealStep>=revealedCards.length){$('gbcModal').hidden=true;lobby();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&screen.classList.contains('active')){if(!$('gbcModal').hidden){if(!revealedCards.length||revealStep>=revealedCards.length){$('gbcModal').hidden=true;revealedCards=[];lobby();}}else if(page>=0)lobby();else view('menu')}});
const tradeScript=document.createElement('script');tradeScript.src='assets/gb-trading.js?v=mail-unified-notices-20261104c';tradeScript.defer=true;document.head.appendChild(tradeScript);

// Exclusive full-collection frame FIT TEST only. This dialog makes no database writes.
const gbcfCss=document.createElement('style');gbcfCss.textContent=`
.gbcf-testbar{display:flex;align-items:center;flex-direction:column;gap:6px;padding:10px 12px 14px}
.gbcf-testbutton{font:700 10px/1.2 inherit;letter-spacing:1px;color:#ffdcaa;border:1px solid #a26b9e;border-radius:11px;background:#321a39;padding:8px 11px;cursor:pointer}
.gbcf-testbar small{font-size:10px;color:#c6a7d2;text-align:center}
.gbcf-shade{position:fixed;z-index:2147483000;inset:0;background:rgba(0,0,0,.87);display:flex;align-items:center;justify-content:center;padding:10px;box-sizing:border-box}
.gbcf-box{position:relative;width:min(94vw,440px);max-height:91dvh;overflow:auto;border:2px solid #b05db3;border-radius:16px;padding:14px;background:#180f27;text-align:center;color:#ffe9e4;box-sizing:border-box;box-shadow:0 0 28px #9724ae55}
.gbcf-box h3{font-size:17px;margin:4px 30px 8px;letter-spacing:.5px}.gbcf-box p{font-size:11px;color:#ddc1e7;margin:7px 0}
.gbcf-close{position:absolute;right:10px;top:8px;background:#462a57;color:white;border:1px solid #a67cb4;border-radius:8px;font-size:18px;width:30px;height:30px}
.gbcf-avatar-wrap{position:relative;width:min(66vw,260px);aspect-ratio:1;margin:8px auto 12px;isolation:isolate}
.gbcf-avatar{position:absolute;z-index:1;width:70%;height:70%;object-fit:cover;border-radius:50%;left:15%;top:15%;background:#291b3b}
.gbcf-art{position:absolute;z-index:2;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}
.gbcf-choices{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:12px auto}
.gbcf-choice{border:1px solid #775074;background:#35233f;color:white;border-radius:8px;min-height:68px;padding:4px 2px;font-size:10px;cursor:pointer}
.gbcf-choice img{display:block;object-fit:contain;height:43px;width:100%}.gbcf-choice[aria-pressed=true]{border-color:#ffe4a0;box-shadow:0 0 7px #f8b967}
.gbcf-unavailable{opacity:.5}.gbcf-warning{font-size:10px;color:#ffd7a1}
`;document.head.appendChild(gbcfCss);
const gbcfFrames=[{number:1,src:'assets/collectibles/reward-icons/hungry_gate_frame.webp'},...Array.from({length:8},(_,i)=>({number:i+2,src:'assets/collectibles/completion-frames/completion_'+String(i+2).padStart(2,'0')+'.webp'}))];
let gbcfSelected=1,gbcfOverlay=null;
function gbcfOpen(){if(gbcfOverlay)return;gbcfSelected=1;gbcfOverlay=document.createElement('div');gbcfOverlay.className='gbcf-shade';gbcfOverlay.setAttribute('role','dialog');gbcfOverlay.setAttribute('aria-modal','true');gbcfOverlay.setAttribute('aria-label','Completion frame preview');document.body.appendChild(gbcfOverlay);gbcfDraw();}
function gbcfClose(){gbcfOverlay?.remove();gbcfOverlay=null;}
function gbcfDraw(){if(!gbcfOverlay)return;
 const frame=gbcfFrames.find(x=>x.number===gbcfSelected)||gbcfFrames[0];
 const avatar=document.getElementById('gbMenuAvatar')?.currentSrc||document.getElementById('gbMenuAvatar')?.src||'assets/avatars/01_Mr_Walker.png';
 gbcfOverlay.innerHTML=`<section class="gbcf-box"><button type="button" class="gbcf-close" id="gbcfClose" aria-label="Close">×</button><h3>EXCLUSIVE FRAME FIT TEST</h3><p>Frame ${gbcfSelected} of 10 · ${gbcfSelected===1?'Hungry Gate':'Collection completion '+gbcfSelected}</p><div class="gbcf-avatar-wrap"><img class="gbcf-avatar" alt="Your current profile photo" src="${avatar.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"><img class="gbcf-art" alt="Exclusive frame" ${gbcfSelected===1?'data-gbc-fallback="png"':''} src="${frame.src}"></div><div class="gbcf-choices">${gbcfFrames.map(x=>`<button type="button" class="gbcf-choice" data-gbcf-frame="${x.number}" aria-pressed="${x.number===gbcfSelected}"><img src="${x.src}" ${x.number===1?'data-gbc-fallback="png"':''} alt="">${x.number}</button>`).join('')}<button type="button" class="gbcf-choice gbcf-unavailable" disabled aria-label="Frame 10 not supplied">10 · pending</button></div><p class="gbcf-warning">TEST ONLY: no frame ownership, coins or lives are awarded.</p><p>PFP stays at its original size and is clipped to the actual transparent opening of each decorative frame.</p></section>`;
}
document.addEventListener('click',e=>{if(!gbcfOverlay)return;const choice=e.target.closest('[data-gbcf-frame]');if(choice){gbcfSelected=Number(choice.dataset.gbcfFrame);gbcfDraw();return;}if(e.target.closest('#gbcfClose')||e.target===gbcfOverlay){gbcfClose();}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&gbcfOverlay){gbcfClose();e.stopImmediatePropagation();}},true);


// Prefer optimized assets but recover automatically when a WebP upload is absent.
// Album art / rewards / Hungry Gate test only; collectible cards use their own ordered fallback above.
document.addEventListener('error',e=>{
 const img=e.target;
 if(!(img instanceof HTMLImageElement)||img.dataset.gbcFallback!=='png')return;
 const src=img.getAttribute('src')||'';
 if(!/\.webp(?:[?#]|$)/i.test(src))return;
 img.removeAttribute('data-gbc-fallback');
 img.src=src.replace(/\.webp(?=([?#]|$))/i,'.png');
},true);

const tab=$('collectibles');if(tab)tab.onclick=()=>{lobby();view('gbCollectView');void loadOwnership()};
})();
