# AI Fitness Generator - Modern React + Flask

A production-ready full-stack web application that generates personalized fitness and meal plans using Google's Gemini AI. Features a React SPA with TypeScript frontend and Flask REST API backend.

**Video Demo:** https://youtu.be/DEKg8PDQjMM

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Google Gemini API key

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

✅ **AI-Powered Plans** - Google Gemini 2.5 Flash generates custom meal & workout plans
✅ **Real-time Metrics** - Live BMI & TDEE calculation as you type
✅ **User Authentication** - Secure registration, login, password hashing
✅ **Subscription System** - Monthly/yearly subscription plans with expiry tracking
✅ **Payment Integration** - Demo payment page with plan selection
✅ **Dark Mode** - Complete dark theme with animated theme toggle (sun/moon icons)
✅ **Plan Management** - Save, edit, delete, and expand plan details
✅ **Modern UI** - Responsive design with Tailwind CSS & smooth animations
✅ **Toast Notifications** - Real-time feedback for all actions with dark mode support
✅ **Error Boundaries** - Graceful error handling across the app
✅ **Loading States** - Skeleton loaders & spinners for better UX
✅ **Mobile Menu** - Hamburger navigation with visible title on all screen sizes
✅ **Production Ready** - Optimized builds, code splitting, caching

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + Dark Mode |
| **Backend** | Flask + SQLAlchemy + Flask-Login + Flask-CORS |
| **AI** | Google Gemini 2.5 Flash API |
| **Database** | SQLite (with subscription support) |
| **Authentication** | Flask-Login + password hashing |
| **Styling** | Tailwind CSS + custom animations + dark theme toggle |

## 📁 Project Structure

```
FitnessAI/
├── app.py                              # Flask REST API
├── requirements.txt                    # Python dependencies
├── .env                               # Environment variables
│
├── static/
│   └── react/                         # React SPA
│       ├── src/
│       │   ├── components/           # UI components (Button, Header, Toast, etc)
│       │   ├── pages/               # Page components (HomePage, GeneratePlanPage, etc)
│       │   ├── services/            # API & auth services
│       │   ├── hooks/               # useAuth, useToast
│       │   ├── utils/               # Validation utilities
│       │   └── types/               # TypeScript interfaces
│       ├── dist/                    # Production build output
│       └── package.json
│
└── plans/
    └── witty-swimming-waffle.md      # Development documentation
```

## 🔧 Development

### Backend API Endpoints

**Authentication**
```
GET    /api/check-auth              Check authentication status + subscription
POST   /api/register                User registration
POST   /api/login                   User login
POST   /api/logout                  User logout
```

**Plan Management**
```
POST   /api/generate_plan           Generate new fitness plan (requires subscription)
GET    /api/plans                   Get all user's plans
GET    /api/plans/<id>             Get specific plan
PUT    /api/plans/<id>             Update/regenerate plan
DELETE /api/plans/<id>             Delete plan
```

**Subscription**
```
GET    /api/subscription            Get subscription status
POST   /api/subscription/activate   Activate subscription (monthly/yearly)
POST   /api/subscription/cancel     Cancel active subscription
```

### Frontend Pages

- **Home** (`/`) - Landing page with hero and features
- **Login** (`/login`) - User authentication with dark mode support
- **Register** (`/register`) - Account creation
- **Generate** (`/generate`) - Plan creation form with real-time BMI/TDEE (subscription gated)
- **Results** (`/results`) - Display generated meal & workout plans
- **Plans** (`/plans`) - Manage and edit saved plans
- **Payment** (`/payment`) - Subscription purchase with pricing tiers
- **Subscription** (`/subscription`) - Manage active subscription

## 📊 Key Implementation Details

### Subscription System
- **Free tier** - Users can register but cannot generate plans
- **Premium tiers** - Monthly ($9.99) or Yearly ($79.99) subscriptions
- **Automatic expiry** - Subscriptions automatically expire after period ends
- **Instant gating** - Non-subscribed users see upsell banner and are redirected to `/payment`
- **Server-side validation** - Subscription status checked on every plan generation request

