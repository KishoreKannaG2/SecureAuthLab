FROM openjdk:17-jdk-slim

WORKDIR /app

COPY . .

RUN ./mvnw clean package

CMD ["java", "-jar", "target/*.jar"]
