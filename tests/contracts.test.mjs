import test from 'node:test';import assert from 'node:assert/strict';
import {readFile,mkdtemp,access,writeFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {validateTrip} from '../scripts/validate-trip.mjs';import {generate} from '../scripts/generate.mjs';
import {createModel,externalLink} from '../assets/src/model.mjs';import * as Ledger from '../assets/src/ledger.mjs';
const sample=JSON.parse(await readFile(new URL('../assets/example-trip.json',import.meta.url),'utf8'));
const fresh=()=>structuredClone(sample);
test('unavailable source does not create a self-link',()=>{assert.equal(externalLink('','资料'),'');assert.ok(externalLink('https://example.org/?a=1&b=2','店名').includes('a=1&amp;b=2'));});
test('failed persistence never duplicates a retried new ledger entry',()=>{Ledger.configure(sample);const s=Ledger.initial();for(const id of ['try-one','try-two']){const e={id,date:'2030-05-01',title:'未保存',category:'餐饮',city:'湖城',kind:'expense',cents:100,payer:'',note:''};assert.throws(()=>Ledger.commit(s,x=>Ledger.upsert(x,e),()=>{throw Error('disk full');}),/disk full/);}assert.equal(s.entries.length,0);});
test('new trip supports three cities, cross-month dates and three-person ledger',()=>{const t=validateTrip(fresh());Ledger.configure(t);const a=createModel(t,Ledger);assert.deepEqual(a.days.map(d=>d.short),['04.30','05.01','05.02']);assert.equal(a.days[0].week,'周二');assert.equal(a.hotels[0].stay,'2030-04-30 入住 → 2030-05-02 退房 · 2晚');const s=a.initial();Ledger.upsert(s.ledger,{id:'entry-a',date:'2030-04-29',title:'预付酒店',category:'酒店',city:'海城',kind:'expense',cents:9000,payer:'甲',note:''});assert.equal(Ledger.summary(s.ledger).average,3000);assert.equal(a.validate(s),s);});
test('backup is isolated between distinct trips',()=>{const t=fresh();Ledger.configure(t);const a=createModel(t,Ledger),state=a.initial();state.notes.general='私密备注';const other=createModel({...t,id:'another-trip'},Ledger);assert.throws(()=>other.validate(state),/不属于/);assert.equal(state.notes.general,'私密备注');});
test('state changes and roundtrip backup preserve favorites, completion and notes',()=>{const t=fresh();Ledger.configure(t);const a=createModel(t,Ledger),s=a.initial();a.toggle(s,'favorites','coffee');a.toggle(s,'done','event-0-0');a.toggle(s,'booked','inn');s.notes['hotel-inn']='已核对';assert.equal(a.filterFoods('湖城','咖啡','林',true,s).length,1);const imported=a.validate(JSON.parse(JSON.stringify(s)));assert.equal(imported.booked.inn,true);assert.equal(imported.notes['hotel-inn'],'已核对');a.toggle(s,'favorites','coffee');assert.equal(a.filterFoods('全部','全部','',true,s).length,0);});
test('ledger edit updates existing entry and refunds reduce actual total',()=>{Ledger.configure(sample);const s=Ledger.initial(),e={id:'entry-x',date:'2030-04-30',title:'午饭',category:'餐饮',city:'湖城',kind:'expense',cents:1000,payer:'',note:''};Ledger.upsert(s,e);Ledger.upsert(s,{...e,cents:1200});Ledger.upsert(s,{...e,id:'refund-x',kind:'refund',cents:300});assert.equal(s.entries.length,2);assert.equal(Ledger.summary(s).net,900);assert.equal(Ledger.summary(s).average,300);Ledger.remove(s,'entry-x');assert.equal(Ledger.summary(s).net,-300);});
for(const [name,mutate]of [
 ['invalid calendar date',t=>t.days[1].date='2030-02-30'],
 ['missing date in sequence',t=>t.days[1].date='2030-05-02'],
 ['unknown activity location',t=>t.days[0].items[0].placeId='not-found'],
 ['unmapped candidate',t=>t.regions.forEach(r=>r.nodes=r.nodes.filter(n=>n.placeId!=='market'))],
 ['third city missing from registry',t=>t.cities.pop()],
 ['unsafe source protocol',t=>t.places[0].sourceUrl='javascript:alert(1)'],
 ['credential in URL',t=>t.places[0].mapUrl='https://user:pass@example.com/'],
 ['fabricated verified status without evidence',t=>t.places[0].verification='verified'],
 ['route mismatched leg',t=>t.regions[1].routes[0].legs[0].to='market'],
 ['missing default route',t=>t.regions[1].routes=[]],
 ['invalid stay dates',t=>t.hotels[0].checkOut=t.hotels[0].checkIn],
 ['unsupported currency',t=>t.currency='USD'],
 ['duplicate activity ID',t=>t.days[0].items[1].id=t.days[0].items[0].id],
 ['unsafe trip ID',t=>t.id='../../secret'],
 ['SVG attribute injection',t=>t.regions[1].routes[0].legs[0].path='M 1 2 Q 3 4 5 6" onclick="x'],
])test('rejects '+name,()=>{const t=fresh();mutate(t);assert.throws(()=>validateTrip(t));});
test('empty food and lodging candidates do not force invented choices',()=>{const t=fresh();t.foods=[];t.hotels=[];validateTrip(t);Ledger.configure(t);const a=createModel(t,Ledger);assert.deepEqual(a.foods,[]);assert.deepEqual(a.hotels,[]);});
test('malicious backup properties and duplicate ledger entries are rejected',()=>{Ledger.configure(sample);const a=createModel(sample,Ledger),s=a.initial();s.notes=JSON.parse('{"__proto__":"bad"}');assert.throws(()=>a.validate(s));const e={id:'dup',date:'2030-04-30',title:'重复',category:'餐饮',city:'湖城',kind:'expense',cents:100,payer:'',note:''};assert.throws(()=>Ledger.validate({budget:null,entries:[e,{...e}]}),/重复/);assert.throws(()=>Ledger.money('0'));assert.throws(()=>Ledger.money('1.001'));assert.equal(Ledger.money('0.01'),1);});
test('generator safely embeds data and refuses to overwrite existing output',async()=>{
 const tmp=await mkdtemp(join(tmpdir(),'travel-generator-')),input=join(tmp,'trip.json'),out=join(tmp,'site'),t=fresh();t.subtitle='</script><script>alert(1)</script> & a';await writeFile(input,JSON.stringify(t));await generate(input,out);const html=await readFile(join(out,'index.html'),'utf8'),m=html.match(/<script id="trip-data" type="application\/json">([\s\S]*?)<\/script>/);assert.equal(JSON.parse(m[1]).subtitle,t.subtitle);assert.ok(!m[1].includes('</script>'));const manifest=JSON.parse(await readFile(join(out,'manifest.webmanifest'),'utf8'));assert.equal(manifest.name,t.title);assert.equal(manifest.display,'standalone');await access(join(out,'apple-touch-icon.png'));await assert.rejects(()=>generate(input,out),/已存在/);});
test('bad configuration produces no deployment directory',async()=>{const tmp=await mkdtemp(join(tmpdir(),'travel-invalid-')),input=join(tmp,'bad.json'),out=join(tmp,'site'),t=fresh();t.travelers=0;await writeFile(input,JSON.stringify(t));await assert.rejects(()=>generate(input,out));await assert.rejects(()=>access(out));});
