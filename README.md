# 🎓 Secure Student Attendance System

A full-stack, real-time student attendance system built with **React (PWA)**, **Tailwind CSS**, **Node.js (Express)**, **SQLite (better-sqlite3)**, **html5-qrcode**, and **node-cron**.

Designed specifically for classroom lectures with **anti-proxy security**: rolling 18–20s dynamic QR codes, unique 6-digit PIN pairs, geofence validation, and zero student accounts.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | **React.js** (Vite) | Responsive Mobile Web App / PWA |
| **Styling & UI** | **Tailwind CSS** | Mobile-first dark modern aesthetic |
| **QR Scanner Engine** | **html5-qrcode** | HTML5 WebRTC camera APIs |
| **Backend Runtime** | **Node.js + Express.js** | Modular REST API |
| **Database & Cache** | **SQLite (better-sqlite3)** | Roster, credentials, rolling tokens, & live attendance |
| **Cron Engine** | **node-cron** | 19-second automatic loop rotating passkeys & QR tokens |
| **Data Engine** | **SQLite CSV Engine** | High-performance CSV reporting replacing ExcelJS |
| **Security** | **JWT + bcryptjs + Geofence** | Haversine GPS radius verification & secret static QR guard |

---

## 🚀 Key Features

### 1. Confidential Student Registration (`/register`)
- **Access Protection**: Accessible **ONLY** by scanning the Admin's physical static QR code (`/register?key=SECRET`). Direct visits are blocked with `403 Forbidden`.
- **Form Data**:
  - Full Name
  - USN / Admission Number (Unique constraint)
  - Department
  - Year of Study (1, 2, 3, 4)
  - Cycle (Physics / Chemistry) — **Dynamically required ONLY for 1st Year students**
  - Mobile Number (10 digits)
- **Live Dynamic Student ID Computation**: As students type their name and phone number, the UI dynamically previews their official Student ID:
  $$\text{StudentID} = \text{NAME}[0:4] (\text{ALL CAPS}) + \text{MOBILE}[-4:]$$
  *(e.g., "Rahul Sharma" + "9876543210" $\rightarrow$ `RAHU3210`)*.
- **Confirmation Message**: Prominently displays their unique Student ID and advises them to save it for all attendance submissions.

### 2. Zero-Dashboard Student Attendance (`/scan`)
- Students have **no accounts and no login screens**.
- Upon scanning the classroom QR code, they arrive directly at a clean mobile form with exactly **2 fields**:
  1. **Student ID** (e.g. `RAHU3210`)
  2. **Unique PIN** (6-digit PIN displayed on classroom screen)
- Optional fallback: includes an in-browser camera scanner built on **`html5-qrcode`** (WebRTC).
- Submits device coordinates for **Geofence validation** if enabled by the instructor.
- **Double-marking prevention**: Database-enforced `UNIQUE(session_id, student_id)` prevents proxy or repeat submissions.

### 3. Classroom Projector / Display Screen (`/display`)
- High-contrast screen designed for classroom projectors.
- Displays:
  - Subject Name & **Hour Number (1 to 5)**
  - High-resolution dynamic QR code
  - **Huge 6-digit Unique PIN**
  - **18–20s countdown progress bar**
  - Live attendance head count updating in real time

### 4. Comprehensive Admin Control Center (`/admin`)
- **5 Subject Hours**: Start and manage 5 distinct lecture sessions for the 5 subjects of the day.
- **Rolling Passkey Cron Engine**: `node-cron` automatically rotates UUID tokens and 6-digit PINs every 19 seconds.
- **Classroom Geofencing**: Toggle GPS geofencing on/off per session, set boundary radius (meters), and capture instructor's GPS with 1-click.
- **Live Attendance Table (`/admin/attendance`)**:
  - Real-time live polling (every 2.5s) showing students appearing as they scan.
  - **Live Error Correction**: Remove invalid records or manually mark students whose devices had camera/battery issues.
  - **SQLite CSV Export**: One-click download of attendance sheets formatted directly from SQLite queries.
