'use strict';
const $=id=>document.getElementById(id);
const names=['Nhung','Thủy','An','Thoan','Phượng','Ánh','Giang','Hạnh','Lệ','Mai Anh','Linh','Hằng','Hoa','Trang','Trúc','Liên'];
const key=name=>name.toLowerCase().replace(/đ/g,'d').normalize('NFD').replace(/[\u0300-\u036f\s]/g,'');
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function openCard(name){const path='assets/cards/personal/'+key(name)+'.png';$('card-view').hidden=false;$('card-title').textContent='Gửi '+name+' thật nhiều yêu thương';$('card-error').hidden=true;$('personal-card').alt='Thiệp dành cho '+name;$('personal-card').src=path;$('card-link').href=path;$('card-save').href=path;$('card-save').download='Thiep-'+key(name)+'.png';document.querySelectorAll('.person').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.name===name)));}
$('personal-card').onerror=()=>{$('card-error').hidden=false;};
for(const name of names){const b=el('button',undefined,'person');b.type='button';b.dataset.name=name;b.setAttribute('aria-pressed','false');const avatar=el('span',undefined,'avatar'),img=el('img');img.src=PlayerAvatars.srcFor(name);img.alt='';img.loading='lazy';img.style.objectPosition=PlayerAvatars.positionFor(name);img.style.transform='scale('+PlayerAvatars.zoomFor(name)+')';img.onerror=()=>{img.onerror=null;img.src=PlayerAvatars.fallbackSrc(PlayerAvatars.numberFor(name));};avatar.append(img);b.append(avatar,el('span',name));b.onclick=()=>openCard(name);$('people').append(b);}
const label=t=>t.teamName||t.player1+' & '+t.player2;
function answer(value,r){if(value===undefined||value===null||value==='')return 'Chưa trả lời';if(r.type==='choice'&&value==='A')return r.optionA||'A';if(r.type==='choice'&&value==='B')return r.optionB||'B';return value;}
function history(data,id){$('history').replaceChildren();for(const r of data.rounds){const t=r.teams?.[id];if(!t)continue;const row=el('article',undefined,'round');row.append(el('div','Level '+r.level+' · Câu '+(Number(r.round)+1),'meta'),el('h3',r.question.replace(/~~/g,'')));if(r.type==='team_tags')row.append(el('p','Cả đội: '+answer(t.answer1,r)));else row.append(el('p',t.player1+': '+answer(t.answer1,r)),el('p',t.player2+': '+answer(t.answer2,r)));row.append(el('p','+'+Number(t.points||0)+' điểm'+(t.unique?' · Không trùng đội nào':''),'points'));$('history').append(row);}}

function avatar(name){const wrap=el('span',undefined,'avatar'),img=el('img');img.src=PlayerAvatars.srcFor(name);img.alt=name;img.loading='lazy';img.style.objectPosition=PlayerAvatars.positionFor(name);img.style.transform='scale('+PlayerAvatars.zoomFor(name)+')';img.onerror=()=>{img.onerror=null;img.src=PlayerAvatars.fallbackSrc(PlayerAvatars.numberFor(name));};wrap.append(img);return wrap;}
function renderRanking(sorted){
 const board=$('ranking');board.replaceChildren();const podium=el('div',undefined,'memory-podium'),rest=el('div',undefined,'memory-rest');
 let rank=0;const ranked=sorted.map(([id,t],i)=>{if(!i||t.score!==sorted[i-1][1].score)rank=i+1;return {id,t,rank};});
 // Preserve shared ranks; equal champions have equally tall podiums.
 [ranked[1],ranked[0],ranked[2]].filter(Boolean).forEach(({t,rank})=>{const card=el('article',undefined,'memory-podium-card place-'+rank);card.append(el('div','HẠNG '+rank,'podium-rank'));const faces=el('div',undefined,'podium-faces');faces.append(avatar(t.player1),avatar(t.player2));card.append(faces,el('div',rank===1?'🥇':rank===2?'🥈':'🥉','podium-medal'),el('h3',label(t)),el('p',t.player1+' & '+t.player2,'podium-players'),el('div',t.score+' điểm','score'));podium.append(card);});
 ranked.slice(3).forEach(({t,rank})=>{const row=el('div',undefined,'rank'),name=el('div');name.append(el('strong',label(t)),el('small',t.player1+' & '+t.player2));row.append(el('span',String(rank),'rank-num'),name,el('span',t.score+' điểm','score'));rest.append(row);});board.append(podium,rest);
}
(async()=>{try{const response=await fetch('recap-tsuye.json');if(!response.ok)throw Error('load');const data=await response.json();const sorted=Object.entries(data.teams).sort((a,b)=>b[1].score-a[1].score);renderRanking(sorted);setupStats(data);sorted.forEach(([id,t])=>{const option=el('option',t.teamName?label(t)+' — '+t.player1+' & '+t.player2:label(t));option.value=id;$('team-picker').append(option);});$('team-picker').onchange=()=>history(data,$('team-picker').value);history(data,$('team-picker').value);$('load-status').textContent='Đã lưu trọn 19 câu · 8 đội · 16 chị em';if(location.hash==='#thong-ke')requestAnimationFrame(()=>$('thong-ke').scrollIntoView());}catch{$('load-status').textContent='Chưa tải được kết quả. Bạn tải lại trang để thử lại nhé.';}})();

