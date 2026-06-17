// =====================================================
// FIREBASE
// =====================================================
const db = firebase.database();

// =====================================================
// STATE
// =====================================================
let myName = "";
let myRoom = "";
let myTeam = "";         // "team1", "team2"...
let currentRound = 0;    // index 0-19
let hasAnswered = false;

// =====================================================
// CÂU HỎI
// =====================================================
const questions = [
  { text:"Thức uống bạn chọn là:",            a:"Cà phê",                  b:"Trà",                        special:false },
  { text:"Bạn thích phúc lợi:",                a:"Thêm ngày phép",           b:"Tiền thưởng nóng",           special:false },
  { text:"Thể loại âm nhạc bạn chọn:",         a:"Ballad thất tình",         b:"Remix giật giật",            special:false },
  { text:"Nếu phải chọn nuôi:",                a:"Chó",                      b:"Mèo",                        special:false },
  { text:"Liên hoan cuối năm bạn chọn:",       a:"Hát",                      b:"Nhảy",                       special:false },
  { text:"Sếp bảo tăng ca nhé em:",            a:"Tìm lý do từ chối",        b:"Chấp nhận số phận",          special:false },
  { text:"Môi trường công sở:",                a:"Lương cao sếp toxic",      b:"Lương thấp đồng nghiệp vui", special:false },
  { text:"Màu yêu thích:",                     a:"Đỏ",                       b:"Xanh Lá",                    special:false },
  { text:"Bộ môn thể thao nếu phải chọn:",     a:"Chạy bộ",                  b:"Bơi lội",                    special:false },
  { text:"Nếu phải chọn đi du lịch:",          a:"Lên núi",                  b:"Xuống biển",                 special:false },
  { text:"Nếu lựa chọn:",                      a:"Làm sếp công ty bé",       b:"Nhân viên tập đoàn lớn",     special:false },
  { text:"Đồ uống unhealthy bạn chọn:",        a:"Bia",                      b:"Rượu",                       special:false },
  { text:"Đến giờ nạp calo rồi, bạn chọn:",   a:"Ăn lẩu",                   b:"Ăn nướng",                   special:false },
  { text:"🌟 ĂN ĐIỂM: Tỉnh nào bắt đầu bằng chữ H?", a:"Hà Nội",           b:"Hải Phòng",                  special:true  },
  { text:"Thời tiết ưa thích:",                a:"Mùa Xuân mát mẻ",          b:"Mùa Thu se lạnh",            special:false },
  { text:"Chuông báo thức kêu:",               a:"Dậy ngay",                 b:"Bấm 5 phút nữa",             special:false },
  { text:"Kế hoạch cuối tuần:",                a:"Ngủ nướng",                b:"Ra ngoài vi vu",             special:false },
  { text:"Khẩu vị:",                           a:"Cay",                      b:"Chua Ngọt",                  special:false },
  { text:"Dân chơi hệ:",                       a:"Táo IOS",                  b:"Android",                    special:false },
  { text:"Nếu lựa chọn, bạn muốn trở thành:", a:"Steve Jobs",               b:"Elon Musk",                  special:false }
];

// =====================================================
// CHỌN ROLE
// =====================================================
window.showHost = function(){
  document.getElementById("host").style.display = "block";
  document.getElementById("player").style.display = "none";
  document.getElementById("roleSelect").style.display = "none";
};

window.showPlayer = function(){
  document.getElementById("player").style.display = "block";
  document.getElementById("host").style.display = "none";
  document.getElementById("roleSelect").style.display = "none";
};

// =====================================================
// HOST: TẠO PHÒNG
// =====================================================
window.createRoom = function(){
  let hostName = document.getElementById("hostName").value.trim();
  if(!hostName){ alert("Nhập tên host"); return; }

  let code = Math.random().toString(36).substring(2,7).toUpperCase();

  db.ref("rooms/" + code).set({
    host: hostName,
    status: "waiting",
    currentRound: -1   // -1 = chưa bắt đầu
  });

  document.getElementById("roomCode").innerHTML = "Mã phòng: <strong>" + code + "</strong>";

  // Lưu lại để dùng cho startGame, nextQuestion...
  window._hostRoom = code;

  listenPlayers(code);
};

// =====================================================
// HOST: NGHE DANH SÁCH NGƯỜI CHƠI
// =====================================================
window.listenPlayers = function(code){
  db.ref("rooms/" + code + "/players").on("value", function(snapshot){
    let players = snapshot.val();
    let html = "👥 Người chơi:<br><br>";
    if(players){
      Object.values(players).forEach(function(p, i){
        html += (i+1) + ". " + p.name + "<br>";
      });
    } else {
      html += "Chưa có ai vào phòng";
    }
    document.getElementById("playerList").innerHTML = html;
  });
};

