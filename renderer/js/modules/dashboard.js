SmartCleaner.Dashboard = (function() {
  function render(container) {
    const records = SmartCleaner.Storage.get('records', []);
    const statusCounts = {};
    let total = records.length;
    let intakes = 0, inProgress = 0, completed = 0;

    records.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      if (r.status === 'intake' || r.status === 'review') intakes++;
      if (r.status === 'progress' || r.status === 'assigned') inProgress++;
      if (r.status === 'complete') completed++;
    });

    // Recent activity (last 5 records updated)
    const recent = [...records].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0,5);

    container.innerHTML = `
      <div class="section-page">
        <h2>Dashboard</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <h3>Total Records</h3>
            <div class="kpi-value">${total}</div>
          </div>
          <div class="kpi-card">
            <h3>Active (Intake/Review)</h3>
            <div class="kpi-value">${intakes}</div>
          </div>
          <div class="kpi-card">
            <h3>In Progress</h3>
            <div class="kpi-value">${inProgress}</div>
          </div>
          <div class="kpi-card">
            <h3>Completed</h3>
            <div class="kpi-value">${completed}</div>
          </div>
        </div>
        <h3 style="margin-bottom:12px;">Status Breakdown</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">
          ${Object.entries(statusCounts).map(([status, count]) =>
            `<span class="status-badge status-${status}">${status.charAt(0).toUpperCase()+status.slice(1)}: ${count}</span>`
          ).join('')}
        </div>
        <h3 style="margin-bottom:12px;">Recent Activity</h3>
        ${recent.length > 0 ? `
        <table class="data-table">
          <thead><tr><th>Name</th><th>Customer</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>
            ${recent.map(r => `
              <tr>
                <td>${r.name}</td>
                <td>${r.customer}</td>
                <td><span class="status-badge status-${r.status}">${r.status}</span></td>
                <td>${SmartCleaner.Utils.formatDate(r.updatedAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<div class="empty-state"><p>No records yet. Add some from Records.</p></div>'}
      </div>
    `;
  }

  return { render };
})();
