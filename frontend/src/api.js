// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://agile-tenderness-production-7c6a.up.railway.app/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed. Please try again.';
    try {
      const error = await response.json();
      message = error.message ?? message;
    } catch {
      // Keep the fallback message for empty error bodies.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getEmployees({ search, department, page, size, sortBy, sortDir }) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  if (search) params.set('search', search);
  if (department) params.set('department', department);

  return request(`/employees?${params.toString()}`);
}

export function getDepartments() {
  return request('/employees/departments');
}

export function createEmployee(employee) {
  return request('/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  });
}

export function updateEmployee(id, employee) {
  return request(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  });
}

export function deleteEmployee(id) {
  return request(`/employees/${id}`, {
    method: 'DELETE',
  });
}
