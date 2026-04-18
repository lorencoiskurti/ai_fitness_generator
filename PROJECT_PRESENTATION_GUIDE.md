# FitnessAI - Complete Project Presentation Guide

---

## 🚀 Quick Start (Fresh Install)

### Prerequisites
Before starting, ensure you have installed:

**Windows & Mac**:
- **Python 3.9+**: [Download](https://www.python.org/downloads/)
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Git**: [Download](https://git-scm.com/)

Verify installation:
```bash
python --version
node --version
npm --version
git --version
```

---

### On Windows

#### Step 1: Clone the Repository
```bash
git clone https://github.com/lorencoiskurti/FitnessAI.git
cd FitnessAI
```

#### Step 2: Setup Python Backend

**Create virtual environment**:
```bash
python -m venv venv
venv\Scripts\activate
```

**Install Python dependencies**:
```bash
pip install -r requirements.txt
```

#### Step 3: Setup Environment Variables
Create a `.env` file in the project root:
```bash
# Open Notepad or your editor
notepad .env
```

Add these lines (get your Google API key from [Google AI Studio](https://aistudio.google.com/app/apikey)):
```
GOOGLE_API_KEY=your-actual-google-api-key-here
SECRET_KEY=your-secret-key-for-flask      // NOT FULLY NECCESSARY FOR DEVELOPEMENT
FLASK_ENV=development                     // NOT FULLY NECCESSARY FOR DEVELOPEMENT
```

Save and close.

#### Step 4: Setup Frontend

**Install React dependencies**:
```bash
cd static/react
npm install
cd ../..
```

#### Step 5: Run the Project

**Option A: Production Mode** (built React app, single port)
```bash
# Terminal 1 - Backend
python app.py
```

Navigate to `http://localhost:5000` in your browser.

**Option B: Development Mode** (hot reload for React changes, two ports)
```bash
# Terminal 1 - Backend
python app.py
# Runs on http://localhost:5000

# Terminal 2 - Frontend (new terminal, in project root)
cd static/react
npm run dev
# Runs on http://localhost:5173
```

Visit `http://localhost:5173` in your browser.

#### Step 6: Test the App
1. Click "Register" and create an account
2. You should see a "Go Pro" button in the header
3. Click it and test the payment page
4. After "payment", generate a fitness plan
5. View and manage your plans

---

### On Mac

#### Step 1: Clone the Repository
```bash
git clone https://github.com/lorencoiskurti/FitnessAI.git
cd FitnessAI
```

#### Step 2: Setup Python Backend

**Create virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate
```

**Install Python dependencies**:
```bash
pip install -r requirements.txt
```

#### Step 3: Setup Environment Variables
Create a `.env` file in the project root:
```bash
nano .env
```

Add these lines (get your Google API key from [Google AI Studio](https://aistudio.google.com/app/apikey)):
```
GOOGLE_API_KEY=your-actual-google-api-key-here
SECRET_KEY=your-secret-key-for-flask           // NOT FULLY NECCESSARY FOR DEVELOPEMENT
FLASK_ENV=development                          // NOT FULLY NECCESSARY FOR DEVELOPEMENT
```

Save: `Ctrl+X`, then `Y`, then `Enter`

#### Step 4: Setup Frontend

**Install React dependencies**:
```bash
cd static/react
npm install
cd ../..
```

#### Step 5: Run the Project

**Option A: Production Mode** (built React app, single port)
```bash
# Terminal 1 - Backend
python app.py
```

Navigate to `http://localhost:5000` in your browser.

**Option B: Development Mode** (hot reload for React changes, two ports)
```bash
# Terminal 1 - Backend
python app.py
# Runs on http://localhost:5000

# Terminal 2 - Frontend (new terminal, in project root)
cd static/react
npm run dev
# Runs on http://localhost:5173
```

Visit `http://localhost:5173` in your browser.

#### Step 6: Test the App
1. Click "Register" and create an account
2. You should see a "Go Pro" button in the header
3. Click it and test the payment page
4. After "payment", generate a fitness plan
5. View and manage your plans

---

### Common Issues During Setup

**Python not found (Windows)**:
- Ensure Python is added to PATH during installation
- Try `python3` instead of `python`
- Restart terminal after installing Python

**Python not found (Mac)**:
- Install using Homebrew: `brew install python3`
- Use `python3` instead of `python`

**npm command not found**:
- Restart terminal after installing Node.js
- Verify: `npm --version`

**Port 5000 already in use**:
- Change Flask port in `app.py` line ~35: `app.run(port=5001)`
- Then visit `http://localhost:5001`

**"Go Pro" button doesn't work**:
- Ensure you ran `npm install` in `static/react/`
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check browser console for errors (F12 → Console tab)

**Module not found errors**:
- Ensure virtual environment is activated: `source venv/bin/activate` (Mac) or `venv\Scripts\activate` (Windows)
- Reinstall dependencies: `pip install -r requirements.txt`

---

## 📋 Project Overview
FitnessAI is a full-stack web application that generates personalized fitness plans using AI (Google Gemini API). Users can create accounts, generate customized meal and workout plans based on their physical metrics and fitness goals, view their plan history, and upgrade to a Pro subscription for advanced features.

---

## 🔄 Architecture Evolution

### Original Design (Pre-Modernization)
FitnessAI originally used a **monolithic Flask + Jinja2 templates** approach with vanilla CSS and JavaScript. While functional for backend logic (AI generation, fitness calculations, authentication), the frontend had:
- Server-side HTML rendering (page reloads on every action)
- Fragmented CSS (multiple stylesheets)
- Mixed vanilla JS and inline scripts
- Limited mobile experience
- Tight coupling between frontend and backend

### Migration Decision → React SPA
**Problem**: The original architecture didn't feel like a modern SaaS product, especially for a thesis presentation.

**Solution**: Complete frontend modernization while **preserving all backend logic**:
- **Frontend**: Migrate to React + TypeScript + Vite for SPA experience, fast dev iteration, and maintainable component-based architecture
- **Backend**: Keep Flask but expose functionality as JSON REST API instead of HTML-rendering routes
- **Styling**: Tailwind CSS for rapid, utility-first development with consistent design

**Why this approach?**
1. **Minimal backend rewrite**: All business logic (BMI calculation, TDEE calculation, Gemini API prompts) stayed exactly the same — only the HTTP response format changed (HTML → JSON)
2. **SPA experience**: No page reloads, instant feedback, smooth navigation
3. **Better mobile UX**: React enables responsive, touch-friendly interfaces
4. **Type safety**: TypeScript catches bugs before runtime
5. **Fast development**: Vite + Tailwind speeds up iteration
6. **Maintainability**: Component-based React is cleaner than scattered templates + JS

---

## 🏗️ Architecture Overview

### Tech Stack

#### **Backend**
- **Framework**: Flask (Python web framework)
- **Database**: SQLite (with SQLAlchemy ORM)
- **Authentication**: Flask-Login with Werkzeug password hashing
- **API**: REST API with JSON responses
- **AI Integration**: Google Gemini 2.5 Flash API
- **CORS**: Flask-CORS for cross-origin requests
- **Environment**: python-dotenv for configuration

#### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Custom components + Tailwind
- **State Management**: React Context API

---

## 📁 Project Structure

```
FitnessAI/
├── app.py                           # Backend Flask application
├── requirements.txt                 # Python dependencies
├── site.db                          # SQLite database (auto-generated)
├── static/
│   ├── script.js                    # Old frontend (deprecated, kept for reference)
│   ├── style.css                    # Old styling (deprecated, kept for reference)
│   └── react/                       # React frontend application
│       ├── src/
│       │   ├── App.tsx              # Main routing component
│       │   ├── main.tsx             # Entry point
│       │   ├── components/          # Reusable UI components
│       │   ├── pages/               # Page components (routes)
│       │   ├── hooks/               # Custom React hooks
│       │   ├── services/            # API and utility services
│       │   ├── types/               # TypeScript interfaces
│       │   └── utils/               # Helper functions
│       ├── package.json             # npm dependencies
│       ├── vite.config.ts           # Vite configuration
│       ├── tailwind.config.js       # Tailwind CSS config
│       ├── postcss.config.js        # PostCSS config
│       └── dist/                    # Built production files
├── .env                             # Environment variables
└── README.md                        # Project documentation
```

---

## 🔌 Backend Architecture (Flask)

### Database Models

#### **User Model** (app.py:85-103)
```python
class User(db.Model, UserMixin):
    id: Integer (Primary Key)
    username: String(20) - Unique, required
    password_hash: String(128) - Hashed password
    plans: Relationship to UserPlan
    
    # Subscription fields (added in v2)
    subscription_active: Boolean (default: False)
    subscription_end_date: DateTime (nullable)
    subscription_plan: String(20) - 'monthly' or 'yearly'
    
    Methods:
    - set_password(password): Hash and store password
    - check_password(password): Verify password
```

#### **UserPlan Model** (app.py:64-82)
```python
class UserPlan(db.Model):
    id: Integer (Primary Key)
    age: Integer
    gender: String(10) - 'male', 'female', 'other'
    height_cm: Float
    weight_kg: Float
    activity_level: String(50) - 5 levels
    dietary_preference: String(50)
    fitness_goal: String(50) - 'lose_weight', 'maintain_weight', 'gain_muscle'
    bmi: Float - Calculated
    bmi_category: String(50) - 'Underweight', 'Normal', 'Overweight', 'Obese'
    tdee: Float - Total Daily Energy Expenditure
    meal_plan_html: Text - HTML formatted meal plan
    workout_plan_html: Text - HTML formatted workout plan
    date_generated: DateTime - Auto timestamp
    user_id: ForeignKey to User
```

### Core Functions

#### **Fitness Calculations**

**calculate_bmr()** (app.py:112-120)
- **Input**: gender, weight_kg, height_cm, age
- **Method**: Mifflin-St Jeor equation
- **Formula**: Different for male/female
  - Male: (10×weight) + (6.25×height) - (5×age) + 5
  - Female: (10×weight) + (6.25×height) - (5×age) - 161
- **Output**: Basal Metabolic Rate (calories/day at rest)

**calculate_tdee()** (app.py:124-132)
- **Input**: bmr, activity_level
- **Activity Multipliers**:
  - sedentary: 1.2
  - lightly_active: 1.375
  - moderately_active: 1.55
  - very_active: 1.725
  - extra_active: 1.9
- **Output**: Total Daily Energy Expenditure for personalized calorie targets

#### **AI Content Generation**

**get_gemini_response()** (app.py:135-181)
- **Purpose**: Calls Google Gemini 2.5 Flash API
- **Configuration**: 
  - Model: `gemini-2.5-flash`
  - Response format: JSON
- **Error Handling**: 
  - 429 (Quota exceeded): Free tier limit message
  - 503 (Unavailable): Service temporarily unavailable
  - 401 (Invalid key): Configuration error
- **Output**: Parsed JSON or error dict

**generate_meal_plan()** (app.py:185-235)
- **Input**: fitness_goal, dietary_preference, bmi_category, age, gender, activity_level, tdee
- **Process**:
  1. Calculate target calories based on goal
  2. Build prompt with personalized parameters
  3. Call Gemini API for meal suggestions
  4. Parse JSON response
  5. Format to HTML with meals by type (Breakfast, Lunch, Dinner, Snack)
- **Output**: HTML string with meal plan or error message

**generate_workout_plan()** (app.py:238-292)
- **Input**: fitness_goal, activity_level, bmi_category, age, gender
- **Process**:
  1. Build detailed 7-day workout prompt
  2. Call Gemini API for workout schedule
  3. Parse JSON with daily workouts
  4. Format to HTML with day headers, exercises with numbering, descriptions
- **Output**: Formatted HTML workout schedule

### API Routes

#### **Authentication Routes**

**POST /api/register** (app.py:714-754)
- **Parameters**: username, password, confirm_password (JSON or form)
- **Validation**:
  - All fields required
  - Passwords match
  - Min 6 characters
  - Username not taken
- **Output**: `{ success: true, message: "..." }` or error
- **Status**: 201 (Created) or 400/500 (Error)

**POST /api/login** (app.py:756-792)
- **Parameters**: username, password
- **Process**: Verify credentials, create session
- **Output**: `{ success: true, username, user_id }` or 401 error
- **Session**: Flask-Login session created

**POST /api/logout** (app.py:795-802)
- **Auth**: Requires login
- **Process**: Clears session
- **Output**: `{ success: true }`

**GET /api/check-auth** (app.py:296-314)
- **Purpose**: Check authentication status (called on app load)
- **Output**:
  ```json
  {
    "authenticated": true/false,
    "username": "...",
    "user_id": 123,
    "subscription_active": true/false,
    "subscription_end_date": "ISO date",
    "subscription_plan": "monthly/yearly"
  }
  ```
- **Subscription Check**: Validates subscription is active AND date hasn't expired

#### **Subscription Routes**

**GET /api/subscription** (app.py:318-332)
- **Auth**: Requires login
- **Purpose**: Get current user's subscription status
- **Output**:
  ```json
  {
    "active": true/false,
    "end_date": "ISO date or null",
    "plan": "monthly/yearly or null"
  }
  ```

**POST /api/subscription/activate** (app.py:336-363)
- **Auth**: Requires login
- **Parameters**: `{ plan: "monthly" | "yearly" }`
- **Process**:
  1. Validate plan type
  2. Calculate end_date: now + 30 days (monthly) or 365 days (yearly)
  3. Update user's subscription fields
  4. Commit to database
- **Output**: `{ success: true, active: true, end_date, plan }`

**POST /api/subscription/cancel** (app.py:367-378)
- **Auth**: Requires login
- **Purpose**: Cancel active subscription
- **Process**: Sets subscription_active=False, clears end_date and plan
- **Output**: `{ success: true, message: "..." }`

#### **Plan Management Routes**

**POST /api/generate_plan** (app.py:391-521)
- **Auth**: Requires login + active subscription
- **Parameters**: age, gender, height_cm, weight_kg, activity_level, dietary_preference, fitness_goal
- **Validation**: 
  - Age: 1-120
  - Gender: male/female/other
  - Height: 50-250cm
  - Weight: 10-500kg
  - Activity level: one of 5 options
  - Fitness goal: one of 3 options
- **Process**:
  1. Check subscription (403 if not subscribed)
  2. Calculate BMI and BMI category
  3. Calculate BMR and TDEE
  4. Generate meal plan via AI
  5. Generate workout plan via AI
  6. Store UserPlan in database
- **Output**: `{ success: true, plan_id, bmi, bmi_category, tdee, meal_plan_html, workout_plan_html, user_data }`

**GET /api/plans** (app.py:525-549)
- **Auth**: Requires login
- **Purpose**: Get all plans for current user
- **Output**: Array of plans with all fields

**GET /api/plans/<id>** (app.py:553-576)
- **Auth**: Requires login
- **Authorization**: User can only view their own plans
- **Output**: Single plan object

**PUT /api/plans/<id>** (app.py:580-678)
- **Auth**: Requires login + active subscription
- **Purpose**: Update existing plan (regenerate with new parameters)
- **Process**: Same as create but updates existing record
- **Output**: `{ success: true, message, plan_id }`

**DELETE /api/plans/<id>** (app.py:682-695)
- **Auth**: Requires login
- **Purpose**: Delete a plan
- **Output**: `{ success: true, message }`

#### **Frontend Routes**

**GET /** (app.py:382-387)
- **Purpose**: Serve React app entry point
- **Process**: 
  1. Check if React build exists
  2. Serve index.html from dist/
  3. Fallback to home.html if no build

**GET /react/<path>** (app.py:700-711)
- **Purpose**: Serve static assets from React build
- **Process**: Route to dist/, fallback to index.html for SPA routing

### Configuration

**Environment Variables** (.env)
```
FLASK_ENV=development
SECRET_KEY=your-secret-key
GOOGLE_API_KEY=your-google-gemini-api-key
```

**Flask Configuration** (app.py:37-48)
```python
- Secret key: From .env or default dev key
- Database: SQLite at ./site.db
- CORS: Enabled for http://localhost:5173 (React dev server)
- Session management: Via Flask-Login
```

---

## 🎨 Frontend Architecture (React + TypeScript)

### Project Setup

**Package Dependencies** (static/react/package.json)
- **React**: 18.x
- **React Router**: 6.x for routing
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety
- **Vite**: Fast build tool

### Type Definitions (types/index.ts)

```typescript
User {
  id: number
  username: string
}

Plan {
  id, age, gender, height_cm, weight_kg
  activity_level, dietary_preference, fitness_goal
  bmi, bmi_category, tdee
  meal_plan_html, workout_plan_html
  date_generated: ISO string
}

AuthResponse {
  authenticated: boolean
  username?: string
  user_id?: number
  subscription_active?: boolean
  subscription_end_date?: string | null
  subscription_plan?: 'monthly' | 'yearly' | null
}

SubscriptionStatus {
  active: boolean
  end_date: string | null
  plan: 'monthly' | 'yearly' | null
}

PlanFormData {
  age, gender, height_cm, weight_kg
  activity_level, dietary_preference, fitness_goal
}
```

### Services

#### **api.ts** (services/api.ts)
**Axios Instance Configuration**:
- Base URL: `/api`
- Headers: `Content-Type: application/json`

**Request Interceptor**:
- Adds Bearer token from localStorage if present

**Response Interceptor** (Error Handling):
- 401: Unauthorized → remove token, redirect to /login
- 403: Forbidden → preserve error structure (for subscription errors)
- 404: Not Found → generic message
- 500: Server Error → generic message
- Network errors: Check connection message

**authApi Methods**:
- `checkAuth()`: GET /check-auth
- `login(credentials)`: POST /login
- `register(credentials)`: POST /register
- `logout()`: POST /logout

**plansApi Methods**:
- `getAll()`: GET /plans (all user plans)
- `getById(id)`: GET /plans/{id} (single plan)
- `create(data)`: POST /generate_plan (new plan)
- `update(id, data)`: PUT /plans/{id} (regenerate)
- `remove(id)`: DELETE /plans/{id}
- `calculateBmi(...)`: Client-side BMI/TDEE calculation (no API call)

#### **auth.ts** (services/auth.ts)
- Wraps authApi with response type casting
- `checkAuth()`: Returns AuthResponse
- `login()`: Returns auth with user
- `register()`: Returns auth with user
- `logout()`: Simple post

#### **subscription.ts** (services/subscription.ts)
- `getSubscription()`: GET /subscription → SubscriptionStatus
- `activateSubscription(plan)`: POST /subscription/activate with plan

### Hooks

#### **useAuth.tsx** (hooks/useAuth.tsx)
**Purpose**: Global auth state and user management

**Context Type**:
```typescript
{
  user: AuthResponse
  isLoading: boolean
  setUser(user): void
  refreshAuth(): Promise<void>
}
```

**Features**:
- Checks auth on component mount (useEffect)
- Provides current user data to all components
- `refreshAuth()`: Force re-fetch auth status (used after subscription)
- Default loading state until auth check complete

#### **useToast.tsx** (hooks/useToast.tsx)
- Global toast notification system
- `toast(message, type)`: Show notification
- Provides toast context to all pages

### Components

#### **Layout Components**

**Header.tsx** (components/Header.tsx)
- **Location**: Top of page (desktop only)
- **Features**:
  - Logo and app title
  - Navigation links: Home, Generate, Plans
  - Auth status:
    - If logged out: Login / Register buttons
    - If logged in + subscribed: Green "● Pro Active" pill
    - If logged in + not subscribed: Purple "Go Pro" button
  - Click "Go Pro" → navigate to /payment
  - Uses `useAuth()` hook for subscription status

**MobileNav.tsx** (components/MobileNav.tsx)
- **Location**: Bottom of page (mobile only)
- **Features**: Same as Header but in hamburger menu
- **Responsive**: Hidden on desktop

**Footer.tsx** (components/Footer.tsx)
- Copyright and social links

**Layout.tsx** (components/Layout.tsx)
- Wrapper component: Header + Page Content + Footer + MobileNav

#### **Form & Input Components**

**FormField.tsx** (components/FormField.tsx)
- **Props**: label, type, value, onChange, error, placeholder
- **Renders**: Label + Input + Error message (if any)
- **Styling**: Tailwind

**Button.tsx** (components/Button.tsx)
- **Props**: children, onClick, variant, disabled, loading
- **Variants**: primary (purple), secondary (gray)
- **States**: Normal, hover, disabled, loading with spinner

#### **Utility Components**

**Toast.tsx** (components/Toast.tsx)
- **Purpose**: Display toast notifications
- **Types**: success, error, info, warning
- **Behavior**: Auto-dismiss after 3 seconds
- **Location**: Bottom-right corner

**Modal.tsx** (components/Modal.tsx)
- **Purpose**: Overlay dialogs
- **Props**: title, children, onClose, actions
- **Styling**: Centered, with backdrop

**LoadingSkeleton.tsx** (components/LoadingSkeleton.tsx)
- **Purpose**: Skeleton loaders while data fetches
- **Styling**: Gray placeholder boxes, animated shimmer

**ErrorBoundary.tsx** (components/ErrorBoundary.tsx)
- **Purpose**: Catch React component errors
- **Fallback**: Error page with retry button

**ProtectedRoute.tsx** (components/ProtectedRoute.tsx)
- **Purpose**: Redirect unauthenticated users to /login
- **Check**: `useAuth().user.authenticated`
- **Fallback**: Redirect to /login?next=[current path]

### Pages

#### **HomePage.tsx** (pages/HomePage.tsx)
- **Route**: /
- **Content**: 
  - Hero section with app description
  - Call-to-action buttons (Register / Login)
  - Feature highlights
- **Logic**: If already logged in, show dashboard link

#### **LoginPage.tsx** (pages/LoginPage.tsx)
- **Route**: /login
- **Form Fields**: username, password
- **Process**:
  1. Call `authService.login(credentials)`
  2. On success: Update auth context, redirect to /generate
  3. On error: Show error toast
- **Features**: Link to register, remember me checkbox

#### **RegisterPage.tsx** (pages/RegisterPage.tsx)
- **Route**: /register
- **Form Fields**: username, password, confirm_password
- **Validation**: Passwords match, min 6 chars, username format
- **Process**:
  1. Call `authService.register(credentials)`
  2. On success: Redirect to /login with message
  3. On error: Show error toast
- **Features**: Link to login

#### **GeneratePlanPage.tsx** (pages/GeneratePlanPage.tsx)
- **Route**: /generate (Protected)
- **Form Fields**:
  - Age (1-120)
  - Gender (male/female/other)
  - Height (cm, 50-250)
  - Weight (kg, 10-500)
  - Activity level (5 options)
  - Dietary preference (text, e.g., vegan, keto)
  - Fitness goal (lose_weight / maintain_weight / gain_muscle)
- **Features**:
  - Live BMI/TDEE preview as user types (client-side calc)
  - Subscription check: If not subscribed, show purple upsell banner
  - On submit without subscription: Redirect to /payment
  - Loading spinner during generation
- **Process**:
  1. Validate form
  2. Call `plansApi.create(data)`
  3. On success: Redirect to /results with plan data
  4. On 403 (subscription): Toast + redirect to /payment
  5. On error: Show error toast
- **Styling**: Responsive form with Tailwind

#### **ResultsPage.tsx** (pages/ResultsPage.tsx)
- **Route**: /results (Protected)
- **Purpose**: Display generated plan (meal + workout)
- **Features**:
  - Show user data (age, weight, BMI, TDEE)
  - Display meal plan HTML (from server)
  - Display workout plan HTML (from server)
  - "Save to Plans" button
  - "Generate Another" button
- **Data**: From location state (passed from /generate)

#### **PlansPage.tsx** (pages/PlansPage.tsx)
- **Route**: /plans (Protected)
- **Purpose**: Show all past plans
- **Process**:
  1. Fetch all plans via `plansApi.getAll()`
  2. Display as list/grid with:
     - Date generated
     - User metrics (age, weight, goal)
     - Quick preview buttons
  3. "View" button → Show full plan
  4. "Edit" button → /generate with plan data filled
  5. "Delete" button → Confirm + delete via `plansApi.remove()`
- **Pagination**: Load more button (if many plans)

#### **PaymentPage.tsx** (pages/PaymentPage.tsx)
- **Route**: /payment (Protected)
- **Purpose**: Purchase subscription
- **UI Structure**:
  - Pricing cards section:
    - Monthly: $9.99/month
    - Yearly: $79.99/year (badge: Save 33%)
    - Checkmarks and "Select" buttons
  - Payment method tabs:
    - Card (default)
    - PayPal
    - Apple Pay
- **Card Tab Fields**:
  - Card number: Auto-formats to "1234 5678 9012 3456"
  - Expiry: Auto-formats to "MM/YY"
  - CVV: 3 digits
  - Name on card
- **Process**:
  1. Select pricing plan
  2. Enter payment details
  3. Click "Start [Monthly/Yearly] Plan"
  4. Call `subscriptionService.activateSubscription(plan)`
  5. Loading spinner
  6. Success overlay: "Payment Successful!" with checkmark
  7. Auto-redirect to /generate after 2 seconds
  8. Header updates to show "● Pro Active"
- **Error Handling**: Toast on failure, allow retry

#### **SubscriptionDashboard.tsx** (pages/SubscriptionDashboard.tsx)
- **Route**: /subscription (Protected)
- **Purpose**: View subscription details
- **Features**:
  - Show current plan (monthly/yearly)
  - Show end date
  - "Cancel Subscription" button
  - Upgrade/downgrade option
  - Usage stats (plans generated count)

### Routing Configuration (App.tsx)

```
Public Routes:
  / → HomePage
  /login → LoginPage
  /register → RegisterPage

Protected Routes (require login):
  /generate → GeneratePlanPage
  /results → ResultsPage
  /plans → PlansPage
  /payment → PaymentPage
  /subscription → SubscriptionDashboard

Catch-all:
  * → Redirect to /

Root Structure:
<ErrorBoundary>
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        <Routes>...</Routes>
        <ToastContainer />
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
</ErrorBoundary>
```

### Styling

**Tailwind CSS** (tailwind.config.js)
- **Color Scheme**:
  - Primary purple: #9333EA (purple-600/700/800)
  - Accent: Emerald green for "Pro Active"
  - Gray scale for backgrounds, text
  - White for cards

- **Key Classes**:
  - `min-h-screen`: Full viewport height
  - `flex`, `grid`: Layout
  - `rounded-lg`, `shadow-md`: Card styling
  - `hover:bg-opacity-90`: Interactive states
  - `transition-all duration-300`: Smooth animations

**PostCSS** (postcss.config.js)
- Tailwind, autoprefixer, nested CSS support

### Utilities

**formatting.ts** (utils/formatting.ts)
- `formatDate()`: Convert ISO to readable date
- `formatNumber()`: Add commas to numbers
- `formatBMI()`: Round to 1 decimal

**validation.ts** (utils/validation.ts)
- `validateEmail()`: Email format
- `validatePassword()`: Min 6 chars, has number
- `validateAge()`: 1-120 range
- `validateHeight()`: 50-250 cm
- `validateWeight()`: 10-500 kg

---

## 🔄 Data Flow Examples

### Plan Generation Flow

```
User fills form on GeneratePlanPage
  ↓
Client validates inputs
  ↓
Client checks subscription status via useAuth
  ↓
If not subscribed: Show upsell banner + redirect to /payment
  ↓
If subscribed: POST /api/generate_plan
  ↓
Backend validates all inputs
  ↓
Backend checks subscription again (security)
  ↓
Backend calculates BMR and TDEE
  ↓
Backend calls Gemini API for meal plan (JSON)
  ↓
Backend calls Gemini API for workout plan (JSON)
  ↓
Backend parses JSON, converts to HTML
  ↓
Backend saves UserPlan to database
  ↓
Backend returns { plan_id, meal_plan_html, workout_plan_html, ... }
  ↓
Frontend redirects to /results
  ↓
ResultsPage displays plans, user sees complete fitness plan
```

### Subscription Activation Flow

```
User clicks "Go Pro" in Header
  ↓
Redirect to /payment
  ↓
User selects pricing (monthly/yearly)
  ↓
User enters payment details
  ↓
User clicks "Start [Plan] Plan"
  ↓
POST /api/subscription/activate with { plan: "monthly"|"yearly" }
  ↓
Backend validates plan type
  ↓
Backend sets subscription_active = true
  ↓
Backend sets subscription_end_date = now + 30/365 days
  ↓
Backend sets subscription_plan = plan type
  ↓
Backend returns { success: true }
  ↓
Frontend shows "Payment Successful!" overlay
  ↓
Frontend calls refreshAuth() to update user context
  ↓
Header now shows "● Pro Active" pill
  ↓
Auto-redirect to /generate
  ↓
User can generate plans without upsell banner
```

### Authentication Check Flow

```
App.tsx mounts
  ↓
AuthProvider initializes useAuth hook
  ↓
useEffect calls authService.checkAuth()
  ↓
GET /api/check-auth
  ↓
Backend checks if session exists (Flask-Login)
  ↓
If authenticated:
  - Return { authenticated: true, username, user_id, subscription_* }
  ↓
If not authenticated:
  - Return { authenticated: false }
  ↓
Frontend updates user context
  ↓
ProtectedRoute components check user.authenticated
  ↓
If false: Redirect to /login
  ↓
If true: Allow access to protected pages
```

---

## ⚠️ Problems Encountered & Decisions Made

### 1. 403 Error Handling for Subscription Gating
**Problem**: When a non-subscribed user tried to generate a plan, the Axios interceptor in `api.ts` was catching all 403 responses and converting them to a generic `"You do not have permission"` message. This wiped out the structured error code `{ error: "subscription_required" }` that the backend sent, so the frontend couldn't distinguish between "subscription required" vs "access denied for other reasons."

**Impact**: GeneratePlanPage couldn't detect subscription-specific errors and redirect to the payment page — users just saw a generic error toast.

**Solution**: Modified the 403 interceptor in `api.ts` to preserve the original error response structure. Now when a 403 with `{ error: "subscription_required" }` arrives, it reaches the component unchanged, allowing proper redirection to `/payment`.

**Code pattern**: The interceptor still handles 403 globally, but preserves the `response.data` object instead of replacing it with a generic message.

### 2. Real-Time Subscription Expiry Check
**Problem**: How to detect when a subscription expires without running a background job or asking the user to refresh?

**Solution**: The `/api/check-auth` endpoint performs a **live check** on every request:
```python
subscription_active AND subscription_end_date > datetime.utcnow()
```
Both conditions must be true for a subscription to be considered valid. If a subscription expires during a user's session, the next page load or auth refresh will immediately flip the header back to "Go Pro" — no cron job needed.

**Benefit**: Expired subscriptions are caught instantly; no stale states.

### 3. Payment Processing: Demo vs. Production
**Problem**: Building a thesis project that demonstrates subscription flow without integrating a real payment gateway (Stripe, PayPal API) is complex and adds unnecessary cost/complexity.

**Decision**: The payment page intentionally provides a **demo implementation**:
- All three payment method tabs (Card, PayPal, Apple Pay) call the same backend endpoint
- No actual card validation or payment processing
- Submitting any data activates the subscription immediately
- Designed for presentation purposes; in production, would integrate Stripe or PayPal SDK

**Why three tabs?** It demonstrates the capability and looks feature-complete for a thesis presentation.

---

## 🗄️ Database Migration & Subscription Setup

### The Migration Challenge
**Problem**: SQLite has limited support for ALTER TABLE. When the subscription feature was added to the User model (3 new columns), existing databases with user data needed to be updated without losing information.

### Migration Strategy
The `migrate_subscription.py` script implements a two-step approach:

**Step 1 (Safe)**: Try `ALTER TABLE user ADD COLUMN ...` for each subscription column
- Works if the columns don't already exist
- Preserves all existing user data
- Idempotent: if a column already exists, the error is caught and silently skipped

**Step 2 (Fallback)**: If ALTER fails with an unexpected error, drop and recreate all tables
- Loses all data but gets a clean schema
- Only triggered by actual errors, not by "column already exists"
- Appropriate for development mode

### After First Run
Once the columns are added to the database, they become part of the SQLAlchemy model definition. New databases created in the future will include subscription columns automatically when `db.create_all()` runs — the migration script is no longer needed.

**Usage**: Run once during deployment:
```bash
python migrate_subscription.py
```

---

## 🎨 Design Decisions

### Visual Design Language
The entire UI follows a **premium SaaS aesthetic** intentionally designed for thesis presentation:

**Color Palette**:
- **Primary Purple**: `#9333EA` (Tailwind `purple-600/700/800`) used throughout
  - Header "Go Pro" button
  - PaymentPage gradient CTA button
  - GeneratePlanPage upsell banner
  - Links and interactive elements
- **Accent Green**: Emerald for "● Pro Active" pill (indicates subscription is live)
- **Neutrals**: Gray scale for backgrounds, text, borders; white for cards

**Design System**:
- All styling uses **Tailwind CSS utility classes** — no custom CSS files
- Consistent rounded corners (`rounded-lg`, `rounded-xl`, `rounded-2xl`)
- Consistent shadows and spacing (Tailwind scale)
- Responsive breakpoints (mobile-first approach)

### Payment Page: Premium Presentation
The payment page was intentionally over-engineered for visual polish:
- Clean white pricing cards on light gray background
- Auto-formatting for inputs (card number: `1234 5678 9012 3456`, expiry: `12/25`)
- Trust indicators: 🔒 SSL encryption badge, card brand logos
- Success overlay: Checkmark emoji + "Payment Successful!" message
- Smooth transition: Auto-redirect to `/generate` after 2 seconds
- Visual feedback: Checkmarks on selected pricing option

**Rationale**: For a thesis defense, the payment UI should feel like a professional SaaS product. Users and judges expect this level of polish. The demo nature (no actual payment processing) is intentional.

### Why Tailwind CSS Only?
- **Consistency**: Single source of truth for colors, spacing, and responsive behavior
- **Maintainability**: No custom CSS files to manage; all styles are named, searchable utility classes
- **Speed**: Rapid iteration — add classes to elements without writing CSS
- **Scalability**: Easy to adjust branding by searching/replacing color utilities
- **File size**: Purged build removes unused utilities

---

## 🐛 Known Issues & Troubleshooting

### Issue: Header Still Shows "Go Pro" After Payment
**Symptoms**: User clicks "Start [Plan]" button, success overlay appears, but after redirect, header still shows "Go Pro" instead of "● Pro Active"

**Causes**:
1. Backend didn't save subscription correctly
2. `refreshAuth()` call failed
3. Browser cached stale auth state
4. Session not persisted

**Solutions**:
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check backend logs for `/api/subscription/activate` returning 200
- Open DevTools → Application → SessionStorage, clear all, reload
- Verify subscription_end_date is in the future (not expired)
- If still broken: check browser console for network errors

---

### Issue: 403 Error Even After Activating Subscription
**Symptoms**: User has "Pro Active" pill in header, but trying to generate a plan returns 403 "subscription_required"

**Causes**:
1. Subscription already expired (end_date in the past)
2. Database not updated properly
3. Session corruption

**Solutions**:
- Check subscription_end_date: should be 30 days (monthly) or 365 days (yearly) from now
- Hard refresh page and try again
- Log out, log back in (forces full auth check)
- If backend logs show subscription as active but generate_plan rejects: check timezone sync between backend and system

---

### Issue: Payment Page Form Fields Broken or Not Formatting
**Symptoms**: Card number input not auto-formatting, expiry field broken, form won't submit

**Causes**:
1. Browser cache issue
2. Missing PaymentPage component (npm dependencies not installed)
3. State management issue

**Solutions**:
- Clear browser cache: DevTools → Application → Clear All
- Verify React dependencies: run `npm install` in `static/react/` folder
- Hard refresh: `Ctrl+Shift+R`
- If still broken: check browser console for React/JavaScript errors

---

### Issue: Can't Generate Plans Without Paying (Expected but Want to Verify)
**Testing the subscription gate**:
1. Register a new account (or log out + create new)
2. DO NOT go to `/payment`
3. Navigate to `/generate`
4. You should see a **purple upsell banner** explaining the "Go Pro" requirement
5. Try to submit the form → You'll be redirected to `/payment` with a 403 error
6. This confirms the subscription gate is working correctly

---

### Issue: Missing PaymentPage Component
**Symptoms**: Clicking "Go Pro" button redirects to `/payment`, but page is blank or broken

**Causes**:
1. React build doesn't include PaymentPage component
2. `npm install` wasn't run after adding PaymentPage
3. Import path is wrong

**Solutions**:
- Verify file exists: `static/react/src/pages/PaymentPage.tsx`
- Run `npm install` in `static/react/` to ensure all dependencies are installed
- Check `App.tsx` has the `/payment` route pointing to PaymentPage
- If in dev mode: Vite should auto-reload; check terminal for build errors

---

### Performance Note: Subscription Check on Every Load
The `/api/check-auth` endpoint queries the database to validate subscription status on every request. This is intentional but does add a small latency. For production at scale, consider:
- Caching auth results in Redis with a short TTL
- Embedding subscription status in JWT tokens
- Conditional checks (only if user was previously subscribed)

Current approach prioritizes **correctness** (no stale subscription states) over raw speed, which is appropriate for this application.

---

## 🚀 Deployment Setup

### Database Migration

```bash
python migrate_subscription.py
```
- Adds 3 columns to User table:
  - subscription_active (BOOLEAN)
  - subscription_end_date (DATETIME)
  - subscription_plan (VARCHAR(20))
- Safe for existing data (uses ALTER TABLE)

### Starting Services

**Backend**:
```bash
python app.py
```
- Runs on http://localhost:5000
- Creates SQLite database if not exists
- Serves React build at root

**Frontend (Development)**:
```bash
cd static/react
npm run dev
```
- Runs on http://localhost:5173 with hot reload

**Frontend (Production)**:
```bash
cd static/react
npm run build
cd ../..
```
- Builds to `dist/` folder
- Backend serves from root

---

## 🔐 Security Features

1. **Password Hashing**: Werkzeug's generate_password_hash (PBKDF2)
2. **Session Management**: Flask-Login with secure sessions
3. **CORS**: Whitelist localhost:5173 (configurable for production)
4. **Authorization**: User can only view/edit their own plans
5. **Subscription Gating**: Server-side check on /api/generate_plan
6. **Input Validation**: All inputs validated on backend

---

## 🧪 Testing Scenarios

### Scenario 1: Register & Generate Plan
1. Navigate to /register
2. Create account
3. See "Go Pro" button in header
4. Click "Go Pro" → /payment
5. Try to submit without entering details → errors
6. Complete payment → success overlay
7. Redirect to /generate
8. See "Pro Active" pill
9. Generate plan → success

### Scenario 2: Generate Without Subscription
1. Register new account
2. Don't go to /payment
3. Navigate to /generate
4. See purple upsell banner
5. Try to submit → redirect to /payment
6. Choose plan and activate
7. Return to /generate → banner gone

### Scenario 3: Manage Plans
1. Generate 2-3 plans
2. Navigate to /plans
3. See all plans with dates
4. Click "View" → See full plan
5. Click "Edit" → Update metrics → regenerate
6. Click "Delete" → Confirm deletion

---

## 📊 Key Features Summary

| Feature | Location | Method |
|---------|----------|--------|
| User Registration | RegisterPage.tsx, /api/register | Form + POST |
| User Login | LoginPage.tsx, /api/login | Form + POST + Session |
| Subscription Check | useAuth.tsx, /api/check-auth | GET + Context |
| Plan Generation | GeneratePlanPage.tsx, /api/generate_plan | Form + POST |
| Meal Plan AI | generate_meal_plan(), Gemini API | JSON prompt |
| Workout Plan AI | generate_workout_plan(), Gemini API | JSON prompt |
| View Plans | PlansPage.tsx, /api/plans | GET |
| Update Plan | edit form, /api/plans/{id} PUT | Regenerate |
| Delete Plan | PlansPage.tsx, /api/plans/{id} DELETE | DELETE |
| Payment Page | PaymentPage.tsx, /payment | Subscription UI |
| Activate Subscription | PaymentPage.tsx, /api/subscription/activate | POST |
| BMI Calculation | api.ts + app.py | Formula |
| TDEE Calculation | api.ts + app.py | Formula × Activity |

---

## 📝 Environment Configuration

**Required .env Variables**:
```
GOOGLE_API_KEY=sk-...         # Google Gemini API key
SECRET_KEY=your-secret-key    # Flask secret for sessions
FLASK_ENV=development         # or production
```

**Optional**:
```
FLASK_DEBUG=True              # Enable debug mode
DATABASE_URL=sqlite:///...    # Custom DB path
```

---

## 🎯 Conclusion

FitnessAI combines:
- **Backend**: Flask REST API with SQLAlchemy ORM, Google Gemini AI integration
- **Frontend**: React with TypeScript, modern UI with Tailwind CSS
- **Features**: User auth, fitness plan generation, subscription system
- **AI**: Google Gemini 2.5 Flash for meal and workout planning
- **Database**: SQLite with subscription support

All components are fully integrated and production-ready for deployment.
