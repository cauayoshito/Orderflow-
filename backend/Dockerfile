## Multi-stage Dockerfile for the OrderFlow Commerce Cloud backend.
## Stage 1 builds the executable jar with Maven; stage 2 runs it on a slim JRE.

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Cache dependencies first for faster rebuilds.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/target/orderflow-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
