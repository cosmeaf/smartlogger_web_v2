import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Divider,
  Chip,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
// import { DeviceResponse } from "../../../interfaces/device";
// import { deviceService } from "../../../core/http/services/deviceService";
import apiService from '../../services/apiService';
import api from '../../services/api';

// SVG Icons Components
const LocationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#1976d2"/>
  </svg>
);

const EnergyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.67 4H14l-2-4h-1L9 4H4v1.5h.61L6.5 20h11L19.39 5.5H20V4zM8.5 6h7v1.5h-7V6zm1 3h5v1.5h-5V9zm.5 3h4v1.5h-4V12z" fill="#ff9800"/>
    <path d="M8 2v4h8V2H8zm1 1h6v2H9V3z" fill="#ff9800"/>
  </svg>
);

const SensorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" fill="#4caf50"/>
    <path d="M13 1v3h-2V1h2zm0 19v3h-2v-3h2zM4.2 4.9l2.1 2.1-1.4 1.4L2.8 6.3l1.4-1.4zM18.4 19.1l-2.1-2.1 1.4-1.4 2.1 2.1-1.4 1.4zM1 13v-2h3v2H1zm19 0v-2h3v2h-3zM4.2 19.1l1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1zM19.8 4.9l-1.4 1.4-2.1-2.1 1.4-1.4 2.1 2.1z" fill="#4caf50"/>
  </svg>
);

const TimerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#9c27b0"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="#f44336"/>
  </svg>
);

const EquipmentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#2196f3"/>
  </svg>
);

const OtherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#795548"/>
  </svg>
);

const DeviceIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z" fill="#1976d2"/>
    <circle cx="12" cy="18" r="1" fill="#1976d2"/>
  </svg>
);

const StatusIcon = ({ status }) => {
  const getStatusColor = (status) => {
    if (!status) return '#757575';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('ativo') || statusLower.includes('online')) return '#4caf50';
    if (statusLower.includes('manutenção')) return '#ff9800';
    if (statusLower.includes('inativo') || statusLower.includes('offline')) return '#f44336';
    return '#757575';
  };

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill={getStatusColor(status)}/>
    </svg>
  );
};

// Bateria de Lítio (0-4.2V) - Indicador com pontos
const LithiumBatteryIcon = ({ voltage }) => {
  const numericVoltage = parseFloat(voltage) || 0;
  const percentage = Math.min(Math.max((numericVoltage / 4.2) * 100, 0), 100);
  
  const getBatteryColor = () => {
    if (percentage > 95) return '#4caf50';
    if (percentage > 30) return '#ff9800';
    return '#f44336';
  };

  const getDots = () => {
    if (percentage > 66) return 3;
    if (percentage > 33) return 2;
    if (percentage > 10) return 1;
    return 0;
  };

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="16" height="12" rx="2" stroke={getBatteryColor()} strokeWidth="2" fill="none"/>
      <rect x="18" y="9" width="2" height="6" rx="1" fill={getBatteryColor()}/>
      <rect x="3" y="7" width="14" height="10" rx="1" fill={getBatteryColor()} fillOpacity="0.1"/>
      
      {/* Pontos indicadores */}
      {getDots() >= 1 && <circle cx="6" cy="12" r="1.5" fill={getBatteryColor()}/>}
      {getDots() >= 2 && <circle cx="10" cy="12" r="1.5" fill={getBatteryColor()}/>}
      {getDots() >= 3 && <circle cx="14" cy="12" r="1.5" fill={getBatteryColor()}/>}
      
      {/* Animação de carregamento se estiver muito baixa */}
      {percentage < 10 && (
        <circle cx="10" cy="12" r="1" fill="#f44336">
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/>
        </circle>
      )}
    </svg>
  );
};

