import {test} from 'node:test';
import assert from 'node:assert/strict';
import {level,simulate} from '../src/simulation.js';
import fs from 'node:fs';
test('VOC firmware thresholds and interpolation',()=>{[0,65,220,650,2200,5500].forEach((v,i)=>assert.equal(level(v,[65,220,650,2200,5500]),[0,15,50,100,200,500][i]));assert.equal(level(435,[65,220,650,2200,5500]),75);assert.equal(level(65000,[65,220,650,2200,5500]),500)});
test('Base ignores CO2; Pro selects worse source; power off disables LED',()=>{const input={tvoc:0,co2:2000,brightness:75,power:true,model:'base'};assert.equal(simulate(input).severity,0);assert.equal(simulate({...input,model:'pro'}).severity,200);assert.equal(simulate({...input,model:'pro'}).driver,'CO₂');assert.equal(simulate({...input,power:false}).color,'#253033')});
test('extracted board has valid net references and actual hardware',()=>{const b=JSON.parse(fs.readFileSync('public/board.json'));assert.equal(b.tracks.length,301);assert.ok(b.components.find(c=>c.value==='ESP32-H2-MINI-1'));for(const t of b.tracks)assert.ok(t.net==='0'||b.nets[t.net]);for(const c of b.components)for(const p of c.pads)assert.ok(p.net==='0'||b.nets[p.net]);assert.equal(b.edges.length,20)});
