// Only template maintainers need esbuild; ordinary generation uses Node built-ins.
import {build} from 'esbuild';import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const assets=new URL('../assets/',import.meta.url);
const built=await build({entryPoints:[fileURLToPath(new URL('src/app.mjs',assets))],bundle:true,format:'iife',minify:true,charset:'utf8',write:false,outdir:'unused',legalComments:'inline'});
let shell=await readFile(new URL('shell.html',assets),'utf8');
const js=built.outputFiles.find(f=>f.path.endsWith('.js')).text.replace(/<\/script/gi,'<\\/script');
const css=built.outputFiles.find(f=>f.path.endsWith('.css')).text;
// Phone styles come last just as in the approved original page.
const phone=await readFile(new URL('src/phone.css',assets),'utf8');
const standard=await readFile(new URL('src/standard.css',assets),'utf8');
shell=shell.replace('__STYLE__',()=>css+'\n'+phone+'\n'+standard).replace('__RUNTIME__',()=>js);
await writeFile(new URL('template.html',assets),shell);
console.log('Fixed template rebuilt.');
