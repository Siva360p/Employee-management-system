# Employee Management System

Full-stack employee management app with a Spring Boot + MySQL backend and React frontend.

## Features

- Add employee
- Update employee
- Delete employee
- View employee details
- Search employees
- Pagination
- Filter by department
- Employee salary with hire date and salary sorting

## Project Structure

```text
backend/   Spring Boot REST API with Spring Data JPA and MySQL
frontend/  React + Vite employee management UI
```

## Run Backend

1. Start MySQL.
2. Update `backend/src/main/resources/application.properties` if your MySQL username or password differs.
3. Run:

```bash
cd backend
mvn spring-boot:run
```

The backend starts at `http://localhost:8080`.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`.
