# Use OpenJDK image
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Copy the JAR into container
COPY build/libs/Quora-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
