// Main app initialization
(function() {
  // Ensure onboarding check
  if (!SmartCleaner.Onboarding.isComplete()) {
    // Show a simple onboarding modal if no records exist
    const records = SmartCleaner.Storage.get('records', []);
    if (records.length === 0) {
      // Check if seed data already executed
      SmartCleaner.SeedData.generate();
      SmartCleaner.Onboarding.markComplete();
      SmartCleaner.Toast.show('Welcome! Sample data has been loaded.', 'success', 5000);
    } else {
      SmartCleaner.Onboarding.markComplete();
    }
  }

  // Start navigation
  SmartCleaner.Navigation.init();

  // --- Title bar customisation ---

  // On Mac, hide the window control buttons (we use native traffic lights)
  // and add padding to titlebar to avoid covering them.
  if (SmartCleaner.Platform.isMac) {
    document.querySelector('#titlebar-controls').classList.add('hidden');
    document.querySelector('#titlebar').classList.add('mac-titlebar');
  } else {
    // On Windows/Linux, wire up custom window controls
    document.getElementById('min-btn').addEventListener('click', () => {
      window.electronAPI.windowMinimize();
    });
    document.getElementById('max-btn').addEventListener('click', () => {
      window.electronAPI.windowMaximize();
    });
    document.getElementById('close-btn').addEventListener('click', () => {
      window.electronAPI.windowClose();
    });
  }
})();
