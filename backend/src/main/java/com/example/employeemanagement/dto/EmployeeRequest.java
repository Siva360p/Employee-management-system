package com.example.employeemanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @NotBlank @Email @Size(max = 140) String email,
        @Size(max = 30) String phone,
        @NotBlank @Size(max = 100) String department,
        @NotBlank @Size(max = 100) String position,
        LocalDate hireDate,
        @PositiveOrZero BigDecimal salary
) {
}
