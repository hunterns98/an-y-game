const assert=require('node:assert/strict');require('./pairing-config.js');global.normalizeAnswer=s=>s.toLowerCase();require('./game-logic.js');
const names=Array.from({length:16},(_,i)=>'Player '+i),room={players:Object.fromEntries(names.map(name=>[name,{name}]))};
const pairs=r=>Object.values(r.teams).flatMap(t=>[t.player1,t.player2]);
for(const count of [0,1,2,20]){const a=preparePairing({...room,pairingCount:count},()=>0),b=preparePairing({...room,pairingCount:count},()=>.999);assert.equal(Object.keys(a.teams).length,8);assert.deepEqual([...pairs(a)].sort(),[...names].sort());assert.notDeepEqual(pairs(a),pairs(b));assert.equal(a.pairingCount,count+1);const t=a.teams.team1;assert(GameLogic.renameTeam(a,{teamKey:'team1',player:t.nameEditor,name:'Test'}));assert.equal(GameLogic.renameTeam(a,{teamKey:'team1',player:t.player2,name:'Test'}),null);}
assert.deepEqual(pairs(preparePairing(room,()=>.2)),pairs(preparePairing({...room,pairingCount:1},()=>.2)));
assert.equal(preparePairing({...room,players:{a:{name:'A'}}}),null);for(const status of ['starting','playing','ended'])assert.equal(preparePairing({...room,game:{status}}),null);
console.log('PASS random first draw, all 16 exactly once, eight teams, no fixed plans, game lock, naming permissions');
