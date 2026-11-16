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
async function drawThreads(host,threads,isAdmin=false){host.replaceChildren();
 if(!threads?.length){host.append(mk('p',isAdmin?'No support messages yet.':'No support conversations yet.','gb-support-muted'));return}
 for(const t of threads){const who=isAdmin?`${t.requester_name} · `:'';const unread=isAdmin?t.last_sender==='player'&&!t.admin_read_at:t.last_sender==='team'&&!t.player_read_at;
 const button=btn(`${unread?'● ':''}${who}${t.subject} · ${label[t.category]||t.category} · ${t.status}`,()=>void openThread(t.id,isAdmin));button.classList.add('gb-support-thread-button');host.append(button)}
}
async function fetchThreads(admin=false){const {client}=get();if(admin&&!account().adminRole)throw Error('Control Room authorization required');
 const {data,error}=await client.from('gb_support_threads').select('id,subject,category,status,requester_name,updated_at,last_sender,player_read_at,admin_read_at').order('updated_at',{ascending:false}).limit(100);
 if(error)throw error;return data||[];
}
async function drawMy(){const host=$('gb-support-list');if(!host)return;host.replaceChildren(mk('h3','My Support Messages'));
 const threads=await fetchThreads();await drawThreads(host,threads);}
async function openThread(id,admin=false){const {client}=get();const {data:threads,error:e1}=await client.from('gb_support_threads').select('*').eq('id',id).limit(1);
 if(e1)throw e1;if(!threads?.length)throw Error('Conversation unavailable');const thread=threads[0];
 const {data:msgs,error:e2}=await client.from('gb_support_messages').select('id,sender_role,body,attachment_paths,created_at').eq('thread_id',id).order('created_at',{ascending:true}).limit(200);
 if(e2)throw e2;
 const panel=admin?$('gb-support-admin'):$('gb-support-thread');if(!panel)return;
 if(!admin){$('gb-support-form').hidden=true;$('gb-support-list').hidden=true;panel.hidden=false;}
 panel.replaceChildren();panel.append(btn('‹ BACK',()=>{if(admin)void refreshAdmin();else{panel.hidden=true;$('gb-support-list').hidden=false;$('gb-support-form').hidden=false;void drawMy()}}));
 panel.append(mk('h3',thread.subject));panel.append(mk('small',`${label[thread.category]} · ${thread.status}${admin?' · '+thread.requester_name:''}`));
 for(const msg of msgs||[]){const row=mk('div',undefined,'gb-support-message');row.append(mk('b',msg.sender_role==='team'?'Goreburst Team':'Player'));row.append(mk('p',msg.body));
  const attachments=Array.isArray(msg.attachment_paths)?msg.attachment_paths:[];
  for(const path of attachments){const a=mk('a','View private screenshot');a.href='#';a.onclick=async e=>{e.preventDefault();try{const {data,error}=await client.storage.from(bucket).createSignedUrl(path,90);if(error)throw error;window.open(data.signedUrl,'_blank','noopener,noreferrer')}catch(err){status('Screenshot unavailable or expired: '+err.message)}};row.append(a)}
  panel.append(row);
 }
 const frm=mk('form');frm.className='gb-support-reply';frm.innerHTML=`<label>Reply as ${admin?'Goreburst Team':'Player'}<textarea name="body" maxlength="3000" rows="3" required placeholder="Write a reply…"></textarea></label>${admin?'':'<label>Screenshots (optional, max 2)<input name="screenshots" type="file" accept="image/png,image/jpeg,image/webp" multiple></label>'}<button type="submit" class="gb-support-action">SEND REPLY</button>`;
 if(thread.status==='resolved'&&!admin){frm.remove();panel.append(mk('p','This conversation is resolved. Open a new message if you need more help.'));}else panel.append(frm);
 frm.onsubmit=async e=>{e.preventDefault();const send=frm.querySelector('button');send.disabled=true;let paths=[];try{const body=frm.elements.body.value.trim();if(!body)throw Error('Write a message first');if(!admin)paths=await uploadScreens(uploads(frm.elements.screenshots.files));const {error}=await client.rpc('gb_support_reply',{p_thread:id,p_body:body,p_paths:paths});if(error)throw error;await openThread(id,admin)}catch(err){if(paths.length)void client.storage.from(bucket).remove(paths);admin?panel.append(mk('p','Message not sent: '+err.message,'gb-support-error')):status('Message not sent: '+err.message)}finally{send.disabled=false}};
 if(admin){const statusBtn=btn(thread.status==='resolved'?'REOPEN':'MARK RESOLVED',async()=>{try{const {error}=await client.rpc('gb_support_set_status',{p_thread:id,p_status:thread.status==='resolved'?'open':'resolved'});if(error)throw error;await openThread(id,true)}catch(err){panel.append(mk('p',err.message,'gb-support-error'))}});panel.append(statusBtn)}
 const {error:readErr}=await client.rpc('gb_support_mark_read',{p_thread:id});if(readErr)console.warn('Support read marker:',readErr.message);
}
async function refreshAdmin(){const host=$('gb-support-admin');if(!host)return;const a=account();if(!a.adminRole){host.textContent='Admin access required';return}
 host.replaceChildren();host.append(mk('h4','Incoming Player Messages'));host.append(btn('REFRESH INBOX',()=>void refreshAdmin()));
 try{const list=mk('div');host.append(list);await drawThreads(list,await fetchThreads(true),true)}catch(err){host.append(mk('p','Inbox unavailable: '+err.message))}
}
window.gbSupportOpen=()=>{veil.hidden=false;$('gb-support-thread').hidden=true;$('gb-support-list').hidden=false;$('gb-support-form').hidden=false;status('');
 try{get();void drawMy().catch(e=>status('Inbox unavailable: '+e.message))}catch(e){status(e.message);$('gb-support-form').hidden=true;$('gb-support-list').replaceChildren(mk('p','Sign in through your profile, then return here.'))}
};
$('gb-support-form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;const send=form.querySelector('button[type="submit"]');send.disabled=true;let paths=[];status('Sending securely…');
 try{const {client}=get();paths=await uploadScreens(uploads(form.elements.screenshots.files));const {data,error}=await client.rpc('gb_support_start',{p_category:form.elements.category.value,p_subject:form.elements.subject.value.trim(),p_body:form.elements.body.value.trim(),p_paths:paths});if(error)throw error;
  form.reset();status('Message sent! Replies from Goreburst Team appear in Carnival Mail.');await drawMy();
 }catch(err){if(paths.length)void account().client?.storage.from(bucket).remove(paths);status('Not sent: '+(err.message||'Please try again'))}finally{send.disabled=false}
};
window.gbSupportHasUnread=async()=>{try{const rows=await fetchThreads();return rows.some(t=>t.last_sender==='team'&&!t.player_read_at)}catch{return false}};
window.gbSupportRefreshMine=async()=>{const host=$('gb-support-my-threads');if(!host)return;try{await drawThreads(host,await fetchThreads())}catch(e){host.textContent='Support messages unavailable: '+e.message}};
window.gbSupportRefreshAdmin=refreshAdmin;
const adminHome=document.querySelector('#gbpr-screen-admin .gb-admin-home');
adminHome?.querySelectorAll('button').forEach(b=>{if(b.textContent==='Player Inbox')b.addEventListener('click',()=>void refreshAdmin())});
})()
