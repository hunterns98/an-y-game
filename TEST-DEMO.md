# Test Demo

Mở `test-demo.html` trên cùng máy chủ với game. Đường dẫn cũ `desktop-preview.html` vẫn hoạt động.

- Chọn màn ở thanh trên: phòng chờ, ba level, kết quả, mở quà, thơ, 16 thiệp và lịch sử.
- Chọn trạng thái để xem lúc gửi đáp án, khóa đáp án, các mức điểm, hết giờ, chuyển level và chờ vinh danh.
- Chọn từng câu trong 19 câu hỏi hoặc chuyển khung điện thoại/máy tính.
- Liên kết công bố điểm mở `test-demo-display.html`: kết quả tám đội, xếp hạng và vinh danh.

Demo dùng dữ liệu giả lập, không kết nối Firebase và không ảnh hưởng phòng thật. Các trạng thái được mở trực tiếp để duyệt hình thức, không mô phỏng thời gian và đồng bộ của trận thật. Màn công bố điểm dùng cách dựng giao diện và công thức tính điểm của game.

Sau khi sửa giao diện/nội dung game, chạy `node build-desktop-preview.cjs` và `node build-test-demo-display.cjs` để cập nhật demo. Không sửa trực tiếp các HTML demo được sinh ra. Điều khiển demo nằm trong `test-demo-states.js` và `desktop-preview-finale.js`.
