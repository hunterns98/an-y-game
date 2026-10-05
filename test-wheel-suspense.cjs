const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('wheel-demo.js','utf8');const start=source.indexOf('  const sequence=[];'),end=source.indexOf('index=visible.length;',start);const snippet=source.slice(start,end)+' result={visible,pending};';
const teams=Object.fromEntries(Array.from({length:8},(_,i)=>['t'+i,{player1:'A'+i,player2:'B'+i}]));const keys=Object.keys(teams);const state={teams,orders:[keys,[...keys].reverse()]};
function read(elapsed){const c={state,elapsed};vm.runInNewContext(snippet,c);return c.result;}
assert.equal(read(4500).pending.name,'A0');assert.equal(read(6499).visible.length,0);assert.equal(read(6500).visible[0].name,'A0');
assert.equal(read(8000).pending.name,'A1');assert.equal(read(9999).visible.length,1);assert.equal(read(10000).visible.length,2);
assert.equal(read(40000).pending.name,'B7');assert.equal(read(41999).visible.length,8);assert.equal(read(42000).visible.length,9);assert.equal(read(71000).visible.length,16);
console.log('PASS: avatars precede team announcements by 2 seconds in both rounds; all 16 finish before publication.');
