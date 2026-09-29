// Chỉ dành cho bản xem trước, không kết nối dữ liệu phòng chơi.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    #winner-screen.show { position:relative; inset:auto; min-height:calc(100vh - 100px); z-index:2; }
    #personal-card-modal.show { position:relative; inset:auto; z-index:3; min-height:calc(100vh - 100px); }
    #match-history-modal.show { position:relative; inset:auto; z-index:3; min-height:calc(100vh - 100px); }
    body.phone #match-history-modal { max-width:390px; margin:auto; }
    body.preview-finale #app { display:none; }
    body.phone #winner-screen, body.phone #personal-card-modal { max-width:390px; margin:auto; }
    body.phone .poem-body { font-size:15px; }
    .preview-card-picker { display:block; text-align:left; color:#61294b; font:700 14px Arial; margin:8px 0 16px; }
    .preview-card-picker select { display:block; width:100%; margin-top:8px; padding:10px; border:1px solid #c9a6bb; border-radius:10px; background:white; color:#41223b; }
    #preview-gift-next { margin-top:24px; }
    @media(min-width:850px) {
      body:not(.phone) .gift-content { width:min(100%,1040px); }
      body:not(.phone) .gift-intro { padding:38px 60px; border:1px solid #875077; border-radius:32px; background:rgba(255,255,255,.04); }
      body:not(.phone) .gift-title { max-width:650px; font-size:38px; }
      body:not(.phone) .gift-subtitle { max-width:600px; font-size:18px; }
      body:not(.phone) .poem-card { padding:32px 48px; }
      body:not(.phone) .gift-content.open { width:min(100%,720px); }
      body:not(.phone) .poem-body { display:block; font-size:23px; line-height:1.7; }
      body:not(.phone) .poem-stanza + .poem-stanza { margin-top:24px; }
      body:not(.phone) .history-dialog { width:min(100%,960px); padding:32px; }
      body:not(.phone) .history-question { font-size:18px; }
      body:not(.phone) .history-answer-value { font-size:17px; }
      body:not(.phone) .poem-title { font-size:40px; }
      body:not(.phone) .personal-card-dialog { width:min(100%,850px); display:grid; grid-template-columns:minmax(0,420px) minmax(220px,1fr); gap:16px 28px; padding:28px; align-items:start; }
      body:not(.phone) #personal-card-preview { grid-column:1; grid-row:1 / span 5; max-height:76vh; width:100%; object-fit:contain; box-shadow:none; }
      body:not(.phone) .personal-card-close { grid-column:2; justify-self:end; }
      body:not(.phone) .preview-card-picker,body:not(.phone) .personal-card-save,body:not(.phone) .personal-card-hint { grid-column:2; }
    }
  `;
  document.head.appendChild(style);
  const toolbar = document.querySelector('.preview-toolbar');
  const normalButtons = [...toolbar.querySelectorAll('[data-view]')];
  function clearFinale() {
    document.body.classList.remove('preview-finale');
    $('winner-screen').classList.remove('show','poem-open');
    $('personal-card-modal').classList.remove('show');
    $('match-history-modal').classList.remove('show');
    $('gift-content').classList.remove('open');
    toolbar.querySelectorAll('[data-finale]').forEach(b=>b.classList.remove('active'));
  }
  function finale(mode) {
    clearFinale();
    normalButtons.forEach(b=>b.classList.remove('active'));
    document.body.classList.add('preview-finale');
    toolbar.querySelector('[data-finale="'+mode+'"]').classList.add('active');
    if(mode==='history') {
      $('match-history-modal').classList.add('show');
    } else if(mode==='card') {
      $('personal-card-modal').classList.add('show');
    } else {
      $('winner-screen').classList.add('show');
      if(mode==='poem') {
        $('winner-screen').classList.add('poem-open');
        $('gift-content').classList.add('open');
      }
    }
    window.scrollTo(0,0);
  }
  [['gift','Mở quà'],['poem','Lời chúc'],['card','Thiệp cá nhân'],['history','Lịch sử']].forEach(([mode,label])=>{
    const b=document.createElement('button'); b.dataset.finale=mode;b.textContent=label;
    b.onclick=()=>finale(mode); toolbar.insertBefore(b,$('preview-phone'));
  });
  normalButtons.forEach(b=>b.addEventListener('click',clearFinale));
  const next=document.createElement('button');next.id='preview-gift-next';next.className='gift-card-action';next.textContent='Tiếp tục · Mở quà 20/10 🎁';next.onclick=()=>finale('gift');$('result-details').appendChild(next);
  document.querySelector('.gift-subtitle').textContent='Cảm ơn vì đã đến';
  $('btn-open-gift').onclick=()=>finale('poem');
  $('btn-create-personal-card').onclick=()=>finale('card');
  $('btn-close-personal-card').onclick=()=>finale('poem');
  $('btn-open-match-history').onclick=()=>finale('history');
  $('btn-close-match-history').onclick=()=>finale('poem');
  const historyButton=document.createElement('button');historyButton.className='gift-history-action';historyButton.textContent='📖 Xem lịch sử minh họa';historyButton.onclick=()=>finale('history');$('result-details').appendChild(historyButton);
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const textPairs=[['Kem','Kem'],['Mèo','Cáo'],['Tên minh họa A','Tên minh họa A'],['Tên minh họa B','Tên minh họa C'],['Tuấn','Tuấn']];
  let total=0;
  $('match-history-list').innerHTML=previewQuestions.map((q,i)=>{
    let first,second,points;
    if(q.level===1){first=q.a;second=i%3===0?q.b:q.a;points=first===second?1:0;}
    else if(q.level===2){first='Nhung';second=i%3===0?'Thủy':'Nhung';points=first===second?2:0;}
    else{[first,second]=textPairs[i-14];points=first===second?(i===18?3:1):0;}
    total+=points;
    return '<article class="history-round"><div class="history-round-head">Level '+q.level+' · Câu '+(i+1)+'/19</div><div class="history-question">'+escapeHtml(q.text)+'</div><div class="history-answers"><div class="history-answer"><span class="history-answer-name">Nhung</span><span class="history-answer-value">'+escapeHtml(first)+'</span></div><div class="history-answer"><span class="history-answer-name">Thủy</span><span class="history-answer-value">'+escapeHtml(second)+'</span></div></div><div class="history-result '+(points?'match':'miss')+'"><span>'+(points===3?'🌟 Trùng và độc nhất':points?'💞 Ăn ý':'Chưa trùng ý')+'</span><span class="history-points">+'+points+' điểm</span></div></article>';
  }).join('');
  $('history-team-label').textContent='Chị em cùng sóng · '+total+' điểm · 19 câu · Đáp án giả lập để xem bố cục, không phải lịch sử của lượt bấm thử.';
  const people=[['nhung','Nhung'],['thuy','Thủy'],['an','An'],['thoan','Thoan'],['phuong','Phượng'],['anh','Ánh'],['giang','Giang'],['hanh','Hạnh'],['le','Lệ'],['maianh','Mai Anh'],['linh','Linh'],['hang','Hằng'],['hoa','Hoa'],['trang','Trang'],['truc','Trúc'],['lien','Liên']];
  const label=document.createElement('label');label.className='preview-card-picker';label.textContent='Xem thử thiệp của';
  const select=document.createElement('select');select.id='preview-card-person';
  people.forEach(([key,name])=>{const option=document.createElement('option');option.value=key;option.textContent=name;select.appendChild(option);});label.appendChild(select);
  $('personal-card-preview').after(label);
  const updateCard=()=>{$('personal-card-preview').src='assets/cards/personal/'+select.value+'.png';$('personal-card-preview').alt='Thiệp 20/10 dành cho '+select.selectedOptions[0].textContent;};
  select.onchange=updateCard;updateCard();
  $('btn-save-personal-card').onclick=()=>{const link=document.createElement('a');link.href=$('personal-card-preview').src;link.download='thiep-20-10-'+select.value+'.png';document.body.appendChild(link);link.click();link.remove();};
  document.querySelector('.personal-card-hint').textContent='Thiệp thiết kế sẵn của dự án. Chọn tên để xem đủ 16 thiệp, hoặc lưu ảnh về máy.';
})();
