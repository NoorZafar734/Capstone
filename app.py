import os
import re
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from PIL import Image


app = Flask(__name__)
CORS(app)  

model_path = r"C:\Users\Administrator\Desktop\LungGuard\AI_Model/pneumonia_best_model_clahe5.keras"
print(f"Model file exists? {os.path.isfile(model_path)}")
model = load_model(model_path)

IMG_SIZE = (224, 224)


def preprocess_image(image_path):
    """Preprocess image for prediction."""
    img = Image.open(image_path).convert('RGB')
    img = img.resize(IMG_SIZE)
    img_array = img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)  
    return img_array


MONGO_URI = (
    "mongodb+srv://noorzafar:9vVJeMGiWLffHTkp@lungguard-db."
    "u5vm4w0.mongodb.net/?retryWrites=true&w=majority&appName=lungguard-db"
)
client = MongoClient(MONGO_URI)
db = client['lungguard-db']
users_collection = db['users']

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com)$')
PASSWORD_REGEX = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')


@app.route('/')
def home():
    return "Welcome to LungGuard API!"


# --- AI Prediction Route ---
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        filepath = os.path.join('temp', file.filename)
        os.makedirs('temp', exist_ok=True)
        file.save(filepath)

        processed_image = preprocess_image(filepath)
        prediction = model.predict(processed_image)[0][0]

        os.remove(filepath)

        result = "Pneumonia" if prediction > 0.5 else "Normal"
        confidence = float(prediction)

        return jsonify({'result': result, 'confidence': confidence})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --- Signup Route ---
@app.route('/signup', methods=['POST', 'OPTIONS'])
@cross_origin()
def signup():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    dob = data.get('dob', '').strip()
    gender = data.get('gender', '').strip()

    if not name:
        return jsonify({"error": "Full Name is required."}), 400
    if not email or not EMAIL_REGEX.match(email):
        return jsonify({"error": "Invalid email address."}), 400
    if not password or not PASSWORD_REGEX.match(password):
        return jsonify({
            "error": "Password must be at least 8 characters long, "
                     "contain a letter, a number, and a special character."
        }), 400
    if not dob:
        return jsonify({"error": "Date of Birth is required."}), 400
    if not gender:
        return jsonify({"error": "Gender is required."}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered."}), 409

    hashed_password = generate_password_hash(password)
    user_doc = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "dob": dob,
        "gender": gender
    }

    try:
        users_collection.insert_one(user_doc)
        return jsonify({"message": "Signup successful!"}), 201
    except Exception as e:
        return jsonify({"error": "Database error: " + str(e)}), 500


# --- Login Route ---
@app.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin()
def login():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found."}), 404

    if check_password_hash(user['password'], password):
        return jsonify({"message": "Login successful!"}), 200
    else:
        return jsonify({"error": "Incorrect password."}), 401


if __name__ == '__main__':
    app.run(debug=True)
