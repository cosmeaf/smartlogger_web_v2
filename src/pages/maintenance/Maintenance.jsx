import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/apiService';
import LoadPage from '../../components/LoadPage';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Maintenance = () => {
  const { equipmentId } = useParams();
  const { isDarkMode } = useTheme();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [resetLogs, setResetLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipmentName, setEquipmentName] = useState('');
  // Buscar nome do equipamento pelo id
  const fetchEquipmentName = async () => {
    try {
      const { data } = await apiService.get('/equipments/');
      const found = data.find((eq) => String(eq.device_id) === String(equipmentId) || String(eq.id) === String(equipmentId));
      setEquipmentName(found ? found.name : '');
    } catch (error) {
      setEquipmentName('');
    }
  };

  const fetchMaintenanceRecords = async () => {
    try {
      const { data } = await apiService.get('/maintenances/');
      const filteredMaintenances = data.filter(
        (maintenance) => maintenance.equipment === parseInt(equipmentId)
      );
      setMaintenanceRecords(filteredMaintenances);
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error.message);
      toast.error('Erro ao buscar registros de manutenção');
    } finally {
      setLoading(false);
    }
  };

  const fetchResetLogs = async () => {
    try {
      const { data } = await apiService.get('/maintenance-reset-logs/');
      setResetLogs(data);
    } catch (error) {
      console.error('Erro ao buscar logs de reset:', error.message);
      toast.error('Erro ao buscar logs de reset');
    }
  };

  useEffect(() => {
    fetchMaintenanceRecords();
    fetchResetLogs();
    fetchEquipmentName();
    const intervalId = setInterval(() => {
      fetchMaintenanceRecords();
      fetchResetLogs();
      fetchEquipmentName();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [equipmentId]);

  const handleResetHours = async (maintenanceId) => {
    try {
      await apiService.post(`/maintenances/${maintenanceId}/reset_hours/`);
      const updatedRecords = maintenanceRecords.map((maintenance) =>
        maintenance.id === maintenanceId
          ? { ...maintenance, worked_hours: 0, remaining_hours: maintenance.alarm_hours }
          : maintenance
      );
      setMaintenanceRecords(updatedRecords);
      toast.success('Horas de uso zeradas com sucesso!');
    } catch (error) {
      console.error('Erro ao zerar horas de uso da peça:', error.message);
      toast.error('Erro ao zerar horas de uso da peça');
    }
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className={`p-6 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Tabela de Manutenções */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
          Manutenções do Equipamento {equipmentName}
        </h2>
        <Link
          to={`/dashboard/maintenance/${equipmentId}/create`}
          className={`py-2 px-4 rounded-md flex items-center transition-colors ${
            isDarkMode 
              ? 'bg-blue-700 hover:bg-blue-600 text-white' 
              : 'bg-blue-900 hover:bg-blue-800 text-white'
          }`}
        >
          <FaPlus className="mr-2" /> Nova Manutenção
        </Link>
      </div>

      <div className="overflow-auto rounded-lg shadow mb-8">
        <table className={`min-w-full text-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-900'} text-white`}>
            <tr>
              <th className="text-left py-2 px-4">Nome da Peça</th>
              <th className="text-left py-2 px-4">O.S.</th>
              <th className="text-left py-2 px-4">Relatório</th>
              <th className="text-left py-2 px-4">Horas da Peça</th>
              <th className="text-left py-2 px-4">Horas para Alarme</th>
              <th className="text-left py-2 px-4">Horas Restantes</th>
              <th className="text-right py-2 px-4">Ações</th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {maintenanceRecords.map((maintenance) => (
              <tr key={maintenance.id} className={`border-b ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-50'
              } transition-colors`}>
                <td className="py-2 px-4">{maintenance.name}</td>
                <td className="py-2 px-4">
                  <input
                    type="checkbox"
                    checked={maintenance.os}
                    onChange={() => {}}
                    className="w-5 h-5"
                  />
                </td>
                <td className="py-2 px-4">
                  <button className={`px-2 py-1 rounded transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-blue-500 hover:bg-blue-700 text-white'
                  }`}>
                    Relatório
                  </button>
                </td>
                <td className="py-2 px-4">{maintenance.worked_hours} h</td>
                <td className="py-2 px-4">{maintenance.alarm_hours} h</td>
                <td className="py-2 px-4">{maintenance.remaining_hours} h</td>
                <td className="text-right py-2 px-4">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleResetHours(maintenance.id)}
                      className={`px-2 py-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                          : 'bg-yellow-500 hover:bg-yellow-700 text-white'
                      }`}
                    >
                      Zerar
                    </button>
                    <Link
                      to={`/dashboard/maintenance/${maintenance.id}/edit`}
                      className={`px-2 py-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                          : 'bg-blue-500 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => {}}
                      className={`px-2 py-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'bg-red-600 hover:bg-red-500 text-white' 
                          : 'bg-red-500 hover:bg-red-700 text-white'
                      }`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nova Tabela de Logs de Reset */}
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
          Logs de Reset
        </h3>
        <div className="overflow-auto rounded-lg shadow">
          <table className={`min-w-full text-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-900'} text-white`}>
              <tr>
                <th className="text-left py-2 px-4">Data Reset</th>
                <th className="text-left py-2 px-4">Equipamento Horas</th>
                <th className="text-left py-2 px-4">Manutenção</th>
                <th className="text-left py-2 px-4">Obs</th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {resetLogs.map((log) => (
                <tr key={log.id} className={`border-b ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-50'
                } transition-colors`}>
                  <td className="py-2 px-4">
                    {new Date(log.reset_date).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2 px-4">{log.equipment_worked_hours} h</td>
                  <td className="py-2 px-4">{log.maintenance}</td>
                  <td className="py-2 px-4">{log.obs || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
