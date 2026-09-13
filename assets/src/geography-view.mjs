import './geography.css';
import {art,house,tree,esc as E} from './art.mjs';
import {camera,zoomAt} from './map-camera.mjs';
const cameras=new Map();
import {mapPanels,mapPlaces} from './map-model.mjs';
let trip;
export let places=[];
export function configure(t){trip=t;places=t.places.map(p=>({...p,source:p.sourceUrl,quality:p.locationNote+' · '+(p.verification==='verified'?'资料已核实':p.verification==='lead'?'灵感线索，待核实':'未核实')+(p.checkedAt?' · '+p.checkedAt:'')}));}
export const navigation=p=>p.mapUrl;
export const placeStatus=(p,booked={})=>booked[p.id]?'你已标记预订':p.status;
export function icon(kind){
 if(kind==='airport')return '<ellipse cy="12" rx="75" ry="23" fill="#e5e4d4"/><path d="m-65 12 110-30 25 16-110 28Z" fill="#cbd0c0"/><path d="m-5-48 12 5v23l24 18-5 3-20-9-1 16 8 8-6 2-9-9-9 2-4-3 9-7v-17l-25-5 1-5 25 3Z" fill="#fffef2" stroke="#b5bdab"/>';
 if(kind==='market')return [-35,0,35].map((x,i)=>house(x,i%2?0:-12,.7,i%2?'#b49b77':'#91a187')).join('');
 if(kind==='coast')return '<ellipse cy="10" rx="85" ry="28" fill="#e8dcc2"/><path d="M-80 7Q-45-25 0-5T80 8Q40 43-15 23Z" fill="#b4d3ca"/><path d="M-67 6Q-40-8-2 9T65 12" fill="none" stroke="#fffdf0" stroke-width="4"/>'+tree(-40,-12,.8);
 return art(kind);
}
function sceneSVG(info,route,selected,category,booked,orderedStops=route.stops){
 const prefix='map-'+info.id;
 const ground=info.terrain==='lowland'?'M80 150Q185 50 370 100Q550 35 790 105Q960 165 930 355Q985 545 770 603L300 620Q65 575 72 405Q20 245 80 150Z':'M73 210Q37 111 211 85L667 53Q853 22 923 157L951 450Q938 543 713 616L344 633Q102 597 50 462Z';
 return `<svg class="sb-map" viewBox="0 0 1000 670" xmlns="http://www.w3.org/2000/svg" aria-label="${E(info.name)}固定方位旅行地图，非导航地图">
 <defs><marker id="${prefix}-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="m0 0 8 4-8 4 2-4Z" fill="#c77744"/></marker></defs>
 <g aria-hidden="true">
 <path d="${ground}" fill="#e4e5d6" transform="translate(0 8)"/>
 <path d="${ground}" fill="#eef0e2" stroke="#dfe3d1"/>
 <path d="M560 90Q780 30 895 157L923 425Q818 525 666 486L567 321Z" fill="#e2e9d2" opacity=".65"/>
 <path d="M135 176Q341 123 510 212L470 435Q335 506 139 385Z" fill="#e1e7ce"/>
 <path d="M120 430Q310 290 510 390T905 470" fill="none" stroke="#f8f8eb" stroke-width="18" opacity=".7"/>
 ${[[110,450,.8],[620,110,.65],[905,290,.8],[350,585,.7]].map(p=>tree(...p)).join('')}
 <text x="115" y="58" class="sb-region">${E(info.name)}</text>
 <path d="M950 80V35m-8 12 8-12 8 12" fill="none" stroke="#96a18b" stroke-width="1.5"/><text x="950" y="25" text-anchor="middle" class="atlas-direction">N</text></g>
 <g aria-label="当天路线">${route.legs.map(l=>`<path d="${l.path}" fill="none" stroke="${l.returning?'#668371':'#c77744'}" stroke-width="4" ${l.optional?'stroke-dasharray="7 7"':''} marker-end="url(#${prefix}-arrow)"/><text x="${l.x}" y="${l.y}" class="sb-route-label">${E(l.label)}</text>`).join('')}</g>
 ${info.nodes.map(n=>{const p=places.find(p=>p.id===n.placeId),steps=orderedStops.flatMap((id,i)=>id===p.id?[i+1]:[]),planned=trip.days.some(d=>d.items.some(i=>i.placeId===p.id)),candidate=!planned&&!['交通'].includes(p.type);return `<g role="button" tabindex="0" data-detail="${!!n.detail}" data-place="${p.id}" data-position="${info.id}:${n.x},${n.y}" aria-label="${E(p.name)}，${E(placeStatus(p,booked))}" aria-pressed="${selected===p.id}" transform="translate(${n.x} ${n.y})" class="sb-place ${category==='全部'||category===p.type?'':'subdued'} ${selected===p.id?'selected':''} ${steps.length?'on-day':''} ${candidate?'candidate':''}"><title>${E(p.name)}</title><g transform="scale(${n.detail?.62:1})"><ellipse class="sb-select-ring" cy="0" rx="47" ry="30"/><g class="sb-model" transform="scale(${p.icon.startsWith('pagoda-')?.8:p.icon==='garden'?1:1.25})">${icon(p.icon)}</g><rect class="sb-label-bg" x="-145" y="42" width="290" height="68" rx="9"/><text y="69" text-anchor="middle" class="sb-name" style="font-size:${Math.min(25,270/p.name.length)}px">${E(p.name)}</text><text text-anchor="middle" class="atlas-phone-name">${p.name.length>8?`<tspan x="0" y="70">${E(p.name.slice(0,8))}</tspan><tspan x="0" y="104">${E(p.name.slice(8))}</tspan>`:`<tspan x="0" y="84">${E(p.name)}</tspan>`}</text><text y="95" text-anchor="middle" class="sb-caption">${E(candidate?'备选 · '+p.caption:p.caption)}</text>${steps.length?`<g transform="translate(64 -55)"><rect x="-16" y="-15" width="${Math.max(35,steps.length*23)}" height="32" rx="16" fill="#bf784c"/><text y="7" x="${Math.max(0,(steps.length*23-35)/2)}" text-anchor="middle" class="sb-number">${steps.join('·')}</text></g>`:''}</g></g>`;}).join('')}
 </svg>`;
}
export function mount(host,day,onSelect,booked={},region){
 const info=trip.regions.find(r=>r.id===region);if(!info)throw Error('未知区域');
 const panels=mapPanels(trip,region),ids=mapPlaces(trip,region),nodes=ids.map(id=>places.find(p=>p.id===id));
 let selected=null,category='全部';
 const cameraKey=trip.id+':'+region;let view=cameras.get(cameraKey)||camera();let drag=null,suppressClick=false;
 const d=trip.days.find(d=>d.id===day),route=info.routes.find(q=>q.dayId===day)||{stops:[],legs:[]};
 host.classList.add('fixed-atlas');
 host.innerHTML=`<div class="geo-toolbar"><div><span class="eyebrow">YOUR LITTLE ESCAPE</span><h2>${E(info.title)}</h2></div><span class="sb-edition">微缩旅行沙盘<br><small>一个城市，一张固定地图</small></span></div><div class="geo-filters" aria-label="沙盘地点类别">${['全部',...new Set(nodes.map(p=>p.type))].map(t=>`<button data-category="${E(t)}" aria-pressed="${t==='全部'}">${E(t)}${t==='全部'?' · '+nodes.length:''}</button>`).join('')}<span>点类别突出显示</span></div><div class="map-camera-tools"><button data-camera="out" aria-label="缩小地图">−</button><output class="map-scale"></output><button data-camera="in" aria-label="放大地图">＋</button><button data-camera="reset">全景</button><span>放大看小店 · 拖动看周边</span></div><p class="mobile-map-hint">固定方位地图 · 点击查看地点详情</p><div class="sb-canvas ${panels.length>1?'atlas-overview':''}"></div><div class="sb-legend"><span><i></i>当天顺序</span><span><i class="return"></i>返回</span><span class="atlas-candidate-key">备选见地点说明</span><span>区域间不按同一比例</span></div><p class="atlas-context">${E(info.note)}</p><div class="geo-route"><b>${E(d.date)} · ${E(info.name)}</b><div>${route.stops.map((id,i)=>`${i?'<span class="sb-next">→</span>':''}<button data-place="${id}">${E(places.find(p=>p.id===id).name)}</button>`).join('')||'<p>当天没有此区域安排，所有备选仍然保留。</p>'}</div><p>${E(d.intro)}</p></div><details class="geo-directory"><summary>地点索引 · ${nodes.length}个选项</summary><div class="geo-index"></div></details>`;
 const canvas=host.querySelector('.sb-canvas');
 function applyCamera(){cameras.set(cameraKey,view);canvas.querySelectorAll('svg.sb-map').forEach(svg=>{svg.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);svg.style.touchAction=view.zoom>1?'none':'pan-y';svg.style.cursor=view.zoom>1?'grab':'default';});host.querySelector('.map-scale').textContent=Math.round(view.zoom*100)+'%';host.querySelector('[data-camera=out]').disabled=view.zoom===1;host.querySelector('[data-camera=in]').disabled=view.zoom===4;}
 function draw(){canvas.innerHTML=panels.map(p=>{const q=p.routes.find(q=>q.dayId===day)||{stops:[],legs:[]};return `<section class="atlas-panel" data-panel="${p.id}">${sceneSVG(p,q,selected,category,booked,info.panels?route.stops:q.stops)}${(p.unlocated||[]).length?`<div class="atlas-unlocated"><small>待定位 / 待选门店</small>${p.unlocated.map(id=>`<button data-place="${id}">${E(places.find(p=>p.id===id).name)}</button>`).join('')}</div>`:''}</section>`;}).join('');host.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.category===category));host.querySelector('.geo-index').innerHTML=nodes.map(p=>`<button data-place="${p.id}">${E(p.name)}<small>${E(placeStatus(p,booked))}</small></button>`).join('');applyCamera();}
 function select(id){if(id!==null&&!ids.includes(id))throw Error('未知地点');selected=id;draw();if(id)onSelect(places.find(p=>p.id===id));}
 function click(e){if(suppressClick){suppressClick=false;return;}const control=e.target.closest('[data-camera]');if(control){view=control.dataset.camera==='reset'?camera():zoomAt(view,view.zoom*(control.dataset.camera==='in'?1.4:1/1.4));applyCamera();return;}const p=e.target.closest('[data-place]');if(p){select(p.dataset.place);return;}const b=e.target.closest('button');if(b?.dataset.category){category=b.dataset.category;draw();}}
 function key(e){if(e.target.closest('g[data-place]')&&['Enter',' '].includes(e.key)){e.preventDefault();click(e);}}
 function down(e){const svg=e.target.closest('svg.sb-map');if(!svg||view.zoom===1||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:view,scale:svg.getScreenCTM().a,svg};suppressClick=false;}
 function move(e){if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5){suppressClick=true;drag.svg.setPointerCapture(e.pointerId);}view=camera(drag.start.x-dx/drag.scale,drag.start.y-dy/drag.scale,drag.start.zoom);applyCamera();}
 function up(e){if(drag?.id===e.pointerId){if(drag.svg.hasPointerCapture(e.pointerId))drag.svg.releasePointerCapture(e.pointerId);drag=null;}}
 function wheel(e){if(!e.ctrlKey||!e.target.closest('svg.sb-map'))return;e.preventDefault();const svg=e.target.closest('svg'),pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());view=zoomAt(view,view.zoom*Math.exp(-e.deltaY*.01),(pt.x-view.x)/view.w,(pt.y-view.y)/view.h);applyCamera();}
 host.addEventListener('click',click);host.addEventListener('keydown',key);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});draw();return {select,destroy(){host.removeEventListener('click',click);host.removeEventListener('keydown',key);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);host.replaceChildren();}};
}
