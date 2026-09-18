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
    var pts = match ? 2 : 0;
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

  global.GameLogic = {
    computeChoiceResult: computeChoiceResult,
    computeWhoIsResult: computeWhoIsResult,
    computeTextResults: computeTextResults,
    computeRoundResults: computeRoundResults
  };
})(typeof window !== 'undefined' ? window : globalThis);
