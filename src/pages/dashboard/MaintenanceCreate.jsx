import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiService from '../../services/apiService'; // Atualizado para usar apiService
import Swal from 'sweetalert2';

const MaintenanceCreate = () => {
  const { equipmentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    initial_hour_maintenance: '',
    alarm_hours: '',
    obs: '',
    os: false
  });

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEquipmentDetails = async () => {
    try {
      const { data } = await apiService.get(`/equipments/${equipmentId}/`);
      setEquipment(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentDetails();
  }, [equipmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      initial_hour_maintenance: parseFloat(formData.initial_hour_maintenance),
      alarm_hours: parseFloat(formData.alarm_hours),
      obs: formData.obs,
      os: formData.os,
      equipment: parseInt(equipmentId),
    };

    try {
      await apiService.post('/maintenances/', payload);
      Swal.fire('Sucesso', 'Manutenção criada com sucesso!', 'success');
      navigate(`/dashboard/maintenance/${equipmentId}`);
    } catch (error) {
      Swal.fire('Erro', `Falha ao criar manutenção: ${error.message}`, 'error');
    }
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">
        Nova Manutenção para {equipment?.name}
      </h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Nome da Peça */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Peça</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>

          {/* Horas de Manutenção Inicial */}
          <div>
            <label htmlFor="initial_hour_maintenance" className="block text-sm font-medium text-gray-700 mb-1">Horas de Manutenção Inicial</label>
            <input
              type="number"
              name="initial_hour_maintenance"
              id="initial_hour_maintenance"
              value={formData.initial_hour_maintenance}
              onChange={handleChange}
              className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>

          {/* Horas para Alarme */}
          <div>
            <label htmlFor="alarm_hours" className="block text-sm font-medium text-gray-700 mb-1">Horas para Alarme</label>
            <input
              type="number"
              name="alarm_hours"
              id="alarm_hours"
              value={formData.alarm_hours}
              onChange={handleChange}
              className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>
        </div>

        {/* Observações */}
        <div className="mt-6">
          <label htmlFor="obs" className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            name="obs"
            id="obs"
            value={formData.obs}
            onChange={handleChange}
            className="block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            rows={4}
          ></textarea>
        </div>

        {/* Ações */}
        <div className="flex justify-between mt-8">
          <Link
            to={`/dashboard/maintenance/${equipmentId}`}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-gray-500 transition duration-200"
          >
            Voltar
          </Link>
          <button
            type="submit"
            className="bg-blue-900 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceCreate;