- **Student Roster (`/admin/students`)**: Search and filter enrolled students by academic year, department, or USN.
- **Admin Settings (`/admin/settings`)**: View and download the confidential Static Registration QR code, and update admin credentials.

---

## 📁 Project Structure

```
Attendance System/
├── backend/
│   ├── .env                       # Server config & secrets
│   ├── package.json
│   ├── index.js                   # Express server entry point
│   ├── db.js                      # better-sqlite3 schema & initialization
│   ├── cron/
│   │   └── tokenRotator.js        # node-cron 19s rotation engine
│   ├── middleware/
│   │   ├── adminAuth.js           # JWT verification
│   │   └── geoCheck.js            # Haversine GPS formula
│   └── routes/
│       ├── auth.js                # Admin login/logout
│       ├── registration.js        # Protected student registration & static QR
│       ├── attendance.js          # QR token generation, mark attendance, CSV export
│       └── admin.js               # Sessions CRUD, roster, stats, manual override
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── public/
    │   └── manifest.json          # PWA configuration
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx                # Router configuration
        ├── components/
        │   ├── AdminLayout.jsx    # Sidebar navigation for admin
        │   └── QRScannerModal.jsx # html5-qrcode WebRTC scanner
        └── pages/
            ├── RegisterPage.jsx   # /register?key=SECRET
            ├── ScanPage.jsx       # /scan?token=XYZ (StudentID + UniquePIN)
            ├── DisplayPage.jsx    # /display (Classroom projector view)
            └── admin/
                ├── AdminLogin.jsx
                ├── AdminDashboard.jsx
                ├── LiveAttendance.jsx
                ├── StudentRoster.jsx
                └── AdminSettings.jsx
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend
Open a terminal in `d:\Projects\Attendance System\backend`:
```bash
cd backend
npm install
npm start
```
*The backend will initialize the SQLite database (`attendance.db`) and start running on port `3001`.*

### 2. Start the Frontend
Open a second terminal in `d:\Projects\Attendance System\frontend`:
```bash
cd frontend
npm install
npm run dev
```
*The frontend Vite development server will start on `http://localhost:5173`.*

---

## 🔑 Default Credentials & Keys

- **Admin Username**: `admin`
- **Admin Password**: `admin123`
- **Registration Secret Key**: `STATIC_REG_QR_KEY_SECRET_7890`
- **Registration URL**: `http://localhost:5173/register?key=STATIC_REG_QR_KEY_SECRET_7890`
  *(Also downloadable as a QR image directly from `/admin/settings`)*

---

## 🧪 Step-by-Step Testing Flow

1. **View Static Registration QR**:
   - Log into `http://localhost:5173/admin` with `admin / admin123`.
   - Go to **System Settings**.
   - View/download the **Confidential Static Registration QR** or copy the link.

2. **Register a Student**:
   - Open `http://localhost:5173/register?key=STATIC_REG_QR_KEY_SECRET_7890`.
   - Type Name (e.g. `Rahul Sharma`), Mobile (`9876543210`), USN (`1MS21CS045`), Department, Year 1, Cycle (Physics).
   - Observe the **Live Student ID Preview** dynamically showing `RAHU3210`.
   - Click Register and save your Student ID.

3. **Start an Attendance Session (Hour 1 to 5)**:
   - On the Admin Dashboard, enter Subject (e.g., *Data Structures*), select **Hour 1**, and click **Start Session**.

4. **Open the Classroom Projector Screen**:
   - Navigate to `http://localhost:5173/display`.
   - Observe the dynamic QR code and 6-digit Unique PIN rotating every **18–20 seconds** with the visual countdown bar.

5. **Mark Attendance**:
   - Scan the QR code (or click on the link in `/display` to open `/scan?token=...`).
   - Enter your **Student ID** (`RAHU3210`) and the current **6-digit PIN** displayed on the projector screen.
   - Click **Submit Attendance**.
   - Instant success card confirms attendance!

6. **Watch Real-Time Live Attendance**:
   - In Admin Panel $\rightarrow$ **Live Attendance Table**, watch the student immediately appear without refreshing.
   - Click **Export CSV (SQLite)** to download the attendance report.
