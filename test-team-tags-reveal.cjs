const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.normalizeAnswer=s=>String(s||'').toLowerCase();require('./game-logic.js');
const G=global.GameLogic;
const source=fs.readFileSync('admin.html','utf8');
const handler=source.slice(source.indexOf('async function revealTeamTagAnswers()'),source.indexOf('\nfunction revealAnswers()'));
(async()=>{
 let room={game:{type:'team_tags',status:'playing',phase:'answering',round:14,question:'Travel',tags:['A','B']},teams:{t:{player1:'a',player2:'b',score:4}},answers:{a:{round:14,teamKey:'t',answer:'A'},b:{round:14,teamKey:'t',answer:'A'}}};
 let listening=false,commits=0;const button={disabled:false},messages=[];
 const ref={on(event,callback){listening=true;callback({val:()=>room})},off(){listening=false},async transaction(update){const next=update(listening?room:null);if(next){room=next;commits++}return {committed:!!next,snapshot:{val:()=>room}}}};
 const context={GameLogic:G,getRoundReadiness:()=>({ready:1,total:1}),confirm:()=>true,document:{getElementById:()=>button},gameCache:room.game,roomCode:'TEST',db:{ref:()=>ref},serverNow:()=>2000,toast:m=>messages.push(m)};
 vm.createContext(context);vm.runInContext(handler,context);
 await context.revealTeamTagAnswers();
 assert.equal(room.game.revealed,true);assert.equal(room.game.phase,'results');assert.equal(room.teams.t.score,7);assert.equal(listening,false);
 await context.revealTeamTagAnswers();assert.equal(commits,1);assert.equal(room.teams.t.score,7);
 await assert.rejects(G.transactRoom({on(e,cb){listening=true;cb({})},off(){listening=false},transaction:async()=>{throw Error('offline')}},()=>{}),/offline/);
 assert.equal(listening,false);
 console.log('PASS: actual host reveal handler with cold room cache, one-time scoring, listener cleanup on success/failure.');
})().catch(e=>{console.error(e);process.exitCode=1});
