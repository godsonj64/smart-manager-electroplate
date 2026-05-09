SmartCleaner.AuditLog = (function() {
  function render(container) {
    const logs = SmartCleaner.Audit.getAll();
    container.innerHTML = `
      <div class="section-page">
        <h2>Audit Log</h2>
        <div style="margin-bottom:12px;">
          <button class="btn" id="clear-audit-btn">Clear Log</button>
        </div>
        ${logs.length > 0 ? `
        <table class="data-table">
          <thead><tr><th>Timestamp</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<div class="empty-state"><h3>No audit events yet</h3><p>Actions will be recorded here.</p></div>'}
      </div>
    `;

    container.querySelector('#clear-audit-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the audit log?')) {
        SmartCleaner.Storage.set('auditLog', []);
        render(container);
        SmartCleaner.Toast.show('Audit log cleared', 'success');
      }
    });
  }

  return { render };
})();
