const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
global.normalizeAnswer=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/\s/g,'');
require('./game-logic.js');const G=GameLogic;
const make=()=>({game:{round:1,status:'playing',phase:'answering',answerStartsAt:1000,type:'choice',level:1,question:'Q'},teams:{t:{player1:'a',player2:'b',score:0},u:{player1:'c',player2:'d',score:2}}});
(async()=>{
let room=make(),req={round:1,player:'a',answer:'A'};
assert.equal(G.commitPlayerAnswer(room,{...req,round:0},2000),null);
assert.equal(G.commitPlayerAnswer(room,req,31000),null);
assert.equal(G.commitPlayerAnswer(room,req,999),null);
assert.equal(G.commitPlayerAnswer(room,{...req,player:'outsider'},2000),null);
assert.equal(G.commitPlayerAnswer(room,{...req,answer:'C'},2000),null);
room=G.commitPlayerAnswer(room,req,2000);assert.equal(G.commitPlayerAnswer(room,req,2001),null);
room=G.commitPlayerAnswer(room,{...req,player:'b'},2000);const scored=G.finalizeRound(room,1,2001);assert.equal(scored.teams.t.score,1);assert.equal(G.finalizeRound(scored,1,2002),null);assert.equal(G.commitPlayerAnswer(scored,{...req,player:'c'},2002),null);
let who=make();who.game.type='who_is';who.game.level=2;who=G.commitPlayerAnswer(who,{...req,answer:'b'},2000);who=G.commitPlayerAnswer(who,{...req,player:'b',answer:'b'},2000);assert.equal(G.finalizeRound(who,1,2001).teams.t.score,1);
let named=G.renameTeam(make(),{teamKey:'t',player:'a',name:'A.#$/[]'});assert.equal(named.teams.t.teamName,'A.#$/[]');assert.ok(Object.keys(named.teamNameReservations).every(k=>!/[.#$\[\]\/]/.test(k)));
assert.equal(G.renameTeam(named,{teamKey:'u',player:'c',name:'a.#$/[]'}),null);
named=G.renameTeam(named,{teamKey:'t',player:'b',name:'New'});assert.equal(Object.keys(named.teamNameReservations).length,1);assert.equal(named.teams.t.teamName,'New');assert.equal(G.renameTeam(named,{teamKey:'t',player:'c',name:'Other'}),null);
assert.equal(G.escapeHtml('<b>X</b>'),'&lt;b&gt;X&lt;/b&gt;');
const admin=fs.readFileSync('admin.html','utf8');const host=admin.slice(admin.indexOf('async function revealTeamTagAnswers()'),admin.indexOf('let autoRevealPending='));
const button={disabled:false},original=make().game;const context={gameCache:original,roomCode:'TEST',getRoundReadiness:()=>({ready:2,total:2}),document:{getElementById:()=>button},GameLogic:{...G,transactRoom:async()=>{throw Error('network')}},db:{ref:()=>({})},toast(){},serverNow:()=>2000};vm.createContext(context);vm.runInContext(host,context);await context.revealAnswers();assert.equal(context.gameCache.revealed,undefined);assert.equal(button.disabled,false);
// Actual display renderer must keep team names as text, including historical names.
const display=fs.readFileSync('display.html','utf8');const extract=n=>{const a=display.indexOf('function '+n+'(');return display.slice(a,display.indexOf('\n}',a)+2)};
const target={innerHTML:''};const ui={GameLogic:G,document:{getElementById:()=>target},avatarImg:()=>'',rankShiftHtml:()=>'',streakHtml:()=>''};vm.createContext(ui);vm.runInContext(extract('renderPodiumLeaderboard')+'\n'+extract('renderCompactRoundLeaderboard'),ui);
const teams=[{teamName:'<b>X</b>',score:2,_idx:0}];ui.renderPodiumLeaderboard('x',teams,'final');assert.ok(target.innerHTML.includes('&lt;b&gt;X&lt;/b&gt;'));assert.ok(!target.innerHTML.includes('<b>X</b>'));ui.renderCompactRoundLeaderboard('x',teams,{});

// Exercise actual question transition guard and network-failure behavior.
const sendStart=admin.indexOf('async function sendQuestion(idx)'),sendEnd=admin.indexOf('// ── TÍNH KẾT QUẢ',sendStart);
let state=make();state.game.revealed=true;state.game.phase='results';let fail=true;
const nextCtx={questions:[{}, {}, {level:1,text:'Next',a:'A',b:'B'}],serverNow:()=>2000,firebase:{database:{ServerValue:{TIMESTAMP:2000}}},roomCode:'TEST',db:{ref:()=>({})},GameLogic:{...G,transactRoom:async(ref,fn)=>{if(fail)throw Error('network');const next=fn(state);if(next)state=next;return {committed:!!next}}},renderCurrentQuestionCard(){},applyControlButtonsState(){},document:{getElementById:()=>({innerHTML:''})}};
vm.createContext(nextCtx);vm.runInContext(admin.slice(sendStart,sendEnd),nextCtx);
await assert.rejects(nextCtx.sendQuestion(2),/network/);assert.equal(state.game.round,1);
fail=false;await nextCtx.sendQuestion(2);assert.equal(state.game.round,2);state.answers={a:{round:2,answer:'A'}};
await assert.rejects(nextCtx.sendQuestion(2),/Trạng thái/);assert.equal(state.answers.a.answer,'A');
console.log('PASS audit regressions: stale/late answers, validation, single scoring, failed reveal recovery, atomic rename, safe names and production display renderers.');
})().catch(e=>{console.error(e);process.exitCode=1});
