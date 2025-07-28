import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaSave, FaTractor, FaCog, FaIdCard, FaClock } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import LoadPage from '../../components/LoadPage';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EquipmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [equipment, setEquipment] = useState({
    name: '',
    model: '',
    device: '',
    initial_hour_machine: '',
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
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
        navigate('/dashboard/equipments');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!equipment.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (equipment.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!equipment.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }
    
    if (!equipment.initial_hour_machine || equipment.initial_hour_machine < 0) {
      newErrors.initial_hour_machine = 'Hora inicial deve ser um número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEquipment({ ...equipment, [name]: value });
    
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
    
    try {
      setSaving(true);
      const payload = {
        name: equipment.name.trim(),
        model: equipment.model.trim(),
        initial_hour_machine: parseFloat(equipment.initial_hour_machine) || 0,
      };

      await api.patch(`/equipments/${id}/`, payload);
      toast.success('Equipamento atualizado com sucesso!');
      navigate('/dashboard/equipments');
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      toast.error(`Falha ao atualizar equipamento: ${error.response?.data?.detail || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}> 
            <FaEdit className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              Editar Equipamento
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 truncate`}>
              Device ID: {equipment.device} • Atualize as informações do equipamento
            </p>
          </div>
        </div>
        {/* Botão de voltar igual exemplo do header */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/equipments')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-gray-500`}
          >
            <FaArrowLeft className="text-sm" />
            <span className="hidden sm:inline">Voltar para Equipamentos</span>
            <span className="sm:hidden">Voltar</span>
          </button>
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
                Informações do Equipamento
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
                  value={equipment.name}
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
                  value={equipment.model}
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

              {/* Device (read-only) */}
              <div className="space-y-2">
                <label htmlFor="device" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaIdCard className="text-xs" />
                  ID do Device
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="device"
                    id="device"
                    value={equipment.device}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-600 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-600'} cursor-not-allowed`}
                    readOnly
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                      Somente leitura
                    </span>
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  O ID do device não pode ser alterado após a criação
                </p>
              </div>

              {/* Hora Inicial */}
              <div className="space-y-2">
                <label htmlFor="initial_hour_machine" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FaClock className="text-xs" />
                  Hora Inicial da Máquina
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="initial_hour_machine"
                  id="initial_hour_machine"
                  value={equipment.initial_hour_machine || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    errors.initial_hour_machine 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : `${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'}`
                  } focus:ring-2 focus:ring-opacity-50`}
                  placeholder="0.0"
                  required
                />
                {errors.initial_hour_machine && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.initial_hour_machine}
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
              {/* Botão de voltar removido do rodapé, permanece apenas no header */}
              
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
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaSave className="text-sm" />
                    Atualizar Equipamento
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

export default EquipmentEdit;
