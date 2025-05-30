# TodoLister - Gamified Task Management Web App

TodoLister is a gamified task management web application that helps users make everyday tasks more engaging through game-like elements such as experience points, gold, and character customization.

## Features

- **Task Management**: Create, edit, complete, and delete tasks
- **Gamification**: Earn XP and gold for completing tasks
- **Difficulty Levels**: Set task difficulty to earn more rewards
- **Rank System**: Progress through ranks as you gain experience
- **Character Customization**: Unlock and purchase items for your character
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack

### Backend
- **Django**: Web framework for the backend
- **Django REST Framework**: For building the REST API
- **PostgreSQL**: Database for storing user data, tasks, and inventory
- **JWT Authentication**: For secure user authentication

### Frontend
- **React**: For cross-platform mobile and web support
- **React Navigation**: For navigation between screens
- **AsyncStorage**: For local storage of authentication tokens
- **Linear Gradient**: For UI styling

## Project Structure

The project is organized into two main directories:

### Backend
- Django REST API with the following apps:
  - `todoDataBase`: Main app containing models, views, and serializers
  - `myproject`: Project configuration

### Frontend
- React app with the following structure:
  - `app/(auth)`: Authentication screens (login, register)
  - `app/(tabs)`: Main app screens (tasks, profile, shop)
  - `app/components`: Reusable UI components
  - `app/(tabs)/lib`: Utility functions and API calls

## Database Schema

The application uses the following main models:

- **User**: Extended Django user model with gold and XP
- **Task**: User tasks with difficulty, rewards, and completion status
- **Shop**: Items that can be purchased for character customization
- **Inventory**: User's owned items and their status (equipped, unlocked)
- **Rank**: Experience-based ranks that users can achieve

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/todolist.git
cd todolist/backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up the PostgreSQL database:
```bash
# Create a database named tododb_v1
# Create a user named todolist with password ADmIN123
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open the app:
   - Web: Open http://localhost:8081 in your browser
   - Mobile: Scan the QR code with the Expo Go app

## API Endpoints

### Authentication
- `POST /api/register/`: Register a new user
- `POST /api/login/`: Login and get JWT tokens
- `POST /api/token/refresh/`: Refresh JWT token
- `POST /api/logout/`: Logout and blacklist token

### Tasks
- `GET /api/tasks/`: Get all tasks for the current user
- `POST /api/tasks/`: Create a new task
- `PUT /api/tasks/{id}/`: Update a task
- `POST /api/tasks/{id}/complete/`: Mark a task as completed
- `POST /api/tasks/{id}/uncomplete/`: Mark a task as not completed
- `POST /api/tasks/{id}/delete/`: Delete a task

### Character & Shop
- `GET /api/character/get-character/`: Get user character data
- `POST /api/character/change-item/`: Change equipped item
- `GET /api/shop/`: Get all shop items
- `POST /api/shop/{id}/unlock/`: Unlock a shop item
- `POST /api/shop/{id}/purchase/`: Purchase a shop item

### User
- `GET /api/user/me/`: Get current user data
- `POST /api/user/upload_avatar/`: Upload user avatar

## Mobile Support

The app is designed to work on both web and mobile platforms:
- Responsive design adapts to different screen sizes
- Touch-friendly UI elements
- Native-like experience on mobile devices

## Future Enhancements

- Daily and weekly challenges
- Social features (friends, leaderboards)
- Achievements system
- More character customization options
- Dark/light theme support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons from Ionicons
- UI inspiration from various gamified productivity apps