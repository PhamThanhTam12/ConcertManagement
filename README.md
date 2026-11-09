# ConcertManagement — Midnight Live

Frontend React cho một concert: giới thiệu chương trình, countdown, nghệ sĩ, timeline, chọn hạng vé, đặt vé, thanh toán mô phỏng, vé của tôi và khu vực quản lý.

## Chạy project

Dùng Node.js 22.12+ hoặc Node 24. Trong Git Bash:

```bash
npm ci
cp .env.example .env
npm run dev
```

URL API nằm trong `.env`, không viết trực tiếp trong service. Xem **[MOCKAPI.md](MOCKAPI.md)** để bổ sung schema và nạp dữ liệu. Nếu chưa có concert, đăng nhập admin rồi nhấn **Khởi tạo dữ liệu mẫu**. Các file JSON đã có trong thư mục `mockapi`.

```bash
npm run lint
npm run build
npm run preview
```

## Tài khoản dùng cho assignment

| Vai trò       | Email              | Mật khẩu  |
| ------------- | ------------------ | --------- |
| Người dùng    | user@concert.test  | User123!  |
| Quản trị viên | admin@concert.test | Admin123! |

Khách xem trang chủ và hạng vé. Người dùng đặt tối đa 6 vé/đơn, xem đơn của mình, hủy trước giờ diễn. Admin không đặt vé; admin quản lý thông tin, nghệ sĩ, lịch trình, hạng vé và các đơn của concert.

Đăng nhập được mô phỏng bằng mảng tài khoản frontend, Context và localStorage. MockAPI không xác thực quyền trên server. Đây là phạm vi bài frontend, chưa có xác thực server, thanh toán thật hoặc kiểm soát tồn vé đồng thời bằng giao dịch database.

## Luồng mua vé

Chọn hạng vé → đăng nhập → nhập thông tin → kiểm tra đơn → xác nhận → Axios POST MockAPI → nhận mã đặt vé → xem tại Vé của tôi.

Thanh toán tại quầy giữ trạng thái pending. Thanh toán mô phỏng đặt trạng thái paid nhưng không thu tiền/không nhập thông tin ngân hàng. Khi hủy đơn mô phỏng đã paid, trạng thái chuyển refunded; đó không phải giao dịch hoàn tiền thật.

Số vé còn lại = capacity của hạng vé − tổng quantity của các đơn confirmed. App đọc lại dữ liệu trước POST để phát hiện thay đổi giá/tồn vé. MockAPI không có transaction nên kiểm tra này không bảo đảm chống mua vượt khi nhiều máy gửi đồng thời. Không đổi slug `midnight-live-2026`, vì app dùng slug này để chọn record riêng trong resource events có thể chứa dữ liệu cũ.

## Cấu trúc src

```text
src/
  main.jsx       Khởi động React, Router và Provider
  App.jsx        Khai báo các route
  App.css        CSS giao diện và responsive
  components/    Layout, countdown, thẻ vé, bảng và các form
  pages/         Trang chủ, mua vé, checkout, vé của tôi, login, admin
  context/       Chia sẻ tài khoản và dữ liệu concert
  data/          Tài khoản và dữ liệu dùng khi admin khởi tạo
  reducers/      Quy tắc cập nhật state concert
  services/      Axios gọi MockAPI
  utils/         Định dạng tiền/ngày, quyền sở hữu và số lượng vé
mockapi/         JSON mẫu để nhập/đối chiếu
public/images/  Ảnh tĩnh và ảnh dự phòng
```

## Kiến thức gắn với tài liệu đã học

| Nội dung tài liệu                                | Chức năng áp dụng                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| Lesson 01–02: React, JSX, component, props       | Layout, TicketCard, các form và trang                              |
| Lesson 03–04: useState, useEffect, useContext    | Bộ lọc timeline, modal, tải API, AuthContext/ConcertContext        |
| Exercise 10: CountdownTimer với interval/cleanup | Countdown ngày/giờ/phút/giây, dừng ở 0 và cleanup interval         |
| Lesson useReducer                                | ConcertProvider dispatch action, reducer tạo state mới             |
| Lesson React Router, Exercise 11                 | BrowserRouter, Route, Link, Outlet, useParams, route guard         |
| Exercise 12: Formik/Yup                          | Login, checkout, thông tin concert, nghệ sĩ, tiết mục và hạng vé   |
| Lesson 8 Fetching and Caching Data               | Axios get/post/put/delete, response.data, async/await và xử lý lỗi |
| Exercise 9: Context và localStorage              | Lưu ID tài khoản và khôi phục khi reload                           |

Axios và setInterval đã có trong tài liệu bạn gửi. React Bootstrap/CSS tiếp tục dùng cách của bài EventHub. Phần bổ sung nhỏ là Date/Intl để tính và hiển thị giờ Việt Nam, AbortController để hủy request, scrollIntoView để chuyển tới section, và mô hình lưu mảng nghệ sĩ/lịch trình/hạng vé trong một record nhằm giữ hai resource. Không thêm state library, thư viện animation, thư viện thanh toán hay backend.

Để review API: mở Network → Fetch/XHR, xem GET events/bookings; đặt vé để xem POST; hủy để xem PUT; chỉnh nghệ sĩ/lịch trình/hạng vé để xem PUT events/:id. `src/services` chỉ dùng Axios; dữ liệu phản hồi nằm ở response.data.

## Dữ liệu và ảnh minh họa

Tên concert, nghệ sĩ, ngày diễn và giá vé là dữ liệu hư cấu cho assignment. Các ảnh chỉ minh họa; không thể hiện các cá nhân trong ảnh tham gia concert có thật.

Ảnh minh họa Unsplash được phân phối trong template [Festava Live — Tooplate](https://www.tooplate.com/view/2080-festava-live), các tên ảnh gốc: Nicholas Green, Nainoa Shizuru, Abstral Official, Joe Calih và Soundtrap. Bản ảnh lấy từ cây nguồn công khai [FestavaLive](https://github.com/JastJoper/FestavaLive/tree/main/AcunMedyaFestavaLive/Templates/FestavaLive-1.0.0/images). Ảnh artist-4 từ [Eventre Bootstrap — Themefisher](https://github.com/themefisher/eventre-bootstrap), giấy phép MIT được giữ trong ASSET-LICENSE.txt. Mã giao diện React được viết riêng cho project này.
