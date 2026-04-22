from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user (patient)"""
    data = request.get_json()
    
    # Validation
    if not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Email, şifre ve ad gerekli'}), 400
    
    if data.get('admin_code') != 'enli':
        return jsonify({'error': 'Admin kodu hatalı'}), 400
    
    # Check if email exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Bu email zaten kayıtlı'}), 400
    
    # Create user
    user = User(
        name=data['name'],
        email=data['email'],
        role='patient',
        weight=data.get('weight'),
        stage=1
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create JWT token
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(days=30)
    )
    
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email ve şifre gerekli'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Email veya şifre hatalı'}), 401
    
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(days=30)
    )
    
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current logged in user"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
    
    return jsonify(user.to_dict()), 200
