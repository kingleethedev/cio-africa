# CIO Africa - Article & Events Dashboard

## Overview

This is a full-stack web application built for CIO Africa's technical assessment. The application allows an internal team to manage technology articles and upcoming events through a simple and easy-to-use dashboard. It is built using Flask for the backend, SQLite for the database and HTML, CSS, and JavaScript for the frontend.

## Tech Stack

* **Backend:** Flask - python framework
* **Database:** SQLite
* **Frontend:** HTML, CSS and JavaScript


## Why I Chose Flask

I chose Flask because I am more comfortable building REST APIs with Python. Flask is lightweight, easy to organize and works well with SQLite. It also allows me to build a clean backend without adding unnecessary complexity, making it a good choice for this project.

## Features

* View all articles
* Add new articles
* View upcoming events
* Add new events
* Search and filter articles by category or author
* Responsive design for desktop and mobile devices
* Input validation to prevent empty fields and invalid dates
* Clear error messages and appropriate HTTP status codes

## Installation

Live Demo: https://cio.pythonanywhere.com/

### Requirements

* Python 3.8 or later
* pip

### Setup

1. Clone the repository

```bash
git clone https://github.com/kingleethedev/cio-africa.git
cd cio
```

2. Create a virtual environment

```bash
python -m venv venv
```

3. Activate the virtual environment

**Windows**

```bash
venv\Scripts\activate
```

**macOS/Linux**

```bash
source venv/bin/activate
```

4. Install the required packages

```bash
pip install -r requirements.txt
```

5. Initialize the database

```bash
python init_db.py
```

6. Start the application

```bash
python app.py
```

7. Open your browser and visit:

```text
http://127.0.0.1:3000
```

## Assumptions

* The application is intended for internal use, so user authentication was not included.
* I choose SQLite because it is lightweight and easy to set up.
* Sample data is added to make it easier to test the application.

## If I Had More Time

If I had more time, I would add:

* User authentication and authorization
* Pagination for long lists of articles
* Unit tests for the API
* Docker support for easier deployment 
  
