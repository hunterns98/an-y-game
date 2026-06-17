const firebaseConfig = {
apiKey: "AIzaSyCzYmilwmIuxraNC3TxOVSwknmOSc4mBb0",
authDomain: "an-y-game.firebaseapp.com",
databaseURL: "https://an-y-game-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "an-y-game",
storageBucket: "an-y-game.firebasestorage.app",
messagingSenderId: "284676671292",
appId: "1:284676671292:web:e21bda6a9dbec485120039"
};
firebase.initializeApp(firebaseConfig);
window.db = firebase.database();

// ── Chuẩn hoá đáp án tự nhập: bỏ khoảng trắng, không phân biệt hoa/thường, bỏ dấu ──
// "Hà Nội" / "hÀ NộI" / "HANOI" / "   HÀ   Nội   " → tất cả đều thành "hanoi"
window.normalizeAnswer = function(str) {
  if (str === null || str === undefined) return '';
  return str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
};
