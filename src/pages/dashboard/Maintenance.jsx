import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import LoadPage from '../../components/LoadPage';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Maintenance = () => {
  const { equipmentId } = useParams();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [resetLogs, setResetLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const intervalId = setInterval(() => {
      fetchMaintenanceRecords();
      fetchResetLogs();
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
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Tabela de Manutenções */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-900">Manutenções do Equipamento</h2>
        <Link
          to={`/dashboard/maintenance/${equipmentId}/create`}
          className="bg-blue-900 text-white py-2 px-4 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Nova Manutenção
        </Link>
      </div>

      <div className="overflow-auto rounded-lg shadow mb-8">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-blue-900 text-white">
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
          <tbody className="text-gray-700">
            {maintenanceRecords.map((maintenance) => (
              <tr key={maintenance.id} className="bg-gray-100 border-b border-gray-300">
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
                  <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700">
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
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-700"
                    >
                      Zerar
                    </button>
                    <Link
                      to={`/dashboard/maintenance/${maintenance.id}/edit`}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => {}}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
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
        <h3 className="text-lg font-semibold text-blue-700 mb-3">Logs de Reset</h3>
        <div className="overflow-auto rounded-lg shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="text-left py-2 px-4">Data Reset</th>
                <th className="text-left py-2 px-4">Equipamento Horas</th>
                <th className="text-left py-2 px-4">Manutenção</th>
                <th className="text-left py-2 px-4">Obs</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {resetLogs.map((log) => (
                <tr key={log.id} className="bg-gray-100 border-b border-gray-300">
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
