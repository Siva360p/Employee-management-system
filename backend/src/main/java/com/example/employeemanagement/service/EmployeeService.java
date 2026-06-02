package com.example.employeemanagement.service;

import com.example.employeemanagement.dto.EmployeeRequest;
import com.example.employeemanagement.exception.ResourceNotFoundException;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public Page<Employee> findEmployees(String search, String department, Pageable pageable) {
        return employeeRepository.findAll(buildSpecification(search, department), pageable);
    }

    @Transactional(readOnly = true)
    public Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id " + id + "."));
    }

    @Transactional(readOnly = true)
    public List<String> findDepartments() {
        return employeeRepository.findDistinctDepartments();
    }

    public Employee create(EmployeeRequest request) {
        if (employeeRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Employee email already exists.");
        }

        Employee employee = new Employee();
        applyRequest(employee, request);
        return employeeRepository.save(employee);
    }

    public Employee update(Long id, EmployeeRequest request) {
        Employee employee = findById(id);
        if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(request.email(), id)) {
            throw new IllegalArgumentException("Employee email already exists.");
        }

        applyRequest(employee, request);
        return employeeRepository.save(employee);
    }

    public void delete(Long id) {
        Employee employee = findById(id);
        employeeRepository.delete(employee);
    }

    private void applyRequest(Employee employee, EmployeeRequest request) {
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(request.lastName().trim());
        employee.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        employee.setPhone(trimToNull(request.phone()));
        employee.setDepartment(request.department().trim());
        employee.setPosition(request.position().trim());
        employee.setHireDate(request.hireDate());
        employee.setSalary(request.salary());
    }

    private Specification<Employee> buildSpecification(String search, String department) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(department)) {
                predicates.add(builder.equal(builder.lower(root.get("department")), department.trim().toLowerCase(Locale.ROOT)));
            }

            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("firstName")), like),
                        builder.like(builder.lower(root.get("lastName")), like),
                        builder.like(builder.lower(root.get("email")), like),
                        builder.like(builder.lower(root.get("phone")), like),
                        builder.like(builder.lower(root.get("department")), like),
                        builder.like(builder.lower(root.get("position")), like)
                ));
            }

            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
