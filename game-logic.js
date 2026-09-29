// ─────────────────────────────────────────────────────────────────────────
// game-logic.js — Ăn Ý shared game logic
//
// NGUYÊN TẮC BẮT BUỘC:
//   - Chỉ chứa PURE FUNCTIONS: cùng input → luôn cùng output.
//   - KHÔNG Firebase (không db.ref, không transaction, không .set/.once).
//   - KHÔNG DOM (không document, không innerHTML).
//   - KHÔNG side-effect (không console.log ngoài lỗi, không mutate input).
//   - KHÔNG build HTML/UI — mỗi trang (admin/index/display) tự render
//     bằng data thuần trả về từ các hàm dưới đây.
//
// PHỤ THUỘC:
//   - Cần window.normalizeAnswer (định nghĩa trong firebase.js) đã được
//     load TRƯỚC file này. game-logic.js không tự định nghĩa lại
//     normalizeAnswer để tránh duplicate logic đã thống nhất giữ nguyên
//     trong firebase.js.
//
// NGUỒN THAM CHIẾU (canonical logic, KHÔNG đổi công thức):
//   admin.html → computeRevealResults() — nơi duy nhất ghi team.score thật.
//   Các hàm dưới đây tái tạo lại ĐÚNG công thức đó, tách phần tính toán
//   ra khỏi phần build HTML (avatarImg, rowsHtml...) vốn vẫn ở lại từng file.
// ─────────────────────────────────────────────────────────────────────────
(function (global) {
  'use strict';

  function getNormalizeAnswer() {
    var fn = global.normalizeAnswer;
    if (typeof fn !== 'function') {
      throw new Error(
        'GameLogic: window.normalizeAnswer không tồn tại. ' +
        'Hãy load firebase.js TRƯỚC game-logic.js.'
      );
    }
    return fn;
  }

  // ── CHOICE (A/B) ──────────────────────────────────────────────────────
  // A/B là lựa chọn cố định → so khớp trực tiếp, KHÔNG normalize.
  // Giữ đúng công thức gốc từ admin.html: a1 && a2 && a1 === a2
  function computeChoiceResult(a1, a2, special) {
    var match = !!(a1 && a2 && a1 === a2);
    var pts = match ? (special ? 3 : 1) : 0;
    return { match: match, pts: pts };
  }

  // ── WHO_IS (đoán tên) ─────────────────────────────────────────────────
  // Có normalize vì đây là text tự gõ tên người.
  function computeWhoIsResult(a1, a2) {
    var normalizeAnswer = getNormalizeAnswer();
    var n1 = normalizeAnswer(a1);
    var n2 = normalizeAnswer(a2);
    var match = !!(n1 && n2 && n1 === n2);
    var pts = match ? 1 : 0;
    return { match: match, pts: pts };
  }

  // ── TEXT (tự điền, có tính isUnique toàn phòng) ─────────────────────
  // teams:   { [teamKey]: { player1, player2, score, teamName? } }
  // answers: { [playerName]: { answer, round, timestamp } }
  // Trả về: { [teamKey]: { match, pts, isUnique, a1, a2 } }
  function computeTextResults(teams, answers) {
    var normalizeAnswer = getNormalizeAnswer();
    teams = teams || {};
    answers = answers || {};

    var teamInfo = {};
    var matchCountByNorm = {};

    Object.keys(teams).forEach(function (key) {
      var team = teams[key] || {};
      var a1 = (answers[team.player1] && answers[team.player1].answer) || '';
      var a2 = (answers[team.player2] && answers[team.player2].answer) || '';
      var n1 = normalizeAnswer(a1);
      var n2 = normalizeAnswer(a2);
      var match = !!(n1 && n2 && n1 === n2);
      teamInfo[key] = { a1: a1, a2: a2, match: match, norm: n1 };
      if (match) {
        matchCountByNorm[n1] = (matchCountByNorm[n1] || 0) + 1;
      }
    });

    var results = {};
    Object.keys(teams).forEach(function (key) {
      var info = teamInfo[key];
      var pts = 0;
      var isUnique = false;
      if (info.match) {
        isUnique = matchCountByNorm[info.norm] === 1;
        pts = isUnique ? 3 : 1;
      }
      results[key] = {
        match: info.match,
        pts: pts,
        isUnique: isUnique,
        a1: info.a1,
        a2: info.a2
      };
    });
    return results;
  }

  // ── DISPATCH THEO game.type ──────────────────────────────────────────
  // game:    { type, special, ... } — chỉ đọc field, không ghi
  // teams:   { [teamKey]: { player1, player2, score, ... } }
  // answers: { [playerName]: { answer, ... } }
  // Trả về: { [teamKey]: { match, pts, isUnique, a1, a2 } } cho MỌI loại câu hỏi.
  function computeRoundResults(game, teams, answers) {
    game = game || {};
    teams = teams || {};
    answers = answers || {};
    var qType = game.type || 'choice';

    if (qType === 'team_tags') {
      const valid = {};
      Object.entries(teams).forEach(([key, team]) => {
        const a = answers[team.player1], b = answers[team.player2];
        if (a && b && a.round === game.round && b.round === game.round &&
            a.teamKey === key && b.teamKey === key && a.answer === b.answer &&
            (game.tags || []).includes(a.answer)) {
          valid[team.player1] = a; valid[team.player2] = b;
        }
      });
      return computeTextResults(teams, valid);
    }
    if (qType === 'text') {
      return computeTextResults(teams, answers);
    }

    var results = {};

    if (qType === 'who_is') {
      Object.keys(teams).forEach(function (key) {
        var team = teams[key] || {};
        var a1 = (answers[team.player1] && answers[team.player1].answer) || '';
        var a2 = (answers[team.player2] && answers[team.player2].answer) || '';
        var r = computeWhoIsResult(a1, a2);
        results[key] = { match: r.match, pts: r.pts, isUnique: false, a1: a1, a2: a2 };
      });
      return results;
    }

    // choice (mặc định)
    Object.keys(teams).forEach(function (key) {
      var team = teams[key] || {};
      var a1 = answers[team.player1] ? answers[team.player1].answer : null;
      var a2 = answers[team.player2] ? answers[team.player2].answer : null;
      var r = computeChoiceResult(a1, a2, !!game.special);
      results[key] = { match: r.match, pts: r.pts, isUnique: false, a1: a1, a2: a2 };
    });
    return results;
  }

  // A single room transaction mirrors the shared answer into both legacy player
  // slots. Existing progress/history readers remain compatible; two clients
  // cannot commit different answers, and reveal competes on the same location.
  function commitTeamTagAnswer(room, request, now) {
    if (!room || !room.game) return null;
    const game = room.game, team = (room.teams || {})[request.teamKey];
    const start = Number(game.answerStartsAt || game.startedAt);
    if (game.type !== 'team_tags' || game.status !== 'playing' ||
        game.round !== request.round || game.revealed || game.phase !== 'answering' ||
        !Number.isFinite(start) || now < start || now >= start + 30000 ||
        !team || !team.player1 || !team.player2 ||
        ![team.player1, team.player2].includes(request.player) ||
        !(game.tags || []).includes(request.answer)) return null;
    const answers = room.answers || {};
    if ([team.player1, team.player2].some(name => answers[name] && answers[name].round === game.round)) return null;
    const answer = { answer:request.answer, round:game.round, teamKey:request.teamKey, submittedBy:request.player, timestamp:now };
    return { ...room, answers:{ ...answers, [team.player1]:{...answer}, [team.player2]:{...answer} } };
  }

  function finalizeTeamTagRound(room, round, now) {
    if (!room || !room.game || room.game.type !== 'team_tags' || room.game.status !== 'playing' ||
        room.game.round !== round || room.game.revealed || room.game.phase !== 'answering') return null;
    const game = {...room.game}, teams = JSON.parse(JSON.stringify(room.teams || {}));
    const answers = Object.fromEntries(Object.entries(room.answers || {}).filter(([,a])=>a && a.round === round));
    const results = computeRoundResults(game, teams, answers);
    const ranks = () => Object.entries(teams).sort(([,a],[,b])=>(b.score||0)-(a.score||0));
    const before = Object.fromEntries(ranks().map(([key],i)=>[key,i+1]));
    const historyRound = { round, level:3, question:game.question, type:game.type, tags:game.tags, revealedAt:now, teams:{} };
    Object.entries(teams).forEach(([key,team])=>{
      const result = results[key];
      team.stats = {matches:0,unique:0,currentStreak:0,bestStreak:0,bestComeback:0,...team.stats};
      team.score = (team.score || 0) + result.pts;
      if (result.match) {
        team.stats.matches++; if(result.isUnique) team.stats.unique++;
        team.stats.currentStreak++; team.stats.bestStreak=Math.max(team.stats.bestStreak,team.stats.currentStreak);
      } else team.stats.currentStreak=0;
      historyRound.teams[key]={teamName:team.teamName||'',player1:team.player1,player2:team.player2,answer1:result.a1||'',answer2:result.a2||'',match:result.match,points:result.pts,unique:result.isUnique};
    });
    ranks().forEach(([key,team],i)=>{
      team.lastRankChange={from:before[key],to:i+1,delta:before[key]-i-1,round};
      team.stats.bestComeback=Math.max(team.stats.bestComeback,team.lastRankChange.delta);
    });
    Object.assign(game,{phase:'results',revealed:true,revealedAt:now,finalAnswers:answers,levelTransitionAt:null});
    return {...room,game,teams,history:{...room.history,rounds:{...(room.history && room.history.rounds),[round]:historyRound}}};
  }

  global.GameLogic = {
    commitTeamTagAnswer: commitTeamTagAnswer,
    finalizeTeamTagRound: finalizeTeamTagRound,
    computeChoiceResult: computeChoiceResult,
    computeWhoIsResult: computeWhoIsResult,
    computeTextResults: computeTextResults,
    computeRoundResults: computeRoundResults
  };
})(typeof window !== 'undefined' ? window : globalThis);
