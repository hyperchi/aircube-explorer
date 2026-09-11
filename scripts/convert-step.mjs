// Usage: node scripts/convert-step.mjs <model-name> <source.step>
import fs from 'node:fs';import occtImport from 'occt-import-js';
const [name,path]=process.argv.slice(2);if(!name||!path)throw Error('Usage: node scripts/convert-step.mjs name source.step');
const occt=await occtImport();fs.mkdirSync('public/models',{recursive:true});
function read(path){const result=occt.ReadStepFile(fs.readFileSync(path),{linearUnit:'millimeter',linearDeflection:0.02});if(!result.success)throw Error('Cannot read '+path);return result;}
function write(name,meshes){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const m of meshes)for(let i=0;i<m.attributes.position.array.length;i++){const a=i%3,v=m.attributes.position.array[i];min[a]=Math.min(min[a],v);max[a]=Math.max(max[a],v)}const center=min.map((v,i)=>(v+max[i])/2),round=v=>Math.round(v*10000)/10000;const data={units:'mm',dimensions:max.map((v,i)=>round(v-min[i])),meshes:meshes.map(m=>({positions:m.attributes.position.array.map((v,i)=>round(v-center[i%3])),normals:m.attributes.normal?.array.map(round),indices:m.index.array,color:m.color,faces:m.brep_faces.filter(f=>f.color)}))};fs.writeFileSync('public/models/'+name+'.json',JSON.stringify(data));console.log(name,data.dimensions,meshes.length+' meshes');}
write(name,read(path).meshes);
