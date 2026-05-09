// Hash-based navigation and module loader
SmartCleaner.Navigation = (function() {
  const sections = {
    dashboard: 'Dashboard',
    records: 'Records',
    tasks: 'Tasks',
    calendar: 'Calendar',
    reports: 'Reports',
    audit: 'Audit Log',
    settings: 'Settings',
    about: 'About',
  };

  let currentSection = 'dashboard';

  function loadSection(sectionName) {
    if (!sections[sectionName]) {
      sectionName = 'dashboard';
    }
    currentSection = sectionName;

    // Update active link in sidebar
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === sectionName);
    });

    // Call corresponding module render function
    const container = document.getElementById('content');
    switch (sectionName) {
      case 'dashboard':
        SmartCleaner.Dashboard.render(container);
        break;
      case 'records':
        SmartCleaner.Records.render(container);
        break;
      case 'tasks':
        SmartCleaner.Tasks.render(container);
        break;
      case 'calendar':
        SmartCleaner.Calendar.render(container);
        break;
      case 'reports':
        SmartCleaner.Reports.render(container);
        break;
      case 'audit':
        SmartCleaner.AuditLog.render(container);
        break;
      case 'settings':
        SmartCleaner.Settings.render(container);
        break;
      case 'about':
        SmartCleaner.About.render(container);
        break;
      default:
        container.innerHTML = '<p>Section not found.</p>';
    }

    // Scroll to top
    container.scrollTop = 0;
  }

  function init() {
    // Handle hash changes
    window.addEventListener('hashchange', () => {
      const hash = location.hash.replace('#', '') || 'dashboard';
      loadSection(hash);
    });

    // Sidebar clicks
    document.getElementById('nav-list').addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        const section = link.dataset.section;
        location.hash = section;
      }
    });

    // Initial section from hash or default
    const initial = location.hash.replace('#', '') || 'dashboard';
    loadSection(initial);
  }

  return {
    init,
    loadSection,
    getCurrentSection: () => currentSection,
  };
})();
