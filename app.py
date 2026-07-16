from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from config import config
from database.db import db
from routes import articles_bp, events_bp
import os

def create_app(config_name='default'):
    app = Flask(__name__, 
                static_folder='static',
                template_folder='templates')
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    app.register_blueprint(articles_bp)
    app.register_blueprint(events_bp)
    
    # Serve frontend
    @app.route('/')
    def index():
        return render_template('index.html')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {
            'status': 'error',
            'message': 'Resource not found'
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {
            'status': 'error',
            'message': 'Internal server error'
        }, 500
    
    return app

if __name__ == '__main__':
    app = create_app('development')
    app.run(host='0.0.0.0', port=3000, debug=True)