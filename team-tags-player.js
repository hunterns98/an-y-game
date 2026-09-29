// Shared Level 3 UI. GameLogic performs validation inside the Firebase transaction.
let selectedTeamTag = null;
let teamTagSending = false;
function renderTeamTags(game) {
  const wrap = document.getElementById('team-tags-wrap');
  wrap.style.display = game.type === 'team_tags' ? 'flex' : 'none';
  if (game.type !== 'team_tags') return;
  selectedTeamTag = null;
  document.getElementById('answer-text-wrap').style.display = 'none';
  const grid = document.getElementById('team-tags-grid');
  grid.replaceChildren();
  (game.tags || []).forEach(tag => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'btn-team-tag'; button.textContent = tag;
    const expired = serverNow() >= Number(game.answerStartsAt || game.startedAt) + 30000;
    button.disabled = hasAnswered || expired || teamTagSending;
    button.onclick = () => {
      if (hasAnswered || timeIsUp || teamTagSending) return;
      selectedTeamTag = tag;
      grid.querySelectorAll('button').forEach(b=>b.classList.toggle('selected', b === button));
      document.getElementById('btn-submit-team-tag').disabled = false;
    };
    grid.append(button);
  });
  const submit = document.getElementById('btn-submit-team-tag');
  submit.disabled = true; submit.textContent = 'Chốt đáp án cho cả đội';
}
function lockTeamTags(answer) {
  document.getElementById('team-tags-wrap').style.display='none';
  document.querySelectorAll('#team-tags-wrap button').forEach(b=>b.disabled=true);
  document.getElementById('chosen-label').textContent = 'Đội đã chốt';
  document.getElementById('chosen-display').textContent = answer;
  document.getElementById('chosen-sub').textContent = 'Đáp án chung đã lưu · Chờ công bố lựa chọn của các đội';
}
document.getElementById('btn-submit-team-tag').onclick = async () => {
  if (!selectedTeamTag || hasAnswered || timeIsUp || teamTagSending || !activeGame || activeGame.type !== 'team_tags') return;
  if (!firebaseConnected) { toast('⚠️ Đang mất kết nối. Kết nối lại rồi chốt đáp án nhé.'); return; }
  const request = {teamKey:myTeamKey,player:myName,round:currentRound,answer:selectedTeamTag};
  const ref = db.ref('rooms/' + myRoom);
  teamTagSending = true;
  document.querySelectorAll('#team-tags-wrap button').forEach(b=>b.disabled=true);
  document.getElementById('btn-submit-team-tag').textContent='⏳ Đang chốt...';
  try {
    const result = await GameLogic.transactRoom(ref,room=>GameLogic.commitTeamTagAnswer(room,request,serverNow()) || undefined);
    const room = result.snapshot.val();
    const saved = room && room.answers && room.answers[myName];
    if (saved && saved.round === request.round && currentRound === request.round) {
      lockAnsweredUI(saved.answer);
      toast(result.committed ? '✅ Đã chốt đáp án cho cả đội!' : '✅ Đồng đội đã chốt trước. Giữ đáp án chung của đội.');
    } else if (!result.committed) toast('Không thể chốt: câu đã đóng, hết giờ hoặc đội đã thay đổi.');
  } catch(error) { toast('❌ Chưa chốt được. Kiểm tra kết nối và thử lại.'); }
  finally {
    teamTagSending=false;
    if (!hasAnswered && activeGame && activeGame.type === 'team_tags' && activeGame.phase === 'answering') renderTeamTags(activeGame);
  }
};
