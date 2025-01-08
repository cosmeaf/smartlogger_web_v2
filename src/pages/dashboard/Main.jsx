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
  const [loading, setLoading] = useState(true);

  const fetchStatisticsData = async () => {
    try {
      const [devices, equipments, maintenances, employees] = await Promise.all([
        api.get('/devices/'),
        api.get('/equipments/'),
        api.get('/maintenances/'),
        api.get('/employees/'),
      ]);

      // Dados para os cards
      const cardsData = [
        {
          title: 'Dispositivos',
          value: devices.data.length,
          footer: {
            color: 'text-green-500',
            value: `Ativos: ${devices.data.filter((device) => device.status === 'active').length}`,
            label: 'dispositivos ativos',
          },
          icon: <FaTractor className="h-8 w-8 text-blue-900" />,
        },
        {
          title: 'Equipamentos',
          value: equipments.data.length,
          footer: {
            color: 'text-blue-500',
            value: `Monitorados: ${equipments.data.length}`,
            label: 'equipamentos',
          },
          icon: <FaTools className="h-8 w-8 text-blue-900" />,
        },
        {
          title: 'Manutenções',
          value: maintenances.data.length,
          footer: {
            color: 'text-red-500',
            value: `Pendentes: ${maintenances.data.filter((m) => !m.os).length}`,
            label: 'manutenções pendentes',
          },
          icon: <FaWrench className="h-8 w-8 text-blue-900" />,
        },
        {
          title: 'Funcionários',
          value: employees.data.length,
          footer: {
            color: 'text-gray-500',
            value: `Registrados: ${employees.data.length}`,
            label: 'funcionários',
          },
          icon: <FaUserCog className="h-8 w-8 text-blue-900" />,
        },
      ];
      setStatisticsCardsData(cardsData);

      // Dados para os gráficos
      const chartsData = [
        {
          title: 'Dispositivos por Equipamento',
          type: 'bar',
          series: [
            {
              name: 'Dispositivos',
              data: equipments.data.map((equipment) => equipment.devices_count || 0),
            },
          ],
          options: {
            xaxis: { categories: equipments.data.map((equipment) => equipment.name) },
            height: 150, // Ajustando a altura do gráfico
          },
        },
        {
          title: 'Horas Trabalhadas por Equipamento',
          type: 'line',
          series: [
            {
              name: 'Horas Trabalhadas',
              data: equipments.data.map((equipment) => equipment.worked_hours || 0),
            },
          ],
          options: {
            xaxis: { categories: equipments.data.map((equipment) => equipment.name) },
            height: 150, // Ajustando a altura do gráfico
          },
        },
        {
          title: 'Manutenções Pendentes',
          type: 'pie',
          series: equipments.data.map((equipment) => 
            maintenances.data.filter((m) => m.equipment === equipment.id && !m.os).length
          ),
          options: {
            labels: equipments.data.map((equipment) => equipment.name),
            height: 150, // Ajustando a altura do gráfico
          },
        },
        {
          title: 'Horas Totais Trabalhadas',
          type: 'bar',
          series: [
            {
              name: 'Horas Totais',
              data: [equipments.data.reduce((acc, eq) => acc + eq.worked_hours, 0)],
            },
          ],
          options: { 
            xaxis: { categories: ['Total'] },
            height: 150, // Ajustando a altura do gráfico
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
  }, []);

  const createChart = (chart) => {
    const data = {
      labels: chart.options?.labels || chart.options?.xaxis?.categories,
      datasets: chart.series.map((serie) => ({
        label: serie.name,
        data: serie.data,
        backgroundColor: '#36a2eb',
        borderColor: '#2c5282',
        borderWidth: 2,
      })),
    };
    const ChartComponent = chart.type === 'bar' ? Bar : chart.type === 'line' ? Line : Pie;
    return <ChartComponent data={data} />;
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statisticsCardsData.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-gray-200">{card.icon}</div>
            <div>
              <h4 className="text-lg">{card.title}</h4>
              <p className="font-bold text-2xl">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statisticsChartsData.map((chart, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between">
            <h3 className="text-lg font-semibold mb-2">{chart.title}</h3>
            <div className="flex-1">{createChart(chart)}</div>
            <p className="text-xs text-gray-400 mt-2 text-center">Atualizado recentemente</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Main;
