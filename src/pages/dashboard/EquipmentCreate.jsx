import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadPage from '../../components/LoadPage';

const EquipmentCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    worked_hours: null, // Horas iniciais
    device: '', // ID do dispositivo selecionado
  });
  const [devices, setDevices] = useState([]); // Lista de dispositivos disponíveis
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Buscar dispositivos disponíveis
  const fetchAvailableDevices = async () => {
    try {
      const response = await api.get('/devices/', { params: { available: true } });
      setDevices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dispositivos disponíveis:', error.message);
      toast.error('Falha ao buscar dispositivos disponíveis.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDevices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Função para criar o equipamento
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.device) {
      toast.error('Por favor, selecione um dispositivo disponível.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      model: formData.model.trim() || 'N/A',
      worked_hours: parseFloat(formData.worked_hours) || 0,
      device: formData.device, // ID do dispositivo
    };

    try {
      console.log('Enviando dados para a API:', payload);
      await api.post('/equipments/', payload);
      toast.success('Equipamento criado com sucesso!');
      navigate('/dashboard/equipments');
    } catch (error) {
      console.error('Erro ao criar equipamento:', error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || 'Falha ao criar equipamento'}`);
    }
  };

  if (loading) {
    return <LoadPage />;
  }

  if (!loading && devices.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-semibold text-blue-900 mb-6">Criar Novo Equipamento</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold mb-4">Nenhum dispositivo disponível</h3>
          <p className="text-gray-600">No momento, não há dispositivos disponíveis para serem cadastrados em um novo equipamento.</p>
          <button
            onClick={() => navigate('/dashboard/equipments')}
            className="mt-6 bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none"
          >
            Voltar para Equipamentos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Criar Novo Equipamento</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Equipamento</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              name="model"
              id="model"
              value={formData.model}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="N/A"
            />
          </div>
          <div>
            <label htmlFor="worked_hours" className="block text-sm font-medium text-gray-700">Horas Iniciais</label>
            <input
              type="number"
              name="worked_hours"
              id="worked_hours"
              value={formData.worked_hours || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 0.0"
            />
          </div>
          <div>
            <label htmlFor="device" className="block text-sm font-medium text-gray-700">Dispositivo</label>
            <select
              name="device"
              id="device"
              value={formData.device}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Selecione um dispositivo</option>
              {devices.map((device) => (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_id} - {device.model}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <button
            type="submit"
            className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentCreate;
