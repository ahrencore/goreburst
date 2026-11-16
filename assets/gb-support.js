/* Goreburst Team private support: independent of Mr. Walker announcement mail. */
(()=>{'use strict';
const bucket='gb-support-attachments';
const $=id=>document.getElementById(id);
const account=()=>window.gbSupportSession?.()||{};
const label={bug:'Bug Report',account:'Account & Game Support',feedback:'Feedback & Suggestions',other:'Other'};
const veil=document.createElement('div');veil.id='gb-support-overlay';veil.hidden=true;
veil.innerHTML=`<div class="gb-support-card" role="dialog" aria-modal="true" aria-labelledby="gb-support-title"><header><h2 id="gb-support-title">✉ CONTACT GOREBURST TEAM</h2><button id="gb-support-close" type="button" aria-label="Close support">×</button></header><div id="gb-support-list" class="gb-support-list"></div><div id="gb-support-thread" hidden></div><form id="gb-support-form"><label>What's this about?<select name="category" required><option value="bug">Bug Report</option><option value="account">Account & Game Support</option><option value="feedback">Feedback & Suggestions</option><option value="other">Other</option></select></label><label>Subject<input name="subject" maxlength="100" minlength="3" required placeholder="What can we help with?"></label><label>Message<textarea name="body" maxlength="3000" rows="5" required placeholder="Tell us what's going on…"></textarea></label><label class="gb-support-attach">Optional screenshots (up to 2, compressed to 500 KB each)<input name="screenshots" type="file" accept="image/png,image/jpeg,image/webp" multiple></label><small>Screenshots are private and scheduled for deletion after 30 days. Don't include passwords or payment details.</small><button type="submit" class="gb-support-action">SEND MESSAGE</button></form><p id="gb-support-status" role="status" aria-live="polite"></p></div>`;
(document.getElementById('app')||document.body).appendChild(veil);
const status=s=>{$('gb-support-status').textContent=s||''};
const close=()=>{veil.hidden=true;status('');};
$('gb-support-close').onclick=close;
veil.addEventListener('click',e=>{if(e.target===veil)close()});
const mk=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n};
const btn=(txt,fn)=>{const b=mk('button',txt);b.type='button';b.className='gb-support-action';b.onclick=fn;return b};
const get=()=>{const a=account();if(!a.client||!a.user||a.user.is_anonymous)throw Error('Please sign in to your registered Goreburst account first.');return a};
function compress(file){return new Promise(async(resolve,reject)=>{
 try{
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Only PNG, JPEG or WebP screenshots are supported');
  if(file.size>15*1024*1024)throw Error('Screenshot too large');
  const bitmap=await createImageBitmap(file);
  try{
   const scale=Math.min(1,1280/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('Screenshot resizing unavailable');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   for(const quality of [.8,.68,.52,.38]){
    const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',quality));
    if(blob?.type==='image/webp'&&blob.size<=500*1024){resolve(blob);return;}
   }
   throw Error('Screenshot could not be compressed below 500 KB');
  }finally{bitmap.close?.()}
 }catch(e){reject(e)}
})}
async function uploadScreens(files){const {client,user}=get();if(files.length>2)throw Error('Please select no more than two screenshots');const paths=[];
 try{
  for(const file of files){const blob=await compress(file);const path=`${user.id}/${crypto.randomUUID()}.webp`;
   const {error}=await client.storage.from(bucket).upload(path,blob,{contentType:'image/webp',upsert:false,cacheControl:'3600'});
   if(error)throw error;paths.push(path);
  }
  return paths;
 }catch(e){if(paths.length)void client.storage.from(bucket).remove(paths);throw e}
}
function uploads(files){return Array.from(files||[])}
const PAGE_ADMIN=10,PAGE_PLAYER=3;
let adminPage=0,playerPage=0,mailPage=0,indicatorRequest=0;
const visiblePage=(host,isAdmin)=>isAdmin?adminPage:host.id==='gb-support-my-threads'?mailPage:playerPage;
const setVisiblePage=(host,isAdmin,n)=>{if(isAdmin)adminPage=n;else if(host.id==='gb-support-my-threads')mailPage=n;else playerPage=n};
async function fetchThreads(admin=false){
 const {client}=get();if(admin&&!account().adminRole)throw Error('Control Room authorization required');
 const {data,error}=await client.from('gb_support_threads').select('id,subject,category,status,requester_name,updated_at,last_sender,player_read_at,admin_read_at').order('updated_at',{ascending:false}).limit(1000);
 if(error)throw error;return data||[];
}
async function fetchThreadsPage(admin,page,size){
 const {client}=get();if(admin&&!account().adminRole)throw Error('Control Room authorization required');
 const {data,error,count}=await client.from('gb_support_threads')
 .select('id,subject,category,status,requester_name,updated_at,last_sender,player_read_at,admin_read_at',{count:'exact'})
 .order('updated_at',{ascending:false}).range(page*size,(page+1)*size-1);
 if(error)throw error;return {rows:data||[],count:count??0};
}
async function drawThreads(host,isAdmin=false){
 const size=isAdmin?PAGE_ADMIN:PAGE_PLAYER;
 let page=visiblePage(host,isAdmin);
 let result=await fetchThreadsPage(isAdmin,page,size);
 if(page>0&&!result.rows.length){page=Math.max(0,Math.ceil(result.count/size)-1);setVisiblePage(host,isAdmin,page);result=await fetchThreadsPage(isAdmin,page,size)}
 host.replaceChildren();
 if(!result.rows.length){host.append(mk('p',isAdmin?'No support messages yet.':'No support conversations yet.','gb-support-muted'));return}
 for(const thread of result.rows){const who=isAdmin?`${thread.requester_name} · `:'';const unread=isAdmin?thread.last_sender==='player'&&!thread.admin_read_at:thread.last_sender==='team'&&!thread.player_read_at;
  const button=btn(`${who}${thread.subject} · ${label[thread.category]||thread.category} · ${thread.status}`,()=>void openThread(thread.id,isAdmin,{fromMail:!isAdmin&&host.id==='gb-support-my-threads'}).catch(e=>{const target=isAdmin?$('gb-support-admin'):$('gb-support-status');if(target){const msg='Conversation unavailable: '+e.message;if(isAdmin)target.append(mk('p',msg,'gb-support-error'));else target.textContent=msg}}));
  button.classList.add('gb-support-thread-button');if(unread)button.classList.add('gb-support-thread-unread');host.append(button);
 }
 const pageCount=Math.max(1,Math.ceil(result.count/size));
 if(pageCount>1){const nav=mk('div',undefined,'gb-support-pagination');
  const prev=btn('‹ PREV',()=>{setVisiblePage(host,isAdmin,page-1);void redrawPage(host,isAdmin)});prev.disabled=page===0;
  const next=btn('NEXT ›',()=>{setVisiblePage(host,isAdmin,page+1);void redrawPage(host,isAdmin)});next.disabled=page>=pageCount-1;
  nav.append(prev,mk('span',`Page ${page+1} of ${pageCount}`),next);host.append(nav);
 }
}
async function redrawPage(host,isAdmin){try{await drawThreads(host,isAdmin)}catch(e){host.textContent='Inbox unavailable: '+e.message}}
async function drawMy(){const host=$('gb-support-list');if(!host)return;host.replaceChildren(mk('h3','My Support Messages'));
 const list=mk('div');host.append(list);await drawThreads(list,false);
}
async function openThread(id,admin=false,options={}){const {client}=get();const {data:threads,error:e1}=await client.from('gb_support_threads').select('*').eq('id',id).limit(1);
 if(e1)throw e1;if(!threads?.length)throw Error('Conversation unavailable');const thread=threads[0];
 const {data:msgs,error:e2}=await client.from('gb_support_messages').select('id,sender_role,body,attachment_paths,created_at').eq('thread_id',id).order('created_at',{ascending:true}).limit(200);
 if(e2)throw e2;
 const panel=admin?$('gb-support-admin'):$('gb-support-thread');if(!panel)return;
 if(!admin){veil.hidden=false;$('gb-support-form').hidden=true;$('gb-support-list').hidden=true;panel.hidden=false;}
 panel.replaceChildren();panel.append(btn('‹ BACK',()=>{if(admin)void refreshAdmin();else if(options.fromMail){close();void window.gbSupportRefreshMine?.();void window.gbSupportRefreshIndicators?.()}else{panel.hidden=true;$('gb-support-list').hidden=false;$('gb-support-form').hidden=false;void drawMy()}}));
 panel.append(mk('h3',thread.subject));panel.append(mk('small',`${label[thread.category]} · ${thread.status}${admin?' · '+thread.requester_name:''}`));
 for(const msg of msgs||[]){const row=mk('div',undefined,'gb-support-message');row.append(mk('b',msg.sender_role==='team'?'Goreburst Team':'Player'));row.append(mk('p',msg.body));
  const attachments=Array.isArray(msg.attachment_paths)?msg.attachment_paths:[];
  for(const path of attachments){const a=mk('a','View private screenshot');a.href='#';a.onclick=async e=>{e.preventDefault();try{const {data,error}=await client.storage.from(bucket).createSignedUrl(path,90);if(error)throw error;window.open(data.signedUrl,'_blank','noopener,noreferrer')}catch(err){status('Screenshot unavailable or expired: '+err.message)}};row.append(a)}
  panel.append(row);
 }
 const frm=mk('form');frm.className='gb-support-reply';frm.innerHTML=`<label>Reply as ${admin?'Goreburst Team':'Player'}<textarea name="body" maxlength="3000" rows="3" required placeholder="Write a reply…"></textarea></label>${admin?'':'<label>Screenshots (optional, max 2)<input name="screenshots" type="file" accept="image/png,image/jpeg,image/webp" multiple></label>'}<button type="submit" class="gb-support-action">SEND REPLY</button>`;
 if(thread.status==='resolved'&&!admin){frm.remove();panel.append(mk('p','This conversation is resolved. Open a new message if you need more help.'));}else panel.append(frm);
 frm.onsubmit=async e=>{e.preventDefault();const send=frm.querySelector('button');send.disabled=true;let paths=[];try{const body=frm.elements.body.value.trim();if(!body)throw Error('Write a message first');if(!admin)paths=await uploadScreens(uploads(frm.elements.screenshots.files));const {error}=await client.rpc('gb_support_reply',{p_thread:id,p_body:body,p_paths:paths});if(error)throw error;await openThread(id,admin,options);void window.gbSupportRefreshIndicators?.()}catch(err){if(paths.length)void client.storage.from(bucket).remove(paths);admin?panel.append(mk('p','Message not sent: '+err.message,'gb-support-error')):status('Message not sent: '+err.message)}finally{send.disabled=false}};
 if(admin){const statusBtn=btn(thread.status==='resolved'?'REOPEN':'MARK RESOLVED',async()=>{try{const {error}=await client.rpc('gb_support_set_status',{p_thread:id,p_status:thread.status==='resolved'?'open':'resolved'});if(error)throw error;await openThread(id,true)}catch(err){panel.append(mk('p',err.message,'gb-support-error'))}});panel.append(statusBtn)}
 const {error:readErr}=await client.rpc('gb_support_mark_read',{p_thread:id});
 if(readErr)console.warn('Support read marker:',readErr.message);
 else{
   // Ignore any already-in-flight unread checks that started before this read receipt.
   ++indicatorRequest;
   if(admin){
     await window.gbSupportRefreshIndicators?.();
     // Reload the actual inbox rows, so its unread mark and badge agree.
     // Keep the selected conversation open until Back is pressed.
   }else{await window.gbSupportRefreshMine?.();void window.gbprRefreshMailDot?.();}
 }
}
async function refreshAdmin(){const host=$('gb-support-admin');if(!host)return;const a=account();if(!a.adminRole){host.textContent='Admin access required';return}
 host.replaceChildren();host.append(mk('h4','Incoming Player Messages'));host.append(btn('REFRESH INBOX',()=>void refreshAdmin()));
 try{const list=mk('div');host.append(list);await drawThreads(list,true);void window.gbSupportRefreshIndicators?.()}catch(err){host.append(mk('p','Inbox unavailable: '+err.message))}
}
window.gbSupportOpen=()=>{veil.hidden=false;$('gb-support-thread').hidden=true;$('gb-support-list').hidden=false;$('gb-support-form').hidden=false;status('');
 try{get();void drawMy().catch(e=>status('Inbox unavailable: '+e.message))}catch(e){status(e.message);$('gb-support-form').hidden=true;$('gb-support-list').replaceChildren(mk('p','Sign in through your profile, then return here.'))}
};
$('gb-support-form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;const send=form.querySelector('button[type="submit"]');send.disabled=true;let paths=[];status('Sending securely…');
 try{const {client}=get();paths=await uploadScreens(uploads(form.elements.screenshots.files));const {data,error}=await client.rpc('gb_support_start',{p_category:form.elements.category.value,p_subject:form.elements.subject.value.trim(),p_body:form.elements.body.value.trim(),p_paths:paths});if(error)throw error;
  form.reset();status('Message sent.');await drawMy();
 }catch(err){if(paths.length)void account().client?.storage.from(bucket).remove(paths);status('Not sent: '+(err.message||'Please try again'))}finally{send.disabled=false}
};
window.gbSupportHasUnread=async()=>{try{const rows=await fetchThreads();return rows.some(t=>t.last_sender==='team'&&!t.player_read_at)}catch{return false}};
window.gbSupportRefreshIndicators=async()=>{const request=++indicatorRequest;const a=account();const nav=$('gb-admin-nav');const tile=document.querySelector('.gb-admin-section-tile[data-support-inbox]');if(!a.adminRole||!a.user){nav?.classList.remove('gb-support-unread');tile?.classList.remove('gb-support-unread');return;}try{const rows=await fetchThreads(true);if(request!==indicatorRequest)return;const unread=rows.some(t=>t.last_sender==='player'&&!t.admin_read_at);nav?.classList.toggle('gb-support-unread',unread);tile?.classList.toggle('gb-support-unread',unread)}catch(e){console.warn('Support admin notification unavailable:',e.message)}};
window.addEventListener('focus',()=>void window.gbSupportRefreshIndicators?.());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void window.gbSupportRefreshIndicators?.()});
setInterval(()=>{if(!document.hidden)void window.gbSupportRefreshIndicators?.()},30000);
window.gbSupportRefreshMine=async()=>{const host=$('gb-support-my-threads');if(!host)return;try{await drawThreads(host,false)}catch(e){host.textContent='Support messages unavailable: '+e.message}};
window.gbSupportRefreshAdmin=refreshAdmin;
const adminHome=document.querySelector('#gbpr-screen-admin .gb-admin-home');
adminHome?.querySelectorAll('button').forEach(b=>{if(b.textContent==='Player Inbox')b.addEventListener('click',()=>void refreshAdmin())});
})()
