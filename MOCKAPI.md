# Thiết lập MockAPI cho ConcertManagement

Ứng dụng dùng đúng hai resource `events` và `bookings` như project trong ảnh của bạn. URL gốc chỉ đặt trong `.env`; các file service đọc bằng `import.meta.env.VITE_API_URL` và gọi bằng Axios.

## 1. Cấu hình URL

Tại thư mục chứa `package.json`, tạo `.env` bằng cách sao chép `.env.example`:

```env
VITE_API_URL=https://6ae3f150933120ae20f95313.mockapi.io
```

Không thêm `/events`, `/bookings` hoặc `/:endpoint` vào cuối URL. Khởi động lại `npm run dev` sau khi thay `.env`. Nếu bạn tạo project MockAPI khác, chỉ thay URL gốc này.

Không cần xóa dữ liệu EventHub cũ. App mới tìm concert qua `slug = midnight-live-2026`, và lọc đơn theo ID của concert đó. Nếu dùng cùng project, EventHub cũ có thể thấy thêm record concert mới trong danh sách events. Muốn tách hoàn toàn hai bài thì dùng project MockAPI riêng và thay `.env` của bài mới.

## 2. Resource events

Tên chính xác: **events**. Giữ `id` mặc định kiểu **Object ID**. Không đổi tên id thành eventId, không tự gửi id trong POST.

Các field cũ như category, price, capacity tiếp tục được giữ. Bổ sung các field còn thiếu:

| Field       | Kiểu                          |
| ----------- | ----------------------------- |
| id          | Object ID — mặc định, tự sinh |
| slug        | String                        |
| title       | String                        |
| subtitle    | String                        |
| description | String                        |
| image       | String                        |
| category    | String                        |
| startAt     | String                        |
| endAt       | String                        |
| location    | String                        |
| price       | Number                        |
| capacity    | Number                        |
| artists     | Array                         |
| schedule    | Array                         |
| ticketTypes | Array                         |

Lưu schema bằng **Update**. Ba field cuối phải lưu **mảng thật**, không phải chuỗi chứa JSON. Nghệ sĩ, lịch trình và hạng vé nằm trong record concert để chỉ cần hai resource. Các ID bên trong các mảng là khóa nội bộ của giao diện, khác `id` tự sinh ở cấp record MockAPI.

## 3. Resource bookings

Tên chính xác: **bookings**. Để resource độc lập, không lồng trong events. Dùng các field sau; giữ lại field cũ nếu đã có:

| Field         | Kiểu                          |
| ------------- | ----------------------------- |
| id            | Object ID — mặc định, tự sinh |
| eventId       | String                        |
| eventTitle    | String                        |
| eventStartAt  | String                        |
| eventLocation | String                        |
| ticketTypeId  | String                        |
| ticketName    | String                        |
| fullName      | String                        |
| email         | String                        |
| accountEmail  | String                        |
| phone         | String                        |
| paymentMethod | String                        |
| paymentStatus | String                        |
| status        | String                        |
| createdAt     | String                        |
| unitPrice     | Number                        |
| quantity      | Number                        |
| totalPrice    | Number                        |

Không cần nhấn Generate để sinh đơn ngẫu nhiên. Form mua vé sẽ POST đơn thật của bài. Các đơn cũ được giữ lại và app chỉ chọn đơn có eventId trùng concert đang dùng.

**Cập nhật email đăng ký vé:** thêm field **accountEmail**, kiểu **String**, vào schema bookings rồi nhấn Update. Không đổi tên field email đang có. Không cần khởi tạo lại concert.

- `email`: email đăng ký vé, nhập tùy chọn trong form. Mỗi email có tối đa 6 vé còn hiệu lực cho concert, cộng mọi hạng vé/lần đặt và bỏ các đơn đã hủy. App chuẩn hóa khoảng trắng ngoài và chữ hoa/thường.
- `accountEmail`: email tài khoản đã đăng nhập, do code tự gửi khi POST. Dùng để xem và hủy đơn trong Vé của tôi dù email đăng ký vé khác tài khoản. Admin xem và tìm kiếm theo cả hai email.
- Đơn cũ chưa có accountEmail hợp lệ vẫn dùng email cũ để xác định chủ đơn. Nếu sửa dữ liệu cũ thủ công, đặt accountEmail bằng tài khoản đã đặt, ví dụ user@concert.test; không thay email đăng ký vé để chuyển chủ đơn.
- App chưa gửi thư/vé qua email; hai field trên là dữ liệu lưu trên MockAPI.

