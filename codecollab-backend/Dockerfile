FROM openjdk:17-jdk-slim

# Install Docker CLI for Docker-in-Docker
RUN apt-get update && apt-get install -y \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src/ src/

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8083

# Run the application
CMD ["java", "-jar", "target/codecollab-backend-0.0.1-SNAPSHOT.jar"]
