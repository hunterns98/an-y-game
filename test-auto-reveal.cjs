const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');global.normalizeAnswer=s=>String(s||'').trim().toLowerCase();require('./game-logic.js');const G=GameLogic;
const base=()=>({game:{round:0,status:'playing',phase:'answering',type:'choice',answerStartsAt:1000,question:'Q'},teams:{t:{player1:'a',player2:'b',score:0}},answers:{}});
(async()=>{
let room=base();assert.equal(G.shouldAutoReveal(room,999),false);assert.equal(G.shouldAutoReveal(room,30999),false);assert.equal(G.shouldAutoReveal(room,31000),true);
room.answers={a:{round:0,answer:'A'},b:{round:0,answer:'B'}};assert.equal(G.shouldAutoReveal(room,2000),true);room.answers.b.round=-1;assert.equal(G.shouldAutoReveal(room,2000),false);
room=base();room.game.type='team_tags';room.game.tags=['X','Y'];room.answers={a:{round:0,answer:'X',teamKey:'t'},b:{round:0,answer:'Y',teamKey:'t'}};assert.equal(G.shouldAutoReveal(room,2000),false);room.answers.b.answer='X';assert.equal(G.shouldAutoReveal(room,2000),true);
const source=fs.readFileSync('admin.html','utf8');const code=source.slice(source.indexOf('let autoRevealPending='),source.indexOf('// Tuyệt đối KHÔNG ghi điểm'));
let writes=0,now=2000;const ctx={roomCode:'TEST',adminFirebaseConnected:true,serverNow:()=>now,gameCache:room.game,teamsCache:room.teams,answersCache:room.answers,GameLogic:{...G,transactRoom:async(ref,fn)=>{const next=fn(room);if(next){room=next;writes++}return {committed:!!next}}},db:{ref:()=>({})},toast(){},setInterval(){}};
vm.createContext(ctx);vm.runInContext(code,ctx);await Promise.all([ctx.checkAutoReveal(),ctx.checkAutoReveal()]);assert.equal(writes,1);assert.equal(room.teams.t.score,3);await ctx.checkAutoReveal();assert.equal(writes,1);
room=base();ctx.gameCache=room.game;ctx.teamsCache=room.teams;ctx.answersCache=room.answers;now=31000;await ctx.checkAutoReveal();assert.equal(room.game.revealed,true);assert.equal(room.teams.t.score,0);
assert.equal(G.finalizeRound(room,0,now),null);
console.log('PASS automatic reveal: timer, all answered, stale answers, shared tags, duplicate triggers and manual/auto idempotence.');
})().catch(e=>{console.error(e);process.exitCode=1});
