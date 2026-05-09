// Utility functions for the entire app
window.SmartCleaner = window.SmartCleaner || {};

// Storage wrapper (localStorage with prefix and JSON handling)
const STORAGE_PREFIX = 'smartcleaner_';

SmartCleaner.Storage = {
  get(key, defaultVal = null) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch (e) {
      console.error('Storage read error', e);
      return defaultVal;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage write error', e);
      return false;
    }
  },
  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },
  clear() {
    // Remove only our keys
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k);
    });
  }
};

// Audit log helper
SmartCleaner.Audit = {
  add(action, details) {
    const logs = SmartCleaner.Storage.get('auditLog', []);
    logs.unshift({
      timestamp: new Date().toISOString(),
      action,
      details: details || ''
    });
    // Keep only last 500 entries to prevent storage overflow
    if (logs.length > 500) logs.length = 500;
    SmartCleaner.Storage.set('auditLog', logs);
  },
  getAll() {
    return SmartCleaner.Storage.get('auditLog', []);
  }
};

// Toast notification
SmartCleaner.Toast = {
  show(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = type; // 'success', 'error', 'info'
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
  }
};

// Global search utility (simple case-insensitive string search in object keys)
SmartCleaner.Search = {
  filterRecords(records, query) {
    if (!query) return records;
    const lower = query.toLowerCase();
    return records.filter(r => {
      return Object.values(r).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(lower);
        if (typeof val === 'number') return val.toString().includes(lower);
        return false;
      });
    });
  }
};

// Generate a simple unique ID (for local use)
SmartCleaner.Utils = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },
  // Format date for display
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

// Onboarding check
SmartCleaner.Onboarding = {
  isComplete() {
    return SmartCleaner.Storage.get('onboardingDone', false);
  },
  markComplete() {
    SmartCleaner.Storage.set('onboardingDone', true);
  },
  reset() {
    SmartCleaner.Storage.remove('onboardingDone');
  }
};

// Platform detection
SmartCleaner.Platform = {
  isMac: navigator.userAgent.includes('Mac OS X'),
};
