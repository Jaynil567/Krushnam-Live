# Krushnam Live LED Wall Rental & Live Streaming

This is the full-stack web application for **Krushnam Live**, built with a Django (Python) backend and a React (Vite) frontend. The project is designed with a premium, glowing dark-neon aesthetic, specifically customized for an LED Wall Rental business.

---

## Default Admin Credentials
Admins are pre-seeded automatically during migrations/deployment.
- **Admin 1: Dhanveer**
  - **Phone / Username**: `9313276505`
  - **Password**: `Dhanveer@Led123`
- **Admin 2: Jaimin Ramani**
  - **Phone / Username**: `9081247935`
  - **Password**: `Jaimin@Led123`

---

## Directory Structure
```
krushnam Live/
├── backend/
│   ├── build.sh                 # Production build script for Render
│   ├── requirements.txt         # Python dependencies
│   ├── manage.py
│   ├── project/                 # Django settings & routing configs
│   └── core/                    # DB models, serializing logic, APIs
├── frontend/
│   ├── vercel.json              # Client routing configuration for Vercel
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json             # JS node dependencies
│   └── src/                     # React application source code
└── README.md
```

---

## How to Run Locally

### 1. Run Backend (Django)
1. Navigate to backend: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual env:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install requirements: `pip install -r requirements.txt`
5. Run migrations & seed admins:
   ```bash
   python manage.py migrate
   python manage.py seed_admins
   ```
6. Start development server: `python manage.py runserver`
   - Access API at: `http://127.0.0.1:8000/api/`
   - Access Django Admin Panel at: `http://127.0.0.1:8000/django-admin/`

### 2. Run Frontend (React)
1. Navigate to frontend: `cd frontend`
2. Install node dependencies: `npm install`
3. Start Vite development server: `npm run dev`
   - Access client at: `http://localhost:3000/`

---

## Production Deployment Instructions

### 1. Backend: Deploy to Render
1. Create a new **Web Service** on Render.
2. Select your repository and point to the `backend/` directory.
3. Configure the following settings:
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn project.wsgi:application`
4. Add the following **Environment Variables**:
   - `SECRET_KEY`: (A random secure string)
   - `DEBUG`: `False`
   - `DATABASE_URL`: (Your Neon DB PostgreSQL connection string)
   - `CLOUDINARY_URL`: (Your Cloudinary API url: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`)

### 2. Frontend: Deploy to Vercel
1. Import your repository into Vercel.
2. Set the **Framework Preset** to **Vite**.
3. Set the **Root Directory** to `frontend/`.
4. Configure **Environment Variables**:
   - `VITE_API_URL`: (Your deployed Render backend URL, e.g., `https://krushnam-live-backend.onrender.com/api`)
5. Click **Deploy**!

---

## Core System Features & Logic
1. **Interactive Pricing Calculator**: Visitors choose Width & Height, panel specifications, multi-day durations, and options like streaming & mixing. Estimates auto-calculate utilizing built-in rental curves.
2. **Inquiry Pipeline**: Users submit stage estimates or questions directly from the home configurator, showing up inside the Admin Inbox instantly. Admins can click "Place Order" to convert an inquiry into a booking automatically.
3. **Passwordless Customer Login**: Customers register with their phone number. The system queries historical records and links any order created with that phone number to their dashboard.
4. **Admin Booking controls**: Dhanveer & Jaimin can create, query, edit, and delete orders, with lookup queries auto-filling details when typing a customer's phone number.
