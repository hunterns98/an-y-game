const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=__dirname;process.chdir(root);
const player=fs.readFileSync('index.html','utf8'),admin=fs.readFileSync('admin.html','utf8');
function extract(src,name){const s=src.indexOf('function '+name+'(');return src.slice(s,src.indexOf('\n}',s)+2);}
global.normalizeAnswer=s=>String(s??'').trim().toLowerCase().replace(/đ/g,'d').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'');require(root+'/game-logic.js');
const G=global.GameLogic;
// Actual Level 3 renderer at second 35, still inside its 40-second window.
const els={};const elem=()=>({style:{},children:[],replaceChildren(){this.children=[]},append(b){this.children.push(b)},querySelector(){return elem()},classList:{toggle(){}}});
const g={status:'playing',phase:'answering',round:14,level:3,type:'team_tags',answerStartsAt:1000,tags:['A'],representatives:{t:'An'}};
const c={GameLogic:G,document:{getElementById:id=>els[id]??=elem(),createElement:elem},myTeamKey:'t',myName:'An',hasAnswered:false,teamTagSending:false,timeIsUp:false,serverNow:()=>36000};vm.createContext(c);vm.runInContext(extract(fs.readFileSync('team-tags-player.js','utf8'),'renderTeamTags'),c);c.renderTeamTags(g);
assert.equal(els['team-tags-grid'].children[0].disabled,false);assert(G.commitTeamTagAnswer({game:g,teams:{t:{player1:'An',player2:'Hoa'}}},{teamKey:'t',player:'An',round:14,answer:'A'},36000));
c.serverNow=()=>41000;c.renderTeamTags(g);assert.equal(els['team-tags-grid'].children[0].disabled,true);c.serverNow=()=>90000;c.renderTeamTags({...g,pausedAt:10000});assert.equal(els['team-tags-grid'].children[0].disabled,false);console.log('PASS Level 3 UI: 35s allowed, 40s locked, paused time excluded.');
// Actual player listener: finishing/resetting at round zero then starting again.
let callback,renders=0;const cls={add(){},remove(){}};
const p={playerCountdownGeneration:0,clearInterval(){},timerInterval:null,gameStartCountdownKey:'',myRoom:'AUDIT',db:{ref:()=>({on:(e,cb)=>callback=cb})},activeGame:null,prevRound:-1,prevRevealed:false,gameStartCountdownTimer:null,hasAnswered:false,document:{getElementById:()=>({classList:cls})},hideHowtoGuide(){},clearPlayerRevealSequence(){},renderQuestion(){renders++},applyAlreadyAnsweredIfNeeded(){},showScreen(){},runCountdown(){},startQuestionTimer(){},startPlayerRevealSequence(){},stopPoemHearts(){},hidePlayerLevelTransition(){},giftOpened:false};vm.createContext(p);vm.runInContext(extract(player,'listenGame'),p);p.listenGame();const emit=x=>callback({val:()=>x});emit({status:'playing',round:0,phase:'answering'});emit({status:'ended'});emit({status:'waiting'});emit({status:'playing',round:0,phase:'answering'});assert.equal(renders,2);
console.log('PASS player rematch after round 0 renders again.');
// Actual admin subscriptions remain live across loadRoom calls.
const listeners={},removed=[];const a={roomCode:'A',playersCache:{},document:{getElementById:()=>({})},avatarImg:()=>'',escapeHtml:s=>s,db:{ref:path=>({on:(e,cb)=>listeners[path]=cb,off:(e,cb)=>removed.push(path)})}};vm.createContext(a);vm.runInContext('let adminRoomEpoch=0;const adminRoomSubscriptions=[];'+extract(admin,'subscribeAdminRoom')+'\n'+extract(admin,'listenPlayers'),a);a.listenPlayers();const old=listeners['rooms/A/players'];vm.runInContext("adminRoomEpoch++;adminRoomSubscriptions.splice(0).forEach(off=>off());roomCode='B'",a);a.listenPlayers();listeners['rooms/B/players']({val:()=>({B:{name:'B'}})});old({val:()=>({A:{name:'A'}})});assert(a.playersCache.B);assert.equal(removed.length,1);
console.log('PASS detached old room listener cannot overwrite new room.');
const join={name:'An',sessionId:'s1',avatar:3,fallbackAvatar:17};const lobby={game:{status:'waiting'},avatarPool:[17,18]};const joined=G.registerPlayer(lobby,join);assert(joined.players.An);assert.equal(joined.nameReservations.an,'An');assert.equal(lobby.players,undefined);assert.equal(G.registerPlayer(joined,{...join,sessionId:'s2'}),null);assert.equal(G.registerPlayer({...lobby,game:{status:'starting'}},join),null);assert.equal(G.registerPlayer(null,join),null);assert.equal(G.registerPlayer({...lobby,game:{status:'playing'}},join),null);const guest=G.registerPlayer(lobby,{...join,name:'Guest',avatar:null});assert.equal(guest.players.Guest.avatar,18);assert.deepEqual(guest.avatarPool,[17]);
console.log('PASS atomic registration: duplicate name, closed/missing room, avatar pool and immutability.');
// 19-round pure-logic rehearsal, eight teams, mixed repeated and unique answers.
const qs=Function('return '+admin.match(/const questions = (\[[\s\S]*?\n\]);/)[1])();let room={teams:{},history:{}};for(let i=0;i<8;i++)room.teams['t'+i]={player1:'a'+i,player2:'b'+i,score:0};
for(let n=0;n<qs.length;n++){const q=qs[n];room={...room,answers:{},game:{status:'playing',phase:'answering',round:n,level:q.level,type:q.type||'choice',tags:q.tags,special:!!q.special,answerStartsAt:1000}};for(let i=0;i<8;i++){const key='t'+i;if(room.game.type==='team_tags')room=G.commitTeamTagAnswer(room,{teamKey:key,player:'a'+i,round:n,answer:q.tags[i%q.tags.length]},2000);else for(const player of ['a'+i,'b'+i])room=G.commitPlayerAnswer(room,{player,round:n,answer:room.game.type==='who_is'?'a'+i:'A'},2000);assert(room);}assert(G.shouldAutoReveal(room,2000));room=G.finalizeRound(room,n,2000);assert(room);assert.equal(G.finalizeRound(room,n,2001),null);}
assert.equal(Object.keys(room.history.rounds).length,19);console.log('PASS full 19-round pure-logic rehearsal:',Object.values(room.teams).map(t=>t.score));
// Re-run outdated tests in memory with current expected behavior; source unchanged.
for(const [file,from,to] of [['test-team-tags.cjs','[{},31000]','[{},41000]'],['test-waiting-feedback.cjs',"assert.equal(label.textContent,'Đáp án chung đã lưu')","assert.equal(label.textContent,'Đang chờ các đội còn lại trả lời....')"]]){const code=fs.readFileSync(file,'utf8').replace(from,to);const {createRequire}=require('module');Function('require','console','global',code)(createRequire(root+'/'+file),console,global);}


(async()=>{
 let attempts=0,loaded=null;const ctx={creatingRoom:false,document:{getElementById:()=>({value:'Host'})},Math,shuffledAvatarPool:()=>[1],db:{ref:()=>({transaction:async update=>{attempts++;if(attempts===1){assert.equal(update({host:'existing'}),undefined);return {committed:false};}assert.equal(update(null).game.programIntro,true);return {committed:true};}})},loadRoom:code=>loaded=code,toast(){}};
 vm.createContext(ctx);vm.runInContext('async '+extract(admin,'createRoom'),ctx);await ctx.createRoom();assert.equal(attempts,2);assert(loaded);assert.equal(ctx.creatingRoom,false);
 ctx.db.ref=()=>({transaction:async()=>{throw Error('offline')}});await ctx.createRoom();assert.equal(ctx.creatingRoom,false);
 console.log('PASS room creation: collision retry, successful creation, network failure unlock.');
})().catch(e=>{console.error(e);process.exitCode=1});
