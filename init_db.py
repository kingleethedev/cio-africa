#!/usr/bin/env python
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from database.db import db
from models import Article, Event

def init_database():
    """Initialize database with sample data"""
    app = create_app('development')
    
    with app.app_context():
        # Drop and create tables
        db.drop_all()
        db.create_all()
        print("Database tables created")
        
        # Sample articles
        articles = [
            Article(
                title="Africa's Tech Ecosystem: A 2026 Outlook",
                author="John Kamau",
                category="Technology",
                published_date=datetime.now().date() - timedelta(days=5),
                summary="An in-depth look at the rapidly growing technology ecosystem across Africa, highlighting key trends and opportunities for 2026."
            ),
            Article(
                title="Cybersecurity Threats in the Digital Age",
                author="Sarah Ochieng",
                category="Security",
                published_date=datetime.now().date() - timedelta(days=12),
                summary="Understanding the evolving cybersecurity landscape and what organizations need to do to protect their digital assets."
            ),
            Article(
                title="The Rise of AI in African Healthcare",
                author="Dr. Kwame Mensah",
                category="Healthcare",
                published_date=datetime.now().date() - timedelta(days=20),
                summary="How artificial intelligence is revolutionizing healthcare delivery across the African continent, from diagnostics to treatment."
            ),
            Article(
                title="Digital Banking Revolution: Africa's Fintech Boom",
                author="Grace Mwangi",
                category="Fintech",
                published_date=datetime.now().date() - timedelta(days=3),
                summary="Exploring the rapid growth of digital banking and fintech solutions that are transforming financial services in Africa."
            ),
            Article(
                title="Sustainable Energy Solutions for Off-Grid Communities",
                author="Dr. James Oduor",
                category="Energy",
                published_date=datetime.now().date() - timedelta(days=8),
                summary="Innovative renewable energy solutions bringing electricity to remote communities across Africa."
            ),
            Article(
                title="E-Learning Platforms: The Future of African Education",
                author="Mary Akinyi",
                category="Education",
                published_date=datetime.now().date() - timedelta(days=15),
                summary="How digital learning platforms are bridging the education gap and providing quality education to students across Africa."
            )
        ]
        
        for article in articles:
            db.session.add(article)
        
        # Sample events
        events = [
            Event(
                name="CIO Africa Tech Summit 2026",
                location="Nairobi, Kenya",
                date=datetime.now().date() + timedelta(days=30),
                description="Annual technology summit bringing together CIOs and technology leaders from across Africa to discuss digital transformation."
            ),
            Event(
                name="Digital Innovation Conference",
                location="Lagos, Nigeria",
                date=datetime.now().date() + timedelta(days=45),
                description="A conference focused on digital innovation, entrepreneurship, and the future of work in Africa."
            ),
            Event(
                name="Cybersecurity Forum 2026",
                location="Cape Town, South Africa",
                date=datetime.now().date() + timedelta(days=60),
                description="A forum bringing together cybersecurity experts to discuss emerging threats and defense strategies."
            ),
            Event(
                name="Fintech Africa Conference",
                location="Kigali, Rwanda",
                date=datetime.now().date() + timedelta(days=75),
                description="Exploring the future of financial technology and its impact on African economies."
            ),
            Event(
                name="AI and Data Science Workshop",
                location="Accra, Ghana",
                date=datetime.now().date() + timedelta(days=90),
                description="Hands-on workshop on artificial intelligence and data science applications for African businesses."
            )
        ]
        
        for event in events:
            db.session.add(event)
        
        db.session.commit()
        print(f"Seeded {len(articles)} articles and {len(events)} events")
        print("Database initialization complete!")

if __name__ == '__main__':
    init_database()