function renderStats(data,roundIndex){
 const r=data.rounds[roundIndex],stats=RecapStats.summarize(r,data.teams),host=$('round-statistics');host.replaceChildren();
 host.append(el('h3',r.question.replace(/~~/g,'')),el('p',stats.shared?'Tỷ lệ trên '+stats.total+' đội · Đáp án chung của hai thành viên.':'Tỷ lệ trên '+stats.total+' người · '+stats.matched+'/'+stats.teamCount+' đội ăn ý.','stats-note'));
 if(stats.shared)host.append(el('p','Vàng: độc nhất +3 · Tím: trùng đội khác +1 · Xám: không ai chọn','stats-legend'));
 const list=el('div',undefined,'stats-bars');
 for(const bin of stats.bins){
  const kind=!bin.count?'empty':stats.shared&&bin.count===1?'unique':'shared';
  const row=el('div',undefined,'stats-option '+kind),head=el('div',undefined,'stats-head');
  const pct=new Intl.NumberFormat('vi-VN',{maximumFractionDigits:1}).format(bin.percent);
  head.append(el('strong',answer(bin.value,r)),el('span',bin.count+'/'+stats.total+' '+(stats.shared?'đội':'người')+' · '+pct+'%'));
  const track=el('div',undefined,'stats-track'),fill=el('div',undefined,'stats-fill');fill.style.width=bin.percent+'%';track.setAttribute('aria-hidden','true');track.append(fill);row.append(head,track);
  if(!bin.count)row.append(el('p','Không ai chọn','stats-note'));
  else{
   if(stats.shared)row.append(el('p',bin.count===1?'Không trùng đội nào · +3 điểm':'Trùng đội khác · mỗi đội +1 điểm','stats-result'));
   const people=el('ul',undefined,'stats-members');
   for(const vote of bin.members){const t=vote.team;const teamName=t.teamName||'Đội '+(t.index+1);people.append(el('li',stats.shared?teamName+' — '+t.player1+' & '+t.player2:vote.player+' · '+teamName));}row.append(people);
  }
  list.append(row);
 }
 host.append(list);
 if(stats.missing.length){const missed=el('div',undefined,'stats-missing');missed.append(el('strong',(stats.shared?'Không chốt đáp án: ':'Chưa trả lời: ')+stats.missing.length+'/'+stats.total));for(const v of stats.missing)missed.append(el('p',stats.shared?label(v.team):v.player+' · '+label(v.team)));host.append(missed);}
}
function setupStats(data){const picker=$('stats-picker');data.rounds.forEach((r,i)=>{const option=el('option','Câu '+(Number(r.round)+1)+' · Level '+r.level+' — '+r.question.replace(/~~/g,''));option.value=i;picker.append(option);});picker.value=String(Math.max(0,data.rounds.findIndex(r=>r.type==='team_tags')));picker.onchange=()=>renderStats(data,Number(picker.value));renderStats(data,Number(picker.value));}
