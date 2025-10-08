# Blood on the Clocktower Script Builder

A web application for creating and managing Blood on the Clocktower scripts with persistent storage.

## Features

- Create and edit Blood on the Clocktower scripts
- Character selection with proper role limits
- Persistent storage across browsers
- Script management (save, edit, delete, set active)
- Authentication system

## Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Running the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev:all
```

#### Option 2: Run separately

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Default Login

- Username: `admin`
- Password: `password`

## API Endpoints

- `GET /api/scripts` - Get all scripts
- `GET /api/scripts/active` - Get active script ID
- `GET /api/scripts/:id` - Get specific script
- `POST /api/scripts` - Create new script
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script
- `POST /api/scripts/:id/active` - Set active script
- `DELETE /api/scripts/active` - Clear active script

## Data Storage

Scripts are stored in `server/data/scripts.json` and persist across browser sessions and devices.

## Development

The backend server uses Express.js with a JSON file database. The frontend is built with React and Vite.

### Project Structure

```
botc/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── contexts/          # React contexts (Auth)
│   ├── data/              # Data management
│   └── services/          # API services
├── server/                # Backend Express server
│   ├── data/              # JSON database storage
│   └── server.js          # Express server
└── public/                # Static assets
```