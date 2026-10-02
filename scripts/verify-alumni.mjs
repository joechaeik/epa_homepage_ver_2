// Exercise alumni editing and date publication against disposable local D1 storage.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFile,writeFile,mkdir,mkdtemp,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {setTimeout as delay} from 'node:timers/promises';

const root=fileURLToPath(new URL('../',import.meta.url));
const run=promisify(execFile);
await mkdir(path.join(root,'.wrangler'),{recursive:true});
const temp=await mkdtemp(path.join(root,'.wrangler/alumni-qa-'));
const config=JSON.parse(await readFile(path.join(root,'wrangler.jsonc'),'utf8'));
config.main=path.join(root,'dist/server/index.js');
config.assets.directory=path.join(root,'dist/client');
config.d1_databases[0].migrations_dir=path.join(root,'drizzle');
delete config.r2_buckets;
const configPath=path.join(temp,'wrangler.json');
const secretPath=path.join(temp,'.dev.vars');
const secret=randomBytes(32).toString('hex');
await writeFile(configPath,JSON.stringify(config));
await writeFile(secretPath,`EPA_ADMIN_PASSWORD=${secret}\n`);
const wrangler=path.join(root,'node_modules/wrangler/bin/wrangler.js');
const common=['--config',configPath,'--persist-to',path.join(temp,'state')];
const env={...process.env,CI:'true',WRANGLER_SEND_METRICS:'false',CLOUDFLARE_CF_FETCH_ENABLED:'false'};
const base='http://127.0.0.1:8794';
let cookie='',server,logs='';
const request=(route,options={})=>fetch(base+route,{redirect:'manual',signal:AbortSignal.timeout(20000),...options});
const content=async()=>{
 const response=await request('/api/admin/content',{headers:{Cookie:cookie}});
 assert.equal(response.status,200);return response.json();
};
const save=body=>request('/api/admin/content',{method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)});
try{
 await run(process.execPath,[wrangler,'d1','migrations','apply','DB','--local',...common],{cwd:root,env});
 server=spawn(process.execPath,[wrangler,'dev','--local',...common,'--ip','127.0.0.1','--port','8794','--inspector-port','0'],{cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 server.stdout.on('data',v=>logs+=v);server.stderr.on('data',v=>logs+=v);
 let ready=false;
 for(let i=0;i<100;i++){
  try{if((await request('/people')).status===200){ready=true;break;}}catch{}
  if(server.exitCode!==null)throw new Error('Local worker exited');
  await delay(400);
 }
 assert.ok(ready,'Local worker starts');
 const login=await request('/api/admin/session',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:secret})});
 assert.equal(login.status,303);cookie=login.headers.get('set-cookie').split(';')[0];
 const initial=await content();
 const fixture={title:'Alumni QA mixed history',category:'Alumni',role:'Ph.D. Degree',membershipHistory:'Ph.D. · 2024\nM.Sc. · 2021\nPostdoctoral researcher · 2024–2026',affiliation:'Reported institution',affiliationPosition:'Assistant Professor',summary:'Photocatalyst performance and durability for removing indoor air pollutants.'};
 assert.equal((await save({operation:'save',kind:'people',intent:'draft',data:fixture})).status,200);
 assert.ok(!(await (await request('/people')).text()).includes(fixture.title),'Draft remains private');
 let entry=(await content()).records.find(r=>r.draft.title===fixture.title);
 for(const field of ['membershipHistory','affiliation','affiliationPosition'])assert.equal(entry.draft[field],fixture[field]);
 const preview=await request('/admin/preview?page=people',{headers:{Cookie:cookie}});
 assert.equal(preview.status,200);assert.ok((await preview.text()).includes(fixture.title),'People preview includes saved draft');
 assert.equal((await save({operation:'save',kind:'people',id:entry.id,version:entry.version,intent:'publish',data:entry.draft})).status,200);
 let html=await (await request('/people')).text();
 for(const value of [fixture.title,fixture.affiliation,fixture.affiliationPosition,'M.Sc. · 2021','Postdoctoral researcher · 2024–2026'])assert.ok(html.includes(value),value);
 const s=(await content()).settings;
 const dateData={...s.draft,alumniListUpdated:'2026-10-02',heroTitle:'Must not leak from date-only save'};
 assert.equal((await save({operation:'settings',scope:'alumniList',version:s.version,intent:'draft',data:dateData})).status,200);
 assert.ok(!(await (await request('/people')).text()).includes('Alumni records updated:'),'Date draft remains private');
 let state=await content();
 assert.equal(state.settings.draft.heroTitle,s.draft.heroTitle,'Date scope preserves unrelated hero');
 assert.equal((await save({operation:'settings',scope:'alumniList',version:state.settings.version,intent:'publish',data:state.settings.draft})).status,200);
 html=await (await request('/people')).text();
 assert.equal(html.split('Alumni records updated:').length-1,1,'One list date');
 assert.ok(html.includes('2 October 2026'));
 assert.ok(html.includes('does not indicate that every current position has been verified'));
 state=await content();
 assert.deepEqual(state.settings.published.alumniDestinations,s.published.alumniDestinations,'Carousel preserved');
 assert.deepEqual(state.settings.published.professorAwards,s.published.professorAwards,'Professor awards preserved');
 assert.equal((await save({operation:'settings',scope:'alumniList',version:state.settings.version,intent:'draft',data:{...state.settings.draft,alumniListUpdated:'2026-02-30'}})).status,400);
 assert.equal((await save({operation:'save',kind:'people',intent:'draft',data:{...fixture,membershipHistory:'x'.repeat(1001)}})).status,400);
 assert.deepEqual((await content()).records.filter(r=>r.id!==entry.id),initial.records,'Existing records preserved');
 console.log('PASS alumni fields round-trip, draft isolation, public rendering, and People preview');
 console.log('PASS one list-update date, date validation, scoped publishing, and preserved carousel/awards/existing records');
}catch(error){
 console.error(logs.split(secret).join('[redacted]').split('\n').filter(line=>/error|Error|exception/i.test(line)).slice(-15).join('\n'));
 throw error;
}finally{
 if(server?.pid&&server.exitCode===null){
  if(process.platform==='win32')await run('taskkill',['/pid',String(server.pid),'/t','/f']).catch(()=>{});
  else server.kill('SIGTERM');
 }
 await unlink(secretPath).catch(()=>{});
}
