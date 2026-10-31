# Bảo tàng số Biển đảo Việt Nam — phiên bản website

## Chạy thử trong Spck Editor
1. Giải nén `Dao-Truong-Sa-Website.zip` vào một thư mục.
2. Mở thư mục dự án trong Spck Editor.
3. Mở `index.html` bằng Preview/trình duyệt.
4. Không đổi vị trí các thư mục `images`, `audio`, `videos`, `islands`, `js` nếu chưa cập nhật đường dẫn.

## Cấu trúc
- `index.html`: trang chủ và danh sách đảo.
- `islands/*.html`: mỗi đảo là một trang web riêng.
- `style.css`: giao diện responsive theo chủ đề biển đảo.
- `js/site.js`: chuyển cảnh, đồng hồ UTC+7, gallery tự chuyển 5 giây, điều phối âm thanh.
- `original-backup/`: bản HTML/CSS/JS gốc được giữ lại để tham khảo.

## Thống kê lượt truy cập thực tế
Đồng hồ ngày giờ chạy ngay trên trình duyệt. Bộ đếm truy cập toàn website cần một dịch vụ bên ngoài hoặc backend; website tĩnh không thể tự tổng hợp chính xác lượt xem của tất cả khách truy cập chỉ bằng `localStorage`.

Để bật thống kê với GoatCounter:
1. Tạo một site miễn phí tại https://www.goatcounter.com/ và chọn một mã site, ví dụ `ten-site`.
2. Trong tất cả các trang HTML, thêm `data-goatcounter="https://ten-site.goatcounter.com"` vào thẻ `<html>` (thay bằng địa chỉ site thật của bạn).
3. Mã JavaScript sẽ nạp script ghi nhận lượt xem và thử đọc bộ đếm công khai theo đường dẫn trang hiện tại. Để số đếm hiển thị được, hãy bật public counter/API trong cài đặt GoatCounter nếu gói tài khoản/cấu hình của bạn yêu cầu. Nếu endpoint công khai không khả dụng, trang vẫn gửi thống kê và hiển thị trạng thái thay vì bịa ra số lượt xem. Số hiển thị là lượt xem của trang hiện tại, không phải tổng hợp số khách truy cập duy nhất toàn website.

## Tư liệu còn thiếu
Gói ban đầu chỉ có ba ảnh và một video cho Trường Sa Lớn. Vì vậy các trang Sinh Tồn, Song Tử Tây và An Bang dùng `images/island-illustration.svg`, được ghi rõ là hình minh họa, không giả làm ảnh thực địa. Video riêng của các đảo này chưa có. Hãy bổ sung ảnh/video có quyền sử dụng và xác minh nguồn trước khi thay thế.

## Lưu ý nội dung
Một số số liệu trong mã gốc chưa có nguồn dẫn kèm theo. Phiên bản này giữ thông tin tham khảo ở mức thận trọng và đánh dấu các số liệu cần kiểm chứng thay vì khẳng định chúng là dữ liệu chính thức.

## Triển khai lên hosting
Tải toàn bộ nội dung thư mục dự án lên thư mục gốc hosting. Đảm bảo `index.html` nằm ở thư mục gốc và hosting phục vụ được các tệp `.html`, `.css`, `.js`, `.svg`, `.jpg`, `.mp4`, `.mp3`.
