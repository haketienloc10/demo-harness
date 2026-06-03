Xây dựng MVP nhỏ cho web app chia tiền bill trà sữa từ ảnh.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- Không dùng database
- Không auth
- Không deploy
- Không làm lịch sử bill

Mục tiêu:
App cho phép user upload ảnh bill trà sữa, preview ảnh, bấm "Đọc bill", app đọc dữ liệu từ ảnh thành danh sách người/món/giá, sau đó tính tiền từng người.

Scope hiện tại:
- Làm flow từ upload ảnh trước.
- Nhưng API đọc ảnh ban đầu trả mock JSON, chưa cần AI thật.
- Sau khi UI + logic tính tiền ổn mới gắn AI thật.

Business rule:
- Ảnh bill có thông tin người nào đặt món nào và giá bao nhiêu.
- Bill có tổng ship và tổng giảm giá.
- Ship chia đều cho tất cả người.
- Giảm giá chia đều cho tất cả người.
- Công thức:
  itemTotal = sum(items.price)
  shippingShare = shippingFee / people.length
  discountShare = discountTotal / people.length
  finalTotal = itemTotal + shippingShare - discountShare

Data shape:

type BillPerson = {
  name: string
  items: {
    name: string
    price: number
  }[]
}

type ExtractBillResult = {
  people: BillPerson[]
  shippingFee: number
  discountTotal: number
  warnings: string[]
}

Implement theo từng story nhỏ, mỗi story phải kiểm chứng được.

Story 1: Upload ảnh + preview
- Tạo một màn hình chính.
- Có input chọn ảnh.
- Hiển thị preview ảnh đã chọn.
- Có button "Đọc bill".
- Chưa cần gọi AI thật.

Acceptance:
- Chọn ảnh .jpg/.png.
- Ảnh hiển thị preview đúng trên màn hình.

Story 2: Mock extract API
- Tạo route POST /api/extract-bill.
- Route nhận multipart/form-data có file ảnh.
- Tạm thời route chỉ trả mock JSON sau:

{
  "people": [
    {
      "name": "Lộc",
      "items": [
        {
          "name": "Trà sữa trân châu",
          "price": 50000
        }
      ]
    },
    {
      "name": "An",
      "items": [
        {
          "name": "Matcha latte",
          "price": 60000
        }
      ]
    }
  ],
  "shippingFee": 15000,
  "discountTotal": 20000,
  "warnings": []
}

Acceptance:
- Upload ảnh bất kỳ.
- Bấm "Đọc bill".
- Frontend gọi POST /api/extract-bill.
- UI nhận được mock data và render ra màn hình.

Story 3: Hiển thị danh sách bill đã đọc
- Render danh sách người.
- Mỗi người có danh sách món và giá.
- Hiển thị shippingFee.
- Hiển thị discountTotal.
- Hiển thị warnings nếu có.

UI tối thiểu:
- Người
- Món
- Giá
- Ship
- Giảm giá

Acceptance:
- Sau khi bấm "Đọc bill", màn hình hiển thị:
  - Lộc / Trà sữa trân châu / 50.000đ
  - An / Matcha latte / 60.000đ
  - Ship: 15.000đ
  - Giảm giá: 20.000đ

Story 4: Cho sửa dữ liệu
- Cho sửa tên người.
- Cho sửa tên món.
- Cho sửa giá món.
- Cho sửa shippingFee.
- Cho sửa discountTotal.
- Cho thêm người.
- Cho xóa người.
- Cho thêm món cho một người.
- Cho xóa món.

Acceptance:
- Sửa giá món của Lộc từ 50000 thành 55000.
- UI cập nhật lại dữ liệu ngay.
- Thêm người mới được.
- Thêm món mới cho người đó được.
- Xóa người/món được.

Story 5: Tách logic tính tiền
- Tạo file:
  src/lib/billing/calculate-split.ts

- Export function:
  calculateSplit(input)

Input:
{
  people: BillPerson[]
  shippingFee: number
  discountTotal: number
}

Output mỗi người:
{
  name: string
  itemTotal: number
  shippingShare: number
  discountShare: number
  finalTotal: number
}

