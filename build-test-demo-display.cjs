const fs=require('fs');
const source=fs.readFileSync('display.html','utf8');
const extract=name=>{const start=source.indexOf('function '+name+'(');if(start<0)throw Error(name);return source.slice(start,source.indexOf('\n}',start)+2);};
const css=[...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const normalize=fs.readFileSync('firebase.js','utf8').split('window.normalizeAnswer =')[1];
const functions=['renderPodiumLeaderboard','renderCompactRoundLeaderboard','rankShiftHtml','streakHtml','resolveChoiceText','revealRowHtml','renderRevealBoard'].map(extract).join('\n');
const js=`
window.normalizeAnswer = ${normalize}
${fs.readFileSync('game-logic.js','utf8')}
const teamsCache={},answersCache={};
const people=['Nhung','Thủy','An','Thoan','Phượng','Ánh','Giang','Hạnh','Lệ','Mai Anh','Linh','Hằng','Hoa','Trang','Trúc','Liên'];
const keys=['nhung','thuy','an','thoan','phuong','anh','giang','hanh','le','mai-anh','linh','hang','hoa','trang','truc','lien'];
function avatarImg(name,size){return '<img alt="'+name+'" src="assets/avatars/players/'+keys[people.indexOf(name)]+'.webp" style="width:'+size+'px;height:'+size+'px;border-radius:50%;object-fit:cover">';}
for(let i=0;i<8;i++)teamsCache[i]={player1:people[i*2],player2:people[i*2+1],teamName:'Đội '+(i+1),score:18-i,_idx:i};
${functions}
function draw(){
 const mode=document.getElementById('mode').value;
 const type=document.getElementById('type').value;
 Object.values(teamsCache).forEach((t,i)=>{
   const a=type==='choice'?'A':type==='who_is'?t.player1:i<2?'Kem':i===2?'Chuối':'Mèo';
   const b=i===3?(type==='choice'?'B':type==='who_is'?t.player2:'Khác'):i===6?'':a;
   answersCache[t.player1]={answer:a};answersCache[t.player2]={answer:b};
 });
 const game={type,optionA:'Tham gia cùng',optionB:'Bỏ qua'};
 document.getElementById('d-reveal-board').style.display=mode==='round'?'block':'none';
 const results=GameLogic.computeRoundResults(game,teamsCache,answersCache);
 const sorted=Object.entries(teamsCache).map(([key,t])=>({...t,score:t.score+results[key].pts})).sort((a,b)=>b.score-a.score);
 if(mode==='round'){renderRevealBoard(game);renderCompactRoundLeaderboard('board',sorted);}
 else {renderPodiumLeaderboard('board',sorted,mode==='final'?'final':'round');document.querySelectorAll('.podium-card,.lb-rest-row').forEach(el=>el.classList.add('is-revealed','is-name-revealed','is-score-grown'));}
}
document.querySelectorAll('select').forEach(el=>el.onchange=draw);draw();
`;
new Function(js);
fs.writeFileSync('test-demo-display.html',`<!doctype html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Test Demo · Công bố điểm</title><style>${css}
body{overflow:auto}nav{position:sticky;top:0;z-index:99999;background:#210b37;padding:16px;display:flex;gap:16px;flex-wrap:wrap;align-items:center}nav a{color:#ffc4e4}select{padding:10px;border-radius:8px}main{max-width:1200px;margin:auto;padding:24px}#d-reveal-board{display:block}#board{margin-top:24px}
</style></head><body><nav><a href="test-demo.html">← Test Demo người chơi</a><strong>Màn hình lớn · Dữ liệu minh họa</strong><select id="mode" aria-label="Màn hình"><option value="round">Công bố điểm sau câu</option><option value="level">Bảng xếp hạng chuyển level</option><option value="final">Vinh danh chung cuộc</option></select><select id="type" aria-label="Loại câu"><option value="choice">Level 1 · A/B</option><option value="who_is">Level 2 · Ai là ai</option><option value="text">Level 3 · Tự nhập</option></select></nav><main><div id="d-reveal-board"></div><div id="board"></div></main><script>${js}</script></body></html>`);
console.log('Built display demo using production renderers and scoring.');
