# ToDoLister - A Gamified Task Management Web App

ToDoLister is a modern, gamified task management web application built with React.js that helps users stay organized while making task completion rewarding and engaging. The app features a unique reward system where users earn gold and XP for completing tasks, which can be used to customize their in-game character.

## Features

- ✅ Task management with due dates and priorities
- 🏆 XP and gold reward system
- 🧑‍🎤 Character customization with earned rewards
- 🛒 In-game shop for character items
- 🔐 Secure JWT authentication
- 📱 Fully responsive design
- 🔄 Real-time updates

## Tech Stack

**Frontend:**
- React.js
- React Router
- Axios for API calls
- CSS Modules
- Vite build tool

**Backend:**
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Repository Structure


todolist/
├── frontend/                  # React application
│   ├── public/                # Static files
│   ├── src/
│   │   ├── assets/            # Images, fonts, etc.
│   │   ├── auth/              # Auth components
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature modules
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utilities and API config
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Application entry
├── backend/                   # Django backend
│   ├── todolist/              # Django project
│   └── api/                   # REST API
└── README.md                  # Project documentation


## Installation

1. **Clone the repository**

git clone https://github.com/yourusername/todolister.git
cd todolister


2. **Set up backend**

cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate    # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


3. **Set up frontend**

cd ../frontend
npm install
npm run dev


4. **Access the application**
Open your browser and navigate to:

http://localhost:3000


## Configuration

Create a `.env` file in the frontend directory:

VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=ToDoLister


## Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `python manage.py runserver` - Start development server
- `python manage.py test` - Run tests

## API Documentation

### Authentication
| Endpoint       | Method | Description           |
|----------------|--------|-----------------------|
| /api/login/    | POST   | User login            |
| /api/register/ | POST   | User registration     |
| /api/logout/   | POST   | User logout           |

### Tasks
| Endpoint       | Method | Description           |
|----------------|--------|-----------------------|
| /api/tasks/    | GET    | Get all tasks         |
| /api/tasks/    | POST   | Create new task       |
| /api/tasks/:id | PUT    | Update task           |
| /api/tasks/:id | DELETE | Delete task           |

## License

Distributed under the MIT License. See `LICENSE` for more information.
