from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Weight, Measurement, Meal, Message, Supplement
from sqlalchemy import desc

patient_bp = Blueprint('patient', __name__, url_prefix='/api/patient')

def get_current_user():
    """Helper to get current user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return None, jsonify({'error': 'Kullanıcı bulunamadı'}), 404
    return user, None, None


# ── WEIGHTS ──────────────────────────────────────
@patient_bp.route('/weights', methods=['GET'])
@jwt_required()
def get_weights():
    """Get all weights for current user"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    weights = Weight.query.filter_by(user_id=user.id).order_by(desc(Weight.recorded_at)).all()
    return jsonify([w.to_dict() for w in weights]), 200


@patient_bp.route('/weights', methods=['POST'])
@jwt_required()
def add_weight():
    """Add weight measurement"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    data = request.get_json()
    if not data.get('weight'):
        return jsonify({'error': 'Kilo değeri gerekli'}), 400
    
    weight = Weight(user_id=user.id, weight=data['weight'])
    db.session.add(weight)
    
    # Update user's current weight
    user.weight = data['weight']
    
    db.session.commit()
    return jsonify(weight.to_dict()), 201


# ── MEASUREMENTS ──────────────────────────────────
@patient_bp.route('/measurements', methods=['GET'])
@jwt_required()
def get_measurements():
    """Get all measurements for current user"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    measurements = Measurement.query.filter_by(user_id=user.id).order_by(desc(Measurement.recorded_at)).all()
    return jsonify([m.to_dict() for m in measurements]), 200


@patient_bp.route('/measurements', methods=['POST'])
@jwt_required()
def add_measurement():
    """Add body measurement"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    data = request.get_json()
    
    measurement = Measurement(
        user_id=user.id,
        kilo=data.get('kilo'),
        boyun=data.get('boyun'),
        ust_gogus=data.get('ust_gogus'),
        gogus=data.get('gogus'),
        alt_gogus=data.get('alt_gogus'),
        kol=data.get('kol'),
        bel=data.get('bel'),
        gobek=data.get('gobek'),
        kalca=data.get('kalca'),
        bacak=data.get('bacak')
    )
    
    db.session.add(measurement)
    if data.get('kilo'):
        user.weight = data['kilo']
    db.session.commit()
    
    return jsonify(measurement.to_dict()), 201


# ── MEALS ──────────────────────────────────────────
@patient_bp.route('/meals', methods=['GET'])
@jwt_required()
def get_meals():
    """Get all meals for current user"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    meals = Meal.query.filter_by(user_id=user.id).order_by(desc(Meal.logged_at)).all()
    return jsonify([m.to_dict() for m in meals]), 200


@patient_bp.route('/meals', methods=['POST'])
@jwt_required()
def add_meal():
    """Log a meal"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    data = request.get_json()
    if not data.get('meal'):
        return jsonify({'error': 'Öğün açıklaması gerekli'}), 400
    
    meal = Meal(
        user_id=user.id,
        meal=data['meal'],
        stage=user.stage
    )
    db.session.add(meal)
    db.session.commit()
    
    return jsonify(meal.to_dict()), 201


# ── MESSAGES ──────────────────────────────────────
@patient_bp.route('/messages', methods=['GET'])
@jwt_required()
def get_messages():
    """Get all messages for current user"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    messages = Message.query.filter_by(user_id=user.id).order_by(desc(Message.created_at)).all()
    return jsonify([m.to_dict() for m in messages]), 200


# ── SUPPLEMENTS ───────────────────────────────────
@patient_bp.route('/supplements', methods=['GET'])
@jwt_required()
def get_supplements():
    """Get all supplements for current user"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    supplements = Supplement.query.filter_by(user_id=user.id).order_by(desc(Supplement.assigned_at)).all()
    return jsonify([s.to_dict() for s in supplements]), 200


# ── PROFILE ───────────────────────────────────────
@patient_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    return jsonify(user.to_dict()), 200


@patient_bp.route('/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user, error, status = get_current_user()
    if error:
        return error, status
    
    data = request.get_json()
    
    if 'name' in data:
        user.name = data['name']
    if 'weight' in data:
        user.weight = data['weight']
    if 'height' in data:
        user.height = data['height']
    if 'age' in data:
        user.age = data['age']
    if 'city' in data:
        user.city = data['city']
    
    db.session.commit()
    return jsonify(user.to_dict()), 200
