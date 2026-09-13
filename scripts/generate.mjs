import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';import {fileURLToPath} from 'node:url';
import {validateTrip} from './validate-trip.mjs';
export async function generate(input,output){
 const trip=validateTrip(JSON.parse(await readFile(input,'utf8')));
 const assets=new URL('../assets/',import.meta.url),template=await readFile(new URL('template.html',assets),'utf8');
 if(template.split('__TRIP_JSON__').length!==2)throw Error('模板数据入口损坏');
 try{await stat(output);throw Error('输出目录已存在；请使用新目录，避免覆盖旧旅行');}catch(e){if(e.code!=='ENOENT')throw e;}
 const payload=JSON.stringify(trip).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029');
 const manifest={name:trip.title,short_name:'旅行沙盘',id:'./',start_url:'./',scope:'./',display:'standalone',background_color:'#f7f6f0',theme_color:'#355e49',icons:[{src:'./apple-touch-icon.png',sizes:'192x192',type:'image/png'},{src:'./icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]};
 // Validate and read every asset before creating the output directory.
 const icon=await readFile(new URL('icon.svg',assets));const png=await readFile(new URL('apple-touch-icon.png',assets));
 await mkdir(output,{recursive:true});await writeFile(join(output,'index.html'),template.replace('__TRIP_JSON__',()=>payload));
 await writeFile(join(output,'manifest.webmanifest'),JSON.stringify(manifest,null,2));await writeFile(join(output,'icon.svg'),icon);await writeFile(join(output,'apple-touch-icon.png'),png);
 return resolve(output);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==4)throw Error('用法：node scripts/generate.mjs trip.json 新输出目录');console.log(await generate(process.argv[2],process.argv[3]));}catch(e){console.error(e.message);process.exitCode=1;}
}
