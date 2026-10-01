const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
global.normalizeAnswer=s=>String(s??'').toLowerCase();require('./game-logic.js');
const source=fs.readFileSync('team-tags-player.js','utf8');
function element(){return {style:{},disabled:false,textContent:'',children:[],classList:{toggle(){}},append(b){this.children.push(b)},replaceChildren(){this.children=[]},querySelector(){return this.help||(this.help={textContent:''})},querySelectorAll(){return this.children}};}
function client(name,roomRef){
  const nodes=Object.fromEntries(['team-tags-wrap','answer-text-wrap','team-tags-grid','btn-submit-team-tag','chosen-label','chosen-display','chosen-sub'].map(id=>[id,element()]));
  const context={document:{getElementById:id=>nodes[id],createElement:element,querySelectorAll:()=>[...nodes['team-tags-grid'].children,nodes['btn-submit-team-tag']]},hasAnswered:false,timeIsUp:false,firebaseConnected:true,myRoom:'TEST',myTeamKey:'t0',myName:name,currentRound:14,activeGame:roomRef.room.game,serverNow:()=>2000,GameLogic:global.GameLogic,toast(){},db:{ref:()=>({on:(event,cb)=>cb({val:()=>roomRef.room}),off(){},transaction:async update=>{await Promise.resolve();const next=update(roomRef.room);if(next)roomRef.room=next;return {committed:!!next,snapshot:{val:()=>roomRef.room}}}})}};
  context.lockAnsweredUI=answer=>{context.hasAnswered=true;context.lockTeamTags(answer)};
  vm.createContext(context);vm.runInContext(source,context);
  context.renderTeamTags(context.activeGame);
  return {context,nodes,choose:i=>nodes['team-tags-grid'].children[i].onclick(),submit:()=>nodes['btn-submit-team-tag'].onclick()};
}
(async()=>{
  const shared={room:{game:{status:'playing',phase:'answering',type:'team_tags',round:14,answerStartsAt:1000,tags:['Phúc','Thắng','Nam','Tuấn','Long']},teams:{t0:{player1:'Nhung',player2:'Thủy'}}}};
  const restricted=JSON.parse(JSON.stringify(shared.room));restricted.game.representatives={t0:'Nhung'};
  assert.equal(global.GameLogic.commitTeamTagAnswer(restricted,{teamKey:'t0',player:'Thủy',round:14,answer:'Phúc'},2000),null);
  assert(global.GameLogic.commitTeamTagAnswer(restricted,{teamKey:'t0',player:'Nhung',round:14,answer:'Phúc'},2000));
  const blocked=client('Thủy',{room:restricted});assert(blocked.nodes['team-tags-grid'].children.every(b=>b.disabled));blocked.choose(0);await blocked.submit();assert(!restricted.answers);
  const a=client('Nhung',shared),b=client('Thủy',shared);
  assert.equal(a.nodes['team-tags-grid'].children.length,5);
  assert.equal(a.nodes['btn-submit-team-tag'].disabled,true);
  a.choose(0);b.choose(1);
  await Promise.all([a.submit(),b.submit()]);
  assert.equal(shared.room.answers.Nhung.answer,'Phúc');
  assert.equal(shared.room.answers.Thủy.answer,'Phúc');
  assert.equal(a.nodes['chosen-display'].textContent,'Phúc');
  assert.equal(b.nodes['chosen-display'].textContent,'Phúc');
  assert.equal(a.nodes['team-tags-wrap'].style.display,'none');
  const offline=client('Nhung',shared);offline.context.firebaseConnected=false;offline.choose(2);await offline.submit();
  assert.equal(shared.room.answers.Nhung.answer,'Phúc');
  console.log('PASS: production player handler, two simultaneous clients, first answer wins, both clients lock to shared answer, offline guard.');
})().catch(error=>{console.error(error);process.exitCode=1});
