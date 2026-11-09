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

Khách xem trang chủ và hạng vé. Người dùng nhập email đăng ký vé tùy chọn, xem các đơn do tài khoản của mình đặt và hủy trước giờ diễn. Mỗi email đăng ký vé được giữ tối đa 6 vé còn hiệu lực cho concert, cộng tất cả hạng vé và các lần đặt. Admin không đặt vé; admin quản lý thông tin, nghệ sĩ, lịch trình, hạng vé và các đơn của concert.

Menu theo vai trò: user dùng **Lịch trình/Nghệ sĩ** để cuộn tới nội dung trang chủ và **Mua vé** để chọn hạng vé. Admin dùng **Lịch trình/Nghệ sĩ** để mở đúng tab quản lý, và **Đơn vé** để kiểm tra đơn của tất cả khách. Tab quản lý được lưu trong URL (`/admin#schedule`, `/admin#artists`, `/admin#bookings`), nên tải lại hoặc quay lại bằng trình duyệt vẫn mở đúng tab. Admin truy cập `/tickets` được chuyển tới quản lý đơn.

Nếu đã đăng nhập nhưng chỉ thấy màn hình chưa có chương trình, cần khởi tạo dữ liệu concert bằng tài khoản admin. Thêm schema trên MockAPI chưa tạo ra record concert. User đã đăng nhập sẽ có nút **Kiểm tra lại chương trình**, thay vì bị yêu cầu đăng nhập lại.

Đăng nhập được mô phỏng bằng mảng tài khoản frontend, Context và localStorage. MockAPI không xác thực quyền trên server. Đây là phạm vi bài frontend, chưa có xác thực server, thanh toán thật hoặc kiểm soát tồn vé đồng thời bằng giao dịch database.

## Luồng mua vé

Chọn hạng vé → đăng nhập → nhập thông tin → kiểm tra đơn → xác nhận → Axios POST MockAPI → thông báo đặt vé thành công → xem tại Vé của tôi.

`email` là email đăng ký vé do người dùng nhập, có thể khác tài khoản đăng nhập. `accountEmail` là email tài khoản đã đặt, tự lấy từ AuthContext và không cho người dùng nhập. Hai email được trim và đổi về chữ thường khi lưu. Trang Vé của tôi lọc theo accountEmail; đơn cũ chưa có accountEmail hợp lệ tiếp tục dùng email cũ để xác định chủ đơn. Email đăng ký vé dùng để lưu thông tin, chưa có chức năng gửi thư thật.

Hạn mức email = 6 − tổng quantity của các đơn confirmed có cùng email và eventId. Cộng tất cả hạng vé, kể cả các đơn của tài khoản đặt khác; đơn cancelled không tính. Ví dụ email đã mua 2 vé General và 3 vé VIP thì chỉ được mua thêm 1 vé. Hủy đơn 2 vé sẽ trả lại 2 vé hạn mức. Đơn cũ vượt 6 vé vẫn được giữ lịch sử và email đó không được đặt thêm cho tới khi số vé còn hiệu lực giảm xuống dưới 6.

Checkout kiểm tra hạn mức ở bước kiểm tra đơn và đọc lại API ngay trước POST để tránh dùng số lượng đã cũ. `src/utils/booking.js` dùng trim/toLowerCase, filter và reduce để chuẩn hóa email, tính hạn mức và xác định chủ đơn; form vẫn dùng Formik/Yup và setFieldError, không thêm thư viện.

Thanh toán tại quầy giữ trạng thái pending. Thanh toán mô phỏng đặt trạng thái paid nhưng không thu tiền/không nhập thông tin ngân hàng. Khi hủy đơn mô phỏng đã paid, trạng thái chuyển refunded; đó không phải giao dịch hoàn tiền thật.

Số vé còn lại = capacity của hạng vé − tổng quantity của các đơn confirmed. App đọc lại dữ liệu trước POST để phát hiện thay đổi giá/tồn vé/hạn mức email. MockAPI không có transaction nên kiểm tra này không bảo đảm chống mua vượt tồn vé hoặc hạn mức khi nhiều máy gửi đồng thời. Không đổi slug `midnight-live-2026`, vì app dùng slug này để chọn record riêng trong resource events có thể chứa dữ liệu cũ.

## Nghệ sĩ trong lịch trình

Thêm/sửa tiết mục loại Biểu diễn hoặc Đặc biệt bằng cách chọn nghệ sĩ từ danh sách `concert.artists`. Danh sách được truyền qua props cho ScheduleForm và hiển thị bằng Form.Select của React Bootstrap. Bắt buộc chọn nghệ sĩ còn trong danh sách; nếu chưa có nghệ sĩ, hãy thêm ở tab Nghệ sĩ trước.

Mỗi tiết mục lưu `artistId` để liên kết và `performer` là tên hiển thị. Khi sửa tên nghệ sĩ, các tiết mục liên quan được cập nhật cùng một PUT events/:id. Không cho xóa nghệ sĩ đang được dùng trong lịch trình; cần đổi nghệ sĩ hoặc xóa các tiết mục liên quan trước. Loại Hoạt động vẫn nhập nội dung tự do, bắt buộc và tối đa 150 ký tự, ví dụ check-in hoặc MC giới thiệu; khi lưu loại này artistId là chuỗi rỗng.

Dữ liệu cũ chưa có artistId được đối chiếu theo tên nghệ sĩ khi mở sửa hoặc hiển thị. Nếu mô tả cũ không khớp nghệ sĩ nào, tên cũ vẫn hiện trên timeline; khi sửa, chọn nghệ sĩ có sẵn hoặc chuyển sang Hoạt động để giữ nội dung. `src/utils/schedule.js` dùng find để tìm nghệ sĩ theo ID/tên cũ; không thêm thư viện hay resource API.

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
