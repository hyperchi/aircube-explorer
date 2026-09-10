export function level(value, thresholds) {
 const edges=[0,...thresholds], bands=[0,15,50,100,200,500];
 if(value<=0)return 0;
 for(let i=1;i<edges.length;i++)if(value<edges[i])return bands[i-1]+Math.floor((value-edges[i-1])/(edges[i]-edges[i-1])*(bands[i]-bands[i-1]));
 return 500;
}
export function simulate({tvoc,co2,model,brightness,power}) {
 const voc=level(tvoc,[65,220,650,2200,5500]);
 const carbon=level(co2,[800,1000,1500,2000,5000]);
 const severity=model==='pro'?Math.max(voc,carbon):voc;
 const hue=120*(1-Math.max(0,Math.min(1,(severity-10)/190)));
 return {voc,carbon,severity,driver:model==='pro'&&carbon>voc?'CO₂':'VOC',color:power?`hsl(${hue} 85% ${brightness*.45+5}%)`:'#253033',rating:severity<15?'Excellent':severity<50?'Good':severity<100?'Moderate':severity<200?'Poor':'Unhealthy'};
}
