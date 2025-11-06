# COMP S381F – Library Management System

A full-featured **Express + MongoDB (Mongoose)** cloud web application developed for **COMP S381F: Server-side Technologies and Cloud Computing**.

---

## 1. Project Info
- **Course**: COMP S381F (Autumn 2025)
- **Topic**: Library Management System (Books, Loans & Users)
- **Group**: Group 10  
- **Members**:  
  - SHEN Qiwen (13673791)  
  - Lau Tak Hing (13694497)  
  - [Add other members if any]  
- **GitHub Repo**: [https://github.com/PETERSHEN0327/comps381f-library](https://github.com/PETERSHEN0327/comps381f-library)  
- **Cloud URL** (Render):  
   [https://comps381f-library.onrender.com](https://comps381f-library.onrender.com)

---

## 2. Project File Info

###  Core Files
| File / Folder | Description |
|----------------|-------------|
| `server.js` | Main entry. Implements Express app, routing, MongoDB connection, session management, REST APIs, and Admin Dashboard. |
| `package.json` | Project dependencies and scripts (`npm start`, `npm run dev`). |
| `.env` | Environment variables (`MONGODB_URI`, `SESSION_SECRET`, `PORT`). |
| `.gitignore` | Ignore `node_modules` and `.env` for version control safety. |

###  Folders
| Folder | Description |
|---------|--------------|
| `models/` | Mongoose models: `Book.js`, `Loan.js`, `User.js`. |
| `views/` | EJS UI templates. Includes `login.ejs`, `register.ejs`, and folder structures for `books/`, `loans/`, and `admin/`. |
| `public/` | Static resources (CSS, JS, etc.). |
| `views/admin/` | Contains `dashboard.ejs` – Admin Analytics Dashboard with Charts. |

 **Folder structure overview**
```
comps381f-library/
├─ server.js
├─ package.json
├─ .env
├─ public/
│  └─ style.css
├─ models/
│  ├─ Book.js
│  ├─ Loan.js
│  └─ User.js
└─ views/
   ├─ login.ejs
   ├─ register.ejs
   ├─ admin/
   │  └─ dashboard.ejs
   ├─ books/
   │  ├─ list.ejs
   │  ├─ create.ejs
   │  ├─ edit.ejs
   │  └─ details.ejs
   └─ loans/
      ├─ list.ejs
      ├─ create.ejs
      └─ my.ejs
```

---

## 3. Cloud-based Server (Render)

- **URL:** [https://comps381f-library.onrender.com](https://comps381f-library.onrender.com)
- **Server environment:** Node.js 20 (Render Web Service)
- **Database:** MongoDB Atlas (cloud-hosted)
- **Session storage:** connect-mongo
- **Static hosting:** Render built-in public serving

---

## 4. Operation Guide

###  Login / Register
- **Login URL:** `/login`
- Default admin:  
  - **Username:** `admin`  
  - **Password:** `admin123`
- Any user can register through `/register`.

---

###  Book Management (CRUD Web UI)
| Function | Route | Access | Description |
|-----------|--------|---------|-------------|
| Create Book | `/books/create` | Admin | Add a new book. |
| List Books | `/books` | All users | View and search all books (pagination, filter by status). |
| Edit Book | `/books/:id/edit` | Admin | Modify book info or status. |
| Delete Book | `/books/:id/delete` | Admin | Remove a book from the system. |
| View Details | `/books/:id` | All users | See full details; normal users can borrow if available. |

---

###  Loan Management (CRUD Web UI)
| Function | Route | Access | Description |
|-----------|--------|---------|-------------|
| Create Loan | `/loans/create` | Admin/User | Admin can assign loans; users can borrow books directly. |
| List Loans | `/loans` | Admin | See all current loans and mark returned. |
| My Loans | `/my/loans` | User | Each user can view & return their own borrowed books. |
| Return Loan | `/loans/:id/return` | User/Admin | Mark book as returned; updates book status to “available”. |

---

###  Admin Dashboard
| Path | `/admin/dashboard` |
|------|--------------------|
| Description | Displays analytics and visual statistics using Chart.js |
| Features |
| - Overview Cards: total users, total books, active loans, due soon count |
| - Charts: Monthly loan trend (line chart), Book status distribution (doughnut) |
| - Tables: Top borrowers (last 90 days), Due soon list (3 days) |

---

## 5. RESTful CRUD Services (for API demo)

### **Base URL**
`https://comps381f-library.onrender.com/api`

###  Books APIs (existing)
| Action | Method | URI | Description |
|---------|--------|-----|-------------|
| Read All | GET | `/books` | Return all books |
| Create | POST | `/books` | Add a new book |
| Update | PUT | `/books/:id` | Update a book |
| Delete | DELETE | `/books/:id` | Remove a book |

###  Users APIs (newly added, no authentication)
| Action | Method | URI | Description |
|---------|--------|-----|-------------|
| Read All | GET | `/users` | Get all users |
| Read One | GET | `/users/:id` | Get user detail |
| Create | POST | `/users` | Add new user (`username`, `password`, `role`) |
| Update | PUT | `/users/:id` | Update username/role/password |
| Delete | DELETE | `/users/:id` | Delete a user |

---

## 6. RESTful API cURL Commands (for Presentation)

> Use these on **PowerShell** or **Terminal**  
> (Replace `<USER_ID>` with actual value)

###  Create User
```bash
curl -X POST https://comps381f-library.onrender.com/api/users ^
  -H "Content-Type: application/json" ^
  -d "{"username":"demoUser","password":"demo123","role":"user"}"
```

### Read All Users
```bash
curl https://comps381f-library.onrender.com/api/users
```

### Read One
```bash
curl https://comps381f-library.onrender.com/api/users/demoUser
```

### Update User
```bash
curl -X PUT https://comps381f-library.onrender.com/api/users/demoUser ^
  -H "Content-Type: application/json" ^
  -d "{"password":"newpass456","role":"admin"}"
```

### Delete User
```bash
curl -X DELETE https://comps381f-library.onrender.com/api/users/demoUser
```

---

## 7. Cloud Deployment Steps (Render)
1. Push project to GitHub.
2. Create a new **Render Web Service**:
   - Runtime: Node.js 20 LTS  
   - Build Command: `npm install`  
   - Start Command: `npm start`
3. Add **Environment Variables**:
   ```
   MONGODB_URI = your MongoDB Atlas URI
   SESSION_SECRET = your_random_secret
   PORT = 10000 (Render auto-assigns)
   ```
4. Deploy → Open Cloud URL  
    Verify `/login` works  
   Test RESTful APIs via cURL commands

---

## 8. Notes
- Do **NOT** commit `.env` or `node_modules/`
- Default admin is auto-seeded at first run.
- `README.md` is used for grading:
  - Include group info  
  - Cloud URL  
  - cURL demo commands  
  - RESTful CRUD coverage
- All functions fully deployed and testable on Render.

---

**Prepared by Group 10 – COMP S381F (Autumn 2025)**  
**Demo Presentation Week:** W13 Tutorials