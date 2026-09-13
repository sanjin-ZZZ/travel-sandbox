export const categories=['机票','酒店','租车','油费停车','餐饮','门票','购物','其他'];
export let cities=['跨城 / 其他'];
export let travelers=1;
export function configure(trip){cities=[...trip.cities,'跨城 / 其他'];travelers=trip.travelers;}
export const initial=()=>({budget:null,entries:[]});
export function commit(s,change,save){const previous={budget:s.budget,entries:s.entries.map(e=>({...e}))};try{change(s);save();}catch(error){Object.assign(s,previous);throw error;}}
const validMoney=n=>Number.isSafeInteger(n)&&n>0&&n<=100000000;
export function money(value){const s=String(value).trim();if(!/^\d{1,7}(\.\d{1,2})?$/.test(s))throw Error('金额请填写正数，最多两位小数');const [a,b='']=s.split('.'),n=Number(a)*100+Number(b.padEnd(2,'0'));if(!validMoney(n))throw Error('金额应在0.01至1,000,000元之间');return n;}
export const format=n=>(n/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
function checkEntry(e){if(!e||Object.keys(e).sort().join()!=='category,cents,city,date,id,kind,note,payer,title')throw Error('账单字段不完整');if(typeof e.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(e.id)||!validMoney(e.cents)||!categories.includes(e.category)||!cities.includes(e.city)||!['expense','refund'].includes(e.kind))throw Error('账单金额或分类无效');if(typeof e.date!=='string'||!/^20\d\d-\d\d-\d\d$/.test(e.date)||!Number.isFinite(Date.parse(e.date))||new Date(e.date).toISOString().slice(0,10)!==e.date)throw Error('账单日期无效');for(const [key,max] of [['title',100],['payer',40],['note',1000]])if(typeof e[key]!=='string'||e[key].length>max)throw Error('账单文字超长或无效');if(!e.title.trim())throw Error('请填写消费项目');}
export function validate(s){if(!s||Object.keys(s).sort().join()!=='budget,entries'||(s.budget!==null&&!validMoney(s.budget))||!Array.isArray(s.entries)||s.entries.length>1000)throw Error('账本格式无效，最多记录1000笔');const ids=new Set();for(const e of s.entries){checkEntry(e);if(ids.has(e.id))throw Error('账单编号重复');ids.add(e.id)}return s;}
export function upsert(s,e){checkEntry(e);const entries=s.entries.filter(x=>x.id!==e.id).concat({...e});validate({...s,entries});s.entries=entries;}
export function remove(s,id){if(!s.entries.some(e=>e.id===id))throw Error('账单不存在');s.entries=s.entries.filter(e=>e.id!==id);}
export function filter(s,{city='全部',category='全部',date=''}={}){return s.entries.filter(e=>(city==='全部'||e.city===city)&&(category==='全部'||e.category===category)&&(!date||e.date===date)).sort((a,b)=>b.date.localeCompare(a.date));}
export function summary(s){let expense=0,refund=0;const groups=Object.fromEntries(categories.map(c=>[c,0]));for(const e of s.entries){if(e.kind==='expense')expense+=e.cents;else refund+=e.cents;groups[e.category]+=e.kind==='refund'?-e.cents:e.cents}const net=expense-refund;return {expense,refund,net,average:net/travelers,remaining:s.budget===null?null:s.budget-net,groups};}