## 4. Nạp toàn bộ dữ liệu mẫu bằng giao diện

Sau khi có đúng hai resource và lưu schema:

1. Chạy project bằng `npm run dev`.
2. Mở `/login`, dùng `admin@concert.test` / `Admin123!`.
3. Trang `/admin` hiện phần **Thiết lập chương trình**.
4. Nhấn **Khởi tạo dữ liệu mẫu** một lần.
5. App kiểm tra concert đã tồn tại chưa, rồi POST record mới vào `/events` nếu cần. MockAPI tự sinh ID.
6. Mở trang chủ: bạn sẽ thấy Midnight Live, countdown, 4 nghệ sĩ, 8 mục lịch trình và 3 hạng vé.

Chỉ thêm field trong schema chưa tạo ra concert. Các record có giá trị như `title 1`, `slug 1`, `artists: []` là dữ liệu sinh ngẫu nhiên; app tìm riêng record có `slug` đúng `midnight-live-2026`. Nếu các trang cùng hiện **Chưa có chương trình được công bố**, hãy đăng nhập admin rồi nhấn **Khởi tạo dữ liệu mẫu**. Admin cũng có thể khởi tạo ngay tại màn hình này. Nút **Kiểm tra lại chương trình** giúp user đọc lại dữ liệu sau khi admin khởi tạo ở tab hoặc máy khác.

Tên field ngày kết thúc phải chính xác là **endAt** (String), không phải `endate` hoặc `endDate`.

Code không tự thay dữ liệu lỗi bằng dữ liệu local. Dữ liệu chỉ được gửi khi admin nhấn nút khởi tạo. Khi mở các trang, app đọc dữ liệu từ API.

## 5. File JSON có sẵn

- `mockapi/concert.json`: object concert đầy đủ, gồm nghệ sĩ, lịch trình và hạng vé; không có id để MockAPI tự sinh khi POST.
- `mockapi/booking-example.json`: ví dụ payload đặt vé để bạn đọc/review; thay eventId bằng ID concert thực tế nếu thử gửi thủ công.

Cách khuyến nghị là nhấn nút khởi tạo trong app. Nếu nhập qua bảng Data của MockAPI, hãy sao lưu trước và giữ nguyên các record cũ: nút Update trong bảng Data có thể thay cả mảng dữ liệu resource. File concert.json là một object, không phải toàn bộ mảng events để ghi đè.

## 6. Kiểm tra và xử lý lỗi

- GET `URL_GỐC/events` phải trả mảng. Record concert có slug midnight-live-2026 và ba mảng artists/schedule/ticketTypes.
- GET `URL_GỐC/bookings` phải trả mảng; mảng rỗng cũng hợp lệ.
- Nếu lỗi 404: kiểm tra tên resource và URL gốc.
- Nếu thấy thiếu ID: giữ trường mặc định `id` kiểu Object ID, không tự thêm id String thay thế.
- Nếu báo artists/schedule/ticketTypes không phải mảng: kiểm tra schema và dữ liệu thực tế; đừng đặt giá trị thành chuỗi `"[...]"`.
- Nếu URL mới chưa có hiệu lực: dừng Vite bằng Ctrl+C và chạy lại.
- Ảnh `/images/...` nằm sẵn trong public của repo, nên không cần tải ảnh lên MockAPI.

Mua vé dùng POST bookings; hủy dùng PUT đổi status cancelled. Thêm/sửa/xóa nghệ sĩ, tiết mục và hạng vé dùng PUT record events chứa mảng đã cập nhật. Xóa toàn bộ concert dùng DELETE events/:id và chỉ cho phép nếu concert chưa có đơn.
