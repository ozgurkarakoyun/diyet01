import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models import db, User
from auth import auth_bp
from patient import patient_bp
from admin import admin_bp
import bcrypt

load_dotenv()

def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'sqlite:///diyet.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key-change-this')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 30 * 24 * 60 * 60  # 30 days
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    JWTManager(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(admin_bp)
    
    # Create tables and seed data
    with app.app_context():
        db.create_all()
        
        # Seed admin if not exists
        admin = User.query.filter_by(email='admin@diyet.com').first()
        if not admin:
            admin = User(
                name='Admin',
                email='admin@diyet.com',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('✅ Admin kullanıcısı oluşturuldu: admin@diyet.com / admin123')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Endpoint bulunamadı'}), 404
    
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Sunucu hatası'}), 500
    
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'}), 200
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
