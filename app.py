import os
import json
from datetime import datetime, timezone

from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    session,
    flash,
    jsonify,
    send_from_directory
)
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    UserMixin,
    login_user,
    LoginManager,
    login_required,
    logout_user,
    current_user
)
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from google import genai
from google.genai import types


# Load environment variables from .env file
load_dotenv(encoding="utf-8")


# Initialize the Flask application
app = Flask(__name__)

# Configure secret key for session management
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-this")

# Enable CORS for React frontend
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///site.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# Flask-Login Configuration
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Configure Google Gemini API key from environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GOOGLE_API_KEY) if GOOGLE_API_KEY else None

# Serve React app for production builds
REACT_BUILD_PATH = os.path.join(os.path.dirname(__file__), "static", "react", "dist")


# Database Model for User Fitness Plans
class UserPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    height_cm = db.Column(db.Float, nullable=False)
    weight_kg = db.Column(db.Float, nullable=False)
    activity_level = db.Column(db.String(50), nullable=False)
    dietary_preference = db.Column(db.String(50), nullable=False)
    fitness_goal = db.Column(db.String(50), nullable=False)
    bmi = db.Column(db.Float, nullable=False)
    bmi_category = db.Column(db.String(50), nullable=False)
    tdee = db.Column(db.Float, nullable=False)
    meal_plan_html = db.Column(db.Text, nullable=False)
    workout_plan_html = db.Column(db.Text, nullable=False)
    date_generated = db.Column(db.DateTime, default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def __repr__(self):
        return f"UserPlan('{self.age}', '{self.fitness_goal}', '{self.date_generated}', UserID: {self.user_id})"


# Database Model for Users (Authentication)
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    plans = db.relationship("UserPlan", backref="author", lazy=True)
    # Subscription fields
    subscription_active = db.Column(db.Boolean, default=False, nullable=False)
    subscription_end_date = db.Column(db.DateTime, nullable=True)
    subscription_plan = db.Column(db.String(20), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"User('{self.username}')"


# Flask-Login user loader callback
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# Calculates Basal Metabolic Rate (BMR)
def calculate_bmr(gender, weight_kg, height_cm, age):
    if gender == "male":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    elif gender == "female":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
    return bmr


# Calculates Total Daily Energy Expenditure (TDEE)
def calculate_tdee(bmr, activity_level):
    activity_multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extra_active": 1.9,
    }
    return bmr * activity_multipliers.get(activity_level, 1.2)


# Cleans JSON response from Gemini API
def clean_json_response(json_str):
    if not json_str:
        return json_str

    json_str = json_str.strip()

    # Remove markdown code block markers
    if json_str.startswith("```json"):
        json_str = json_str[7:]
    if json_str.startswith("```"):
        json_str = json_str[3:]
    if json_str.endswith("```"):
        json_str = json_str[:-3]

    json_str = json_str.strip()

    # Replace smart quotes with regular quotes
    json_str = json_str.replace('"', '"').replace('"', '"')
    json_str = json_str.replace(''', "'").replace(''', "'")
    json_str = json_str.replace('–', '-')

    return json_str


# Sends a prompt to the Gemini API and processes the JSON response
def get_gemini_response(prompt_text):
    if not client:
        print("GOOGLE_API_KEY is missing.")
        return {"error": "API key not configured"}

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            ),
        )

        raw_text = response.text.strip()
        return clean_json_response(raw_text)
    except Exception as e:
        error_str = str(e)
        print(f"Error generating content with Gemini: {error_str}")

        # Extract meaningful error info from Google API errors
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            # Extract the actual message from the error details
            if "You exceeded your current quota" in error_str:
                return {"error": "You exceeded your current quota. Please check your plan and try again later."}
            elif "Quota exceeded for metric" in error_str:
                return {"error": "API quota exceeded (free tier limit of 20 requests/day reached). Please try again tomorrow or upgrade your plan."}
            else:
                return {"error": "API quota exceeded. Please wait a moment and try again."}
        elif "503" in error_str or "UNAVAILABLE" in error_str:
            if "high demand" in error_str.lower():
                return {"error": "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later."}
            else:
                return {"error": "The Gemini API service is temporarily unavailable. Please try again in a moment."}
        elif "401" in error_str or "INVALID_ARGUMENT" in error_str:
            return {"error": "Invalid API key or configuration issue. Please check your GOOGLE_API_KEY."}
        else:
            # Try to extract just the main error message if it's too long
            if len(error_str) > 150:
                return {"error": f"API Error: {error_str[:100]}..."}
            else:
                return {"error": f"API Error: {error_str}"}


