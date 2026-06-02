import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import {
  createEmployee,
  deleteEmployee,
  getDepartments,
  getEmployees,
  updateEmployee,
} from './api.js';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  hireDate: '',
  salary: '',
};

const pageSizeOptions = [5, 10, 20];

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [form, setForm] = useState(emptyForm);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const pageLabel = useMemo(() => {
    if (!totalElements) return 'No employees';
    const start = page * size + 1;
    const end = Math.min((page + 1) * size, totalElements);
    return `${start}-${end} of ${totalElements}`;
  }, [page, size, totalElements]);

  useEffect(() => {
    loadEmployees();
  }, [department, page, size, sortBy, sortDir]);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadEmployees(overrides = {}) {
    const query = {
      search,
      department,
      page,
      size,
      sortBy,
      sortDir,
      ...overrides,
    };

    setIsLoading(true);
    setError('');
    try {
      const data = await getEmployees({
        search: query.search.trim(),
        department: query.department,
        page: query.page,
        size: query.size,
        sortBy: query.sortBy,
        sortDir: query.sortDir,
      });
      setEmployees(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
      if (data.content?.length && !data.content.some((employee) => employee.id === selectedEmployee?.id)) {
        setSelectedEmployee(data.content[0]);
      }
      if (!data.content?.length) {
        setSelectedEmployee(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch {
      setDepartments([]);
    }
  }

  function openCreateForm() {
    setEditingEmployee(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEditForm(employee) {
    setEditingEmployee(employee);
    setForm({
      firstName: employee.firstName ?? '',
      lastName: employee.lastName ?? '',
      email: employee.email ?? '',
      phone: employee.phone ?? '',
      department: employee.department ?? '',
      position: employee.position ?? '',
      hireDate: employee.hireDate ?? '',
      salary: employee.salary ?? '',
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    const payload = {
      ...form,
      hireDate: form.hireDate || null,
      salary: form.salary === '' ? null : Number(form.salary),
    };

    try {
      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee.id, payload);
        setSelectedEmployee(updated);
        setNotice('Employee updated.');
      } else {
        const created = await createEmployee(payload);
        setSelectedEmployee(created);
        setNotice('Employee added.');
      }
      closeForm();
      await loadEmployees();
      await loadDepartments();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`);
    if (!confirmed) return;

    setError('');
    setNotice('');
    try {
      await deleteEmployee(employee.id);
      setNotice('Employee deleted.');
      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee(null);
      }
      await loadEmployees();
      await loadDepartments();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(0);
    loadEmployees({ search, page: 0 });
  }

  function resetFilters() {
    setError('');
    setNotice('');
    setSearch('');
    setDepartment('');
    setPage(0);
    loadEmployees({ search: '', department: '', page: 0 });
  }

  function toggleSort(field) {
    setPage(0);
    if (sortBy === field) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(field);
    setSortDir('asc');
  }

  function renderSortButton(field, label) {
    const isActive = sortBy === field;
    const Icon = isActive && sortDir === 'asc' ? ChevronUp : ChevronDown;

    return (
      <button
        className={`sort-toggle ${isActive ? 'active' : ''}`}
        type="button"
        onClick={() => toggleSort(field)}
        title={`Sort ${label} ${isActive && sortDir === 'asc' ? 'descending' : 'ascending'}`}
      >
        <Icon size={15} />
      </button>
    );
  }

  return (
    <main className="app-shell">
      <section className="top-bar">
        <div>
          <p className="eyebrow">People Operations</p>
          <h1>Employee Management</h1>
        </div>
        <button className="primary-action" onClick={openCreateForm} title="Add employee">
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </section>

      <section className="metrics-band" aria-label="Employee metrics">
        <div className="metric">
          <UsersRound size={22} />
          <div>
            <strong>{totalElements}</strong>
            <span>Total Employees</span>
          </div>
        </div>
        <div className="metric">
          <BriefcaseBusiness size={22} />
          <div>
            <strong>{departments.length}</strong>
            <span>Departments</span>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="table-panel">
          <form className="toolbar" onSubmit={handleSearchSubmit}>
            <label className="search-field">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, phone, role"
              />
            </label>

            <select
              value={department}
              onChange={(event) => {
                setDepartment(event.target.value);
                setPage(0);
              }}
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              {departments.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <button className="icon-button text-button" type="submit" title="Search employees">
              <Search size={17} />
              <span>Search</span>
            </button>
            <button className="icon-button" type="button" onClick={resetFilters} title="Reset filters">
              <RefreshCw size={17} />
            </button>
          </form>

          {notice && <div className="notice success">{notice}</div>}
          {error && <div className="notice error">{error}</div>}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Phone</th>
                  <th>
                    <span className="sortable-heading">
                      Hire Date
                      {renderSortButton('hireDate', 'hire date')}
                    </span>
                  </th>
                  <th>
                    <span className="sortable-heading">
                      Salary
                      {renderSortButton('salary', 'salary')}
                    </span>
                  </th>
                  <th aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="empty-state">Loading employees...</td>
                  </tr>
                ) : employees.length ? (
                  employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className={selectedEmployee?.id === employee.id ? 'selected-row' : ''}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <td>#{employee.id}</td>
                      <td>
                        <strong>{employee.firstName} {employee.lastName}</strong>
                      </td>
                      <td>{employee.email}</td>
                      <td>{employee.department}</td>
                      <td>{employee.position}</td>
                      <td>{employee.phone || '-'}</td>
                      <td>{employee.hireDate || '-'}</td>
                      <td>{formatSalary(employee.salary)}</td>
                      <td className="row-actions">
                        <button type="button" onClick={(event) => {
                          event.stopPropagation();
                          openEditForm(employee);
                        }} title="Update employee">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(employee);
                        }} title="Delete employee">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-state">No employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span>{pageLabel}</span>
            <label>
              Rows
              <select value={size} onChange={(event) => {
                setSize(Number(event.target.value));
                setPage(0);
              }}>
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <button
              className="icon-button"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span>Page {totalPages ? page + 1 : 0} of {totalPages}</span>
            <button
              className="icon-button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              title="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <aside className="detail-panel">
          {selectedEmployee ? (
            <>
              <div className="avatar" aria-hidden="true">
                {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
              </div>
              <h2>{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
              <p>{selectedEmployee.position}</p>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedEmployee.email}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selectedEmployee.phone || '-'}</dd>
                </div>
                <div>
                  <dt>Department</dt>
                  <dd>{selectedEmployee.department}</dd>
                </div>
                <div>
                  <dt>Hire Date</dt>
                  <dd>{selectedEmployee.hireDate || '-'}</dd>
                </div>
                <div>
                  <dt>Salary</dt>
                  <dd>{formatSalary(selectedEmployee.salary)}</dd>
                </div>
              </dl>
              <button className="secondary-action" onClick={() => openEditForm(selectedEmployee)}>
                <Pencil size={17} />
                <span>Update Employee</span>
              </button>
            </>
          ) : (
            <div className="empty-detail">Select an employee to view details.</div>
          )}
        </aside>
      </section>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="employee-modal" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Update Employee' : 'Add Employee'}</h2>
              <button type="button" onClick={closeForm} title="Close">
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <label>
                First Name
                <input required maxLength="80" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
              </label>
              <label>
                Last Name
                <input required maxLength="80" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
              </label>
              <label>
                Email
                <input required type="email" maxLength="140" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label>
                Phone
                <input maxLength="30" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </label>
              <label>
                Department
                <input required maxLength="100" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
              </label>
              <label>
                Position
                <input required maxLength="100" value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} />
              </label>
              <label>
                Hire Date
                <input type="date" value={form.hireDate} onChange={(event) => setForm({ ...form, hireDate: event.target.value })} />
              </label>
              <label>
                Salary
                <input min="0" step="0.01" type="number" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} />
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-action" onClick={closeForm}>Cancel</button>
              <button type="submit" className="primary-action">
                <Plus size={17} />
                <span>{editingEmployee ? 'Save Changes' : 'Add Employee'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function formatSalary(value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