### Real-time BMI/TDEE Calculation
The GeneratePlanPage calculates metrics live as users type, matching backend formulas:
- **BMI** = weight_kg / (height_m²)
- **TDEE** = BMR × activity_multiplier
- **BMR formulas** - Different calculations for male/female based on age, weight, height

### Error Handling
- **Error Boundary** catches React component errors
- **Toast notifications** show success/error/warning messages
- **API error handler** intercepts 401, 403, 500 responses
- **Form validation** with reusable utility functions

### Dark Mode Implementation
- **Theme toggle** - Animated sun/moon icons in header for instant theme switching
- **Persistent preference** - Theme choice saved in localStorage
- **Comprehensive styling** - Dark mode colors applied to all components
- **Custom form autofill** - Fixed browser autofill styling for both themes
- **Toast notifications** - Dark-themed notifications with appropriate opacity
- **Prose content** - Numbered items styled in purple for visibility in both themes

### Authentication Flow
1. User registers/logs in via form submission
2. Flask validates credentials and sets session
3. `useAuth` context stores user state + subscription status
4. `ProtectedRoute` guards authenticated pages
5. 401 responses trigger redirect to `/login`
6. Subscription status auto-checked on every auth refresh

### Styling Strategy
- **Tailwind CSS** for utility-first styling with consistent color palette
- **Custom animations** in index.css for fade-in, slide effects
- **Responsive design** with mobile-first approach
- **Dark mode support** with animated sun/moon theme toggle
- **Theme persistence** via localStorage
- **Comprehensive dark mode** covering all components (inputs, toasts, modals, cards)

## 🚀 Production Deployment

### Build React App
```bash
cd static/react
npm run build
```

Output goes to `static/react/dist/` and Flask serves it automatically.

### Environment Variables (Production)
```env
GOOGLE_API_KEY=your_production_key
FLASK_ENV=production
SECRET_KEY=your_secure_secret_key
DATABASE_URL=postgresql://...  # For prod database
```

### Deploy with Gunicorn
```bash
pip install gunicorn
gunicorn app:app --bind 0.0.0.0:5000
```

### Cloud Deployment Platforms
- **Railway.app** - Recommended (free tier, easy GitHub integration)
- **Render.com** - Free tier available
- **Heroku** - `git push heroku main` (paid)
- **AWS Elastic Beanstalk** - Enterprise option
- **DigitalOcean App Platform** - VPS alternative
- **PythonAnywhere** - Python-specific hosting

## 🐛 Troubleshooting

### "Cannot POST /generate_plan"
- Ensure you're logged in (check `/api/check-auth`)
- Verify Flask is running on port 5000
- Check Network tab in browser DevTools

### "CORS error"
- Both servers must be running (Flask + Vite)
- Check `CORS` config in app.py line 23

### "Missing GOOGLE_API_KEY"
- Create `.env` file in project root
- Add your actual Gemini API key
- Restart Flask

### Port already in use
```bash
# Kill process on port 5000
lsof -ti :5000 | xargs kill -9
# or on Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📈 Performance Optimizations

✨ **React Optimizations**
- Code splitting with Vite
- Lazy loading components
- Memoization of expensive computations
- LocalStorage for session data

⚡ **Backend Optimizations**
- Database query optimization
- Request validation
- Error logging
- CORS caching headers

## 🔐 Security Considerations

- Passwords hashed with werkzeug (not stored in plain text)
- CSRF protection via Flask sessions
- CORS restricted to trusted origins
- Input validation on both client & server
- API key stored in environment variables
- SQL injection prevention via SQLAlchemy ORM

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Development Plan](plans/witty-swimming-waffle.md)

## 📄 License

Open source - MIT License

## 🎓 Learning Resources

Built as a demonstration of:
- Modern React patterns (hooks, context, custom hooks)
- TypeScript best practices
- REST API design with Flask
- Full-stack authentication
- Component-based architecture
- Error handling & validation
- Responsive web design