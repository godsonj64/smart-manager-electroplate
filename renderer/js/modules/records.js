SmartCleaner.Records = (function() {
  let currentFilterStatus = 'all';
  let currentSearch = '';
  let currentSort = { field: 'updatedAt', dir: 'desc' };
  let currentPage = 1;
  const PAGE_SIZE = 10;
  let selectedIds = new Set();

  function getFilteredRecords() {
    let records = SmartCleaner.Storage.get('records', []);
    // Filter by status
    if (currentFilterStatus !== 'all') {
      records = records.filter(r => r.status === currentFilterStatus);
    }
    // Search
    if (currentSearch.trim()) {
      records = SmartCleaner.Search.filterRecords(records, currentSearch);
    }
    // Sort
    records.sort((a,b) => {
      let fieldA = a[currentSort.field] || '';
      let fieldB = b[currentSort.field] || '';
      if (typeof fieldA === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }
      if (fieldA < fieldB) return currentSort.dir === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return currentSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return records;
  }

  function renderTable(container, records) {
    const totalPages = Math.ceil(records.length / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRecords = records.slice(start, start + PAGE_SIZE);

    let html = `
      <div class="section-page">
        <h2>Records</h2>
        <div class="filters-bar">
          <div class="search-box">
            <input type="text" id="record-search" placeholder="Search records..." value="${currentSearch}">
          </div>
          <select id="status-filter">
            <option value="all" ${currentFilterStatus === 'all' ? 'selected' : ''}>All Status</option>
            <option value="intake" ${currentFilterStatus === 'intake' ? 'selected' : ''}>Intake</option>
            <option value="review" ${currentFilterStatus === 'review' ? 'selected' : ''}>Review</option>
            <option value="assigned" ${currentFilterStatus === 'assigned' ? 'selected' : ''}>Assigned</option>
            <option value="progress" ${currentFilterStatus === 'progress' ? 'selected' : ''}>In Progress</option>
            <option value="waiting" ${currentFilterStatus === 'waiting' ? 'selected' : ''}>Waiting</option>
            <option value="complete" ${currentFilterStatus === 'complete' ? 'selected' : ''}>Complete</option>
            <option value="archived" ${currentFilterStatus === 'archived' ? 'selected' : ''}>Archived</option>
          </select>
          <button class="btn btn-primary" id="add-record-btn">+ Add Record</button>
          <button class="btn" id="import-csv-btn">Import CSV</button>
          <button class="btn" id="export-csv-btn">Export CSV</button>
        </div>
        ${pageRecords.length > 0 ? `
        <div class="bulk-actions">
          <label><input type="checkbox" id="select-all"> Select All</label>
          <select id="bulk-status">
            <option value="">Change Status to...</option>
            <option value="intake">Intake</option>
            <option value="review">Review</option>
            <option value="assigned">Assigned</option>
            <option value="progress">In Progress</option>
            <option value="waiting">Waiting</option>
            <option value="complete">Complete</option>
            <option value="archived">Archived</option>
          </select>
          <button class="btn" id="bulk-apply-status">Apply</button>
          <button class="btn btn-danger" id="bulk-delete">Delete Selected</button>
        </div>
        <table class="data-table" id="records-table">
          <thead>
            <tr>
              <th style="width:30px;"><input type="checkbox" id="select-all-header"></th>
              <th data-sort="name" class="sortable">Name ${getSortIcon('name')}</th>
              <th data-sort="customer" class="sortable">Customer ${getSortIcon('customer')}</th>
              <th data-sort="status" class="sortable">Status ${getSortIcon('status')}</th>
              <th data-sort="owner" class="sortable">Owner ${getSortIcon('owner')}</th>
              <th data-sort="dueDate" class="sortable">Due ${getSortIcon('dueDate')}</th>
              <th data-sort="updatedAt" class="sortable">Updated ${getSortIcon('updatedAt')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageRecords.map(r => `
              <tr data-id="${r.id}">
                <td><input type="checkbox" class="row-select" data-id="${r.id}" ${selectedIds.has(r.id) ? 'checked' : ''}></td>
                <td>${r.name}</td>
                <td>${r.customer}</td>
                <td><span class="status-badge status-${r.status}">${r.status}</span></td>
                <td>${r.owner}</td>
                <td>${SmartCleaner.Utils.formatDate(r.dueDate)}</td>
                <td>${SmartCleaner.Utils.formatDate(r.updatedAt)}</td>
                <td>
                  <button class="btn btn-edit" data-id="${r.id}">Edit</button>
                  <button class="btn btn-danger btn-delete" data-id="${r.id}">Delete</button>
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
        ` : '<div class="empty-state"><h3>No records found</h3><p>Create a new record or adjust filters.</p></div>'}
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
    // Search debounce
    const searchInput = container.querySelector('#record-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchInput._debounce);
        searchInput._debounce = setTimeout(() => {
          currentSearch = e.target.value;
          currentPage = 1;
          renderTable(container, getFilteredRecords());
        }, 300);
      });
    }

    // Status filter
    const statusFilter = container.querySelector('#status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        currentFilterStatus = e.target.value;
        currentPage = 1;
        renderTable(container, getFilteredRecords());
      });
    }

    // Sortable columns
    container.querySelectorAll('.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (currentSort.field === field) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.field = field;
          currentSort.dir = 'asc';
        }
        renderTable(container, getFilteredRecords());
      });
    });

    // Pagination
    container.querySelectorAll('.pagination button').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        renderTable(container, getFilteredRecords());
      });
    });

    // Add record
    const addBtn = container.querySelector('#add-record-btn');
    if (addBtn) addBtn.addEventListener('click', () => showRecordForm(null));

    // Edit and delete buttons
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const record = SmartCleaner.Storage.get('records', []).find(r => r.id === id);
        if (record) showRecordForm(record);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        confirmDeleteRecord(id);
      });
    });

    // Import/Export
    const importBtn = container.querySelector('#import-csv-btn');
    if (importBtn) importBtn.addEventListener('click', importCSV);
    const exportBtn = container.querySelector('#export-csv-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    // Bulk selection
    const selectAllHeader = container.querySelector('#select-all-header');
    if (selectAllHeader) {
      selectAllHeader.addEventListener('change', (e) => {
        const checkboxes = container.querySelectorAll('.row-select');
        checkboxes.forEach(cb => {
          cb.checked = e.target.checked;
          if (e.target.checked) selectedIds.add(cb.dataset.id);
          else selectedIds.delete(cb.dataset.id);
        });
      });
    }
    container.querySelectorAll('.row-select').forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.checked) selectedIds.add(e.target.dataset.id);
        else selectedIds.delete(e.target.dataset.id);
      });
    });

    // Bulk apply status
    const bulkApplyBtn = container.querySelector('#bulk-apply-status');
    if (bulkApplyBtn) {
      bulkApplyBtn.addEventListener('click', () => {
        const newStatus = container.querySelector('#bulk-status').value;
        if (!newStatus) { SmartCleaner.Toast.show('Select a status to apply', 'error'); return; }
        if (selectedIds.size === 0) { SmartCleaner.Toast.show('No records selected', 'error'); return; }
        let records = SmartCleaner.Storage.get('records', []);
        records.forEach(r => {
          if (selectedIds.has(r.id)) {
            r.status = newStatus;
            r.updatedAt = new Date().toISOString();
          }
        });
        SmartCleaner.Storage.set('records', records);
        SmartCleaner.Audit.add('bulk_status', `Changed status of ${selectedIds.size} records to ${newStatus}`);
        selectedIds.clear();
        SmartCleaner.Toast.show('Status updated', 'success');
        renderTable(container, getFilteredRecords());
      });
    }

    // Bulk delete
    const bulkDeleteBtn = container.querySelector('#bulk-delete');
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', () => {
        if (selectedIds.size === 0) { SmartCleaner.Toast.show('No records selected', 'error'); return; }
        if (!confirm(`Delete ${selectedIds.size} selected records?`)) return;
        let records = SmartCleaner.Storage.get('records', []);
        records = records.filter(r => !selectedIds.has(r.id));
        SmartCleaner.Storage.set('records', records);
        SmartCleaner.Audit.add('bulk_delete', `Deleted ${selectedIds.size} records`);
        selectedIds.clear();
        SmartCleaner.Toast.show('Records deleted', 'success');
        renderTable(container, getFilteredRecords());
      });
    }
  }

  function showRecordForm(record) {
    const isNew = !record;
    const modal = document.getElementById('modal-container');
    const overlay = document.getElementById('modal-overlay');
    const today = new Date().toISOString().split('T')[0];
    modal.innerHTML = `
      <div class="modal-header">
        <h3>${isNew ? 'Add Record' : 'Edit Record'}</h3>
        <button class="modal-close" id="modal-close">&times;</button>
      </div>
      <form id="record-form">
        <div class="form-group">
          <label for="record-name">Record Name</label>
          <input type="text" id="record-name" value="${record ? record.name : ''}" required>
        </div>
        <div class="form-group">
          <label for="record-customer">Customer</label>
          <input type="text" id="record-customer" value="${record ? record.customer : ''}" required>
        </div>
        <div class="form-group">
          <label for="record-status">Status</label>
          <select id="record-status">
            <option value="intake" ${record && record.status === 'intake' ? 'selected' : ''}>Intake</option>
            <option value="review" ${record && record.status === 'review' ? 'selected' : ''}>Review</option>
            <option value="assigned" ${record && record.status === 'assigned' ? 'selected' : ''}>Assigned</option>
            <option value="progress" ${record && record.status === 'progress' ? 'selected' : ''}>In Progress</option>
            <option value="waiting" ${record && record.status === 'waiting' ? 'selected' : ''}>Waiting</option>
            <option value="complete" ${record && record.status === 'complete' ? 'selected' : ''}>Complete</option>
            <option value="archived" ${record && record.status === 'archived' ? 'selected' : ''}>Archived</option>
          </select>
        </div>
        <div class="form-group">
          <label for="record-owner">Owner</label>
          <input type="text" id="record-owner" value="${record ? record.owner : ''}" required>
        </div>
        <div class="form-group">
          <label for="record-duedate">Due Date (optional)</label>
          <input type="date" id="record-duedate" value="${record && record.dueDate ? record.dueDate.split('T')[0] : ''}">
        </div>
        <div class="form-group">
          <label for="record-notes">Notes</label>
          <textarea id="record-notes" rows="3">${record ? record.notes : ''}</textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isNew ? 'Create' : 'Update'}</button>
        </div>
      </form>
    `;
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');

    // Close handlers
    const close = () => {
      overlay.classList.add('hidden');
      modal.classList.add('hidden');
    };
    document.getElementById('modal-close').addEventListener('click', close);
    document.getElementById('modal-cancel').addEventListener('click', close);
    overlay.addEventListener('click', close);

    // Form submit
    document.getElementById('record-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('record-name').value.trim();
      const customer = document.getElementById('record-customer').value.trim();
      const status = document.getElementById('record-status').value;
      const owner = document.getElementById('record-owner').value.trim();
      const dueDate = document.getElementById('record-duedate').value;
      const notes = document.getElementById('record-notes').value.trim();

      if (!name || !customer || !owner) {
        SmartCleaner.Toast.show('Please fill in all required fields', 'error');
        return;
      }

      let records = SmartCleaner.Storage.get('records', []);
      if (isNew) {
        const newRecord = {
          id: SmartCleaner.Utils.generateId(),
          name,
          customer,
          status,
          owner,
          dueDate: dueDate || null,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        records.push(newRecord);
        SmartCleaner.Audit.add('create_record', `Created record "${name}"`);
      } else {
        const idx = records.findIndex(r => r.id === record.id);
        if (idx !== -1) {
          records[idx].name = name;
          records[idx].customer = customer;
          records[idx].status = status;
          records[idx].owner = owner;
          records[idx].dueDate = dueDate || null;
          records[idx].notes = notes;
          records[idx].updatedAt = new Date().toISOString();
          SmartCleaner.Audit.add('update_record', `Updated record "${name}"`);
        }
      }
      SmartCleaner.Storage.set('records', records);
      SmartCleaner.Toast.show(isNew ? 'Record created' : 'Record updated', 'success');
      close();
      renderTable(document.getElementById('content'), getFilteredRecords());
    });
  }

  function confirmDeleteRecord(id) {
    const records = SmartCleaner.Storage.get('records', []);
    const rec = records.find(r => r.id === id);
    if (!rec) return;
    const modal = document.getElementById('modal-container');
    const overlay = document.getElementById('modal-overlay');
    modal.innerHTML = `
      <div class="modal-header">
        <h3>Delete Record</h3>
        <button class="modal-close" id="modal-close">&times;</button>
      </div>
      <p>Are you sure you want to delete <strong>${rec.name}</strong>? This action cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn" id="modal-cancel">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete">Delete</button>
      </div>
    `;
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    const close = () => {
      overlay.classList.add('hidden');
      modal.classList.add('hidden');
    };
    document.getElementById('modal-close').addEventListener('click', close);
    document.getElementById('modal-cancel').addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.getElementById('confirm-delete').addEventListener('click', () => {
      const newRecords = records.filter(r => r.id !== id);
      SmartCleaner.Storage.set('records', newRecords);
      SmartCleaner.Audit.add('delete_record', `Deleted record "${rec.name}"`);
      SmartCleaner.Toast.show('Record deleted', 'success');
      close();
      renderTable(document.getElementById('content'), getFilteredRecords());
    });
  }

  // Simple CSV line parser that handles double-quoted fields
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // skip next quote
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  }

  async function importCSV() {
    try {
      const filePath = await window.electronAPI.openFileDialog([{ name: 'CSV Files', extensions: ['csv'] }]);
      if (!filePath) return;
      const raw = await window.electronAPI.readFile(filePath);
      const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        SmartCleaner.Toast.show('CSV must have a header and at least one data row', 'error');
        return;
      }
      // Parse header fields (handle quotes)
      const headers = parseCSVLine(lines[0]).map(h => h.trim());
      const requiredFields = ['name', 'customer', 'status', 'owner'];
      const missing = requiredFields.filter(f => !headers.includes(f));
      if (missing.length > 0) {
        SmartCleaner.Toast.show(`Missing required columns: ${missing.join(', ')}`, 'error');
        return;
      }
      let records = SmartCleaner.Storage.get('records', []);
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVLine(lines[i]).map(v => v.trim());
        const row = {};
        headers.forEach((h, idx) => row[h] = vals[idx] || '');
        // Validate required
        if (!row.name || !row.customer || !row.owner) continue;
        if (!['intake','review','assigned','progress','waiting','complete','archived'].includes(row.status)) {
          row.status = 'intake';
        }
        const newRec = {
          id: SmartCleaner.Utils.generateId(),
          name: row.name,
          customer: row.customer,
          status: row.status,
          owner: row.owner,
          dueDate: row.dueDate || null,
          notes: row.notes || '',
          createdAt: row.createdAt || new Date().toISOString(),
          updatedAt: row.updatedAt || new Date().toISOString(),
        };
        records.push(newRec);
        imported++;
      }
      SmartCleaner.Storage.set('records', records);
      SmartCleaner.Audit.add('import_csv', `Imported ${imported} records`);
      SmartCleaner.Toast.show(`Imported ${imported} records`, 'success');
      renderTable(document.getElementById('content'), getFilteredRecords());
    } catch (err) {
      SmartCleaner.Toast.show('Import failed: ' + err.message, 'error');
    }
  }

  async function exportCSV() {
    const records = getFilteredRecords();
    if (records.length === 0) {
      SmartCleaner.Toast.show('No records to export', 'error');
      return;
    }
    const headers = ['name','customer','status','owner','dueDate','notes','createdAt','updatedAt'];
    const csvRows = [headers.join(',')];
    records.forEach(r => {
      const row = headers.map(h => `"${(r[h] || '').replace(/"/g, '""')}"`).join(',');
      csvRows.push(row);
    });
    const csvContent = csvRows.join('\n');
    try {
      const filePath = await window.electronAPI.saveFileDialog({ defaultPath: 'records_export.csv', filters: [{ name: 'CSV Files', extensions: ['csv'] }] });
      if (!filePath) return;
      await window.electronAPI.writeFile(filePath, csvContent);
      SmartCleaner.Audit.add('export_csv', `Exported ${records.length} records`);
      SmartCleaner.Toast.show('Export successful', 'success');
    } catch (err) {
      SmartCleaner.Toast.show('Export failed: ' + err.message, 'error');
    }
  }

  function render(container) {
    selectedIds.clear();
    renderTable(container, getFilteredRecords());
  }

  return { render };
})();
