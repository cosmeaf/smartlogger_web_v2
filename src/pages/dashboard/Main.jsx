// Backup do arquivo original Main.jsx
// Data do backup: 28/07/2025

/* eslint-disable */

// ...código original abaixo...

import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Estilos CSS para animações
const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Injetar os estilos no documento
if (typeof document !== 'undefined' && !document.getElementById('dashboard-animations')) {
  const style = document.createElement('style');
  style.id = 'dashboard-animations';
  style.textContent = fadeInUpKeyframes;
  document.head.appendChild(style);
}
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FaTractor, FaTools, FaWrench, FaUserCog } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import api from '../../services/api';
import LoadPage from '../../components/LoadPage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Main = () => {
  const [statisticsCardsData, setStatisticsCardsData] = useState([]);
  const [statisticsChartsData, setStatisticsChartsData] = useState([]);
  const [alertMachines, setAlertMachines] = useState([]);
  const [alertTemp, setAlertTemp] = useState(90);
  const [loading, setLoading] = useState(true);
  const [popupData, setPopupData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [mergedEquipments, setMergedEquipments] = useState([]);
  const { isDarkMode } = useTheme();
  const { isMobile, isTablet, isDesktop, getGridCols, getResponsiveClasses } = useDevice();

  // Função para obter a data de atualização mais recente dos devices
  const getLastUpdateTime = () => {
    if (!devices || devices.data?.length === 0) return 'Sem dados';
    
    try {
      // Encontra o dispositivo com updated_at mais próximo da hora atual (mais recente)
      const now = new Date();
      let mostRecentDevice = devices.data[0];
      let smallestTimeDiff = Math.abs(now - new Date(devices.data[0].updated_at));
      
      devices.data.forEach(device => {
        const deviceUpdate = new Date(device.updated_at);
        const timeDiff = Math.abs(now - deviceUpdate);
        if (timeDiff < smallestTimeDiff) {
          smallestTimeDiff = timeDiff;
          mostRecentDevice = device;
        }
      });
      
      // Mostra sempre a data e hora específica do dispositivo mais atual
      const mostRecentUpdate = new Date(mostRecentDevice.updated_at);
      
      // Sempre mostra data e hora completas no formato brasileiro
      return mostRecentUpdate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao calcular última atualização:', error);
      return 'Atualizado recentemente';
    }
  };

  // Função para determinar o status da comunicação baseado na data de atualização
  const getCommunicationStatus = () => {
    if (!devices || devices.data?.length === 0) return { color: 'bg-gray-400', isRecent: false };
    
    try {
      // Encontra o dispositivo com updated_at mais próximo da hora atual (mais recente)
      const currentTime = new Date();
      let mostRecentDevice = devices.data[0];
      let smallestTimeDiff = Math.abs(currentTime - new Date(devices.data[0].updated_at));
      
      devices.data.forEach(device => {
        const deviceUpdate = new Date(device.updated_at);
        const timeDiff = Math.abs(currentTime - deviceUpdate);
        if (timeDiff < smallestTimeDiff) {
          smallestTimeDiff = timeDiff;
          mostRecentDevice = device;
        }
      });
      
      const lastUpdate = new Date(mostRecentDevice.updated_at);
      const timeDifference = currentTime - lastUpdate;
      const oneDay = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
      
      if (timeDifference <= oneDay) {
        return { color: 'bg-green-400', isRecent: true };
      } else {
        return { color: 'bg-red-400', isRecent: false };
      }
    } catch (error) {
      console.error('Erro ao calcular status de comunicação:', error);
      return { color: 'bg-gray-400', isRecent: false };
    }
  };

  const fetchStatisticsData = async () => {
    try {
      const [devices, equipments, maintenances, employees] = await Promise.all([
        api.get('/devices/'),
        api.get('/equipments/'),
        api.get('/maintenances/'),
        api.get('/employees/'),
      ]);

      // Merge equipamentos com devices (pelo device_id)
      const mergedEquipments = equipments.data.map((equipment) => {
        const deviceData = devices.data.find((d) => String(d.device_id) === String(equipment.device));
        return { ...equipment, deviceData };
      });

      // Store devices and merged equipments for popup usage
      setDevices(devices);
      setMergedEquipments(mergedEquipments);

      // Dados para os cards
      const cardsData = [
        {
          title: 'Dispositivos Encontrados ',
          value: devices.data.length,
          footer: {
            color: 'text-green-500',
            value: '',
            label: '',
          },
          icon: <FaTractor className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`} />,
        },
        {
          title: 'Equipamentos Cadastrados',
          value: equipments.data.length,
          footer: {
            color: 'text-blue-500',
            value: '',
            label: '',
          },
          icon: <FaTools className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`} />,
        },
        {
          title: 'Manutenções Cadastradas',
          value: maintenances.data.length,
          footer: {
            color: 'text-red-500',
            value: '',
            label: '',
          },
          icon: <FaWrench className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`} />,
        },
        {
          title: 'Horas Totais Trabalhadas',
          value: mergedEquipments.reduce((acc, eq) => acc + (eq.worked_hours || 0), 0).toLocaleString('pt-BR'),
          footer: {
            color: 'text-gray-500',
            value: '',
            label: '',
          },
          icon: (
            <svg className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
          ),
        },
      ];
      setStatisticsCardsData(cardsData);

      // Máquinas com temperatura acima de 60 graus (usando deviceData.calculated_temperature)
      // Seleciona as 10 máquinas mais próximas do limite (acima ou abaixo)
      const machinesWithTemp = mergedEquipments.filter(eq => eq.deviceData?.calculated_temperature !== undefined && eq.deviceData.calculated_temperature < 150);
      const sortedByProximity = machinesWithTemp
        .map(eq => ({ ...eq, _diff: Math.abs((eq.deviceData?.calculated_temperature || 0) - alertTemp) }))
        .sort((a, b) => a._diff - b._diff)
        .slice(0, 10);
      setAlertMachines(sortedByProximity);

      // Dados para os gráficos
      // Ordenar equipamentos por nome para o gráfico de Horas Trabalhadas
      const mergedEquipmentsSorted = [...mergedEquipments].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB, 'pt-BR');
      });

      const chartsData = [
        {
          title: 'Horas Trabalhadas por Equipamento',
          type: 'bar',
          series: [
            {
              name: 'Horas Trabalhadas',
              data: mergedEquipmentsSorted.map((equipment) => equipment.worked_hours || 0),
            },
          ],
          options: {
            xaxis: { categories: mergedEquipmentsSorted.map((equipment) => equipment.name) },
            height: 150,
          },
        },
        {
          title: 'Status de Manutenção Preventiva',
          type: 'pie',
          series: [
            {
              name: 'Máquinas',
              data: [
                mergedEquipments.filter(eq => eq.min_remaining_hours < 0).length,
                mergedEquipments.filter(eq => eq.min_remaining_hours >= 0 && eq.min_remaining_hours < 50).length,
                mergedEquipments.filter(eq => eq.min_remaining_hours >= 50).length
              ],
            },
          ],
          options: {
            labels: [
              'Necessita Troca Imediata',
              'Próximo da Troca',
              'Funcionamento Normal'
            ],
            backgroundColor: [
              'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              'linear-gradient(135deg, #f1c40f, #f39c12)',
              'linear-gradient(135deg, #66bb6a, #4caf50)'
            ],
            colors: [
              '#ff6b6b',
              '#f1c40f', 
              '#66bb6a'
            ],
            height: 120,
          },
        },
        {
          title: 'Força de Impacto e Aceleração',
          type: 'impact_acceleration',
          series: [
            {
              name: 'Impacto e Aceleração',
              data: devices.data
                .filter(d => (d.impact !== undefined && d.impact > 0) || 
                           (d.acceleration_x !== undefined || d.acceleration_y !== undefined || d.acceleration_z !== undefined))
                .map(d => ({ 
                  device: d.device_id, 
                  impact: d.impact || 0,
                  x: d.acceleration_x || 0,
                  y: d.acceleration_y || 0,
                  z: d.acceleration_z || 0,
                  total: Math.sqrt((d.acceleration_x||0)**2 + (d.acceleration_y||0)**2 + (d.acceleration_z||0)**2),
                  name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
                }))
                .sort((a, b) => b.impact - a.impact || b.total - a.total)
                .slice(0, 8),
            },
          ],
          options: {
            height: 160,
          },
        },
        {
          title: 'Qualidade GPS e Conexão',
          type: 'gps_connection',
          series: [
            {
              name: 'GPS e Conexão',
              data: devices.data
                .filter(d => d.satellites !== undefined || d.connection_rat !== undefined)
                .map(d => ({ 
                  device: d.device_id, 
                  satellites: d.satellites || 0,
                  connectionRat: parseFloat(d.connection_rat) || 0,
                  name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
                }))
                .sort((a, b) => (b.satellites + b.connectionRat) - (a.satellites + a.connectionRat))
                .slice(0, 10),
            },
          ],
          options: {
            height: 160,
          },
        },
        {
          title: 'Velocidade do GPS dos Equipamentos',
          type: 'speedometer',
          series: [
            {
              name: 'Velocidade de Pico',
              data: devices.data
                .filter(d => d.speed_gps !== undefined && d.speed_gps >= 0)
                .sort((a, b) => (b.speed_gps || 0) - (a.speed_gps || 0))
                .slice(0, 8)
                .map(d => ({ 
                  device: d.device_id, 
                  speed: d.speed_gps || 0,
                  name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
                })),
            },
          ],
          options: {
            height: 140,
          },
        },
        {
          title: 'Tempo Inativo dos Equipamentos',
          type: 'idle_time',
          series: [
            {
              name: 'Tempo Inativo',
              data: devices.data
                .filter(d => d.idle_time !== undefined && d.idle_time >= 0)
                .map(d => ({ 
                  device: d.device_id, 
                  idleTime: d.idle_time || 0,
                  name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
                }))
                .sort((a, b) => b.idleTime - a.idleTime)
                .slice(0, 8),
            },
          ],
          options: {
            height: 140,
          },
        },
      ];
      setStatisticsChartsData(chartsData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatisticsData();
    // Atualiza alerta ao mudar o valor do seletor
  }, [alertTemp]);

  const createChart = (chart) => {
    const handleChartClick = (chartType) => {
      let allData = [];
      let title = '';
      
      switch(chartType) {
        // case 'gps_connection' removido para evitar duplicidade
        case 'idle_time':
          allData = devices.data
            .filter(d => d.idle_time !== undefined && d.idle_time >= 0)
            .map(d => ({ 
              device: d.device_id, 
              idleTime: d.idle_time || 0,
              name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
            }))
            .sort((a, b) => b.idleTime - a.idleTime);
          title = 'Tempo Inativo - Todos os Equipamentos';
          break;
        case 'impact':
        case 'impact_acceleration':
          allData = devices.data
            .filter(d => (d.impact !== undefined && d.impact > 0) || 
                       (d.acceleration_x !== undefined || d.acceleration_y !== undefined || d.acceleration_z !== undefined))
            .map(d => ({ 
              device: d.device_id, 
              impact: d.impact || 0,
              x: d.acceleration_x || 0,
              y: d.acceleration_y || 0,
              z: d.acceleration_z || 0,
              total: Math.sqrt((d.acceleration_x||0)**2 + (d.acceleration_y||0)**2 + (d.acceleration_z||0)**2),
              name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
            }))
            .sort((a, b) => b.impact - a.impact || b.total - a.total);
          title = 'Força de Impacto e Aceleração - Todos os Equipamentos';
          break;
        case 'acceleration':
          allData = devices.data
            .filter(d => d.acceleration_x !== undefined || d.acceleration_y !== undefined || d.acceleration_z !== undefined)
            .map(d => ({ 
              device: d.device_id, 
              x: d.acceleration_x || 0,
              y: d.acceleration_y || 0,
              z: d.acceleration_z || 0,
              total: Math.sqrt((d.acceleration_x||0)**2 + (d.acceleration_y||0)**2 + (d.acceleration_z||0)**2),
              name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
            }))
            .sort((a, b) => b.total - a.total);
          title = 'Aceleração - Todos os Equipamentos';
          break;
        case 'speedometer':
          allData = devices.data
            .filter(d => d.speed_gps !== undefined && d.speed_gps >= 0)
            .map(d => ({ 
              device: d.device_id, 
              speed: d.speed_gps || 0,
              name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
            }))
            .sort((a, b) => b.speed - a.speed);
          title = 'Velocidade de Pico - Todos os Equipamentos';
          break;
        case 'satellite':
        case 'gps_connection':
          allData = devices.data
            .filter(d => d.satellites !== undefined || d.connection_rat !== undefined)
            .map(d => ({ 
              device: d.device_id, 
              satellites: d.satellites || 0,
              connectionRat: parseFloat(d.connection_rat) || 0,
              name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
            }))
            .sort((a, b) => (b.satellites + b.connectionRat) - (a.satellites + a.connectionRat));
          title = 'Qualidade GPS e Conexão - Todos os Equipamentos';
          break;
        case 'maintenance':
          allData = mergedEquipments.map(eq => ({
            name: eq.name,
            remaining_hours: eq.min_remaining_hours || 0,
            status: eq.min_remaining_hours < 0 ? 'Crítico' : eq.min_remaining_hours < 100 ? 'Atenção' : 'Normal'
          })).sort((a, b) => a.remaining_hours - b.remaining_hours);
          title = 'Status de Manutenção - Todos os Equipamentos';
          break;
        case 'worked_hours':
          allData = mergedEquipments.map(eq => ({
            name: eq.name,
            worked_hours: eq.worked_hours || 0
          })).sort((a, b) => b.worked_hours - a.worked_hours);
          title = 'Horas Trabalhadas - Todos os Equipamentos';
          break;
        case 'temperature':
          allData = mergedEquipments
            .filter(eq => eq.deviceData?.calculated_temperature !== undefined && eq.deviceData.calculated_temperature < 150)
            .map(eq => ({
              name: eq.name,
              temperature: eq.deviceData?.calculated_temperature || 0,
              status: eq.deviceData?.calculated_temperature > alertTemp ? 'Crítico' : 
                     eq.deviceData?.calculated_temperature > alertTemp * 0.8 ? 'Atenção' : 'Normal'
            }))
            .sort((a, b) => b.temperature - a.temperature);
          title = 'Temperatura - Todos os Equipamentos';
          break;
      }
      
      setPopupData({ type: chartType, data: allData, title });
    };
    let data;
    if (chart.title === 'Status de Manutenção Preventiva') {
      data = {
        labels: chart.options?.labels,
        datasets: chart.series.map((serie) => ({
          label: serie.name,
          data: serie.data,
          backgroundColor: [
            '#ff6b6b',
            '#f1c40f',
            '#66bb6a'
          ],
          borderColor: [
            '#ffffff',
            '#ffffff',
            '#ffffff'
          ],
          borderWidth: 3,
          hoverOffset: 8,
          hoverBorderWidth: 4,
        })),
      };
      // ...existing table code...
      const labels = chart.options?.labels || [];
      const values = (chart.series && chart.series[0] && chart.series[0].data) || [];
      const colors = [
        '#ff6b6b',
        '#f1c40f',
        '#66bb6a'
      ];
      const gradients = [
        'linear-gradient(135deg, #ff6b6b, #ee5a24)',
        'linear-gradient(135deg, #f1c40f, #f39c12)',
        'linear-gradient(135deg, #66bb6a, #4caf50)'
      ];
      const icons = ['🔧', '⚠️', '✅'];
      
      return (
        <div className={`w-full h-full ${isMobile ? 'flex flex-col' : 'flex items-center justify-center'} ${isMobile ? 'gap-3' : 'gap-5'}`}>
          {/* Gráfico de Pizza */}
          <div className={`flex items-center justify-center ${isMobile ? 'flex-shrink-0' : ''}`}>
            <div style={{ 
              width: isMobile ? 140 : 200, 
              height: isMobile ? 140 : 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              animation: 'pieGlow 3s ease-in-out infinite'
            }}>
              <Pie 
                data={data} 
                options={{ 
                  maintainAspectRatio: false, 
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      borderColor: '#ffffff',
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed * 100) / total).toFixed(1);
                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000,
                    easing: 'easeOutQuart'
                  }
                }} 
              />
            </div>
          </div>
          
          {/* Lista de Estatísticas */}
          <div className={`flex-1 ${isMobile ? 'min-h-0' : ''}`}>
            <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
              {labels.map((label, idx) => (
                <div 
                  key={label} 
                  className={`group ${isDarkMode ? 'hover:bg-gray-700 border-gray-600 hover:border-gray-500' : 'hover:bg-gray-50 border-gray-100 hover:border-gray-200'} ${isMobile ? 'p-2' : 'p-3'} rounded-lg transition-all duration-300 cursor-pointer border hover:shadow-md`}
                  style={{ 
                    animationDelay: `${idx * 200}ms`,
                    animation: 'slideInRight 0.6s ease-out forwards',
                    background: `linear-gradient(135deg, ${colors[idx]}${isDarkMode ? '20' : '10'}, ${colors[idx]}${isDarkMode ? '10' : '05'})`
                  }}
                  onClick={() => handleChartClick('maintenance')}
                >
                  <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div 
                        className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} rounded-full shadow-sm`}
                        style={{ 
                          background: gradients[idx],
                          animation: `pulse 2s infinite ${idx * 0.3}s`
                        }}
                      ></div>
                      <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>{icons[idx]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium ${isDarkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'} transition-colors truncate`}>
                        {label}
                      </div>
                      <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} mt-1`}>
                        <div 
                          className={`${isMobile ? 'text-base' : 'text-xl'} font-bold transition-all duration-300 group-hover:scale-110`}
                          style={{ color: colors[idx] }}
                        >
                          {values[idx]}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`}>
                          {values.reduce((a, b) => a + b, 0) > 0 ? 
                            `${((values[idx] / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%` : 
                            '0%'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className={`${isMobile ? 'mt-1.5' : 'mt-2'} ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full ${isMobile ? 'h-1' : 'h-1.5'} overflow-hidden`}>
                    <div 
                      className={`${isMobile ? 'h-1' : 'h-1.5'} rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        background: gradients[idx],
                        width: values.reduce((a, b) => a + b, 0) > 0 ? 
                          `${(values[idx] / values.reduce((a, b) => a + b, 0)) * 100}%` : 
                          '0%',
                        animation: `expandWidth 1.5s ease-out ${idx * 0.3}s both`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (chart.type === 'impact_acceleration') {
      const impactAccelData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-3 gap-2 h-full p-2">
          {impactAccelData.map((item, index) => {
            const impactLevel = item.impact;
            const totalAccel = item.total;
            
            // Classificação do impacto baseado em 1G
            let impactIntensity = '';
            let impactColor = '';
            if (impactLevel > 3) { 
              impactColor = 'text-red-500'; 
              impactIntensity = 'Crítico'; 
            }
            else if (impactLevel > 2) { 
              impactColor = 'text-orange-500'; 
              impactIntensity = 'Alto'; 
            }
            else if (impactLevel > 1.5) { 
              impactColor = 'text-yellow-500'; 
              impactIntensity = 'Atenção'; 
            }
            else { 
              impactColor = 'text-green-500'; 
              impactIntensity = 'Normal'; 
            }
            
            return (
              <div 
                key={item.device} 
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-3 border hover:shadow-md transition-all duration-300 cursor-pointer`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('impact')}
              >
                <div className="mb-2">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>{item.name}</span>
                </div>
                
                {/* Seção de Impacto */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Impacto:</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      impactLevel > 3 ? 'text-red-700 bg-red-100' :
                      impactLevel > 2 ? 'text-orange-700 bg-orange-100' :
                      impactLevel > 1 ? 'text-yellow-700 bg-yellow-100' :
                      'text-green-700 bg-green-100'
                    }`}>
                      {impactIntensity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg className="w-10 h-10 transform -rotate-90">
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="16" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          fill="none" 
                          className={`${isDarkMode ? 'text-gray-600' : 'text-gray-200'}`}
                        />
                        <circle 
                          cx="20" 
                          cy="20" 
                          r="16" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeDasharray={`${Math.min(impactLevel / 5 * 100, 100)} 100`}
                          className={`${impactColor} transition-all duration-1000`}
                          style={{
                            animation: `drawCircle 1.5s ease-out ${index * 0.1}s both`
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{impactLevel.toFixed(1)}</span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>G</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${impactColor}`}>{impactLevel.toFixed(2)} G</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {impactLevel > 1 ? `${((impactLevel - 1) * 100).toFixed(0)}% acima` : 'Normal'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Seção de Aceleração */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aceleração:</span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-bold`}>
                      {totalAccel.toFixed(1)} m/s²
                    </span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: 'X', value: item.x, color: 'bg-red-500' },
                      { label: 'Y', value: item.y, color: 'bg-green-500' },
                      { label: 'Z', value: item.z, color: 'bg-blue-500' }
                    ].map((axis, axisIndex) => (
                      <div key={axis.label} className="flex items-center gap-1">
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} w-2`}>{axis.label}:</span>
                        <div className={`flex-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-1 overflow-hidden`}>
                          <div 
                            className={`h-1 ${axis.color} transition-all duration-1000 ease-out`}
                            style={{ 
                              width: `${Math.min(Math.abs(axis.value) / 10 * 100, 100)}%`,
                              animation: `expandWidth 1s ease-out ${index * 0.1 + axisIndex * 0.1}s both`
                            }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} min-w-[1.2rem] text-right`}>
                          {axis.value.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Indicador de alerta para impactos altos */}
                {impactLevel > 1.5 && (
                  <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className={`flex items-center gap-1 text-xs ${
                      impactLevel > 3 ? 'text-red-500' :
                      impactLevel > 2 ? 'text-orange-500' :
                      'text-yellow-500'
                    }`}>
                      <span className="animate-pulse">⚠️</span>
                      <span>Impacto detectado</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'impact') {
      const impactData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-4 gap-2 h-full p-2">
          {impactData.map((item, index) => {
            const impactLevel = item.impact;
            let impactColor = '';
            let impactIntensity = '';
            
            if (impactLevel > 3) { 
              impactColor = 'from-red-500 to-red-700'; 
              impactIntensity = 'Crítico'; 
            }
            else if (impactLevel > 2) { 
              impactColor = 'from-orange-400 to-orange-600'; 
              impactIntensity = 'Alto'; 
            }
            else if (impactLevel > 1.5) { 
              impactColor = 'from-yellow-400 to-yellow-600'; 
              impactIntensity = 'Atenção'; 
            }
            else { 
              impactColor = 'from-green-400 to-green-600'; 
              impactIntensity = 'Normal'; 
            }
            
            return (
              <div 
                key={item.device} 
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-2 border hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('impact')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate`}>{item.name}</span>
                  <span className={`text-xs px-1 py-0.5 rounded-full ${
                    impactLevel > 3 ? 'text-red-700 bg-red-100' :
                    impactLevel > 2 ? 'text-orange-700 bg-orange-100' :
                    impactLevel > 1 ? 'text-yellow-700 bg-yellow-100' :
                    'text-green-700 bg-green-100'
                  }`}>
                    {impactIntensity}
                  </span>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="none" 
                        className={`${isDarkMode ? 'text-gray-600' : 'text-gray-200'}`}
                      />
                      <circle 
                        cx="24" 
                        cy="24" 
                        r="20" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray={`${Math.min(impactLevel / 5 * 126, 126)} 126`}
                        className={`${
                          impactLevel > 3 ? 'text-red-500' :
                          impactLevel > 2 ? 'text-orange-500' :
                          impactLevel > 1 ? 'text-yellow-500' :
                          'text-green-500'
                        } transition-all duration-1000`}
                        style={{
                          animation: `drawCircle 1.5s ease-out ${index * 0.1}s both`
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{impactLevel.toFixed(1)}</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>G</span>
                    </div>
                    
                    {/* Efeito de pulso para impactos altos */}
                    {impactLevel > 1 && (
                      <div className={`absolute inset-0 rounded-full border-2 ${
                        impactLevel > 3 ? 'border-red-400 animate-ping' :
                        impactLevel > 2 ? 'border-orange-400 animate-pulse' :
                        'border-yellow-400 animate-pulse'
                      } opacity-30`}></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'acceleration') {
      const accelerationData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-3 gap-2 h-full p-2">
          {accelerationData.map((item, index) => {
            const totalAccel = Math.sqrt(item.x*item.x + item.y*item.y + item.z*item.z);
            let accelColor = '';
            let totalColor = '';
            if (totalAccel > 5) {
              accelColor = 'from-red-400 to-red-600';
              totalColor = isDarkMode ? 'text-red-400' : 'text-red-600';
            } else if (totalAccel > 2) {
              accelColor = 'from-orange-400 to-orange-600';
              totalColor = isDarkMode ? 'text-orange-300' : 'text-orange-600';
            } else {
              accelColor = 'from-blue-400 to-blue-600';
              totalColor = isDarkMode ? 'text-blue-300' : 'text-blue-700';
            }
            return (
              <div 
                key={item.device} 
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'} rounded-lg p-2 hover:shadow-md transition-all duration-300 cursor-pointer border`}
                style={{ 
                  animationDelay: `${index * 120}ms`,
                  animation: 'slideInLeft 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('acceleration')}
              >
                <div className="mb-1">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>{item.name}</span>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : totalColor}`}>Total: {totalAccel.toFixed(1)} m/s²</span>
                </div>
                <div className="space-y-1">
                  {[ 
                    { label: 'X', value: item.x, color: 'bg-red-500' },
                    { label: 'Y', value: item.y, color: 'bg-green-500' },
                    { label: 'Z', value: item.z, color: 'bg-blue-500' }
                  ].map((axis, axisIndex) => (
                    <div key={axis.label} className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} w-2`}>{axis.label}:</span>
                      <div className={`flex-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-1.5 overflow-hidden`}>
                        <div 
                          className={`h-1.5 ${axis.color} transition-all duration-1000 ease-out`}
                          style={{ 
                            width: `${Math.min(Math.abs(axis.value) / 10 * 100, 100)}%`,
                            animation: `expandWidth 1s ease-out ${index * 0.1 + axisIndex * 0.1}s both`
                          }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} min-w-[1.5rem] text-right`}>
                        {axis.value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'speedometer') {
      const speedData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-4 gap-2 h-full p-2">
          {speedData.map((item, index) => {
            const percentage = Math.min(item.speed / 30 * 100, 100); // Velocidade de pico - max 30km/h (15 sendo o limite)
            let speedColor = '';
            let speedStatus = '';
            if (item.speed > 15) { 
              speedColor = 'from-red-400 to-red-600'; 
              speedStatus = 'Acima do Limite';
            }
            else if (item.speed > 10) { 
              speedColor = 'from-yellow-400 to-orange-500'; 
              speedStatus = 'Atenção';
            }
            else { 
              speedColor = 'from-green-400 to-green-600'; 
              speedStatus = 'Normal';
            }
            
            return (
              <div 
                key={item.device} 
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'} rounded-lg p-2 flex flex-col items-center justify-center hover:shadow-md transition-all duration-300 cursor-pointer border`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('speedometer')}
              >
                <div className="relative w-12 h-12 mb-1">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className={`${isDarkMode ? 'text-gray-600' : 'text-gray-200'}`}/>
                    <circle 
                      cx="24" 
                      cy="24" 
                      r="20" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeDasharray={`${percentage * 1.26} 126`}
                      className={`${speedColor.includes('red') ? 'text-red-500' : speedColor.includes('yellow') ? 'text-orange-500' : 'text-green-500'} transition-all duration-1000`}
                      style={{
                        animation: `drawCircle 1.5s ease-out ${index * 0.1}s both`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.speed}</span>
                  </div>
                </div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-center truncate w-full`}>{item.name}</span>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>km/h</span>
                {item.speed > 15 && (
                  <span className="text-xs px-1 py-0.5 rounded-full bg-red-100 text-red-700 mt-1">
                    Limite!
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'gps_connection') {
      const gpsConnectionData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-3 gap-1 h-full p-2">
          {gpsConnectionData.map((item, index) => {
            // Qualidade GPS baseada em satélites
            let gpsQuality = '';
            let gpsColor = '';
            if (item.satellites >= 8) { gpsQuality = 'Excelente'; gpsColor = 'text-green-600 bg-green-100'; }
            else if (item.satellites >= 6) { gpsQuality = 'Bom'; gpsColor = 'text-blue-600 bg-blue-100'; }
            else if (item.satellites >= 4) { gpsQuality = 'Regular'; gpsColor = 'text-orange-600 bg-orange-100'; }
            else { gpsQuality = 'Fraco'; gpsColor = 'text-red-600 bg-red-100'; }
            
            // Qualidade da conexão RAT
            let connectionQuality = '';
            let connectionColor = '';
            if (item.connectionRat >= 4) { connectionQuality = 'Excelente'; connectionColor = 'text-green-600'; }
            else if (item.connectionRat >= 3) { connectionQuality = 'Bom'; connectionColor = 'text-blue-600'; }
            else if (item.connectionRat >= 2) { connectionQuality = 'Regular'; connectionColor = 'text-orange-600'; }
            else { connectionQuality = 'Fraco'; connectionColor = 'text-red-600'; }
            
            return (
              <div 
                key={item.device} 
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-3 border hover:shadow-md transition-all duration-300 cursor-pointer`}
                style={{ 
                  animationDelay: `${index * 80}ms`,
                  animation: 'slideInLeft 0.5s ease-out forwards'
                }}
                onClick={() => handleChartClick('gps_connection')}
              >
                <div className="mb-2">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>{item.name}</span>
                </div>
                
                {/* Seção GPS */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>GPS:</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${gpsColor}`}>
                      {gpsQuality}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(bar => (
                        <div 
                          key={bar}
                          className={`w-1.5 h-4 rounded-sm ${
                            bar <= Math.ceil(item.satellites / 2) 
                              ? item.satellites >= 8 ? 'bg-green-500' 
                                : item.satellites >= 6 ? 'bg-blue-500'
                                : item.satellites >= 4 ? 'bg-orange-500' 
                                : 'bg-red-500'
                              : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                          }`}
                          style={{
                            animation: `barGrow 0.8s ease-out ${index * 0.1 + bar * 0.05}s both`
                          }}
                        />
                      ))}
                    </div>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {item.satellites} sat
                    </span>
                  </div>
                </div>
                
                {/* Seção Conexão */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conexão:</span>
                    <span className={`text-xs ${connectionColor} font-bold`}>
                      {connectionQuality}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                      <div 
                        className={`h-2 transition-all duration-1000 ease-out ${
                          item.connectionRat >= 4 ? 'bg-green-500' :
                          item.connectionRat >= 3 ? 'bg-blue-500' :
                          item.connectionRat >= 2 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(item.connectionRat / 5 * 100, 100)}%`,
                          animation: `expandWidth 1s ease-out ${index * 0.1}s both`
                        }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} min-w-[1.5rem] text-right`}>
                      {item.connectionRat.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                {/* Status geral */}
                <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className={`flex items-center justify-between text-xs`}>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status Geral:</span>
                    <span className={`font-bold ${
                      (item.satellites >= 6 && item.connectionRat >= 3) ? 'text-green-500' :
                      (item.satellites >= 4 && item.connectionRat >= 2) ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {(item.satellites >= 6 && item.connectionRat >= 3) ? '🟢 Ótimo' :
                       (item.satellites >= 4 && item.connectionRat >= 2) ? '🟡 Regular' :
                       '🔴 ruim'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'satellite') {
      const satelliteData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-3 gap-1 h-full p-1">
          {satelliteData.map((item, index) => {
            let signalQuality = '';
            let signalColor = '';
            if (item.satellites >= 8) { signalQuality = 'Excelente'; signalColor = 'text-green-600 bg-green-100'; }
            else if (item.satellites >= 6) { signalQuality = 'Bom'; signalColor = 'text-blue-600 bg-blue-100'; }
            else if (item.satellites >= 4) { signalQuality = 'Regular'; signalColor = 'text-orange-600 bg-orange-100'; }
            else { signalQuality = 'Fraco'; signalColor = 'text-red-600 bg-red-100'; }
            
            return (
              <div 
                key={item.device} 
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-2 border hover:shadow-md transition-all duration-300 cursor-pointer`}
                style={{ 
                  animationDelay: `${index * 80}ms`,
                  animation: 'slideInLeft 0.5s ease-out forwards'
                }}
                onClick={() => handleChartClick('satellite')}
              >
                <div className="mb-2">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>{item.name}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-1 py-0.5 rounded-full ${signalColor}`}>
                      {signalQuality}
                    </span>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.satellites} sat</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(bar => (
                      <div 
                        key={bar}
                        className={`w-2 h-6 rounded-sm ${
                          bar <= Math.ceil(item.satellites / 2) 
                            ? item.satellites >= 8 ? 'bg-green-500' 
                              : item.satellites >= 6 ? 'bg-blue-500'
                              : item.satellites >= 4 ? 'bg-orange-500' 
                              : 'bg-red-500'
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                        style={{
                          animation: `barGrow 0.8s ease-out ${index * 0.1 + bar * 0.05}s both`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'odometer') {
      const odometerData = chart.series[0].data;
      
      return (
        <div className="space-y-2 h-full overflow-y-auto p-2">
          {odometerData.map((item, index) => {
            const km = item.odometer / 1000; // Converter metros para quilômetros
            const maxKm = Math.max(...odometerData.map(v => v.odometer)) / 1000;
            const percentage = maxKm > 0 ? (km / maxKm) * 100 : 0;
            
            return (
              <div 
                key={item.device}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                style={{ 
                  animationDelay: `${index * 80}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('odometer')}
              >
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} min-w-[100px] truncate`}>
                  {item.name}
                </span>
                <div className={`flex-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-4 relative`}>
                  <div
                    className="h-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'horimeter') {
      const horimeterData = chart.series[0].data;
      
      return (
        <div className="space-y-2 h-full overflow-y-auto p-2">
          {horimeterData.map((item, index) => {
            const maxHours = Math.max(...horimeterData.map(v => v.horimeter));
            const percentage = maxHours > 0 ? (item.horimeter / maxHours) * 100 : 0;
            
            return (
              <div 
                key={item.device}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                style={{ 
                  animationDelay: `${index * 80}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('horimeter')}
              >
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} min-w-[100px] truncate`}>
                  {item.name}
                </span>
                <div className="flex-1 space-y-1">
                  <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Motor Total:</span>
                    <span className="font-bold">{item.horimeter.toLocaleString('pt-BR')}h</span>
                  </div>
                  <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-3 relative`}>
                    <div
                      className="h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                  <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Viagem:</span>
                    <span>{item.tripHorimeter.toFixed(2)}h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'battery_voltage') {
      const batteryData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-4 gap-2 h-full p-2">
          {batteryData.map((item, index) => {
            let voltageColor = '';
            let voltageStatus = '';
            
            if (item.powerVoltage < 11) { 
              voltageColor = 'text-red-600'; 
              voltageStatus = 'Baixa'; 
            }
            else if (item.powerVoltage < 12) { 
              voltageColor = 'text-orange-600'; 
              voltageStatus = 'Atenção'; 
            }
            else { 
              voltageColor = 'text-green-600'; 
              voltageStatus = 'Normal'; 
            }
            
            return (
              <div 
                key={item.device}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-2 border cursor-pointer transition-all hover:shadow-md`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('battery_voltage')}
              >
                <div className="text-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>
                    {item.name}
                  </span>
                  <div className="mt-2">
                    <div className={`text-lg font-bold ${voltageColor}`}>
                      {item.powerVoltage.toFixed(2)}V
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Principal
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.batteryVoltage.toFixed(1)}V Aux
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      item.powerVoltage < 11 ? 'text-red-700 bg-red-100' :
                      item.powerVoltage < 12 ? 'text-orange-700 bg-orange-100' :
                      'text-green-700 bg-green-100'
                    }`}>
                      {voltageStatus}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      SOC: {item.socBattery.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'idle_time') {
      const idleData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-4 gap-2 h-full p-2">
          {idleData.map((item, index) => {
            const hours = item.idleTime / 3600; // Converter segundos para horas
            const minutes = (item.idleTime % 3600) / 60;
            
            let idleColor = '';
            let idleStatus = '';
            
            if (hours > 8) { 
              idleColor = 'text-red-600'; 
              idleStatus = 'Muito Tempo'; 
            }
            else if (hours > 2) { 
              idleColor = 'text-orange-600'; 
              idleStatus = 'Inativo'; 
            }
            else { 
              idleColor = 'text-green-600'; 
              idleStatus = 'Normal'; 
            }
            
            return (
              <div 
                key={item.device}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-2 border cursor-pointer transition-all hover:shadow-md`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('idle_time')}
              >
                <div className="text-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>
                    {item.name}
                  </span>
                  <div className="mt-2">
                    <div className={`text-lg font-bold ${idleColor}`}>
                      {hours >= 1 ? `${hours.toFixed(1)}h` : `${minutes.toFixed(0)}min`}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tempo Inativo
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      hours > 8 ? 'text-red-700 bg-red-100' :
                      hours > 2 ? 'text-orange-700 bg-orange-100' :
                      'text-green-700 bg-green-100'
                    }`}>
                      {idleStatus}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'trip_distance') {
      const tripData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-4 gap-2 h-full p-2">
          {tripData.map((item, index) => {
            const km = item.tripDistance / 1000; // Converter metros para quilômetros
            
            let distanceColor = '';
            let distanceStatus = '';
            
            if (km > 50) { 
              distanceColor = 'text-blue-600'; 
              distanceStatus = 'Longa'; 
            }
            else if (km > 10) { 
              distanceColor = 'text-green-600'; 
              distanceStatus = 'Média'; 
            }
            else { 
              distanceColor = 'text-orange-600'; 
              distanceStatus = 'Curta'; 
            }
            
            return (
              <div 
                key={item.device}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-2 border cursor-pointer transition-all hover:shadow-md`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('trip_distance')}
              >
                <div className="text-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>
                    {item.name}
                  </span>
                  <div className="mt-2">
                    <div className={`text-lg font-bold ${distanceColor}`}>
                      {km.toFixed(1)} km
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Viagem Atual
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      km > 50 ? 'text-blue-700 bg-blue-100' :
                      km > 10 ? 'text-green-700 bg-green-100' :
                      'text-orange-700 bg-orange-100'
                    }`}>
                      {distanceStatus}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'connection_rat') {
      const ratData = chart.series[0].data;
      
      return (
        <div className="grid grid-cols-5 gap-1 h-full p-2">
          {ratData.map((item, index) => {
            let ratColor = '';
            let ratStatus = '';
            
            switch(item.connectionRat) {
              case '7': ratColor = 'text-green-600'; ratStatus = '4G+'; break;
              case '6': ratColor = 'text-blue-600'; ratStatus = '4G'; break;
              case '3': ratColor = 'text-orange-600'; ratStatus = '3G'; break;
              case '2': ratColor = 'text-yellow-600'; ratStatus = '2G'; break;
              default: ratColor = 'text-gray-600'; ratStatus = 'N/A'; break;
            }
            
            return (
              <div 
                key={item.device}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg p-1 border cursor-pointer transition-all hover:shadow-md`}
                style={{ 
                  animationDelay: `${index * 80}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('connection_rat')}
              >
                <div className="text-center">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>
                    {item.name}
                  </span>
                  <div className="mt-1">
                    <div className={`text-sm font-bold ${ratColor}`}>
                      {ratStatus}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      RAT: {item.connectionRat}
                    </div>
                    <div className="flex justify-center mt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(bar => (
                          <div 
                            key={bar}
                            className={`w-1 h-3 rounded-sm ${
                              bar <= parseInt(item.connectionRat) / 2 
                                ? item.connectionRat === '7' ? 'bg-green-500' 
                                  : item.connectionRat === '6' ? 'bg-blue-500'
                                  : item.connectionRat === '3' ? 'bg-orange-500' 
                                  : 'bg-yellow-500'
                                : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (chart.type === 'display') {
      const valueBR = chart.value.toLocaleString('pt-BR');
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-4xl font-bold text-blue-900">{valueBR}</span>
          <span className="text-sm text-gray-500 mt-1">Horas Totais Trabalhadas</span>
        </div>
      );
    } else {
      data = {
        labels: chart.options?.labels || chart.options?.xaxis?.categories,
        datasets: chart.series.map((serie) => ({
          label: serie.name,
          data: serie.data,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: '#2c5282',
          borderWidth: 2,
          borderRadius: 4,
        })),
      };
      
      const ChartComponent = chart.type === 'bar' ? Bar : chart.type === 'line' ? Line : Pie;
      
      if (chart.title === 'Horas Trabalhadas por Equipamento') {
        const equipmentData = chart.options?.xaxis?.categories?.map((name, index) => ({
          name,
          hours: chart.series[0].data[index]
        })) || [];

        return (
          <div className="w-full h-full flex flex-col" style={{ minHeight: '300px' }}>
            {/* Header com estatísticas rápidas */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-semibold">{equipmentData.length}</span> equipamentos
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total: <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {equipmentData.reduce((acc, item) => acc + item.hours, 0).toLocaleString('pt-BR')}h
                </span>
              </div>
            </div>

            {/* Gráfico de barras customizado */}
            <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '260px' }}>
              <div className="space-y-1">
                {equipmentData
                  .sort((a, b) => b.hours - a.hours)
                  .map((item, index) => {
                    const maxHours = Math.max(...equipmentData.map(e => e.hours));
                    const percentage = maxHours > 0 ? (item.hours / maxHours) * 100 : 0;
                    
                    return (
                      <div 
                        key={item.name} 
                        className={`flex items-center gap-3 py-0.1 px-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'} transition-all duration-200 cursor-pointer group`}
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: 'slideInLeft 0.4s ease-out forwards'
                        }}
                        onClick={() => handleChartClick('worked_hours')}
                      >
                        {/* Ranking */}
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'} text-white text-xs font-bold`}>
                          {index + 1}
                        </div>
                        
                        {/* Nome do equipamento */}
                        <div className="min-w-[110px] max-w-[110px]">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-700'} truncate block transition-colors`}>
                            {item.name || 'Sem nome'}
                          </span>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="flex-1 relative">
                          <div className={`w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-3 overflow-hidden shadow-sm`}>
                            <div
                              className={`h-3 bg-gradient-to-r ${isDarkMode ? 'from-blue-500 via-blue-600 to-blue-700 group-hover:from-blue-600 group-hover:to-blue-800' : 'from-blue-400 via-blue-500 to-blue-600 group-hover:from-blue-500 group-hover:to-blue-700'} rounded-full relative transition-all duration-700 ease-out`}
                              style={{ 
                                width: `${Math.max(percentage, 2)}%`,
                                animation: `expandWidth 1s ease-out ${index * 0.05}s both`
                              }}
                            >
                              {/* Efeito de brilho */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent rounded-full"></div>
                              
                              {/* Pulso para valores altos */}
                              {item.hours > maxHours * 0.8 && (
                                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Valor das horas */}
                        <div className="min-w-[55px] text-right">
                          <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200 group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-700'} transition-colors`}>
                            {item.hours.toLocaleString('pt-BR')}h
                          </span>
                        </div>
                        
                        {/* Indicador de status */}
                        <div className="w-2 h-2 rounded-full">
                          {item.hours > maxHours * 0.8 ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          ) : item.hours > maxHours * 0.5 ? (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Footer com legenda */}
            <div className={`flex items-center justify-center mt-3 pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className={`flex items-center gap-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Alto uso</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Uso médio</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full`}></div>
                  <span>Baixo uso</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
      return <ChartComponent data={data} options={{ maintainAspectRatio: false, responsive: true }} height={220} />;
    }
  };

  // Popup view for gps_connection
  const renderPopupContent = () => {
    if (popupData?.type === 'gps_connection' && Array.isArray(popupData.data)) {
      return (
        <div className="grid grid-cols-3 gap-2 p-2">
          {popupData.data.map((item, idx) => {
            let gpsQuality = '';
            let gpsColor = '';
            if (item.satellites >= 8) { gpsQuality = 'Excelente'; gpsColor = 'text-green-600 bg-green-100'; }
            else if (item.satellites >= 6) { gpsQuality = 'Bom'; gpsColor = 'text-blue-600 bg-blue-100'; }
            else if (item.satellites >= 4) { gpsQuality = 'Regular'; gpsColor = 'text-orange-600 bg-orange-100'; }
            else { gpsQuality = 'Fraco'; gpsColor = 'text-red-600 bg-red-100'; }

            let connectionQuality = '';
            let connectionColor = '';
            if (item.connectionRat >= 4) { connectionQuality = 'Excelente'; connectionColor = 'text-green-600'; }
            else if (item.connectionRat >= 3) { connectionQuality = 'Bom'; connectionColor = 'text-blue-600'; }
            else if (item.connectionRat >= 2) { connectionQuality = 'Regular'; connectionColor = 'text-orange-600'; }
            else { connectionQuality = 'Fraco'; connectionColor = 'text-red-600'; }

            return (
              <div key={item.device} className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} hover:shadow-md transition-all duration-300`}>
                <div className="mb-2">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate block`}>{item.name}</span>
                </div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>GPS:</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${gpsColor}`}>{gpsQuality}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(bar => (
                        <div key={bar} className={`w-1.5 h-4 rounded-sm ${
                          bar <= Math.ceil(item.satellites / 2)
                            ? item.satellites >= 8 ? 'bg-green-500'
                              : item.satellites >= 6 ? 'bg-blue-500'
                              : item.satellites >= 4 ? 'bg-orange-500'
                              : 'bg-red-500'
                            : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`} />
                      ))}
                    </div>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.satellites} sat</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conexão:</span>
                    <span className={`text-xs ${connectionColor} font-bold`}>{connectionQuality}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                      <div className={`h-2 transition-all duration-1000 ease-out ${
                        item.connectionRat >= 4 ? 'bg-green-500' :
                        item.connectionRat >= 3 ? 'bg-blue-500' :
                        item.connectionRat >= 2 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`} style={{ width: `${Math.min(item.connectionRat / 5 * 100, 100)}%` }} />
                    </div>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} min-w-[1.5rem] text-right`}>
                      {item.connectionRat.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status Geral:</span>
                    <span className={`font-bold ${
                      (item.satellites >= 6 && item.connectionRat >= 3) ? 'text-green-500' :
                      (item.satellites >= 4 && item.connectionRat >= 2) ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {(item.satellites >= 6 && item.connectionRat >= 3) ? '🟢 Ótimo' :
                        (item.satellites >= 4 && item.connectionRat >= 2) ? '🟡 Regular' :
                        '🔴 Ruim'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    // ...existing code for other popup types...
    return null;
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className={`min-h-screen ${isMobile ? 'p-2' : 'p-6'} overflow-x-hidden`}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes expandWidth {
          from {
            width: 0;
          }
        }
        
        @keyframes barGrow {
          from {
            width: 0;
            opacity: 0.7;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes drawCircle {
          from {
            stroke-dasharray: 0 176;
          }
        }
        
        @keyframes pieGlow {
          0%, 100% {
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
            transform: scale(1.02);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        .temperature-bar {
          position: relative;
          overflow: hidden;
        }
        
        .temperature-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
      {/* Cards */}
       <div className={`grid gap-${isMobile ? '1.5' : '3'} mb-${isMobile ? '3' : '4'} w-full overflow-hidden`} style={{ gridTemplateColumns: `repeat(${getGridCols(4, 3, 2)}, 1fr)` }}>
        {statisticsCardsData.map((card, index) => (
          <div 
            key={index} 
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-md ${isMobile ? 'p-2' : 'p-3'} ${isMobile ? 'flex flex-col items-center text-center' : 'flex items-center'} gap-${isMobile ? '1' : '2'} hover:shadow-lg transition-all duration-300 border group min-w-0`}
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.5s ease-out forwards'
            }}
          >
            <div className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg ${isDarkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'} group-hover:${isDarkMode ? 'from-blue-800 group-hover:to-blue-700' : 'from-blue-100 group-hover:to-blue-200'} transition-all duration-300 flex-shrink-0`}>
              <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} flex items-center justify-center`}>
                {React.cloneElement(card.icon, { 
                  className: `${isMobile ? 'h-4 w-4' : 'h-6 w-6'} ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`
                })}
              </div>
            </div>
            <div className={`${isMobile ? 'flex-1 w-full' : 'flex-1'} min-w-0`}>
              <h4 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} ${isMobile ? 'mb-0.5' : 'mb-1'} truncate`}>{card.title}</h4>
              <p className={`font-bold ${isMobile ? 'text-sm' : 'text-lg'} ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate ${isMobile ? 'leading-tight' : ''}`}>{card.value}</p>
              {card.footer.value && (
                <p className={`${isMobile ? 'text-xs' : 'text-xs'} ${card.footer.color} font-medium truncate ${isMobile ? 'mt-0.5' : ''}`}>
                  {card.footer.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos e Alertas */}
      <div className={`grid gap-${isMobile ? '2' : '4'} w-full overflow-hidden`} style={{ gridTemplateColumns: `repeat(${getGridCols(2, 1, 1)}, 1fr)` }}>
        {statisticsChartsData.map((chart, index) => {
          return (
            <div
              key={index}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-lg ${isMobile ? 'p-2' : 'p-4'} flex flex-col justify-between border min-w-0 overflow-hidden`}
            >
              <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>{chart.title}</h3>
              <div className="flex-1 overflow-hidden" style={{ height: isMobile ? '180px' : 'auto' }}>{createChart(chart)}</div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 ${getCommunicationStatus().color} rounded-full ${getCommunicationStatus().isRecent ? 'animate-pulse' : ''}`}></span>
                {getLastUpdateTime()}
              </p>
            </div>
          );
        })}
        {/* Box de alerta de temperatura como gráfico */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-lg shadow-lg ${isMobile ? 'p-2' : 'p-4'} flex flex-col justify-between overflow-hidden border min-w-0`}>
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-col md:flex-row'} md:items-center md:justify-between mb-4`}>
            <h3 className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2 truncate`}>
              <span className={`${isMobile ? 'text-sm' : 'text-xl'}`}>🌡️</span>
              <span className="truncate">Temperatura dos Equipamentos</span>
            </h3>
            <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : 'mt-2 md:mt-0'} ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} px-2 py-1 rounded-lg flex-shrink-0`}>
              <label htmlFor="alertTemp" className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>Alerta:</label>
              <input
                id="alertTemp"
                type="number"
                min={0}
                max={150}
                value={alertTemp}
                onChange={e => setAlertTemp(Number(e.target.value))}
                className={`border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded px-1 py-0.5 w-12 text-center text-xs font-bold focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-all duration-200`}
              />
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>°C</span>
            </div>
          </div>
          {/* Gráfico de barras horizontal estilizado */}
          <div className="flex-1 flex flex-col gap-2">
            {alertMachines.length === 0 ? (
              <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-8 flex flex-col items-center gap-2`}>
                <div className="text-2xl opacity-50">📊</div>
                <div className="text-sm">Nenhum equipamento encontrado</div>
              </div>
            ) : (
              alertMachines.map((eq, index) => {
                const temp = eq.deviceData?.calculated_temperature || 0;
                const percent = Math.min(temp / alertTemp, 1);
                const tempPercent = Math.min(temp / 150 * 100, 100);
                
                let barGradient = '';
                let statusIcon = '';
                let statusColor = '';
                
                if (temp > alertTemp) {
                  barGradient = 'from-red-400 via-red-500 to-red-600';
                  statusIcon = '🔥';
                  statusColor = 'text-red-700 bg-red-100';
                } else if (temp > alertTemp * 0.8) {
                  barGradient = 'from-yellow-400 via-orange-400 to-orange-500';
                  statusIcon = '⚠️';
                  statusColor = 'text-orange-700 bg-orange-100';
                } else {
                  barGradient = 'from-green-400 via-green-500 to-green-600';
                  statusIcon = '✅';
                  statusColor = 'text-green-700 bg-green-100';
                }
                
                return (
                  <div 
                    key={eq.id} 
                    className={`group ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} p-2 rounded-lg transition-all duration-300 cursor-pointer`}
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeInUp 0.4s ease-out forwards'
                    }}
                    onClick={() => handleChartClick('temperature')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${statusColor} transition-all duration-300`}>
                          {statusIcon}
                        </span>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'} truncate text-sm transition-colors duration-200`}>
                          {eq.name || 'Equipamento sem nome'}
                        </span>
                      </div>
                      
                      <div className={`flex-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-6 relative overflow-hidden shadow-sm`}>
                        <div
                          className={`h-6 rounded-full bg-gradient-to-r ${barGradient} shadow relative transition-all duration-700 ease-out`}
                          style={{ 
                            width: `${Math.max(tempPercent, 6)}%`,
                            animation: `barGrow 1s ease-out ${index * 0.05}s both`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent rounded-full"></div>
                          {temp > alertTemp && (
                            <div className="absolute inset-0 bg-white/15 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {temp.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°C
                          </span>
                        </div>
                        
                        {alertTemp <= 150 && (
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-50"
                            style={{ left: `${(alertTemp / 150) * 100}%` }}
                            title={`Limite: ${alertTemp}°C`}
                          >
                            <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className={`flex items-center justify-between mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              {getLastUpdateTime()}
            </p>
            <div className={`flex items-center gap-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                <span>Atenção</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                <span>Crítico</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {popupData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col`}>
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{popupData.title}</h2>
              <button 
                onClick={() => setPopupData(null)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors`}
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {popupData.type === 'impact' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {popupData.data.map((item, index) => {
                    const impactLevel = item.impact;
                    let statusColor = '';
                    let statusText = '';
                    if (impactLevel > 3) { statusColor = 'text-red-700 bg-red-100'; statusText = 'Alto'; }
                    else if (impactLevel > 1.5) { statusColor = 'text-orange-700 bg-orange-100'; statusText = 'Médio'; }
                    else if (impactLevel > 0.5) { statusColor = 'text-yellow-700 bg-yellow-100'; statusText = 'Baixo'; }
                    else { statusColor = 'text-green-700 bg-green-100'; statusText = 'Normal'; }
                    return (
                      <div key={item.device} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" fill="none" className={`${isDarkMode ? 'text-gray-600' : 'text-gray-200'}`}/>
                              <circle 
                                cx="24" 
                                cy="24" 
                                r="18" 
                                stroke="currentColor" 
                                strokeWidth="3" 
                                fill="none" 
                                strokeDasharray={`${Math.min(impactLevel / 5 * 113, 113)} 113`}
                                className={impactLevel > 3 ? 'text-red-500' : impactLevel > 1.5 ? 'text-orange-500' : impactLevel > 0.5 ? 'text-yellow-500' : 'text-green-500'}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{impactLevel.toFixed(1)}</span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>G</span>
                            </div>
                          </div>
                          <div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Device: {item.device}</div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rank: #{index + 1}</div>
                          </div>
                        </div>
                        {/* Exibir aceleração se disponível */}
                        {(item.x !== undefined || item.y !== undefined || item.z !== undefined) && (
                          <div className="mt-2">
                            <div className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Aceleração</div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="w-8 text-xs text-gray-500">X:</span>
                                <span className="font-bold text-xs" style={{ color: '#ef4444' }}>{item.x?.toFixed(2)}</span>
                                <span className="w-8 text-xs text-gray-500">Y:</span>
                                <span className="font-bold text-xs" style={{ color: '#22c55e' }}>{item.y?.toFixed(2)}</span>
                                <span className="w-8 text-xs text-gray-500">Z:</span>
                                <span className="font-bold text-xs" style={{ color: '#3b82f6' }}>{item.z?.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-16 text-xs text-gray-500">Total:</span>
                                <span className="font-bold text-xs">{item.total?.toFixed(2)} m/s²</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {popupData.type === 'acceleration' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popupData.data.map((item, index) => (
                    <div key={item.device} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.name}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>#{index + 1}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="text-center">
                          <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.total.toFixed(2)} m/s²</span>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aceleração Total</div>
                        </div>
                        {[
                          { label: 'Eixo X', value: item.x, color: 'bg-red-500' },
                          { label: 'Eixo Y', value: item.y, color: 'bg-green-500' },
                          { label: 'Eixo Z', value: item.z, color: 'bg-blue-500' }
                        ].map((axis) => (
                          <div key={axis.label} className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{axis.label}:</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-20 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                                <div 
                                  className={`h-2 ${axis.color} rounded-full`}
                                  style={{ width: `${Math.min(Math.abs(axis.value) / 10 * 100, 100)}%` }}
                                />
                              </div>
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} min-w-[3rem] text-right`}>
                                {axis.value.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {popupData.type === 'speedometer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {popupData.data.map((item, index) => {
                    let speedColor = item.speed > 15 ? 'text-red-500' : item.speed > 10 ? 'text-orange-500' : 'text-green-500';
                    let speedStatus = item.speed > 15 ? 'Acima do Limite' : item.speed > 10 ? 'Atenção' : 'Normal';
                    
                    return (
                      <div key={item.device} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>#{index + 1}</span>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${speedColor}`}>{item.speed}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>km/h</div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                            item.speed > 15 ? 'text-red-700 bg-red-100' :
                            item.speed > 10 ? 'text-orange-700 bg-orange-100' :
                            'text-green-700 bg-green-100'
                          }`}>
                            {speedStatus}
                          </div>
                          {item.speed > 15 && (
                            <div className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'} mt-1 font-medium`}>
                              Limite: 15 km/h
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {popupData.type === 'satellite' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {popupData.data.map((item, index) => {
                    let signalColor = '';
                    let signalText = '';
                    if (item.satellites >= 8) { signalColor = 'text-green-700 bg-green-100'; signalText = 'Excelente'; }
                    else if (item.satellites >= 6) { signalColor = 'text-blue-700 bg-blue-100'; signalText = 'Bom'; }
                    else if (item.satellites >= 4) { signalColor = 'text-orange-700 bg-orange-100'; signalText = 'Regular'; }
                    else { signalColor = 'text-red-700 bg-red-100'; signalText = 'Fraco'; }
                    
                    return (
                      <div key={item.device} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 border`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>#{index + 1}</span>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.satellites}</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Satélites</div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 ${signalColor}`}>
                            {signalText}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {popupData.type === 'maintenance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popupData.data.map((item, index) => {
                    let statusColor = '';
                    let statusTextColor = '';
                    if (item.status === 'Crítico') {
                      statusColor = isDarkMode ? 'border-red-500' : 'bg-red-100 border-red-200';
                      statusTextColor = isDarkMode ? 'text-red-400' : 'text-red-700';
                    }
                    else if (item.status === 'Atenção') {
                      statusColor = isDarkMode ? 'border-orange-500' : 'bg-orange-100 border-orange-200';
                      statusTextColor = isDarkMode ? 'text-orange-400' : 'text-orange-700';
                    }
                    else {
                      statusColor = isDarkMode ? 'border-green-500' : 'bg-green-100 border-green-200';
                      statusTextColor = isDarkMode ? 'text-green-400' : 'text-green-700';
                    }
                    
                    return (
                      <div key={index} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} rounded-lg p-4 border-2 ${statusColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 bg-opacity-50 text-gray-300' : 'bg-white bg-opacity-50 text-gray-700'}`}>#{index + 1}</span>
                        </div>
                        <div className="space-y-2">
                          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.remaining_hours.toFixed(0)}h</div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Horas Restantes</div>
                          <div className={`text-sm font-medium px-2 py-1 rounded-full text-center ${statusTextColor}`}>
                            {item.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {popupData.type === 'worked_hours' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popupData.data.map((item, index) => (
                    <div key={index} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>#{index + 1}</span>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{item.worked_hours.toLocaleString('pt-BR')}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Horas Trabalhadas</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {popupData.type === 'idle_time' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popupData.data.map((item, index) => (
                    <div key={item.device} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>#{index + 1}</span>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{(item.idleTime/3600 >= 1 ? `${(item.idleTime/3600).toFixed(1)}h` : `${(item.idleTime/60).toFixed(0)}min`)}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tempo Inativo</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {popupData.type === 'gps_connection' && (
                <div>
                  {/* Lista de Equipamentos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {popupData.data.map((item, index) => {
                      // Qualidade GPS baseada em satélites
                      let gpsQuality = '';
                      let gpsColor = '';
                      let gpsIcon = '';
                      
                      if (item.satellites >= 8) { 
                        gpsQuality = 'Excelente'; 
                        gpsColor = isDarkMode ? 'text-emerald-400 bg-gray-700' : 'text-emerald-600 bg-emerald-100'; 
                        gpsIcon = '🛰️'; 
                      }
                      else if (item.satellites >= 6) { 
                        gpsQuality = 'Bom'; 
                        gpsColor = isDarkMode ? 'text-blue-400 bg-gray-700' : 'text-blue-600 bg-blue-100'; 
                        gpsIcon = '📡'; 
                      }
                      else if (item.satellites >= 4) { 
                        gpsQuality = 'Regular'; 
                        gpsColor = isDarkMode ? 'text-amber-400 bg-gray-700' : 'text-amber-600 bg-amber-100'; 
                        gpsIcon = '📶'; 
                      }
                      else { 
                        gpsQuality = 'Fraco'; 
                        gpsColor = isDarkMode ? 'text-red-400 bg-gray-700' : 'text-red-600 bg-red-100'; 
                        gpsIcon = '📵'; 
                      }
                      
                      // Qualidade da conexão RAT
                      let connectionQuality = '';
                      let connectionColor = '';
                      
                      if (item.connectionRat >= 4) { 
                        connectionQuality = 'Excelente'; 
                        connectionColor = 'text-emerald-600'; 
                      }
                      else if (item.connectionRat >= 3) { 
                        connectionQuality = 'Bom'; 
                        connectionColor = 'text-blue-600'; 
                      }
                      else if (item.connectionRat >= 2) { 
                        connectionQuality = 'Regular'; 
                        connectionColor = 'text-amber-600'; 
                      }
                      else { 
                        connectionQuality = 'Fraco'; 
                        connectionColor = 'text-red-600'; 
                      }
                      
                      // Status geral
                      const overallGood = (item.satellites >= 6 && item.connectionRat >= 3);
                      const overallOk = (item.satellites >= 4 && item.connectionRat >= 2);
                      
                      return (
                        <div 
                          key={item.device} 
                          className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} 
                            rounded-lg p-3 border hover:shadow-md transition-all duration-300 cursor-pointer`}
                          style={{ 
                            animationDelay: `${index * 50}ms`,
                            animation: 'fadeInUp 0.6s ease-out forwards'
                          }}
                        >
                          {/* Header com nome e ranking */}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                              {item.name}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-700'} font-bold`}>
                              #{index + 1}
                            </span>
                          </div>
                          
                          {/* GPS Section */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>GPS:</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${gpsColor} font-medium`}>
                                {gpsQuality}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(bar => (
                                  <div 
                                    key={bar}
                                    className={`w-1 h-3 rounded-sm ${
                                      bar <= Math.ceil(item.satellites / 2.4) 
                                        ? item.satellites >= 8 ? 'bg-emerald-500' 
                                          : item.satellites >= 6 ? 'bg-blue-500'
                                          : item.satellites >= 4 ? 'bg-amber-500' 
                                          : 'bg-red-500'
                                        : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {item.satellites}
                              </span>
                            </div>
                          </div>
                          
                          {/* Connection Section */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conexão:</span>
                              <span className={`text-xs font-bold ${connectionColor}`}>
                                {connectionQuality}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`flex-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-1.5`}>
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    item.connectionRat >= 4 ? 'bg-emerald-500' :
                                    item.connectionRat >= 3 ? 'bg-blue-500' :
                                    item.connectionRat >= 2 ? 'bg-amber-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(item.connectionRat / 5 * 100, 100)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {item.connectionRat.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Status geral */}
                          <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className={`flex items-center justify-center text-xs`}>
                              <span className={`font-bold flex items-center gap-1 ${
                                overallGood ? 'text-emerald-600' :
                                overallOk ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {overallGood ? '🟢 Ótimo' :
                                 overallOk ? '🟡 Regular' :
                                 '🔴 Ruim'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {popupData.type === 'temperature' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {popupData.data.map((item, index) => {
                    let statusColor = '';
                    let statusTextColor = '';
                    let statusIcon = '';
                    if (item.status === 'Crítico') { 
                      statusColor = isDarkMode ? 'border-red-500' : 'bg-red-100 border-red-200'; 
                      statusTextColor = isDarkMode ? 'text-red-400' : 'text-red-700';
                      statusIcon = '🔥'; 
                    }
                    else if (item.status === 'Atenção') { 
                      statusColor = isDarkMode ? 'border-orange-500' : 'bg-orange-100 border-orange-200'; 
                      statusTextColor = isDarkMode ? 'text-orange-400' : 'text-orange-700';
                      statusIcon = '⚠️'; 
                    }
                    else { 
                      statusColor = isDarkMode ? 'border-green-500' : 'bg-green-100 border-green-200'; 
                      statusTextColor = isDarkMode ? 'text-green-400' : 'text-green-700';
                      statusIcon = '✅'; 
                    }
                    
                    return (
                      <div key={index} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} rounded-lg p-3 border-2 ${statusColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-800 bg-opacity-50 text-gray-300' : 'bg-white bg-opacity-50 text-gray-700'}`}>#{index + 1}</span>
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-2xl mr-2">{statusIcon}</span>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.temperature.toFixed(1)}°C</div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Temperatura</div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium px-2 py-1 rounded-full text-center ${statusTextColor}`}>
                          {item.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-500'} text-sm text-center`}>
              Total de {popupData.data.length} equipamentos encontrados
            </div>
          </div>
        </div>                                                                                                                                                               
      )}
    </div>
  );
};

export default Main;
