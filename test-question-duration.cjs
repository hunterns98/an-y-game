const assert=require('node:assert/strict');require('./game-logic.js');const G=global.GameLogic;
for(const level of [1,2,3]){
 const duration=level===3?40000:30000;
 const room={game:{level,type:'team_tags',status:'playing',phase:'answering',round:1,answerStartsAt:1000,tags:['X']},teams:{t:{player1:'a',player2:'b'}},answers:{}};
 assert.equal(G.shouldAutoReveal(room,1000+duration-1),false);
 assert.equal(G.shouldAutoReveal(room,1000+duration),true);
 const req={teamKey:'t',player:'a',round:1,answer:'X'};
 assert.ok(G.commitTeamTagAnswer(room,req,1000+duration-1));
 assert.equal(G.commitTeamTagAnswer(room,req,1000+duration),null);
 room.game.type='choice';req.answer='A';
 assert.ok(G.commitPlayerAnswer(room,req,1000+duration-1));
 assert.equal(G.commitPlayerAnswer(room,req,1000+duration),null);
}
assert.equal(G.questionDurationSeconds({}),30);
console.log('PASS: level 3 accepts until 40s, rejects at deadline and auto-reveals; levels 1–2 stay 30s.');