# Generates a meal plan using Gemini API and formats it into HTML
def generate_meal_plan(fitness_goal, dietary_preference, bmi_category, age, gender, activity_level, tdee):
    target_calories = tdee
    calorie_modifier_text = ""

    if fitness_goal == "lose_weight":
        target_calories = max(1200, tdee - 500)
        calorie_modifier_text = f"Suggest meals for weight loss, aiming for approximately {target_calories:.0f} calories per day."
    elif fitness_goal == "gain_muscle":
        target_calories += 300
        calorie_modifier_text = f"Suggest meals for muscle gain, aiming for approximately {target_calories:.0f} calories per day."
    else:
        calorie_modifier_text = f"Suggest meals for weight maintenance, aiming for approximately {target_calories:.0f} calories per day."

    prompt = f"""Create a personalized 1-day meal plan. Goal: {fitness_goal.replace('_', ' ').title()}, Diet: {dietary_preference.replace('_', ' ').title()}, TDEE: {tdee:.0f}cal.

Return valid JSON only, no markdown code blocks:
{{"title":"Daily Meal Plan","introduction":"{calorie_modifier_text}","disclaimer":"Consult a nutritionist before major dietary changes.","meals":[{{"type":"Breakfast","items":["specific meal 1","specific meal 2"]}},{{"type":"Lunch","items":["specific meal 1","specific meal 2"]}},{{"type":"Dinner","items":["specific meal 1","specific meal 2"]}},{{"type":"Snack","items":["snack option 1","snack option 2"]}}]}}

Fill with specific, nutritious meal ideas matching the goal and preferences."""

    json_response_str = get_gemini_response(prompt)
    if not json_response_str:
        return "<h3>Meal Plan Generation Failed</h3><p>Could not generate meal plan due to an API error or empty response. Please try again.</p>"

    # Check if response is an error dict
    if isinstance(json_response_str, dict) and "error" in json_response_str:
        return f"<h3>Meal Plan Generation Failed</h3><p>{json_response_str['error']}</p>"

    try:
        # Clean before parsing
        cleaned_json = clean_json_response(json_response_str)
        meal_data = json.loads(cleaned_json)

        html_output = f"<h3>{meal_data.get('title', 'Your Customized Meal Plan')} ({fitness_goal.replace('_', ' ').title()})</h3>"
        html_output += f"<p>Based on your input, your estimated Total Daily Energy Expenditure (TDEE) is <strong>{tdee:.0f} calories</strong>. {calorie_modifier_text} Focus on nutrient-dense foods to meet your targets.</p>"
        html_output += f"<p>{meal_data.get('introduction', '')}</p>"

        for meal in meal_data.get("meals", []):
            html_output += f"<h4>{meal.get('type', 'Meal')}</h4><ul>"
            for item in meal.get("items", []):
                html_output += f"<li>{item}</li>"
            html_output += "</ul>"

        html_output += f"<p><em>{meal_data.get('disclaimer', 'Please consult a healthcare professional or nutritionist before making significant dietary changes.')}</em></p>"
        return html_output

    except json.JSONDecodeError as e:
        print(f"JSON parsing error for meal plan: {e}")
        print(f"Cleaned response: {cleaned_json[:200]}...")
        print(f"Error at position {e.pos}: {cleaned_json[max(0, e.pos-50):e.pos+50]}")
        return f"<h3>Meal Plan Generation Failed</h3><p>The AI response was malformed. Please try again.</p>"
    except Exception as e:
        print(f"Error processing meal plan data: {e}")
        return f"<h3>Meal Plan Generation Failed</h3><p>An unexpected error occurred. Please try again.</p>"


