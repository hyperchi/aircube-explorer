// Planning assumptions, not measured device data. All numerical radio assumptions are editable.
export const profiles={
 thread:{name:'Current · Thread / BLE',radio:'ESP32-H2',route:'Thread border router → Internet',voltage:3.3,minimum:3,maximum:3.6,peak:140,active:45,idle:0.1,attach:1,rate:20,overhead:200,changes:['Keep U7 (ESP32-H2) and its existing radio.','Provide a Thread border router, or implement a BLE gateway.','Implement application transport, credentials and retry buffering.'],source:'https://www.espressif.com/en/products/socs/esp32-h2'},
 wifi:{name:'Swap to Wi-Fi',radio:'ESP32-C3 candidate',route:'Wi-Fi access point → Internet',voltage:3.3,minimum:3,maximum:3.6,peak:400,active:140,idle:0.2,attach:3,rate:500,overhead:800,changes:['Replace U7 with a Wi-Fi-capable MCU/module such as ESP32-C3.','Redesign the footprint, pin mapping, power decoupling and antenna clearance; this is not a drop-in swap.','Port sensor / LED firmware and add Wi-Fi provisioning and secure transport.'],source:'https://documentation.espressif.com/esp32-c3_datasheet_en.html'},
 cellular:{name:'Add cellular + SIM',radio:'LTE-M modem candidate',route:'SIM → carrier network → Internet',voltage:3.8,minimum:3.3,maximum:4.3,peak:1000,active:250,idle:0.05,attach:10,rate:100,overhead:1200,changes:['Keep U7 as sensor controller; add an LTE-M modem (BG95 family is one candidate).','Add SIM/eSIM, cellular antenna, ESD protection and a separate modem power rail.','Route UART, modem enable/reset and optional flow control; check exact modem I/O voltages and level shifting.','Select a carrier-compatible module variant, bands and plan. Implement AT-command control, APN, TLS, retries and sleep.'],source:'https://www.quectel.com/content/uploads/2024/03/Quectel_BG95_Series_LPWA_Specification_V2.0-4-1.pdf'}
};
export const defaults={variant:'base',kind:'thread',interval:300,payload:256,usbCurrent:500,usbV:5,efficiency:85,baseMw:100,supply:500,railV:3.3,signal:'good',network:true,sim:true,antenna:true,overrides:{}};
const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
export function normalize(input={}){
 const s={...defaults,...input};s.variant=s.variant==='pro'?'pro':'base';if(!profiles[s.kind])s.kind='thread';
 for(const [k,min,max] of [['interval',1,86400],['payload',1,1000000],['usbCurrent',1,5000],['usbV',5,5],['efficiency',1,100],['baseMw',0,10000],['supply',1,10000],['railV',1,6]])s[k]=clamp(s[k],min,max,defaults[k]);
 s.signal=['good','weak','none'].includes(s.signal)?s.signal:'good';for(const k of ['network','sim','antenna'])s[k]=s[k]!==false;
 delete s.battery;delete s.batteryV;s.powerSource='usb-c';
 s.overrides={};for(const kind of Object.keys(profiles)){const o=input.overrides?.[kind]||{},p=profiles[kind];s.overrides[kind]={};for(const [key,min,max] of [['peak',1,10000],['active',0.01,5000],['idle',0,1000],['attach',0.01,600],['rate',0.01,100000],['overhead',0,100000]])s.overrides[kind][key]=clamp(o[key],min,max,p[key]);}
 return s;
}
export function evaluate(input,kind=input.kind){
 const s=normalize(input),p={...profiles[kind],...s.overrides[kind]};
 const weak=s.signal==='weak',attempts=weak?2:1,attach=p.attach*(weak?2:1),tx=(s.payload+p.overhead)*8/(p.rate*1000)*(weak?2:1);
 const cycle=(attach+tx)*attempts,utilization=Math.min(1,cycle/s.interval),requested=86400/s.interval,capacity=86400/cycle;
 const problems=[];
 if(!s.antenna)problems.push('Antenna missing');if(!s.network)problems.push(kind==='cellular'?'Carrier unavailable':kind==='wifi'?'Wi-Fi access point unavailable':'Gateway unavailable');if(s.signal==='none')problems.push('No usable signal');if(kind==='cellular'&&!s.sim)problems.push('SIM not provisioned');
 const required=p.peak+s.baseMw/s.railV;
 if(s.supply<required)problems.push('Supply current below modeled peak');if(s.railV<p.minimum)problems.push('Radio rail below planning minimum');if(s.railV>p.maximum)problems.push('Radio rail above planning maximum');
 const usbPeakMa=required*s.railV/(s.usbV*s.efficiency/100);
 if(usbPeakMa>s.usbCurrent)problems.push('USB-C input budget below modeled peak');
 const connected=problems.length===0,delivered=connected?Math.min(requested,capacity):0;
 // Even failed attempts consume active power. No backoff is modeled; each report reconnects.
 const radioMw=s.railV*(p.active*utilization+p.idle*(1-utilization));
 const totalMw=radioMw+s.baseMw,inputMw=totalMw/(s.efficiency/100),usbAverageMa=inputMw/s.usbV,energyWhPerDay=inputMw*24/1000,usbHeadroomMa=s.usbCurrent-usbPeakMa;
 return {kind,p,cycle,attach,tx,attempts,utilization,requested,delivered,backlog:requested-delivered,problems,connected,required,radioMw,totalMw,inputMw,usbAverageMa,usbPeakMa,usbHeadroomMa,energyWhPerDay,dataMB:delivered*(s.payload+p.overhead)*attempts*30/1e6,offeredMB:requested*s.payload*30/1e6,energyMwh:totalMw*s.interval/3600};
}
export function sequence(input){const s=normalize(input),r=evaluate(s),steps=[{label:'Read sensors',detail:`Prepare ${s.payload} bytes`,duration:0.1}];
 if(r.problems.some(p=>p.startsWith('Supply')||p.startsWith('Radio rail')||p.startsWith('USB-C')))return [...steps,{label:'Power fault',detail:r.problems.join(' · '),duration:0.1,failed:true}];
 steps.push({label:'Wake radio',detail:r.p.radio,duration:0.2});
 if(s.kind==='cellular')steps.push({label:s.sim?'SIM ready':'SIM unavailable',detail:s.sim?'Assume active plan and correct APN':'Provision the SIM to continue',duration:0.5,failed:!s.sim});
 if(steps.at(-1).failed)return steps;
 steps.push({label:r.connected?'Connect to network':'Connection failed',detail:r.connected?r.p.route:r.problems.join(' · '),duration:r.attach,failed:!r.connected});
 if(!r.connected)return [...steps,{label:'Keep reading in buffer',detail:'No data delivered; try again at the next interval',duration:0.1,failed:true}];
 if(s.signal==='weak')steps.push({label:'Retry connection',detail:'Weak-signal scenario assumes one retry',duration:r.attach+r.tx});
 return [...steps,{label:'Send reading',detail:`${s.payload} payload bytes + ${r.p.overhead} assumed overhead bytes`,duration:r.tx},{label:'Server acknowledgement',detail:'Successful delivery assumed once connected',duration:0.1},{label:'Sleep until next reading',detail:r.cycle>s.interval?'Radio busy: reports accumulate in buffer':`${Math.max(0,s.interval-r.cycle).toFixed(1)} seconds available`,duration:0.1}];
}
