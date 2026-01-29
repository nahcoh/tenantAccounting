# ============================================
# Stage 1: Build Stage
# ============================================
FROM gradle:8.10-jdk17 AS builder

WORKDIR /app

# Copy Gradle configuration files
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# Download dependencies separately for better caching
# If build fails, continue (ignore test dependencies)
RUN gradle dependencies --no-daemon || true

# Copy application source code
COPY src ./src

# Build application (skip tests for faster build)
# Tests should run in CI/CD pipeline, not during image build
RUN gradle clean build --no-daemon -x test

# ============================================
# Stage 2: Production Runtime Stage
# ============================================
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Set environment to production
ENV SPRING_PROFILES_ACTIVE=prod

# Create a non-root user for security
RUN addgroup --system --gid 1001 spring && \
    adduser --system --uid 1001 spring

# Copy built JAR file from builder stage
# Rename to app.jar for consistent naming
COPY --from=builder --chown=spring:spring /app/build/libs/*.jar ./app.jar

# Switch to non-root user for security
USER spring

# Expose Spring Boot port
EXPOSE 8080

# Health check to ensure container is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# JVM tuning for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"

# Start Spring Boot application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
