# Website Ho Tro Dat Ve Xe

Du an duoc tach thanh 2 ung dung rieng:

```txt
Website_HoTroDatVeXe-master/
  backend/
  frontend/
```

## Backend

Backend nam trong `backend/`, dung Next.js Route Handlers, Prisma MySQL, JWT, bcrypt va Zod.

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Backend chay tai:

```txt
http://localhost:3000
```

Frontend proxy `/api/*` ve backend port 3000, nen hay chay backend truoc khi test frontend.

## Frontend

Frontend nam trong `frontend/`, dung Next.js App Router va goi backend qua proxy `/api`.

```bash
cd frontend
npm install
npm run dev
```

Frontend chay tai:

```txt
http://localhost:3001
```

## Ghi chu

- `backend/src/app/api/**/route.ts`: router layer.
- `backend/src/modules/**/*.controller.ts`: controller layer.
- `backend/src/modules/**/*.service.ts`: service layer.
- `backend/prisma/schema.prisma`: model/database schema.
- `frontend/src/services`: API client va services cho UI.
