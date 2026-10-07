// Offline-only controls. No Firebase initialization, reads or writes.
(() => {
  const toolbar=document.querySelector('.preview-toolbar');
  const extra=document.createElement('div');extra.className='preview-toolbar';extra.style.position='relative';
  extra.innerHTML='<label>Trạng thái <select id="demo-state"><option value="question">Đang trả lời</option><option value="join">Vào phòng</option><option value="unpaired">Phòng chờ · chưa ghép đội</option><option value="waiting">Đã gửi · chờ đồng đội</option><option value="locked">Khóa đáp án</option><option value="match">Ăn ý · +1</option><option value="who">Cùng chọn người · +1</option><option value="unique">Độc nhất · +3</option><option value="miss">Lệch sóng · 0</option><option value="timeout">Hết giờ · thiếu đáp án</option><option value="level2">Chuyển Level 2</option><option value="level3">Chuyển Level 3</option><option value="final">Chờ vinh danh</option></select></label> <label>Câu hỏi <select id="demo-question"></select></label> <a href="test-demo-display.html" style="color:#ffc5e9">Công bố điểm 8 đội / Bảng xếp hạng →</a>';
  toolbar.after(extra);
  const style=document.createElement('style');style.textContent='.preview-toolbar select{max-width:300px;padding:8px;border-radius:8px} #player-level-transition.show,#final-wait-screen.show{position:relative;inset:auto;min-height:65vh;z-index:2}body.phone #player-level-transition,body.phone #final-wait-screen{max-width:390px;margin:auto}';document.head.append(style);
  const reset=()=>{['player-level-transition','final-wait-screen'].forEach(id=>$(id).classList.remove('show'));$('result-reveal-intro').style.display='none';$('result-details').classList.remove('hidden');};
  toolbar.addEventListener('click',event=>{if(event.target.closest('[data-view],[data-finale]'))reset();},true);
  const picker=$('demo-question');previewQuestions.forEach((q,i)=>{const o=document.createElement('option');o.value=i;o.textContent=(i+1)+'. '+q.text;picker.append(o);});
  function demoTags(q) {
    $('answer-text-wrap').style.display='none';$('team-tags-wrap').style.display='flex';
    $('demo-state').querySelector('[value=match]').textContent='Trùng đội khác · +1';
    $('demo-state').querySelector('[value=waiting]').textContent='Đội đã chốt · chờ công bố';
    ['who','miss'].forEach(value=>$('demo-state').querySelector('[value='+value+']').disabled=true);
    $('special-badge-text').textContent='Được trao đổi · Trùng đội khác +1 — Không trùng đội khác +3';
    $('partner-status-text').textContent='Nhung là đại diện chốt đáp án câu này';
    document.querySelector('.team-tags-help').textContent='Bạn là đại diện câu này. Trao đổi với đồng đội rồi chốt nhé!';
    const grid=$('team-tags-grid');grid.replaceChildren();let selected=null;
    const submit=$('btn-submit-team-tag');submit.disabled=true;submit.textContent='Chốt đáp án cho cả đội';
    q.tags.forEach(tag=>{const b=document.createElement('button');b.className='btn-team-tag';b.textContent=tag;b.onclick=()=>{selected=tag;grid.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b));submit.disabled=false;};grid.append(b);});
    submit.onclick=()=>{if(!selected)return;grid.querySelectorAll('button').forEach(b=>b.disabled=true);submit.disabled=true;$('team-tags-wrap').style.display='none';$('status-chosen').style.display='block';$('chosen-label').textContent='Đội đã chốt';$('chosen-display').textContent=selected;$('chosen-sub').textContent='Đang chờ các đội còn lại trả lời....';};
  }
  function question(){
    reset();const selected=picker.value;const q=previewQuestions[Number(selected)];
    toolbar.querySelector('[data-view="'+(q.level===1?'choice':q.level===2?'who':'text')+'"]').click();
    picker.value=selected;
    $('q-text').textContent=q.text;$('round-badge').textContent='Level '+q.level+' · Câu '+(Number(picker.value)+1)+' / 19';
    if(q.level===1){$('opt-a-text').textContent=q.a;$('opt-b-text').textContent=q.b;}
    if(q.level===3)demoTags(q);
    $('demo-state').value='question';
  }
  window.selectChoice=c=>{chosen=c==='A'?$('opt-a-text').textContent:$('opt-b-text').textContent;['a','b'].forEach(x=>$('btn-'+x).classList.toggle('selected',x===c.toLowerCase()));$('btn-submit-choice').disabled=false;};
  picker.value='4';
  picker.onchange=question;
  toolbar.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
    ['who','miss'].forEach(value=>$('demo-state').querySelector('[value='+value+']').disabled=false);
    $('demo-state').querySelector('[value=match]').textContent='Ăn ý · +1';
    $('demo-state').querySelector('[value=waiting]').textContent='Đã gửi · chờ đồng đội';
    $('matchmaking-card').style.display='none';$('partner-display').style.display='block';$('team-name-card').style.display='block';$('team-tags-wrap').style.display='none';$('partner-status-text').textContent='⏳ Thủy đang chọn đáp án…';
    const defaults={choice:4,who:8,text:14};
    if(defaults[b.dataset.view]!==undefined){picker.value=String(defaults[b.dataset.view]);$('round-badge').textContent='Level '+previewQuestions[Number(picker.value)].level+' · Câu '+(Number(picker.value)+1)+' / 19';}
    $('demo-state').value=b.dataset.view==='result'?'match':'question';
    if(defaults[b.dataset.view]!==undefined)$('q-text').textContent=previewQuestions[Number(picker.value)].text;
    if(b.dataset.view==='text')demoTags(previewQuestions[Number(picker.value)]);
  }));
  $('btn-join').onclick=()=>toolbar.querySelector('[data-view="lobby"]').click();
  $('demo-state').onchange=()=>{
    const mode=$('demo-state').value;question();$('demo-state').value=mode;
    if(mode==='question')return;
    if(mode==='unpaired'){toolbar.querySelector('[data-view="lobby"]').click();$('matchmaking-card').style.display='block';$('partner-display').style.display='none';$('team-name-card').style.display='none';$('demo-state').value=mode;return;}
    if(mode==='join'){document.querySelectorAll('.screen').forEach(e=>e.classList.remove('active'));$('screen-join').classList.add('active');return;}
    if(mode==='waiting'){['answer-grid','btn-submit-choice','who-answer-wrap','answer-text-wrap','team-tags-wrap'].forEach(id=>$(id).style.display='none');$('status-chosen').style.display='block';const q=previewQuestions[Number(picker.value)];$('chosen-display').textContent=q.tags?q.tags[0]:q.a||'Nhung';$('chosen-label').textContent=q.tags?'Đội đã chốt':'Bạn đã chọn';$('chosen-sub').textContent=q.tags?'Đang chờ các đội còn lại trả lời....':'Đang chờ đồng đội trả lời...';return;}
    if(mode==='level2'||mode==='level3'||mode==='final'){
      document.querySelectorAll('.screen').forEach(e=>e.classList.remove('active'));
      if(mode==='final'){$('final-wait-screen').classList.add('show');return;}
      const level=mode==='level2'?2:3;$('player-level-transition').classList.add('show');$('player-level-kicker').textContent='LEVEL '+level;$('player-level-title').textContent=level===2?'NGƯỜI ẤY LÀ AI':'Thấu Hiểu Sâu';$('player-level-rule').textContent=level===2?'KHÔNG ĐƯỢC TRAO ĐỔI.\nCùng chọn 1 người +1 điểm':'2 người cùng trao đổi chốt đáp án\nTrùng đội khác chỉ +1\nKhông trùng đội nào +3';$('player-level-score').textContent='';return;
    }
    show('result');$('result-reveal-intro').style.display=mode==='locked'?'block':'none';$('result-details').classList.toggle('hidden',mode==='locked');
    const points={match:1,who:1,unique:3,miss:0,timeout:0}[mode]||0;

    const answers=mode==='who'?['Nhung','Nhung']:mode==='unique'?['Kem','Kem']:mode==='timeout'?['Tham gia cùng','—']:['Tham gia cùng',points?'Tham gia cùng':'Bỏ qua'];
    document.querySelectorAll('.rab-val').forEach((el,i)=>el.textContent=answers[i]);$('result-points-wrap').innerHTML='<div class="result-points">+'+points+' điểm cho đội</div><p>Dữ liệu minh họa</p>';
    const copy=GamePresentation.resultCopy({match:points>0,isUnique:mode==='unique',a1:answers[0],a2:mode==='timeout'?'':answers[1]});
    $('result-match').textContent=copy.icon;$('result-title').textContent=copy.title;$('result-details').classList.toggle('is-match',points>0 && mode!=='unique');
    const q=previewQuestions[Number(picker.value)];
    const boxes=document.querySelectorAll('#result-answers .result-ans-box');
    boxes[1].style.display=q.tags?'none':'';boxes[0].querySelector('.rab-label').textContent=q.tags?'Đáp án chung của đội':'Nhung';
    if(q.tags){boxes[0].querySelector('.rab-val').textContent=mode==='timeout'?'—':q.tags[0];const pts=mode==='unique'?3:mode==='timeout'?0:1;$('result-points-wrap').textContent='+'+pts+' điểm cho đội · Minh họa';const sharedCopy=GamePresentation.resultCopy({match:pts>0,isUnique:pts===3,a1:pts?q.tags[0]:'',a2:pts?q.tags[0]:''});$('result-title').textContent=sharedCopy.title;$('result-match').textContent=sharedCopy.icon;}
  };
})();
