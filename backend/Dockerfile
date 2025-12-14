# Use lightweight OpenJDK 21 image
FROM openjdk:21-jdk-slim

# Set environment variables
ENV PORT=8080
ENV JAVA_OPTS=""

# Set working directory
WORKDIR /app

# Copy JAR from Gradle or Maven build
COPY build/libs/Quora-0.0.1-SNAPSHOT.jar app.jar

# Expose port for Render
EXPOSE 8080

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
