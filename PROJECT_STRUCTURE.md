# Project structure

Du an hien tai duoc tach thanh 2 phan ro rang:

```txt
Website_HoTroDatVeXe-master/
  backend/
  frontend/
```

## Backend

Backend nam trong `backend/` va dung Next.js Route Handlers cho API.

```txt
backend/
  src/
    app/api/               # Router layer: route.ts chi export controller
    modules/
      auth/
        auth.controller.ts # Controller: nhan request, validate, tra response
        auth.service.ts    # Service: nghiep vu dang ky/dang nhap
        auth.validator.ts  # Validator: Zod schema
      bookings/
      trips/
      locations/
      tickets/
      admin/
    lib/                   # Shared helpers: prisma, auth, response, errors
  prisma/
    schema.prisma          # Model/database schema
  package.json
```

Mo hinh dung de trinh bay trong luan van:

- Model: `backend/prisma/schema.prisma` va Prisma Client.
- Controller: cac file `backend/src/modules/**/*.controller.ts`.
- Service: cac file `backend/src/modules/**/*.service.ts`.
- Router: cac file `backend/src/app/api/**/route.ts`.
- Validator: cac file `backend/src/modules/**/*.validator.ts`.

Chay backend:

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Backend mac dinh chay tai `http://localhost:3000`.

Luu y: frontend proxy `/api/*` ve `http://localhost:3000`, nen khi test UI can dam bao backend dang chay dung port 3000.

## Frontend

Frontend nam trong `frontend/`.

```txt
frontend/
  src/app/                 # Pages: tim chuyen, chon ghe, checkout, tra cuu ve
  src/components/          # Layout components
  src/services/            # API client va services goi backend
  src/lib/                 # Helper format
  package.json
```

Frontend goi API bang duong dan `/api/...`. File `frontend/next.config.mjs` proxy request ve backend:

```txt
frontend http://localhost:3001/api/* -> backend http://localhost:3000/api/*
```

Chay frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend mac dinh chay tai `http://localhost:3001`.

## Cach chay khi lam viec

Mo 2 terminal rieng:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```