// Bateria de Carro (12V nominal, até 14V) - Indicador com barras
const CarBatteryIcon = ({ voltage }) => {
  const numericVoltage = parseFloat(voltage) || 0;
  const percentage = Math.min(Math.max(((numericVoltage - 10) / 4) * 100, 0), 100);
  
  const getBatteryColor = () => {
    if (percentage > 70) return '#4caf50';
    if (percentage > 40) return '#ff9800';
    return '#f44336';
  };

  const getBars = () => {
    if (percentage > 75) return 4;
    if (percentage > 50) return 3;
    if (percentage > 25) return 2;
    if (percentage > 10) return 1;
    return 0;
  };

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="18" height="10" rx="2" stroke={getBatteryColor()} strokeWidth="2" fill="none"/>
      <rect x="5" y="6" width="2" height="4" fill={getBatteryColor()}/>
      <rect x="17" y="6" width="2" height="4" fill={getBatteryColor()}/>
      
      {/* Barras de nível */}
      {getBars() >= 1 && <rect x="6" y="11" width="2" height="4" fill={getBatteryColor()}/>}
      {getBars() >= 2 && <rect x="9" y="11" width="2" height="4" fill={getBatteryColor()}/>}
      {getBars() >= 3 && <rect x="12" y="11" width="2" height="4" fill={getBatteryColor()}/>}
      {getBars() >= 4 && <rect x="15" y="11" width="2" height="4" fill={getBatteryColor()}/>}
      
      {/* Símbolo + e - */}
      <text x="6" y="7" fontSize="6" fill={getBatteryColor()}>+</text>
      <text x="17" y="7" fontSize="6" fill={getBatteryColor()}>-</text>
    </svg>
  );
};

// Termômetro animado para temperatura
const ThermometerIcon = ({ temperature }) => {
  const temp = parseFloat(temperature) || 0;
  const percentage = Math.min(Math.max((temp + 20) / 80 * 100, 0), 100);
  
  const getTempColor = () => {
    if (temp > 50) return '#f44336';
    if (temp > 30) return '#ff9800';
    if (temp > 10) return '#4caf50';
    return '#2196f3';
  };

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="3" width="4" height="14" rx="2" fill="#e0e0e0"/>
      <circle cx="12" cy="19" r="3" fill={getTempColor()}/>
      <rect x="11" y="4" width="2" height="13" fill={getTempColor()}/>
      
      {/* Mercúrio animado */}
      <rect x="11" y={17 - (percentage / 100 * 13)} width="2" height={(percentage / 100 * 13)} fill={getTempColor()}>
        <animate attributeName="height" values={`${(percentage / 100 * 13) - 1};${(percentage / 100 * 13)};${(percentage / 100 * 13) - 1}`} dur="2s" repeatCount="indefinite"/>
      </rect>
      
      {/* Marcações */}
      <line x1="7" y1="6" x2="9" y2="6" stroke="#666" strokeWidth="1"/>
      <line x1="7" y1="9" x2="9" y2="9" stroke="#666" strokeWidth="1"/>
      <line x1="7" y1="12" x2="9" y2="12" stroke="#666" strokeWidth="1"/>
      <line x1="7" y1="15" x2="9" y2="15" stroke="#666" strokeWidth="1"/>
    </svg>
  );
};

