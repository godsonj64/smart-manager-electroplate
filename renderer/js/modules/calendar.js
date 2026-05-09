SmartCleaner.Calendar = (function() {
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  function render(container) {
    const tasks = SmartCleaner.Storage.get('tasks', []);
    const records = SmartCleaner.Storage.get('records', []);
    // Build map of dates with tasks and records due
    const dateMap = {};
    tasks.forEach(t => {
      if (t.dueDate) {
        const key = t.dueDate.split('T')[0];
        if (!dateMap[key]) dateMap[key] = { tasks: [], records: [] };
        dateMap[key].tasks.push(t);
      }
    });
    records.forEach(r => {
      if (r.dueDate) {
        const key = r.dueDate.split('T')[0];
        if (!dateMap[key]) dateMap[key] = { tasks: [], records: [] };
        dateMap[key].records.push(r);
      }
    });

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    let html = `
      <div class="section-page">
        <h2>Calendar</h2>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
          <button class="btn" id="prev-month">← Prev</button>
          <span style="font-weight:600;font-size:1.1rem;">${monthNames[currentMonth]} ${currentYear}</span>
          <button class="btn" id="next-month">Next →</button>
          <button class="btn" id="today-btn">Today</button>
        </div>
        <div class="calendar-grid">
          <div class="calendar-header">Sun</div>
          <div class="calendar-header">Mon</div>
          <div class="calendar-header">Tue</div>
          <div class="calendar-header">Wed</div>
          <div class="calendar-header">Thu</div>
          <div class="calendar-header">Fri</div>
          <div class="calendar-header">Sat</div>
          ${Array.from({length: firstDay}, () => '<div class="calendar-day empty"></div>').join('')}
          ${Array.from({length: daysInMonth}, (_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const info = dateMap[dateStr];
            const isToday = dateStr === today;
            let dayClass = 'calendar-day';
            if (isToday) dayClass += ' today';
            if (info && (info.tasks.length > 0 || info.records.length > 0)) dayClass += ' has-events';
            let popover = '';
            if (info && (info.tasks.length > 0 || info.records.length > 0)) {
              popover = '<div class="day-popover">';
              if (info.tasks.length > 0) {
                popover += '<strong>Tasks:</strong><br>';
                info.tasks.forEach(t => { popover += `<span style="font-size:0.75rem;">${t.title}</span><br>`; });
              }
              if (info.records.length > 0) {
                popover += '<strong>Records due:</strong><br>';
                info.records.forEach(r => { popover += `<span style="font-size:0.75rem;">${r.name}</span><br>`; });
              }
              popover += '</div>';
            }
            return `<div class="${dayClass}" data-date="${dateStr}"><span class="day-number">${day}</span>${popover || ''}</div>`;
          }).join('')}
        </div>
        <div id="day-detail" style="margin-top:16px;"></div>
      </div>
    `;

    container.innerHTML = html;

    container.querySelector('#prev-month').addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      render(container);
    });
    container.querySelector('#next-month').addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      render(container);
    });
    container.querySelector('#today-btn').addEventListener('click', () => {
      const now = new Date();
      currentMonth = now.getMonth();
      currentYear = now.getFullYear();
      render(container);
    });

    // Click day to show details
    container.querySelectorAll('.calendar-day:not(.empty)').forEach(div => {
      div.addEventListener('click', (e) => {
        const date = div.dataset.date;
        if (!date) return;
        const tasks = SmartCleaner.Storage.get('tasks', []).filter(t => t.dueDate && t.dueDate.split('T')[0] === date);
        const records = SmartCleaner.Storage.get('records', []).filter(r => r.dueDate && r.dueDate.split('T')[0] === date);
        const detailDiv = container.querySelector('#day-detail');
        let html = `<h3 style="margin-bottom:8px;">Items due on ${date}</h3>`;
        if (tasks.length === 0 && records.length === 0) {
          html += '<p style="color:var(--text-secondary);">No tasks or records due on this day.</p>';
        } else {
          if (tasks.length > 0) {
            html += '<h4 style="margin:8px 0 4px;">Tasks</h4><ul>';
            tasks.forEach(t => { html += `<li>${t.title} (${t.status}) - Assigned to ${t.assignedTo}</li>`; });
            html += '</ul>';
          }
          if (records.length > 0) {
            html += '<h4 style="margin:8px 0 4px;">Records Due</h4><ul>';
            records.forEach(r => { html += `<li>${r.name} (${r.status}) - ${r.customer}</li>`; });
            html += '</ul>';
          }
        }
        detailDiv.innerHTML = html;
      });
    });
  }

  return { render };
})();
