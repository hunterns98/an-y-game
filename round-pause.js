(function () {
  'use strict';
  const adminButton = document.getElementById('btn-pause-round');
  const overlay = document.createElement('div');
  overlay.id = 'round-pause-overlay';
  overlay.setAttribute('role', 'status');
  overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:20000;background:rgba(20,4,35,.96);color:white;align-items:center;justify-content:center;text-align:center;padding:24px;font:700 22px system-ui';
  if (!adminButton) document.body.appendChild(overlay);
  let pending = false, wasBlocked = false, pausedTrack = null;
  const game = () => typeof activeGame !== 'undefined' ? activeGame : typeof gameCache !== 'undefined' ? gameCache : null;
  function tick() {
    const g = game(), now = serverNow();
    const playing = g && g.status === 'playing' && g.phase === 'answering' && !g.revealed;
    const blocked = playing && GameLogic.isRoundSuspended(g, now);
    if (adminButton) {
      adminButton.disabled = pending || !playing || (g.pausedAt == null && (Number(g.resumeAt || 0) > now || now < Number(g.answerStartsAt || g.startedAt) || GameLogic.remainingQuestionMs(g,now) <= 0));
      adminButton.textContent = g && g.pausedAt != null ? '▶ Tiếp tục' : blocked ? '⏳ Đang đếm ngược…' : '⏸ Tạm dừng';
      if (blocked) {
        document.getElementById('btn-reveal').disabled = true;
        document.getElementById('btn-next').disabled = true;
      } else if (wasBlocked && g) applyControlButtonsState(g);
    } else {
      overlay.style.display = blocked ? 'flex' : 'none';
      if (blocked) {
        overlay.textContent = g.pausedAt != null ? '⏸ Trò chơi tạm dừng — chờ quản trò tiếp tục' : 'Tiếp tục sau ' + Math.max(1, Math.ceil((g.resumeAt-now)/1000));
        const track = document.getElementById('d-music-countdown');
        if (track && !track.paused) { pausedTrack = track; track.pause(); }
      } else if (wasBlocked && pausedTrack) {
        if (playing && typeof displaySfxEnabled !== 'undefined' && displaySfxEnabled) pausedTrack.play().catch(() => {});
        pausedTrack = null;
      }
    }
    wasBlocked = blocked;
  }
  if (adminButton) adminButton.addEventListener('click', async () => {
    const g = game();
    if (pending || !g || !adminFirebaseConnected) return;
    const round = g.round, pause = g.pausedAt == null;
    pending = true; tick();
    try {
      const result = await GameLogic.transactRoom(db.ref('rooms/' + roomCode), room => GameLogic.setRoundPaused(room, round, pause, serverNow()) || undefined);
      if (!result.committed) toast('Không thể đổi trạng thái lúc này. Vui lòng thử lại.');
    } catch (error) { toast('Chưa đổi được trạng thái. Hãy kiểm tra kết nối.'); }
    finally { pending = false; tick(); }
  });
  tick();
  setInterval(tick, 100);
})();
