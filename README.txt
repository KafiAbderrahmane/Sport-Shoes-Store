# 👟 Sole Store — Sport Shoes Web Application

Premium sport shoes catalog with role-based authentication.

## 📁 Project Structure

```
sole-store/
├── README.md
├── frontend/
│   ├── index.html           ← Entry point (smart redirect)
│   ├── welcome.html         ← Animated splash (shows every new session)
│   ├── login.html           ← Login & Sign Up (tabbed)
│   ├── admin.html           ← Admin dashboard (add / edit / delete)
│   ├── client-welcome.html  ← Personalized client welcome page
│   ├── client.html          ← Client catalog (browse & search)
│   ├── style1.css           ← Global stylesheet
│   ├── app.js               ← Vue.js logic + auth guard
│   └── logo.svg             ← Brand logo (used on all pages)
├── backend/
│   ├── app.py               ← Flask API (auth + products)
│   ├── config.py            ← DB connection config
│   └── requirements.txt     ← Python dependencies
└── database/
    └── schema.sql           ← MySQL schema (solestore_db)
```

## 🔄 User Flow

```
Open browser
    ↓
index.html  ──→  welcome.html (every new session)
                    ↓ (5s or click)
                 login.html
                 ↙          ↘
          admin.html    client-welcome.html
          (full CRUD)        ↓
                        client.html (browse)
```

## 🚀 Setup

1. Import `database/schema.sql` into MySQL
2. Edit `backend/config.py` with your DB credentials
3. Run: `pip install -r backend/requirements.txt`
4. Run: `python backend/app.py`
5. Open `frontend/index.html` in browser

## 🔐 Default Admin Account

| Username | Password  |
|----------|-----------|
| admin    | admin123  |

## 🎨 Design System

- **Colors:** `--teal: #0D3340` · `--slate: #6B7A9F` · `--bg: #E9ECF4`
- **Fonts:** DM Serif Display (headings) · Plus Jakarta Sans (body)
- **Logo:** Unified style — 65×65px, border-radius 14px, across all pages
- **Buttons:** Submit-btn style — dark teal, uppercase, sweep animation