// Velocímetro para velocidade GPS
const SpeedIcon = ({ speed }) => {
  const numericSpeed = parseFloat(speed) || 0;
  const angle = Math.min(numericSpeed * 2, 180); // Máximo 90 km/h = 180°
  
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#f5f5f5" stroke="#ddd" strokeWidth="1"/>
      <circle cx="12" cy="12" r="2" fill="#333"/>
      
      {/* Ponteiro */}
      <line 
        x1="12" 
        y1="12" 
        x2={12 + 7 * Math.cos((angle - 90) * Math.PI / 180)} 
        y2={12 + 7 * Math.sin((angle - 90) * Math.PI / 180)} 
        stroke="#f44336" 
        strokeWidth="2" 
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 12 12;${angle - 90} 12 12`}
          dur="1s"
          fill="freeze"
        />
      </line>
      
      {/* Marcações */}
      <circle cx="12" cy="6" r="1" fill="#666"/>
      <circle cx="18" cy="12" r="1" fill="#666"/>
      <circle cx="6" cy="12" r="1" fill="#666"/>
    </svg>
  );
};

// Satélites animados
const SatelliteIcon = ({ count }) => {
  const satellites = parseInt(count) || 0;
  
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="2" fill="#4caf50"/>
      
      {/* Ondas de sinal */}
      <circle cx="12" cy="12" r="6" stroke="#4caf50" strokeWidth="1" fill="none" opacity="0.6">
        <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="12" cy="12" r="4" stroke="#4caf50" strokeWidth="1" fill="none" opacity="0.8">
        <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      
      {/* Satélites baseado na contagem */}
      {satellites >= 1 && <rect x="4" y="4" width="2" height="2" fill="#2196f3" transform="rotate(45 5 5)"/>}
      {satellites >= 2 && <rect x="18" y="4" width="2" height="2" fill="#2196f3" transform="rotate(45 19 5)"/>}
      {satellites >= 3 && <rect x="18" y="18" width="2" height="2" fill="#2196f3" transform="rotate(45 19 19)"/>}
      {satellites >= 4 && <rect x="4" y="18" width="2" height="2" fill="#2196f3" transform="rotate(45 5 19)"/>}
      
      <text x="12" y="16" textAnchor="middle" fontSize="6" fill="#666">{satellites}</text>
    </svg>
  );
};

// Horímetro - Relógio com ponteiros
const HorimeterIcon = ({ hours }) => {
  const numericHours = parseFloat(hours) || 0;
  const hourAngle = (numericHours % 12) * 30; // 360/12 = 30 graus por hora
  const minuteAngle = ((numericHours % 1) * 60) * 6; // 360/60 = 6 graus por minuto
  
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#9c27b0" strokeWidth="2" fill="#f3e5f5"/>
      
      {/* Marcações das horas */}
      <circle cx="12" cy="4" r="0.5" fill="#9c27b0"/>
      <circle cx="20" cy="12" r="0.5" fill="#9c27b0"/>
      <circle cx="12" cy="20" r="0.5" fill="#9c27b0"/>
      <circle cx="4" cy="12" r="0.5" fill="#9c27b0"/>
      
      {/* Ponteiro das horas */}
      <line 
        x1="12" 
        y1="12" 
        x2={12 + 4 * Math.cos((hourAngle - 90) * Math.PI / 180)} 
        y2={12 + 4 * Math.sin((hourAngle - 90) * Math.PI / 180)} 
        stroke="#9c27b0" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      
      {/* Ponteiro dos minutos */}
      <line 
        x1="12" 
        y1="12" 
        x2={12 + 6 * Math.cos((minuteAngle - 90) * Math.PI / 180)} 
        y2={12 + 6 * Math.sin((minuteAngle - 90) * Math.PI / 180)} 
        stroke="#7b1fa2" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Centro */}
      <circle cx="12" cy="12" r="1.5" fill="#9c27b0"/>
    </svg>
  );
};

// Mapinha clicável para localização
const MapIcon = ({ latitude, longitude, deviceId, navigate }) => {
  const handleMapClick = () => {
    if (latitude && longitude && deviceId) {
      navigate(`/dashboard/devices/location/${deviceId}`);
    }
  };

  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: latitude && longitude && deviceId ? 'pointer' : 'default' }}
      onClick={handleMapClick}
    >
      <rect x="2" y="2" width="20" height="16" rx="2" fill="#e3f2fd" stroke="#1976d2" strokeWidth="1"/>
      
      {/* Continentes simplificados */}
      <path d="M4 8 L8 6 L12 8 L16 6 L20 8 L20 14 L16 12 L12 14 L8 12 L4 14 Z" fill="#4caf50" opacity="0.7"/>
      
      {/* Marcador de localização */}
      {latitude && longitude && deviceId && (
        <>
          <circle cx="12" cy="10" r="2" fill="#f44336"/>
          <path d="M12 6 L12 8 M14 10 L16 10 M12 12 L12 14 M8 10 L10 10" stroke="#f44336" strokeWidth="1"/>
          
          {/* Animação de pulso */}
          <circle cx="12" cy="10" r="3" stroke="#f44336" strokeWidth="1" fill="none" opacity="0.5">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite"/>
          </circle>
        </>
      )}
      
      {/* Ícone de clique se houver coordenadas */}
      {latitude && longitude && deviceId && (
        <g transform="translate(16, 3)">
          <circle cx="2" cy="2" r="1.5" fill="#1976d2"/>
          <path d="M1.5 1.5 L2.5 2.5 M2.5 1.5 L1.5 2.5" stroke="white" strokeWidth="0.5"/>
        </g>
      )}
      
      {/* Tooltip visual */}
      {latitude && longitude && deviceId && (
        <title>Clique para ver no mapa</title>
      )}
    </svg>
  );
};

// Ícones SVG adicionais para os demais campos
const CourseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#1976d2" strokeWidth="2" fill="none"/>
    <path d="M12 6 L12 12 L16 16" stroke="#1976d2" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="1" fill="#1976d2"/>
  </svg>
);

const GpsFixIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="#4caf50"/>
  </svg>
);

const InputIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#ff9800" strokeWidth="2" fill="none"/>
    <circle cx="7" cy="8" r="1" fill="#ff9800"/>
    <circle cx="11" cy="8" r="1" fill="#ff9800"/>
    <circle cx="15" cy="8" r="1" fill="#ff9800"/>
    <rect x="6" y="12" width="12" height="2" fill="#ff9800"/>
    <rect x="6" y="16" width="8" height="2" fill="#ff9800"/>
  </svg>
);

const OutputIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#2196f3" strokeWidth="2" fill="none"/>
    <path d="M8 12 L10 14 L16 8" stroke="#2196f3" strokeWidth="2" fill="none"/>
    <circle cx="19" cy="6" r="2" fill="#4caf50"/>
  </svg>
);

const ModeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="16" height="12" rx="2" stroke="#9c27b0" strokeWidth="2" fill="none"/>
    <circle cx="8" cy="10" r="1" fill="#9c27b0"/>
    <circle cx="12" cy="10" r="1" fill="#9c27b0"/>
    <circle cx="16" cy="10" r="1" fill="#9c27b0"/>
    <rect x="6" y="13" width="4" height="2" fill="#9c27b0"/>
    <rect x="14" y="13" width="4" height="2" fill="#9c27b0"/>
  </svg>
);

const ReportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#607d8b"/>
  </svg>
);

const OdometerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#795548" strokeWidth="2" fill="#f5f5f5"/>
    <text x="12" y="8" textAnchor="middle" fontSize="8" fill="#795548">KM</text>
    <circle cx="12" cy="12" r="1" fill="#795548"/>
    <line x1="12" y1="12" x2="16" y2="12" stroke="#795548" strokeWidth="2"/>
    <circle cx="6" cy="12" r="1" fill="#795548"/>
    <circle cx="18" cy="12" r="1" fill="#795548"/>
    <circle cx="12" cy="6" r="1" fill="#795548"/>
    <circle cx="12" cy="18" r="1" fill="#795548"/>
  </svg>
);

const TripIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 15l-6 6-6-6" stroke="#ff5722" strokeWidth="2" fill="none"/>
    <path d="M9 9l6-6 6 6" stroke="#ff5722" strokeWidth="2" fill="none"/>
    <line x1="13" y1="21" x2="13" y2="3" stroke="#ff5722" strokeWidth="2"/>
    <circle cx="13" cy="12" r="2" fill="#ff5722"/>
  </svg>
);

const IdleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#757575" strokeWidth="2" fill="#f5f5f5"/>
    <path d="M12 6v6l4 2" stroke="#757575" strokeWidth="2"/>
    <circle cx="12" cy="12" r="1" fill="#757575"/>
    <text x="12" y="20" textAnchor="middle" fontSize="6" fill="#757575">IDLE</text>
  </svg>
);

const ImpactIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" fill="#f44336"/>
    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="#f44336" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="1" fill="white"/>
  </svg>
);

const AccelerationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12h20" stroke="#00bcd4" strokeWidth="2"/>
    <path d="M12 2v20" stroke="#00bcd4" strokeWidth="2"/>
    <path d="M6 6l12 12" stroke="#00bcd4" strokeWidth="1" opacity="0.5"/>
    <circle cx="12" cy="12" r="2" fill="#00bcd4"/>
    <path d="M18 12l-2-2v4l2-2z" fill="#00bcd4"/>
  </svg>
);

const AdcIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="8" width="18" height="8" stroke="#3f51b5" strokeWidth="2" fill="none"/>
    <path d="M6 12h3l2-4 2 8 2-4h3" stroke="#3f51b5" strokeWidth="2" fill="none"/>
    <circle cx="6" cy="12" r="1" fill="#3f51b5"/>
    <circle cx="18" cy="12" r="1" fill="#3f51b5"/>
  </svg>
);

const SocIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="7" width="14" height="10" rx="2" stroke="#4caf50" strokeWidth="2" fill="none"/>
    <rect x="17" y="10" width="2" height="4" rx="1" fill="#4caf50"/>
    <text x="10" y="13" textAnchor="middle" fontSize="8" fill="#4caf50">SOC</text>
    <rect x="5" y="9" width="10" height="6" rx="1" fill="#4caf50" fillOpacity="0.3"/>
  </svg>
);

const MaintenanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="#ff9800"/>
  </svg>
);

const StatusEquipmentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#2196f3" strokeWidth="2" fill="none"/>
    <path d="M9 12l2 2 4-4" stroke="#4caf50" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" fill="#2196f3" fillOpacity="0.3"/>
  </svg>
);

const WorkedHoursIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#ff5722" strokeWidth="2" fill="none"/>
    <path d="M12 6v6l4 2" stroke="#ff5722" strokeWidth="2"/>
    <circle cx="12" cy="12" r="1" fill="#ff5722"/>
    <path d="M6 2v4M18 2v4M4 8h16" stroke="#ff5722" strokeWidth="1"/>
  </svg>
);

const RemainingHoursIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#ff9800" strokeWidth="2" fill="none"/>
    <path d="M12 6v6l-4 2" stroke="#ff9800" strokeWidth="2"/>
    <circle cx="12" cy="12" r="1" fill="#ff9800"/>
    <path d="M18 6L6 18" stroke="#f44336" strokeWidth="1" opacity="0.5"/>
    <text x="12" y="20" textAnchor="middle" fontSize="6" fill="#ff9800">H</text>
  </svg>
);

// Função para obter ícone específico por campo
const getFieldIcon = (field, value, device, navigate) => {
  if (field === 'battery_voltage') {
    return <LithiumBatteryIcon voltage={value} />;
  }
  if (field === 'power_voltage') {
    return <CarBatteryIcon voltage={value} />;
  }
  if (field === 'calculated_temperature') {
    return <ThermometerIcon temperature={value} />;
  }
  if (field === 'speed_gps') {
    return <SpeedIcon speed={value} />;
  }
  if (field === 'satellites') {
    return <SatelliteIcon count={value} />;
  }
  if (field === 'horimeter' || field === 'trip_horimeter') {
    return <HorimeterIcon hours={value} />;
  }
  if (field === 'latitude' || field === 'longitude') {
    return <MapIcon latitude={device?.latitude} longitude={device?.longitude} deviceId={device?.device_id} navigate={navigate} />;
  }
  if (field === 'course') {
    return <CourseIcon />;
  }
  if (field === 'gps_fix_status') {
    return <GpsFixIcon />;
  }
  if (field === 'input_state') {
    return <InputIcon />;
  }
  if (field === 'output_state') {
    return <OutputIcon />;
  }
  if (field === 'mode') {
    return <ModeIcon />;
  }
  if (field === 'report_type') {
    return <ReportIcon />;
  }
  if (field === 'gps_odometer') {
    return <OdometerIcon />;
  }
  if (field === 'trip_distance') {
    return <TripIcon />;
  }
  if (field === 'idle_time') {
    return <IdleIcon />;
  }
  if (field === 'impact') {
    return <ImpactIcon />;
  }
  if (field === 'acceleration_x' || field === 'acceleration_y' || field === 'acceleration_z') {
    return <AccelerationIcon />;
  }
  if (field === 'adc_value') {
    return <AdcIcon />;
  }
  if (field === 'soc_battery_voltage') {
    return <SocIcon />;
  }
  if (field === 'in_manutenance' || field === 'last_maintenance' || field === 'next_maintenance') {
    return <MaintenanceIcon />;
  }
  if (field === 'status') {
    return <StatusEquipmentIcon />;
  }
  if (field === 'worked_hours') {
    return <WorkedHoursIcon />;
  }
  if (field === 'min_remaining_hours') {
    return <RemainingHoursIcon />;
  }
  if (field === 'model') {
    return <LocationIcon />;
  }
  if (field === 'date' || field === 'time' || field === 'created_at' || field === 'updated_at') {
    return <CalendarIcon />;
  }
  return null;
};

const LABELS = {
  device_id: "ID",
  name: "Nome",
  in_manutenance: "Em Manutenção",
  hdr: "HDR",
  report_map: "Mapa",
  model: "Local",
  software_version: "Versão",
  message_type: "Tipo MSG",
  date: "Data",
  time: "Hora",
  latitude: "Latitude",
  longitude: "Longitude",
  speed_gps: "Velocidade",
  course: "Direção",
  satellites: "Satélites",
  gps_fix_status: "GPS Fix",
  input_state: "Entrada",
  output_state: "Saída",
  mode: "Modo",
  report_type: "Tipo",
  message_number: "Nº MSG",
  reserved: "Reservado",
  assign_map: "Atribuição",
  power_voltage: "Tensão Principal",
  battery_voltage: "Bateria",
  connection_rat: "Conexão",
  acceleration_x: "Acel. X",
  acceleration_y: "Acel. Y",
  acceleration_z: "Acel. Z",
  adc_value: "ADC",
  gps_odometer: "Odômetro",
  trip_distance: "Distância",
  horimeter: "Horímetro",
  trip_horimeter: "Horím. Viagem",
  idle_time: "Tempo Parado",
  impact: "Impacto",
  soc_battery_voltage: "SOC",
  calculated_temperature: "Temperatura",
  min_remaining_hours: "Horas Restantes",
  location: "Localização",
  status: "Status",
  worked_hours: "Horas Trabalhadas",
  last_maintenance: "Última Manutenção",
  next_maintenance: "Próxima Manutenção",
  created_at: "Criado",
  updated_at: "Atualizado",
};

const formatKey = (key) =>
  LABELS[key] ||
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const UNITS = {
  horimeter: 'h',
  horímetro: 'h',
  trip_horimeter: 'h',
  'horímetro da viagem': 'h',
  gps_odometer: 'km',
  odômetro: 'km',
  trip_distance: 'km',
  'distância da viagem': 'km',
  power_voltage: 'V',
  battery_voltage: 'V',
  soc_battery_voltage: 'V',
  temperatura: '°C',
  calculated_temperature: '°C',
  speed_gps: 'km/h',
  velocidade_gps: 'km/h',
  acceleration_x: 'm/s²',
  acceleration_y: 'm/s²',
  acceleration_z: 'm/s²',
  adc_value: 'V',
};

const formatValue = (key, v) => {
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (/(date|time|created|updated)/i.test(key) && typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleString("pt-BR");
  }
  if (typeof v === "number") {
    let valueStr;
    if (/temperature|temperatura/i.test(key)) {
      valueStr = v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    } else if (/voltage|tensao/i.test(key)) {
      valueStr = v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (/horimeter|horímetro|odometer|odômetro|distance|distância|trip/i.test(key)) {
      valueStr = v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    } else {
      valueStr = v.toLocaleString("pt-BR");
    }
    // Busca unidade por key ou label
    let unit = UNITS[key];
    if (!unit) {
      const label = LABELS[key]?.toLowerCase();
      if (label) {
        unit = UNITS[label];
      }
    }
    return unit ? `${valueStr} ${unit}` : valueStr;
  }
  return v == null ? "—" : String(v);
};


export default function DeviceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  // Criar tema do Material-UI baseado no tema atual
  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#60a5fa' : '#1976d2', // Azul mais claro no dark mode
      },
      secondary: {
        main: isDarkMode ? '#f87171' : '#dc004e', // Vermelho mais suave no dark mode
      },
      background: {
        default: isDarkMode ? '#111827' : '#fafafa',
        paper: isDarkMode ? '#1f2937' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f3f4f6' : '#000000',
        secondary: isDarkMode ? '#9ca3af' : '#666666',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderColor: isDarkMode ? '#374151' : '#e0e0e0',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDarkMode ? '#374151' : '#e0e0e0',
          },
        },
      },
    },
  });

  useEffect(() => {
    let foundDevice = null;
    apiService
      .get('/devices/')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [data];
        foundDevice = list.find((d) => String(d.device_id) === String(id));
        if (!foundDevice) {
          setError("Dispositivo não encontrado.");
          setLoading(false);
          return;
        }
        setDevice(foundDevice);
        // Buscar equipamento relacionado
        if (foundDevice.device_id) {
          api.get('/equipments/')
            .then(({ data: eqs }) => {
              const eq = Array.isArray(eqs)
                ? eqs.find(e => String(e.device) === String(foundDevice.device_id))
                : null;
              setEquipment(eq || null);
            })
            .catch(() => setEquipment(null))
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Erro ao carregar dispositivo.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <ThemeProvider theme={muiTheme}>
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !device) {
    return (
      <ThemeProvider theme={muiTheme}>
        <Box m={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      </ThemeProvider>
    );
  }


  // Agrupamento de campos de interesse
  const interestGroups = [
    {
      title: 'Localização',
      icon: <LocationIcon />,
      color: '#1976d2',
      fields: ['latitude', 'longitude', 'speed_gps', 'course', 'satellites', 'gps_fix_status', ...(equipment ? ['model'] : [])],
    },
    {
      title: 'Energia',
      icon: <EnergyIcon />,
      color: '#ff9800',
      fields: ['power_voltage', 'battery_voltage', 'soc_battery_voltage'],
    },
    {
      title: 'Sensores',
      icon: <SensorIcon />,
      color: '#4caf50',
      fields: ['calculated_temperature', 'acceleration_x', 'acceleration_y', 'acceleration_z', 'adc_value', 'impact'],
    },
    {
      title: 'Distâncias e Tempo',
      icon: <TimerIcon />,
      color: '#9c27b0',
      fields: ['horimeter', 'trip_horimeter', 'gps_odometer', 'trip_distance', 'idle_time', ...(equipment ? ['min_remaining_hours'] : [])],
    },
    {
      title: 'Data/Hora',
      icon: <CalendarIcon />,
      color: '#f44336',
      fields: ['date', 'time', 'created_at', 'updated_at'],
    },
    {
      title: 'Sistema',
      icon: <ReportIcon />,
      color: '#607d8b',
      fields: ['input_state', 'output_state', 'mode', 'report_type', 'in_manutenance'],
    },
  ];

  // Campos não agrupados
  // Campos que devem ir para "Outros" (campos sem ícone ou menos relevantes)
  const extraOtherFields = ['software_version', 'message_type', 'hdr', 'report_map', 'message_number', 'reserved', 'assign_map', 'connection_rat'];
  const shownFields = interestGroups.flatMap(g => g.fields);
  const otherFields = [
    ...extraOtherFields.filter(f => device[f] !== undefined),
    ...Object.keys(device).filter(k => !shownFields.includes(k) && !extraOtherFields.includes(k)),
  ];

  // Campos de interesse do equipamento (apenas extras)
  const equipmentGroups = equipment ? [
    {
      title: 'Equipamento',
      icon: <EquipmentIcon />,
      color: '#2196f3',
      fields: [
        'status',
        'worked_hours',
        'last_maintenance',
        'next_maintenance',
        'name', // Nome do equipamento se disponível
      ].filter(f => equipment[f] !== undefined),
    },
  ] : [];

  return (
    <ThemeProvider theme={muiTheme}>
      <Card sx={{ m: 2, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <DeviceIcon />
            <Box>
              <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
                Dispositivo {device.device_id}
              </Typography>
              {equipment && equipment.name && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6" color="text.secondary">
                    Máquina: {equipment.name}
                  </Typography>
                  {equipment.status && (
                    <Chip
                      icon={<StatusIcon status={equipment.status} />}
                      label={equipment.status}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>

        <Box display="flex" flexWrap="wrap" gap={2}>
          {interestGroups.map(group => (
            <Paper 
              key={group.title} 
              variant="outlined" 
              sx={{ 
                p: 2, 
                minWidth: 260, 
                flex: '1 1 320px', 
                boxShadow: 1,
                borderTop: `4px solid ${group.color}`,
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {group.icon}
                <Typography variant="h6" sx={{ color: group.color }}>{group.title}</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {/* Primeiro renderiza campos com ícones */}
              {group.fields.map(field => {
                // Se for campo do equipamento, pega do equipment, senão do device
                const value = equipment && equipment[field] !== undefined ? equipment[field] : device[field];
                if (value === undefined) return null;
                const fieldIcon = getFieldIcon(field, value, device, navigate);
                if (!fieldIcon) return null; // Só renderiza se tiver ícone
                return (
                  <Box key={field} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                      {fieldIcon}
                    </Box>
                    <Box>
                      <Typography component="span" sx={{ fontWeight: "bold" }}>{formatKey(field)}:</Typography>{' '}
                      <Typography component="span">{formatValue(field, value)}</Typography>
                    </Box>
                  </Box>
                );
              })}
              {/* Depois renderiza campos sem ícones */}
              {group.fields.map(field => {
                const value = equipment && equipment[field] !== undefined ? equipment[field] : device[field];
                if (value === undefined) return null;
                const fieldIcon = getFieldIcon(field, value, device, navigate);
                if (fieldIcon) return null; // Só renderiza se NÃO tiver ícone
                return (
                  <Box key={field} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                      {/* Espaço vazio para alinhamento */}
                    </Box>
                    <Box>
                      <Typography component="span" sx={{ fontWeight: "bold" }}>{formatKey(field)}:</Typography>{' '}
                      <Typography component="span">{formatValue(field, value)}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          ))}
          {/* Dados do Equipamento */}
          {equipmentGroups.map(group => (
            <Paper 
              key={group.title} 
              variant="outlined" 
              sx={{ 
                p: 2, 
                minWidth: 260, 
                flex: '1 1 320px', 
                boxShadow: 1,
                borderTop: `4px solid ${group.color}`,
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {group.icon}
                <Typography variant="h6" sx={{ color: group.color }}>{group.title}</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {/* Primeiro renderiza campos com ícones */}
              {group.fields.map(field => {
                const fieldIcon = getFieldIcon(field, equipment[field], device, navigate);
                if (!fieldIcon) return null; // Só renderiza se tiver ícone
                return (
                  <Box key={field} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                      {fieldIcon}
                    </Box>
                    <Box>
                      <Typography component="span" sx={{ fontWeight: "bold" }}>{formatKey(field)}:</Typography>{' '}
                      <Typography component="span">{formatValue(field, equipment[field])}</Typography>
                    </Box>
                  </Box>
                );
              })}
              {/* Depois renderiza campos sem ícones */}
              {group.fields.map(field => {
                const fieldIcon = getFieldIcon(field, equipment[field], device, navigate);
                if (fieldIcon) return null; // Só renderiza se NÃO tiver ícone
                return (
                  <Box key={field} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                      {/* Espaço vazio para alinhamento */}
                    </Box>
                    <Box>
                      <Typography component="span" sx={{ fontWeight: "bold" }}>{formatKey(field)}:</Typography>{' '}
                      <Typography component="span">{formatValue(field, equipment[field])}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          ))}
          {otherFields.length > 0 && (
            <Paper 
              key="outros" 
              variant="outlined" 
              sx={{ 
                p: 2, 
                minWidth: 260, 
                flex: '1 1 320px', 
                boxShadow: 1,
                borderTop: '4px solid #795548',
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <OtherIcon />
                <Typography variant="h6" sx={{ color: '#795548' }}>Outros</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              {/* Primeiro renderiza campos com ícones */}
              {otherFields.map(field => {
                const fieldIcon = getFieldIcon(field, device[field], device, navigate);
                if (!fieldIcon) return null; // Só renderiza se tiver ícone
                return (
                  <Box key={field} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                      {fieldIcon}
                    </Box>
                    <Box>
                      <Typography component="span" sx={{ fontWeight: "bold" }}>{formatKey(field)}:</Typography>{' '}
                      <Typography component="span">{formatValue(field, device[field])}</Typography>
                    </Box>
                  </Box>
                );
              })}
              {/* Depois renderiza campos sem ícones */}
              {otherFields.map(field => {
                const fieldIcon = getFieldIcon(field, device[field], device, navigate);
                if (fieldIcon) return null; // Só renderiza se NÃO tiver ícone
                return (
                  <Box key={field} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                      {/* Espaço vazio para alinhamento */}
                    </Box>
                    <Box>
                      <Typography component="span" sx={{ fontWeight: "bold" }}>{formatKey(field)}:</Typography>{' '}
                      <Typography component="span">{formatValue(field, device[field])}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          )}
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button 
            variant="contained" 
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 3
              }
            }}
          >
            ← Voltar
          </Button>
        </Box>
      </CardContent>
    </Card>
    </ThemeProvider>
  );
}
