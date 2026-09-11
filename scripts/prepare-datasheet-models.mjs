// Original visual reconstructions; nominal dimensions and sources in models/README.md.
// These are not manufacturer STEP models. Undocumented finishes/details are illustrative.
import fs from 'node:fs';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const dark=[.025,.028,.033],metal=[.58,.61,.64],gold=[.65,.45,.13];
let meshes=[];
function add(g,color,x=0,y=0,z=0){g.translate(x,y,z);meshes.push({positions:Array.from(g.attributes.position.array),normals:Array.from(g.attributes.normal.array),indices:g.index?Array.from(g.index.array):Array.from({length:g.attributes.position.count},(_,i)=>i),color});}
function box(w,d,h,x,y,z,c=dark,r=.025){add(new RoundedBoxGeometry(w,d,h,3,Math.min(r,h/3)),c,x,y,z);}
function outline(w,d,r){const s=new T.Shape(),x=-w/2,y=-d/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
function perforated(w,d,h,r,holeR,hx,hy,z,c){const s=outline(w,d,r),hole=new T.Path();hole.absarc(hx,hy,holeR,0,Math.PI*2,true);s.holes.push(hole);add(new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:40}),c,0,0,z);}
function disc(r,h,x,y,z,c){const g=new T.CylinderGeometry(r,r,h,48);g.rotateX(Math.PI/2);add(g,c,x,y,z);}
function save(name){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const m of meshes)m.positions.forEach((v,i)=>{min[i%3]=Math.min(min[i%3],v);max[i%3]=Math.max(max[i%3],v)});const round=v=>Math.round(v*10000)/10000;for(const m of meshes){m.positions=m.positions.map((v,i)=>round(v-(min[i%3]+max[i%3])/2));m.normals=m.normals.map(round)}const data={units:'mm',dimensions:max.map((v,i)=>round(v-min[i])),meshes};fs.writeFileSync('public/models/'+name+'.json',JSON.stringify(data));console.log(name,data.dimensions,meshes.length);meshes=[];}
// ENS161, datasheet pp.41–42: 3mm square, 0.83mm total, 0.3mm inlet,
// 0.7mm square lands on 1.05mm pitch. Lid seam/finish are illustrative.
box(3,3,.12,0,0,.09,dark);perforated(2.86,2.86,.68,.22,.15,-.7,.7,.15,metal);disc(.15,.01,-.7,.7,.16,dark);disc(.04,.008,-1.3,1.3,.154,dark);
for(const x of [-1.05,0,1.05])for(const y of [-1.05,0,1.05])box(.7,.7,.03,x,y,.015,gold,.01);
save('ens161');
// ENS210 QFN drawing p.37: 2mm square, 0.75 high, 1.125/0.630mm cavity,
// 0.224mm cavity depth. Four 0.35mm contacts, .95mm pitch, 1.6x.7 EP.
box(2,2,.506,0,0,.273,dark);
perforated(2,2,.224,.025,.5625,0,0,.526,dark);
const funnel=new T.CylinderGeometry(.5625,.315,.224,64,1,true);funnel.rotateX(Math.PI/2);add(funnel,[.11,.115,.12],0,0,.638);
disc(.315,.01,0,0,.531,[.12,.10,.075]);disc(.055,.006,-.66,-.66,.753,[.3,.3,.31]);
for(const x of [-.475,.475])for(const y of [-.825,.825])box(.35,.35,.02,x,y,.01,metal,.006);
box(1.6,.7,.02,0,0,.01,metal,.01);save('ens210');
// RKB2 from BOM, RK drawing: 4.2 x 3.2 body, 2.5 height, 4.6 lead span.
// Actuator outline, internal construction and folded leads are illustrative.
box(4.2,3.2,1.3,0,0,.8,dark,.08);box(4.1,3.1,.12,0,0,1.51,metal,.08);
add(new T.ExtrudeGeometry(outline(2.15,1.55,.65),{depth:.93,bevelEnabled:false,curveSegments:24}),dark,0,0,1.57);
for(const x of [-1.95,1.95])for(const y of [-1.075,1.075]){box(.7,.55,.15,x,y,.075,metal);box(.15,.55,.7,Math.sign(x)*2.175,y,.425,metal);box(.36,.55,.15,Math.sign(x)*2.05,y,.775,metal);}
for(const x of [-1.6,1.6])for(const y of [-1.05,1.05])disc(.16,.07,x,y,1.6,metal);
save('rkb2');
// TP2: the actual square copper opening, shown on an illustrative board coupon.
box(3.2,3.2,.5,0,0,-.25,[.045,.19,.12],.025);box(1.5,1.5,.035,0,0,.0175,gold,.002);
for(const x of [-.95,.95])box(.12,2.02,.008,x,0,.004,[.85,.85,.8],.002);
for(const y of [-.95,.95])box(2.02,.12,.008,0,y,.004,[.85,.85,.8],.002);
save('testpoint-pad');

// Source LED STEP lost material colors during board export. Restore illustrative
// package materials by the six documented assembly meshes, preserving geometry.
const led=JSON.parse(fs.readFileSync('public/models/rgb-led.json'));
if(led.meshes.length!==6)throw Error('Unexpected LED source assembly');
led.meshes.forEach((m,i)=>{m.color=i===0?dark:i===1?[.82,.78,.62]:gold;});
fs.writeFileSync('public/models/rgb-led.json',JSON.stringify(led));
