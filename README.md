# AI Fitness Generator - React + Flask

A production-ready full-stack web application that generates personalized fitness and meal plans using Google's Gemini AI. Features a React SPA with TypeScript frontend, Flask REST API backend, subscription system, and complete dark mode support.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Google Gemini API key (get it free at https://aistudio.google.com/app/apikey)

### Installation & Running

```bash
# 1. Set up backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# 2. Set up frontend
cd static/react
npm install

# 3. Create .env file in project root
echo "GOOGLE_API_KEY=your_key_here" > .env

# 4. Run both servers (in separate terminals)
# Terminal 1: Backend
python app.py

# Terminal 2: Frontend
cd static/react && npm run dev
```

Visit `http://localhost:5173` (frontend) or `http://localhost:5000` (backend API)

## 📋 Features

✅ **AI-Powered Plans** - Google Gemini generates custom meal & workout plans
✅ **Real-time Metrics** - Live BMI & TDEE calculation as you type
✅ **User Authentication** - Secure registration, login, password hashing
✅ **Subscription System** - Monthly/Yearly premium plans with limitations
✅ **Plan Management** - Save, edit, delete, and manage saved plans
✅ **Dark Mode** - Complete dark theme with animated toggle & persistent preference
✅ **Responsive Design** - Mobile-first design for all devices
✅ **Modern UI** - Beautiful interface with Tailwind CSS & smooth animations
✅ **Toast Notifications** - Real-time feedback for all user actions
✅ **Error Handling** - Graceful error handling throughout the app

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Backend** | Flask + SQLAlchemy + Flask-Login + Flask-CORS |
| **AI** | Google Gemini 2.5 Flash API |
| **Database** | SQLite |
| **Authentication** | Flask-Login + password hashing |
| **Styling** | Tailwind CSS with dark mode support |

## 📁 Project Structure

```
FitnessAI/
├── app.py                              # Flask REST API
├── requirements.txt                    # Python dependencies
├── .env                               # Environment variables
├── site.db                            # SQLite database
│
├── static/
│   └── react/                         # React SPA
│       ├── src/
│       │   ├── components/           # UI components (Header, Footer, ThemeToggle, etc)
│       │   ├── pages/               # Page components (HomePage, GeneratePlanPage, etc)
│       │   ├── services/            # API & auth services
│       │   ├── hooks/               # Custom hooks (useAuth, useToast, useTheme)
│       │   ├── utils/               # Validation & helper utilities
│       │   └── index.css            # Global styles
│       ├── dist/                    # Production build output
│       └── package.json
│
└── PROJECT_PRESENTATION_GUIDE.md      # Detailed feature documentation
```

## 🔧 Development

### Backend API Endpoints

**Authentication**
```
POST   /api/register                 User registration
POST   /api/login                    User login
POST   /api/logout                   User logout
GET    /api/check-auth               Check authentication status
```

**Plans**
```
POST   /api/generate_plan            Generate new fitness plan (requires subscription)
GET    /api/plans                    Get all user's plans
GET    /api/plans/<id>              Get specific plan
PUT    /api/plans/<id>              Update plan
DELETE /api/plans/<id>              Delete plan
```

**Subscription**
```
GET    /api/subscription             Check subscription status
POST   /api/subscription/activate    Start subscription
POST   /api/subscription/cancel      Cancel subscription
```

### Frontend Pages

- **Home** (`/`) - Landing page with features and CTA
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - Account creation
- **Generate** (`/generate`) - Plan creation form with real-time BMI/TDEE
- **Results** (`/results`) - Display generated fitness & meal plans
- **Plans** (`/plans`) - View and manage saved plans
- **Payment** (`/payment`) - Subscription plan selection
- **Subscription** (`/subscription`) - Manage active subscription

## 📊 Key Implementation Details

### Real-time BMI/TDEE Calculation
The GeneratePlanPage calculates metrics live as users type, matching backend formulas:
- **BMI** = weight_kg / (height_m²)
- **TDEE** = BMR × activity_multiplier (Mifflin-St Jeor formula)

### Dark Mode System
- **Theme Toggle** - Animated sun/moon icon button in header
- **Persistent Preference** - User theme choice saved to localStorage
- **Complete Coverage** - All components styled with dark mode variants
- **Smooth Transitions** - CSS transitions for theme switching

### Authentication Flow
1. User registers/logs in via form submission
2. Flask validates credentials and creates session
3. `useAuth` context stores user state globally
4. `ProtectedRoute` guards authenticated pages
5. 401 responses trigger automatic redirect to `/login`

### Subscription System
- Free tier: Limited plan generations (controlled server-side)
- Monthly plan: Unlimited plans for 30 days
- Yearly plan: Unlimited plans for 365 days
- Subscription status checked on every plan generation

### Styling Strategy
- **Tailwind CSS** for utility-first responsive styling
- **Custom animations** in index.css for smooth effects
- **Mobile-first approach** - responsive from 320px+
- **Dark mode** - via Tailwind's dark: prefix classes
- **Webkit autofill** - custom styling for browser password fields

## 🚀 Production Deployment

### Build React App
```bash
cd static/react
npm run build
cd ../..
```

Output goes to `static/react/dist/` and Flask serves it automatically.

### Environment Variables (Production)
```env
GOOGLE_API_KEY=your_production_key
FLASK_ENV=production
SECRET_KEY=your_secure_secret_key
```

### Deploy with Gunicorn
```bash
pip install gunicorn
gunicorn app:app --bind 0.0.0.0:5000
```

### Platforms
- Heroku: `git push heroku main`
- AWS Elastic Beanstalk
- DigitalOcean App Platform
- Render
- PythonAnywhere

## 🌙 Dark Mode

Click the animated sun/moon icon in the header to toggle between light and dark themes. Your preference is automatically saved and restored on next visit.

## 🐛 Troubleshooting

### "Cannot POST /generate_plan"
- Ensure you're logged in (check `/api/check-auth`)
- Verify you have an active subscription
- Check Flask is running on port 5000

### "CORS error"
- Both Flask and React dev server must be running
- Check CORS config is enabled in app.py
- Verify React dev server is on port 5173

### "Missing GOOGLE_API_KEY"
- Create `.env` file in project root
- Add your actual Gemini API key
- Restart Flask for changes to take effect

### "Port already in use"
```bash
# Kill process on port 5000
lsof -ti :5000 | xargs kill -9
# or on Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Plans not generating"
- Ensure you have an active subscription
- Verify Google API key is valid and has quota remaining
- Check Flask terminal for error messages

## 🔐 Security Considerations

- Passwords hashed with werkzeug (not stored in plain text)
- CSRF protection via Flask sessions
- CORS restricted to trusted origins
- Input validation on both client & server
- API key stored in environment variables
- SQL injection prevention via SQLAlchemy ORM
- Subscription verification on every paid feature request

## 📈 Performance Optimizations

✨ **React Optimizations**
- Code splitting with Vite
- Lazy loading of page components
- Component memoization where beneficial
- LocalStorage for session persistence

⚡ **Backend Optimizations**
- Database query optimization
- Request validation
- Response caching headers
- Efficient password hashing

## 📄 License

MIT License
