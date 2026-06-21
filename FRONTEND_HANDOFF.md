# Frontend Handoff - Website Ho Tro Dat Ve Xe

File nay dung de gui cho AI/frontend developer tiep tuc xay dung Passenger Flow dua tren backend hien tai.

## 1. Thu muc can luu y

Repo hien tai da tach thanh 2 phan:

```text
E:\LVTN\CODE\Website_HoTroDatVeXe-master
  backend/
  frontend/
```

Backend:

```text
E:\LVTN\CODE\Website_HoTroDatVeXe-master\backend
```

Frontend:

```text
E:\LVTN\CODE\Website_HoTroDatVeXe-master\frontend
```

Neu tiep tuc frontend, hay code trong `frontend/`. Khong code tiep trong thu muc scratch.

## 2. Backend response format

Tat ca API tra ve theo format:

Success:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "...",
  "errors": {}
}
```

Frontend can check ca HTTP status va field `success`.

## 3. API Passenger Flow hien co

### Locations

```text
GET /api/locations
```

Response:

```ts
{
  success: true;
  message?: string;
  data: {
    locations: Array<{
      id: number;
      name: string;
      province: string;
      address: string | null;
    }>;
  };
}
```

### Search trips

```text
GET /api/trips?departureLocationId=1&destinationLocationId=3&date=2026-06-21
```

`date` dung format:

```text
YYYY-MM-DD
```

Response item quan trong:

```ts
{
  id: number;
  departureTime: string;
  arrivalTime: string | null;
  priceVnd: number;
  status: "scheduled" | "departed" | "completed" | "cancelled";
  availableSeatCount: number;
  totalSeatCount: number;
  route: {
    id: number;
    distanceKm: string | number | null;
    estimatedMinutes: number | null;
    departureLocation: {
      id: number;
      name: string;
      province: string;
    };
    destinationLocation: {
      id: number;
      name: string;
      province: string;
    };
  };
  vehicle: {
    id: number;
    name: string;
    vehicleType: string;
    capacity: number;
    busCompany: {
      id: number;
      name: string;
      phone: string | null;
    };
  };
}
```

Luu y: backend tra `availableSeatCount`, khong phai `availableSeats`.

### Trip seats

```text
GET /api/trips/[id]/seats
```

Response:

```ts
{
  success: true;
  message?: string;
  data: {
    trip: {
      id: number;
      departureTime: string;
      arrivalTime: string | null;
      priceVnd: number;
      status: string;
      route: object;
      vehicle: object;
    };
    seats: Array<{
      id: number;
      seatCode: string;
      seatType: "standard" | "sleeper" | "vip";
      floor: number;
      rowNumber: number | null;
      colNumber: number | null;
      isAvailable: boolean;
      bookingStatus: "pending" | "confirmed" | null;
    }>;
    availableSeatCount: number;
    totalSeatCount: number;
  };
}
```

Luu y quan trong:

```ts
seat.isAvailable
```

Dung field nay de enable/disable ghe.

Khong dung:

```ts
seat.isBooked
seat.isActive
```

Backend passenger seats API khong tra 2 field do.

### Create booking

```text
POST /api/bookings
```

Body:

```json
{
  "tripId": 6,
  "seatIds": [4, 5],
  "passengerName": "Nguyen Van A",
  "passengerPhone": "0945678912",
  "passengerEmail": "nguyenvana@example.com"
}
```

Luu y: backend dung `seatIds: number[]`, cho phep dat nhieu ghe trong mot booking. UI hien tai gioi han toi da 6 ghe/lượt dat.

Response:

```ts
{
  success: true;
  message: string;
  data: {
    booking: {
      id: number;
      bookingCode: string;
      passengerName: string;
      passengerPhone: string;
      passengerEmail: string | null;
      totalFareVnd: number;
      status: "pending";
      expiresAt: string | null;
      confirmedAt: string | null;
      cancelledAt: string | null;
      createdAt: string;
      updatedAt: string;
      bookingSeats: Array<{
        id: number;
        fareVnd: number;
        trip: object;
        seat: object;
        ticket: null;
      }>;
    };
  };
}
```

Luu y: lay booking code bang:

```ts
res.data.booking.bookingCode
```

Khong dung:

```ts
res.data.bookingCode
```

### Get booking by bookingCode

```text
GET /api/bookings/[bookingCode]
```

Response:

```ts
{
  success: true;
  message?: string;
  data: {
    booking: {
      id: number;
      bookingCode: string;
      passengerName: string;
      passengerPhone: string;
      passengerEmail: string | null;
      totalFareVnd: number;
      status: "pending" | "confirmed" | "cancelled" | "expired";
      expiresAt: string | null;
      confirmedAt: string | null;
      cancelledAt: string | null;
      createdAt: string;
      updatedAt: string;
      bookingSeats: Array<{
        id: number;
        fareVnd: number;
        trip: object;
        seat: object;
        ticket: {
          id: number;
          code: string;
          qrCode: string | null;
          status: "valid" | "used" | "cancelled";
          issuedAt: string;
          usedAt: string | null;
        } | null;
      }>;
    };
  };
}
```

Luu y: set state booking bang:

```ts
setBooking(res.data.booking)
```

Khong dung:

```ts
setBooking(res.data)
```

### Get my bookings

```text
GET /api/bookings/me
```

Yeu cau dang nhap bang cookie `auth_token` hoac Bearer token:

```text
Authorization: Bearer TOKEN
```

Response:

```ts
{
  success: true;
  message?: string;
  data: {
    bookings: BookingDetail[];
  };
}
```

`BookingDetail` dung cung shape voi `GET /api/bookings/[bookingCode]`, gom:

```ts
bookingCode
totalFareVnd
status
bookingSeats[]
```

Dung endpoint nay cho trang "Ve cua toi" cua passenger.

### Confirm booking

```text
POST /api/bookings/[bookingCode]/confirm
```

Backend hien dang dung endpoint nay de gia lap thanh toan va tao ticket.

### Cancel booking

```text
POST /api/bookings/[bookingCode]/cancel
```

### Get ticket by ticket code

```text
GET /api/tickets/[code]
```

Dung de tra cuu ve bang ma ticket `TK...`.

## 4. Auth API

### Login

```text
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@datvexe.local",
  "password": "123456"
}
```

Response:

```ts
{
  success: true;
  data: {
    user: object;
    token: string;
  };
}
```

Backend ho tro Bearer token:

```text
Authorization: Bearer TOKEN
```

Va cookie `auth_token`.

Passenger booking khong bat buoc login. Neu co token thi booking duoc gan `userId`, neu khong co van dat duoc.

### Get current user

```text
GET /api/auth/me
```

Frontend can goi endpoint nay khi app load de khoi phuc session tu cookie `auth_token`.

### Logout

```text
POST /api/auth/logout
```

Backend se clear cookie `auth_token`. Khong xoa cookie nay bang JavaScript vi cookie duoc set `HttpOnly`.

## 5. Admin API hien co

Tat ca admin API can Bearer token cua user role `admin`.

```text
GET/POST /api/admin/locations
GET/POST /api/admin/routes
PATCH    /api/admin/routes/[id]

