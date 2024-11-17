import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService'; // Usando o novo serviço de API
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MaintenanceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState({
    initial_hour_maintenance: null,
    alarm_hours: "",
    equipment: {
      name: "",
      model: "",
      device: "",
    },
  });

  const fetchMaintenance = async () => {
    try {
      const { data } = await apiService.get(`/maintenances/${id}/`);
      setMaintenance({
        initial_hour_maintenance: data.initial_hour_maintenance,
        alarm_hours: data.alarm_hours,
        equipment: {
          name: data.equipment?.name || "",
          model: data.equipment?.model || "",
          device: data.equipment?.device || "",
        },
      });
    } catch (error) {
      console.error('Erro ao buscar manutenção:', error.message);
      toast.error('Falha ao buscar os dados da manutenção.');
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaintenance({ ...maintenance, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        initial_hour_maintenance: maintenance.initial_hour_maintenance !== "" ? parseFloat(maintenance.initial_hour_maintenance) : null,
        alarm_hours: maintenance.alarm_hours !== "" ? parseFloat(maintenance.alarm_hours) : null,
      };

      await apiService.patch(`/maintenances/${id}/`, formattedData);
      toast.success('Manutenção atualizada com sucesso!');
      navigate('/dashboard/equipments');
    } catch (error) {
      toast.error('Falha ao atualizar a manutenção.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Editar Manutenção</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Hora Manutenção Inicial (editável) */}
          <div>
            <label htmlFor="initial_hour_maintenance" className="block text-sm font-medium text-gray-700">Hora Manutenção Inicial</label>
            <input
              type="number"
              name="initial_hour_maintenance"
              id="initial_hour_maintenance"
              value={maintenance.initial_hour_maintenance || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Horas para Alarme (editável) */}
          <div>
            <label htmlFor="alarm_hours" className="block text-sm font-medium text-gray-700">Horas para Alarme</label>
            <input
              type="number"
              name="alarm_hours"
              id="alarm_hours"
              value={maintenance.alarm_hours || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="submit"
            className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Atualizar
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            onClick={() => navigate('/dashboard/equipments')}
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceEdit;
