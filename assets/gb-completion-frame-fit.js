/* Gore Burst: non-destructive avatar clipping for collectible completion frames.
   No frame asset is resized or altered. The photo retains its original crop/size;
   only pixels outside the actual connected transparent center are hidden.
*/
(()=>{
'use strict';
const decoded=new Map();
const fitted=new WeakMap();
const N=512, THRESHOLD=80;
function transparentOpening(src){
 if(decoded.has(src))return decoded.get(src);
 const job=new Promise(resolve=>{
  const image=new Image();
  image.onload=()=>{
   try{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=N;
    const c=canvas.getContext('2d',{willReadFrequently:true});
    c.clearRect(0,0,N,N);c.drawImage(image,0,0,N,N);
    const alpha=c.getImageData(0,0,N,N).data;
    const checked=new Uint8Array(N*N), region=new Uint8Array(N*N);
    const queue=new Int32Array(N*N), half=N>>1;
    let seed=half*N+half;
    // Find transparent seed near center, if center has a small ornament.
    if(alpha[seed*4+3]>=THRESHOLD){
     let found=false;
     for(let radius=1;radius<=N/7&&!found;radius++){
      for(let y=half-radius;y<=half+radius&&!found;y++)for(let x=half-radius;x<=half+radius;x++){
       if(x<1||y<1||x>=N-1||y>=N-1)continue;
       if(alpha[(y*N+x)*4+3]<THRESHOLD){seed=y*N+x;found=true;break;}
      }
     }
     if(!found)throw Error('No transparent center');
    }
    let head=0,tail=1;queue[0]=seed;checked[seed]=1;
    let edge=false;
    while(head<tail){
     const p=queue[head++],x=p%N,y=(p/N)|0;region[p]=1;
     if(x===0||y===0||x===N-1||y===N-1){edge=true;break;}
     const adjacent=[p-1,p+1,p-N,p+N];
     for(const q of adjacent){
      if(!checked[q]&&alpha[q*4+3]<THRESHOLD){checked[q]=1;queue[tail++]=q;}
     }
    }
    if(edge||tail<1000)throw Error('Transparent opening is not enclosed');
    // Slight inward safety margin prevents any antialiased PFP fringe beyond the ring.
    const safe=new Uint8Array(N*N);
    for(let y=3;y<N-3;y++)for(let x=3;x<N-3;x++){
     const p=y*N+x;
     if(region[p]&&region[p-2]&&region[p+2]&&region[p-2*N]&&region[p+2*N])safe[p]=255;
    }
    resolve(safe);
   }catch(err){console.warn('[GB frame fit]',err.message,src);resolve(null);}
  };
  image.onerror=()=>resolve(null);image.src=src;
 });
 decoded.set(src,job);return job;
}
function findPairs(){
 const pairs=[];
 for(const wrap of document.querySelectorAll('.gbcf-avatar-wrap')){
  pairs.push([wrap,wrap.querySelector('img.gbcf-avatar'),wrap.querySelector('img.gbcf-art')]);
 }
 // Also support completion frames in later permanent-equipping UI without changing
 // the existing paid/free frame renderer.
 const selectors=['.gbpf-preview','.gbpf-hero-avatar-wrap','.gbpf-public-wrap',
 '.gbpf-social-avatar','.gbpf-rank-avatar','.gbshop-avatar-preview'];
 for(const wrap of document.querySelectorAll(selectors.join(','))){
  const imgs=[...wrap.querySelectorAll(':scope > img')];
  const frame=imgs.find(im=>/\/completion-frames\/completion_\d+\.webp(?:[?#]|$)/i.test(im.getAttribute('src')||''));
  const photo=imgs.find(im=>im!==frame&& !/frame|overlay|border/i.test(im.className+' '+im.id));
  if(frame&&photo)pairs.push([wrap,photo,frame]);
 }
 return pairs.filter(p=>p[1]&&p[2]);
}
async function fit(wrap,photo,frame){
 const src=frame.src;
 const previous=fitted.get(photo);
 if(previous?.src===src&&previous.wrap===wrap&&previous.photoSrc===photo.src&&previous.width===photo.clientWidth&&previous.height===photo.clientHeight)return;
 const token={src,wrap,photoSrc:photo.src,width:photo.clientWidth,height:photo.clientHeight};fitted.set(photo,token);
 // Never briefly display the unmasked oversized photo during new frame loading.
 photo.style.visibility='hidden';
 const region=await transparentOpening(src);
 if(fitted.get(photo)!==token)return;
 if(!region){
  // Safe circular fallback; never show naked spillover if pixel decode failed.
  photo.style.webkitMaskImage='radial-gradient(circle at center, #000 0 39%, transparent 40%)';
  photo.style.maskImage='radial-gradient(circle at center, #000 0 39%, transparent 40%)';
  photo.style.visibility='';return;
 }
 const photoBox=photo.getBoundingClientRect(),frameBox=frame.getBoundingClientRect();
 if(!photoBox.width||!photoBox.height||!frameBox.width||!frameBox.height){photo.style.visibility='';return;}
 const width=Math.max(1,Math.min(1024,Math.round(photoBox.width*2)));
 const height=Math.max(1,Math.min(1024,Math.round(photoBox.height*2)));
 const cv=document.createElement('canvas');cv.width=width;cv.height=height;
 const ctx=cv.getContext('2d');const pixels=ctx.createImageData(width,height);
 // Convert from photo-local pixels into the full frame's geometry. Critically,
 // this preserves the 70% photo crop (and any per-view proportions) unchanged.
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const fx=(photoBox.left+(x+.5)/width*photoBox.width-frameBox.left)/frameBox.width;
  const fy=(photoBox.top+(y+.5)/height*photoBox.height-frameBox.top)/frameBox.height;
  const ix=Math.floor(fx*N),iy=Math.floor(fy*N);
  if(ix>=0&&ix<N&&iy>=0&&iy<N){
   const a=region[iy*N+ix];pixels.data[(y*width+x)*4+3]=a;
  }
 }
 ctx.putImageData(pixels,0,0);
 const mask=`url("${cv.toDataURL('image/png')}")`;
 photo.style.setProperty('mask-image',mask,'important');
 photo.style.setProperty('-webkit-mask-image',mask,'important');
 photo.style.setProperty('mask-size','100% 100%','important');
 photo.style.setProperty('-webkit-mask-size','100% 100%','important');
 photo.style.setProperty('mask-repeat','no-repeat','important');
 photo.style.setProperty('-webkit-mask-repeat','no-repeat','important');
 photo.style.visibility='';
}
let pending=false;
function scan(){pending=false;for(const [wrap,photo,frame] of findPairs())void fit(wrap,photo,frame);}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(scan);}
function start(){
 const observer=new MutationObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'||(m.type==='attributes'&&['src','class','hidden'].includes(m.attributeName))))schedule();
 });
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class','hidden']});
 window.addEventListener('resize',schedule,{passive:true});schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
