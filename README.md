# Smart Cleaner

A records and workflow management desktop application for business operations. Designed for non-technical teams with an intuitive interface.

## Features

- Dashboard with KPIs and status breakdown
- Records management (CRUD, search, filter, sort)
- CSV import/export with validation
- Reports with visual distribution and export
- Audit log of all actions
- Settings (business name, workflow labels)
- Backup and restore (JSON)
- Demo seed data included

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Run

```bash
npm start
```

The application will launch. On first run, sample records are automatically loaded.

## Usage

- Use the sidebar to navigate between sections.
- **Dashboard**: Overview of record counts and recent activity.
- **Records**: Add, edit, delete records; filter by status; search; import/export CSV.
- **Tasks**: Manage tasks with due dates and assignments.
- **Calendar**: View tasks and records on a monthly calendar.
- **Reports**: Summary statistics and status distribution chart, exportable.
- **Audit Log**: View all actions recorded.
- **Settings**: Customize business name and status labels, backup/restore data.

## Data Storage

All data is stored locally in your browser's localStorage (under the `smartcleaner_` prefix). No external servers are used. Backups can be made via Settings -> Backup.

## Supported Platforms

- macOS (optimized with hidden title bar and vibrancy)
- Windows
- Linux

## Development

Built with Electron. To modify:

- `main.js` - Electron main process
- `preload.js` - Secure API bridge
- `renderer/` - Frontend HTML, CSS, and JavaScript modules

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.  
Repository conventions are enforced by [.editorconfig](.editorconfig) – make sure your editor supports it.

## License

MIT
