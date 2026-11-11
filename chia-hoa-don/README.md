# Chia Hoá Đơn

App React Native (Expo) chia hoá đơn + tạo ảnh VietQR để bạn bè quét là trả.

## Tính năng
- **2 kiểu chia**: theo món (chọn ai ăn món nào) hoặc chia đều tổng tiền
- VAT, tip theo %, làm tròn lên 1.000đ
- **Quản lý tài khoản nhận tiền** (nhiều tài khoản, đặt mặc định)
- **Chia sẻ hoá đơn**: ảnh PNG có VietQR (đã nhúng sẵn số tiền + nội dung), tên chủ TK, số TK, ngân hàng
- Dữ liệu lưu local (AsyncStorage)

## Chạy
```bash
npm install
npx expo install --fix   # căn lại version package cho đúng SDK
npx expo start
```

## Cấu trúc
- `src/vietqr.js` – sinh chuỗi VietQR (EMVCo/NAPAS) + CRC16, hoàn toàn offline
- `src/banks.js` – danh sách ngân hàng + mã BIN (bổ sung từ https://api.vietqr.io/v2/banks)
- `src/split.js` – logic chia tiền
- `src/components/BillCard.js` – thẻ hoá đơn được chụp thành ảnh
- `src/screens/` – màn Chia tiền, màn Tài khoản

## Lưu ý
Nên test thật: tạo QR với tài khoản của mình, quét bằng app ngân hàng và kiểm tra số tiền/tên có tự điền đúng không.

## Build IPA unsigned bằng GitHub Actions
Workflow: `.github/workflows/build-ios-unsigned.yml`

1. Đổi `ios.bundleIdentifier` trong `app.json` thành ID của bạn.
2. Chạy `npm install` local và commit `package-lock.json`.
3. Push lên GitHub → tab **Actions** → **Build iOS (unsigned IPA)** → **Run workflow** (hoặc push tag `v1.0.0`).
4. Build xong tải artifact `*-unsigned-ipa` ở cuối trang run, giải nén ra file `.ipa` rồi tự ký (Sideloadly, AltStore, ...).

Build lỗi thì tải artifact `xcodebuild-log` để xem chi tiết.
