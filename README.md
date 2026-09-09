# Storyline CMS

A responsive editorial content management frontend built with React, JavaScript, and modern CSS. It includes a small persistent Node REST API for a complete local CRUD workflow.

## Features

- Dashboard with article stats, publishing progress, category breakdown, and recent activity
- Article table with search, filters, sorting, pagination, row selection, bulk publish/draft/delete workflows, and row-level actions
- Complete create, read, update, delete, publish, and unpublish workflows
- Reusable create/edit form with validation, tags, image URL or upload, local draft recovery, keyboard save, and real-time preview
- Lightweight inline formatting with headings, emphasis, lists, links, formatted live preview, and working undo/redo history
- Dedicated article preview route and filtered CSV export
- Category creation, team invitations, persistent role management, and protected member removal workflows
- Global loading, error, toast, and confirmation states
- Responsive sidebar and mobile navigation
- Symmetrical monochrome glass interface with bundled Fredoka typography, three distinct white-tone themes, consistent section spacing, and persistent small/medium/large sizing
- Persistent publication details and editorial workflow settings with validation
- Accessible labels, focus states, keyboard-friendly controls, and reduced-motion support

## Project structure

```text
backend/            Persistent custom Node REST API and JSON data store
public/images/       Minimal editorial cover assets
src/
  components/       Reusable UI components
  context/          Global CMS state and actions
  hooks/            Custom React hooks
  pages/            Route-level page components
  services/         REST API client
  utils/            Formatting helpers
```

## Setup

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run build
```

The development server exposes both the React app and Node REST handler from port `3000`. Open `http://127.0.0.1:3000` in your browser. You can override the port with the `STORYLINE_PORT` environment variable. The standalone API can still be started on port `4001` with `npm run api` for production-style deployments.

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/articles` | List articles |
| `GET` | `/api/articles/:id` | Get one article |
| `POST` | `/api/articles` | Create an article |
| `PUT` | `/api/articles/:id` | Replace/update an article |
| `PATCH` | `/api/articles/:id` | Update status or selected fields |
| `DELETE` | `/api/articles/:id` | Delete an article |

API changes are written to `backend/db.json` so content survives server restarts.

## GitHub repository

The included `.gitignore` excludes dependencies, builds, caches, logs, environment files, editor settings, and test output. Commit the source files and lockfile, but do not commit `node_modules/` or `dist/`.

```bash
git init
git add .
git commit -m "Build Storyline CMS"
```

## Production build

```bash
npm run build
npm run api       # start the API separately
npm run preview   # preview the frontend build
```

For a deployed environment, configure the web server to forward `/api` requests to the Node service.
