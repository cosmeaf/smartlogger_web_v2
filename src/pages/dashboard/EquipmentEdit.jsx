import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EquipmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState({
    name: '',
    model: '',
    device: '',
    initial_hour_machine: '',
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await api.get(`/equipments/${id}/`);
        setEquipment({
          name: response.data.name,
          model: response.data.model,
          device: response.data.device,
          initial_hour_machine: response.data.initial_hour_machine,
        });
      } catch (error) {
        console.error('Erro ao buscar equipamento:', error.message);
        toast.error('Falha ao buscar o equipamento.');
      }
    };
    fetchEquipment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipment({ ...equipment, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: equipment.name,
        model: equipment.model,
        initial_hour_machine: parseFloat(equipment.initial_hour_machine) || 0,
      };

      await api.patch(`/equipments/${id}/`, payload);
      toast.success('Equipamento atualizado com sucesso!');
      navigate('/dashboard/equipments');
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error(`Falha ao atualizar equipamento: ${error.response?.data?.detail || 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Editar Equipamento</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="name"
              id="name"
              value={equipment.name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Modelo */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              name="model"
              id="model"
              value={equipment.model}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Device (read-only) */}
          <div>
            <label htmlFor="device" className="block text-sm font-medium text-gray-700">Device</label>
            <input
              type="text"
              name="device"
              id="device"
              value={equipment.device}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm bg-gray-100"
              readOnly
            />
          </div>

          {/* Worked Hours */}
          <div>
            <label htmlFor="initial_hour_machine" className="block text-sm font-medium text-gray-700">Hora Inicial</label>
            <input
              type="number"
              name="initial_hour_machine"
              id="initial_hour_machine"
              value={equipment.initial_hour_machine || ''}
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
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none"
            onClick={() => navigate('/dashboard/equipments')}
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentEdit;
