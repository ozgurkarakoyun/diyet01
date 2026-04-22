from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Message, Supplement, Weight, Measurement, Meal
from sqlalchemy import desc
from functools import wraps

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(f):
    """Decorator to check if user is admin"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin izni gerekli'}), 403
        return f(*args, **kwargs)
    return decorated_function


# ── PATIENTS ──────────────────────────────────────
@admin_bp.route('/patients', methods=['GET'])
@admin_required
def get_patients():
    """Get all patients"""
    patients = User.query.filter_by(role='patient').all()
    
    result = []
    for patient in patients:
        patient_data = patient.to_dict()
        
        # Calculate weight loss
        initial_weight = patient.weight or 0
        weights = Weight.query.filter_by(user_id=patient.id).order_by(Weight.recorded_at).first()
        if weights:
            initial_weight = weights.weight
        
        weight_lost = initial_weight - (patient.weight or 0)
        
        patient_data['weightLost'] = round(weight_lost, 1)
        patient_data['mealCount'] = Meal.query.filter_by(user_id=patient.id).count()
        patient_data['measureCount'] = Measurement.query.filter_by(user_id=patient.id).count()
        
        result.append(patient_data)
    
    return jsonify(result), 200


@admin_bp.route('/patients/<int:patient_id>', methods=['GET'])
@admin_required
def get_patient(patient_id):
    """Get single patient with all data"""
    patient = User.query.get(patient_id)
    if not patient or patient.role != 'patient':
        return jsonify({'error': 'Hasta bulunamadı'}), 404
    
    patient_data = patient.to_dict()
    patient_data['measurements'] = [m.to_dict() for m in Measurement.query.filter_by(user_id=patient_id).order_by(desc(Measurement.recorded_at)).all()]
    patient_data['meals'] = [m.to_dict() for m in Meal.query.filter_by(user_id=patient_id).order_by(desc(Meal.logged_at)).all()]
    patient_data['messages'] = [m.to_dict() for m in Message.query.filter_by(user_id=patient_id).order_by(desc(Message.created_at)).all()]
    patient_data['supplements'] = [s.to_dict() for s in Supplement.query.filter_by(user_id=patient_id).all()]
    
    return jsonify(patient_data), 200


@admin_bp.route('/patients/<int:patient_id>/stage', methods=['PATCH'])
@admin_required
def update_patient_stage(patient_id):
    """Update patient stage"""
    patient = User.query.get(patient_id)
    if not patient or patient.role != 'patient':
        return jsonify({'error': 'Hasta bulunamadı'}), 404
    
    data = request.get_json()
    stage = data.get('stage')
    
    if not stage or stage < 1 or stage > 4:
        return jsonify({'error': 'Geçersiz etap (1-4)'}), 400
    
    patient.stage = stage
    db.session.commit()
    
    return jsonify({'ok': True}), 200


# ── MESSAGES ──────────────────────────────────────
@admin_bp.route('/patients/<int:patient_id>/message', methods=['POST'])
@admin_required
def send_message(patient_id):
    """Send message to patient"""
    patient = User.query.get(patient_id)
    if not patient or patient.role != 'patient':
        return jsonify({'error': 'Hasta bulunamadı'}), 404
    
    data = request.get_json()
    if not data.get('content'):
        return jsonify({'error': 'Mesaj içeriği gerekli'}), 400
    
    message = Message(
        user_id=patient_id,
        sender='admin',
        content=data['content']
    )
    db.session.add(message)
    db.session.commit()
    
    return jsonify(message.to_dict()), 201


# ── SUPPLEMENTS ───────────────────────────────────
@admin_bp.route('/patients/<int:patient_id>/supplement', methods=['POST'])
@admin_required
def assign_supplement(patient_id):
    """Assign supplement to patient"""
    patient = User.query.get(patient_id)
    if not patient or patient.role != 'patient':
        return jsonify({'error': 'Hasta bulunamadı'}), 404
    
    data = request.get_json()
    if not data.get('name') or not data.get('dose'):
        return jsonify({'error': 'Ad ve dozaj gerekli'}), 400
    
    # Remove existing supplement with same name
    Supplement.query.filter_by(user_id=patient_id, name=data['name']).delete()
    
    supplement = Supplement(
        user_id=patient_id,
        name=data['name'],
        dose=data['dose'],
        usage=data.get('usage')
    )
    db.session.add(supplement)
    db.session.commit()
    
    return jsonify(supplement.to_dict()), 201


# ── STATS ─────────────────────────────────────────
@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    """Get admin dashboard stats"""
    total_patients = User.query.filter_by(role='patient').count()
    total_meals = Meal.query.count()
    total_measurements = Measurement.query.count()
    
    stage_stats = []
    for stage in [1, 2, 3, 4]:
        count = User.query.filter_by(role='patient', stage=stage).count()
        stage_stats.append({'stage': stage, 'count': count})
    
    return jsonify({
        'total_patients': total_patients,
        'total_meals': total_meals,
        'total_measurements': total_measurements,
        'stage_stats': stage_stats
    }), 200


# ── HEALTH CHECK ──────────────────────────────────
@admin_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200
