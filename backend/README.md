# Employee Management Backend

Spring Boot REST API for employee CRUD, search, pagination, salary tracking, and department filtering.

## Requirements

- Java 21+
- Maven 3.9+
- MySQL 8+

## MySQL

Create a database user or update `src/main/resources/application.properties` with your local credentials. The default URL creates the database automatically:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employee_management?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
```

## Run

```bash
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

## Endpoints

- `GET /api/employees?search=&department=&page=0&size=10`
- `GET /api/employees/{id}`
- `GET /api/employees/departments`
- `POST /api/employees`
- `PUT /api/employees/{id}`
- `DELETE /api/employees/{id}`
