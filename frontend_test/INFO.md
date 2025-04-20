# ToDoLister - A Gamified Task Management Mobile App with Authentication

ToDoLister is a React Native mobile application that combines task management with gamification elements. Users can create, track, and complete tasks while earning rewards like gold and experience points (XP), making productivity more engaging and rewarding.

The application features a comprehensive authentication system with token-based security, responsive UI design that adapts to both mobile and desktop views, and a modern gradient-based interface. Tasks can be created, edited, completed, and cancelled, with each completion awarding the user with gold and XP that can be used in the integrated shop system.

## Repository Structure
```
.
├── app/                          # Main application directory
│   ├── (auth)/                  # Authentication related screens
│   │   ├── sign-in.jsx         # User login screen with token management
│   │   └── sign-up.jsx         # New user registration screen
│   ├── (tabs)/                 # Main application tabs
│   │   ├── hooks/             # Custom React hooks for auth and data management
│   │   ├── lib/              # Utility functions and API integration
│   │   ├── profile.jsx       # User profile management screen
│   │   ├── shop.jsx         # In-app shop for spending earned gold
│   │   └── tasks.jsx        # Task management main screen
│   ├── components/          # Reusable UI components
│   └── index.jsx           # Application entry point with welcome screen
├── app.json                # Expo configuration file
├── index.js               # Root entry point registering the Expo app
├── package.json           # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Usage Instructions
### Prerequisites
- Node.js (v14 or higher)
- Expo CLI (`npm install -g expo-cli`)
- React Native development environment
- For iOS: Xcode (Mac only)
- For Android: Android Studio with SDK

### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd ToDoLister
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Quick Start
1. Launch the app and create an account:
```javascript
// Navigate to sign-up screen
router.navigate('/sign-up');

// Register with email and password
await signUp({
  email: 'user@example.com',
  password: 'securepassword'
});
```

2. Create and manage tasks:
```javascript
// Create a new task
const task = {
  title: 'Complete project',
  description: 'Finish the React Native project',
  reward: {
    gold: 100,
    xp: 50
  }
};
```

### More Detailed Examples
1. Task Management:
```javascript
// Complete a task and earn rewards
const completeTask = async (taskId) => {
  const result = await api.completeTask(taskId);
  if (result.success) {
    updateUserBalance(result.rewards);
  }
};
```

2. Shop Integration:
```javascript
// Purchase items with earned gold
const purchaseItem = async (itemId) => {
  const response = await api.purchaseItem(itemId);
  if (response.success) {
    updateInventory(response.item);
  }
};
```

### Troubleshooting
1. Authentication Issues
- Error: "Token expired"
  - Solution: The app will automatically refresh tokens. If issues persist, log out and log back in.
  - Debug: Check token expiration with `isTokenExpired(token)`.

2. Task Synchronization
- Issue: Tasks not updating
  - Solution: Pull to refresh the task list
  - Debug: Enable verbose logging with `AsyncStorage.setItem('debug', 'true')`

## Data Flow
ToDoLister follows a client-server architecture with local storage for offline capabilities.

```ascii
[User Input] -> [React Native UI] -> [API Layer]
      ↑               ↓               ↓
      └─── [Local Storage] <── [Server Response]
```

Key component interactions:
1. Authentication tokens are stored in AsyncStorage
2. Tasks are cached locally and synced with the server
3. User rewards are processed server-side and updated locally
4. Shop transactions require server validation
5. Profile updates are immediately reflected in UI and queued for sync