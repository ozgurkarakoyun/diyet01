from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='patient')  # patient, admin
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    age = db.Column(db.Integer)
    city = db.Column(db.String(255))
    stage = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    weights = db.relationship('Weight', backref='user', lazy=True, cascade='all, delete-orphan')
    measurements = db.relationship('Measurement', backref='user', lazy=True, cascade='all, delete-orphan')
    meals = db.relationship('Meal', backref='user', lazy=True, cascade='all, delete-orphan')
    messages = db.relationship('Message', backref='user', lazy=True, cascade='all, delete-orphan')
    supplements = db.relationship('Supplement', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'weight': self.weight,
            'stage': self.stage,
            'created_at': self.created_at.isoformat()
        }


class Weight(db.Model):
    __tablename__ = 'weights'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    weight = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'weight': self.weight,
            'recorded_at': self.recorded_at.isoformat()
        }


class Measurement(db.Model):
    __tablename__ = 'measurements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    kilo = db.Column(db.Float)
    boyun = db.Column(db.Float)
    ust_gogus = db.Column(db.Float)
    gogus = db.Column(db.Float)
    alt_gogus = db.Column(db.Float)
    kol = db.Column(db.Float)
    bel = db.Column(db.Float)
    gobek = db.Column(db.Float)
    kalca = db.Column(db.Float)
    bacak = db.Column(db.Float)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'kilo': self.kilo,
            'boyun': self.boyun,
            'ust_gogus': self.ust_gogus,
            'gogus': self.gogus,
            'alt_gogus': self.alt_gogus,
            'kol': self.kol,
            'bel': self.bel,
            'gobek': self.gobek,
            'kalca': self.kalca,
            'bacak': self.bacak,
            'recorded_at': self.recorded_at.isoformat()
        }


class Meal(db.Model):
    __tablename__ = 'meals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    meal = db.Column(db.Text, nullable=False)
    stage = db.Column(db.Integer, default=1)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'meal': self.meal,
            'stage': self.stage,
            'logged_at': self.logged_at.isoformat()
        }


class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    sender = db.Column(db.String(50), default='admin')  # admin, system
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }


class Supplement(db.Model):
    __tablename__ = 'supplements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)  # Restore, Acti
    dose = db.Column(db.String(255))
    usage = db.Column(db.String(255))
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'dose': self.dose,
            'usage': self.usage,
            'assigned_at': self.assigned_at.isoformat()
        }
