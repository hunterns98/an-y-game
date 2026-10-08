const assert=require('node:assert/strict');require('./game-logic.js');const G=GameLogic;
const make=(level,type='choice')=>({game:{level,type,status:'playing',phase:'answering',round:1,answerStartsAt:1000,tags:['X']},teams:{t:{player1:'a',player2:'b'}},answers:{a:{round:1,answer:'A'}}});
for(const level of [1,3]){
 let room=make(level),remaining=(level===3?40:30)*1000-12000;
 room=G.setRoundPaused(room,1,true,13000);assert.ok(room);
 assert.equal(G.remainingQuestionMs(room.game,999999),remaining);
 assert.equal(G.shouldAutoReveal(room,999999),false);
 assert.equal(G.finalizeRound(room,1,999999),null);
 assert.equal(G.commitPlayerAnswer(room,{player:'b',round:1,answer:'A'},14000),null);
 assert.deepEqual(room.answers,{a:{round:1,answer:'A'}});
 assert.equal(G.setRoundPaused(room,1,true,14000),null);
 room=G.setRoundPaused(room,1,false,80000);assert.ok(room);
 assert.equal(G.remainingQuestionMs(room.game,81000),remaining);
 assert.equal(G.commitPlayerAnswer(room,{player:'b',round:1,answer:'A'},82999),null);
 assert.ok(G.commitPlayerAnswer(room,{player:'b',round:1,answer:'A'},83000));
 assert.equal(G.shouldAutoReveal(room,83000+remaining-1),false);
 assert.equal(G.shouldAutoReveal(room,83000+remaining),true);
 assert.equal(G.setRoundPaused(room,1,true,83000+remaining),null);
 assert.equal(G.setRoundPaused(room,2,true,84000),null);
 room=G.setRoundPaused(room,1,true,84000);
 assert.equal(G.remainingQuestionMs(room.game,999999),remaining-1000);
}
let room=make(3,'team_tags');room.answers={};room=G.setRoundPaused(room,1,true,5000);
assert.equal(G.commitTeamTagAnswer(room,{teamKey:'t',player:'a',round:1,answer:'X'},6000),null);
room=G.setRoundPaused(room,1,false,10000);
assert.equal(G.commitTeamTagAnswer(room,{teamKey:'t',player:'a',round:1,answer:'X'},12999),null);
assert.ok(G.commitTeamTagAnswer(room,{teamKey:'t',player:'a',round:1,answer:'X'},13000));
assert.equal(G.setRoundPaused(make(1),1,true,500),null);
console.log('PASS pause/resume: frozen time, preserved answers, blocked submissions/reveal, 3s countdown, repeat pause, stale round and deadline.');

