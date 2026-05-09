SmartCleaner.About = (function() {
  function render(container) {
    container.innerHTML = `
      <div class="section-page">
        <h2>About Smart Cleaner</h2>
        <div style="max-width:600px;">
          <div style="background: var(--bg-secondary); border-radius: var(--radius); padding: 20px; border: 1px solid var(--border); box-shadow: var(--shadow); margin-bottom:20px;">
            <h3 style="margin-bottom:12px;">Design &amp; Style</h3>
            <p style="font-size:0.9rem; line-height:1.6; color: var(--text-secondary);">
              The interface follows an <strong>Apple-inspired design</strong> language – clean, light, and minimal. 
              It uses the system font stack (<code>-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif</code>) for native readability.
            </p>
            <ul style="margin:12px 0 0 20px; font-size:0.85rem; color: var(--text-secondary);">
              <li><strong>Glassmorphic title bar</strong> – frosted glass effect via <code>backdrop-filter: blur(12px)</code></li>
              <li><strong>Light theme</strong> with subtle shadows and rounded corners (8px radius)</li>
              <li><strong>Status badges</strong> – color‑coded pill labels for workflow stages</li>
              <li><strong>No external CSS framework</strong> – all styles are crafted using custom CSS variables</li>
              <li><strong>Responsive sidebar</strong> that collapses on narrow screens</li>
              <li><strong>macOS optimisations</strong> – hidden title bar with native traffic lights, vibrancy effect</li>
            </ul>
          </div>

          <div style="background: var(--bg-secondary); border-radius: var(--radius); padding: 20px; border: 1px solid var(--border); box-shadow: var(--shadow);">
            <h3 style="margin-bottom:12px;">Technology</h3>
            <p style="font-size:0.9rem; color: var(--text-secondary);">
              Built with <strong>Electron</strong>. Data is stored locally in the browser’s <code>localStorage</code> 
              (prefixed with <code>smartcleaner_</code>). No external servers or APIs are used – everything runs offline.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  return { render };
})();
