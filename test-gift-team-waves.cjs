const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
class El{constructor(){this.style={};this.attrs={};this.children=[];this.classes=new Set();this.classList={contains:n=>this.classes.has(n),add:n=>this.classes.add(n),remove:n=>this.classes.delete(n)};}append(x){this.children.push(x)}setAttribute(k,v){this.attrs[k]=v}getContext(){return {clearRect(){},drawImage(){}}}getBoundingClientRect(){return {top:200,left:0,right:1600,width:1600,height:600}}}
const host=new El();host.classes.add('active');const box=new El(),events={};box.getBoundingClientRect=()=>({top:300,left:480,right:1120,width:640,height:544});const video={currentTime:0,addEventListener:(e,fn)=>events[e]=fn};host.querySelector=()=>box;box.querySelector=()=>video;let sync,intervals=new Set(),id=0;
const context={window:{PodiumCharacters:{},addEventListener(){}},PodiumCharacters:{normalize:n=>n,roster:{a:['a.png',[0,0,0,0]],b:['b.png',[0,0,0,0]]}},document:{hidden:false,getElementById:()=>host,createElement:()=>new El(),addEventListener(){}},Image:class{naturalWidth=2172;set src(v){this.onload?.()}},MutationObserver:class{constructor(fn){sync=fn}observe(){}},ResizeObserver:class{observe(){}},matchMedia:()=>({matches:false}),setInterval:()=>{intervals.add(++id);return id},clearInterval:i=>intervals.delete(i)};
vm.createContext(context);vm.runInContext(fs.readFileSync('gift-team-waves.js','utf8'),context);
context.window.GiftTeamWaves.setTeams(Array.from({length:8},(_,i)=>({teamName:'Team '+i,player1:'a',player2:'b',score:i})));
const label=host.children[0];assert(label.textContent.startsWith('Team 7'));
for(let i=1;i<=8;i++){video.currentTime=10;events.timeupdate();video.currentTime=0;events.timeupdate();assert(label.textContent.startsWith('Team '+(7-i+8)%8));}
assert.equal(intervals.size,1);sync();assert.equal(intervals.size,1);host.classes.delete('active');sync();assert.equal(intervals.size,0);
for(const file of ['admin.html','display.html']){for(const m of fs.readFileSync(file,'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);}
console.log('PASS: score order, eight video loops return to first team, timer cleanup, admin/display syntax.');
