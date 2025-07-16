import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
          title: 'Dispositivos',
          value: devices.data.length,
          footer: {
            color: 'text-green-500',
            value: '',
            label: '',
          },
          icon: <FaTractor className="h-8 w-8 text-blue-900" />,
        },
        {
          title: 'Equipamentos',
          value: equipments.data.length,
          footer: {
            color: 'text-blue-500',
            value: '',
            label: '',
          },
          icon: <FaTools className="h-8 w-8 text-blue-900" />,
        },
        {
          title: 'Manutenções',
          value: maintenances.data.length,
          footer: {
            color: 'text-red-500',
            value: '',
            label: '',
          },
          icon: <FaWrench className="h-8 w-8 text-blue-900" />,
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
            <svg className="h-8 w-8 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                mergedEquipments.filter(eq => eq.min_remaining_hours >= 0 && eq.min_remaining_hours < 100).length,
                mergedEquipments.filter(eq => eq.min_remaining_hours >= 100).length
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
          title: 'Força de Impacto dos Equipamentos',
          type: 'impact',
          series: [
            {
              name: 'Força G',
              data: devices.data
                .filter(d => d.impact !== undefined && d.impact > 0)
                .slice(0, 8)
                .map(d => ({ 
                  device: d.device_id, 
                  impact: d.impact || 0,
                  name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
                })),
            },
          ],
          options: {
            height: 140,
          },
        },
        {
          title: 'Aceleração em Tempo Real',
          type: 'acceleration',
          series: [
            {
              name: 'Aceleração',
              data: devices.data
                .filter(d => d.acceleration_x !== undefined || d.acceleration_y !== undefined || d.acceleration_z !== undefined)
                .slice(0, 6)
                .map(d => ({ 
                  device: d.device_id, 
                  x: d.acceleration_x || 0,
                  y: d.acceleration_y || 0,
                  z: d.acceleration_z || 0,
                  name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
                })),
            },
          ],
          options: {
            height: 140,
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
          title: 'Qualidade do Sinal GPS',
          type: 'satellite',
          series: [
            {
              name: 'Satélites',
              data: devices.data
                .filter(d => d.satellites !== undefined)
                .slice(0, 10)
                .map(d => ({ 
                  device: d.device_id, 
                  satellites: d.satellites || 0,
                  name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
                })),
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
        case 'impact':
          allData = devices.data
            .filter(d => d.impact !== undefined && d.impact > 0)
            .map(d => ({ 
              device: d.device_id, 
              impact: d.impact || 0,
              name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
            }))
            .sort((a, b) => b.impact - a.impact);
          title = 'Força de Impacto - Todos os Equipamentos';
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
          allData = devices.data
            .filter(d => d.satellites !== undefined)
            .map(d => ({ 
              device: d.device_id, 
              satellites: d.satellites || 0,
              name: mergedEquipments.find(eq => eq.device === d.device_id)?.name || `Device ${d.device_id}`
            }))
            .sort((a, b) => b.satellites - a.satellites);
          title = 'Qualidade GPS - Todos os Equipamentos';
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
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <div style={{ 
              width: 220, 
              height: 220, 
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <div className="space-y-3">
              {labels.map((label, idx) => (
                <div 
                  key={label} 
                  className="group hover:bg-gray-50 p-3 rounded-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 hover:shadow-md"
                  style={{ 
                    animationDelay: `${idx * 200}ms`,
                    animation: 'slideInRight 0.6s ease-out forwards',
                    background: `linear-gradient(135deg, ${colors[idx]}10, ${colors[idx]}05)`
                  }}
                  onClick={() => handleChartClick('maintenance')}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ 
                          background: gradients[idx],
                          animation: `pulse 2s infinite ${idx * 0.3}s`
                        }}
                      ></div>
                      <span className="text-lg">{icons[idx]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                        {label}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="text-xl font-bold transition-all duration-300 group-hover:scale-110"
                          style={{ color: colors[idx] }}
                        >
                          {values[idx]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {values.reduce((a, b) => a + b, 0) > 0 ? 
                            `${((values[idx] / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%` : 
                            '0%'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-1000 ease-out"
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
              impactIntensity = 'Alto'; 
            }
            else if (impactLevel > 1.5) { 
              impactColor = 'from-orange-400 to-orange-600'; 
              impactIntensity = 'Médio'; 
            }
            else if (impactLevel > 0.5) { 
              impactColor = 'from-yellow-400 to-yellow-600'; 
              impactIntensity = 'Baixo'; 
            }
            else { 
              impactColor = 'from-green-400 to-green-600'; 
              impactIntensity = 'Normal'; 
            }
            
            return (
              <div 
                key={item.device} 
                className="bg-white rounded-lg p-2 border border-gray-200 hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('impact')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate">{item.name}</span>
                  <span className={`text-xs px-1 py-0.5 rounded-full ${
                    impactLevel > 3 ? 'text-red-700 bg-red-100' :
                    impactLevel > 1.5 ? 'text-orange-700 bg-orange-100' :
                    impactLevel > 0.5 ? 'text-yellow-700 bg-yellow-100' :
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
                        className="text-gray-200"
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
                          impactLevel > 1.5 ? 'text-orange-500' :
                          impactLevel > 0.5 ? 'text-yellow-500' :
                          'text-green-500'
                        } transition-all duration-1000`}
                        style={{
                          animation: `drawCircle 1.5s ease-out ${index * 0.1}s both`
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-gray-800">{impactLevel.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">G</span>
                    </div>
                    
                    {/* Efeito de pulso para impactos altos */}
                    {impactLevel > 2 && (
                      <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30"></div>
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
            
            if (totalAccel > 5) accelColor = 'from-red-400 to-red-600';
            else if (totalAccel > 2) accelColor = 'from-orange-400 to-orange-600';
            else accelColor = 'from-blue-400 to-blue-600';
            
            return (
              <div 
                key={item.device} 
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 hover:shadow-md transition-all duration-300 cursor-pointer"
                style={{ 
                  animationDelay: `${index * 120}ms`,
                  animation: 'slideInLeft 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('acceleration')}
              >
                <div className="mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate block">{item.name}</span>
                  <span className="text-xs text-gray-500">Total: {totalAccel.toFixed(1)} m/s²</span>
                </div>
                
                <div className="space-y-1">
                  {[
                    { label: 'X', value: item.x, color: 'bg-red-500' },
                    { label: 'Y', value: item.y, color: 'bg-green-500' },
                    { label: 'Z', value: item.z, color: 'bg-blue-500' }
                  ].map((axis, axisIndex) => (
                    <div key={axis.label} className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-600 w-2">{axis.label}:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 ${axis.color} transition-all duration-1000 ease-out`}
                          style={{ 
                            width: `${Math.min(Math.abs(axis.value) / 10 * 100, 100)}%`,
                            animation: `expandWidth 1s ease-out ${index * 0.1 + axisIndex * 0.1}s both`
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-800 min-w-[1.5rem] text-right">
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
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 flex flex-col items-center justify-center hover:shadow-md transition-all duration-300 cursor-pointer"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
                onClick={() => handleChartClick('speedometer')}
              >
                <div className="relative w-12 h-12 mb-1">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200"/>
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
                    <span className="text-xs font-bold text-gray-800">{item.speed}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 text-center truncate w-full">{item.name}</span>
                <span className="text-xs text-gray-500">km/h</span>
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
                className="bg-white rounded-lg p-2 border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                style={{ 
                  animationDelay: `${index * 80}ms`,
                  animation: 'slideInLeft 0.5s ease-out forwards'
                }}
                onClick={() => handleChartClick('satellite')}
              >
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-700 truncate block">{item.name}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-1 py-0.5 rounded-full ${signalColor}`}>
                      {signalQuality}
                    </span>
                    <span className="text-xs font-bold text-gray-800">{item.satellites} sat</span>
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
                            : 'bg-gray-200'
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
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{equipmentData.length}</span> equipamentos
              </div>
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold text-blue-600">
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
                        className="flex items-center gap-3 py-0.1 px-2 rounded-lg hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: 'slideInLeft 0.4s ease-out forwards'
                        }}
                        onClick={() => handleChartClick('worked_hours')}
                      >
                        {/* Ranking */}
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        
                        {/* Nome do equipamento */}
                        <div className="min-w-[110px] max-w-[110px]">
                          <span className="text-sm font-medium text-gray-800 truncate block group-hover:text-blue-700 transition-colors">
                            {item.name || 'Sem nome'}
                          </span>
                        </div>
                        
                        {/* Barra de progresso */}
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
                            <div
                              className="h-3 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full relative transition-all duration-700 ease-out group-hover:from-blue-500 group-hover:to-blue-700"
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
                          <span className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
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
            <div className="flex items-center justify-center mt-3 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Alto uso</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Uso médio</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
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

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <style jsx>{`
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
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statisticsCardsData.map((card, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.5s ease-out forwards'
            }}
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
              {card.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-base font-medium text-gray-700 mb-1">{card.title}</h4>
              <p className="font-bold text-2xl text-gray-900">{card.value}</p>
              {card.footer.value && (
                <p className={`text-sm ${card.footer.color} font-medium`}>
                  {card.footer.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos e Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statisticsChartsData.map((chart, index) => {
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between"
            >
              <h3 className="text-lg font-semibold mb-2">{chart.title}</h3>
              <div className="flex-1">{createChart(chart)}</div>
              <p className="text-xs text-gray-400 mt-2 text-center">Atualizado recentemente</p>
            </div>
          );
        })}
        {/* Box de alerta de temperatura como gráfico */}
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">🌡️</span>
              Temperatura dos Equipamentos
            </h3>
            <div className="flex items-center gap-2 mt-2 md:mt-0 bg-gray-50 px-3 py-1.5 rounded-lg">
              <label htmlFor="alertTemp" className="text-xs font-medium text-gray-700">Alerta acima de:</label>
              <input
                id="alertTemp"
                type="number"
                min={0}
                max={150}
                value={alertTemp}
                onChange={e => setAlertTemp(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 w-16 text-center text-xs font-bold focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-all duration-200"
              />
              <span className="text-xs font-medium text-gray-700">°C</span>
            </div>
          </div>
          {/* Gráfico de barras horizontal estilizado */}
          <div className="flex-1 flex flex-col gap-2">
            {alertMachines.length === 0 ? (
              <div className="text-gray-500 text-center py-8 flex flex-col items-center gap-2">
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
                    className="group hover:bg-gray-50 p-2 rounded-lg transition-all duration-300 cursor-pointer"
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
                        <span className="font-medium text-gray-800 truncate text-sm group-hover:text-gray-900 transition-colors duration-200">
                          {eq.name || 'Equipamento sem nome'}
                        </span>
                      </div>
                      
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden shadow-sm">
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
                          <span className="text-xs font-bold text-gray-800">
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
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Atualizado recentemente
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
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
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">{popupData.title}</h2>
              <button 
                onClick={() => setPopupData(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
                      <div key={item.device} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 truncate">{item.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" fill="none" className="text-gray-200"/>
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
                              <span className="text-sm font-bold">{impactLevel.toFixed(1)}</span>
                              <span className="text-xs text-gray-500">G</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Device: {item.device}</div>
                            <div className="text-sm text-gray-600">Rank: #{index + 1}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {popupData.type === 'acceleration' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popupData.data.map((item, index) => (
                    <div key={item.device} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-800 truncate">{item.name}</span>
                        <span className="text-sm text-gray-600">#{index + 1}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="text-center">
                          <span className="text-lg font-bold text-gray-800">{item.total.toFixed(2)} m/s²</span>
                          <div className="text-sm text-gray-600">Aceleração Total</div>
                        </div>
                        {[
                          { label: 'Eixo X', value: item.x, color: 'bg-red-500' },
                          { label: 'Eixo Y', value: item.y, color: 'bg-green-500' },
                          { label: 'Eixo Z', value: item.z, color: 'bg-blue-500' }
                        ].map((axis) => (
                          <div key={axis.label} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{axis.label}:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 ${axis.color} rounded-full`}
                                  style={{ width: `${Math.min(Math.abs(axis.value) / 10 * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-800 min-w-[3rem] text-right">
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
                      <div key={item.device} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 truncate">{item.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">#{index + 1}</span>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${speedColor}`}>{item.speed}</div>
                          <div className="text-sm text-gray-600">km/h</div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                            item.speed > 15 ? 'text-red-700 bg-red-100' :
                            item.speed > 10 ? 'text-orange-700 bg-orange-100' :
                            'text-green-700 bg-green-100'
                          }`}>
                            {speedStatus}
                          </div>
                          {item.speed > 15 && (
                            <div className="text-xs text-red-600 mt-1 font-medium">
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
                      <div key={item.device} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 truncate">{item.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">#{index + 1}</span>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{item.satellites}</div>
                          <div className="text-sm text-gray-600">Satélites</div>
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
                    if (item.status === 'Crítico') statusColor = 'text-red-700 bg-red-100 border-red-200';
                    else if (item.status === 'Atenção') statusColor = 'text-orange-700 bg-orange-100 border-orange-200';
                    else statusColor = 'text-green-700 bg-green-100 border-green-200';
                    
                    return (
                      <div key={index} className={`rounded-lg p-4 border-2 ${statusColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 truncate">{item.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">#{index + 1}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="text-lg font-bold">{item.remaining_hours.toFixed(0)}h</div>
                          <div className="text-sm text-gray-600">Horas Restantes</div>
                          <div className={`text-sm font-medium px-2 py-1 rounded-full text-center`}>
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
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800 truncate">{item.name}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">#{index + 1}</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{item.worked_hours.toLocaleString('pt-BR')}</div>
                        <div className="text-sm text-gray-600">Horas Trabalhadas</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {popupData.type === 'temperature' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {popupData.data.map((item, index) => {
                    let statusColor = '';
                    let statusIcon = '';
                    if (item.status === 'Crítico') { 
                      statusColor = 'text-red-700 bg-red-100 border-red-200'; 
                      statusIcon = '🔥'; 
                    }
                    else if (item.status === 'Atenção') { 
                      statusColor = 'text-orange-700 bg-orange-100 border-orange-200'; 
                      statusIcon = '⚠️'; 
                    }
                    else { 
                      statusColor = 'text-green-700 bg-green-100 border-green-200'; 
                      statusIcon = '✅'; 
                    }
                    
                    return (
                      <div key={index} className={`rounded-lg p-3 border-2 ${statusColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 truncate">{item.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">#{index + 1}</span>
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-2xl mr-2">{statusIcon}</span>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">{item.temperature.toFixed(1)}°C</div>
                            <div className="text-sm text-gray-600">Temperatura</div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium px-2 py-1 rounded-full text-center`}>
                          {item.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500 text-center">
              Total de {popupData.data.length} equipamentos encontrados
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
