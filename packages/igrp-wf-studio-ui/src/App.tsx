import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import WorkspaceList from './pages/workspaces/WorkspaceList';
import WorkspaceDetails from './pages/workspaces/WorkspaceDetails';
import ProcessEditor from './pages/ProcessEditor';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="workspaces" element={<WorkspaceList />} />
        <Route path="workspaces/:code" element={<WorkspaceDetails />} />
        <Route path="process/:id" element={<ProcessEditor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
// Remove unused React import
// import React from 'react';