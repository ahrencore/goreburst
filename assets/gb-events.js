'use strict';
/* Gore Burst event module: separate from standard progression, deliberately no cloud-score writes. */
const evRoot=document.getElementById('gbEventsView');
const evStoreKey='gb-events-local-v1';
let evData={dailyDay:'',missions:{},claims:[],spins:0,spinDay:'',weeklyKey:'',weeklyStage:1,weeklyBest:0,clashKey:'',clashPoints:0,clashSudoku:0,clashLines:0};
try{evData={...evData,...JSON.parse(localStorage.getItem(evStoreKey)||'{}')}}catch{}
const evSave=()=>{try{localStorage.setItem(evStoreKey,JSON.stringify(evData))}catch{}};
const evNow=()=>new Date();
const evDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(evNow());
function evKLparts(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'numeric',day:'numeric',weekday:'short'}).formatToParts(evNow());return Object.fromEntries(p.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]))}
function evWeek(){const p=evKLparts(),date=new Date(Date.UTC(+p.year,+p.month-1,+p.day)),dow=date.getUTCDay();date.setUTCDate(date.getUTCDate()-(dow+6)%7);return date.toISOString().slice(0,10)}
// Countdown is presentation-only. Event boundaries are calculated in the established game calendar.
function evCountdownText(target){const delta=Math.max(0,target-Date.now());if(!delta)return '0H';const hours=Math.ceil(delta/3600000),days=Math.floor(hours/24);return days?`${days}D ${hours%24}H`:`${hours}H`;}
function evClashEnd(){return EV_EPOCH+(evClashKey()+1)*172800000;}
function evWeeklyBoundary(){const p=evKLparts(),today=new Date(Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day)));const day=today.getUTCDay();const jump=evOpenWeek()?(6-day):(day===6?2:1);return Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day)+jump)-8*3600000;}
function evBindCountdown(id,getEnd){const node=evRoot.querySelector('#'+id);if(!node)return;node.textContent=evCountdownText(getEnd());const handler=()=>{if(!node.isConnected){clearInterval(timer);return}node.textContent=evCountdownText(getEnd())};const timer=setInterval(handler,60000);}
function evOpenWeek(){let d=evKLparts().weekday;return ['Mon','Tue','Wed','Thu','Fri'].includes(d)}
const EV_EPOCH=Date.parse('2026-10-25T16:00:00Z');
const evClashKey=()=>Math.floor((Date.now()-EV_EPOCH)/172800000);
function evRefresh(){const day=evDay(),week=evWeek(),clash=evClashKey();if(evData.dailyDay!==day){evData.dailyDay=day;evData.missions={};evData.claims=[]}if(evData.spinDay!==day){evData.spinDay=day;evData.spins=0}if(evData.weeklyKey!==week){evData.weeklyKey=week;evData.weeklyStage=1;evData.weeklyBest=0}if(evData.clashKey!==clash){evData.clashKey=clash;evData.clashPoints=0;evData.clashSudoku=0;evData.clashLines=0}evSave()}
evRefresh();
const evMissions=[
 ['Welcome to the Freakshow','attempts',2,'100 coins',{coins:100}],
 ['Heartbreaker','hearts',30,'100 coins',{coins:100}],
 ['Star Collector','matches',10,'1 Rocket',{RV:1}],
 ['Rocket Science','rockets',1,'1 Clownbomb',{CB:1}],
 ['Clowning Around','matches',15,'150 coins',{coins:150}],
 ['Spin Me Around','pieces',25,'1 Ferris Wheel',{FW:1}],
 ['The Chain Reaction','swaps',10,'150 coins',{coins:150}],
 ['Ghostbusters','ghosts',2,'1 Circus Hammer',{hammer:1}],
 ['Special Treatment','specials',1,'1 Art of Distraction',{cards:1}],
 ["Mr. Walker's Favorite",'attempts',5,'1 Surprise Music Box',{musicbox:1}]
];
function evMission(i){let [name,key,target,reward]=evMissions[i];if(i===7&&save.current<4){key='pieces';target=15;name='Freakshow Collector'}return {name,key,target,reward}}
// Compact, plain-language instructions for the existing ten mission objectives.
// Keep targets tied to evMission(), including the early-game Ghostbusters substitute.
function evMissionDescription(i,q){
 switch(i){
  case 0: return `Attempt ${q.target} levels`;
  case 1: return `Collect ${q.target} Hearts`;
  case 2: return `Make ${q.target} matches`;
  case 3: return `Create ${q.target} Rocket special`;
  case 4: return `Make ${q.target} matches`;
  case 5: return `Collect ${q.target} pieces`;
  case 6: return `Make ${q.target} swaps`;
  case 7: return q.key==='ghosts'?`Clear ${q.target} Ghosts`:`Collect ${q.target} pieces`;
  case 8: return `Create ${q.target} special piece`;
  case 9: return `Attempt ${q.target} levels`;
  default: return '';
 }
}
function evDailyReadyCount(){evRefresh();return evMissions.reduce((n,_,i)=>{const q=evMission(i);return n+(!evData.claims.includes(i)&&(evData.missions[q.key]||0)>=q.target?1:0)},0)}
function evUpdateRewardDots(){
 const ready=evDailyReadyCount()>0;
 // All claimable event rewards funnel through this indicator predicate. Never flag completed claims.
 const wheelReady=evData.spins===0;const flags={daily:ready,wheel:wheelReady};const any=Object.values(flags).some(Boolean);
 document.querySelectorAll('[data-ev="daily"]').forEach(card=>{card.classList.toggle('ev-has-reward',ready);card.setAttribute('aria-label','Daily Quests'+(ready?' — rewards ready':''))});
 document.querySelectorAll('[data-ev="wheel"]').forEach(card=>{card.classList.toggle('ev-has-reward',wheelReady);card.setAttribute('aria-label','Wheel of Misfortune'+(wheelReady?' — free spin available':''))});
 const button=document.getElementById('events');if(button){button.classList.toggle('ev-tab-has-reward',any);button.setAttribute('aria-label','Events'+(any?' — rewards ready':''));}
}
const evRewardIcon={coins:'assets/coin-skull-new.png',RV:'assets/rocket-h.png',CB:'assets/clownbomb.png',FW:'assets/ferris.png',hammer:'assets/booster-hammer.webp',cards:'assets/booster-cards.webp',musicbox:'assets/booster-musicbox.webp',watch:'assets/booster-watch.webp'};
function evRewardArt(i){const reward=evMissions[i][4];return Object.entries(reward).map(([key,n])=>`<span class="ev-daily-reward" title="${key==='coins'?'Skull Coins':key==='RV'?'Rocket':key==='CB'?'Clownbomb':key==='FW'?'Ferris Wheel':key==='hammer'?'Circus Hammer':key==='cards'?'Art of Distraction':key==='musicbox'?'Surprise Music Box':key}"><img src="${evRewardIcon[key]||evRewardIcon.coins}" alt="" draggable="false"><b>×${n}</b></span>`).join('')}
function dailyRecord(key,num=1){evRefresh();evData.missions[key]=Math.max(0,(evData.missions[key]||0)+num);evSave();evUpdateRewardDots()}
function evAward(reward){for(const [key,n] of Object.entries(reward)){if(key==='coins')save.coins=Math.max(0,save.coins+n);else if(['RV','CB','FW'].includes(key))save.preSpecials[key]=(save.preSpecials[key]||0)+n;else save.boosterInventory[key]=(save.boosterInventory[key]||0)+n}persist();}
function evBtn(text,fn,cls=''){const b=document.createElement('button');b.className='ev-btn '+cls;b.textContent=text;b.addEventListener('click',fn);return b}
function evHeader(title,back){return `<div class="ev-head"><button class="ev-btn ev-btn-alt" data-ev-back>‹ BACK</button><strong>${title}</strong><span>✦</span></div>`}
function evDisplay(html,back=evHome){evRoot.innerHTML=html;evRoot.hidden=false;evRoot.scrollTop=0;evRoot.querySelector('[data-ev-back]')?.addEventListener('click',back);}
function evExit(){evRoot.hidden=true;evRoot.innerHTML='';menu()}
function evHome(){evRefresh();let stats=`${evData.weeklyBest} stages cleared`;evDisplay(`${evHeader('THE FREAKSHOW',evExit)}<div class="ev-banner" role="button" tabindex="0" id="evWeeklyCard"><span class="ev-kicker">MAIN EVENT · MONDAY–FRIDAY</span><h2>Mr. Walker's Weekly Nightmare <small class="ev-countdown" id="evWeeklyHomeCountdown">${evCountdownText(evWeeklyBoundary())}</small></h2><span>${evOpenWeek()?'LIVE NOW · '+stats:'CLOSED · REOPENS MONDAY'}</span></div><div class="ev-cards"><button class="ev-card" data-ev="daily"><div class="ev-promo ev-promo-art"><img src="assets/promo-daily-quests.png" alt="" loading="lazy" draggable="false"></div><b>Daily Quests</b><small>10 tasks every day</small></button><button class="ev-card" data-ev="wheel"><div class="ev-promo ev-promo-art"><img src="assets/promo-wheel-misfortune.png" alt="" loading="lazy" draggable="false"></div><b>Wheel of Misfortune</b><small>One free spin daily</small></button><button class="ev-card" data-ev="ghost"><div class="ev-promo ev-promo-art"><img src="assets/promo-hall-of-stars.png" alt="" loading="lazy" draggable="false"></div><b>Hall of Stars</b><small>Ghost Parade · All-time top 10 stars</small></button><button class="ev-card" data-ev="clash"><div class="ev-promo ev-promo-art"><img src="assets/promo-carnival-clash.png" alt="" loading="lazy" draggable="false"></div><b>Carnival Clash</b><small>Sudoku + Haunting Tetris</small></button></div>`,evExit);evRoot.querySelector('[data-ev-back]').onclick=evExit;evRoot.querySelector('#evWeeklyCard').onclick=evWeekly;evRoot.querySelector('#evWeeklyCard').onkeydown=e=>{if(e.key==='Enter')evWeekly()};for(const b of evRoot.querySelectorAll('[data-ev]'))b.onclick=({daily:evDaily,wheel:evWheel,ghost:evGhost,clash:evClash})[b.dataset.ev];evBindCountdown('evWeeklyHomeCountdown',evWeeklyBoundary);evUpdateRewardDots();}
document.getElementById('events').onclick=()=>{ensureAudioGesture?.();evHome()};
function evDaily(){
 evRefresh();
 const claimedCount=evData.claims.length;
 const sorted=evMissions.map((_,i)=>{const q=evMission(i),done=Math.min(q.target,evData.missions[q.key]||0),claimed=evData.claims.includes(i);return {i,q,done,claimed,ready:!claimed&&done>=q.target}}).sort((a,b)=>Number(b.ready)-Number(a.ready)||Number(a.claimed)-Number(b.claimed)||a.i-b.i);
 const items=sorted.map(({i,q,done,claimed,ready})=>`<div class="ev-daily-item ${claimed?'ev-daily-claimed':ready?'ev-daily-ready':'ev-daily-pending'}"><div class="ev-daily-content"><div class="ev-daily-info"><b>${q.name}</b><span class="ev-daily-objective">${evMissionDescription(i,q)}</span><small>${done}/${q.target}</small><div class="ev-meter"><span style="width:${done/q.target*100}%"></span></div></div><div class="ev-daily-art">${evRewardArt(i)}</div></div><button class="ev-daily-claim" type="button" data-claim="${i}" ${claimed||!ready?'disabled':''}>${claimed?'CLAIMED':ready?'CLAIM':'IN PROGRESS'}</button></div>`).join('');
 evDisplay(`${evHeader('DAILY MISSIONS')}<section class="ev-daily-panel"><h2>TEN TICKETS TO TROUBLE</h2><p class="ev-daily-counter">${claimedCount} / 10 CLAIMED · RESETS DAILY</p><div class="ev-daily-list">${items}</div></section>`);
 evRoot.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{const i=+b.dataset.claim,q=evMission(i);if(evData.claims.includes(i)||(evData.missions[q.key]||0)<q.target)return;evData.claims.push(i);evAward(evMissions[i][4]);evSave();evUpdateRewardDots();playSfx('victory');evDaily()});evUpdateRewardDots();
}
const evWheelPrizes=[{label:'ROCKET',reward:{RV:1}},{label:'CLOWNBOMB',reward:{CB:1}},{label:'FERRIS WHEEL',reward:{FW:1}},{label:'HAMMER',reward:{hammer:1}},{label:'WATCH',reward:{watch:1}},{label:'500 COINS',reward:{coins:500}},{label:'300 COINS',reward:{coins:300}},{label:'100 COINS',reward:{coins:100}},{label:'MYSTERY BOOSTER',reward:null},{label:'LOSE 1 LIFE',negative:'life'},{label:'−100 COINS',negative:'coins'},{label:'LOSER!',negative:'loser'}];
// Wheel of Misfortune spin only: W2 Enchanted Misfortune.
// Separate from the Ferris Wheel special's `playSfx('wheel')` cue.
function evPlayWheelSpinW2(){
  try {
    if(typeof gbPrefs!=='undefined' && !gbPrefs.sound) return;
    const volume=typeof gbPrefs!=='undefined' ? Math.max(0,Math.min(100,Number(gbPrefs.soundVolume)||0))/100 : 0.75;
    if(volume<=0) return;
    const audio=new Audio('assets/sfx/wheel-misfortune-w2.mp3');
    audio.volume=volume;
    audio.play().catch(()=>{});
  } catch(e) {}
}
let evWheelAngle=0,evSpinning=false;
function evWheelCost(){return evData.spins===0?0:Math.min(1000,evData.spins*200)}
function evWheel(){evRefresh();const base='assets/events/';const layer=(name,cls)=>`<img class="${cls}" src="${base}${name}.png" alt="">`;evDisplay(`${evHeader('WHEEL OF MISFORTUNE')}<div class="ev-panel ev-wheel-panel"><div class="ev-wheel-wallet">Skull Coins: <b id="evWheelCoins">${save.coins}</b> · Spins today: <b id="evSpinCount">${evData.spins}</b></div><div class="ev-wheel-wrap ev-wheel-glow">${layer('02_rotating_disc','ev-disc')}${layer('01_stationary_frame','ev-rim')}${layer('04_center_medallion','ev-center')}${layer('03_fixed_pointer','ev-pointer')}</div><div class="ev-btn-row"><button class="ev-btn ev-wheel-spin-btn" id="evSpinBtn">${evWheelCost()===0?'FREE SPIN':'SPIN · '+evWheelCost()+' COINS'}</button></div><div id="evWheelResult" class="ev-gift"></div></div>`);const disc=evRoot.querySelector('.ev-disc');disc.style.transform=`rotate(${evWheelAngle}deg)`;evRoot.querySelector('#evSpinBtn').onclick=async()=>{if(evSpinning)return;const cost=evWheelCost();if(save.coins<cost){evRoot.querySelector('#evWheelResult').textContent='Not enough Skull Coins!';return}if(cost&&!confirm(`Spin for ${cost} Skull Coins?`))return;save.coins-=cost;evData.spins++;evSave();persist();evUpdateRewardDots();evSpinning=true;const btn=evRoot.querySelector('#evSpinBtn');btn.disabled=true;const idx=Math.floor(Math.random()*evWheelPrizes.length),prize=evWheelPrizes[idx];const angleEnd=(360-idx*30)%360;evWheelAngle+=1800+((angleEnd-(evWheelAngle%360)+360)%360);disc.style.transform=`rotate(${evWheelAngle}deg)`;evPlayWheelSpinW2();await new Promise(r=>setTimeout(r,4050));if(prize.negative==='life'){regenLives();if(save.lives>0){if(save.lives===5)save.lifeTick=Date.now();save.lives--;persist()}}else if(prize.negative==='coins'){save.coins=Math.max(0,save.coins-100);persist()}else if(!prize.negative){const reward=prize.reward||{[BOOSTERS[Math.floor(Math.random()*BOOSTERS.length)].id]:1};evAward(reward)}const notice=prize.negative==='loser'?'LOSER! Better luck next spin.':prize.label;evSpinning=false;evRoot.querySelector('#evWheelResult').textContent=notice;evRoot.querySelector('#evWheelCoins').textContent=save.coins;evRoot.querySelector('#evSpinCount').textContent=evData.spins;btn.textContent='SPIN · '+evWheelCost()+' COINS';btn.disabled=false;playSfx(prize.negative?'fail':'victory')};}
function evGhost(){
  evRefresh();
  const own=Object.values(save.best||{}).reduce((sum,v)=>sum+Math.min(3,Math.max(0,Number(v)||0)),0);
  evDisplay(`${evHeader('GHOST PARADE')}<section class="ev-panel ev-ghost-shell"><div class="ev-ghost-title"><h2>👻 Hall of Stars</h2></div><div class="ev-ghost-stars"><span>Current Stars</span><strong>${own} ★</strong></div><section class="ev-ghost-board"><div class="ev-ghost-board-head"><h3>All-Time Top 10 Players</h3></div><div id="gbGhostOnlineRows" class="ev-ghost-loading" aria-live="polite">Loading rankings…</div><button class="ev-btn ev-ghost-refresh" id="gbGhostReload" type="button">REFRESH</button></section></section>`);
  evRoot.querySelector('#gbGhostReload').onclick=evFetchGhostParade;
  evFetchGhostParade();
}
function evGhostEscape(input){return String(input??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function evFetchGhostParade(){
  const rows=evRoot.querySelector('#gbGhostOnlineRows');
  if(!rows)return;
  rows.innerHTML='<div class="ev-ghost-message">Loading rankings…</div>';
  if(typeof window.gbGhostParadeFetch!=='function'){
    rows.innerHTML='<div class="ev-ghost-message">Sign in to view the leaderboard.</div>';
    return;
  }
  try{
    const response=await window.gbGhostParadeFetch();
    if(!rows.isConnected)return;
    if(response.error){rows.innerHTML=`<div class="ev-ghost-message">${evGhostEscape(response.error)}</div>`;return}
    if(!response.rows?.length){rows.innerHTML='<div class="ev-ghost-message">No stars recorded yet.</div>';return}
    rows.innerHTML=response.rows.slice(0,10).map(r=>{
      const rank=Number(r.rank_position)||0;
      const rankClass=rank===1?' is-top1':rank===2?' is-top2':rank===3?' is-top3':'';
      return `<div class="ev-ghost-row${rankClass}"><div class="ev-ghost-rankwrap"><span class="ev-ghost-rank">#${rank}</span><img class="ev-ghost-avatar" src="${evGhostEscape(window.gbGhostAvatarUrl?.(r)||'assets/avatars/01_Mr_Walker.png')}" alt="" loading="lazy"><span class="ev-ghost-name">${evGhostEscape(r.display_name||'Carnival Guest')}</span></div><strong class="ev-ghost-score">${Number(r.total_stars||0).toLocaleString()} ★</strong></div>`;
    }).join('');
  }catch(e){if(rows.isConnected)rows.innerHTML=`<div class="ev-ghost-message">Could not load leaderboard: ${evGhostEscape(e?.message||'Network error')}</div>`}
}
const evClashPrizeData=[
  {place:'#1',coins:1000,rewards:[['assets/ferris.png','Ferris Wheel',3]]},
  {place:'#2',coins:700,rewards:[['assets/clownbomb.png','Clownbomb',2]]},
  {place:'#3',coins:400,rewards:[['assets/rocket-h.png','Rocket',2]]},
  {place:'#4 - 5',coins:300,rewards:[['assets/clownbomb.png','Clownbomb',1]]},
  {place:'#6 - 10',coins:200,rewards:[['assets/rocket-h.png','Rocket',1]]}
];
function evClash(){
  evRefresh();
  evDisplay(`${evHeader('CARNIVAL CLASH')}<section class="ev-clash-intro"><div class="ev-event-title"><h2>THE HAUNTED ARCADE</h2><span class="ev-countdown" id="evClashCountdown" aria-label="Time remaining in this round">${evCountdownText(evClashEnd())}</span></div><p class="ev-dim ev-clash-copy">Earn points from any of these games.</p></section><div class="ev-cards ev-clash-cards"><button type="button" class="ev-card ev-clash-card ev-clash-compact" id="evSudoku" aria-label="Play Creepy Sudoku"><div class="ev-clash-art ev-clash-art-sudoku" aria-hidden="true"></div></button><button type="button" class="ev-card ev-clash-card ev-clash-compact" id="evTetris" aria-label="Play Haunting Tetris"><div class="ev-clash-art ev-clash-art-tetris" aria-hidden="true"></div></button></div><section class="ev-panel ev-clash-board"><h3>GLOBAL CARNIVAL CLASH LEADERBOARD</h3><div class="ev-clash-status" id="evClashStatus" aria-live="polite">Loading live rankings…</div><div id="evClashRows" class="ev-clash-rows" aria-live="polite"></div><div class="ev-clash-actions"><button type="button" class="ev-btn ev-btn-alt ev-clash-refresh" id="evClashRefresh">REFRESH</button><button type="button" class="ev-btn ev-clash-rewards-btn" id="evClashRewardsBtn">REWARDS</button></div></section>`);
  evRoot.querySelector('#evSudoku').onclick=evSudokuMenu;
  evRoot.querySelector('#evTetris').onclick=evTetrisStart;
  evRoot.querySelector('#evClashRefresh').onclick=evFetchClash;
  evRoot.querySelector('#evClashRewardsBtn').onclick=evClashRewardsView;
  evFetchClash();
  evBindCountdown('evClashCountdown',evClashEnd);
}
async function evFetchClash(){
  const status=evRoot.querySelector('#evClashStatus'),rows=evRoot.querySelector('#evClashRows');
  if(!status||!rows)return;
  status.textContent='Loading live rankings…';
  rows.innerHTML='';
  if(typeof window.gbClashLeaderboardFetch!=='function'){
    status.textContent='Sign in to view rankings.';
    return;
  }
  try{
    const result=await window.gbClashLeaderboardFetch();
    if(!status.isConnected||!rows.isConnected)return;
    if(result.error){status.textContent=result.error;return}
    status.textContent='';
    if(!result.rows?.length){rows.innerHTML='<div class="ev-clash-message">No online scores this round yet.</div>';return}
    rows.innerHTML=result.rows.slice(0,10).map(r=>{
      const rank=Number(r.rank_position)||0;
      const rankClass=rank===1?' is-top1':rank===2?' is-top2':rank===3?' is-top3':'';
      return `<div class="ev-clash-row${rankClass}"><div class="ev-clash-rankwrap"><span class="ev-clash-rank">#${rank}</span><img class="ev-clash-avatar" src="${evGhostEscape(window.gbGhostAvatarUrl?.(r)||'assets/avatars/01_Mr_Walker.png')}" alt="" loading="lazy"><span class="ev-clash-name">${evGhostEscape(r.display_name||'Carnival Guest')}</span></div><strong class="ev-clash-score">${Number(r.points||0).toLocaleString()} pts</strong></div>`;
    }).join('');
  }catch(error){if(status.isConnected)status.textContent='Could not load rankings: '+(error.message||'Network error')}
}
function evClashRewardsView(){
  const rows=evClashPrizeData.map(p=>`<div class="ev-clash-prize-row"><div class="ev-clash-prize-place">${p.place}</div><div class="ev-clash-prize-loot"><div class="ev-clash-loot-item"><img src="assets/coin-skull-new.png" alt="Coins"><span>${Number(p.coins).toLocaleString()}</span></div>${p.rewards.map(([src,label,count])=>`<div class="ev-clash-loot-item"><img src="${src}" alt="${label}"><span>${count>1?'x'+count:label==='Rocket'?'x1':'x1'}</span></div>`).join('')}</div></div>`).join('');
  evDisplay(`${evHeader('REWARDS',evClash)}<section class="ev-panel ev-clash-rewards-screen"><h2>HAUNTED ARCADE REWARDS</h2><div class="ev-clash-prize-list">${rows}</div></section>`,evClash);
}
function evClashEarn(type,amount){if(typeof window.gbClashSubmit==='function')window.gbClashSubmit(type,amount).catch(e=>console.warn('Clash score was not synced:',e));}
function evWeekly(){
 evRefresh();
 evDisplay(`${evHeader('WEEKLY NIGHTMARE')}<section class="ev-nightmare-lobby">
 <div class="ev-nightmare-art" aria-hidden="true"></div>
 <div class="ev-nightmare-status"><span>${evOpenWeek()?'LIVE NOW':'CLOSED'}</span><span class="ev-countdown" id="evWeeklyDetailCountdown">${evCountdownText(evWeeklyBoundary())}</span></div>
 <div class="ev-nightmare-stage">STAGE: ${evData.weeklyStage}</div>
 <button class="ev-nightmare-enter" id="evWeeklyGo" ${!evOpenWeek()?'disabled':''}>${evOpenWeek()?'ENTER NIGHTMARE':'REOPENS MONDAY'}</button>
 </section><section class="ev-nightmare-ranks"><h2>WEEKLY TOP 10</h2><div id="evNightmareRankings" class="ev-nightmare-rank-list">Loading rankings…</div><button class="ev-nightmare-rewards" id="evWeeklyRewards">VIEW REWARDS</button></section>`);
 evRoot.querySelector('#evWeeklyGo').onclick=evStartWeeklyStage;
 evRoot.querySelector('#evWeeklyRewards').onclick=evWeeklyRewards;
 evBindCountdown('evWeeklyDetailCountdown',evWeeklyBoundary);
 evLoadWeeklyRankings();
}
// Approved Weekly Nightmare prize display. This does not alter leaderboard scoring or payout processing.
const evWeeklyPrizes=[
  {place:'#1',coins:5000,specials:3,boosters:2},
  {place:'#2',coins:3000,specials:2,boosters:1},
  {place:'#3',coins:1500,specials:1,boosters:1},
  {place:'#4 – #10',coins:1000,specials:0,boosters:0}
];
const evWeeklyIconRewards=[
  ['assets/rocket-h.png','Rocket','specials'],
  ['assets/clownbomb.png','Clownbomb','specials'],
  ['assets/ferris.png','Ferris Wheel','specials'],
  ['assets/booster-hammer.webp','Circus Hammer','boosters'],
  ['assets/booster-watch.webp',"Mr. Walker's Watch",'boosters'],
  ['assets/booster-cards.webp','Art of Distraction','boosters'],
  ['assets/booster-musicbox.webp','Surprise Music Box','boosters']
];
function evWeeklyRewards(){
  const rows=evWeeklyPrizes.map((p,i)=>{
    const items=[`<span class="ev-weekly-loot-item"><img src="assets/coin-skull-new.png" alt="Skull Coins"><b>${p.coins.toLocaleString()}</b></span>`];
    for(const [src,name,key] of evWeeklyIconRewards){
      if(p[key])items.push(`<span class="ev-weekly-loot-item" title="${name}"><img src="${src}" alt="${name}"><b>×${p[key]}</b></span>`);
    }
    return `<div class="ev-weekly-prize-row ev-weekly-prize-${i+1}"><div class="ev-weekly-prize-rank">${p.place}</div><div class="ev-weekly-loot">${items.join('')}</div></div>`;
  }).join('');
  evDisplay(`${evHeader('REWARDS',evWeekly)}<section class="ev-panel ev-weekly-rewards-screen"><h2>WEEKLY NIGHTMARE REWARDS</h2><div class="ev-weekly-prize-list">${rows}</div></section>`,evWeekly);
}
async function evLoadWeeklyRankings(){const host=evRoot.querySelector('#evNightmareRankings');if(!host)return;
 if(typeof window.gbWeeklyTop10!=='function'){host.textContent='Rankings unavailable';return}
 try{const result=await window.gbWeeklyTop10();if(!host.isConnected)return;if(result.error){host.textContent='Rankings unavailable';return}
 const rows=(result.rows||[]).slice(0,10);if(!rows.length){host.textContent='No scores yet';return}
 host.replaceChildren();for(const r of rows){const line=document.createElement('div');line.className='ev-nightmare-rank-row';const rank=document.createElement('b');rank.textContent='#'+r.rank_position;const img=document.createElement('img');img.alt='';img.src=window.gbGhostAvatarUrl?.(r)||'assets/avatars/01.png';const name=document.createElement('span');name.textContent=r.display_name||'Carnival Guest';const stage=document.createElement('strong');stage.textContent=Number(r.stages_cleared||0)+' stages';line.append(rank,img,name,stage);host.append(line)}
 }catch(e){if(host.isConnected)host.textContent='Rankings unavailable';}}
function evWeeklyMask(stage){
 // Repeatable family of distinct, connected board silhouettes, minimum six columns/rows of play.
 const shapes=[
 ['..XXXX..','.XXXXXX.','XXXXXXXX','XXXXXXXX','XXXXXXXX','XXXXXXXX','.XXXXXX.','..XXXX..'],
 ['XXXXXXXX','XXXXXXXX','.XXXXXX.','..XXXX..','..XXXX..','.XXXXXX.','XXXXXXXX','XXXXXXXX'],
 ['.XXXXXX.','XXXXXXXX','XXXXXXXX','XXX..XXX','XXX..XXX','XXXXXXXX','XXXXXXXX','.XXXXXX.'],
 ['..XXXXX..','.XXXXXXX.','XXXXXXXXX','XXXXXXXXX','.XXXXXXX.','..XXXXX..','..XXXXX..','.XXXXXXX.','XXXXXXXXX'],
 ['XXXXXXXXX','XXXXXXXXX','..XXXXXXX','..XXXXXXX','XXXXXXXXX','XXXXXXX..','XXXXXXX..','XXXXXXXXX','XXXXXXXXX'],
 ['.XXXXXXX.','XXXXXXXXX','XXXXXXXXX','XXX...XXX','XXXXXXXXX','XXXXXXXXX','.XXXXXXX.','..XXXXX..','..XXXXX..']
 ];return shapes[(stage-1)%shapes.length].map(s=>s.replaceAll(' ','')).map(s=>s);
}
function evStartWeeklyStage(){evRefresh();if(!evOpenWeek()){evWeekly();return}if(!canAttempt())return;
 evRoot.hidden=true;evRoot.innerHTML='';eventRun=true;
 const stage=evData.weeklyStage;chosen=Math.min(99,Math.max(21,21+stage*5));
 const base=levelConfig(chosen);let goals;const types=['H','S','G','M','B','W','C'];const pick=types[(stage*3)%types.length];
 const amount=Math.min(44,20+Math.floor(stage*1.7));
 switch((stage-1)%6){
  case 0: goals={[pick]:amount,SL:Math.min(12,4+Math.floor(stage/2))};break;
  case 1: goals={[pick]:amount,CC:Math.min(6,2+Math.floor(stage/4))};break;
  case 2: goals={[pick]:amount,JL:Math.min(4,1+Math.floor(stage/5))};break;
  case 3: goals={[pick]:amount,FI:Math.min(3,1+Math.floor(stage/7))};break;
  case 4: goals={[pick]:amount,SL:Math.min(14,6+Math.floor(stage/2))};break;
  default: goals={[pick]:amount,RV:Math.min(5,2+Math.floor(stage/10))};break;
 }
 // Select a configuration that can actually produce the requested blocker.
 if(goals.FI)chosen=Math.max(51,chosen);
 if(goals.JL)chosen=Math.max(36,chosen);
 if(goals.CC)chosen=Math.max(21,chosen);
 conf={...base,mask:evWeeklyMask(stage),moves:Math.max(29,39-Math.floor(stage/4)),tutorial:null,goals};
 boosterTarget=null;boosterFirst=null;pinnedSpecialCells.clear();seed=((Date.now()>>>0)^(stage*9181))>>>0;
 moves=conf.moves;starPoints=0;comboChain=0;collected=Object.fromEntries(Object.keys(conf.goals).map(t=>[t,0]));score=0;phase=0;ghostRemoved=0;ghostSpawnQueue=[];mode='free';busy=false;grid=[];blockers=[];source=null;turnFireCleared=false;
 freshBoard();
 // Match blocker targets to their actual starting population, never demand absent fire.
 for(const kind of ['SL','CC','JL','FI'])if(kind in conf.goals){
  const available=blockers.flat().filter(b=>b?.kind===kind).length;
  if(!available)delete conf.goals[kind];
  else if(kind!=='FI')conf.goals[kind]=Math.min(conf.goals[kind],available);
 }
 collected=Object.fromEntries(Object.keys(conf.goals).map(t=>[t,0]));
 $('result').hidden=true;$('gbFail').hidden=true;document.querySelector('#result .gb-win-shell').hidden=false;save.pendingFailure=false;persist();show('game');$('boosters').style.display='none';$('walker').hidden=true;render();say('WEEKLY NIGHTMARE · STAGE '+stage);
}
function weeklyFinish(win){
 if(mode==='ended'||mode==='failed')return;
 const finishedStage=evData.weeklyStage;
 mode=win?'ended':'failed';busy=false;playSfx(win?'victory':'fail');$('result').hidden=true;
 if(win){evData.weeklyBest=Math.max(evData.weeklyBest,finishedStage);evData.weeklyStage++;evSave();window.gbWeeklySubmit?.(evData.weeklyBest).catch?.(()=>{})}
 else consumeFailedLife();
 // Event results are deliberately separate from the campaign's victory/failed screens.
 document.getElementById('evWeeklyResult')?.remove();
 const covered=document.createElement('div');covered.className='ev-root ev-weekly-result-view';covered.id='evWeeklyResult';
 covered.innerHTML=`<section class="ev-weekly-result-card ${win?'is-victory':'is-defeat'}" role="dialog" aria-modal="true" aria-label="Weekly Nightmare ${win?'stage cleared':'stage failed'}">
 <div class="ev-weekly-result-spark" aria-hidden="true">✦ ✧ ✦</div>
 <div class="ev-weekly-result-eyebrow">MR. WALKER'S WEEKLY NIGHTMARE</div>
 <h2>${win?'NIGHTMARE SURVIVED!':'THE NIGHTMARE CONTINUES'}</h2>
 <p class="ev-weekly-result-stage">STAGE ${finishedStage} ${win?'CLEARED':'FAILED'}</p>
 ${win?'':`<p class="ev-weekly-result-lives">♥ ${save.lives}/5 LIVES LEFT</p>`}
 <div class="ev-weekly-result-actions"><button type="button" class="ev-weekly-result-primary" id="evEventRetry" ${(!win&&save.lives<=0)||!evOpenWeek()?'disabled':''}>${win?'NEXT STAGE':'RETRY STAGE'}</button><button type="button" class="ev-weekly-result-secondary" id="evEventHome">EVENT</button></div>
 </section>`;
 document.getElementById('app').appendChild(covered);
 covered.querySelector('#evEventRetry').onclick=()=>{covered.remove();eventRun=false;evStartWeeklyStage()};
 covered.querySelector('#evEventHome').onclick=()=>{covered.remove();eventRun=false;$('boosters').style.display='';menu();evWeekly()};
}
const evOldBack=$('gameback').onclick;$('gameback').onclick=function(e){if(eventRun){if(mode==='ended'||mode==='failed')return;if(!confirm('Leave Weekly Nightmare stage? This attempt costs one life.'))return;consumeFailedLife();eventRun=false;$('boosters').style.display='';menu();evWeekly();return}evOldBack.call(this,e)};
// Intercept all ordinary result actions only for the event; standard screens stay unchanged.
const sudokuImgs=['01_Pink_Neon_Bat.png','02_Blue_Neon_Moon.png','03_Orange_Neon_Pumpkin.png','04_Green_Neon_Cat.png','05_White_Pink_Ghost.png','06_Red_Neon_Heart.png','07_Purple_Neon_Candy.png','08_Yellow_Neon_Star.png','09_Cyan_Neon_Cross.png'];
const sudokuSrc=n=>'assets/events/'+sudokuImgs[n-1];
let sudoku=null, sudokuTimer=null;
function evSudokuMenu(){
  clearInterval(sudokuTimer);
  evDisplay(`${evHeader('CREEPY SUDOKU',evClash)}<section class="ev-sudo-landing ev-neon-landing"><div class="ev-sudo-moon">☾ ✦ ☽</div><h2>CHOOSE YOUR NIGHTMARE</h2><p>Three mistakes and you're out. Finish a puzzle to score Clash Points.</p><div class="ev-sudo-difficulties">${['easy','medium','hard'].map((d,i)=>`<button type="button" class="ev-neon-imgbtn ev-sudo-difficulty" data-difficulty="${d}" aria-label="Play ${d} Sudoku"><img src="assets/events/difficulty_${d}.png" alt="${d.toUpperCase()}"><span class="ev-sudo-diff-points">+${[50,100,150][i]} CLASH POINTS</span></button>`).join('')}</div></section>`);
  evRoot.querySelectorAll('[data-difficulty]').forEach(b=>b.onclick=()=>evSudokuStart(b.dataset.difficulty));
}
function shuffled(v){const x=[...v];for(let i=x.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[x[k],x[i]]=[x[i],x[k]]}return x}
function makeSudokuSolution(){const nums=shuffled([1,2,3,4,5,6,7,8,9]);const rOrder=shuffled([0,1,2]).flatMap(b=>shuffled([0,1,2]).map(n=>b*3+n));const cOrder=shuffled([0,1,2]).flatMap(b=>shuffled([0,1,2]).map(n=>b*3+n));return Array.from({length:81},(_,i)=>nums[(rOrder[Math.floor(i/9)]*3+Math.floor(rOrder[Math.floor(i/9)]/3)+cOrder[i%9])%9])}
function evSudokuStart(difficulty){
  const answer=makeSudokuSolution(),percent={easy:.60,medium:.45,hard:.35}[difficulty];
  const count=Math.round(81*percent);
  const givens=new Set(shuffled(Array.from({length:81},(_,i)=>i)).slice(0,count));
  sudoku={answer,values:answer.map((n,i)=>givens.has(i)?n:0),givens,selected:-1,choice:0,highlight:0,mistakes:0,wrong:new Set(),notes:false,noteMarks:{},history:[],hintsLeft:1,start:Date.now(),difficulty,done:false};
  evSudokuRender();clearInterval(sudokuTimer);
  sudokuTimer=setInterval(()=>{if(!sudoku||sudoku.done)return;const el=evRoot.querySelector('#evSudoTime');if(el){const time=Math.floor((Date.now()-sudoku.start)/1000);el.textContent=`${String(Math.floor(time/60)).padStart(2,'0')}:${String(time%60).padStart(2,'0')}`}},1000);
}
function evSudokuRender(){
  const s=sudoku;if(!s)return;
  const pts={easy:50,medium:100,hard:150}[s.difficulty];
  evDisplay(`${evHeader('CREEPY SUDOKU',evSudokuMenu)}<div class="ev-sudo-shell"><div class="ev-sudo-stats"><div><small>DIFFICULTY</small><strong>${s.difficulty.toUpperCase()}</strong></div><div><small>MISTAKES</small><strong id="evSudoErrors">0 / 3</strong></div><div><small>TIME</small><strong id="evSudoTime">00:00</strong></div><div><small>WIN POINTS</small><strong>+${pts}</strong></div></div><div class="ev-sudoku-grid" id="evSudoBoard">${s.values.map((n,i)=>`<button class="ev-sudoku-cell" data-cell="${i}" aria-label="Sudoku row ${Math.floor(i/9)+1} column ${i%9+1}">${n?`<img src="${sudokuSrc(n)}" alt="">`:''}</button>`).join('')}</div><div class="ev-sudoku-tray" aria-label="Select Sudoku symbol">${sudokuImgs.map((x,i)=>`<button data-symbol="${i+1}" aria-label="Choose symbol ${i+1}"><img src="${sudokuSrc(i+1)}" alt=""><small class="ev-sudo-remain"></small></button>`).join('')}</div><div class="ev-sudo-tools">${[['evSudoHint','tool_hint','Hint'],['evSudoNotes','tool_notes','Notes'],['evSudoUndo','tool_undo','Undo'],['evSudoErase','tool_erase','Erase']].map(([id,art,label])=>`<button type="button" id="${id}" class="ev-neon-imgbtn" aria-label="${label}" title="${label}"><img src="assets/events/${art}.png" alt="${label}"></button>`).join('')}</div><p class="ev-note">Select a tile, then choose a symbol. Tap a symbol first to light up every matching tile.</p></div>`,evSudokuMenu);
  evRoot.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{const i=+b.dataset.cell;s.selected=i;if(s.values[i])s.highlight=s.values[i];evSudokuPaint()});
  evRoot.querySelectorAll('[data-symbol]').forEach(b=>b.onclick=()=>{const n=+b.dataset.symbol;if(evSudokuRemaining(n)===0)return;s.choice=n;s.highlight=n;if(s.selected>=0&&!s.givens.has(s.selected)&&s.values[s.selected]!==s.answer[s.selected]&&!s.done){if(s.notes){const i=s.selected;if(!s.values[i]){const marks=s.noteMarks[i]||[];s.noteMarks[i]=marks.includes(n)?marks.filter(x=>x!==n):[...marks,n];}evSudokuPaint()}else evSudokuPlace(n)}else evSudokuPaint()});
  evRoot.querySelector('#evSudoNotes').onclick=()=>{s.notes=!s.notes;evRoot.querySelector('#evSudoNotes').classList.toggle('active',s.notes);evRoot.querySelector('#evSudoNotes').setAttribute('aria-pressed',String(s.notes));};
  evRoot.querySelector('#evSudoErase').onclick=()=>{if(s.selected<0||s.givens.has(s.selected)||s.values[s.selected]===s.answer[s.selected]||s.done)return;s.history.push([s.selected,s.values[s.selected],s.wrong.has(s.selected)]);s.values[s.selected]=0;s.wrong.delete(s.selected);evSudokuPaint()};
  evRoot.querySelector('#evSudoUndo').onclick=()=>{if(s.done)return;let prev;while(s.history.length){const candidate=s.history.pop();if(s.values[candidate[0]]!==s.answer[candidate[0]]){prev=candidate;break}}if(prev){s.values[prev[0]]=prev[1];if(prev[2])s.wrong.add(prev[0]);else s.wrong.delete(prev[0]);s.selected=prev[0];evSudokuPaint()}};
  evRoot.querySelector('#evSudoHint').onclick=()=>{if(s.done||s.hintsLeft<=0)return;const i=s.selected>=0&&!s.givens.has(s.selected)&&s.values[s.selected]!==s.answer[s.selected]?s.selected:s.values.findIndex((n,i)=>n!==s.answer[i]&&!s.givens.has(i));if(i>=0){s.hintsLeft--;s.values[i]=s.answer[i];s.wrong.delete(i);s.selected=i;s.highlight=0;evSudokuPaint();evSudokuCheck()}};
  evSudokuPaint();
}
function evSudokuRemaining(n){const s=sudoku;return 9-s.values.filter((v,i)=>v===n&&s.answer[i]===n).length}
function evSudokuPaint(){
  const s=sudoku;if(!s)return;
  evRoot.querySelectorAll('[data-cell]').forEach(el=>{
    const i=+el.dataset.cell,n=s.values[i],r=Math.floor(i/9),c=i%9,rr=Math.floor(s.selected/9),cc=s.selected%9;
    const peer=s.selected>=0&&(r===rr||c===cc||(Math.floor(r/3)===Math.floor(rr/3)&&Math.floor(c/3)===Math.floor(cc/3)));
    const matching=s.highlight>0&&n===s.highlight&&!s.wrong.has(i);
    el.className='ev-sudoku-cell'+(s.givens.has(i)?' given':'')+(peer?' peer':'')+(matching?' same':'')+(i===s.selected?' selected':'')+(s.wrong.has(i)?' bad':'');
    el.innerHTML=n?`<img src="${sudokuSrc(n)}" alt="">`:(s.noteMarks[i]?.length?`<span class="ev-sudo-note-marks">${s.noteMarks[i].sort((a,b)=>a-b).join(' ')}</span>`:'');
  });
  evRoot.querySelectorAll('[data-symbol]').forEach(b=>{const n=+b.dataset.symbol,remaining=evSudokuRemaining(n);b.classList.toggle('selected',s.highlight===n);b.classList.toggle('completed',remaining===0);b.disabled=remaining===0;b.querySelector('small').textContent=remaining===0?'✓':remaining;});
  const hint=evRoot.querySelector('#evSudoHint');if(hint){hint.disabled=s.hintsLeft<=0;hint.classList.toggle('used',s.hintsLeft<=0);hint.setAttribute('aria-label',s.hintsLeft?'Hint: 1 remaining':'Hint: 0 remaining');hint.title=s.hintsLeft?'1 hint remaining':'No hints remaining';}
  const err=evRoot.querySelector('#evSudoErrors');if(err){err.textContent=`${s.mistakes} / 3`;err.classList.toggle('ev-sudo-danger',s.mistakes>=2)}
}
function evSudokuPlace(n){
  const s=sudoku,i=s.selected;if(i<0||s.givens.has(i)||s.values[i]===s.answer[i]||s.done)return;
  if(s.values[i]===n){evSudokuPaint();return}
  s.history.push([i,s.values[i],s.wrong.has(i)]);s.values[i]=n;
  if(n!==s.answer[i]){
    s.mistakes++;s.wrong.add(i);evSudokuPaint();
    if(s.mistakes>=3){s.done=true;clearInterval(sudokuTimer);setTimeout(()=>evSudokuEnd(false),420)}
    return;
  }
  s.wrong.delete(i);s.highlight=0;s.choice=0;evSudokuPaint();evSudokuCheck();
}
function evSudokuEnd(won,pts=0){
  const s=sudoku;if(!s)return;
  const elapsed=Math.floor((Date.now()-s.start)/1000);
  evDisplay(`${evHeader('CREEPY SUDOKU',evClash)}<section class="ev-sudo-end"><div class="ev-sudo-end-icon">${won?'✦':'☠'}</div><h2>${won?'PUZZLE COMPLETE!':'NIGHTMARE OVER'}</h2><p>${won?`You earned <b>${pts} Clash Points!</b>`:'Three mistakes. Mr. Walker is unimpressed.'}</p><div class="ev-sudo-end-stats"><span>TIME <b>${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}</b></span><span>MISTAKES <b>${s.mistakes}/3</b></span></div><button id="evSudoAgain" class="ev-neon-imgbtn" aria-label="${won?'Play another Sudoku':'Try again'}"><img src="assets/events/${won?'result_continue':'result_retry'}.png" alt="${won?'Continue':'Try again'}"></button><button id="evSudoBack" class="ev-neon-imgbtn" aria-label="Back to arcade"><img src="assets/events/result_back.png" alt="Back to menu"></button></section>`,evClash);
  evRoot.querySelector('#evSudoAgain').onclick=()=>evSudokuStart(s.difficulty);
  evRoot.querySelector('#evSudoBack').onclick=evClash;
}
function evSudokuCheck(){
  const s=sudoku;if(!s||s.done||!s.values.every((v,i)=>v===s.answer[i]))return;
  s.done=true;clearInterval(sudokuTimer);const pts={easy:50,medium:100,hard:150}[s.difficulty];
  evRefresh();evData.clashPoints+=pts;evData.clashSudoku+=pts;evSave();evClashEarn('sudoku_'+s.difficulty,pts);
  if(typeof playSfx==='function')playSfx('victory');evSudokuEnd(true,pts);
}
// Neon, mobile-friendly falling-block puzzle. Points are awarded for each cleared row, no hidden bonuses.
let tetris=null,tetrisTicker=null;
const tetrisShapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
const tColors=['','#ff397e','#3bccff','#ffae32','#bd47fd','#41ef6b','#ff6fd0','#f7d35b'];
function evShape(){const id=1+Math.floor(Math.random()*7);return {m:tetrisShapes[id-1].map(row=>row.map(v=>v?id:0)),id,x:3,y:0}}
function evTetrisStart(){clearInterval(tetrisTicker);tetris={field:Array.from({length:20},()=>Array(10).fill(0)),piece:evShape(),next:evShape(),hold:null,holdUsed:false,points:0,lines:0,ticks:0,over:false};evTetrisRender();tetrisTicker=setInterval(evTetrisTick,600)}
function evTetrisFits(piece,dx=0,dy=0,m=piece.m){const t=tetris;return m.every((row,r)=>row.every((v,c)=>!v||r+piece.y+dy>=0&&r+piece.y+dy<20&&c+piece.x+dx>=0&&c+piece.x+dx<10&&!t.field[r+piece.y+dy][c+piece.x+dx]))}
function evTetrisLock(){const t=tetris,p=t.piece;for(let r=0;r<p.m.length;r++)for(let c=0;c<p.m[r].length;c++)if(p.m[r][c]){const y=r+p.y,x=c+p.x;if(y>=0&&y<20)t.field[y][x]=p.id}let cleared=0;for(let r=19;r>=0;r--)if(t.field[r].every(Boolean)){t.field.splice(r,1);t.field.unshift(Array(10).fill(0));cleared++;r++}if(cleared){t.lines+=cleared;t.points+=cleared*10;evRefresh();evData.clashPoints+=cleared*10;evData.clashLines+=cleared;evSave();evClashEarn('tetris',cleared*10);playSfx('combo')}t.piece=t.next;t.next=evShape();t.holdUsed=false;if(!evTetrisFits(t.piece)){evTetrisOver();return}evTetrisPaint()}
function evTetrisTick(){if(!tetris||tetris.over)return;const t=tetris;if(evTetrisFits(t.piece,0,1))t.piece.y++;else evTetrisLock();evTetrisPaint()}
function evTetrisOver(){tetris.over=true;clearInterval(tetrisTicker);evTetrisPaint();alert('HAUNTING TETRIS ENDED · '+tetris.lines+' lines · +'+tetris.points+' Clash Points');evClash()}
function evTetrisAction(act){const t=tetris;if(!t||t.over)return;const p=t.piece;if(act==='left'&&evTetrisFits(p,-1,0))p.x--;if(act==='right'&&evTetrisFits(p,1,0))p.x++;if(act==='down'){if(evTetrisFits(p,0,1))p.y++;else evTetrisLock()}if(act==='drop'){while(evTetrisFits(p,0,1))p.y++;evTetrisLock()}if(act==='rotate'){const rot=p.m[0].map((_,c)=>p.m.map(row=>row[c]).reverse());if(evTetrisFits(p,0,0,rot))p.m=rot;else if(evTetrisFits(p,-1,0,rot)){p.x--;p.m=rot}else if(evTetrisFits(p,1,0,rot)){p.x++;p.m=rot}}if(act==='hold'&&!t.holdUsed){const old=t.hold;t.hold={...p,m:p.m.map(row=>[...row]),x:3,y:0};t.piece=old||t.next;if(!old)t.next=evShape();t.piece.x=3;t.piece.y=0;t.holdUsed=true;if(!evTetrisFits(t.piece))evTetrisOver()}evTetrisPaint()}
function evTetrisRender(){evDisplay(`${evHeader('HAUNTING TETRIS',()=>{clearInterval(tetrisTicker);tetris=null;evClash()})}<div class="ev-panel"><div class="ev-mini-top"><span>LINES <b id="evTetrisLines">0</b></span><span>CLASH POINTS <b id="evTetrisPoints">0</b></span></div><div class="ev-tetris-layout"><canvas id="evTetrisBoard" class="ev-tetris-canvas" width="240" height="480" aria-label="Neon falling-block board"></canvas><div class="ev-tetris-side"><b>NEXT</b><canvas id="evNextPiece" width="65" height="68"></canvas><p>+10 points per cleared line</p><button type="button" class="ev-arcade-control ev-drop-control" data-tact="drop" aria-label="Hard drop"><span>⤓</span><small>DROP</small></button></div></div><div class="ev-controls"><button type="button" class="ev-arcade-control" data-tact="left" aria-label="Move left"><span>◀</span><small>LEFT</small></button><button type="button" class="ev-arcade-control" data-tact="rotate" aria-label="Rotate piece"><span>↻</span><small>ROTATE</small></button><button type="button" class="ev-arcade-control" data-tact="right" aria-label="Move right"><span>▶</span><small>RIGHT</small></button></div><div class="ev-btn-row"><button class="ev-btn ev-btn-alt" data-tact="hold">HOLD</button><button class="ev-btn ev-btn-alt" id="evTetrisQuit">END RUN</button></div></div>`,()=>{clearInterval(tetrisTicker);tetris=null;evClash()});evRoot.querySelectorAll('[data-tact]').forEach(el=>{el.draggable=false;el.addEventListener('selectstart',e=>e.preventDefault());el.addEventListener('dragstart',e=>e.preventDefault());el.addEventListener('contextmenu',e=>e.preventDefault());el.onclick=()=>{el.blur();evTetrisAction(el.dataset.tact)};});evRoot.querySelector('#evTetrisQuit').onclick=()=>{clearInterval(tetrisTicker);tetris=null;evClash()};evTetrisPaint()}
function evTetrisPaint(){const t=tetris;if(!t||evRoot.hidden)return;const canvas=evRoot.querySelector('#evTetrisBoard');if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,240,480);ctx.fillStyle='#111022';ctx.fillRect(0,0,240,480);const block=(x,y,color,size=24,c=ctx)=>{c.fillStyle=color;c.shadowColor=color;c.shadowBlur=8;c.fillRect(x*size+2,y*size+2,size-4,size-4);c.shadowBlur=0;c.strokeStyle='#ffffff9c';c.strokeRect(x*size+2.5,y*size+2.5,size-5,size-5)};for(let y=0;y<20;y++)for(let x=0;x<10;x++){ctx.strokeStyle='#39234e';ctx.strokeRect(x*24,y*24,24,24);if(t.field[y][x])block(x,y,tColors[t.field[y][x]])}const p=t.piece;for(let r=0;r<p.m.length;r++)for(let c=0;c<p.m[r].length;c++)if(p.m[r][c])block(c+p.x,r+p.y,tColors[p.id]);const next=evRoot.querySelector('#evNextPiece');const nx=next.getContext('2d');nx.clearRect(0,0,65,68);for(let r=0;r<t.next.m.length;r++)for(let c=0;c<t.next.m[r].length;c++)if(t.next.m[r][c]){nx.fillStyle=tColors[t.next.id];nx.shadowColor=nx.fillStyle;nx.shadowBlur=7;nx.fillRect(3+c*15,3+r*15,13,13);nx.shadowBlur=0}evRoot.querySelector('#evTetrisLines').textContent=t.lines;evRoot.querySelector('#evTetrisPoints').textContent=t.points}
document.addEventListener('keydown',e=>{if(!tetris||tetris.over||evRoot.hidden||!evRoot.querySelector('#evTetrisBoard'))return;const action={'ArrowLeft':'left','ArrowRight':'right','ArrowDown':'down','ArrowUp':'rotate',' ':'drop','c':'hold'}[e.key];if(action){e.preventDefault();evTetrisAction(action)}});

// Daily mission signals track activity even when a level is not won.
const evBaseSpecial=maybeSpecial;maybeSpecial=function(...args){const out=evBaseSpecial(...args);if(out&&!eventRun&&mode!=='talk'&&mode!=='guide'&&out.type==='RV')dailyRecord('rockets',1);return out};
const evBaseQueue=triggerQueue;triggerQueue=async function(...args){if(!eventRun&&args[0]?.length)dailyRecord('specials',1);return await evBaseQueue(...args)};

// Keep event navigation indicator in sync when menu returns after gameplay.
queueMicrotask(evUpdateRewardDots);
