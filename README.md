# Diyet Takip Sistemi v2.0

Python Flask + React ile yeniden yazılmış profesyonel mimariyle kurulu diyet takip uygulaması.

## Proje Yapısı

```
diyet-app-v2/
├── backend/                    # Python Flask API
│   ├── models.py              # SQLAlchemy Database Models
│   ├── auth.py                # Authentication Routes
│   ├── patient.py             # Patient Routes
│   ├── admin.py               # Admin Routes
│   ├── app.py                 # Flask Application Factory
│   ├── requirements.txt        # Python Dependencies
│   └── .env.example           # Environment Variables Template
│
└── frontend/                   # React Vite SPA
    ├── src/
    │   ├── api.js            # API Service Client
    │   ├── App.jsx           # Main Component
    │   ├── main.jsx          # React Entry Point
    │   └── index.html        # HTML Template
    ├── package.json          # NPM Dependencies
    ├── vite.config.js        # Vite Configuration
    └── .env.example          # Environment Variables
```

## Mimari Özellikleri

### Backend (Flask)

✅ **Clean Architecture:**
- Modular route blueprints (auth, patient, admin)
- SQLAlchemy ORM ile veritabanı modelleri
- JWT token-based authentication
- Decorator-based authorization (@admin_required)

✅ **Database Models:**
- User (Patient/Admin)
- Weight (Kilo ölçümleri)
- Measurement (9 vücut bölgesi)
- Meal (Öğün kayıtları)
- Message (Admin mesajları)
- Supplement (Ek gıda takviyesi)

✅ **API Endpoints:**
```
POST   /api/auth/register        - Hasta kaydı
POST   /api/auth/login           - Giriş
GET    /api/auth/me              - Mevcut kullanıcı

GET    /api/patient/weights      - Kilo geçmişi
POST   /api/patient/weights      - Kilo ekle

GET    /api/patient/measurements - Ölçümleri getir
POST   /api/patient/measurements - Ölçüm ekle

GET    /api/patient/meals        - Öğünleri getir
POST   /api/patient/meals        - Öğün ekle

GET    /api/patient/messages     - Mesajları getir
GET    /api/patient/supplements  - Taviyeyi getir
GET    /api/patient/profile      - Profili getir
PATCH  /api/patient/profile      - Profili güncelle

GET    /api/admin/patients       - Tüm hastalar
GET    /api/admin/patients/:id   - Hasta detayı
PATCH  /api/admin/patients/:id/stage - Etap güncelle
POST   /api/admin/patients/:id/message - Mesaj gönder
POST   /api/admin/patients/:id/supplement - Takviye ata
GET    /api/admin/stats          - İstatistikler
```

### Frontend (React)

✅ **Modern SPA:**
- Vite ile hızlı development ve build
- Component-based architecture
- API Service pattern (singleton)
- React Hooks for state management
- Responsive design (mobile-first)

✅ **Features:**
- Login/Register screens
- Patient dashboard (6 tabs)
- Admin dashboard (3 tabs)
- Real-time error handling
- JWT token management

## Kurulum

### 1. Backend Setup

```bash
cd backend

# Virtual environment oluştur
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment variables
cp .env.example .env
# .env dosyasını düzenle (JWT_SECRET_KEY)

# Run development server
python app.py
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Veritabanı

### SQLite (Development)
```bash
sqlite3 diyet.db
```

### PostgreSQL (Production)
```
DATABASE_URL=postgresql://user:password@localhost/diyet
```

## Admin Giriş

```
E-posta: admin@diyet.com
Şifre: admin123
```

## Hasta Kaydı

```
Admin Kodu: enli
```

## Environment Variables

### Backend (.env)
```
FLASK_ENV=production
FLASK_APP=app.py
DATABASE_URL=sqlite:///diyet.db
JWT_SECRET_KEY=your-secret-key-min-32-chars
```

### Frontend (.env)
```
VITE_API_BASE=http://localhost:5000
```

## Deployment

### Railway (Recommended)

**Backend:**
1. `requirements.txt` ve `app.py` ile Push
2. Railway: Create new project
3. Deploy from GitHub
4. Variables: JWT_SECRET_KEY
5. Build: `pip install -r requirements.txt && python app.py`

**Frontend:**
1. Build: `npm run build`
2. Dist folder'ı Railway'e push
3. Static hosting konfigürasyonu

## Teknoloji Stack

**Backend:**
- Flask 2.3.3
- SQLAlchemy 3.0.5
- Flask-JWT-Extended 4.5.2
- bcrypt (Şifre hashing)
- Python 3.9+

**Frontend:**
- React 18.2.0
- Vite 4.4.9
- Modern CSS (No frameworks)
- Responsive Design

## API Response Format

### Success (200)
```json
{
  "id": 1,
  "name": "Fatma Yılmaz",
  "email": "fatma@mail.com",
  "role": "patient",
  "weight": 78.5,
  "stage": 2,
  "created_at": "2026-04-22T10:30:00"
}
```

### Error (400/401/404/500)
```json
{
  "error": "Email veya şifre hatalı"
}
```

## Features

✅ **Patient Features:**
- Ölçüm tracking (9 bölge)
- Öğün kaydı ve geçmişi
- Kilo takibi
- Admin mesajlarını okuma
- Atanan taviyeyi görüntüleme

✅ **Admin Features:**
- Tüm hastaları yönetme
- Hasta detaylarını görüntüleme
- Etap güncelleme
- Mesaj gönderme
- Takviye atama
- İstatistik görüntüleme

## Development

```bash
# Watch logs
flask logs

# Database reset
rm diyet.db
python -c "from app import create_app; app = create_app()"

# Test API
curl -X GET http://localhost:5000/api/health
```

## Notlar

- Admin panelinde detaylı hasta verilerine erişim
- Tüm sekmeler (Menü, Ölçüm, Günlük, Mesaj, Takviye) çalışıyor
- Hata mesajları her yerde gösteriliyor
- "Doç. Dr. Özgür Karakoyun" yazıları kaldırıldı
- Modern, temiz ve profesyonel mimari

---

**Son güncelleme:** 22 Nisan 2026  
**Versiyon:** 2.0.0
