from flask import Blueprint, request, jsonify
from datetime import datetime
from database.db import db
from models.article import Article

articles_bp = Blueprint('articles', __name__, url_prefix='/api/articles')

def validate_article_data(data):
    """Validate article data"""
    errors = []
    
    required_fields = ['title', 'author', 'category', 'published_date', 'summary']
    for field in required_fields:
        if field not in data or not data[field] or not str(data[field]).strip():
            errors.append(f'{field} is required')
    
    if 'title' in data and data['title']:
        if len(data['title'].strip()) < 3:
            errors.append('Title must be at least 3 characters')
        if len(data['title']) > 200:
            errors.append('Title must be less than 200 characters')
    
    if 'author' in data and data['author']:
        if len(data['author'].strip()) < 2:
            errors.append('Author must be at least 2 characters')
        if len(data['author']) > 100:
            errors.append('Author must be less than 100 characters')
    
    if 'category' in data and data['category']:
        if len(data['category'].strip()) < 2:
            errors.append('Category must be at least 2 characters')
        if len(data['category']) > 50:
            errors.append('Category must be less than 50 characters')
    
    if 'published_date' in data and data['published_date']:
        try:
            datetime.strptime(data['published_date'], '%Y-%m-%d')
        except ValueError:
            errors.append('Published date must be in YYYY-MM-DD format')
    
    if 'summary' in data and data['summary']:
        if len(data['summary'].strip()) < 10:
            errors.append('Summary must be at least 10 characters')
    
    return errors

@articles_bp.route('/', methods=['GET'])
def get_articles():
    """Get all articles with optional filters"""
    try:
        query = Article.query
        
        # Apply filters
        category = request.args.get('category')
        author = request.args.get('author')
        search = request.args.get('search')
        sort = request.args.get('sort', 'published_date')
        order = request.args.get('order', 'desc')
        
        if category:
            query = query.filter(Article.category.ilike(f'%{category}%'))
        
        if author:
            query = query.filter(Article.author.ilike(f'%{author}%'))
        
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                db.or_(
                    Article.title.ilike(search_term),
                    Article.author.ilike(search_term),
                    Article.summary.ilike(search_term)
                )
            )
        
        # Apply sorting
        if sort in ['title', 'author', 'published_date']:
            column = getattr(Article, sort)
            if order.lower() == 'desc':
                query = query.order_by(column.desc())
            else:
                query = query.order_by(column.asc())
        
        articles = query.all()
        return jsonify({
            'status': 'success',
            'data': [article.to_dict() for article in articles],
            'count': len(articles)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@articles_bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Get single article by ID"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({
                'status': 'error',
                'message': 'Article not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': article.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@articles_bp.route('/', methods=['POST'])
def create_article():
    """Create a new article"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        errors = validate_article_data(data)
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        article = Article(
            title=data['title'].strip(),
            author=data['author'].strip(),
            category=data['category'].strip(),
            published_date=datetime.strptime(data['published_date'], '%Y-%m-%d').date(),
            summary=data['summary'].strip()
        )
        
        db.session.add(article)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Article created successfully',
            'data': article.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@articles_bp.route('/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    """Update an existing article"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({
                'status': 'error',
                'message': 'Article not found'
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        errors = validate_article_data(data)
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        if 'title' in data:
            article.title = data['title'].strip()
        if 'author' in data:
            article.author = data['author'].strip()
        if 'category' in data:
            article.category = data['category'].strip()
        if 'published_date' in data:
            article.published_date = datetime.strptime(data['published_date'], '%Y-%m-%d').date()
        if 'summary' in data:
            article.summary = data['summary'].strip()
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Article updated successfully',
            'data': article.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@articles_bp.route('/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    """Delete an article"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({
                'status': 'error',
                'message': 'Article not found'
            }), 404
        
        db.session.delete(article)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Article deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500