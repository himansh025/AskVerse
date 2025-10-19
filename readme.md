# AskVerse

A robust Quora like platform built with Java Spring Boot where users can post questions, provide answers, comment on answers, and follow tags of interest.

## 🚀 Live Demo

- **Application**: [https://askverse-db8w.onrender.com/api/health](https://askverse-db8w.onrender.com/api/health)
- **API Documentation**: [https://askverse-db8w.onrender.com/swagger-ui/index.html](https://askverse-db8w.onrender.com/swagger-ui/index.html)

## 📋 Features

- **Question Management**: Create, read, update, and delete questions
- **Answer System**: Post answers to questions and engage with the community
- **Comments**: Add comments on answers for detailed discussions
- **Tag Following**: Follow specific tags to personalize your feed
- **User Authentication**: Secure authentication & authorization using JWT tokens
- **RESTful API**: Well-documented API endpoints with Swagger/OpenAPI
- **Dockerized**: Containerized application for easy deployment

## 🛠️ Tech Stack

- **Java 21**
- **Spring Boot 3.x**
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence
- **Hibernate** - ORM framework
- **MySQL** - Relational database
- **Maven** - Dependency management
- **JWT (JSON Web Tokens)** - Secure authentication
- **Swagger/OpenAPI 3** - API documentation
- **Docker** - Containerization

## 📁 Project Structure

```
src/main/java/com/askverse/
├── config/          # Configuration classes (Security, CORS, etc.)
├── controller/      # REST API endpoints
├── dtos/            # dtos for the request nad resposne
├── filter/          # Custom filters (JWT authentication filter)
├── model/           # Entity classes
├── repository/      # JPA repositories
├── service/         # Business logic layer
└── utils/           # Utility classes and helpers
```

## 🔧 Prerequisites

- Java 21 or higher
- gradle 8.14+
- MySQL 8.0+
- Docker (optional)

## ⚙️ Installation & Setup

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/himansh025/askverse.git
cd askverse
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
spring.jwt.secret=your_jwt_secret_key
```

4. **Build the project**
```bash
./gradlew build
```

5. **Run the application**
```bash
./gradlew bootRun
```

The application will start on `http://localhost:8080`

### Docker Deployment

1. **Build Docker image**
```bash
docker build -t askverse:latest .
```

2. **Run with Docker Compose**
```bash
docker-compose up -d
```

## 📚 API Documentation

Once the application is running, access the Swagger UI at:
```
http://localhost:8080/swagger-ui/index.html 

## Production Apis Endpoints(Render takes around 1 minute to start the start the server) 
https://askverse-db8w.onrender.com/swagger-ui/index.html
```



## 🔐 Authentication

The API uses JWT (JSON Web Token) for authentication. To access protected endpoints:

1. Register or login to receive a JWT token
2. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

