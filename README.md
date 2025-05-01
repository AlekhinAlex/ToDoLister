# ToDoLister: A Gamified Task Management System with Character Customization

ToDoLister is a full-stack web application that transforms traditional todo lists into an engaging gaming experience. Users earn gold and experience points (XP) by completing tasks, which they can use to customize their character with items from an in-game shop.

The application combines task management functionality with RPG-like progression elements, encouraging users to stay productive through gamification mechanics. Built with Django REST Framework for the backend and React Native/Expo for the frontend, ToDoLister provides a responsive and interactive user experience across web and mobile platforms.

## Repository Structure
```
.
├── backend_test/                 # Django backend application
│   ├── docs/                     # Infrastructure documentation and diagrams
│   │   └── README.md             # Documentation guidelines and architecture overview
│   ├── myproject/               # Django project configuration
│   │   └── README.md            # Project settings and configuration guide
│   ├── scripts/                 # Utility scripts (e.g., shop population)
│   │   └── README.md           # Script usage instructions and examples
│   ├── todoDataBase/           # Main Django app with models and views
│   │   ├── migrations/         # Database schema migrations
│   │   │   └── README.md      # Migration management guidelines
│   │   ├── models.py          # Data models for users, tasks, and inventory
│   │   ├── views.py           # API endpoint implementations
│   │   ├── urls.py            # API route definitions
│   │   └── README.md         # API documentation and development guide
│   └── requirements.txt        # Python dependencies
│   └── README.md              # Backend setup and deployment instructions
├── frontend_test/               # React Native/Expo frontend
│   ├── app/                    # Application screens and components
│   │   ├── (auth)/            # Authentication-related screens
│   │   │   └── README.md     # Auth flow documentation
│   │   ├── (tabs)/            # Main application tabs
│   │   │   └── README.md    # Navigation structure
│   │   └── components/        # Reusable UI components
│   │       └── README.md    # Component library documentation
│   └── package.json           # JavaScript dependencies and scripts
│   └── README.md             # Frontend development guide
└── README.md                  # Main project documentation (this file)
```

## Usage Instructions
### Prerequisites
- Python 3.x
- PostgreSQL
- Node.js
- Expo CLI
- Django 4.2.x

### Installation

#### Backend Setup
1. Create and activate a virtual environment:
```bash
cd backend_test
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure PostgreSQL database in `myproject/settings.py`:
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

4. Run migrations and populate shop:
```bash
python manage.py migrate
python scripts/populate_shop.py
```

5. Start the backend server:
```bash
python manage.py runserver
```

#### Frontend Setup
1. Install dependencies:
```bash
cd frontend_test
npm install
```

2. Start the development server:
```bash
npm start
```

### Quick Start
1. Create an account using the sign-up screen
2. Log in with your credentials
3. Create your first task by clicking the "+" button
4. Set task difficulty and description
5. Complete tasks to earn gold and XP
6. Visit the shop to customize your character

### More Detailed Examples

#### Creating a Task with Difficulty
```javascript
const task = {
  title: "Complete Project Documentation",
  description: "Write comprehensive documentation for the API",
  difficulty: 3, // Medium difficulty
};
```

#### Character Customization
```javascript
// Purchase an item from the shop
await buyItem(itemId);

// Equip item from inventory
await equipItem(itemId);
```

### Troubleshooting

#### Common Issues

1. Database Connection Errors
```
Error: Connection refused
```
- Verify PostgreSQL is running
- Check database credentials in settings.py
- Ensure database exists and is accessible

2. Token Authentication Issues
```
Error: Invalid token
```
- Clear browser storage
- Re-login to obtain new tokens
- Check token expiration settings in settings.py

#### Debug Mode
Enable debug mode in Django:
```python
# myproject/settings.py
DEBUG = True
```

Log locations:
- Backend: `backend_test/logs/debug.log`
- Frontend: Browser console or Expo development tools

## Data Flow
The application follows a client-server architecture where the frontend communicates with the Django backend via REST APIs. Tasks and user data are stored in PostgreSQL.

```ascii
[Frontend (React Native)] <-> [Django REST API] <-> [PostgreSQL Database]
     |                           |                         |
User Interface         Task/Inventory Management    Data Persistence
```

Key component interactions:
1. User authentication via JWT tokens
2. Task creation and status updates
3. Reward calculation based on task difficulty
4. Character customization through inventory system
5. Shop item management and purchases
6. User progress tracking (XP and gold)