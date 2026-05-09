SmartCleaner.Tasks = (function() {
  let currentFilterStatus = 'all';
  let currentSearch = '';
  let currentSort = { field: 'dueDate', dir: 'asc' };
  let currentPage = 1;
  const PAGE_SIZE = 10;
  let selectedIds = new Set();

  function getFilteredTasks() {
    let tasks = SmartCleaner.Storage.get('tasks', []);
    if (currentFilterStatus !== 'all') {
      tasks = tasks.filter(t => t.status === currentFilterStatus);
    }
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q));
    }
    tasks.sort((a,b) => {
      let fa = a[currentSort.field] || '';
      let fb = b[currentSort.field] || '';
      if (currentSort.field === 'dueDate') {
        // sort by date string
        if (fa < fb) return currentSort.dir === 'asc' ? -1 : 1;
        if (fa > fb) return currentSort.dir === 'asc' ? 1 : -1;
        return 0;
      }
      if (typeof fa === 'string') fa = fa.toLowerCase();
      if (typeof fb === 'string') fb = fb.toLowerCase();
      if (fa < fb) return currentSort.dir === 'asc' ? -1 : 1;
      if (fa > fb) return currentSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return tasks;
  }

  function renderTable(container, tasks) {
    const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageTasks = tasks.slice(start, start + PAGE_SIZE);

    let html = `
      <div class="section-page">
        <h2>Tasks</h2>
        <div class="filters-bar">
          <div class="search-box">
            <input type="text" id="task-search" placeholder="Search tasks..." value="${currentSearch}">
          </div>
          <select id="task-status-filter">
            <option value="all" ${currentFilterStatus === 'all' ? 'selected' : ''}>All Status</option>
            <option value="pending" ${currentFilterStatus === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in_progress" ${currentFilterStatus === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="complete" ${currentFilterStatus === 'complete' ? 'selected' : ''}>Complete</option>
          </select>
          <button class="btn btn-primary" id="add-task-btn">+ Add Task</button>
        </div>
        ${pageTasks.length > 0 ? `
        <div class="bulk-actions">
          <label><input type="checkbox" id="select-all-tasks"> Select All</label>
          <select id="bulk-task-status">
            <option value="">Change Status to...</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="complete">Complete</option>
          </select>
          <button class="btn" id="bulk-apply-task-status">Apply</button>
          <button class="btn btn-danger" id="bulk-delete-tasks">Delete Selected</button>
        </div>
        <table class="data-table" id="tasks-table">
          <thead>
            <tr>
              <th style="width:30px;"><input type="checkbox" id="select-all-tasks-header"></th>
              <th data-sort="title" class="sortable">Title ${getSortIcon('title')}</th>
              <th data-sort="assignedTo" class="sortable">Assigned To ${getSortIcon('assignedTo')}</th>
              <th data-sort="status" class="sortable">Status ${getSortIcon('status')}</th>
              <th data-sort="dueDate" class="sortable">Due Date ${getSortIcon('dueDate')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageTasks.map(t => `
              <tr data-id="${t.id}">
                <td><input type="checkbox" class="task-row-select" data-id="${t.id}" ${selectedIds.has(t.id) ? 'checked' : ''}></td>
                <td>${t.title}</td>
                <td>${t.assignedTo}</td>
                <td><span class="status-badge status-${t.status === 'in_progress' ? 'progress' : t.status}">${t.status.replace('_',' ')}</span></td>
                <td>${SmartCleaner.Utils.formatDate(t.dueDate)}</td>
                <td>
                  <button class="btn btn-edit-task" data-id="${t.id}">Edit</button>
                  <button class="btn btn-danger btn-delete-task" data-id="${t.id}">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${totalPages > 1 ? `
        <div class="pagination">
          ${Array.from({length: totalPages}, (_, i) => i+1).map(p =>
            `<button class="${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`
          ).join('')}
        </div>
        ` : ''}
        ` : '<div class="empty-state"><h3>No tasks found</h3><p>Create a new task or adjust filters.</p></div>'}
      </div>
    `;

    container.innerHTML = html;
    bindEvents(container);
  }

  function getSortIcon(field) {
    if (currentSort.field === field) {
      return currentSort.dir === 'asc' ? '↑' : '↓';
    }
    return '';
  }

  function bindEvents(container) {
    const searchInput = container.querySelector('#task-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchInput._debounce);
        searchInput._debounce = setTimeout(() => {
          currentSearch = e.target.value;
          currentPage = 1;
          renderTable(container, getFilteredTasks());
        }, 300);
      });
    }

    const statusFilter = container.querySelector('#task-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        currentFilterStatus = e.target.value;
        currentPage = 1;
        renderTable(container, getFilteredTasks());
      });
    }

    container.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (currentSort.field === field) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.field = field;
          currentSort.dir = 'asc';
        }
        renderTable(container, getFilteredTasks());
      });
    });

    container.querySelectorAll('.pagination button').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        renderTable(container, getFilteredTasks());
      });
    });

    const addBtn = container.querySelector('#add-task-btn');
    if (addBtn) addBtn.addEventListener('click', () => showTaskForm(null));

    container.querySelectorAll('.btn-edit-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const task = SmartCleaner.Storage.get('tasks', []).find(t => t.id === id);
        if (task) showTaskForm(task);
      });
    });

    container.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        confirmDeleteTask(id);
      });
    });

    // Bulk selection
    const selectAllHeader = container.querySelector('#select-all-tasks-header');
    if (selectAllHeader) {
      selectAllHeader.addEventListener('change', (e) => {
        const checkboxes = container.querySelectorAll('.task-row-select');
        checkboxes.forEach(cb => {
          cb.checked = e.target.checked;
          if (e.target.checked) selectedIds.add(cb.dataset.id);
          else selectedIds.delete(cb.dataset.id);
        });
      });
    }
    container.querySelectorAll('.task-row-select').forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.checked) selectedIds.add(e.target.dataset.id);
        else selectedIds.delete(e.target.dataset.id);
      });
    });

    // Bulk apply status
    const bulkApplyBtn = container.querySelector('#bulk-apply-task-status');
    if (bulkApplyBtn) {
      bulkApplyBtn.addEventListener('click', () => {
        const newStatus = container.querySelector('#bulk-task-status').value;
        if (!newStatus) { SmartCleaner.Toast.show('Select a status to apply', 'error'); return; }
        if (selectedIds.size === 0) { SmartCleaner.Toast.show('No tasks selected', 'error'); return; }
        let tasks = SmartCleaner.Storage.get('tasks', []);
        tasks.forEach(t => {
          if (selectedIds.has(t.id)) {
            t.status = newStatus;
            t.updatedAt = new Date().toISOString();
          }
        });
        SmartCleaner.Storage.set('tasks', tasks);
        SmartCleaner.Audit.add('bulk_task_status', `Changed status of ${selectedIds.size} tasks to ${newStatus}`);
        selectedIds.clear();
        SmartCleaner.Toast.show('Status updated', 'success');
        renderTable(container, getFilteredTasks());
      });
    }

    // Bulk delete
    const bulkDeleteBtn = container.querySelector('#bulk-delete-tasks');
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', () => {
        if (selectedIds.size === 0) { SmartCleaner.Toast.show('No tasks selected', 'error'); return; }
        if (!confirm(`Delete ${selectedIds.size} selected tasks?`)) return;
        let tasks = SmartCleaner.Storage.get('tasks', []);
        tasks = tasks.filter(t => !selectedIds.has(t.id));
        SmartCleaner.Storage.set('tasks', tasks);
        SmartCleaner.Audit.add('bulk_delete_tasks', `Deleted ${selectedIds.size} tasks`);
        selectedIds.clear();
        SmartCleaner.Toast.show('Tasks deleted', 'success');
        renderTable(container, getFilteredTasks());
      });
    }
  }

  function showTaskForm(task) {
    const isNew = !task;
    const modal = document.getElementById('modal-container');
    const overlay = document.getElementById('modal-overlay');
    const today = new Date().toISOString().split('T')[0];
    modal.innerHTML = `
      <div class="modal-header">
        <h3>${isNew ? 'Add Task' : 'Edit Task'}</h3>
        <button class="modal-close" id="modal-close-task">&times;</button>
      </div>
      <form id="task-form">
        <div class="form-group">
          <label for="task-title">Title</label>
          <input type="text" id="task-title" value="${task ? task.title : ''}" required>
        </div>
        <div class="form-group">
          <label for="task-description">Description</label>
          <textarea id="task-description" rows="3">${task ? task.description : ''}</textarea>
        </div>
        <div class="form-group">
          <label for="task-assigned">Assigned To</label>
          <input type="text" id="task-assigned" value="${task ? task.assignedTo : ''}" required>
        </div>
        <div class="form-group">
          <label for="task-status">Status</label>
          <select id="task-status">
            <option value="pending" ${task && task.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in_progress" ${task && task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="complete" ${task && task.status === 'complete' ? 'selected' : ''}>Complete</option>
          </select>
        </div>
        <div class="form-group">
          <label for="task-duedate">Due Date</label>
          <input type="date" id="task-duedate" value="${task && task.dueDate ? task.dueDate.split('T')[0] : ''}">
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" id="modal-cancel-task">Cancel</button>
          <button type="submit" class="btn btn-primary">${isNew ? 'Create' : 'Update'}</button>
        </div>
      </form>
    `;
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');

    const close = () => {
      overlay.classList.add('hidden');
      modal.classList.add('hidden');
    };
    document.getElementById('modal-close-task').addEventListener('click', close);
    document.getElementById('modal-cancel-task').addEventListener('click', close);
    overlay.addEventListener('click', close);

    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title').value.trim();
      const description = document.getElementById('task-description').value.trim();
      const assignedTo = document.getElementById('task-assigned').value.trim();
      const status = document.getElementById('task-status').value;
      const dueDate = document.getElementById('task-duedate').value;

      if (!title || !assignedTo) {
        SmartCleaner.Toast.show('Title and Assigned To are required', 'error');
        return;
      }

      let tasks = SmartCleaner.Storage.get('tasks', []);
      if (isNew) {
        const newTask = {
          id: SmartCleaner.Utils.generateId(),
          title,
          description,
          assignedTo,
          status,
          dueDate: dueDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tasks.push(newTask);
        SmartCleaner.Audit.add('create_task', `Created task "${title}"`);
      } else {
        const idx = tasks.findIndex(t => t.id === task.id);
        if (idx !== -1) {
          tasks[idx].title = title;
          tasks[idx].description = description;
          tasks[idx].assignedTo = assignedTo;
          tasks[idx].status = status;
          tasks[idx].dueDate = dueDate || null;
          tasks[idx].updatedAt = new Date().toISOString();
          SmartCleaner.Audit.add('update_task', `Updated task "${title}"`);
        }
      }
      SmartCleaner.Storage.set('tasks', tasks);
      SmartCleaner.Toast.show(isNew ? 'Task created' : 'Task updated', 'success');
      close();
      renderTable(document.getElementById('content'), getFilteredTasks());
    });
  }

  function confirmDeleteTask(id) {
    const tasks = SmartCleaner.Storage.get('tasks', []);
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    const modal = document.getElementById('modal-container');
    const overlay = document.getElementById('modal-overlay');
    modal.innerHTML = `
      <div class="modal-header">
        <h3>Delete Task</h3>
        <button class="modal-close" id="modal-close-task-del">&times;</button>
      </div>
      <p>Are you sure you want to delete <strong>${t.title}</strong>? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn" id="modal-cancel-task-del">Cancel</button>
        <button class="btn btn-danger" id="confirm-task-delete">Delete</button>
      </div>
    `;
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    const close = () => {
      overlay.classList.add('hidden');
      modal.classList.add('hidden');
    };
    document.getElementById('modal-close-task-del').addEventListener('click', close);
    document.getElementById('modal-cancel-task-del').addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.getElementById('confirm-task-delete').addEventListener('click', () => {
      const newTasks = tasks.filter(t => t.id !== id);
      SmartCleaner.Storage.set('tasks', newTasks);
      SmartCleaner.Audit.add('delete_task', `Deleted task "${t.title}"`);
      SmartCleaner.Toast.show('Task deleted', 'success');
      close();
      renderTable(document.getElementById('content'), getFilteredTasks());
    });
  }

  function render(container) {
    selectedIds.clear();
    renderTable(container, getFilteredTasks());
  }

  return { render };
})();
