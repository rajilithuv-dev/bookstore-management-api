# Bookstore Management REST API

A locally runnable REST API using Node.js, Express, MongoDB, Mongoose, JWT authentication, role-based authorization, request validation, middleware, and centralized error handling.

## 1. Requirements

- Node.js LTS (Node 20 or 22 recommended)
- VS Code
- MongoDB running locally, or MongoDB Atlas connection string
- Postman

## 2. Open the project in VS Code

1. Extract `bookstore-management-api.zip`.
2. In VS Code choose **File → Open Folder**.
3. Select the extracted `bookstore-management-api` folder.
4. Open **Terminal → New Terminal**.

## 3. Install packages

Run in the VS Code terminal, from the project root:

```bash
npm install
```

## 4. Configure environment

Copy `.env.example` and name the copy `.env`.

In PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env`. For local MongoDB, keep:

```env
MONGO_URI=mongodb://127.0.0.1:27017/bookstore_db
```

Change `JWT_SECRET` to a long random private string. Set an admin password you will remember. Do not share or commit `.env`.

## 5. Start MongoDB

If MongoDB Community Server is installed, start its Windows service (if it is not already running), then continue.

Alternative: if Docker Desktop is installed and running, start MongoDB with:

```bash
docker run -d --name bookstore-mongo -p 27017:27017 -v bookstore_mongo_data:/data/db mongo:8
```

If a container named `bookstore-mongo` already exists, start it with:

```bash
docker start bookstore-mongo
```

## 6. Create the admin user

Run once:

```bash
npm run seed:admin
```

The default email is `admin@bookstore.com`; the password is the `ADMIN_PASSWORD` value in `.env`. Change it before use.

## 7. Start the API

```bash
npm run dev
```

Expected terminal messages:

```text
MongoDB connected successfully
Bookstore API running at http://localhost:5000
Health check: http://localhost:5000/api/health
```

Open `http://localhost:5000/api/health` in a browser. You should see:

```json
{
  "success": true,
  "message": "Bookstore API is healthy"
}
```

## 8. Postman testing

Base URL: `http://localhost:5000`

### A. Health check

- Method: GET
- URL: `http://localhost:5000/api/health`

### B. Register a normal user

- Method: POST
- URL: `http://localhost:5000/api/auth/register`
- Body → raw → JSON:

```json
{
  "name": "Raji",
  "email": "raji@example.com",
  "password": "Raji@12345"
}
```

A token is returned. Public registration always creates role `user`; sending `"role":"admin"` is ignored.

### C. Login as admin

- Method: POST
- URL: `http://localhost:5000/api/auth/login`
- Body → raw → JSON:

```json
{
  "email": "admin@bookstore.com",
  "password": "UseThePasswordFromYourEnvFile"
}
```

Copy `data.token` from the response.

For protected requests, choose **Authorization → Bearer Token** in Postman and paste the token. Use the admin token for book create/update/delete.

### D. Get current user

- Method: GET
- URL: `http://localhost:5000/api/auth/me`
- Authorization: Bearer Token (user or admin token)

### E. Create a book (admin only)

- Method: POST
- URL: `http://localhost:5000/api/books`
- Authorization: Bearer Token (admin token)
- Body → raw → JSON:

```json
{
  "title": "The Alchemist",
  "author": "Paulo Coelho",
  "description": "A novel about following a dream.",
  "category": "Fiction",
  "price": 299,
  "stock": 25,
  "isbn": "9780061122415"
}
```

Copy the `_id` from the response for the next requests.

### F. List books (public)

- Method: GET
- URL: `http://localhost:5000/api/books`

Optional search and pagination:

`http://localhost:5000/api/books?search=alchemist&page=1&limit=10`

Filter category:

`http://localhost:5000/api/books?category=fiction`

### G. Get one book (public)

- Method: GET
- URL: `http://localhost:5000/api/books/BOOK_ID_HERE`

Replace `BOOK_ID_HERE` with the real `_id`.

### H. Update a book (admin only)

- Method: PUT
- URL: `http://localhost:5000/api/books/BOOK_ID_HERE`
- Authorization: Bearer Token (admin token)
- Body → raw → JSON (send the fields to update):

```json
{
  "title": "The Alchemist - Updated",
  "author": "Paulo Coelho",
  "category": "Fiction",
  "price": 349,
  "stock": 20
}
```

### I. Delete a book (admin only)

- Method: DELETE
- URL: `http://localhost:5000/api/books/BOOK_ID_HERE`
- Authorization: Bearer Token (admin token)

## 9. Role-based access test

1. Register and log in as a normal user.
2. Try `POST /api/books` with the normal user's token.
3. Expected response: HTTP `403 Forbidden`.
4. Log in as admin and repeat. It should create the book.

## 10. Error tests

- Missing/invalid token on `GET /api/auth/me`: HTTP 401.
- Expired token: HTTP 401 with `Token expired`.
- Normal user tries admin-only book management: HTTP 403.
- Invalid email or short password on registration: HTTP 400.
- Unknown route: HTTP 404.
- Duplicate email or ISBN: HTTP 409.

## 11. API route summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Logged-in | Current user |
| GET | `/api/books` | Public | List/search books |
| GET | `/api/books/:id` | Public | Get one book |
| POST | `/api/books` | Admin | Add book |
| PUT | `/api/books/:id` | Admin | Update book |
| DELETE | `/api/books/:id` | Admin | Delete book |

## 12. Project structure

```text
bookstore-management-api/
├── server.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── scripts/
│   └── seedAdmin.js
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   └── Book.js
    ├── controllers/
    │   ├── authController.js
    │   └── bookController.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── roleMiddleware.js
    │   ├── validateMiddleware.js
    │   └── errorMiddleware.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── bookRoutes.js
    └── utils/
        ├── asyncHandler.js
        └── generateToken.js
```

## Architecture

Postman → Express routes → Controllers → Middleware (JWT / RBAC / validation / centralized errors) → Mongoose models → MongoDB (`users` and `books` collections).

The `users` collection stores registered users and admins. The `books` collection stores catalog entries.