# Generates a workout plan using Gemini API and formats it into HTML
def generate_workout_plan(fitness_goal, activity_level, bmi_category, age, gender):
    prompt = f"""Create a 1-week workout plan. Goal: {fitness_goal.replace('_', ' ').title()}, Activity: {activity_level.replace('_', ' ').title()}, Age: {age}, Gender: {gender}.

Return valid JSON with workout schedule. Use \\n to separate each exercise/activity:
{{"title":"Weekly Workout Plan","introduction":"Personalized {age}yo {gender} workout plan. Warm up before each session and maintain proper form.","disclaimer":"Consult a fitness trainer before starting. Adjust intensity based on your fitness level.","weekly_schedule":[{{"day":"Monday","workout_type":"Upper Body Strength","description":"Warm-up: light cardio 5-10 min\\nBarbell Bench Press 3 sets x 8-12 reps\\nBent-Over Rows 3 sets x 8-12 reps\\nOverhead Press 3 sets x 8-12 reps\\nBicep Curls 3 sets x 10-15 reps\\nTricep Pushdowns 3 sets x 10-15 reps\\nCool down: stretching"}},{{"day":"Tuesday","workout_type":"Lower Body & Core","description":"Warm-up: light cardio 5-10 min\\nBarbell Squats 3 sets x 8-12 reps\\nRomanian Deadlifts 3 sets x 10-15 reps\\nLeg Press 3 sets x 10-15 reps\\nPlank 3 sets x 30-60 seconds\\nRussian Twists 3 sets x 15-20 reps\\nCool down: stretching"}},{{"day":"Wednesday","workout_type":"Active Recovery","description":"30-40 minutes low-intensity cardio\\nBrisk walking, light cycling, or elliptical\\nFocus on comfortable pace\\nAids recovery without stress"}},{{"day":"Thursday","workout_type":"Full Body Alternate","description":"Warm-up: light cardio 5-10 min\\nIncline Dumbbell Press 3 sets x 10-15 reps\\nLat Pulldowns 3 sets x 10-15 reps\\nDumbbell Shoulder Press 3 sets x 10-15 reps\\nGoblet Squats 3 sets x 10-15 reps\\nWalking Lunges 3 sets x 10-12 per leg\\nCool down: stretching"}},{{"day":"Friday","workout_type":"Strength & Core","description":"Warm-up: light cardio 5-10 min\\nConventional Deadlifts 3 sets x 6-10 reps\\nLeg Extensions 3 sets x 12-15 reps\\nPush-ups 3 sets x 10-15 reps\\nSingle-Arm Dumbbell Rows 3 sets x 10-12 per arm\\nBicycle Crunches 3 sets x 15-20 per side\\nCool down: stretching"}},{{"day":"Saturday","workout_type":"Steady State Cardio","description":"45-60 minutes moderate-intensity\\nJogging, swimming, cycling, or stair climber\\nPace where you can speak in sentences\\nBurns calories and improves endurance"}},{{"day":"Sunday","workout_type":"Complete Rest","description":"Full physical and mental recovery\\nGet 7-9 hours quality sleep\\nFocus on hydration and nutrition\\nPrepare for next week"}}]}}"""

    json_response_str = get_gemini_response(prompt)
    if not json_response_str:
        return "<h3>Workout Plan Generation Failed</h3><p>Could not generate workout plan due to an API error or empty response. Please try again.</p>"

    # Check if response is an error dict
    if isinstance(json_response_str, dict) and "error" in json_response_str:
        return f"<h3>Workout Plan Generation Failed</h3><p>{json_response_str['error']}</p>"

    try:
        # Clean before parsing
        cleaned_json = clean_json_response(json_response_str)
        workout_data = json.loads(cleaned_json)

        html_output = f"<h3>{workout_data.get('title', 'Your Customized Workout Plan')} ({fitness_goal.replace('_', ' ').title()})</h3>"
        html_output += f"<p>{workout_data.get('introduction', '')}</p>"

        for day_plan in workout_data.get("weekly_schedule", []):
            day = day_plan.get('day', 'Day')
            workout_type = day_plan.get('workout_type', '')
            description = day_plan.get('description', '')

            # Format day header (large and bold)
            html_output += f"<h2 style='margin-top: 24px; margin-bottom: 6px; color: #9333EA; font-weight: bold; font-size: 1.6rem;'>{day}</h2>"

            # Format workout type as subtitle (smaller) with dot
            html_output += f"<h5 style='margin-top: 0; margin-bottom: 16px; color: #9333EA; font-weight: 500; font-size: 0.95rem;'>• {workout_type}</h5>"

            # Split by newlines and add numbers to each exercise
            exercises = description.split('\n')
            html_output += "<div style='margin-left: 20px; line-height: 1.8;'>"

            for idx, exercise in enumerate(exercises, 1):
                exercise = exercise.strip()
                if exercise:
                    # Convert markdown bold if present
                    exercise = exercise.replace('**', '<strong>').replace('</strong></strong>', '</strong>')
                    html_output += f"<p style='margin: 6px 0;'><strong>{idx}.</strong> {exercise}</p>"

            html_output += "</div>"

        html_output += f"<p style='margin-top: 25px; font-style: italic; color: #666;'>{workout_data.get('disclaimer', 'Please consult a fitness professional before starting any new workout program.')}</p>"
        return html_output

    except json.JSONDecodeError as e:
        print(f"JSON parsing error for workout plan: {e}")
        print(f"Cleaned response: {cleaned_json[:200]}...")
        print(f"Error at position {e.pos}: {cleaned_json[max(0, e.pos-50):e.pos+50]}")
        return f"<h3>Workout Plan Generation Failed</h3><p>The AI response was malformed. Please try again.</p>"
    except Exception as e:
        print(f"Error processing workout plan data: {e}")
        return f"<h3>Workout Plan Generation Failed</h3><p>An unexpected error occurred. Please try again.</p>"


