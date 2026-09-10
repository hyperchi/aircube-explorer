export const designHighlights={
 thread:{title:'Current connection',parts:[{ref:'U7',action:'Keep radio',color:'#60a5fa'}],note:'Keep the ESP32-H2. Thread/BLE needs an external gateway for Internet access.'},
 wifi:{title:'Wi-Fi redesign',parts:[{ref:'U7',action:'Replace with Wi-Fi MCU',color:'#fb923c'},{ref:'U6',action:'Review 3.3 V supply',color:'#facc15'}],note:'Orange: replace U7. Yellow: review U6 power capacity. The new module footprint and antenna layout must be redesigned.'},
 cellular:{title:'Cellular + SIM redesign',parts:[{ref:'U7',action:'Keep MCU · add UART',color:'#60a5fa'},{ref:'U6',action:'Review power design',color:'#facc15'},{ref:'P1',action:'Check USB input budget',color:'#facc15'}],note:'Blue: keep U7 and connect a modem over UART. Yellow: review the power path. Add a modem, SIM, antenna and dedicated modem rail; these are not on this PCB.'}
};
export function highlightOverlay(board,kind,side){
 if(!kind||side!=='F.Cu')return '';
 const design=designHighlights[kind];if(!design)return '';
 return `<g class="design-highlight-layer" pointer-events="none">${design.parts.map(({ref,action,color})=>{const c=board.components.find(c=>c.ref===ref);if(!c)return '';const radius=ref==='U7'?8:ref==='P1'?4.5:2.6;return `<g data-design-ref="${ref}" data-design-action="${action}"><circle cx="${c.at[0]}" cy="${c.at[1]}" r="${radius}" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width=".35"/><text x="${c.at[0]}" y="${c.at[1]-radius-.8}" text-anchor="middle" fill="${color}" stroke="#101719" stroke-width=".3" paint-order="stroke" font-size="1.15" font-family="Inter,sans-serif">${ref} · ${action}</text></g>`}).join('')}</g>`;
}
