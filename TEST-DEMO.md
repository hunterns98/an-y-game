# Test Demo

Kiểm tra lỗi mạng, đáp án đến muộn, đổi tên đồng thời và chuyển câu: `node test-audit-regressions.cjs`. Đây là kiểm tra mô phỏng; không ghi dữ liệu phòng thật.

Mở `test-demo.html` trên cùng máy chủ với game. Đường dẫn cũ `desktop-preview.html` vẫn hoạt động.

- Chọn màn ở thanh trên: phòng chờ, ba level, kết quả, mở quà, thơ, 16 thiệp và lịch sử.
- Chọn trạng thái để xem lúc gửi đáp án, khóa đáp án, các mức điểm, hết giờ, chuyển level và chờ vinh danh.
- Chọn từng câu trong 19 câu hỏi hoặc chuyển khung điện thoại/máy tính.
- Liên kết công bố điểm mở `test-demo-display.html`: kết quả từng câu của tám đội; tổng điểm và xếp hạng chỉ hiện khi vinh danh.
- Level 2 cùng chọn một người được +1 điểm. Phòng chờ có trạng thái chưa ghép đội; trang người chơi luôn tắt âm thanh.
- Biểu cảm Zalo dùng ảnh trong `assets/emotes`, được hiển thị qua `game-presentation.css` và `game-presentation.js`. Khi cập nhật hosting, đưa lên cả các file này. Kiểm tra nội dung và quy tắc hiển thị bằng `node test-presentation.cjs`.
- Level 3 có 5 câu chọn tag (6/5/6/6/6 lựa chọn). Hai người được trao đổi; người chốt hợp lệ đầu tiên quyết định đáp án chung. Trùng đội khác +1, độc nhất +3, không chốt +0. Thời gian 30 giây.

Demo dùng dữ liệu giả lập, không kết nối Firebase và không ảnh hưởng phòng thật. Các trạng thái được mở trực tiếp để duyệt hình thức, không mô phỏng thời gian và đồng bộ của trận thật. Màn công bố điểm dùng cách dựng giao diện và công thức tính điểm của game.

Sau khi sửa giao diện/nội dung game, chạy `node build-desktop-preview.cjs` và `node build-test-demo-display.cjs` để cập nhật demo. Không sửa trực tiếp các HTML demo được sinh ra. Điều khiển demo nằm trong `test-demo-states.js` và `desktop-preview-finale.js`.

Kiểm tra logic: `node test-team-tags.cjs` và `node test-team-tags-player.cjs`. Các kiểm tra này mô phỏng trạng thái và hai client; không thay thế chạy thử nhiều thiết bị qua Firebase. Khi cập nhật lên hosting, nhớ đưa lên cả `team-tags.css` và `team-tags-player.js` cùng các file HTML/JS đã sửa.

BTC tự công bố khi hết 30 giây hoặc đủ đáp án của tất cả đội. Giữ trang BTC mở trong trận; chuyển câu tiếp theo vẫn do BTC điều khiển.