# Check authentication status for React frontend
@app.route("/api/check-auth")
def check_auth():
    if current_user.is_authenticated:
        now = datetime.now()
        sub_active = (
            current_user.subscription_active
            and current_user.subscription_end_date is not None
            and current_user.subscription_end_date > now
        )
        return jsonify({
            "authenticated": True,
            "username": current_user.username,
            "user_id": current_user.id,
            "subscription_active": sub_active,
            "subscription_end_date": current_user.subscription_end_date.isoformat()
                if current_user.subscription_end_date else None,
            "subscription_plan": current_user.subscription_plan,
        })
    return jsonify({"authenticated": False})


# Get subscription status for current user
@app.route("/api/subscription")
@login_required
def get_subscription():
    now = datetime.now()
    sub_active = (
        current_user.subscription_active
        and current_user.subscription_end_date is not None
        and current_user.subscription_end_date > now
    )
    return jsonify({
        "active": sub_active,
        "end_date": current_user.subscription_end_date.isoformat()
            if current_user.subscription_end_date else None,
        "plan": current_user.subscription_plan,
    })


# Activate subscription for current user
@app.route("/api/subscription/activate", methods=["POST"])
@login_required
def activate_subscription():
    from datetime import timedelta

    data = request.get_json(silent=True) or {}
    plan = data.get("plan")

    if plan not in ("monthly", "yearly"):
        return jsonify({"error": "Invalid plan. Choose 'monthly' or 'yearly'."}), 400

    now = datetime.now()
    if plan == "monthly":
        end_date = now + timedelta(days=30)
    else:
        end_date = now + timedelta(days=365)

    current_user.subscription_active = True
    current_user.subscription_end_date = end_date
    current_user.subscription_plan = plan
    db.session.commit()

    return jsonify({
        "success": True,
        "active": True,
        "end_date": end_date.isoformat(),
        "plan": plan,
    })


# Cancel subscription for current user
@app.route("/api/subscription/cancel", methods=["POST"])
@login_required
def cancel_subscription():
    current_user.subscription_active = False
    current_user.subscription_end_date = None
    current_user.subscription_plan = None
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Subscription cancelled successfully"
    })


