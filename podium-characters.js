(function (global) {
  'use strict';
  const roster = {
    maianh: ['maianh-wave.png', [210,660,1120,1567]],
    an: ['an-wave-v1.png', [175,642,1128,1609]],
    anh: ['anh-wave-v5.png', [190,650,1120,1575]],
    giang: ['giang-wave-v1.png', [220,655,1125,1560]],
    hang: ['hang-wave-v2.png', [200,650,1120,1570]],
    hanh: ['hanh-wave-v2.png', [195,670,1155,1640]],
    hoa: ['hoa-wave-v2.png', [170,670,1170,1670]],
    le: ['le-wave-v1.png', [195,665,1130,1600]],
    lien: ['lien-wave-v6.png', [165,645,1135,1620]],
    linh: ['linh-wave-v1.png', [185,665,1145,1630]],
    nhung: ['nhung-wave-v2.png', [195,645,1120,1590]],
    phuong: ['phuong-wave-v5.png', [180,650,1140,1630]],
    thoan: ['thoan-wave-v5.png', [205,650,1110,1560]],
    thuy: ['thuy-wave-v2.png', [180,660,1135,1610]],
    trang: ['trang-wave-v6.png', [190,645,1130,1595]],
    truc: ['truc-wave-v1.png', [215,680,1175,1670]]
  };
  const normalize = name => String(name || '').trim().toLowerCase().replace(/đ/g,'d').normalize('NFD').replace(/[\u0300-\u036f\s]/g,'');
  let stage = null, figures = [], timer = null, visible = false, frame = 0;
  function draw() {
    figures.forEach(({canvas, image, entry}, i) => {
      if (!image.naturalWidth) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0,0,380,724);
      ctx.drawImage(image,entry[1][(frame+i*2)%4],0,380,724,0,0,380,724);
    });
  }
  function clear() {
    clearInterval(timer); timer = null; visible = false; frame = 0;
    figures.forEach(f => { f.image.onload = null; f.image.onerror = null; f.canvas.remove(); });
    figures = [];
    if (stage) stage.classList.remove('winners-visible');
    stage = null;
  }
  function prepare(team, board) {
    clear();
    if (!team || !board) return;
    const rest = board.querySelector('.lb-rest');
    if (!rest) return;
    stage = rest.parentElement.classList.contains('podium-winner-stage') ? rest.parentElement : document.createElement('div');
    if (!stage.parentElement) { stage.className = 'podium-winner-stage'; rest.before(stage); stage.append(rest); }
    [team.player1,team.player2].forEach((name,i) => {
      const entry = roster[normalize(name)];
      if (!entry) return;
      const canvas = document.createElement('canvas');
      canvas.width = 380; canvas.height = 724;
      canvas.className = 'podium-winner-character ' + (i ? 'winner-right' : 'winner-left');
      canvas.setAttribute('role','img'); canvas.setAttribute('aria-label',name + ' vẫy tay');
      const image = new Image();
      image.onload = draw;
      image.onerror = () => canvas.remove();
      figures.push({canvas,image,entry}); stage.append(canvas);
      image.src = 'assets/podium/' + entry[0];
    });
  }
  function show() {
    if (!stage || visible) return;
    visible = true; stage.classList.add('winners-visible'); draw();
    if (!global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(() => { if (!document.hidden) { frame=(frame+1)%4; draw(); } },300);
    }
  }
  global.PodiumCharacters = {prepare, show, clear, roster, normalize};
})(window);
