# ToDoLister - A Gamified Task Management Web App

ToDoLister is a modern, gamified task management application built with React Native and Expo that helps users stay organized while making task completion rewarding and engaging. The app features a unique reward system where users earn gold and XP for completing tasks, which can be used to customize their in-game character.

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
- React Native
- Expo
- React Navigation
- AsyncStorage
- Expo Router

**Backend:**
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Repository Structure

```
frontend_test/
├── app/                      # Main application code
│   ├── (auth)/              # Authentication screens
│   ├── (tabs)/              # Main app tabs
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities and API config
│   ├── components/          # Reusable UI components
│   └── index.jsx            # Entry point
├── app.json                 # Expo configuration
└── package.json            # Project dependencies
```

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/todolister.git
cd todolister
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on your preferred platform**
```bash
# For web
npm run web

# For iOS
npm run ios

# For Android
npm run android
```

## Configuration

The application configuration is managed through `app.json`:

```json
{
  "expo": {
    "name": "ToDoLister",
    "slug": "todo",
    "version": "1.0.0"
  }
}
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm run build:web` - Build for web deployment
- `npm run deploy` - Deploy to GitHub Pages

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