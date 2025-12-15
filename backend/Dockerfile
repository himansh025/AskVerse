# Use official OpenJDK 21 image
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy the jar built by Gradle
COPY build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
