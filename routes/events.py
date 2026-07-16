from flask import Blueprint, request, jsonify
from datetime import datetime
from database.db import db
from models.event import Event

events_bp = Blueprint('events', __name__, url_prefix='/api/events')

def validate_event_data(data):
    """Validate event data"""
    errors = []
    
    required_fields = ['name', 'location', 'date', 'description']
    for field in required_fields:
        if field not in data or not data[field] or not str(data[field]).strip():
            errors.append(f'{field} is required')
    
    if 'name' in data and data['name']:
        if len(data['name'].strip()) < 3:
            errors.append('Event name must be at least 3 characters')
        if len(data['name']) > 200:
            errors.append('Event name must be less than 200 characters')
    
    if 'location' in data and data['location']:
        if len(data['location'].strip()) < 2:
            errors.append('Location must be at least 2 characters')
        if len(data['location']) > 200:
            errors.append('Location must be less than 200 characters')
    
    if 'date' in data and data['date']:
        try:
            event_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            if event_date < datetime.now().date():
                errors.append('Event date must be in the future')
        except ValueError:
            errors.append('Date must be in YYYY-MM-DD format')
    
    if 'description' in data and data['description']:
        if len(data['description'].strip()) < 10:
            errors.append('Description must be at least 10 characters')
    
    return errors

@events_bp.route('/', methods=['GET'])
def get_events():
    """Get all upcoming events"""
    try:
        today = datetime.now().date()
        events = Event.query.filter(Event.date >= today).order_by(Event.date.asc()).all()
        
        return jsonify({
            'status': 'success',
            'data': [event.to_dict() for event in events],
            'count': len(events)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@events_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Get single event by ID"""
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({
                'status': 'error',
                'message': 'Event not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': event.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@events_bp.route('/', methods=['POST'])
def create_event():
    """Create a new event"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        errors = validate_event_data(data)
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        event = Event(
            name=data['name'].strip(),
            location=data['location'].strip(),
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            description=data['description'].strip()
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Event created successfully',
            'data': event.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@events_bp.route('/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    """Update an existing event"""
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({
                'status': 'error',
                'message': 'Event not found'
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        errors = validate_event_data(data)
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        if 'name' in data:
            event.name = data['name'].strip()
        if 'location' in data:
            event.location = data['location'].strip()
        if 'date' in data:
            event.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'description' in data:
            event.description = data['description'].strip()
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Event updated successfully',
            'data': event.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@events_bp.route('/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """Delete an event"""
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({
                'status': 'error',
                'message': 'Event not found'
            }), 404
        
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Event deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500