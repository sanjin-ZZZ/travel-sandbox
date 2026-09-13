export const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const externalLink=(url,label)=>url?`<a target="_blank" rel="noopener noreferrer" href="${escape(url)}">${escape(label)}</a>`:'';
export function createModel(trip,Ledger){
 const places=new Map(trip.places.map(p=>[p.id,p]));
 const days=trip.days.map(d=>({...d,short:d.date.slice(5).replace('-','.'),week:['周日','周一','周二','周三','周四','周五','周六'][new Date(d.date+'T12:00:00Z').getUTCDay()],items:d.items.map(i=>({...i,map:i.placeId?places.get(i.placeId).mapUrl:'',url:i.placeId?places.get(i.placeId).sourceUrl:''}))}));
 const foods=trip.foods.map(f=>{const p=places.get(f.placeId);return {...p,id:p.id,type:f.type,kind:f.kind,url:p.sourceUrl,query:p.mapUrl};});
 const hotels=trip.hotels.map(h=>{const p=places.get(h.placeId);return {...p,id:p.id,risk:h.risk,url:p.sourceUrl,query:p.mapUrl,stay:`${h.checkIn} 入住 → ${h.checkOut} 退房 · ${(Date.parse(h.checkOut)-Date.parse(h.checkIn))/86400000}晚`};});
 function initial(){return {version:1,tripId:trip.id,favorites:{},done:{},booked:{},notes:{},ledger:Ledger.initial()};}
 const safeKey=k=>/^[a-z0-9-]{1,120}$/.test(k)&&!['constructor','prototype','__proto__'].includes(k);
 function validate(s){if(!s||typeof s!=='object'||Array.isArray(s)||Object.keys(s).sort().join()!=='booked,done,favorites,ledger,notes,tripId,version'||s.version!==1||s.tripId!==trip.id)throw Error('备份不属于本次旅行或版本不支持');
  for(const key of ['favorites','done','booked','notes']){const o=s[key];if(!o||typeof o!=='object'||Array.isArray(o))throw Error('备份字段无效');for(const [k,v] of Object.entries(o))if(!safeKey(k)||(key==='notes'?(typeof v!=='string'||v.length>20000):typeof v!=='boolean'))throw Error('备份内容无效');}Ledger.validate(s.ledger);return s;}
 function toggle(s,key,id){if(!['favorites','done','booked'].includes(key)||!safeKey(id))throw Error('记录键无效');if(s[key][id])delete s[key][id];else s[key][id]=true;}
 function filterFoods(city,type,q,only,s){q=q.trim().toLowerCase();return foods.filter(f=>(city==='全部'||city===f.city)&&(type==='全部'||type===f.type)&&(!only||s.favorites[f.id])&&(f.name+' '+f.desc).toLowerCase().includes(q));}
 const sceneForDay=id=>days.find(d=>d.id===id).region;
 return {trip,days,foods,hotels,initial,validate,toggle,filterFoods,sceneForDay,escape,map:url=>url};
}
