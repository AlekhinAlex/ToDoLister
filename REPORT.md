Project Report: To-Do Planner with Gamification Elements
Introduction
The modern world demands effective tools for self-discipline and task management, particularly among younger audiences who often struggle with organization and motivation. A gamified To-Do planner integrates task management with role-playing game (RPG) mechanics to make planning engaging and rewarding. By incorporating elements like experience points (XP), in-game currency (gold), and character customization, the application encourages users to stay disciplined while achieving their goals.
Theoretical Part
A To-Do planner with gamification elements is a web application designed to help users manage tasks while fostering motivation through RPG-inspired mechanics. The system allows users to create accounts, set and track tasks, earn rewards (XP and gold), unlock ranks, and customize virtual characters with items purchased from an in-game shop. The primary goal is to provide an intuitive, engaging, and adaptive platform that promotes consistent task completion and self-organization.
Key advantages include:

Motivation through Gamification: Users earn rewards for completing tasks, which can be spent on character customization, making task management enjoyable.
Structured Data Management: A centralized database organizes tasks, user profiles, inventory, and shop items, enabling efficient tracking and analysis.
Cross-Platform Accessibility: The application is designed to be adaptive, ensuring seamless use on mobile devices and desktops through responsive design.

Integration with a robust backend and an interactive frontend enhances functionality, providing users with a dynamic tool to manage tasks and track progress visually.
1. Problem Statement
The objective is to develop a web application that combines task management with gamification, built using Django, PostgreSQL, and React.js. The application must include:

Logical Core Development: Create a backend to manage a database storing user profiles, tasks, inventory, shop items, and ranks, alongside a user-friendly interface.
Database Design: Design and optimize a PostgreSQL database to handle task management, user progression, and character customization.
User Features: Enable account creation, task management (create, edit, complete tasks), character personalization, reward earning, and progress tracking with visual analytics (e.g., charts for task completion).
Testing and Debugging: Ensure the application is stable, secure, and user-friendly through rigorous testing.
Responsive Design: Ensure the application adapts to various devices, particularly mobile phones, using responsive design techniques.

Figure 1: [Insert screenshot of application schema here]
1.3. Data Formalization
Data formalization is critical for ensuring the system's efficiency and scalability. This stage involves defining the structure and relationships of data entities to support task management and gamification. The main entities include:

User: Manages account details, XP, gold, and avatar.
Task: Stores task details, including title, description, difficulty, and rewards.
Shop: Contains items for character customization, with attributes like type, price, and required rank.
Inventory: Tracks user-owned items, their purchase status, and whether they are equipped.
Rank: Defines progression levels based on XP thresholds, unlocking shop items.

A relational database model was chosen, with tables linked via unique identifiers to ensure efficient data management. The system uses a RESTful API for secure client-server communication, incorporating authentication and authorization to protect user data.
2. Practical Part
2.1. Technologies Used
2.1.1. Frontend Development
The user interface is built using React.js, a JavaScript library for creating dynamic and interactive interfaces. React components ensure modularity and reusability, while Tailwind CSS is used for styling to achieve a modern, responsive design. Media queries and responsive design techniques ensure the application adapts seamlessly to mobile devices and desktops. The interface is tested iteratively to align with user needs and modern design trends.
2.1.2. Backend Development
The backend is developed using Django, a high-level Python framework that simplifies web application development. Django’s ORM (Object-Relational Mapping) enables seamless interaction with the PostgreSQL database without writing raw SQL queries. Built-in features like authentication, session management, and role-based access control streamline development and enhance security.
2.1.3. Database
PostgreSQL is used as the relational database management system due to its robustness and scalability. It stores data for users, tasks, inventory, shop items, and ranks, with relationships defined via foreign keys.
2.2. Database Structure
The database consists of five main tables:
User Table

Purpose: Stores user account details and progression data.
Structure:
id (PK): Unique identifier (auto-incremented integer).
email: Unique email for authentication (string).
username: Optional username (string).
password: Hashed password using SHA-256 (string).
avatar: Profile picture path (string, stored in 'avatars/' directory).
gold: In-game currency (integer).
xp: Experience points (integer).


Relationships: One-to-many with Task and Inventory tables.

Task Table

Purpose: Manages user tasks and their rewards.
Structure:
id (PK): Unique identifier (auto-incremented integer).
user (FK): References User table.
title: Task title (string).
description: Optional task description (string).
is_completed: Completion status (boolean).
due_date: Optional deadline (timestamp).
difficulty: Task difficulty level (1-5, integer).
type: Task type (Daily, Weekly, Permanent; string).
base_reward_xp: Base XP reward (integer).
base_reward_gold: Base gold reward (integer).
reward_xp: Calculated XP reward (integer).
reward_gold: Calculated gold reward (integer).
created_at: Creation timestamp.
updated_at: Last update timestamp.



