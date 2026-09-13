import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {mapPanels,mapPlaces} from '../assets/src/map-model.mjs';
import {validateTrip} from '../scripts/validate-trip.mjs';
const sample=JSON.parse(await readFile(new URL('../assets/example-trip.json',import.meta.url),'utf8'));
function atlas(){const t=structuredClone(sample);t.regions[0].panels=t.regions.slice(1).map(r=>r.id);t.regions[0].nodes=[];t.regions[0].routes.forEach(q=>q.legs=[]);return t;}
test('overview uses city geometry directly and includes every candidate',()=>{const t=validateTrip(atlas()),panels=mapPanels(t,'all');assert.equal(panels[0],t.regions[1]);assert.deepEqual(panels[0].nodes,mapPanels(t,'region-0')[0].nodes);assert.deepEqual(new Set(mapPlaces(t,'all')),new Set(t.places.map(p=>p.id)));});
test('unlocated places remain selectable without invented coordinates',()=>{const t=atlas(),r=t.regions[1];r.nodes=r.nodes.filter(n=>n.placeId!=='market');r.unlocated=['market'];r.routes=[];t.days.forEach(d=>d.region='all');validateTrip(t);assert.ok(mapPlaces(t,'all').includes('market'));assert.ok(!mapPanels(t,'all')[0].nodes.some(n=>n.placeId==='market'));});
for(const [label,mutate] of [
 ['unknown city',t=>t.regions[0].panels=['missing']],
 ['self reference',t=>t.regions[0].panels=['all']],
 ['nested overview',t=>t.regions[1].panels=['region-2']],
 ['duplicate city',t=>t.regions[0].panels=['region-0','region-0']],
 ['both pinned and unlocated',t=>t.regions[1].unlocated=['inn']],
 ['unknown unlocated place',t=>t.regions[1].unlocated=['missing']],
 ['out of bounds area',t=>t.regions[1].areas=[{label:'城区',x:950,y:0,w:100,h:100}]],
])test('atlas rejects '+label,()=>{const t=atlas();mutate(t);assert.throws(()=>validateTrip(t));});
test('dense city keeps all 32 small candidates alongside main places',()=>{const t=structuredClone(sample),r=t.regions[1];for(let i=0;i<32;i++){const id='candidate-'+i;t.places.push({...t.places[0],id,name:'备选'+i});r.nodes.push({placeId:id,x:150+(i%8)*90,y:120+Math.floor(i/8)*100,detail:true});}validateTrip(t);assert.equal(mapPlaces(t,r.id).length,36);assert.equal(mapPlaces(t,'all').length,t.places.length);});
test('excessive large models are rejected without discarding candidates',()=>{const t=structuredClone(sample),r=t.regions[1];for(let i=0;i<10;i++){const id='large-'+i;t.places.push({...t.places[0],id,name:'大模型'+i});r.nodes.push({placeId:id,x:150+i*50,y:300});}assert.throws(()=>validateTrip(t),/大模型最多12/);assert.equal(r.nodes.length,14);});
test('each fictional day opens its own city with a valid route',()=>{const t=validateTrip(structuredClone(sample));for(const d of t.days){const r=t.regions.find(r=>r.id===d.region);assert.equal(r.name,d.city);assert.ok(!r.panels);assert.ok(r.routes.some(q=>q.dayId===d.id));}});
