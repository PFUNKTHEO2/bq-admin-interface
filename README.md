# BigQuery Admin Interface

Full-stack BigQuery management dashboard with CRUD operations, built with React + TypeScript frontend and Express + Node.js backend.

## Architecture

**Frontend:** React + TypeScript + Material-UI  
**Backend:** Express + Node.js + TypeScript  
**Database:** Google BigQuery (hockey-data-analysis project)  
**Deployment:** Frontend on Vercel, Backend on Railway/Vercel  

## Project Structure

```
bigquery-admin/
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # BigQuery service layer
│   │   └── types/    # TypeScript interfaces
│   └── dist/         # Compiled JavaScript
└── frontend/         # React application
    ├── src/
    │   ├── components/
    │   ├── services/
    │   └── hooks/
    └── build/        # Production build
```

## Features

- **Dataset Management:** Browse and explore BigQuery datasets
- **Table Viewer:** Display table schemas and data with pagination
- **Real-time Data:** Connect to live BigQuery data (129+ tables)
- **Professional UI:** Material-UI components with responsive design
- **Type Safety:** Full TypeScript implementation
- **RESTful API:** Clean separation between frontend and backend

## Available Scripts

### Frontend Development

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.  
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.

#### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

### Backend Development

Navigate to the `backend/` directory:

#### `npm run dev`

Runs the API server in development mode with auto-restart.  
Server runs on [http://localhost:3001](http://localhost:3001)

#### `npm run build`

Compiles TypeScript to JavaScript in the `dist/` folder.

#### `npm start`

Runs the compiled production server.

## API Endpoints

- `GET /health` - Server health check
- `GET /api/datasets` - List all datasets
- `GET /api/datasets/:id/tables` - List tables in dataset
- `GET /api/datasets/:id/tables/:tableId` - Get table schema
- `GET /api/datasets/:id/tables/:tableId/data` - Get table data

## Environment Variables

### Backend (.env)
```
GOOGLE_APPLICATION_CREDENTIALS_JSON=your-service-account-json
GOOGLE_CLOUD_PROJECT_ID=hockey-data-analysis
NODE_ENV=production
PORT=3001
```

### Frontend
Configure API base URL in `src/services/api.ts`

## Deployment

### Frontend (Vercel)
1. Connect repository to Vercel
2. Deploy from root directory
3. Automatic deployments on git push

### Backend (Railway/Vercel)
1. Deploy from `backend/` subdirectory
2. Set environment variables in platform dashboard
3. Configure build command: `npm run build`
4. Configure start command: `npm start`

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Material-UI documentation](https://mui.com/)
- [Google BigQuery documentation](https://cloud.google.com/bigquery/docs)
- [Express.js documentation](https://expressjs.com/)