// =====================================================
// HOST: GHÉP CẶP
// =====================================================
window.makeTeams = function(){
  let roomCode = window._hostRoom || prompt("Nhập mã phòng để ghép cặp");
  if(!roomCode) return;
  window._hostRoom = roomCode;

  db.ref("rooms/" + roomCode + "/players").once("value").then(function(snapshot){
    let players = snapshot.val();
    if(!players){ alert("Chưa có người chơi"); return; }

    let list = Object.values(players);
    if(list.length < 2){ alert("Cần ít nhất 2 người"); return; }

    list.sort(() => Math.random() - 0.5);

    let teams = {};
    for(let i = 0; i < list.length; i += 2){
      let n = (i/2) + 1;
      teams["team" + n] = {
        player1: list[i].name,
        player2: list[i+1] ? list[i+1].name : "Đang chờ",
        score: 0
      };
    }

    db.ref("rooms/" + roomCode + "/teams").set(teams);
    alert("Đã ghép " + Object.keys(teams).length + " đội");

    listenTeams(roomCode);

    // Hiện nút bắt đầu
    document.getElementById("btnStart").style.display = "block";
  });
};

// =====================================================
// HOST: HIỆN DANH SÁCH ĐỘI
// =====================================================
window.listenTeams = function(roomCode){
  db.ref("rooms/" + roomCode + "/teams").on("value", function(snapshot){
    let teams = snapshot.val();
    if(!teams) return;

    let html = "🎉 Đội chơi:<br><br>";
    Object.values(teams).forEach(function(team, i){
      html += "❤️ Team " + (i+1) + " : " + team.player1 + " + " + team.player2 + "<br>";
    });
    document.getElementById("teamList").innerHTML = html;
  });
};

// =====================================================
// HOST: BẮT ĐẦU GAME
// =====================================================
window.startGame = function(){
  let roomCode = window._hostRoom;
  if(!roomCode){ alert("Chưa tạo phòng"); return; }

  currentRound = 0;
  sendQuestion(roomCode, 0);

  document.getElementById("hostGameArea").style.display = "block";
  listenHostAnswers(roomCode);
};

// =====================================================
// HOST: GỬI CÂU HỎI THEO ROUND
// =====================================================
function sendQuestion(roomCode, roundIndex){
  let q = questions[roundIndex];
  db.ref("rooms/" + roomCode + "/game").set({
    status: "playing",
    round: roundIndex,
    question: q.text,
    optionA: q.a,
    optionB: q.b,
    special: q.special,
    revealed: false
  });

  // Reset answers cho round mới
  db.ref("rooms/" + roomCode + "/answers").remove();

  // Cập nhật UI host
  document.getElementById("hostQuestion").innerHTML =
    (q.special ? "🌟 CÂU ĂN ĐIỂM: " : "") + q.text;
  document.getElementById("hostOptions").innerHTML =
    "A. " + q.a + " &nbsp;&nbsp; B. " + q.b;
  document.getElementById("hostRound").textContent = (roundIndex + 1);
  document.getElementById("hostAnswerList").innerHTML = "Đang chờ đáp án...";
}

// =====================================================
// HOST: NGHE ĐÁP ÁN REALTIME
// =====================================================
function listenHostAnswers(roomCode){
  db.ref("rooms/" + roomCode + "/answers").on("value", function(snapshot){
    let answers = snapshot.val();
    if(!answers){
      document.getElementById("hostAnswerList").innerHTML = "Chưa có ai trả lời";
      return;
    }

    let html = "📋 Đáp án (ẩn):<br>";
    Object.keys(answers).forEach(function(playerName){
      // Host thấy đã trả lời nhưng không thấy đáp án cho đến reveal
      html += "✅ " + playerName + " đã trả lời<br>";
    });
    document.getElementById("hostAnswerList").innerHTML = html;
  });
}