# Home route
@app.route("/")
def home():
    react_index = os.path.join(REACT_BUILD_PATH, "index.html")
    if os.path.isfile(react_index):
        return send_from_directory(REACT_BUILD_PATH, "index.html")
    return render_template("home.html", now=datetime.now())


# API endpoint to generate fitness plans
@app.route("/api/generate_plan", methods=["POST"])
@login_required
def generate_plan():
    # --- Subscription gate ---
    now = datetime.now()
    is_subscribed = (
        current_user.subscription_active
        and current_user.subscription_end_date is not None
        and current_user.subscription_end_date > now
    )
    if not is_subscribed:
        return jsonify({
            "error": "subscription_required",
            "message": "An active Pro subscription is required to generate plans."
        }), 403
    # --- End subscription gate ---

    try:
        # Handle both form data and JSON body
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form

        age = int(data["age"])
        if not (1 <= age <= 120):
            return jsonify({"error": "Age must be between 1 and 120."}), 400

        gender = data["gender"]
        if gender not in ["male", "female", "other"]:
            return jsonify({"error": "Invalid gender selected."}), 400

        height_cm = float(data["height_cm"])
        if not (50 <= height_cm <= 250):
            return jsonify({"error": "Height must be between 50cm and 250cm."}), 400

        weight_kg = float(data["weight_kg"])
        if not (10 <= weight_kg <= 500):
            return jsonify({"error": "Weight must be between 10kg and 500kg."}), 400

        activity_level = data["activity_level"]
        if activity_level not in ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"]:
            return jsonify({"error": "Invalid activity level selected."}), 400

        dietary_preference = data["dietary_preference"]
        fitness_goal = data["fitness_goal"]
        if fitness_goal not in ["lose_weight", "maintain_weight", "gain_muscle"]:
            return jsonify({"error": "Invalid fitness goal selected."}), 400

        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)

        if bmi < 18.5:
            bmi_category = "Underweight"
        elif 18.5 <= bmi < 24.9:
            bmi_category = "Normal weight"
        elif 25 <= bmi < 29.9:
            bmi_category = "Overweight"
        else:
            bmi_category = "Obese"

        bmr = calculate_bmr(gender, weight_kg, height_cm, age)
        tdee = calculate_tdee(bmr, activity_level)

        meal_plan = generate_meal_plan(
            fitness_goal, dietary_preference, bmi_category, age, gender, activity_level, tdee
        )
        workout_plan = generate_workout_plan(
            fitness_goal, activity_level, bmi_category, age, gender
        )

        # Check if either plan generation failed and extract the error message
        if "Generation Failed" in meal_plan:
            # Extract error message from HTML (e.g., <p>message</p>)
            import re
            error_match = re.search(r'<p>(.*?)</p>', meal_plan)
            error_msg = error_match.group(1) if error_match else "Meal plan generation failed. Please try again."
            return jsonify({"error": error_msg}), 500

        if "Generation Failed" in workout_plan:
            # Extract error message from HTML (e.g., <p>message</p>)
            import re
            error_match = re.search(r'<p>(.*?)</p>', workout_plan)
            error_msg = error_match.group(1) if error_match else "Workout plan generation failed. Please try again."
            return jsonify({"error": error_msg}), 500

        new_plan = UserPlan(
            age=age,
            gender=gender,
            height_cm=height_cm,
            weight_kg=weight_kg,
            activity_level=activity_level,
            dietary_preference=dietary_preference,
            fitness_goal=fitness_goal,
            bmi=bmi,
            bmi_category=bmi_category,
            tdee=tdee,
            meal_plan_html=meal_plan,
            workout_plan_html=workout_plan,
            user_id=current_user.id
        )
        db.session.add(new_plan)
        db.session.commit()

        return jsonify({
            "success": True,
            "plan_id": new_plan.id,
            "bmi": f"{bmi:.2f}",
            "bmi_category": bmi_category,
            "tdee": f"{tdee:.0f}",
            "meal_plan": meal_plan,
            "workout_plan": workout_plan,
            "user_data": {
                "age": age,
                "gender": gender,
                "height_cm": height_cm,
                "weight_kg": weight_kg,
                "activity_level": activity_level,
                "dietary_preference": dietary_preference,
                "fitness_goal": fitness_goal
            }
        })

    except ValueError as ve:
        print(f"Validation error on form input: {ve}")
        return jsonify({"error": f"Invalid input provided: {ve}"}), 400
    except Exception as e:
        print(f"Unhandled error processing form submission: {e}")
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

    return redirect(url_for("generate_plan_form"))


