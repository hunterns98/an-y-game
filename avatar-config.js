// Avatar cố định cho danh sách người chơi của chương trình.
// Tên được chuẩn hoá: không phân biệt hoa/thường, dấu tiếng Việt hay khoảng trắng.
// Muốn dùng ảnh thật: đặt file .webp tương ứng trong assets/avatars/players/.
(function (global) {
  'use strict';

  var PEOPLE = {
    nhung:     { slot: 1,  file: 'nhung.webp' },
    thuy:      { slot: 2,  file: 'thuy.webp' },
    an:        { slot: 3,  file: 'an.webp' },
    thoan:     { slot: 4,  file: 'thoan.webp' },
    phuong:    { slot: 5,  file: 'phuong.webp' },
    anh:       { slot: 6,  file: 'anh.webp' },
    giang:     { slot: 7,  file: 'giang.webp' },
    hanh:      { slot: 8,  file: 'hanh.webp' },
    le:        { slot: 9,  file: 'le.webp' },
    maianh:    { slot: 10, file: 'mai-anh.webp' },
    linh:      { slot: 11, file: 'linh.webp' },
    hang:      { slot: 12, file: 'hang.webp' },
    hoa:       { slot: 13, file: 'hoa.webp' },
    trang:     { slot: 14, file: 'trang.webp' },
    truc:      { slot: 15, file: 'truc.webp' },
    lien:      { slot: 16, file: 'lien.webp' }
  };

  function normalizeName(name) {
    return (name == null ? '' : String(name))
      .trim().toLowerCase().replace(/đ/g, 'd').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  }

  function entryFor(name) { return PEOPLE[normalizeName(name)] || null; }
  function fallbackSrc(slot) { return 'assets/avatars/avatar' + (slot || 17) + '.png'; }

  global.PlayerAvatars = {
    entryFor: entryFor,
    numberFor: function (name) { var entry = entryFor(name); return entry ? entry.slot : null; },
    // 1–16 dành riêng cho các tên cố định. Tên khách sẽ chỉ rút 17 hoặc 18.
    randomPool: function () { return [17, 18]; },
    randomNumber: function () { return Math.random() < 0.5 ? 17 : 18; },
    fallbackSrc: fallbackSrc,
    srcFor: function (name, slot) {
      var entry = entryFor(name);
      return entry ? 'assets/avatars/players/' + entry.file : fallbackSrc(slot);
    }
  };
})(window);
