# Huong dan demo bao cao tien do

Thoi luong goi y: 3-5 phut.

## 1. Tai khoan test

Admin:

```text
Email: admin@datvexe.local
Password: 123456
```

Passenger demo:

```text
Email: passenger.demo@datvexe.local
Password: 123456
```

## 2. Du lieu demo nen dung

Ngay demo:

```text
29/06/2026
```

Tuyen demo:

```text
Ben xe Mien Dong -> Ben xe Da Lat
```

Backend:

```text
http://localhost:3000
```

Frontend:

```text
http://localhost:3001
```

Admin:

```text
http://localhost:3001/admin
```

## 3. Kich ban demo 3-5 phut

### Buoc 1: Dang nhap admin

Mo:

```text
http://localhost:3001/login
```

Dang nhap bang tai khoan admin:

```text
admin@datvexe.local
123456
```

Noi:

```text
Day la khu vuc quan tri danh cho admin. Admin co the xem du lieu dat ve, quan ly chuyen xe va theo doi trang thai booking.
```

### Buoc 2: Xem quan ly chuyen xe

Mo:

```text
http://localhost:3001/admin/trips
```

Noi:

```text
Man hinh nay hien thi danh sach chuyen xe, bao gom tuyen duong, xe, gio khoi hanh, gia ve, so ve da ban va trang thai chuyen.
```

Chi vao chuyen ngay `29/06/2026`, tuyen:

```text
Ben xe Mien Dong -> Ben xe Da Lat
```

### Buoc 3: Xem quan ly booking

Mo:

```text
http://localhost:3001/admin/bookings
```

Noi:

```text
Admin co the xem danh sach booking theo trang thai nhu cho thanh toan, da thanh toan, da huy. He thong da co mot so booking mau de kiem thu.
```

### Buoc 4: Chuyen sang flow hanh khach

Co the logout admin hoac mo tab an danh moi.

Mo:

```text
http://localhost:3001
```

Tim chuyen:

```text
Diem di: Ben xe Mien Dong
Diem den: Ben xe Da Lat
Ngay di: 29/06/2026
```

Noi:

```text
Hanh khach nhap diem di, diem den va ngay khoi hanh. He thong goi API tim chuyen phu hop tu backend.
```

### Buoc 5: Chon chuyen va chon nhieu ghe

O danh sach chuyen, chon mot chuyen con ghe.

Chon nhieu ghe, vi du:

```text
A06, A07
```

Noi:

```text
He thong ho tro chon nhieu ghe trong mot lan dat. Cac ghe da dat hoac khong kha dung se bi khoa.
```

### Buoc 6: Checkout va tao booking

Nhap thong tin hanh khach:

```text
Ho ten: Nguyen Van Bao Cao
So dien thoai: 0901234567
Email: demo.baocao@example.com
```

Noi:

```text
O buoc nay hanh khach xac nhan thong tin lien he. Backend se tao mot booking gom nhieu booking seat.
```

Bam thanh toan/tao booking.

### Buoc 7: Xac nhan thanh toan va phat hanh ve

Sau khi sang trang tra cuu booking, noi:

```text
Booking vua tao dang o trang thai cho thanh toan. Vi he thong dang mo phong thanh toan, nut xac nhan thanh toan se goi API confirm booking.
```

Bam xac nhan thanh toan.

Noi:

```text
Sau khi thanh toan thanh cong, booking chuyen sang trang thai da thanh toan va he thong phat hanh ma ve rieng cho tung ghe.
```

### Buoc 8: Quay lai admin kiem tra booking moi

Mo:

```text
http://localhost:3001/admin/bookings
```

Bam lam moi neu can.

Noi:

```text
Booking moi da xuat hien trong danh sach quan tri. Admin co the kiem tra thong tin khach hang, tuyen xe, so ghe, tong tien va trang thai thanh toan.
```

## 4. Cau chot demo

```text
Nhu vay he thong da hoan thanh luong chinh: admin quan ly chuyen xe, hanh khach tim chuyen, chon nhieu ghe, dat ve, thanh toan mo phong, phat hanh ve va admin theo doi booking moi.
```

## 5. Neu can seed lai du lieu

Chay WAMP/MySQL truoc, sau do chay:

```bash
cd backend
npm run prisma:seed
```

