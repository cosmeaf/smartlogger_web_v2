import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Recovery from './pages/Recovery';
import Main from './pages/dashboard/Main';
import Dashboard from './pages/dashboard/Dashboard';
import Devices from './pages/dashboard/Devices';
import Equipments from './pages/dashboard/Equipments';
import EquipmentCreate from './pages/dashboard/EquipmentCreate';
import EquipmentEdit from './pages/dashboard/EquipmentEdit';
import Maintenance from './pages/dashboard/Maintenance';
import MaintenanceCreate from './pages/dashboard/MaintenanceCreate';
import MaintenanceEdit from './pages/dashboard/MaintenanceEdit';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
    <ToastContainer />
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recovery" element={<Recovery />} />

          {/* Rotas Protegidas */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Main />} />
            <Route path="devices" element={<Devices />} />
            <Route path="equipments" element={<Equipments />} />
            <Route path="equipments/create" element={<EquipmentCreate />} />
            <Route path="equipments/:id/edit" element={<EquipmentEdit />} />
            <Route path="maintenance/:equipmentId" element={<Maintenance />} />
            <Route path="maintenance/:equipmentId/create" element={<MaintenanceCreate />} />
            <Route path="maintenance/:id/edit" element={<MaintenanceEdit />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