// =====================================================
// HOST: REVEAL ĐÁP ÁN
// =====================================================
window.revealAnswers = function(){
  let roomCode = window._hostRoom;
  if(!roomCode) return;

  let roundIndex = currentRound;
  let q = questions[roundIndex];

  db.ref("rooms/" + roomCode + "/answers").once("value").then(function(snapshot){
    let answers = snapshot.val() || {};

    db.ref("rooms/" + roomCode + "/teams").once("value").then(function(tSnap){
      let teams = tSnap.val() || {};
      let html = "<hr><b>🔓 Kết quả:</b><br><br>";
      let scoreUpdates = {};

      Object.entries(teams).forEach(function([teamKey, team]){
        let ans1 = answers[team.player1] ? answers[team.player1].answer : null;
        let ans2 = answers[team.player2] ? answers[team.player2].answer : null;

        html += "❤️ <b>Team " + (teamKey.replace("team","")) + "</b>: ";
        html += team.player1 + " → " + (ans1 || "❌") + " | ";
        html += team.player2 + " → " + (ans2 || "❌") + "<br>";

        if(ans1 && ans2){
          if(ans1 === ans2){
            if(q.special){
              html += "🌟 Ăn ý đặc biệt! +3 điểm<br>";
              scoreUpdates[teamKey] = (team.score || 0) + 3;
            } else {
              html += "💞 Ăn ý! +1 điểm<br>";
              scoreUpdates[teamKey] = (team.score || 0) + 1;
            }
          } else {
            html += "😅 Chưa ăn ý, 0 điểm<br>";
          }
        } else {
          html += "⏳ Chưa đủ đáp án<br>";
        }
        html += "<br>";
      });

      document.getElementById("hostAnswerList").innerHTML = html;

      // Cập nhật điểm lên Firebase
      Object.entries(scoreUpdates).forEach(function([teamKey, newScore]){
        db.ref("rooms/" + roomCode + "/teams/" + teamKey + "/score").set(newScore);
      });

      // Báo player xem kết quả
      db.ref("rooms/" + roomCode + "/game/revealed").set(true);
    });
  });
};

// =====================================================
// HOST: CÂU TIẾP THEO
// =====================================================
window.nextQuestion = function(){
  let roomCode = window._hostRoom;
  if(!roomCode) return;

  currentRound++;
  if(currentRound >= questions.length){
    endGame(roomCode);
    return;
  }

  sendQuestion(roomCode, currentRound);
};

// =====================================================
// HOST: KẾT THÚC GAME
// =====================================================
function endGame(roomCode){
  db.ref("rooms/" + roomCode + "/game/status").set("ended");
  db.ref("rooms/" + roomCode + "/teams").once("value").then(function(snap){
    let teams = snap.val() || {};
    let html = "<hr>🏆 <b>KẾT QUẢ CUỐI CÙNG:</b><br><br>";
    let sorted = Object.values(teams).sort((a,b) => (b.score||0) - (a.score||0));
    sorted.forEach(function(team, i){
      html += (i===0 ? "🥇 " : i===1 ? "🥈 " : "🥉 ");
      html += team.player1 + " & " + team.player2;
      html += " → <b>" + (team.score||0) + " điểm</b><br>";
    });
    document.getElementById("hostAnswerList").innerHTML = html;
  });
}

// =====================================================
// NGƯỜI CHƠI: VÀO PHÒNG
// =====================================================
window.joinRoom = function(){
  myName = document.getElementById("name").value.trim();
  myRoom = document.getElementById("room").value.trim().toUpperCase();

  if(!myName || !myRoom){ alert("Nhập đủ tên và mã phòng"); return; }

  // Kiểm tra phòng tồn tại
  db.ref("rooms/" + myRoom).once("value").then(function(snap){
    if(!snap.exists()){ alert("Phòng không tồn tại!"); return; }

    // Đăng ký vào phòng
    db.ref("rooms/" + myRoom + "/players/" + myName).set({
      name: myName,
      score: 0,
      answer: ""
    });

    // Ẩn form, hiện game area
    document.getElementById("player").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("question").textContent = "✅ Đã vào phòng! Đang chờ host bắt đầu...";

    // Tìm team của mình
    findMyTeam();

    // Lắng nghe câu hỏi
    listenGame(myRoom);
  });
};

// =====================================================
// NGƯỜI CHƠI: TÌM TEAM
// =====================================================
function findMyTeam(){
  db.ref("rooms/" + myRoom + "/teams").on("value", function(snap){
    let teams = snap.val();
    if(!teams) return;
    Object.entries(teams).forEach(function([teamKey, team]){
      if(team.player1 === myName || team.player2 === myName){
        myTeam = teamKey;
      }
    });
  });
}

