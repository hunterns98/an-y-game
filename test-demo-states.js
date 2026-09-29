// Offline-only controls. No Firebase initialization, reads or writes.
(() => {
  const toolbar=document.querySelector('.preview-toolbar');
  const extra=document.createElement('div');extra.className='preview-toolbar';extra.style.position='relative';
  extra.innerHTML='<label>Trạng thái <select id="demo-state"><option value="question">Đang trả lời</option><option value="join">Vào phòng</option><option value="waiting">Đã gửi · chờ đồng đội</option><option value="locked">Khóa đáp án</option><option value="match">Ăn ý · +1</option><option value="who">Cùng chọn người · +2</option><option value="unique">Độc nhất · +3</option><option value="miss">Lệch sóng · 0</option><option value="timeout">Hết giờ · thiếu đáp án</option><option value="level2">Chuyển Level 2</option><option value="level3">Chuyển Level 3</option><option value="final">Chờ vinh danh</option></select></label> <label>Câu hỏi <select id="demo-question"></select></label> <a href="test-demo-display.html" style="color:#ffc5e9">Công bố điểm 8 đội / Bảng xếp hạng →</a>';
  toolbar.after(extra);
  const style=document.createElement('style');style.textContent='.preview-toolbar select{max-width:300px;padding:8px;border-radius:8px} #player-level-transition.show,#final-wait-screen.show{position:relative;inset:auto;min-height:65vh;z-index:2}body.phone #player-level-transition,body.phone #final-wait-screen{max-width:390px;margin:auto}';document.head.append(style);
  const reset=()=>{['player-level-transition','final-wait-screen'].forEach(id=>$(id).classList.remove('show'));$('result-reveal-intro').style.display='none';$('result-details').classList.remove('hidden');};
  toolbar.addEventListener('click',event=>{if(event.target.closest('[data-view],[data-finale]'))reset();},true);
  const picker=$('demo-question');previewQuestions.forEach((q,i)=>{const o=document.createElement('option');o.value=i;o.textContent=(i+1)+'. '+q.text;picker.append(o);});
  function question(){
    reset();const selected=picker.value;const q=previewQuestions[Number(selected)];
    toolbar.querySelector('[data-view="'+(q.level===1?'choice':q.level===2?'who':'text')+'"]').click();
    picker.value=selected;
    $('q-text').textContent=q.text;$('round-badge').textContent='Level '+q.level+' · Câu '+(Number(picker.value)+1)+' / 19';
    if(q.level===1){$('opt-a-text').textContent=q.a;$('opt-b-text').textContent=q.b;}
    $('demo-state').value='question';
  }
  window.selectChoice=c=>{chosen=c==='A'?$('opt-a-text').textContent:$('opt-b-text').textContent;['a','b'].forEach(x=>$('btn-'+x).classList.toggle('selected',x===c.toLowerCase()));$('btn-submit-choice').disabled=false;};
  picker.value='4';
  picker.onchange=question;
  toolbar.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
    const defaults={choice:4,who:9,text:18};
    if(defaults[b.dataset.view]!==undefined){picker.value=String(defaults[b.dataset.view]);$('round-badge').textContent='Level '+previewQuestions[Number(picker.value)].level+' · Câu '+(Number(picker.value)+1)+' / 19';}
    $('demo-state').value=b.dataset.view==='result'?'match':'question';
  }));
  $('btn-join').onclick=()=>toolbar.querySelector('[data-view="lobby"]').click();
  $('demo-state').onchange=()=>{
    const mode=$('demo-state').value;question();$('demo-state').value=mode;
    if(mode==='question')return;
    if(mode==='join'){document.querySelectorAll('.screen').forEach(e=>e.classList.remove('active'));$('screen-join').classList.add('active');return;}
    if(mode==='waiting'){['answer-grid','btn-submit-choice','who-answer-wrap','answer-text-wrap'].forEach(id=>$(id).style.display='none');$('status-chosen').style.display='block';$('chosen-display').textContent=previewQuestions[Number(picker.value)].a||'Nhung';return;}
    if(mode==='level2'||mode==='level3'||mode==='final'){
      document.querySelectorAll('.screen').forEach(e=>e.classList.remove('active'));
      if(mode==='final'){$('final-wait-screen').classList.add('show');return;}
      const level=mode==='level2'?2:3;$('player-level-transition').classList.add('show');$('player-level-kicker').textContent='LEVEL '+level;$('player-level-title').textContent=level===2?'Thấu Hiểu Trung':'Thấu Hiểu Sâu';$('player-level-rule').textContent=level===2?'Cùng chọn một người: +2 điểm':'Trùng ý: +1 điểm · Trùng và độc nhất: +3 điểm';$('player-level-score').textContent='Điểm minh họa của đội: 12';return;
    }
    show('result');$('result-reveal-intro').style.display=mode==='locked'?'block':'none';$('result-details').classList.toggle('hidden',mode==='locked');
    const points={match:1,who:2,unique:3,miss:0,timeout:0}[mode]||0;
    $('result-match').textContent=points?'💞':'😅';$('result-title').textContent=mode==='unique'?'Ăn ý và độc nhất!':points?'Ăn ý quá đi!':'Lệch sóng mất rồi!';
    const answers=mode==='who'?['Nhung','Nhung']:mode==='unique'?['Kem','Kem']:mode==='timeout'?['Tham gia cùng','—']:['Tham gia cùng',points?'Tham gia cùng':'Bỏ qua'];
    document.querySelectorAll('.rab-val').forEach((el,i)=>el.textContent=answers[i]);$('result-points-wrap').innerHTML='<div class="result-points">+'+points+' điểm cho đội</div><p>Dữ liệu minh họa</p>';
  };
})();