GET/POST /api/admin/bus-companies
GET/POST /api/admin/vehicles
PATCH    /api/admin/vehicles/[id]
GET/POST /api/admin/vehicles/[id]/seats

GET/POST /api/admin/trips
PATCH    /api/admin/trips/[id]
```

Admin seed:

```text
admin@datvexe.local
123456
```

## 6. Cac loi frontend can tranh

Frontend hien tai trong `frontend/` da bam dung contract backend. Neu sua hoac dung AI khac code tiep, can tranh cac loi sau.

### Loi 1: sai field ghe

File:

```text
src/services/tripService.ts
src/app/trips/[id]/page.tsx
```

Dang sai:

```ts
isBooked
isActive
```

Can dung:

```ts
isAvailable
bookingStatus
```

Vi du:

```tsx
disabled={!seat.isAvailable}
```

### Loi 2: sai field so ghe trong

File:

```text
src/app/trips/page.tsx
```

Dang sai:

```ts
trip.availableSeats
```

Can dung:

```ts
trip.availableSeatCount
```

### Loi 3: sai shape create booking response

File:

```text
src/services/bookingService.ts
src/app/checkout/page.tsx
```

Dang sai:

```ts
res.data.bookingCode
```

Can dung:

```ts
res.data.booking.bookingCode
```

### Loi 4: sai shape get booking response

File:

```text
src/services/bookingService.ts
src/app/tickets/lookup/page.tsx
```

Dang sai:

```ts
setBooking(res.data)
```

Can dung:

```ts
setBooking(res.data.booking)
```

### Loi 5: sai shape booking nhieu ghe

Backend khong con tra truc tiep:

```ts
booking.trip
booking.seat
booking.ticket
booking.fareVnd
```

Can dung:

```ts
booking.bookingSeats[0].trip
booking.bookingSeats[0].seat
booking.bookingSeats[0].ticket
booking.totalFareVnd
```

Moi ghe co mot `bookingSeat` va sau confirm moi co mot `ticket` rieng.

## 7. Goi y types frontend

Nen tao type rieng theo API response thay vi extend truc tiep Prisma model, vi API response da duoc select/map lai.

Vi du:

```ts
export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  errors?: unknown;
};

