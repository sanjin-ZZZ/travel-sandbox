import './phone.css';
import {pageItems} from './mobile-data.mjs';
import {externalLink} from './model.mjs';
export function mount(host,{A,Geography,Ledger,state,view,save,backup,importBackup,initialDay=A.days[0].id,initialArea=A.sceneForDay(initialDay),onArea,onDay}){
 const E=A.escape,link=externalLink;
 let day=initialDay,mode='today',area=initialArea,geo=null,foodPage=0,foodCity='全部',foodType='全部',only=false;
 const screen=document.createElement('div');screen.className='phone-screen';host.replaceChildren(screen);
 const dialog=document.createElement('dialog');dialog.className='phone-dialog';dialog.setAttribute('aria-label','详情');host.append(dialog);
 const closeButton=()=>'<button type="button" class="phone-close" data-p-close>关闭 ✕</button>';
 function open(title,html){dialog.innerHTML=`<header><h2>${E(title)}</h2>${closeButton()}</header><div class="phone-dialog-body">${html}</div>`;dialog.showModal();}
 function note(id,label){return `<label class="phone-note">${label}<textarea data-p-note="${id}" maxlength="20000">${E(state.notes[id]||'')}</textarea></label>`;}
 function pager(p){return `<div class="phone-pager"><button data-p-page="${p.page-1}" ${p.page===0?'disabled':''}>上一页</button><span>${p.page+1} / ${p.pages} · ${p.total} 项</span><button data-p-page="${p.page+1}" ${p.page===p.pages-1?'disabled':''}>下一页</button></div>`;}
 const header=(title,extra='')=>`<div class="phone-head"><h2>${title}</h2>${extra}</div>`;
 function stopGeo(){geo?.destroy();geo=null;}
 function drawDays(){stopGeo();const d=A.days.find(x=>x.id===day);screen.innerHTML=`${header(E(A.trip.dateLabel),`<button data-p-info>备忘与提醒</button>`)}<div class="phone-dates">${A.days.map(x=>`<button data-p-day="${x.id}" aria-pressed="${x.id===day}"><b>${E(x.short)}</b><small>${x.week}</small></button>`).join('')}</div><div class="phone-switch"><button data-p-mode="today" aria-pressed="${mode==='today'}">今日安排</button><button data-p-mode="map" aria-pressed="${mode==='map'}">看沙盘</button><span>${E(d.city)}</span></div>${mode==='today'?`<div class="phone-events">${d.items.map(i=>`<div class="phone-event ${state.done[i.id]?'is-done':''}"><button data-p-event="${i.id}"><small>${E(i.time)}${i.tag?' · '+E(i.tag):''}</small><strong>${E(i.name)}</strong></button><label><input type="checkbox" data-p-done="${i.id}" ${state.done[i.id]?'checked':''} aria-label="完成 ${E(i.name)}"></label></div>`).join('')}</div><p class="phone-hint">点安排看详情 · 可选项目不用全去</p>`:`<div class="phone-areas">${A.trip.regions.filter(r=>!r.panels).map(r=>[r.id,r.name]).map(([id,name])=>`<button data-p-area="${id}" aria-pressed="${area===id}">${E(name)}</button>`).join('')}</div><div id="phone-map"></div>`}`;
 if(mode==='map')geo=Geography.mount(screen.querySelector('#phone-map'),day,p=>open(p.name,`<p class="tag">${E(Geography.placeStatus(p,state.booked))}</p><p>${E(p.desc)}</p><p>${E(p.stay)}</p>${p.quality?`<p class="phone-hint">${E(p.quality)}</p>`:''}<div class="links">${link(Geography.navigation(p),'查位置')}${p.source?link(p.source,'资料'):''}</div>${note('place-'+p.id,'地点备注')}`),state.booked,area);
 if(mode==='map'){screen.querySelector('.mobile-map-hint').textContent='固定方位 · 点地点查看介绍';screen.querySelector('.geo-directory').open=true;}
 }
 function drawFood(){const list=A.filterFoods(foodCity,foodType,'',only,state),p=pageItems(list,foodPage);foodPage=p.page;screen.innerHTML=`${header('吃什么',`<button data-p-only aria-pressed="${only}">${only?'★ 已收藏':'☆ 只看收藏'}</button>`)}<div class="phone-filter"><label>城市<select data-p-city>${['全部',...A.trip.cities].map(x=>`<option ${x===foodCity?'selected':''}>${E(x)}</option>`).join('')}</select></label><label>类别<select data-p-type>${['全部','早餐','正餐','小吃','咖啡'].map(x=>`<option ${x===foodType?'selected':''}>${x}</option>`).join('')}</select></label></div><div class="phone-foods">${p.items.map(f=>`<div class="phone-food"><button data-p-food="${f.id}"><strong>${E(f.name)}</strong><small>${E(f.city)} · ${E(f.type)}</small><p>${E(f.desc)}</p></button><button data-p-fav="${f.id}" aria-label="${state.favorites[f.id]?'取消收藏':'收藏'} ${E(f.name)}" aria-pressed="${!!state.favorites[f.id]}">${state.favorites[f.id]?'★':'☆'}</button></div>`).join('')||'<p class="phone-hint">暂无符合条件的选项，换个筛选试试。</p>'}</div>${pager(p)}`;}
 function drawStay(){screen.innerHTML=header('住与行')+'<div class="phone-section-label">酒店候选 · 自行预订</div>'+A.hotels.map(h=>`<button class="phone-summary" data-p-hotel="${h.id}"><small>${E(h.city)} · ${state.booked[h.id]?'已标记预订':'候选，未预订'}</small><strong>${E(h.name)}</strong><span>${E(h.stay)} ›</span></button>`).join('')+'<div class="phone-section-label">交通与提醒</div>'+A.trip.practical.map(t=>`<button class="phone-summary" data-p-practical="${t.id}"><strong>${E(t.title)}</strong><span>${E(t.summary)} ›</span></button>`).join('');}
 function drawLedger(){if(!state.ledger)state.ledger=Ledger.initial();screen.innerHTML=header('记账',`<button data-p-tools>统计与备份</button>`)+`<div id="phone-ledger"></div><button class="phone-add" data-p-add>＋ 记一笔</button><p class="phone-hint" id="phone-ledger-notice" role="status"></p>`;const lh=screen.querySelector('#phone-ledger');const ledgerUI=Ledger.mount(lh,state.ledger,save,{pageSize:5});
 const editor=lh.querySelector('.ledger-editor'),budget=editor.querySelector('#ledger-budget-form'),form=editor.querySelector('#ledger-form');
 const entryDialog=document.createElement('dialog');entryDialog.className='phone-dialog phone-entry';entryDialog.setAttribute('aria-label','记一笔');entryDialog.innerHTML=`<header><h2>记一笔</h2>${closeButton()}</header>`;entryDialog.append(editor);lh.append(entryDialog);
 const toolsDialog=document.createElement('dialog');toolsDialog.className='phone-dialog';toolsDialog.setAttribute('aria-label','统计与备份');toolsDialog.innerHTML=`<header><h2>统计与备份</h2>${closeButton()}</header><div class="phone-dialog-body"></div>`;const body=toolsDialog.lastElementChild;body.append(budget,lh.querySelector('.ledger-breakdown-title'),lh.querySelector('#ledger-breakdown'));body.insertAdjacentHTML('beforeend',`<div class="actions"><button data-p-backup>导出全部记录</button><button data-p-import>导入备份</button></div><p class="phone-hint">仅本地保存，不自动同步。导入会替换当前记录，请先备份。</p><details><summary>原来的旅行备忘</summary>${note('general','整趟备注')}</details>`);lh.append(toolsDialog);
 screen.querySelector('[data-p-add]').onclick=()=>{ledgerUI.startNew();entryDialog.querySelector("header h2").textContent="记一笔";entryDialog.showModal();};screen.querySelector('[data-p-tools]').onclick=()=>toolsDialog.showModal();
 lh.addEventListener('click',e=>{if(e.target.closest('[data-edit]')){entryDialog.querySelector('header h2').textContent='修改账单';entryDialog.showModal();form.elements.amount.focus();}if(e.target.closest('[data-ledger="cancel"]'))entryDialog.close();});
 form.addEventListener('submit',()=>{if(!lh.querySelector('#ledger-error').textContent){entryDialog.close();screen.querySelector('#phone-ledger-notice').textContent='已记录；若列表没有显示，请清除筛选查看。';}});
 }
 function click(e){const b=e.target.closest('button');if(!b)return;const ds=b.dataset;
 if('pClose'in ds){b.closest('dialog').close();return;}
 if('pDay'in ds){day=ds.pDay;area=A.sceneForDay(day);onDay(day);onArea(area);drawDays();}
 else if('pMode'in ds){mode=ds.pMode;drawDays();}
 else if('pArea'in ds){area=ds.pArea;onArea(area);drawDays();}
 else if('pInfo'in ds){const d=A.days.find(x=>x.id===day);open('当天提醒',`<p>${E(d.warn)}</p>${note(day,'当天备注')}`);}
 else if('pEvent'in ds){const item=A.days.find(x=>x.id===day).items.find(x=>x.id===ds.pEvent);open(item.name,`<p class="tag">${E(item.time)}</p><p>${E(item.desc)}</p><div class="links">${item.map?link(A.map(item.map),'地图查找'):''}${item.url?link(item.url,'查看资料'):''}</div>`);}
 else if('pPage'in ds){foodPage=Number(ds.pPage);drawFood();}
 else if('pOnly'in ds){only=!only;foodPage=0;drawFood();}
 else if('pFav'in ds){A.toggle(state,'favorites',ds.pFav);save();drawFood();}
 else if('pFood'in ds){const f=A.foods.find(x=>x.id===ds.pFood);open(f.name,`<p class="tag">${E(f.city)} · ${E(f.type)} · ${E(f.kind)}</p><p>${E(f.desc)}</p><div class="links">${link(A.map(f.query),'地图找店')}${link(f.url,'资料来源')}</div>`);}
 else if('pHotel'in ds){const h=A.hotels.find(x=>x.id===ds.pHotel);open(h.name,`<p>${E(h.stay)}</p><p>${E(h.desc)}</p><p class="note">${E(h.risk)}</p><p class="phone-hint">日期价格、房型与退改条件需自行核实。</p><div class="links">${link(h.url,'酒店页面')}${link(A.map(h.query),'查位置')}</div><label class="check"><input type="checkbox" data-p-booked="${h.id}" ${state.booked[h.id]?'checked':''}>我已自行预订</label>${note('hotel-'+h.id,'房型、实付与退改备注')}`);}
 else if('pPractical'in ds){const t=A.trip.practical.find(x=>x.id===ds.pPractical);open(t.title,`<p>${E(t.detail)}</p>${note('practical-'+t.id,'补充备注')}`);}
 else if('pBackup'in ds)backup();else if('pImport'in ds)importBackup();
 }
 function change(e){const t=e.target,ds=t.dataset;if('pDone'in ds){A.toggle(state,'done',ds.pDone);save();t.closest('.phone-event').classList.toggle('is-done',!!state.done[ds.pDone]);}else if('pBooked'in ds){A.toggle(state,'booked',ds.pBooked);save();drawStay();}else if('pCity'in ds){foodCity=t.value;foodPage=0;drawFood();}else if('pType'in ds){foodType=t.value;foodPage=0;drawFood();}}
 function input(e){if(e.target.dataset.pNote){state.notes[e.target.dataset.pNote]=e.target.value;save();}}
 host.addEventListener('click',click);host.addEventListener('change',change);host.addEventListener('input',input);
 ({days:drawDays,food:drawFood,stay:drawStay,notes:drawLedger})[view]();
 return {destroy(){stopGeo();host.querySelectorAll('dialog[open]').forEach(d=>d.close());host.removeEventListener('click',click);host.removeEventListener('change',change);host.removeEventListener('input',input);host.replaceChildren();}};
}
