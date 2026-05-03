FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN ./mvnw clean package

CMD ["sh", "-c", "java -jar target/*.jar"]