const assert=require('node:assert/strict');
const fs=require('fs');
global.normalizeAnswer=s=>String(s??'').trim().toLowerCase().replace(/đ/g,'d').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'');
require('./game-logic.js');
const G=global.GameLogic;
const questions=Function('return '+fs.readFileSync('admin.html','utf8').match(/const questions = (\[[\s\S]*?\n\]);/)[1])();
assert.equal(questions.length,19);
assert.deepEqual(questions.slice(14).map(q=>q.tags.length),[5,5,6,6,5]);
const original={game:{status:'playing',phase:'answering',type:'team_tags',round:14,level:3,question:questions[15].text,tags:questions[15].tags,answerStartsAt:1000},teams:{},history:{rounds:{0:{preserve:true}}}};
for(let i=0;i<8;i++)original.teams['t'+i]={player1:'a'+i,player2:'b'+i,score:10};
const originalJSON=JSON.stringify(original);
const req={teamKey:'t0',player:'a0',round:14,answer:'Phúc'};
let room=G.commitTeamTagAnswer(original,req,2000);
assert.deepEqual(room.answers.a0,room.answers.b0);
assert.equal(JSON.stringify(original),originalJSON,'Pure update must not mutate input');
// Transaction retry after the other member commits: first answer wins.
assert.equal(G.commitTeamTagAnswer(room,{...req,player:'b0',answer:'Thắng'},2001),null);
for(const [change,now] of [[{player:'outsider'},2000],[{answer:'invalid'},2000],[{round:15},2000],[{},999],[{},31000]])assert.equal(G.commitTeamTagAnswer(original,{...req,...change},now),null);
assert.equal(G.commitTeamTagAnswer({...original,game:{...original.game,phase:'results'}},req,2000),null);
// Distribution: 2, 1, 2, 2, 0 across tags; one team abstains.
for(const [i,tag] of [[1,'Phúc'],[2,'Thắng'],[3,'Nam'],[4,'Nam'],[5,'Tuấn'],[7,'Tuấn']])room=G.commitTeamTagAnswer(room,{teamKey:'t'+i,player:'a'+i,round:14,answer:tag},2000);
const scored=G.computeRoundResults(room.game,room.teams,room.answers);
assert.deepEqual(Object.values(scored).map(r=>r.pts),[1,1,3,1,1,1,0,1]);
const finalized=G.finalizeTeamTagRound(room,14,5000);
assert.equal(finalized.game.revealed,true);
assert.equal(finalized.teams.t2.score,13);
assert.equal(finalized.teams.t6.score,10);
assert.equal(finalized.history.rounds[14].teams.t2.unique,true);
assert.equal(finalized.history.rounds[0].preserve,true);
assert.equal(G.finalizeTeamTagRound(finalized,14,5001),null,'No double points');
assert.equal(G.commitTeamTagAnswer(finalized,{teamKey:'t6',player:'a6',round:14,answer:'Long'},5001),null,'No answer after reveal');
assert.equal(G.finalizeTeamTagRound(room,15,5000),null,'No stale reveal');
const stale={...room.answers,a2:{...room.answers.a2,round:13}};
assert.equal(G.computeRoundResults(room.game,room.teams,stale).t2.pts,0);
assert.deepEqual(G.computeChoiceResult('A','A',false),{match:true,pts:1});
assert.deepEqual(G.computeWhoIsResult('Nhung','nhung'),{match:true,pts:1});
for(const file of ['index.html','admin.html','display.html','test-demo.html','test-demo-display.html']){
  for(const m of fs.readFileSync(file,'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!m[1].includes('src='))new Function(m[2]);
}
new Function(fs.readFileSync('team-tags-player.js','utf8'));
console.log('PASS: 19 questions, tags, shared commit, simultaneous retries, deadlines, membership, scoring, reveal races, history, legacy levels and script syntax.');
