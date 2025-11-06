# COMP S381F Library Management System

A minimal Express + MongoDB (Mongoose) app for the COMP S381F group project.

## 1. Project Info
- **Course**: COMP S381F(Autumn 2025)
- **Topic**: Library Management (Books & Loans)
- **Group**: Group 10  
- **Members**: SHEN Qiwen (13673791), Lau Tak Hing (13694497), ...
- **Repo**: https://github.com/PETERSHEN0327/comps381f-library
- **Cloud URL**: https://comps381f-library.onrender.com
## 2. Project Structure
comps381f-library/
├─ server.js # app entry
├─ package.json # dependencies & scripts
├─ .env # env vars (MONGODB_URI, SESSION_SECRET, PORT)
├─ public/ # static files (optional)
├─ models/ # Mongoose schemas
│ ├─ Book.js
│ ├─ Loan.js
│ └─ User.js
└─ views/ # EJS templates
├─ login.ejs
├─ books/
│ ├─ list.ejs
│ ├─ create.ejs
│ ├─ edit.ejs
│ └─ details.ejs
└─ loans/
├─ list.ejs
└─ create.ejs

## 3. Tech Stack (per course requirement)
- **Express.js** (web framework)
- **MongoDB / Mongoose** (database & schema)
- **EJS** (web UI)
- **Session** (login/logout)
- **Nodemon** (dev)

## 4. Getting Started (Local)
### 4.1 Prerequisites
- Node.js ≥ 18, npm
- MongoDB (local or Atlas connection string)

### 4.2 Env Vars (`.env`)
MONGODB_URI=mongodb+srv://admin:Sqw20020327@cluster0.4u5v6.mongodb.net/librarydb?retryWrites=true&w=majority&appName=Cluster0
SESSION_SECRET=mysecretkey
PORT=8099

### 4.3 Install & Run
```bash
npm install
npm run dev
# open http://localhost:8099
node -e "require('dotenv').config();const m=require('mongoose');const U=require('./models/User');m.connect(process.env.MONGODB_URI).then(async()=>{await U.create({username:'admin',password:'123456'});console.log('seed ok');process.exit();});"
5. Features (MVP)

Login/Logout (session-based)

Books CRUD web pages (Create / Read / Update / Delete)

Loans basic pages (Create loan, list loans; copies decrement)

RESTful APIs for Books (no auth, for demo)

6. RESTful API (demo)
Base URL: http://localhost:8099
GET /api/books – list books
POST /api/books – create a book
PUT /api/books/:id – update a book
DELETE /api/books/:id – delete a book
cURL samples
curl -X GET http://localhost:8099/api/books

curl -X POST http://localhost:8099/api/books \
  -H "Content-Type: application/json" \
  -d '{"isbn":"9780000000001","title":"Algorithms","author":"CLRS","category":"CS","copies":3}'

curl -X PUT http://localhost:8099/api/books/<_id> \
  -H "Content-Type: application/json" \
  -d '{"copies":5}'

curl -X DELETE http://localhost:8099/api/books/<_id>

7. Cloud Deployment (Azure App Service)

Create Web App (Free F1), Runtime: Node 20 LTS

Deployment Center → connect GitHub repo & branch

Configuration → Application settings:

PORT = 8099 (if needed)

MONGODB_URI = your Atlas URI

SESSION_SECRET = a random string

Browse Cloud URL → /login & run cURL demo.

8. Notes

Do NOT commit .env and node_modules

README is used for marking: include group info, cloud URL, and operation guides.

