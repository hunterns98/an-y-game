const fullQuestion=document.getElementById('full-question');
allQuestions.forEach((q,i)=>{const o=document.createElement('option');o.value=i;o.textContent='Câu '+(i+1)+' · '+q.text;fullQuestion.append(o);});
const transition=document.createElement('section');transition.className='level-transition-card';document.getElementById('demo-stage').append(transition);
let quoteIndex=-1;
function nextQuote(){quoteIndex=(quoteIndex+1)%COMMENTS.length;renderCommentText(document.getElementById('commentator-text'),COMMENTS[quoteIndex]);}
document.getElementById('next-quote').onclick=nextQuote;
setInterval(()=>{if(document.getElementById('mode').value==='lobby')nextQuote();},10000);
function drawExtra(mode){
 document.getElementById('screen-gift-reveal').classList.toggle('active',mode==='gift');
 const extra=['gift','lobby','question','transition2','transition3'].includes(mode);
 document.getElementById('demo-stage').style.display=extra?'block':'none';
 document.getElementById('screen-waiting').classList.toggle('active',mode==='lobby');
 document.getElementById('screen-question').classList.toggle('active',mode==='question');
 transition.style.display=mode.startsWith('transition')?'block':'none';
 document.getElementById('commentator-bubble').style.display=mode==='lobby'?'block':'none';
 document.getElementById('next-quote').style.display=mode==='lobby'?'inline-block':'none';
 fullQuestion.style.display=mode==='question'?'block':'none';
 document.getElementById('type').style.display=mode==='round'?'block':'none';
 document.getElementById('question').style.display=mode==='round'&&document.getElementById('type').value==='team_tags'?'block':'none';
 document.getElementById('question-title').style.display=mode==='round'?'block':'none';
 if(!extra)return false;
 document.getElementById('board').replaceChildren();document.getElementById('d-reveal-board').style.display='none';
 if(mode==='gift')return true;
 if(mode==='lobby'){
  document.getElementById('d-room-code-big').textContent='DEMO';
  document.querySelector('.lobby-join-copy').textContent='Phòng minh họa · Không kết nối phòng thật';
  document.getElementById('d-qr-code').textContent='QR sẽ xuất hiện khi mở phòng thật';
  document.getElementById('d-player-chips').innerHTML=people.map(name=>'<div class="d-chip">'+avatarImg(name,38)+'<span class="d-chip-name">'+name+'</span></div>').join('');
  document.getElementById('d-player-count').textContent='✨ 16 người đã vào · đang chờ BTC bắt đầu';
  if(quoteIndex<0)nextQuote();
 }else if(mode==='question'){
  const i=Number(fullQuestion.value),q=allQuestions[i];
  document.getElementById('d-question-text').textContent=q.text;
  document.getElementById('d-round-badge').textContent='Level '+q.level+' · Câu '+(i+1)+' / 19';
  document.getElementById('d-timer-circle').textContent='24';
  document.getElementById('d-options-row').style.display=q.level===1?'flex':'none';
  document.getElementById('d-opt-a').textContent=q.a||'';document.getElementById('d-opt-b').textContent=q.b||'';
  const badge=document.getElementById('d-special-badge');badge.style.display=q.level===1?'none':'block';badge.textContent=q.level===2?'Ai là ai? · Cùng chọn người +1 điểm':'Hai người trao đổi, chốt một đáp án chung: '+(q.tags||[]).join(' / ');
  document.getElementById('d-progress-count').textContent='5 / 8';
  document.getElementById('d-team-ready-grid').innerHTML=Object.values(teamsCache).map((t,i)=>'<div class="team-ready-card">'+(i<5?'✅ ':'⏳ ')+t.teamName+'</div>').join('');
 }else{
  const level=mode==='transition2'?2:3;
  transition.innerHTML='<div class="level-transition-kicker">LEVEL '+level+'</div><h2 class="level-transition-title">'+(level===2?'NGƯỜI ẤY LÀ AI':'Thấu Hiểu Sâu')+'</h2><p class="level-transition-rule"></p><p class="level-transition-wait">chờ BTC mở câu tiếp theo</p>';
  transition.querySelector('.level-transition-rule').textContent=level===3?'2 người cùng trao đổi chốt đáp án\nTrùng đội khác chỉ +1\nKhông trùng đội nào +3':'KHÔNG ĐƯỢC TRAO ĐỔI.\nCùng chọn 1 người +1 điểm';
 }
 return true;
}


