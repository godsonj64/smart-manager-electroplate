SmartCleaner.Reports = (function() {
  function render(container) {
    const records = SmartCleaner.Storage.get('records', []);
    const statusCounts = {};
    let total = records.length;
    let completed = 0, waiting = 0, progress = 0, intake = 0;

    records.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      if (r.status === 'complete') completed++;
      else if (r.status === 'waiting') waiting++;
      else if (r.status === 'progress' || r.status === 'assigned') progress++;
      else if (r.status === 'intake' || r.status === 'review') intake++;
    });

    // Simple chart using div bars
    const maxStatus = Math.max(...Object.values(statusCounts), 1);
    const statusColors = {
      intake: '#0369a1', review: '#b45309', assigned: '#1e40af',
      progress: '#065f46', waiting: '#6b21a8', complete: '#16a34a', archived: '#6b7280'
    };

    const statusLabels = {
      intake: 'Intake', review: 'Review', assigned: 'Assigned',
      progress: 'In Progress', waiting: 'Waiting', complete: 'Complete', archived: 'Archived'
    };

    container.innerHTML = `
      <div class="section-page">
        <h2>Reports</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <h3>Total Records</h3>
            <div class="kpi-value">${total}</div>
          </div>
          <div class="kpi-card">
            <h3>Completed</h3>
            <div class="kpi-value">${completed}</div>
          </div>
          <div class="kpi-card">
            <h3>In Progress</h3>
            <div class="kpi-value">${progress}</div>
          </div>
          <div class="kpi-card">
            <h3>Waiting</h3>
            <div class="kpi-value">${waiting}</div>
          </div>
        </div>
        <h3 style="margin-bottom:12px;">Status Distribution</h3>
        <div style="background: var(--bg-secondary); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          ${Object.entries(statusCounts).map(([status, count]) => `
            <div style="display:flex;align-items:center;margin-bottom:8px;">
              <span style="width:120px;font-size:0.85rem;color:var(--text-secondary);">${statusLabels[status] || status}</span>
              <div style="flex:1;background:#e5e7eb;border-radius:6px;height:20px;overflow:hidden;">
                <div style="height:100%;width:${(count/maxStatus)*100}%;background:${statusColors[status] || '#6b7280'};border-radius:6px;transition:width 0.3s;"></div>
              </div>
              <span style="margin-left:8px;font-size:0.85rem;font-weight:500;">${count}</span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 24px;">
          <button class="btn btn-primary" id="export-report-btn">Export Summary as CSV</button>
        </div>
      </div>
    `;

    container.querySelector('#export-report-btn').addEventListener('click', async () => {
      const summary = [
        ['Metric', 'Value'],
        ['Total Records', total],
        ['Completed', completed],
        ['In Progress', progress],
        ['Waiting', waiting],
        ['Intake/Review', intake],
        ...Object.entries(statusCounts).map(([status, count]) => [status, count.toString()])
      ];
      const csvContent = summary.map(row => row.map(v => `"${v}"`).join(',')).join('\n');
      try {
        const filePath = await window.electronAPI.saveFileDialog({ defaultPath: 'report_summary.csv', filters: [{ name: 'CSV', extensions: ['csv'] }] });
        if (!filePath) return;
        await window.electronAPI.writeFile(filePath, csvContent);
        SmartCleaner.Audit.add('export_report', 'Exported report summary');
        SmartCleaner.Toast.show('Report exported', 'success');
      } catch (err) {
        SmartCleaner.Toast.show('Export failed: ' + err.message, 'error');
      }
    });
  }

  return { render };
})();