export type TripSearchItem = {
  id: number;
  departureTime: string;
  arrivalTime: string | null;
  priceVnd: number;
  status: string;
  availableSeatCount: number;
  totalSeatCount: number;
  route: {
    id: number;
    estimatedMinutes: number | null;
    departureLocation: {
      id: number;
      name: string;
      province: string;
    };
    destinationLocation: {
      id: number;
      name: string;
      province: string;
    };
  };
  vehicle: {
    id: number;
    name: string;
    vehicleType: string;
    capacity: number;
    busCompany: {
      id: number;
      name: string;
      phone: string | null;
    };
  };
};
```

## 8. Luu y UX/luong nghiep vu

- Booking moi tao co status `pending`.
- Backend chua co payment that.
- Nut "Xac nhan thanh toan" nen goi:

```text
POST /api/bookings/[bookingCode]/confirm
```

- Sau confirm moi co `ticket`.
- Neu chi tao booking xong ma khong confirm, trang lookup se thay status `pending` va `ticket: null`.
- Co the dat ve khong can dang nhap.
- Login chi can neu sau nay lam "Ve cua toi".

## 9. Lenh test sau khi chay rieng backend/frontend

Backend:

```text
E:\LVTN\CODE\Website_HoTroDatVeXe-master\backend
```

Chay:

```bash
npm install
npx prisma generate
npm run build
npm run dev
```

Frontend:

```text
E:\LVTN\CODE\Website_HoTroDatVeXe-master\frontend
```

Chay:

```bash
npm install
npm run build
npm run dev
```

Backend mac dinh o `http://localhost:3000`. Frontend mac dinh o `http://localhost:3001`.

Neu build bi OOM do may dang chay ung dung nang, tat bot app/game roi chay lai.

## 10. Checklist test passenger flow

1. Mo trang chu `/`.
2. Chon diem di/den va ngay co chuyen seed, vi du:

```text
departureLocationId=1
destinationLocationId=3
date=2026-06-21
```

3. Vao `/trips`, thay danh sach chuyen.
4. Bam chon ghe, vao `/trips/[id]`.
5. Chon mot hoac nhieu ghe co `isAvailable: true`.
6. Submit checkout.
7. Redirect sang `/tickets/lookup?bookingCode=BK...`.
8. Trang lookup lay booking bang:

```text
GET /api/bookings/[bookingCode]
```

9. Neu muon co ticket, UI can co nut confirm goi:

```text
POST /api/bookings/[bookingCode]/confirm
```

10. Sau confirm, moi item trong `booking.bookingSeats` se co `ticket.code`.