Shop Table

Purpose: Stores items available for purchase.
Structure:
id (PK): Unique identifier (auto-incremented integer).
type: Item type (hair, top, bottom, boots; string).
name: Item name (string).
description: Item description (string).
required_rank (FK): References Rank table.
price: Cost in gold (integer).
image_preview_url: Shop display image URL (string).
image_character_url: Character display image URL (string).
is_default: Indicates default item (boolean).


Relationships: Many-to-one with Rank, one-to-many with Inventory.

Inventory Table

Purpose: Tracks user-owned items.
Structure:
id (PK): Unique identifier (auto-incremented integer).
user (FK): References User table.
item (FK): References Shop table.
is_equipped: Whether item is equipped (boolean).
is_unlocked: Whether item is unlocked (boolean).
is_purchased: Whether item is purchased (boolean).


Relationships: Many-to-one with User and Shop tables.

Rank Table

Purpose: Defines progression ranks based on XP.
Structure:
id (PK): Unique identifier (auto-incremented integer).
name: Rank name (string).
required_xp: XP threshold for rank (integer).
image: Rank image path (string, stored in 'ranks/' directory).


Relationships: One-to-many with Shop table.

2.3. Access Control
The system ensures data security and user privacy through:

Authentication: Users log in with email and password. Passwords are hashed using SHA-256.
Authorization: Role-based access control (RBAC) restricts users to their own data (tasks, inventory, etc.).
User Role:
View, create, edit, and delete their tasks.
Manage inventory and equip items.
Purchase shop items and view rank progression.
Update account settings (e.g., avatar, password).



3. Results
3.1. Authentication and Registration
The registration form includes fields for email, username (optional), password, and password confirmation, styled with Tailwind CSS for clarity and responsiveness. The login form requires email and password, maintaining a minimalist design for accessibility across devices.
Figure 2: [Insert screenshot of registration form here]Figure 3: [Insert screenshot of login form here]
3.2. Navigation Bar
The navigation bar is designed in a minimalist, horizontal layout, featuring the application logo (“To-Do Planner”) on the left and navigation links on the right (Tasks, Shop, Inventory, Profile, Logout). It is fully responsive for mobile use.
Figure 4: [Insert screenshot of navigation bar here]
3.3. Task Management and Gamification
The application provides:

Task History: A table displaying tasks with columns for title, due date, difficulty, type, and rewards. Filters allow sorting by type, completion status, or date.Figure 5: [Insert screenshot of task history table here]
Task Creation/Editing: Users can create tasks with customizable fields (title, description, difficulty, type, due date).Figure 6: [Insert screenshot of task creation form here]
Progress Visualization: A chart (e.g., bar or pie) visualizes task completion rates or XP earned over time.Figure 7: [Insert screenshot of progress chart here]
Character Customization: Users can purchase and equip items from the Shop, with a visual preview of their character.Figure 8: [Insert screenshot of character customization interface here]
Rank Progression: A progress bar shows XP and rank status, motivating users to complete tasks.Figure 9: [Insert screenshot of rank progression bar here]
Shop and Inventory: Users can browse items, purchase them with gold, and manage equipped items in their inventory.Figure 10: [Insert screenshot of shop interface here]

3.4. Filters
Filters allow users to analyze tasks by type, difficulty, completion status, or date range, enhancing task management efficiency.
Figure 11: [Insert screenshot of filter interface here]
Conclusion
The “To-Do Planner with Gamification Elements” is a multifunctional web application that combines task management with RPG mechanics to promote self-discipline. Features like task tracking, reward systems, character customization, and responsive design make it engaging and accessible. The PostgreSQL database, Django backend, and React.js frontend ensure scalability and interactivity. The application empowers users to manage tasks effectively while enjoying a gamified experience, fostering motivation and organization.
References

Боровская, Т. Н. Визуализация данных в финансовых приложениях: технологии и тенденции. // Научно-практический журнал «Экономическая информатика». – 2020. – Том 18, №2. – С. 38–47.
Кларк, Р. Дж., Стивенсон, Д. Финансовые приложения: разработка и дизайн. – London: Routledge, 2020. – 316 p.
Нестеров, О. В. Интерфейсы веб-приложений: разработка и оценка удобства. – М.: Бином, 2018. – 290 с.
Django Documentation: https://docs.djangoproject.com/
React.js Documentation: https://react.dev/
PostgreSQL Documentation: https://www.postgresql.org/docs/