# API endpoint to get all plans for current user
@app.route("/api/plans")
@login_required
def get_plans():
    all_plans = UserPlan.query.filter_by(user_id=current_user.id).order_by(UserPlan.date_generated.desc()).all()
    plans_data = []

    for plan in all_plans:
        plans_data.append({
            "id": plan.id,
            "age": plan.age,
            "gender": plan.gender,
            "height_cm": plan.height_cm,
            "weight_kg": plan.weight_kg,
            "activity_level": plan.activity_level,
            "dietary_preference": plan.dietary_preference,
            "fitness_goal": plan.fitness_goal,
            "bmi": plan.bmi,
            "bmi_category": plan.bmi_category,
            "tdee": plan.tdee,
            "meal_plan_html": plan.meal_plan_html,
            "workout_plan_html": plan.workout_plan_html,
            "date_generated": plan.date_generated.isoformat() if plan.date_generated else None
        })

    return jsonify(plans_data)


# API endpoint to get a specific plan
@app.route("/api/plans/<int:plan_id>")
@login_required
def get_plan(plan_id):
    plan = db.get_or_404(UserPlan, plan_id)

    if plan.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({
        "id": plan.id,
        "age": plan.age,
        "gender": plan.gender,
        "height_cm": plan.height_cm,
        "weight_kg": plan.weight_kg,
        "activity_level": plan.activity_level,
        "dietary_preference": plan.dietary_preference,
        "fitness_goal": plan.fitness_goal,
        "bmi": plan.bmi,
        "bmi_category": plan.bmi_category,
        "tdee": plan.tdee,
        "meal_plan_html": plan.meal_plan_html,
        "workout_plan_html": plan.workout_plan_html,
        "date_generated": plan.date_generated.isoformat() if plan.date_generated else None
    })


# API endpoint to update a plan
@app.route("/api/plans/<int:plan_id>", methods=["PUT"])
@login_required
def update_plan(plan_id):
    # --- Subscription gate ---
    now = datetime.now()
    is_subscribed = (
        current_user.subscription_active
        and current_user.subscription_end_date is not None
        and current_user.subscription_end_date > now
    )
    if not is_subscribed:
        return jsonify({
            "error": "subscription_required",
            "message": "An active Pro subscription is required to update plans."
        }), 403
    # --- End subscription gate ---

    plan = db.get_or_404(UserPlan, plan_id)

    if plan.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        data = request.get_json()

        plan.age = int(data["age"])
        if not (1 <= plan.age <= 120):
            return jsonify({"error": "Age must be between 1 and 120."}), 400

        plan.gender = data["gender"]
        if plan.gender not in ["male", "female", "other"]:
            return jsonify({"error": "Invalid gender selected."}), 400

        plan.height_cm = float(data["height_cm"])
        if not (50 <= plan.height_cm <= 250):
            return jsonify({"error": "Height must be between 50cm and 250cm."}), 400

        plan.weight_kg = float(data["weight_kg"])
        if not (10 <= plan.weight_kg <= 500):
            return jsonify({"error": "Weight must be between 10kg and 500kg."}), 400

        plan.activity_level = data["activity_level"]
        if plan.activity_level not in ["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"]:
            return jsonify({"error": "Invalid activity level selected."}), 400

        plan.dietary_preference = data["dietary_preference"]
        plan.fitness_goal = data["fitness_goal"]
        if plan.fitness_goal not in ["lose_weight", "maintain_weight", "gain_muscle"]:
            return jsonify({"error": "Invalid fitness goal selected."}), 400

        height_m = plan.height_cm / 100
        plan.bmi = plan.weight_kg / (height_m ** 2)

        if plan.bmi < 18.5:
            plan.bmi_category = "Underweight"
        elif 18.5 <= plan.bmi < 24.9:
            plan.bmi_category = "Normal weight"
        elif 25 <= plan.bmi < 29.9:
            plan.bmi_category = "Overweight"
        else:
            plan.bmi_category = "Obese"

        bmr = calculate_bmr(plan.gender, plan.weight_kg, plan.height_cm, plan.age)
        plan.tdee = calculate_tdee(bmr, plan.activity_level)

        plan.meal_plan_html = generate_meal_plan(
            plan.fitness_goal,
            plan.dietary_preference,
            plan.bmi_category,
            plan.age,
            plan.gender,
            plan.activity_level,
            plan.tdee
        )

        plan.workout_plan_html = generate_workout_plan(
            plan.fitness_goal,
            plan.activity_level,
            plan.bmi_category,
            plan.age,
            plan.gender
        )

        if "Generation Failed" in plan.meal_plan_html or "Generation Failed" in plan.workout_plan_html:
            return jsonify({"error": "One or both plans failed to regenerate."}), 500

        plan.date_generated = datetime.now()
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Plan updated successfully!",
            "plan_id": plan.id
        })

    except ValueError as ve:
        return jsonify({"error": f"Invalid input provided: {ve}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error updating plan: {e}"}), 500


