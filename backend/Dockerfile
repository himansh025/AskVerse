# ---------- STAGE 1: Build ----------
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Copy Gradle files first (better caching)
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Download dependencies
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copy source code
COPY src src

# Build the jar
RUN ./gradlew clean build -x test --no-daemon


# ---------- STAGE 2: Run ----------
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy jar from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
