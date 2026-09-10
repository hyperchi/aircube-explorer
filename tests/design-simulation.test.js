import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults,normalize,evaluate,sequence} from '../src/design-simulation.js';
test('USB-C power budget conserves units and removes legacy battery settings',()=>{
 const s=normalize({...defaults,baseMw:100,overrides:{thread:{active:10,idle:10}}});const r=evaluate(s);
 assert.equal(r.totalMw,133);assert.ok(Math.abs(r.inputMw-133/.85)<1e-10);assert.equal(r.energyWhPerDay,r.inputMw*24/1000);assert.equal(r.usbAverageMa,r.inputMw/5);
 assert.equal(normalize({...s,battery:4000}).battery,undefined);assert.equal(s.powerSource,'usb-c');
});
test('cellular requires SIM, network, antenna and adequate supply',()=>{
 const s={...defaults,kind:'cellular',railV:3.8,supply:1500,usbCurrent:1500};assert.ok(evaluate(s).connected);
 for(const change of [{sim:false},{network:false},{antenna:false},{signal:'none'},{supply:500},{railV:2.9},{railV:5},{usbCurrent:100}]){
 const r=evaluate({...s,...change});assert.equal(r.delivered,0);assert.ok(r.problems.length);assert.ok(sequence({...s,...change}).some(e=>e.failed));assert.ok(!sequence({...s,...change}).some(e=>e.label==='Send reading'));
 }
 assert.ok(evaluate({...defaults,sim:false}).connected);
});
test('weak signal costs time and energy; saturated workloads create backlog',()=>{
 const good=evaluate(defaults),weak=evaluate({...defaults,signal:'weak'});
 assert.ok(weak.cycle>good.cycle);assert.ok(weak.totalMw>good.totalMw);
 const busy=evaluate({...defaults,kind:'cellular',railV:3.8,supply:2000,usbCurrent:1500,interval:1,payload:100000});
 assert.equal(busy.utilization,1);assert.ok(busy.backlog>0);assert.ok(busy.delivered<busy.requested);
});
test('input restoration rejects nonfinite values and preserves independent profile assumptions',()=>{
 const s=normalize({kind:'unknown',interval:0,payload:Infinity,overrides:{cellular:{attach:NaN},wifi:{active:200}}});
 assert.equal(s.kind,'thread');assert.equal(s.interval,1);assert.equal(s.payload,defaults.payload);assert.equal(s.overrides.wifi.active,200);assert.equal(s.overrides.cellular.attach,10);assert.ok(Number.isFinite(evaluate(s).energyWhPerDay));
});
test('delivery byte estimate includes overhead and retries with no data when offline',()=>{
 const s=normalize({...defaults,payload:100,interval:60,overrides:{thread:{overhead:20}}});
 assert.equal(evaluate(s).dataMB,1440*120*30/1e6);assert.equal(evaluate({...s,network:false}).dataMB,0);
});
