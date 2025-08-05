import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaSave, FaTractor, FaCog, FaIdCard, FaClock, FaSpinner, FaMicrochip } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import LoadPage from '../../components/LoadPage';
import 'react-toastify/dist/ReactToastify.css';

const EquipmentCreate = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    worked_hours: '',
    device: '',
  });
  const [devices, setDevices] = useState([]);

  // Buscar dispositivos disponíveis
  const fetchAvailableDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/devices/', { params: { available: true } });
      setDevices(response.data);
    } catch (error) {
      console.error('Erro ao buscar dispositivos disponíveis:', error.message);
      toast.error('Falha ao buscar dispositivos disponíveis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDevices();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }
    
    if (!formData.device) {
      newErrors.device = 'Dispositivo é obrigatório';
    }
    
    if (!formData.worked_hours || formData.worked_hours < 0) {
      newErrors.worked_hours = 'Hora inicial deve ser um número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpar erro específico quando o usuário começar a digitar
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Função para criar o equipamento
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      model: formData.model.trim(),
      worked_hours: parseFloat(formData.worked_hours) || 0,
      device: formData.device,
    };

    try {
      setSaving(true);
      console.log('Enviando dados para a API:', payload);
      await api.post('/equipments/', payload);
      toast.success('Equipamento criado com sucesso!');
      navigate('/dashboard/equipments');
    } catch (error) {
      console.error('Erro ao criar equipamento:', error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || 'Falha ao criar equipamento'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadPage />;
  }

  if (!loading && devices.length === 0) {
    return (
      <div className="p-6 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
              <FaPlus className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Criar Novo Equipamento
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Adicione um novo equipamento ao sistema
              </p>
            </div>
          </div>
        </div>

        {/* No devices available message */}
        <div className="max-w-4xl mx-auto">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-8 text-center`}>
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-100'} mb-4`}>
              <FaMicrochip className={`text-2xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Nenhum dispositivo disponível
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              No momento, não há dispositivos disponíveis para serem cadastrados em um novo equipamento.
            </p>
            <button
              onClick={() => navigate('/dashboard/equipments')}
              className={`flex items-center gap-2 mx-auto px-6 py-3 rounded-lg transition-all duration-200 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <FaArrowLeft className="text-sm" />
              Voltar para Equipamentos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <FaPlus className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Criar Novo Equipamento
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Adicione um novo equipamento ao sistema
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
          {/* Header do Formulário */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <FaTractor className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Informações do Novo Equipamento
              </h2>
            </div>
          </div>

          {/* Conteúdo do Formulário */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="space-y-2">
                <label htmlFor="name" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaTractor className="text-xs" />
                  Nome do Equipamento
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    errors.name 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : `${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`
                  } focus:ring-2 focus:ring-opacity-50`}
                  placeholder="Digite o nome do equipamento"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <label htmlFor="model" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaCog className="text-xs" />
                  Modelo/Local de Trabalho
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  id="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    errors.model 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : `${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`
                  } focus:ring-2 focus:ring-opacity-50`}
                  placeholder="Digite o modelo ou local de trabalho"
                  required
                />
                {errors.model && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.model}
                  </p>
                )}
              </div>

              {/* Device */}
              <div className="space-y-2">
                <label htmlFor="device" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaIdCard className="text-xs" />
                  Dispositivo
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="device"
                  id="device"
                  value={formData.device}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    errors.device 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : `${isDarkMode ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`
                  } focus:ring-2 focus:ring-opacity-50`}
                  required
                >
                  <option value="">Selecione um dispositivo</option>
                  {devices.map((device) => (
                    <option key={device.device_id} value={device.device_id}>
                      {device.device_id} - {device.model}
                    </option>
                  ))}
                </select>
                {errors.device && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.device}
                  </p>
                )}
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Selecione um dispositivo disponível para associar ao equipamento
                </p>
              </div>

              {/* Horas Iniciais */}
              <div className="space-y-2">
                <label htmlFor="worked_hours" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaClock className="text-xs" />
                  Horas Iniciais
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="worked_hours"
                  id="worked_hours"
                  value={formData.worked_hours}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    errors.worked_hours 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : `${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`
                  } focus:ring-2 focus:ring-opacity-50`}
                  placeholder="0.0"
                  required
                />
                {errors.worked_hours && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.worked_hours}
                  </p>
                )}
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Horário inicial registrado no horímetro da máquina (em horas)
                </p>
              </div>
            </div>
          </div>

          {/* Footer do Formulário */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'} flex justify-between items-center`}>
            <div className="flex items-center text-sm">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                * Campos obrigatórios
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/equipments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-gray-500`}
                disabled={saving}
              >
                <FaArrowLeft className="text-sm" />
                Voltar
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-200 ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : `${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} hover:shadow-lg`
                } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Criando...
                  </>
                ) : (
                  <>
                    <FaSave className="text-sm" />
                    Criar Equipamento
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentCreate;