# API endpoint to delete a plan
@app.route("/api/plans/<int:plan_id>", methods=["DELETE"])
@login_required
def delete_plan_api(plan_id):
    plan = db.get_or_404(UserPlan, plan_id)

    if plan.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        db.session.delete(plan)
        db.session.commit()
        return jsonify({"success": True, "message": "Plan deleted successfully!"})
    except Exception as e:
        return jsonify({"error": f"Error deleting plan: {e}"}), 500




@app.route("/react/<path:path>")
def serve_react(path):
    static_file_path = os.path.join(REACT_BUILD_PATH, path)

    if os.path.isfile(static_file_path):
        return send_from_directory(REACT_BUILD_PATH, path)

    index_path = os.path.join(REACT_BUILD_PATH, "index.html")
    if os.path.isfile(index_path):
        return send_from_directory(REACT_BUILD_PATH, "index.html")

    return f"404: {path} not found", 404


@app.route("/api/register", methods=["POST"])
def api_register():
    if current_user.is_authenticated:
        return jsonify({"error": "You are already logged in."}), 400

    try:
        if request.is_json:
            data = request.get_json(silent=True) or {}
            username = data.get("username", "").strip()
            password = data.get("password", "")
            confirm_password = data.get("confirm_password", "")
        else:
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            confirm_password = request.form.get("confirm_password", "")

        if not username or not password or not confirm_password:
            return jsonify({"error": "All fields are required."}), 400

        if password != confirm_password:
            return jsonify({"error": "Passwords do not match."}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long."}), 400

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"error": "That username is already taken."}), 400

        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Account created successfully. You can now log in."
        }), 201

    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@app.route("/api/login", methods=["POST"])
def api_login():
    if current_user.is_authenticated:
        return jsonify({
            "success": True,
            "message": "Already logged in.",
            "username": current_user.username,
            "user_id": current_user.id
        }), 200

    try:
        if request.is_json:
            data = request.get_json(silent=True) or {}
            username = data.get("username", "").strip()
            password = data.get("password", "")
        else:
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")

        if not username or not password:
            return jsonify({"error": "Username and password are required."}), 400

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            login_user(user)
            return jsonify({
                "success": True,
                "message": "Logged in successfully!",
                "username": user.username,
                "user_id": user.id
            }), 200

        return jsonify({"error": "Invalid username or password."}), 401

    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500
    

@app.route("/api/logout", methods=["POST"])
@login_required
def api_logout():
    logout_user()
    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    }), 200


# Entry point for running the Flask application
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)