# AskVerse 🌐

A modern, full-stack question-and-answer platform inspired by Quora, built with Spring Boot and React. AskVerse enables users to ask questions, provide answers, engage in discussions through comments, and personalize their feed by following topics of interest.

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-green?style=flat-square)
![React](https://img.shields.io/badge/React-19.1-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square)

## 🚀 Live Demo

- **Frontend Application**: [https://askverse-client.vercel.app](https://askverse-client.vercel.app)
- **Backend API**: [https://askverse-db8w.onrender.com/api/health](https://askverse-db8w.onrender.com/api/health)
- **API Documentation**: [https://askverse-db8w.onrender.com/swagger-ui/index.html](https://askverse-db8w.onrender.com/swagger-ui/index.html)

> **Note**: The backend is hosted on Render's free tier and may take ~1 minute to wake up on first request.

## ✨ Features

### Core Functionality
- 📝 **Question Management**: Create, read, update, and delete questions with rich text support
- 💬 **Answer System**: Post detailed answers and engage with the community
- 💭 **Comments**: Add nested comments on answers for in-depth discussions
- 🏷️ **Tag System**: Follow specific tags to personalize your content feed
- 📊 **Smart Feed**: Personalized feed based on followed tags with fallback to all questions
- 👤 **User Profiles**: Comprehensive user profiles with activity tracking

### User Experience
- 🔐 **Secure Authentication**: JWT-based authentication and authorization
- 🎨 **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- 🔍 **Search & Filter**: Search questions and filter by tags
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- ⚡ **Real-time Updates**: Dynamic content updates using Redux state management

### Developer Features
- 📚 **API Documentation**: Interactive Swagger/OpenAPI documentation
- 🐳 **Dockerized**: Containerized application for easy deployment
- 🔒 **Security**: Spring Security with JWT tokens and CORS configuration
- 🎯 **Type Safety**: Full TypeScript support on frontend

## 🛠️ Tech Stack

### Backend
- **Java 21** - Modern Java features and performance
- **Spring Boot 3.5** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence layer
- **Hibernate** - ORM framework
- **MySQL 8.0** - Relational database (Aiven Cloud)
- **Gradle** - Build automation
- **JWT (JSON Web Tokens)** - Secure authentication
- **Swagger/OpenAPI 3** - API documentation
- **Docker** - Containerization
- **Cloudinary** - Image/media storage

### Frontend
- **React 19.1** - UI library
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library

## 📁 Project Structure

```
AskVerse/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/Quora/
│   │   │   │   ├── configurations/    # Security, CORS, etc.
│   │   │   │   ├── controllers/       # REST API endpoints
│   │   │   │   ├── dtos/              # Request/Response DTOs
│   │   │   │   ├── exceptions/        # Custom exceptions
│   │   │   │   ├── filters/           # JWT authentication filter
│   │   │   │   ├── models/            # JPA entities
│   │   │   │   ├── repository/        # Data access layer
│   │   │   │   ├── services/          # Business logic
│   │   │   │   └── utils/             # Utility classes
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── build.gradle
│   ├── Dockerfile
│   └── README.md
│
└── frontend/                   # React frontend
    ├── src/
    │   ├── components/         # Reusable UI components
    │   ├── config/             # API configuration
    │   ├── features/           # Feature-specific components
    │   │   ├── answers/
    │   │   ├── comments/
    │   │   ├── questions/
    │   │   └── tags/
    │   ├── pages/              # Page components
    │   │   ├── AskQuestionPage.tsx
    │   │   ├── FeedPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── ProfilePage.tsx
    │   │   ├── QuestionDetailsPage.tsx
    │   │   ├── SignupPage.tsx
    │   │   ├── TagDetailsPage.tsx
    │   │   └── TagsPage.tsx
    │   ├── store/              # Redux store
    │   ├── utils/              # Utility functions
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    └── README.md
```

## 🔧 Prerequisites

- **Java 21** or higher
- **Gradle 8.14+**
- **MySQL 8.0+**
- **Node.js 18+** and **npm**
- **Docker** (optional, for containerized deployment)

## ⚙️ Installation & Setup

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/himansh025/AskVerse.git
   cd AskVerse/backend
   ```

2. **Configure MySQL Database**
   
   Create a database in MySQL:
   ```sql
   CREATE DATABASE askverse;
   ```

3. **Update Application Properties**
   
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/askverse
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   spring.jwt.secret=your_jwt_secret_key_here
   
   # CORS Configuration
   app.cors.local-origins=http://localhost:5173
   app.cors.production-origins=https://your-frontend-domain.com
   
   # Cloudinary (optional, for image uploads)
   cloudinary.cloud_name=your_cloud_name
   cloudinary.api_key=your_api_key
   cloudinary.api_secret=your_api_secret
   ```

4. **Build the project**
   ```bash
   ./gradlew build
   ```

5. **Run the application**
   ```bash
   ./gradlew bootRun
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create/edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### Docker Deployment

1. **Backend Docker**
   ```bash
   cd backend
   docker build -t askverse-backend:latest .
   docker run -p 8080:8080 askverse-backend:latest
   ```

2. **Frontend Docker** (optional)
   ```bash
   cd frontend
   npm run build
   # Serve the dist folder using nginx or similar
   ```

## 📚 API Documentation

Once the backend is running, access the interactive Swagger UI at:
- **Local**: `http://localhost:8080/swagger-ui/index.html`
- **Production**: `https://askverse-db8w.onrender.com/swagger-ui/index.html`

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

#### Questions
- `GET /api/v1/questions/all` - Get all questions (paginated)
- `GET /api/v1/questions/{id}` - Get question by ID
- `POST /api/v1/questions` - Create new question
- `PUT /api/v1/questions/{id}` - Update question
- `DELETE /api/v1/questions/{id}` - Delete question

#### Answers
- `GET /api/v1/answers/question/{questionId}` - Get answers for a question
- `POST /api/v1/answers` - Create new answer
- `PUT /api/v1/answers/{id}` - Update answer
- `DELETE /api/v1/answers/{id}` - Delete answer

#### Tags
- `GET /api/v1/tags` - Get all tags
- `GET /api/v1/tags/{id}/details` - Get tag details with questions
- `POST /api/v1/tags/{tagId}/follow` - Follow a tag
- `DELETE /api/v1/tags/{tagId}/unfollow` - Unfollow a tag

#### Feed
- `GET /api/v1/feed/{userId}` - Get personalized feed

#### Users
- `GET /api/v1/users/{userId}/profile` - Get user profile

## 🔐 Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints:

1. Register or login to receive a JWT token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## 🎨 Frontend Features

### Pages
- **Feed Page**: Personalized question feed based on followed tags
- **Ask Question**: Rich text editor for creating questions with tag selection
- **Question Details**: View question, answers, and comments
- **Tags Page**: Browse and follow tags
- **Tag Details**: View all questions for a specific tag
- **Profile Page**: User profile with activity history
- **Login/Signup**: Authentication pages

### State Management
Redux Toolkit is used for global state management with slices for:
- Authentication state
- User data
- Questions
- Answers
- Tags

## 🚀 Deployment

### Backend (Render)
The backend is deployed on Render with:
- Automatic deployments from GitHub
- Environment variables configured in Render dashboard
- MySQL database hosted on Aiven Cloud

### Frontend (Vercel)
The frontend is deployed on Vercel with:
- Automatic deployments from GitHub
- Environment variables configured in Vercel dashboard
- Optimized build for production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Himanshu**
- GitHub: [@himansh025](https://github.com/himansh025)

## 🙏 Acknowledgments

- Inspired by Quora's question-and-answer platform
- Built with modern web technologies and best practices
- Special thanks to the Spring Boot and React communities

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ by Himanshu**
