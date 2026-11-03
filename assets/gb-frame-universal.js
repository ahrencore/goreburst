/* Gore Burst universal paid-frame renderer v1.
   Paid frame images have real transparent central holes. Read those pixels
   and use the interior region as a mask, rather than guessing percentages.
   Reuses one geometry/renderer for Edit Profile, Profile and Shop, and
   automatically supports new transparent frame PNG/WebP assets in shop-frames.
   It intentionally leaves the already-working menu/leaderboard frames alone.
*/
(()=>{
 'use strict';
 const photoSelectors = [
  ['#gbshopPreview','img#gbshopAvatarImg','img#gbshopFrameImg'],
  ['#gb-profile-layer .gbpf-preview','img#gbpf-preview-avatar','img#gbpf-preview-border'],
  ['#gb-profile-layer .gbpf-hero-avatar-wrap','img.gbpf-avatar-img','img.gbpf-overlay'],
  ['#gb-profile-layer .gbpf-public-wrap','img.gbpr-public-avatar','img.gbpf-overlay']
 ];
 const cache=new Map();let scheduled=false;
 const CSS_PROPS=['position','inset','left','top','right','bottom','width','height','min-width','max-width','min-height','max-height','transform','object-fit','object-position','border-radius','clip-path','-webkit-clip-path','mask-image','-webkit-mask-image','mask-size','-webkit-mask-size','mask-repeat','-webkit-mask-repeat','z-index','filter','box-shadow','background','border','display','margin','padding'];
 function restore(img){if(!img||!img.classList.contains('gb-frame-universal-photo'))return;img.classList.remove('gb-frame-universal-photo');for(const prop of CSS_PROPS)img.style.removeProperty(prop);}
 function fitSource(src){return /(?:^|\/)shop-frames\/[^?#]+\.(?:png|webp)(?:[?#]|$)/i.test(src||'');}
 function loadHoleMask(src){
  if(cache.has(src))return cache.get(src);
  const task=new Promise(resolve=>{
   const im=new Image();im.onload=()=>{
    try{
     const n=192,cv=document.createElement('canvas');cv.width=n;cv.height=n;
     const ctx=cv.getContext('2d',{willReadFrequently:true});
     if(!ctx)throw Error('No canvas 2D context');
     const iw=im.naturalWidth,ih=im.naturalHeight;
     const factor=Math.min(n/iw,n/ih),w=iw*factor,h=ih*factor;
     ctx.clearRect(0,0,n,n);ctx.drawImage(im,(n-w)/2,(n-h)/2,w,h);
     const img=ctx.getImageData(0,0,n,n),rgba=img.data;
     const seen=new Uint8Array(n*n),queue=new Uint32Array(n*n);
     let seed=-1,mid=(n/2|0),maxR=50;
     // Prefer the center; small ornaments sometimes cover the exact center pixel.
     for(let r=0;r<maxR&&seed<0;r++){
      for(let dy=-r;dy<=r&&seed<0;dy++)for(let dx=-r;dx<=r;dx++){
       if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
       const x=mid+dx,y=mid+dy;if(x<1||x>=n-1||y<1||y>=n-1)continue;
       const k=y*n+x;if(rgba[k*4+3]<48){seed=k;break;}
      }
     }
     if(seed<0)throw Error('No transparent center');
     seen[seed]=1;queue[0]=seed;let head=0,tail=1,touchesEdge=false;
     while(head<tail){
      const at=queue[head++],x=at%n,y=(at/n)|0;
      if(x===0||y===0||x===n-1||y===n-1){touchesEdge=true;break;}
      for(const k of [at-1,at+1,at-n,at+n]){
       if(!seen[k]&&rgba[k*4+3]<48){seen[k]=1;queue[tail++]=k;}
      }
     }
     // A frame without a closed transparent hole is not safe to mask.
     if(touchesEdge||tail<500)throw Error('Frame opening not enclosed');
     const mask=ctx.createImageData(n,n);
     for(let k=0;k<n*n;k++){
      if(!seen[k])continue;
      mask.data[k*4]=255;mask.data[k*4+1]=255;
      mask.data[k*4+2]=255;mask.data[k*4+3]=255;
     }
     ctx.clearRect(0,0,n,n);ctx.putImageData(mask,0,0);
     resolve('url("'+cv.toDataURL('image/png')+'")');
    }catch(e){console.warn('Gore Burst frame fit:',e.message,src);resolve(null);}
   };
   im.onerror=()=>resolve(null);im.src=src;
  });cache.set(src,task);return task;
 }
 function applyPhoto(photo,mask){
  photo.classList.add('gb-frame-universal-photo');
  const rules={position:'absolute',inset:'0',left:'0',top:'0',right:'0',bottom:'0',width:'100%',height:'100%','min-width':'0','max-width':'none','min-height':'0','max-height':'none',transform:'none','object-fit':'cover','object-position':'center','border-radius':'0','clip-path':'none','-webkit-clip-path':'none','mask-image':mask,'-webkit-mask-image':mask,'mask-size':'100% 100%','-webkit-mask-size':'100% 100%','mask-repeat':'no-repeat','-webkit-mask-repeat':'no-repeat','z-index':'1',filter:'none','box-shadow':'none',background:'transparent',border:'0',display:'block',margin:'0',padding:'0'};
  for(const [prop,value] of Object.entries(rules))photo.style.setProperty(prop,value,'important');
 }
 function paint(){
  for(const [containerSel,photoSel,frameSel] of photoSelectors){
   for(const wrap of document.querySelectorAll(containerSel)){
    const photo=wrap.querySelector(photoSel),frame=wrap.querySelector(frameSel);
    if(!photo)continue;
    const src=frame?.getAttribute('src')||'';
    if(!frame||frame.hidden||!fitSource(src)){restore(photo);continue;}
    const key=src+'|'+(photo.getAttribute('src')||'');
    if(wrap.dataset.gbFrameFitKey===key&&photo.classList.contains('gb-frame-universal-photo'))continue;
    wrap.dataset.gbFrameFitKey=key;
    void loadHoleMask(frame.src).then(mask=>{
     if(wrap.dataset.gbFrameFitKey!==key)return;
     if(!mask){restore(photo);return;}
     applyPhoto(photo,mask);
     frame.classList.add('gb-frame-universal-overlay');
     frame.style.setProperty('filter','none','important');
     frame.style.setProperty('box-shadow','none','important');
     // The frame image itself stays full-size and in front of the photo.
    });
   }
  }
 }
 function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;paint();},40);}
 const obs=new MutationObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'||(m.type==='attributes'&&['src','hidden','class'].includes(m.attributeName))))schedule();
 });
 function start(){obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','hidden','class']});schedule();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
