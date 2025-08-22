import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DeviceProvider } from './context/DeviceContext';
import { NotificationProvider } from './context/NotificationContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Recovery from './pages/auth/Recovery';

// Dashboard Layout
import Dashboard from './pages/dashboard/Dashboard';
import Main from './pages/dashboard/Main';

// Device Pages
import Devices from './pages/devices/Devices';
import DeviceDetails from './pages/devices/DeviceDetails';
import DeviceLocation from './pages/devices/DeviceLocation';

// Equipment Pages
import Equipments from './pages/equipments/Equipments';
import EquipmentCreate from './pages/equipments/EquipmentCreate';
import EquipmentEdit from './pages/equipments/EquipmentEdit';

// Maintenance Pages
import Maintenance from './pages/maintenance/Maintenance';
import MaintenanceCreate from './pages/maintenance/MaintenanceCreate';
import MaintenanceEdit from './pages/maintenance/MaintenanceEdit';

// Records Pages
import Reports from './pages/records/Reports';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import LogoutHandler from './components/LogoutHandler';

function App() {
  return (
    <DeviceProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ToastContainer />
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
          <Routes>
          {/* ========== ROTAS PÚBLICAS (AUTENTICAÇÃO) ========== */}
          <Route path="/" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/recovery" element={
            <PublicRoute>
              <Recovery />
            </PublicRoute>
          } />

          {/* ========== ROTAS PROTEGIDAS (DASHBOARD) ========== */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Principal */}
            <Route index element={<Main />} />
            
            {/* ========== ROTAS DE RELATÓRIOS ========== */}
            <Route path="reports" element={<Reports />} />
            
            {/* ========== ROTAS DE DISPOSITIVOS ========== */}
            <Route path="devices" element={<Devices />} />
            <Route path="devices/:id" element={<DeviceDetails />} />
            <Route path="devices/location/:id" element={<DeviceLocation />} />
            
            {/* ========== ROTAS DE EQUIPAMENTOS ========== */}
            <Route path="equipments" element={<Equipments />} />
            <Route path="equipments/create" element={<EquipmentCreate />} />
            <Route path="equipments/:id/edit" element={<EquipmentEdit />} />
            
            {/* ========== ROTAS DE MANUTENÇÃO ========== */}
            <Route path="maintenance/:equipmentId" element={<Maintenance />} />
            <Route path="maintenance/:equipmentId/create" element={<MaintenanceCreate />} />
            <Route path="maintenance/:id/edit" element={<MaintenanceEdit />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  </AuthProvider>
</ThemeProvider>
</DeviceProvider>
  );
}

export default App;
