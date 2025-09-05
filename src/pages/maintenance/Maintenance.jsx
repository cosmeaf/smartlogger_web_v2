import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/apiService';
import LoadPage from '../../components/LoadPage';
import { FaTrash, FaPlus, FaEdit, FaArrowLeft, FaWrench, FaCog, FaClock, FaFileAlt, FaSpinner, FaRedo, FaHistory, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

const Maintenance = () => {
  const { equipmentId } = useParams();
  const { isDarkMode } = useTheme();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [resetLogs, setResetLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipmentName, setEquipmentName] = useState('');
  const [editingObs, setEditingObs] = useState(null);
  const [obsValue, setObsValue] = useState('');
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
      Swal.fire({
        title: 'Erro ao Carregar!',
        text: 'Não foi possível buscar os registros de manutenção. Tente novamente.',
        icon: 'error',
        confirmButtonColor: isDarkMode ? '#dc2626' : '#ef4444',
        background: isDarkMode ? '#111827' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827',
        iconColor: isDarkMode ? '#ef4444' : '#dc2626',
        width: '420px',
        padding: '2rem',
        customClass: {
          popup: isDarkMode ? 'dark-error-popup' : 'light-error-popup',
          title: isDarkMode ? 'dark-error-title' : 'light-error-title',
          htmlContainer: isDarkMode ? 'dark-error-text' : 'light-error-text',
          confirmButton: 'custom-error-btn'
        },
        didOpen: () => {
          const style = document.createElement('style');
          style.innerHTML = `
            .dark-error-popup {
              border: 2px solid #ef4444 !important;
              box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.3) !important;
              border-radius: 16px !important;
              background: linear-gradient(135deg, #111827, #1f2937) !important;
            }
            .light-error-popup {
              box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.3) !important;
              border-radius: 16px !important;
              border: 2px solid #ef4444 !important;
              background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
            }
            .dark-error-title {
              color: #ef4444 !important;
              font-size: 1.5rem !important;
              font-weight: 700 !important;
            }
            .light-error-title {
              color: #dc2626 !important;
              font-size: 1.5rem !important;
              font-weight: 700 !important;
            }
            .dark-error-text {
              color: #d1d5db !important;
              font-size: 1rem !important;
            }
            .light-error-text {
              color: #4b5563 !important;
              font-size: 1rem !important;
            }
            .custom-error-btn {
              background: ${isDarkMode ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #ef4444, #dc2626)'} !important;
              border: ${isDarkMode ? '2px solid #b91c1c' : '2px solid #dc2626'} !important;
              color: #ffffff !important;
              box-shadow: 0 8px 20px ${isDarkMode ? 'rgba(220, 38, 38, 0.5)' : 'rgba(239, 68, 68, 0.4)'} !important;
              transition: all 0.3s ease !important;
              font-weight: 600 !important;
              font-size: 1rem !important;
              padding: 12px 24px !important;
              border-radius: 8px !important;
            }
            .custom-error-btn:hover {
              background: ${isDarkMode ? 'linear-gradient(135deg, #b91c1c, #991b1b)' : 'linear-gradient(135deg, #dc2626, #b91c1c)'} !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 12px 25px ${isDarkMode ? 'rgba(220, 38, 38, 0.7)' : 'rgba(239, 68, 68, 0.5)'} !important;
            }
          `;
          document.head.appendChild(style);
        }
      });
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
    const maintenance = maintenanceRecords.find(m => m.id === maintenanceId);
    
    Swal.fire({
      title: 'Você tem certeza?',
      text: `Deseja realmente zerar as horas da peça "${maintenance?.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isDarkMode ? '#d97706' : '#f59e0b',
      cancelButtonColor: isDarkMode ? '#374151' : '#64748b',
      confirmButtonText: 'Sim, zerar horas !',
      cancelButtonText: 'Cancelar',
      background: isDarkMode ? '#111827' : '#ffffff',
      color: isDarkMode ? '#f9fafb' : '#111827',
      iconColor: isDarkMode ? '#f59e0b' : '#d97706',
      width: '420px',
      padding: '2rem',
      customClass: {
        popup: isDarkMode ? 'dark-popup' : 'light-popup',
        title: isDarkMode ? 'dark-title' : 'light-title',
        htmlContainer: isDarkMode ? 'dark-text' : 'light-text',
        confirmButton: 'custom-yellow-btn',
        cancelButton: 'custom-cancel-btn'
      },
      didOpen: () => {
        const style = document.createElement('style');
        style.innerHTML = `
          .dark-popup {
            border: 2px solid #374151 !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
            border-radius: 16px !important;
          }
          .light-popup {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
            border-radius: 16px !important;
            border: 2px solid #e5e7eb !important;
          }
          .dark-title {
            color: #f9fafb !important;
            font-size: 1.5rem !important;
            font-weight: 600 !important;
          }
          .light-title {
            color: #111827 !important;
            font-size: 1.5rem !important;
            font-weight: 600 !important;
          }
          .dark-text {
            color: #d1d5db !important;
            font-size: 1.1rem !important;
          }
          .light-text {
            color: #4b5563 !important;
            font-size: 1.1rem !important;
          }
          .custom-yellow-btn {
            background: ${isDarkMode ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #f59e0b, #d97706)'} !important;
            border: ${isDarkMode ? '2px solid #b45309' : '2px solid #d97706'} !important;
            color: #ffffff !important;
            box-shadow: 0 8px 20px ${isDarkMode ? 'rgba(217, 119, 6, 0.5)' : 'rgba(245, 158, 11, 0.4)'} !important;
            transition: all 0.3s ease !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
          }
          .custom-yellow-btn:hover {
            background: ${isDarkMode ? 'linear-gradient(135deg, #b45309, #92400e)' : 'linear-gradient(135deg, #d97706, #b45309)'} !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 25px ${isDarkMode ? 'rgba(217, 119, 6, 0.7)' : 'rgba(245, 158, 11, 0.5)'} !important;
          }
          .custom-cancel-btn {
            background: ${isDarkMode ? 'linear-gradient(135deg, #374151, #4b5563)' : 'linear-gradient(135deg, #64748b, #475569)'} !important;
            border: ${isDarkMode ? '2px solid #4b5563' : '2px solid #475569'} !important;
            color: #ffffff !important;
            box-shadow: 0 8px 20px ${isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(100, 116, 139, 0.4)'} !important;
            transition: all 0.3s ease !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
          }
          .custom-cancel-btn:hover {
            background: ${isDarkMode ? 'linear-gradient(135deg, #4b5563, #6b7280)' : 'linear-gradient(135deg, #475569, #334155)'} !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 25px ${isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(100, 116, 139, 0.5)'} !important;
          }
        `;
        document.head.appendChild(style);
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiService.post(`/maintenances/${maintenanceId}/reset_hours/`);
          const updatedRecords = maintenanceRecords.map((maintenance) =>
            maintenance.id === maintenanceId
              ? { ...maintenance, worked_hours: 0, remaining_hours: maintenance.alarm_hours }
              : maintenance
          );
          setMaintenanceRecords(updatedRecords);
          
          // Mostra notificação de sucesso
          Swal.fire({
            title: 'Horas Zeradas!',
            text: 'As horas da peça foram zeradas com sucesso.',
            icon: 'success',
            timer: 2500,
            timerProgressBar: true,
            showConfirmButton: false,
            background: isDarkMode ? '#111827' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827',
            iconColor: isDarkMode ? '#f59e0b' : '#d97706',
            width: '400px',
            padding: '2rem',
            customClass: {
              popup: isDarkMode ? 'dark-yellow-popup' : 'light-yellow-popup',
              title: isDarkMode ? 'dark-yellow-title' : 'light-yellow-title',
              htmlContainer: isDarkMode ? 'dark-yellow-text' : 'light-yellow-text'
            },
            didOpen: () => {
              const style = document.createElement('style');
              style.innerHTML = `
                .dark-yellow-popup {
                  border: 2px solid #f59e0b !important;
                  box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.3) !important;
                  border-radius: 16px !important;
                  background: linear-gradient(135deg, #111827, #1f2937) !important;
                }
                .light-yellow-popup {
                  box-shadow: 0 25px 50px -12px rgba(217, 119, 6, 0.3) !important;
                  border-radius: 16px !important;
                  border: 2px solid #f59e0b !important;
                  background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
                }
                .dark-yellow-title {
                  color: #f59e0b !important;
                  font-size: 1.5rem !important;
                  font-weight: 700 !important;
                }
                .light-yellow-title {
                  color: #d97706 !important;
                  font-size: 1.5rem !important;
                  font-weight: 700 !important;
                }
                .dark-yellow-text {
                  color: #d1d5db !important;
                  font-size: 1rem !important;
                }
                .light-yellow-text {
                  color: #4b5563 !important;
                  font-size: 1rem !important;
                }
              `;
              document.head.appendChild(style);
            }
          });
        } catch (error) {
          console.error('Erro ao zerar horas de uso da peça:', error.message);
          Swal.fire({
            title: 'Erro!',
            text: 'Não foi possível zerar as horas da peça. Tente novamente.',
            icon: 'error',
            confirmButtonColor: isDarkMode ? '#dc2626' : '#ef4444',
            background: isDarkMode ? '#111827' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827',
            iconColor: isDarkMode ? '#ef4444' : '#dc2626'
          });
        }
      }
    });
  };

  const handleEditObs = (maintenance) => {
    setEditingObs(maintenance);
    setObsValue(maintenance.obs || '');
  };

  const handleSaveObs = async () => {
    try {
      await apiService.patch(`/maintenances/${editingObs.id}/`, {
        obs: obsValue
      });
      
      // Atualiza o estado local
      const updatedRecords = maintenanceRecords.map((maintenance) =>
        maintenance.id === editingObs.id
          ? { ...maintenance, obs: obsValue }
          : maintenance
      );
      setMaintenanceRecords(updatedRecords);
      
      // Fecha o modal
      setEditingObs(null);
      setObsValue('');
      
      // Mostra notificação de sucesso
      toast.success('Observação atualizada com sucesso!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? "dark" : "light"
      });
      
    } catch (error) {
      console.error('Erro ao atualizar observação:', error.message);
      toast.error('Erro ao atualizar observação. Tente novamente.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? "dark" : "light"
      });
    }
  };

  const handleCancelEditObs = () => {
    setEditingObs(null);
    setObsValue('');
  };

  const handleToggleOS = async (maintenanceId, currentOSStatus) => {
    try {
      await apiService.patch(`/maintenances/${maintenanceId}/`, {
        os: !currentOSStatus
      });
      
      // Atualiza o estado local
      const updatedRecords = maintenanceRecords.map((maintenance) =>
        maintenance.id === maintenanceId
          ? { ...maintenance, os: !currentOSStatus }
          : maintenance
      );
      setMaintenanceRecords(updatedRecords);
      
      // Mostra notificação de sucesso
      toast.success(`O.S. ${!currentOSStatus ? 'ativada' : 'desativada'} com sucesso!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? "dark" : "light"
      });
      
    } catch (error) {
      console.error('Erro ao atualizar O.S.:', error.message);
      toast.error('Erro ao atualizar O.S. Tente novamente.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? "dark" : "light"
      });
    }
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <FaWrench className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              Manutenções
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 truncate`}>
              Equipamento: {equipmentName} • Gerencione as manutenções
            </p>
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link
            to="/dashboard/equipments"
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-gray-500`}
          >
            <FaArrowLeft className="text-sm" />
            <span className="hidden sm:inline">Voltar para Equipamentos</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
          
          <Link
            to={`/dashboard/maintenance/${equipmentId}/create`}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isDarkMode 
                ? 'bg-blue-700 hover:bg-blue-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <FaPlus className="text-sm" />
            <span className="hidden sm:inline">Nova Manutenção</span>
            <span className="sm:hidden">Novo</span>
          </Link>
        </div>
      </div>

      {/* Tabela de Manutenções */}
      <div className="mb-6 md:mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
          {/* Header da Tabela */}
          <div className={`px-4 md:px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <FaCog className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Registros de Manutenção
              </h2>
            </div>
          </div>

          {/* Tabela Responsiva */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <tr>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-2">
                      <FaWrench className="text-xs" />
                      Nome da Peça
                    </div>
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} hidden md:table-cell`}>
                    O.S.
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} hidden lg:table-cell`}>
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-xs" />
                      Relatório
                    </div>
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} hidden sm:table-cell`}>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-xs" />
                      Horas Trabalhadas
                    </div>
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} hidden md:table-cell`}>
                    Horas Alarme
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} hidden sm:table-cell`}>
                    Horas Restantes
                  </th>
                  <th className={`text-left py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} hidden lg:table-cell`}>
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-xs" />
                      Observações
                    </div>
                  </th>
                  <th className={`text-right py-3 px-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {maintenanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 px-4 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FaWrench className={`text-3xl ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Nenhuma manutenção encontrada
                        </p>
                        <Link
                          to={`/dashboard/maintenance/${equipmentId}/create`}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-blue-700 hover:bg-blue-600' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white hover:shadow-lg`}
                        >
                          <FaPlus className="text-sm" />
                          Criar primeira manutenção
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  maintenanceRecords.map((maintenance) => (
                    <tr key={maintenance.id} className={`border-b group ${
                      isDarkMode 
                        ? 'border-gray-700 hover:bg-gray-750' 
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors`}>
                      {/* Nome da Peça - sempre visível */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{maintenance.name}</span>
                          {/* Informações extras no mobile */}
                          <div className="sm:hidden mt-1 space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <FaClock className="text-xs" />
                              {maintenance.worked_hours}h / {maintenance.alarm_hours}h
                            </div>
                            <div className="text-xs">
                              Restante: {maintenance.remaining_hours}h
                            </div>
                            <div className="flex items-center gap-2 text-xs mt-2">
                              <span className="font-medium">O.S.:</span>
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={maintenance.os}
                                  onChange={() => handleToggleOS(maintenance.id, maintenance.os)}
                                  className={`w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200 ${
                                    isDarkMode 
                                      ? 'bg-gray-700 border-gray-600' 
                                      : 'bg-white border-gray-300'
                                  }`}
                                />
                                <span className={`text-xs ${maintenance.os ? 'text-green-500' : 'text-gray-500'}`}>
                                  {maintenance.os ? 'Ativo' : 'Inativo'}
                                </span>
                              </label>
                            </div>
                            <div className="flex items-center gap-2 text-xs mt-2">
                              <span className="font-medium">Obs:</span>
                              <span 
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded flex-1"
                                title="Toque duplo para editar"
                                onDoubleClick={() => handleEditObs(maintenance)}
                              >
                                {maintenance.obs || 'N/A'}
                              </span>
                              <button
                                onClick={() => handleEditObs(maintenance)}
                                className={`p-1 rounded text-xs ${
                                  isDarkMode 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                }`}
                                title="Editar observação"
                              >
                                <FaPencilAlt />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* O.S. - oculto no mobile */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <input
                          type="checkbox"
                          checked={maintenance.os}
                          onChange={() => handleToggleOS(maintenance.id, maintenance.os)}
                          className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-white border-gray-300'
                          }`}
                          title={`${maintenance.os ? 'Desativar' : 'Ativar'} O.S.`}
                        />
                      </td>
                      
                      {/* Relatório - oculto no mobile e tablet */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <button className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isDarkMode 
                            ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                        }`}>
                          <div className="flex items-center gap-1">
                            <FaFileAlt className="text-xs" />
                            Relatório
                          </div>
                        </button>
                      </td>
                      
                      {/* Horas Trabalhadas - oculto no mobile */}
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span>{maintenance.worked_hours}h</span>
                      </td>
                      
                      {/* Horas Alarme - oculto no mobile */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span>{maintenance.alarm_hours}h</span>
                      </td>
                      
                      {/* Horas Restantes - oculto no mobile */}
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className={`${
                          maintenance.remaining_hours <= 0 
                            ? 'text-red-500 font-bold' 
                            : maintenance.remaining_hours <= 10 
                              ? 'text-yellow-500 font-bold' 
                              : ''
                        }`}>
                          {maintenance.remaining_hours}h
                        </span>
                      </td>
                      
                      {/* Observações - oculto no mobile e tablet */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-sm max-w-xs truncate block cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors" 
                            title={maintenance.obs || 'Clique duplo para editar'}
                            onDoubleClick={() => handleEditObs(maintenance)}
                          >
                            {maintenance.obs || 'N/A'}
                          </span>
                          <button
                            onClick={() => handleEditObs(maintenance)}
                            className={`p-1 rounded transition-all duration-200 ${
                              isDarkMode 
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            } opacity-0 group-hover:opacity-100`}
                            title="Editar observação"
                          >
                            <FaPencilAlt className="text-xs" />
                          </button>
                        </div>
                      </td>
                      
                      {/* Ações */}
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleResetHours(maintenance.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              isDarkMode 
                                ? 'bg-amber-700 hover:bg-amber-600 text-white shadow-md hover:shadow-lg' 
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-800 shadow-sm hover:shadow-md'
                            } transform hover:scale-105`}
                            title="Zerar horas da peça"
                          >
                            Zerar
                          </button>
                          <Link
                            to={`/dashboard/maintenance/${maintenance.id}/edit`}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode 
                                ? 'bg-blue-700 hover:bg-blue-600 text-white shadow-md hover:shadow-lg' 
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-sm hover:shadow-md'
                            } transform hover:scale-105 group`}
                            title="Editar manutenção"
                          >
                            <FaPencilAlt className="text-sm group-hover:rotate-12 transition-transform duration-200" />
                          </Link>
                          <button
                            onClick={() => {}}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode 
                                ? 'bg-red-700 hover:bg-red-600 text-white shadow-md hover:shadow-lg' 
                                : 'bg-red-100 hover:bg-red-200 text-red-700 shadow-sm hover:shadow-md'
                            } transform hover:scale-105 group`}
                            title="Excluir manutenção"
                          >
                            <FaTrashAlt className="text-sm group-hover:animate-pulse" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Logs de Reset */}
      <div className="mb-8">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
          {/* Header dos Logs */}
          <div className={`px-4 md:px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <FaHistory className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Histórico de Resets
              </h2>
            </div>
          </div>

          {/* Lista de Logs */}
          <div className="p-4 md:p-6">
            {resetLogs.length === 0 ? (
              <div className="text-center py-8">
                <FaHistory className={`text-4xl ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mb-4 mx-auto`} />
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Nenhum log de reset encontrado
                </p>
              </div>
            ) : (
              <>
                {/* Tabela compacta e responsiva */}
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className={`min-w-full text-xs sm:text-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}> 
                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-900'} text-white`}>
                      <tr>
                        <th className="text-left py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap">Data Reset</th>
                        <th className="text-left py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap">Horas</th>
                        <th className="text-left py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap hidden xs:table-cell">Manutenção</th>
                        <th className="text-left py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap">Obs</th>
                      </tr>
                    </thead>
                    <tbody className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {resetLogs.map((log) => (
                        <tr key={log.id} className={`border-b ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                            : 'bg-gray-100 border-gray-300 hover:bg-gray-50'
                        } transition-colors`}>
                          <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap">
                            {new Date(log.reset_date).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap">{log.equipment_worked_hours} h</td>
                          <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap hidden xs:table-cell">{log.maintenance}</td>
                          <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap">{log.obs || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição de Observações */}
      {editingObs && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelEditObs();
            }
          }}
        >
          <div className={`${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-xl shadow-2xl border max-w-md w-full`}>
            {/* Header do Modal */}
            <div className={`px-6 py-4 border-b ${
              isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <FaPencilAlt className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Editar Observação
                </h3>
              </div>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Peça: {editingObs.name}
              </p>
            </div>

            {/* Conteúdo do Modal */}
            <div className="px-6 py-4">
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Observação
              </label>
              <textarea
                value={obsValue}
                onChange={(e) => setObsValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleSaveObs();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancelEditObs();
                  }
                }}
                className={`w-full px-3 py-2 rounded-lg border resize-none ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                placeholder="Digite a observação..."
                rows={4}
                autoFocus
              />
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Dica: Ctrl+Enter para salvar, Esc para cancelar
              </p>
            </div>

            {/* Footer do Modal */}
            <div className={`px-6 py-4 border-t ${
              isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            } flex gap-3 justify-end`}>
              <button
                onClick={handleCancelEditObs}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveObs}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-blue-700 hover:bg-blue-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:shadow-lg transform hover:scale-105`}
              >
                Salvar Observação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
