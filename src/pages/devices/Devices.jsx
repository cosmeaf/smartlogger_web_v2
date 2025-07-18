import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaTractor } from 'react-icons/fa'; // Ícones para as opções
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/apiService'; // Importa o serviço atualizado
import LoadPage from '../../components/LoadPage';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Função para buscar os dispositivos
  const fetchDevices = async () => {
    try {
      const { data } = await apiService.get('/devices/');
      setDevices(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();

    const interval = setInterval(() => {
      fetchDevices(); // Atualiza a cada 30 segundos
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (device) => {
    if (device.in_manutenance) {
      if (device.horimeter <= 100) return isDarkMode ? 'bg-yellow-900/30 dark:bg-yellow-800/40' : 'bg-yellow-100';
      if (device.horimeter > 100 && device.horimeter <= 200) return isDarkMode ? 'bg-orange-900/30 dark:bg-orange-800/40' : 'bg-orange-100';
      return isDarkMode ? 'bg-red-900/30 dark:bg-red-800/40' : 'bg-red-100';
    }
    return isDarkMode ? 'bg-gray-800 dark:bg-gray-800' : 'bg-white';
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="min-h-full">
      <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-400 mb-6 transition-colors duration-300">Lista de Dispositivos</h2>
      <div className="overflow-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white dark:bg-gray-800 transition-colors duration-300">
          <thead className="bg-blue-900 dark:bg-blue-800 text-white">
            <tr>
              <th className="w-1/6 text-left py-3 px-4 uppercase font-semibold text-sm">Identificação</th>
              <th className="w-1/6 text-left py-3 px-4 uppercase font-semibold text-sm">Registro</th>
              <th className="w-1/6 text-left py-3 px-4 uppercase font-semibold text-sm">Atualização</th>
              <th className="w-1/6 text-left py-3 px-4 uppercase font-semibold text-sm">Localização</th>
              <th className="w-1/6 text-left py-3 px-4 uppercase font-semibold text-sm">Velocidade GPS</th>
              <th className="w-1/6 text-left py-3 px-4 uppercase font-semibold text-sm">Horímetro</th>
              <th className="w-1/6 text-left py-3 px-4 uppercase font-semibold text-sm">Opções</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
            {devices && devices.length > 0 ? (
              devices.map((device, index) => (
                <tr key={index} className={`${getStatusColor(device)} border-b border-gray-200 dark:border-gray-700 transition-colors duration-300`}>
                  <td className="text-left py-3 px-4">{device.device_id}</td>
                  <td className="text-left py-3 px-4">
                    {device.date ? new Date(device.date + 'T' + device.time).toLocaleDateString('pt-BR') : 'Data não disponível'}
                  </td>
                  <td className="text-left py-3 px-4">
                    {device.updated_at ? new Date(device.updated_at).toLocaleDateString('pt-BR') : 'Atualização não disponível'}
                  </td>
                  <td className="text-left py-3 px-4">
                    <Link
                      to={`/dashboard/devices/location/${device.device_id}`}
                      className="text-blue-500 dark:text-blue-400 hover:underline transition-colors duration-300"
                    >
                      Localização
                    </Link>
                  </td>
                  <td className="text-left py-3 px-4">{device.speed_gps || 'N/A'} km/h</td>
                  <td className="text-left py-3 px-4">{device.horimeter || 'N/A'} h</td>
                  <td className="text-left py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/dashboard/devices/${device.device_id}`)}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        <FaEye className="inline-block" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/equipments`)}
                        className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-200"
                      >
                        <FaTractor className="inline-block" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-3 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Nenhum dispositivo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Devices;
