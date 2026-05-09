SmartCleaner.Settings = (function() {
  function render(container) {
    const businessName = SmartCleaner.Storage.get('businessName', 'My Business');
    const workflowLabels = SmartCleaner.Storage.get('workflowLabels', {});

    container.innerHTML = `
      <div class="section-page">
        <h2>Settings</h2>
        <div style="max-width:500px;">
          <div class="form-group">
            <label for="business-name">Business Name</label>
            <input type="text" id="business-name" value="${businessName}">
          </div>
          <div class="form-group">
            <label>Workflow Status Labels (optional)</label>
            <p style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;">Customize status display names. Leave blank to use defaults.</p>
            <div id="status-label-inputs">
              ${['intake','review','assigned','progress','waiting','complete','archived'].map(s => `
                <div style="display:flex;align-items:center;margin-bottom:6px;">
                  <span style="width:100px;font-size:0.8rem;">${s}:</span>
                  <input type="text" style="flex:1;" data-status="${s}" value="${workflowLabels[s] || ''}" placeholder="${s}">
                </div>
              `).join('')}
            </div>
          </div>
          <div style="margin-top:16px;">
            <button class="btn btn-primary" id="save-settings-btn">Save Settings</button>
          </div>
          <hr style="margin:24px 0;border:none;border-top:1px solid var(--border);">
          <h3 style="margin-bottom:12px;">Data Management</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn" id="backup-btn">Backup Data (JSON)</button>
            <button class="btn" id="restore-btn">Restore Data (JSON)</button>
            <button class="btn btn-danger" id="reset-data-btn">Reset All Data</button>
          </div>
          <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:8px;">Backup saves all records, audit log, and settings to a JSON file. Restore overwrites current data. Reset clears all local data permanently.</p>
        </div>
      </div>
    `;

    // Save settings
    container.querySelector('#save-settings-btn').addEventListener('click', () => {
      const newName = document.getElementById('business-name').value.trim();
      const labels = {};
      container.querySelectorAll('#status-label-inputs input').forEach(input => {
        const status = input.dataset.status;
        const val = input.value.trim();
        if (val) labels[status] = val;
      });
      SmartCleaner.Storage.set('businessName', newName || 'My Business');
      SmartCleaner.Storage.set('workflowLabels', labels);
      SmartCleaner.Audit.add('update_settings', 'Updated settings');
      SmartCleaner.Toast.show('Settings saved', 'success');
    });

    // Backup
    container.querySelector('#backup-btn').addEventListener('click', async () => {
      const data = {
        records: SmartCleaner.Storage.get('records', []),
        auditLog: SmartCleaner.Storage.get('auditLog', []),
        settings: {
          businessName: SmartCleaner.Storage.get('businessName', ''),
          workflowLabels: SmartCleaner.Storage.get('workflowLabels', {}),
        }
      };
      try {
        const filePath = await window.electronAPI.saveFileDialog({ defaultPath: 'smartcleaner_backup.json', filters: [{ name: 'JSON Files', extensions: ['json'] }] });
        if (!filePath) return;
        await window.electronAPI.writeFile(filePath, JSON.stringify(data, null, 2));
        SmartCleaner.Audit.add('backup', 'Data backed up');
        SmartCleaner.Toast.show('Backup saved', 'success');
      } catch (err) {
        SmartCleaner.Toast.show('Backup failed: ' + err.message, 'error');
      }
    });

    // Restore
    container.querySelector('#restore-btn').addEventListener('click', async () => {
      if (!confirm('Restoring will overwrite all current data. Continue?')) return;
      try {
        const filePath = await window.electronAPI.openFileDialog([{ name: 'JSON Files', extensions: ['json'] }]);
        if (!filePath) return;
        const raw = await window.electronAPI.readFile(filePath);
        const data = JSON.parse(raw);
        if (data.records) SmartCleaner.Storage.set('records', data.records);
        if (data.auditLog) SmartCleaner.Storage.set('auditLog', data.auditLog);
        if (data.settings) {
          if (data.settings.businessName) SmartCleaner.Storage.set('businessName', data.settings.businessName);
          if (data.settings.workflowLabels) SmartCleaner.Storage.set('workflowLabels', data.settings.workflowLabels);
        }
        SmartCleaner.Audit.add('restore', 'Data restored from backup');
        SmartCleaner.Toast.show('Data restored', 'success');
        // Refresh current view
        SmartCleaner.Navigation.loadSection(SmartCleaner.Navigation.getCurrentSection());
      } catch (err) {
        SmartCleaner.Toast.show('Restore failed: ' + err.message, 'error');
      }
    });

    // Reset all data
    container.querySelector('#reset-data-btn').addEventListener('click', () => {
      if (!confirm('This will permanently delete all records, audit logs, and settings. Are you sure?')) return;
      if (!confirm('Type "RESET" to confirm.')) return;
      SmartCleaner.Storage.clear();
      SmartCleaner.Onboarding.reset();
      SmartCleaner.Audit.add('reset_data', 'All data reset');
      SmartCleaner.Toast.show('All data has been reset', 'success');
      // Reload app state
      SmartCleaner.Navigation.loadSection('dashboard');
    });
  }

  return { render };
})();
