/* Gore Burst Collectibles UI preview. No cloud writes, no economy mutations. */
(()=>{'use strict';
const A='assets/', albums=[
['Mr. Walker','walker.webp','#c73b86'],['Broken Toys','bear.png','#b36c8b'],['Twisted Carnival','star.png','#e2a456'],['Laughing Nightmares','clownbomb.png','#a649ad'],['Jarred Curiosities','ghost-green.png','#40a98a'],['Midnight Rides','ferris.png','#456fc2'],['Forbidden Tricks','booster-cards.webp','#8b5cc7'],['Freakshow Faces','rabbit.png','#bd5779'],['Cursed Keepsakes','heart.png','#a9366f'],['Ghostly Attractions','ghost-blue.png','#46a6bc'],['The Puppet Theatre','booster-musicbox.webp','#a66fbd'],['The Crooked Menagerie','bear.png','#72a884']
];
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
const $=id=>document.getElementById(id);let page=-1;const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const view=id=>{document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id))};
function lobby(){page=-1;$('gbcBarTitle').textContent='COLLECTIBLES';$('gbcBack').textContent='‹ BACK';$('gbcContent').innerHTML='<h1 class="gbc-headline">THE CURSED COLLECTION</h1><p class="gbc-sub">12 albums · 108 cards · One very strange carnival</p><div class="gbc-total"><strong>COMPLETE THE COLLECTION</strong><small>10,000 Skull Coins · 24 hours lives · 1 special PFP frame</small><div class="gbc-progress"><span style="width:0%"></span></div><small>Preview only · 0 / 108 collected</small></div><div class="gbc-albums">'+albums.map((a,i)=>`<button class="gbc-album ${i===0?'featured':''}" type="button" data-album="${i}" aria-label="Open ${esc(a[0])}"><span class="gbc-album-pic" style="--gbc-light:${a[2]}"><img src="${A+esc(a[1])}" alt=""></span><span class="gbc-album-name">${esc(a[0])}</span><span class="gbc-count">0 / 9</span><span class="gbc-tiny">VIEW ALBUM</span></button>`).join('')+'</div><p class="gbc-note">All albums are open for preview. No cards or rewards have been awarded.</p>';$('gbcContent').scrollTop=0;}
function album(i){
 page=i;const a=albums[i], arr=albumNames(i),rr=rewards[i];
 $('gbcBarTitle').textContent='ALBUM';$('gbcBack').textContent='‹ ALBUMS';
 const description=blurbs[i];
 $('gbcContent').innerHTML=`<div class="gbc-person"><img src="${A+(i===0?'walker.webp':a[1])}" alt=""><div><h2>${esc(a[0])}</h2><p>${esc(description)}</p></div></div><div class="gbc-rewards"><div class="gbc-reward"><img src="${A}coin-skull-new.png" alt=""><b>${rr[0]}</b>SKULL COINS</div><div class="gbc-reward"><img src="${A+rr[1]}" alt=""><b>${esc(rewardDetails[i][0])}</b></div><div class="gbc-reward"><img src="${A+rr[2]}" alt=""><b>${esc(rewardDetails[i][1])}</b></div></div><div class="gbc-cards">${arr.map((name,k)=>`<button class="gbc-card" type="button" data-card="${k}" aria-label="View card ${esc(name)}">${art(i,k,name)}<span class="gbc-card-stars">${'★'.repeat(rarities[k])}</span><span class="gbc-card-label">${esc(name)}</span></button>`).join('')}</div><p class="gbc-note">Card artwork appears as soon as its correctly named PNG is uploaded. Tap a card to view details. Trading is not active yet.</p>`;
 $('gbcContent').scrollTop=0;
}
function card(k){
 if(page<0)return;
 const name=albumNames(page)[k];
 $('gbcModal').innerHTML=`<div class="gbc-card-pane" role="dialog" aria-modal="true" aria-label="Card detail">${art(page,k,name)}<h3>${esc(name)}</h3><div class="gbc-card-stars">${'★'.repeat(rarities[k])}</div><p>Album: ${esc(albums[page][0])}<br>Card preview · Not yet owned<br>Friend trading will be added later.</p><div class="gbc-modal-actions"><button class="gbc-btn" type="button" id="gbcCloseCard">CLOSE</button><button class="gbc-btn" type="button" disabled title="Trading is not active yet">TRADE · SOON</button></div></div>`;
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
$('gbcContent').addEventListener('click',e=>{const a=e.target.closest('[data-album]');if(a){album(+a.dataset.album);return}const c=e.target.closest('[data-card]');if(c)card(+c.dataset.card)});
$('gbcBack').addEventListener('click',()=>page<0?view('menu'):lobby());$('gbcHome').addEventListener('click',()=>view('menu'));
$('gbcModal').addEventListener('click',e=>{if(e.target.id==='gbcModal'||e.target.id==='gbcCloseCard')$('gbcModal').hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&screen.classList.contains('active')){if(!$('gbcModal').hidden)$('gbcModal').hidden=true;else if(page>=0)lobby();else view('menu')}});
const tab=$('collectibles');if(tab)tab.onclick=()=>{lobby();view('gbCollectView')};
})();
