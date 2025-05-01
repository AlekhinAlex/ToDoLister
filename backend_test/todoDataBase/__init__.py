# ToDoLister

A gamified todo list application where users can earn gold and experience points by completing tasks, and customize their character with items from the shop.

## Project Structure

The project consists of two main parts:
- `backend_test/` - Django backend
- `frontend_test/` - React Native/Expo frontend

## Backend Setup

### Prerequisites
- Python 3.x
- PostgreSQL
- Django 4.2.x

### Installation

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend_test
pip install -r requirements.txt
```

3. Configure the database in `myproject/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'tododb_v1',
        'USER': 'todolist',
        'PASSWORD': 'ADmIN123',
        'HOST': 'localhost',
        'PORT': '',
    }
}
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Populate the shop with default items:
```bash
python scripts/populate_shop.py
```

6. Start the development server:
```bash
python manage.py runserver
```

## Frontend Setup

### Prerequisites
- Node.js
- Expo CLI

### Installation

1. Install dependencies:
```bash
cd frontend_test
npm install
```

2. Start the development server:
```bash
npm start
```

The application can be run on:
- Web: Press `w` to open in web browser
- Android: Press `a` to open in Android emulator
- iOS: Press `i` to open in iOS simulator

## Features

- User authentication (sign up/sign in)
- Task management with difficulty levels
- Reward system (gold and XP) for completing tasks
- Character customization shop
- Inventory management
- Profile customization

## API Endpoints

The backend provides the following main endpoints:

- `/api/login/` - User authentication
- `/api/register/` - User registration
- `/api/tasks/` - Task management
- `/api/user/` - User profile management
- `/api/character/` - Character customization
- `/api/shop/` - Shop items management

## Development

The project uses:
- JWT authentication with token refresh
- PostgreSQL database
- Expo Router for navigation
- React Native for mobile UI
- Django REST Framework for API

## Deployment

The frontend is configured for deployment to GitHub Pages:

```bash
cd frontend_test
npm run deploy
```

The application will be deployed to: https://AlekhinALex.github.io/ToDoLister