Logic:
- itemTotal = tổng price của items
- shippingShare = shippingFee / số người
- discountShare = discountTotal / số người
- finalTotal = itemTotal + shippingShare - discountShare

Không được tính rải rác trong component. Component chỉ gọi calculateSplit.

Acceptance với data:
- Lộc: 50000
- An: 60000
- shippingFee: 15000
- discountTotal: 20000

Expected:
- Lộc:
  itemTotal = 50000
  shippingShare = 7500
  discountShare = 10000
  finalTotal = 47500

- An:
  itemTotal = 60000
  shippingShare = 7500
  discountShare = 10000
  finalTotal = 57500

Story 6: Hiển thị kết quả tính tiền
- Hiển thị cho mỗi người:
  - Tiền món
  - Ship chia đều
  - Giảm giá chia đều
  - Cần trả

- Hiển thị tổng kiểm tra:
  totalItems = tổng tiền món
  expectedTotal = totalItems + shippingFee - discountTotal
  totalCollected = sum(finalTotal)
  difference = totalCollected - expectedTotal

Acceptance:
Với mock data ban đầu, UI phải hiển thị:
- Tổng món: 110.000đ
- Ship: 15.000đ
- Giảm giá: 20.000đ
- Tổng cần thu: 105.000đ
- Tổng đã chia: 105.000đ
- Sai lệch: 0đ

Story 7: Copy kết quả
- Có button "Copy kết quả".
- Khi bấm, copy text summary vào clipboard.
- Sau khi copy, hiển thị trạng thái "Đã copy".

Format text:

🧾 Chia tiền trà sữa

Tổng món: 110.000đ
Ship: 15.000đ
Giảm giá: 20.000đ
Số người: 2

Mỗi người:
- Ship: +7.500đ
- Giảm giá: -10.000đ

Kết quả:
Lộc: 47.500đ
An: 57.500đ

Tổng thu: 105.000đ

Acceptance:
- Bấm copy.
- Paste ra Zalo/Slack/Telegram đọc rõ.
- Số tiền đúng với kết quả trên màn hình.

Story 8: Validate dữ liệu
- Dùng Zod để validate extracted data.
- Validate các rule:
  - people phải có ít nhất 1 người
  - name không được rỗng
  - mỗi người phải có ít nhất 1 món
  - tên món không được rỗng
  - price phải >= 0
  - shippingFee phải >= 0
  - discountTotal phải >= 0

- Hiển thị warning nếu dữ liệu không hợp lệ.
- Không cho copy kết quả nếu dữ liệu không hợp lệ.

Acceptance:
- Nếu xóa hết người, app báo lỗi.
- Nếu nhập price âm, app báo lỗi.
- Nếu shippingFee âm, app báo lỗi.
- Nếu discountTotal âm, app báo lỗi.
- Khi dữ liệu hợp lệ, app cho copy.

Story 9: Chuẩn bị abstraction để sau gắn AI thật
- Tạo file:
  src/lib/ai/extract-bill.ts

- Export function:
  extractBillFromImage(file: File): Promise<ExtractBillResult>

- Hiện tại function này gọi mock hoặc trả mock data.
- UI/API không được phụ thuộc trực tiếp vào mock hardcode trong component.
- Mục tiêu là sau này có thể đổi mock thành Gemini/OpenAI Vision mà ít sửa code.

Acceptance:
- Flow hiện tại vẫn chạy bằng mock.
- Code đã có chỗ rõ ràng để thay bằng AI thật sau.

Không làm trong scope này:
- Không database.
- Không auth.
- Không deploy.
- Không lưu lịch sử.
- Không QR chuyển khoản.
- Không tích hợp Zalo/Telegram.
- Không mobile native.
- Không gọi AI thật ở phase đầu.
- Không over-engineer state management.
- Không thêm router phức tạp.

Yêu cầu code:
- Code đơn giản, dễ đọc.
- Một màn hình là đủ.
- Tách component vừa đủ, không chia quá nhỏ.
- Format tiền VND dễ đọc.
- Có loading state khi bấm "Đọc bill".
- Có error state nếu API lỗi.
- Không hardcode business calculation trong JSX.
- Logic tính tiền phải nằm trong calculate-split.ts.