// =====================================================
// NGƯỜI CHƠI: NGHE CÂU HỎI REALTIME
// =====================================================
window.listenGame = function(roomCode){
  db.ref("rooms/" + roomCode + "/game").on("value", function(snapshot){
    let game = snapshot.val();
    if(!game) return;

    if(game.status === "ended"){
      showEndForPlayer(roomCode);
      return;
    }

    if(game.status !== "playing") return;

    // Cập nhật round index
    currentRound = game.round || 0;
    hasAnswered = false;

    // Hiện câu hỏi
    document.getElementById("question").textContent =
      (game.special ? "🌟 CÂU ĂN ĐIỂM! " : "") + game.question;
    document.getElementById("playerRound").textContent =
      "Câu " + (game.round + 1) + " / 20";

    // Reset trạng thái
    document.getElementById("playerStatus").style.display = "none";
    document.getElementById("resultArea").style.display = "none";

    // Hiện nút chọn A/B
    document.getElementById("answers").innerHTML =
      '<button onclick="chooseAnswer(\'A\')" class="btnAnswer">A. ' + game.optionA + '</button>' +
      '<button onclick="chooseAnswer(\'B\')" class="btnAnswer">B. ' + game.optionB + '</button>';

    // Nếu revealed thì hiện kết quả
    if(game.revealed){
      showResultForPlayer(roomCode, game);
    }
  });

  // Lắng nghe riêng event reveal
  db.ref("rooms/" + roomCode + "/game/revealed").on("value", function(snap){
    if(snap.val() === true){
      db.ref("rooms/" + roomCode + "/game").once("value").then(function(gSnap){
        showResultForPlayer(roomCode, gSnap.val());
      });
    }
  });
};

// =====================================================
// NGƯỜI CHƠI: CHỌN ĐÁP ÁN
// =====================================================
window.chooseAnswer = function(choice){
  if(hasAnswered) return;
  hasAnswered = true;

  // Ẩn nút, hiện trạng thái chờ
  document.getElementById("answers").innerHTML = "";
  document.getElementById("playerStatus").style.display = "block";
  document.getElementById("playerStatus").innerHTML =
    "✅ Bạn đã chọn: <strong>" + choice + "</strong><br>Đang chờ đồng đội...";

  // Lưu lên Firebase
  db.ref("rooms/" + myRoom + "/answers/" + myName).set({
    answer: choice,
    round: currentRound,
    timestamp: Date.now()
  });
};

// =====================================================
// NGƯỜI CHƠI: XEM KẾT QUẢ SAU REVEAL
// =====================================================
function showResultForPlayer(roomCode, game){
  if(!game) return;

  db.ref("rooms/" + roomCode + "/answers").once("value").then(function(aSnap){
    let answers = aSnap.val() || {};

    db.ref("rooms/" + roomCode + "/teams/" + myTeam).once("value").then(function(tSnap){
      let team = tSnap.val();
      if(!team) return;

      let partner = team.player1 === myName ? team.player2 : team.player1;
      let myAns    = answers[myName]  ? answers[myName].answer  : "❌";
      let pAns     = answers[partner] ? answers[partner].answer : "❌";

      let match = myAns === pAns && myAns !== "❌";
      let resultText = "";
      if(match){
        resultText = game.special
          ? "🌟 Ăn ý đặc biệt! Đội bạn +3 điểm!"
          : "💞 Ăn ý! Đội bạn +1 điểm!";
      } else {
        resultText = "😅 Chưa ăn ý lần này!";
      }

      document.getElementById("resultArea").style.display = "block";
      document.getElementById("resultArea").innerHTML =
        "<hr>" +
        "Bạn: <b>" + myAns + "</b> | " + partner + ": <b>" + pAns + "</b><br>" +
        "<big>" + resultText + "</big>" +
        "<br><small>Chờ host chuyển câu...</small>";

      document.getElementById("answers").innerHTML = "";
      document.getElementById("playerStatus").style.display = "none";
    });
  });
}

// =====================================================
// NGƯỜI CHƠI: MÀN HÌNH KẾT THÚC
// =====================================================
function showEndForPlayer(roomCode){
  db.ref("rooms/" + roomCode + "/teams").once("value").then(function(snap){
    let teams = snap.val() || {};
    let sorted = Object.values(teams).sort((a,b) => (b.score||0) - (a.score||0));

    let html = "<hr>🏆 <b>Game kết thúc!</b><br><br>";
    sorted.forEach(function(team, i){
      let isMe = team.player1 === myName || team.player2 === myName;
      html += (i===0?"🥇":i===1?"🥈":"🥉") + " ";
      html += team.player1 + " & " + team.player2;
      html += " → <b>" + (team.score||0) + " điểm</b>";
      if(isMe) html += " 👈 Đội bạn";
      html += "<br>";
    });

    document.getElementById("question").innerHTML = html;
    document.getElementById("answers").innerHTML = "";
    document.getElementById("playerStatus").style.display = "none";
    document.getElementById("resultArea").style.display = "none";
  });
}
