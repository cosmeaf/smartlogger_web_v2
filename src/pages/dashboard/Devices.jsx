import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaTractor } from 'react-icons/fa'; // Ícones para as opções
import apiService from '../../services/apiService'; // Importa o serviço atualizado
import LoadPage from '../../components/LoadPage';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
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
      if (device.horimeter <= 100) return 'bg-yellow-100';
      if (device.horimeter > 100 && device.horimeter <= 200) return 'bg-orange-100';
      return 'bg-red-100';
    }
    return 'bg-white';
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Lista de Dispositivos</h2>
      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-blue-900 text-white">
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
          <tbody className="text-gray-700">
            {devices && devices.length > 0 ? (
              devices.map((device, index) => (
                <tr key={index} className={`${getStatusColor(device)} border-b`}>
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
                      className="text-blue-500 hover:underline"
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
                        className="text-blue-500"
                      >
                        <FaEye className="inline-block" />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/equipments`)}
                        className="text-yellow-500"
                      >
                        <FaTractor className="inline-block" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-3">
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
