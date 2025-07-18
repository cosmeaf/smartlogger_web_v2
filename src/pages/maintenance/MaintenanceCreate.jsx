import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaSave, FaWrench, FaCog, FaClock, FaFileAlt, FaSpinner } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/apiService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MaintenanceCreate = () => {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    initial_hour_maintenance: '',
    alarm_hours: '',
    obs: '',
    os: false
  });

  const [equipment, setEquipment] = useState(null);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      const { data } = await apiService.get(`/equipments/${equipmentId}/`);
      setEquipment(data);
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error.message);
      toast.error('Falha ao buscar equipamento.');
      navigate('/dashboard/equipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentDetails();
  }, [equipmentId]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da peça é obrigatório';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.initial_hour_maintenance || formData.initial_hour_maintenance < 0) {
      newErrors.initial_hour_maintenance = 'Hora inicial deve ser um número positivo';
    }
    
    if (!formData.alarm_hours || formData.alarm_hours <= 0) {
      newErrors.alarm_hours = 'Horas para alarme deve ser um número positivo';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      initial_hour_maintenance: parseFloat(formData.initial_hour_maintenance),
      alarm_hours: parseFloat(formData.alarm_hours),
      obs: formData.obs.trim(),
      os: formData.os,
      equipment: parseInt(equipmentId),
    };

    try {
      setSaving(true);
      await apiService.post('/maintenances/', payload);
      toast.success('Manutenção criada com sucesso!');
      navigate(`/dashboard/maintenance/${equipmentId}`);
    } catch (error) {
      console.error('Erro ao criar manutenção:', error);
      toast.error(`Falha ao criar manutenção: ${error.response?.data?.detail || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className={`animate-spin text-4xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-4 mx-auto`} />
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando equipamento...</p>
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
              Nova Manutenção
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Equipamento: {equipment?.name} • Adicione uma nova manutenção
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
              <FaWrench className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Informações da Manutenção
              </h2>
            </div>
          </div>

          {/* Conteúdo do Formulário */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nome da Peça */}
              <div className="space-y-2">
                <label htmlFor="name" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaWrench className="text-xs" />
                  Nome da Peça
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
                  placeholder="Digite o nome da peça"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              {/* Horas de Manutenção Inicial */}
              <div className="space-y-2">
                <label htmlFor="initial_hour_maintenance" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaClock className="text-xs" />
                  Horas de Manutenção Inicial
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="initial_hour_maintenance"
                  id="initial_hour_maintenance"
                  value={formData.initial_hour_maintenance}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    errors.initial_hour_maintenance 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : `${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`
                  } focus:ring-2 focus:ring-opacity-50`}
                  placeholder="0.0"
                  required
                />
                {errors.initial_hour_maintenance && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.initial_hour_maintenance}
                  </p>
                )}
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Hora inicial da peça quando instalada (em horas)
                </p>
              </div>

              {/* Horas para Alarme */}
              <div className="space-y-2">
                <label htmlFor="alarm_hours" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaCog className="text-xs" />
                  Horas para Alarme
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="alarm_hours"
                  id="alarm_hours"
                  value={formData.alarm_hours}
                  onChange={handleChange}
                  min="1"
                  step="0.1"
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    errors.alarm_hours 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : `${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`
                  } focus:ring-2 focus:ring-opacity-50`}
                  placeholder="100.0"
                  required
                />
                {errors.alarm_hours && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.alarm_hours}
                  </p>
                )}
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Número de horas para disparar o alarme de manutenção
                </p>
              </div>

              {/* Observações */}
              <div className="lg:col-span-2 space-y-2">
                <label htmlFor="obs" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaFileAlt className="text-xs" />
                  Observações
                </label>
                <textarea
                  name="obs"
                  id="obs"
                  value={formData.obs}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                  } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                  placeholder="Adicione observações sobre a manutenção (opcional)"
                />
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Informações adicionais sobre a peça ou procedimento de manutenção
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
              <Link
                to={`/dashboard/maintenance/${equipmentId}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-gray-500`}
                disabled={saving}
              >
                <FaArrowLeft className="text-sm" />
                Voltar
              </Link>
              
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
                    Criar Manutenção
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

export default MaintenanceCreate;
