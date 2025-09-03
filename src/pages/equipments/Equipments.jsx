import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaTools, FaEye, FaPlus, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import api from '../../services/api';
import LoadPage from '../../components/LoadPage';

// Hook personalizado para detectar zoom da tela
const useZoomLevel = () => {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const updateZoomLevel = () => {
      // Detecta zoom através da diferença entre devicePixelRatio e zoom CSS
      const zoom = window.devicePixelRatio || 1;
      setZoomLevel(zoom);
    };

    // Atualiza zoom inicial
    updateZoomLevel();

    // Listener para mudanças de zoom
    const mediaQuery = window.matchMedia('(resolution: 1dppx)');
    mediaQuery.addEventListener('change', updateZoomLevel);

    // Fallback para resize
    window.addEventListener('resize', updateZoomLevel);

    return () => {
      mediaQuery.removeEventListener('change', updateZoomLevel);
      window.removeEventListener('resize', updateZoomLevel);
    };
  }, []);

  return zoomLevel;
};

const Equipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState('asc'); // Direção de ordenação
  const [sortBy, setSortBy] = useState('name'); // Coluna de ordenação
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100); // Novas opções de paginação
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [temperatureFilter, setTemperatureFilter] = useState('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos
  const [openDropdownId, setOpenDropdownId] = useState(null); // Estado para controlar dropdown de ações
  const [openSortDropdown, setOpenSortDropdown] = useState(null); // Estado para controlar dropdown de sorting
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
  const [tooltipTimeoutId, setTooltipTimeoutId] = useState(null);
  const { isDarkMode } = useTheme();
  const { isMobile, isTablet, isDesktop, getGridCols, getResponsiveClasses } = useDevice();
  const zoomLevel = useZoomLevel(); // Hook para detectar zoom

  /**
   * ✅ Buscar Equipamentos com Retry
   */
  const fetchDataWithRetry = async (retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const [equipmentsRes, devicesRes, maintenancesRes] = await Promise.all([
          api.get('/equipments/'),
          api.get('/devices/'),
          api.get('/maintenances/')
        ]);
        setEquipments(equipmentsRes.data);
        setDevices(devicesRes.data);
        setMaintenances(maintenancesRes.data);
        setLoading(false);
        return; // Sucesso, sair da função
      } catch (error) {
        console.error(`Tentativa ${attempt} falhou:`, error.message);

        if (attempt === retries) {
          // Última tentativa falhou, mostrar erro
          setLoading(false);

          // Só mostrar erro se não for uma atualização automática silenciosa
          if (!autoRefresh || attempt > 1) {
            Swal.fire({
              title: 'Erro ao Carregar Dados',
              text: error.response?.data?.message || 'Não foi possível carregar os equipamentos. Verifique sua conexão e tente novamente.',
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
                    border: 2px solid #dc2626 !important;
                    box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.5) !important;
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
          }
        } else {
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
  };

  useEffect(() => {
    fetchDataWithRetry();

    // Atualiza a lista a cada intervalo configurado, apenas se a aba estiver visível e auto-refresh ativo
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && autoRefresh) {
        fetchDataWithRetry(2, 500); // Menos tentativas e delay menor para atualizações automáticas
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.relative')) {
        setOpenDropdownId(null);
      }
      if (openSortDropdown && !event.target.closest('.sort-dropdown')) {
        setOpenSortDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId, openSortDropdown]);

  // Limpar timeout do tooltip quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (tooltipTimeoutId) {
        clearTimeout(tooltipTimeoutId);
      }
    };
  }, [tooltipTimeoutId]);

  // Funções para controlar o tooltip de forma mais precisa
  const showTooltip = (content, x, y) => {
    // Limpar timeout anterior se existir
    if (tooltipTimeoutId) {
      clearTimeout(tooltipTimeoutId);
    }
    
    setTooltip({
      visible: true,
      content,
      x,
      y
    });
  };

  const hideTooltip = () => {
    // Limpar timeout anterior se existir
    if (tooltipTimeoutId) {
      clearTimeout(tooltipTimeoutId);
    }
    
    // Usar timeout para dar uma pequena tolerância
    const timeoutId = setTimeout(() => {
      setTooltip({ visible: false, content: '', x: 0, y: 0 });
    }, 150);
    
    setTooltipTimeoutId(timeoutId);
  };

  const cancelTooltipHide = () => {
    if (tooltipTimeoutId) {
      clearTimeout(tooltipTimeoutId);
      setTooltipTimeoutId(null);
    }
  };

  /**
   * ✅ Modal de Exclusão
   */
  const openDeleteModal = (equipmentId) => {
    if (!equipmentId) {
      Swal.fire({
        title: 'Erro!',
        text: 'ID inválido.',
        icon: 'error',
        confirmButtonColor: isDarkMode ? '#dc2626' : '#ef4444',
        background: isDarkMode ? '#111827' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827',
        iconColor: isDarkMode ? '#ef4444' : '#dc2626'
      });
      return;
    }

    const equipment = equipments.find(eq => eq.id === equipmentId);

    Swal.fire({
      title: 'Você tem certeza?',
      text: `Deseja realmente deletar o equipamento "${equipment?.name || 'N/A'}"? Esta ação não pode ser desfeita!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isDarkMode ? '#dc2626' : '#ef4444',
      cancelButtonColor: isDarkMode ? '#374151' : '#64748b',
      confirmButtonText: 'Sim, deletar!',
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
        confirmButton: 'custom-delete-btn',
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
          .custom-delete-btn {
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
          .custom-delete-btn:hover {
            background: ${isDarkMode ? 'linear-gradient(135deg, #b91c1c, #991b1b)' : 'linear-gradient(135deg, #dc2626, #b91c1c)'} !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 25px ${isDarkMode ? 'rgba(220, 38, 38, 0.7)' : 'rgba(239, 68, 68, 0.5)'} !important;
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
          await api.delete(`/equipments/${equipmentId}/`);

          // Modal de sucesso
          Swal.fire({
            title: 'Equipamento Deletado!',
            text: 'O equipamento foi removido com sucesso.',
            icon: 'success',
            timer: 2500,
            timerProgressBar: true,
            showConfirmButton: false,
            background: isDarkMode ? '#111827' : '#ffffff',
            color: isDarkMode ? '#f9fafb' : '#111827',
            iconColor: isDarkMode ? '#10b981' : '#059669',
            width: '400px',
            padding: '2rem',
            customClass: {
              popup: isDarkMode ? 'dark-success-popup' : 'light-success-popup',
              title: isDarkMode ? 'dark-success-title' : 'light-success-title',
              htmlContainer: isDarkMode ? 'dark-success-text' : 'light-success-text'
            },
            didOpen: () => {
              const style = document.createElement('style');
              style.innerHTML = `
                .dark-success-popup {
                  border: 2px solid #10b981 !important;
                  box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.3) !important;
                  border-radius: 16px !important;
                  background: linear-gradient(135deg, #111827, #1f2937) !important;
                }
                .light-success-popup {
                  box-shadow: 0 25px 50px -12px rgba(5, 150, 105, 0.3) !important;
                  border-radius: 16px !important;
                  border: 2px solid #10b981 !important;
                  background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
                }
                .dark-success-title {
                  color: #10b981 !important;
                  font-size: 1.5rem !important;
                  font-weight: 700 !important;
                }
                .light-success-title {
                  color: #059669 !important;
                  font-size: 1.5rem !important;
                  font-weight: 700 !important;
                }
                .dark-success-text {
                  color: #d1d5db !important;
                  font-size: 1rem !important;
                }
                .light-success-text {
                  color: #4b5563 !important;
                  font-size: 1rem !important;
                }
              `;
              document.head.appendChild(style);
            }
          });

          setEquipments((prevEquipments) =>
            prevEquipments.filter((equipment) => equipment.id !== equipmentId)
          );
        } catch (error) {
          console.error('Erro ao deletar equipamento:', error.response?.data || error.message);

          // Modal de erro
          Swal.fire({
            title: 'Erro ao Deletar!',
            text: `Falha ao deletar o equipamento: ${error.response?.data?.detail || 'Erro desconhecido'}`,
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
        }
      }
    });
  };

  /**
   * ✅ Modal do Mapa
   */
  const openMapModal = (equipment) => {
    if (!equipment.deviceData?.latitude || !equipment.deviceData?.longitude) {
      Swal.fire('Aviso', 'Coordenadas GPS não disponíveis para este equipamento.', 'warning');
      return;
    }
    setSelectedEquipment(equipment);
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedEquipment(null);
  };

  const openGoogleMaps = () => {
    if (selectedEquipment?.deviceData?.latitude && selectedEquipment?.deviceData?.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${selectedEquipment.deviceData.latitude},${selectedEquipment.deviceData.longitude}`,
        "_blank"
      );
    }
  };



  /**
   * ✅ Status Helper
   */
  const getMaintenanceStatus = (remaining) => {
    if (remaining < 0) return 'URGENTE';
    if (remaining < 100) return 'ATENÇÃO';
    return 'OK';
  };

  const getTemperatureStatus = (temp) => {
    if (!temp || temp > 150) return 'N/A';
    if (temp > 90) return 'ALTA';
    if (temp > 60) return 'MÉDIA';
    return 'NORMAL';
  };

  /**
   * ✅ Obter informações das manutenções vencidas
   */
  const getOverdueMaintenanceInfo = (equipmentId) => {
    const equipmentMaintenances = maintenances.filter(maintenance => 
      String(maintenance.equipment) === String(equipmentId) &&
      maintenance.remaining_hours !== undefined &&
      maintenance.remaining_hours !== null &&
      maintenance.remaining_hours < 0 &&
      maintenance.name
    );

    if (equipmentMaintenances.length === 0) return null;

    // Ordenar por urgência: mais vencidas primeiro (números mais negativos)
    const sortedMaintenances = equipmentMaintenances.sort((a, b) => a.remaining_hours - b.remaining_hours);

    const totalOverdue = sortedMaintenances.length;
    const primaryMaintenance = sortedMaintenances[0].name;
    const additionalCount = totalOverdue - 1;

    // Criar tooltip com todas as manutenções
    const allMaintenances = sortedMaintenances.map(m => m.name).join('\n• ');

    return {
      primary: primaryMaintenance,
      additionalCount,
      totalOverdue,
      tooltip: `• ${allMaintenances}`,
      sortedMaintenances
    };
  };

  /**
   * ✅ Obter informações de manutenções próximas do vencimento (atenção)
   */
  const getAttentionMaintenanceInfo = (equipmentId) => {
    const equipmentMaintenances = maintenances.filter(maintenance => 
      String(maintenance.equipment) === String(equipmentId) &&
      maintenance.remaining_hours !== undefined &&
      maintenance.remaining_hours !== null &&
      maintenance.remaining_hours >= 0 &&
      maintenance.remaining_hours < 100 &&
      maintenance.name
    );

    if (equipmentMaintenances.length === 0) return null;

    // Ordenar por urgência: menor número de horas restantes primeiro
    const sortedMaintenances = equipmentMaintenances.sort((a, b) => a.remaining_hours - b.remaining_hours);

    const totalAttention = sortedMaintenances.length;
    const primaryMaintenance = sortedMaintenances[0].name;
    const additionalCount = totalAttention - 1;

    // Criar tooltip com todas as manutenções
    const allMaintenances = sortedMaintenances.map(m => `${m.name} (${Math.round(m.remaining_hours)}h)`).join('\n• ');

    return {
      primary: primaryMaintenance,
      additionalCount,
      totalAttention,
      tooltip: `• ${allMaintenances}`,
      sortedMaintenances,
      minHours: sortedMaintenances[0].remaining_hours
    };
  };

  /**
   * ✅ Componente de Status Minimalista
   */
  const StatusComponent = ({ equipment }) => {
    const remaining = equipment.min_remaining_hours;
    const status = getMaintenanceStatus(remaining);
    
    if (status === 'URGENTE') {
      const maintenanceInfo = getOverdueMaintenanceInfo(equipment.id);
      
      if (!maintenanceInfo) {
        return (
          <div className="text-center">
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200 cursor-pointer`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const tooltipContent = `Manutenção vencida há ${Math.abs(remaining)} horas`;
                
                showTooltip(
                  tooltipContent,
                  rect.left + rect.width / 2,
                  rect.top - 10
                );
              }}
              onMouseLeave={hideTooltip}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></div>
              <span>Manutenção vencida</span>
            </div>
          </div>
        );
      }

      const displayText = isMobile 
        ? maintenanceInfo.primary.substring(0, 12) + (maintenanceInfo.primary.length > 12 ? '...' : '')
        : maintenanceInfo.primary.substring(0, 18) + (maintenanceInfo.primary.length > 18 ? '...' : '');

      return (
        <div className="text-center">
          <div 
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200 cursor-pointer`}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const tooltipContent = maintenanceInfo.additionalCount > 0 || maintenanceInfo.totalOverdue > 1
                ? `Manutenções vencidas (${maintenanceInfo.totalOverdue}):\n\n${maintenanceInfo.sortedMaintenances.map((m, index) => 
                    `${index + 1}. ${m.name} - ${Math.abs(m.remaining_hours)}h vencidas`
                  ).join('\n')}`
                : `${maintenanceInfo.primary}\nVencida há ${Math.abs(maintenanceInfo.sortedMaintenances[0].remaining_hours)}h`;
              
              showTooltip(
                tooltipContent,
                rect.left + rect.width / 2,
                rect.top - 10
              );
            }}
            onMouseLeave={hideTooltip}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></div>
            <span className="flex items-center gap-1">
              {displayText}
              {maintenanceInfo.additionalCount > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white px-1 rounded">
                  +{maintenanceInfo.additionalCount}
                </span>
              )}
            </span>
          </div>
        </div>
      );
    }
    
    if (status === 'ATENÇÃO') {
      const maintenanceInfo = getAttentionMaintenanceInfo(equipment.id);
      
      if (!maintenanceInfo) {
        return (
          <div className="text-center">
            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 cursor-pointer`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const tooltipContent = `Próxima manutenção\nFaltam ${Math.round(remaining)}h para vencer`;
                
                showTooltip(
                  tooltipContent,
                  rect.left + rect.width / 2,
                  rect.top - 10
                );
              }}
              onMouseLeave={hideTooltip}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></div>
              <span>Próxima manutenção</span>
            </div>
          </div>
        );
      }

      const displayText = isMobile 
        ? maintenanceInfo.primary.substring(0, 12) + (maintenanceInfo.primary.length > 12 ? '...' : '')
        : maintenanceInfo.primary.substring(0, 18) + (maintenanceInfo.primary.length > 18 ? '...' : '');

      return (
        <div className="text-center">
          <div 
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 cursor-pointer`}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const tooltipContent = maintenanceInfo.additionalCount > 0 || maintenanceInfo.totalAttention > 1
                ? `Próximas manutenções (${maintenanceInfo.totalAttention}):\n\n${maintenanceInfo.sortedMaintenances.map((m, index) => 
                    `${index + 1}. ${m.name}\n   ${Math.round(m.remaining_hours)}h restantes`
                  ).join('\n\n')}`
                : `${maintenanceInfo.primary}\nFaltam ${Math.round(maintenanceInfo.minHours)}h para vencer`;
              
              showTooltip(
                tooltipContent,
                rect.left + rect.width / 2,
                rect.top - 10
              );
            }}
            onMouseLeave={hideTooltip}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></div>
            <span className="flex items-center gap-1">
              {displayText}
              {maintenanceInfo.additionalCount > 0 && (
                <span className="ml-1 text-xs bg-yellow-500 text-white px-1 rounded">
                  +{maintenanceInfo.additionalCount}
                </span>
              )}
            </span>
          </div>
        </div>
      );
    }
    
    // Status OK
    return (
      <div className="text-center">
        <div 
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200 cursor-pointer`}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const tooltipContent = `Próxima manutenção programada\n${Math.round(remaining)}h restantes`;
            
            showTooltip(
              tooltipContent,
              rect.left + rect.width / 2,
              rect.top - 10
            );
          }}
          onMouseLeave={hideTooltip}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></div>
          <span>OK</span>
        </div>
      </div>
    );
  };

  /**
   * ✅ Filtros
   */
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  /**
   * ✅ Equipamentos Filtrados
   */
  // Merge equipamentos com devices (pelo device_id)
  const mergedEquipments = equipments.map((equipment) => {
    const deviceData = devices.find((d) => String(d.device_id) === String(equipment.device));
    return { ...equipment, deviceData };
  });

  const filteredEquipments = mergedEquipments.filter((equipment) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = equipment.name.toLowerCase().includes(searchLower) ||
      equipment.model.toLowerCase().includes(searchLower);

    // Filtro de status de manutenção melhorado
    const maintenanceStatus = getMaintenanceStatus(equipment.min_remaining_hours);
    let matchesMaintenance = false;
    
    if (maintenanceFilter === 'all') {
      matchesMaintenance = true;
    } else if (maintenanceFilter === 'urgent') {
      matchesMaintenance = maintenanceStatus === 'URGENTE';
    } else if (maintenanceFilter === 'attention') {
      // Incluir equipamentos com status ATENÇÃO OU que têm peças individuais precisando de atenção
      const hasAttentionParts = getAttentionMaintenanceInfo(equipment.id) !== null;
      matchesMaintenance = maintenanceStatus === 'ATENÇÃO' || hasAttentionParts;
    } else if (maintenanceFilter === 'ok') {
      // OK apenas quando não há peças vencidas nem próximas do vencimento
      const hasOverdueParts = getOverdueMaintenanceInfo(equipment.id) !== null;
      const hasAttentionParts = getAttentionMaintenanceInfo(equipment.id) !== null;
      matchesMaintenance = maintenanceStatus === 'OK' && !hasOverdueParts && !hasAttentionParts;
    }

    // Filtro de temperatura
    const tempStatus = getTemperatureStatus(equipment.deviceData?.calculated_temperature);
    const matchesTemperature = temperatureFilter === 'all' ||
      (temperatureFilter === 'high' && tempStatus === 'ALTA') ||
      (temperatureFilter === 'medium' && tempStatus === 'MÉDIA') ||
      (temperatureFilter === 'normal' && tempStatus === 'NORMAL');

    return matchesSearch && matchesMaintenance && matchesTemperature;
  });

  // Ordenação dinâmica
  const handleSort = (column) => {
    let direction = sortDirection;
    if (sortBy === column) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }
    setSortBy(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  // Função para sorting com dropdown
  const handleSortFromDropdown = (column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
    setCurrentPage(1);
    setOpenSortDropdown(null);
  };

  const sortedEquipments = [...filteredEquipments].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.name?.toUpperCase() || '';
      const nameB = b.name?.toUpperCase() || '';
      if (sortDirection === 'asc') {
        return nameA > nameB ? 1 : -1;
      } else {
        return nameA < nameB ? 1 : -1;
      }
    } else if (sortBy === 'model') {
      const modelA = a.model?.toUpperCase() || '';
      const modelB = b.model?.toUpperCase() || '';
      if (sortDirection === 'asc') {
        return modelA > modelB ? 1 : -1;
      } else {
        return modelA < modelB ? 1 : -1;
      }
    } else if (sortBy === 'min_remaining_hours') {
      if (sortDirection === 'asc') {
        return a.min_remaining_hours - b.min_remaining_hours;
      } else {
        return b.min_remaining_hours - a.min_remaining_hours;
      }
    } else if (sortBy === 'worked_hours') {
      if (sortDirection === 'asc') {
        return a.worked_hours - b.worked_hours;
      } else {
        return b.worked_hours - a.worked_hours;
      }
    } else if (sortBy === 'temperature') {
      const tempA = a.deviceData?.calculated_temperature !== undefined ? a.deviceData.calculated_temperature : -Infinity;
      const tempB = b.deviceData?.calculated_temperature !== undefined ? b.deviceData.calculated_temperature : -Infinity;
      if (sortDirection === 'asc') {
        return tempA - tempB;
      } else {
        return tempB - tempA;
      }
    } else if (sortBy === 'updated_at') {
      const dateA = a.deviceData?.updated_at ? new Date(a.deviceData.updated_at).getTime() : 0;
      const dateB = b.deviceData?.updated_at ? new Date(b.deviceData.updated_at).getTime() : 0;
      if (sortDirection === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    } else if (sortBy === 'speed_gps') {
      const speedA = a.deviceData?.speed_gps !== undefined ? a.deviceData.speed_gps : -Infinity;
      const speedB = b.deviceData?.speed_gps !== undefined ? b.deviceData.speed_gps : -Infinity;
      if (sortDirection === 'asc') {
        return speedA - speedB;
      } else {
        return speedB - speedA;
      }
    } else if (sortBy === 'speed_gps') {
      const speedA = a.deviceData?.speed_gps !== undefined ? a.deviceData.speed_gps : -Infinity;
      const speedB = b.deviceData?.speed_gps !== undefined ? b.deviceData.speed_gps : -Infinity;
      if (sortDirection === 'asc') {
        return speedA - speedB;
      } else {
        return speedB - speedA;
      }
    }
    return 0;
  });

  /**
   * ✅ Cálculo de Coloração das Linhas
   */
  // Esquema de cores inline, mesmas cores para ambos os temas
  const getRowStyle = (remaining) => {
    if (remaining < 0) return { backgroundColor: 'rgba(248, 151, 151, 0.8)' };
    if (remaining < 100) return { backgroundColor: 'rgba(245, 245, 139, 0.8)' };
    return { backgroundColor: 'rgba(153, 243, 153, 0.8)' };
  };

  /**
   * ✅ Paginação
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEquipments.slice(indexOfFirstItem, indexOfLastItem);

  // Para exibir os botões de página
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);

  // Função para trocar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Troca de itens por página
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadPage />;
  }

  // Função para calcular estilos dinâmicos baseados no zoom
  const getDynamicStyles = () => {
    // Zoom base (100%) = 1
    // Ajusta tamanhos baseado no zoom para manter proporções
    const baseFontSize = Math.max(0.8, Math.min(1.4, 1 / zoomLevel));
    const basePadding = Math.max(8, Math.min(24, 16 / zoomLevel));
    const baseSpacing = Math.max(4, Math.min(16, 8 / zoomLevel));

    return {
      fontSize: `${baseFontSize}rem`,
      padding: `${basePadding}px`,
      gap: `${baseSpacing}px`,
      tableFontSize: zoomLevel > 1.2 ? '0.75rem' : zoomLevel < 0.8 ? '1rem' : '0.875rem',
      tablePadding: zoomLevel > 1.2 ? '6px 8px' : zoomLevel < 0.8 ? '12px 16px' : '8px 12px',
      buttonSize: zoomLevel > 1.2 ? '32px' : zoomLevel < 0.8 ? '48px' : '40px',
      iconSize: zoomLevel > 1.2 ? '16px' : zoomLevel < 0.8 ? '24px' : '20px'
    };
  };

  const dynamicStyles = getDynamicStyles();

  return (
    <div className={`${isMobile ? 'p-2' : 'p-6'} min-h-screen overflow-x-hidden`}>
      {/* CSS Dinâmico para Zoom */}
      <style>{`
        .dynamic-table {
          font-size: ${dynamicStyles.tableFontSize} !important;
        }
        .dynamic-table th,
        .dynamic-table td {
          padding: ${dynamicStyles.tablePadding} !important;
        }
        .dynamic-button {
          width: ${dynamicStyles.buttonSize} !important;
          height: ${dynamicStyles.buttonSize} !important;
        }
        .dynamic-icon {
          width: ${dynamicStyles.iconSize} !important;
          height: ${dynamicStyles.iconSize} !important;
        }
        .zoom-responsive {
          font-size: ${dynamicStyles.fontSize} !important;
          padding: ${dynamicStyles.padding} !important;
        }
        .zoom-responsive * {
          gap: ${dynamicStyles.gap} !important;
        }
      `}</style>
      {/* ✅ Barra de Ferramentas */}
      <div className={`mb-${isMobile ? '4' : '6'} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isMobile ? 'p-2' : 'p-4'} rounded-lg shadow border`} style={!isMobile ? {maxWidth: 'fit-content', marginLeft: 'auto'} : {}}>
        {/* Linha principal: Busca e Ações */}
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-wrap gap-4'} items-center justify-center`}>
          <div className={`flex ${isMobile ? 'w-full gap-2' : 'gap-4'} items-center`}>
            {/* Campo de busca pode ser adicionado aqui se necessário */}
          </div>

          <div className={`flex gap-2 items-center ${isMobile ? 'w-full' : 'w-auto'} self-end`} style={!isMobile ? {maxWidth: 'fit-content'} : {}}>
            {/* Botão Limpar Filtros */}
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setTemperatureFilter('all');
                setMaintenanceFilter('all');
                setCurrentPage(1);
              }}
              className={`group ${isMobile ? 'flex-1' : ''} inline-flex items-center justify-center gap-2 ${isMobile ? 'px-4 py-2.5 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50 border-0`}
            >
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {isMobile ? 'Limpar' : 'Limpar Filtros'}
            </button>

            {/* Botão Adicionar Novo Equipamento */}
            <Link
              to="/dashboard/equipments/create"
              className={`group ${isMobile ? 'flex-1' : ''} inline-flex items-center justify-center gap-2 ${isMobile ? 'px-4 py-2.5 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 border-0`}
              aria-label="Adicionar Novo Equipamento"
            >
              <FaPlus className={`w-4 h-4 group-hover:rotate-90 transition-transform duration-200`} />
              {isMobile ? 'Equipamento' : 'Novo Equipamento'}
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ Tabela Responsiva */}
      <div className="overflow-x-auto rounded-lg shadow bg-gray-50" style={{ minHeight: '400px' }}>
        <div className="min-w-full bg-white">
          <table className="min-w-full bg-white text-center dynamic-table">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className={`${isMobile ? 'py-1 px-1 text-xs' : 'py-3 px-4 text-sm'} font-semibold`}>
                  <div className="flex items-center justify-center">
                    <span>{isMobile ? 'ID' : 'ID'}</span>
                  </div>
                </th>
                <th className={`${isMobile ? 'py-1 px-1 text-xs min-w-[80px]' : 'py-3 px-4 text-sm min-w-[120px]'} font-semibold relative`}>
                  <div className="flex items-center justify-center gap-2">
                    <span>{isMobile ? 'Nome' : 'Nome'}</span>
                    <div className="relative sort-dropdown">
                      <button
                        onClick={() => setOpenSortDropdown(openSortDropdown === 'name' ? null : 'name')}
                        className={`flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-6 h-6'} p-0 m-0 bg-transparent border-none shadow-none focus:outline-none focus:ring-0 text-white-1000 hover:text-gray-800`}
                        title="Ordenar por Nome"
                      >
                        <svg className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} fill="currentColor" viewBox="0 0 20 20">
                          {/* <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /> */}
                          <circle cx="10" cy="4" r="1.2" />
                          <circle cx="10" cy="10" r="1.2" />
                          <circle cx="10" cy="16" r="1.2" />
                        </svg>
                      </button>

                      {openSortDropdown === 'name' && (
                        <div className={`absolute ${isMobile ? 'right-0' : 'right-0'} top-8 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1 z-50 ${isMobile ? 'min-w-[180px]' : 'min-w-[200px]'}`}>
                          {/* Campo de pesquisa */}
                          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                            <input
                              type="text"
                              placeholder={isMobile ? "Pesquisar..." : "Pesquisar por nome..."}
                              value={search}
                              onChange={handleSearchChange}
                              className={`w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-xs'} border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            />
                          </div>

                          {/* Opções de ordenação */}
                          <button
                            onClick={() => handleSortFromDropdown('name', 'asc')}
                            className={`flex items-center w-full px-3 py-2 ${isMobile ? 'text-xs' : 'text-sm'} ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'name' && sortDirection === 'asc' ? 'font-semibold' : ''
                              }`}
                          >
                            <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                            </svg>
                            {isMobile ? 'A → Z' : 'A → Z (Crescente)'}
                          </button>
                          <button
                            onClick={() => handleSortFromDropdown('name', 'desc')}
                            className={`flex items-center w-full px-3 py-2 ${isMobile ? 'text-xs' : 'text-sm'} ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'name' && sortDirection === 'desc' ? 'font-semibold' : ''
                              }`}
                          >
                            <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 9.414V15z" clipRule="evenodd" />
                            </svg>
                            {isMobile ? 'Z → A' : 'Z → A (Decrescente)'}
                          </button>
                        </div>
                      )}

                      {sortBy === 'name' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-transparent text-white-500 text-xs flex items-center justify-center">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                {!isMobile && (
                  <th className="py-3 px-4 text-sm font-semibold relative">
                    <div className="flex items-center justify-center gap-2">
                      <span>Atualizado</span>
                      <div className="relative sort-dropdown">
                        <button
                          onClick={() => setOpenSortDropdown(openSortDropdown === 'updated_at' ? null : 'updated_at')}
                          className={`flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-6 h-6'} p-0 m-0 bg-transparent border-none shadow-none focus:outline-none focus:ring-0 text-white-1000 hover:text-gray-800`}
                          title="Ordenar por Data de Atualização"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="4" r="1.2" />
                            <circle cx="10" cy="10" r="1.2" />
                            <circle cx="10" cy="16" r="1.2" />
                          </svg>
                        </button>

                        {openSortDropdown === 'updated_at' && (
                          <div className={`absolute right-0 top-8 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1 z-50 min-w-[160px]`}>
                            <button
                              onClick={() => handleSortFromDropdown('updated_at', 'asc')}
                              className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'updated_at' && sortDirection === 'asc' ? 'font-semibold' : ''
                                }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                              </svg>
                              Mais Antigo
                            </button>
                            <button
                              onClick={() => handleSortFromDropdown('updated_at', 'desc')}
                              className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'updated_at' && sortDirection === 'desc' ? 'font-semibold' : ''
                                }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 9.414V15z" clipRule="evenodd" />
                              </svg>
                              Mais Recente
                            </button>
                          </div>
                        )}

                        {sortBy === 'updated_at' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-transparent text-white-500 text-xs flex items-center justify-center">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                )}
                {!isMobile && (
                  <th className="py-3 px-4 text-sm font-semibold relative">
                    <div className="flex items-center justify-center gap-2">
                      <span>Local</span>
                      <div className="relative sort-dropdown">
                        <button
                          onClick={() => setOpenSortDropdown(openSortDropdown === 'model' ? null : 'model')}
                                                  className={`flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-6 h-6'} p-0 m-0 bg-transparent border-none shadow-none focus:outline-none focus:ring-0 text-white-1000 hover:text-gray-800`}
                          title="Ordenar por Local"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            {/* <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /> */}
                            <circle cx="10" cy="4" r="1.2" />
                            +                        <circle cx="10" cy="10" r="1.2" />
                            +                        <circle cx="10" cy="16" r="1.2" />
                          </svg>
                        </button>

                        {openSortDropdown === 'model' && (
                          <div className={`absolute right-0 top-8 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1 z-50 min-w-[200px]`}>
                            {/* Campo de pesquisa */}
                            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                              <input
                                type="text"
                                placeholder="Pesquisar por local..."
                                value={search}
                                onChange={handleSearchChange}
                                className={`w-full px-2 py-1 text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} rounded focus:outline-none focus:ring-1 focus:ring-blue-500`}
                              />
                            </div>

                            {/* Opções de ordenação */}
                            <button
                              onClick={() => handleSortFromDropdown('model', 'asc')}
                              className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'model' && sortDirection === 'asc' ? 'font-semibold' : ''
                                }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                              </svg>
                              A → Z (Crescente)
                            </button>
                            <button
                              onClick={() => handleSortFromDropdown('model', 'desc')}
                              className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'model' && sortDirection === 'desc' ? 'font-semibold' : ''
                                }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 9.414V15z" clipRule="evenodd" />
                              </svg>
                              Z → A (Decrescente)
                            </button>
                          </div>
                        )}

                        {sortBy === 'model' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-transparent text-white-500 text-xs flex items-center justify-center">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                )}
                <th className={`${isMobile ? 'py-1 px-1 text-xs' : 'py-3 px-4 text-sm'} font-semibold relative`}>
                  <div className="flex items-center justify-center gap-2">
                    <span>{isMobile ? 'H.T.' : 'Horas Trabalho'}</span>
                    <div className="relative sort-dropdown">
                      <button
                        onClick={() => setOpenSortDropdown(openSortDropdown === 'worked_hours' ? null : 'worked_hours')}
                        className={`flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-6 h-6'} p-0 m-0 bg-transparent border-none shadow-none focus:outline-none focus:ring-0 text-white-1000 hover:text-gray-800`}
                        title="Ordenar por Horas Trabalhadas"
                      >
                        <svg className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} fill="currentColor" viewBox="0 0 20 20">
                          {/* <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /> */}
                          <circle cx="10" cy="4" r="1.2" />
                          <circle cx="10" cy="10" r="1.2" />
                          <circle cx="10" cy="16" r="1.2" />
                        </svg>
                      </button>

                      {openSortDropdown === 'worked_hours' && (
                        <div className={`absolute right-0 top-8 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1 z-50 min-w-[160px]`}>
                          <button
                            onClick={() => handleSortFromDropdown('worked_hours', 'asc')}
                            className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'worked_hours' && sortDirection === 'asc' ? 'font-semibold' : ''
                              }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                            </svg>
                            Crescente
                          </button>
                          <button
                            onClick={() => handleSortFromDropdown('worked_hours', 'desc')}
                            className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'worked_hours' && sortDirection === 'desc' ? 'font-semibold' : ''
                              }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 9.414V15z" clipRule="evenodd" />
                            </svg>
                            Decrescente
                          </button>
                        </div>
                      )}

                      {sortBy === 'worked_hours' && (
                       <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-transparent text-white-500 text-xs flex items-center justify-center">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className={`${isMobile ? 'py-1 px-1 text-xs' : 'py-3 px-4 text-sm'} font-semibold relative`}>
                  <div className="flex items-center justify-center gap-2">
                    <span>{isMobile ? 'H.R.' : 'Horas Restantes'}</span>
                    <div className="relative sort-dropdown">
                      <button
                        onClick={() => setOpenSortDropdown(openSortDropdown === 'min_remaining_hours' ? null : 'min_remaining_hours')}
                        className={`flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-6 h-6'} p-0 m-0 bg-transparent border-none shadow-none focus:outline-none focus:ring-0 text-white-1000 hover:text-gray-800`}
                        title="Ordenar por Horas Restantes"
                      >
                        <svg className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} fill="currentColor" viewBox="0 0 20 20">
                          {/* <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /> */}
                          <circle cx="10" cy="4" r="1.2" />
                          +                        <circle cx="10" cy="10" r="1.2" />
                          +                        <circle cx="10" cy="16" r="1.2" />
                        </svg>
                      </button>

                      {openSortDropdown === 'min_remaining_hours' && (
                        <div className={`absolute right-0 top-8 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1 z-50 min-w-[160px]`}>
                          <button
                            onClick={() => handleSortFromDropdown('min_remaining_hours', 'asc')}
                            className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'min_remaining_hours' && sortDirection === 'asc' ? 'font-semibold' : ''
                              }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                            </svg>
                            Crescente
                          </button>
                          <button
                            onClick={() => handleSortFromDropdown('min_remaining_hours', 'desc')}
                            className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'min_remaining_hours' && sortDirection === 'desc' ? 'font-semibold' : ''
                              }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 9.414V15z" clipRule="evenodd" />
                            </svg>
                            Decrescente
                          </button>
                        </div>
                      )}

                      {sortBy === 'min_remaining_hours' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-transparent text-white-500 text-xs flex items-center justify-center">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                {!isMobile && (
                  <th className="py-3 px-4 text-sm font-semibold relative">
                    <div className="flex items-center justify-center gap-2">
                      <span>Temp.</span>
                      <div className="relative sort-dropdown">
                        <button
                          onClick={() => setOpenSortDropdown(openSortDropdown === 'temperature' ? null : 'temperature')}
                                                  className={`flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-6 h-6'} p-0 m-0 bg-transparent border-none shadow-none focus:outline-none focus:ring-0 text-white-1000 hover:text-gray-800`}
                          title="Ordenar por Temperatura"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            {/* <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /> */}
                            <circle cx="10" cy="4" r="1.2" />
                            +                        <circle cx="10" cy="10" r="1.2" />
                            +                        <circle cx="10" cy="16" r="1.2" />
                          </svg>
                        </button>

                        {openSortDropdown === 'temperature' && (
                          <div className={`absolute right-0 top-8 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1 z-50 min-w-[160px]`}>
                            <button
                              onClick={() => handleSortFromDropdown('temperature', 'asc')}
                              className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'temperature' && sortDirection === 'asc' ? 'font-semibold' : ''
                                }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                              </svg>
                              Crescente
                            </button>
                            <button
                              onClick={() => handleSortFromDropdown('temperature', 'desc')}
                              className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'temperature' && sortDirection === 'desc' ? 'font-semibold' : ''
                                }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 9.414V15z" clipRule="evenodd" />
                              </svg>
                              Decrescente
                            </button>
                          </div>
                        )}

                        {sortBy === 'temperature' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-transparent text-white-500 text-xs flex items-center justify-center">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                )}
                {!isMobile && (
                  <th className="py-3 px-4 text-sm font-semibold relative">
                    <div className="flex items-center justify-center gap-2">
                      <span>Velocidade GPS</span>
                      <div className="relative sort-dropdown">
                        <button
                          onClick={() => setOpenSortDropdown(openSortDropdown === 'speed_gps' ? null : 'speed_gps')}
                          className={`flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-6 h-6'} p-0 m-0 bg-transparent border-none shadow-none focus:outline-none focus:ring-0 text-white-1000 hover:text-gray-800`}
                          title="Ordenar por Velocidade GPS"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="4" r="1.2" />
                            <circle cx="10" cy="10" r="1.2" />
                            <circle cx="10" cy="16" r="1.2" />
                          </svg>
                        </button>

                        {openSortDropdown === 'speed_gps' && (
                          <div className={`absolute right-0 top-8 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-1 z-50 min-w-[160px]`}>
                            <button
                              onClick={() => handleSortFromDropdown('speed_gps', 'asc')}
                              className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'speed_gps' && sortDirection === 'asc' ? 'font-semibold' : ''
                                }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                              </svg>
                              Crescente
                            </button>
                            <button
                              onClick={() => handleSortFromDropdown('speed_gps', 'desc')}
                              className={`flex items-center w-full px-3 py-2 text-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} transition-colors ${sortBy === 'speed_gps' && sortDirection === 'desc' ? 'font-semibold' : ''
                                }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 15a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 9.414V15z" clipRule="evenodd" />
                              </svg>
                              Decrescente
                            </button>
                          </div>
                        )}

                        {sortBy === 'speed_gps' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-transparent text-white-500 text-xs flex items-center justify-center">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                )}
                <th className={`${isMobile ? 'py-1 px-1 text-xs' : 'py-3 px-4 text-sm'} font-semibold relative`}>
                  <div className="flex items-center justify-center gap-2">
                    <span>{isMobile ? 'St.' : 'Status'}</span>
                    <div className="relative sort-dropdown">
                      <button
                        onClick={() => setOpenSortDropdown(openSortDropdown === 'status' ? null : 'status')}
                        className={`flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-6 h-6'} p-0 m-0 bg-transparent border-none shadow-none focus:outline-none focus:ring-0 text-white-1000 hover:text-gray-800`}
                        title="Filtros de Status"
                      >
                        <svg className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {openSortDropdown === 'status' && (
                        <div className={`absolute ${isMobile ? 'right-0' : 'right-0'} top-8 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg shadow-lg py-2 z-50 ${isMobile ? 'min-w-[200px]' : 'min-w-[280px]'}`}>
                          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                            <h4 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                              Filtros Avançados
                            </h4>
                          </div>

                          {/* Filtro de Manutenção */}
                          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                            <label className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                              Status de Manutenção:
                            </label>
                            <div className="space-y-1">
                              <button
                                onClick={() => {
                                  setMaintenanceFilter('all');
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} rounded transition-colors ${maintenanceFilter === 'all'
                                  ? (isDarkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-800')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                  }`}
                              >
                                <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                                Todos os Status
                              </button>
                              <button
                                onClick={() => {
                                  setMaintenanceFilter('urgent');
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} rounded transition-colors ${maintenanceFilter === 'urgent'
                                  ? (isDarkMode ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-800')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                  }`}
                              >
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                URGENTE
                              </button>
                              <button
                                onClick={() => {
                                  setMaintenanceFilter('attention');
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} rounded transition-colors ${maintenanceFilter === 'attention'
                                  ? (isDarkMode ? 'bg-yellow-700 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                  }`}
                              >
                                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                                ATENÇÃO (Peças + Equipamentos)
                              </button>
                              <button
                                onClick={() => {
                                  setMaintenanceFilter('ok');
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} rounded transition-colors ${maintenanceFilter === 'ok'
                                  ? (isDarkMode ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-800')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                  }`}
                              >
                                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                                OK
                              </button>
                            </div>
                          </div>

                          {/* Filtro de Temperatura */}
                          <div className="px-3 py-2">
                            <label className={`block ${isMobile ? 'text-xs' : 'text-sm'} font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                              Faixa de Temperatura:
                            </label>
                            <div className="space-y-1">
                              <button
                                onClick={() => {
                                  setTemperatureFilter('all');
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} rounded transition-colors ${temperatureFilter === 'all'
                                  ? (isDarkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-800')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                  }`}
                              >
                                <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v5.586l2.707-2.707a1 1 0 011.414 1.414L11.414 10l3.707 3.707a1 1 0 01-1.414 1.414L11 12.414V18a1 1 0 11-2 0v-5.586L6.293 15.121a1 1 0 01-1.414-1.414L8.586 10 4.879 6.293a1 1 0 011.414-1.414L9 7.586V3a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Todas as Temperaturas
                              </button>
                              <button
                                onClick={() => {
                                  setTemperatureFilter('high');
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} rounded transition-colors ${temperatureFilter === 'high'
                                  ? (isDarkMode ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-800')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                  }`}
                              >
                                <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v5.586l2.707-2.707a1 1 0 011.414 1.414L11.414 10l3.707 3.707a1 1 0 01-1.414 1.414L11 12.414V18a1 1 0 11-2 0v-5.586L6.293 15.121a1 1 0 01-1.414-1.414L8.586 10 4.879 6.293a1 1 0 011.414-1.414L9 7.586V3a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                ALTA {'>'}90°C
                              </button>
                              <button
                                onClick={() => {
                                  setTemperatureFilter('medium');
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} rounded transition-colors ${temperatureFilter === 'medium'
                                  ? (isDarkMode ? 'bg-yellow-700 text-yellow-200' : 'bg-yellow-100 text-yellow-800')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                  }`}
                              >
                                <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v5.586l2.707-2.707a1 1 0 011.414 1.414L11.414 10l3.707 3.707a1 1 0 01-1.414 1.414L11 12.414V18a1 1 0 11-2 0v-5.586L6.293 15.121a1 1 0 01-1.414-1.414L8.586 10 4.879 6.293a1 1 0 011.414-1.414L9 7.586V3a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                MÉDIA 60-89°C
                              </button>
                              <button
                                onClick={() => {
                                  setTemperatureFilter('normal');
                                  setCurrentPage(1);
                                }}
                                className={`flex items-center w-full px-2 py-1 ${isMobile ? 'text-xs' : 'text-sm'} rounded transition-colors ${temperatureFilter === 'normal'
                                  ? (isDarkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-800')
                                  : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50')
                                  }`}
                              >
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v5.586l2.707-2.707a1 1 0 011.414 1.414L11.414 10l3.707 3.707a1 1 0 01-1.414 1.414L11 12.414V18a1 1 0 11-2 0v-5.586L6.293 15.121a1 1 0 01-1.414-1.414L8.586 10 4.879 6.293a1 1 0 011.414-1.414L9 7.586V3a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                NORMAL {'<'}60°C
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Indicador de filtros ativos */}
                      {(maintenanceFilter !== 'all' || temperatureFilter !== 'all') && (
                        <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'} rounded-full bg-blue-500 text-white ${isMobile ? 'text-xs' : 'text-xs'} flex items-center justify-center`}>
                          !
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className={`${isMobile ? 'py-1 px-1 text-xs' : 'py-3 px-4 text-sm'} font-semibold`}>
                  <div className="flex items-center justify-center">
                    {isMobile ? 'Ação' : 'Ações'}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentItems.map((equipment) => (
                <tr
                  key={equipment.id}
                  style={getRowStyle(equipment.min_remaining_hours)}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className={`${isMobile ? 'py-1 px-1 text-xs' : 'py-3 px-4'}`}>
                    <span className="font-medium">{equipment.device || 'N/A'}</span>
                  </td>
                  <td className={`${isMobile ? 'py-1 px-1 text-xs max-w-[60px]' : 'py-3 px-4'}`}>
                    <div className={`${isMobile ? 'truncate' : ''}`} title={equipment.name}>
                      <span className="font-semibold">{isMobile ? equipment.name.substring(0, 8) + (equipment.name.length > 8 ? '...' : '') : equipment.name}</span>
                    </div>
                    {isMobile && (
                      <div className="text-xs text-blue-600 cursor-pointer truncate mt-1"
                        onClick={() => openMapModal(equipment)}
                        title={`Local: ${equipment.model || 'N/A'} - Clique para ver no mapa`}>
                        <span>{equipment.model ? equipment.model.substring(0, 6) + (equipment.model.length > 6 ? '...' : '') : 'N/A'}</span>
                      </div>
                    )}
                  </td>
                  {!isMobile && (
                    <td className="py-3 px-4">
                      {equipment.deviceData?.updated_at ? (
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="font-medium text-sm text-gray-800">
                            {new Date(equipment.deviceData.updated_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {new Date(equipment.deviceData.updated_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  )}
                  {!isMobile && (
                    <td
                      className="py-3 px-4 cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={() => openMapModal(equipment)}
                      title="Clique para ver no mapa"
                    >
                      <span>{equipment.model || 'N/A'}</span>
                    </td>
                  )}
                  <td className={`${isMobile ? 'py-1 px-1 text-xs' : 'py-3 px-4'}`}>
                    <div className="flex items-center justify-center">
                      <span className="font-semibold">
                        {isMobile ?
                          `${Math.round(Number(equipment.worked_hours))}h` :
                          `${Number(equipment.worked_hours).toLocaleString('pt-BR', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                          })}h`
                        }
                      </span>
                    </div>
                  </td>
                  <td className={`${isMobile ? 'py-1 px-1 text-xs' : 'py-3 px-4'}`}>
                    <div className="flex items-center justify-center">
                      <span className="font-semibold">
                        {isMobile ?
                          `${Math.round(Number(equipment.min_remaining_hours))}h` :
                          `${Number(equipment.min_remaining_hours).toLocaleString('pt-BR', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                          })}h`
                        }
                      </span>
                    </div>
                  </td>
                  {!isMobile && (
                    <td className="py-3 px-4">
                      {equipment.deviceData?.calculated_temperature !== undefined
                        ? (
                          equipment.deviceData.calculated_temperature > 150
                            ? <span className="text-gray-400">N/A</span>
                            : <div className="flex items-center justify-center">
                              <span className="font-semibold">
                                {Number(equipment.deviceData.calculated_temperature).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°C
                              </span>
                            </div>
                        )
                        : <span className="text-gray-400">N/A</span>
                      }
                    </td>
                  )}
                  {!isMobile && (
                    <td className="py-3 px-4">
                      {equipment.deviceData?.speed_gps !== undefined
                        ? (
                          <div className="flex items-center justify-center">
                            <span className="font-semibold">
                              {Number(equipment.deviceData.speed_gps).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km/h
                            </span>
                          </div>
                        )
                        : <span className="text-gray-400">N/A</span>
                      }
                    </td>
                  )}
                  <td className={`${isMobile ? 'py-1 px-1' : 'py-3 px-4'}`}>
                    <StatusComponent equipment={equipment} />
                  </td>

                  <td className={`${isMobile ? 'py-2 px-2' : 'py-3 px-4'}`}>
                    {isMobile ? (
                      /* Dropdown de Ações para Mobile */
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === equipment.id ? null : equipment.id)}
                          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="Ações"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
                            <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>

                        {openDropdownId === equipment.id && (
                          <div className="absolute right-0 top-8 bg-white border-gray-200 border rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                            <Link
                              to={`/dashboard/equipments/${equipment.id}/edit`}
                              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                              onClick={() => setOpenDropdownId(null)}
                            >
                              <svg className="mr-2 w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                              </svg>
                              Editar
                            </Link>
                            <Link
                              to={`/dashboard/devices/${equipment.device}`}
                              className="flex items-center px-3 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors font-medium"
                              onClick={() => setOpenDropdownId(null)}
                            >
                              <svg className="mr-2 w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                              Ver Device
                            </Link>
                            <Link
                              to={`/dashboard/maintenance/${equipment.id}`}
                              className="flex items-center px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 transition-colors font-medium"
                              onClick={() => setOpenDropdownId(null)}
                            >
                              <svg className="mr-2 w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
                              </svg>
                              Manutenção
                            </Link>
                            <button
                              onClick={() => {
                                setOpenDropdownId(null);
                                openDeleteModal(equipment.id);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                            >
                              <svg className="mr-2 w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                              </svg>
                              Deletar
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Ações para Desktop */
                      <div className="flex justify-center items-center gap-2">
                        <style>{`
                          .action-anim {
                            transition: box-shadow 0.18s, filter 0.18s, transform 0.22s cubic-bezier(.4,1.6,.6,1), opacity 0.22s;
                          }
                          .action-anim:hover {
                            box-shadow: 0 8px 24px 0 rgba(0,0,0,0.13);
                            filter: brightness(1.10);
                          }
                          /* Animação da lixeira removida */
                        `}</style>
                        <Link
                          to={`/dashboard/equipments/${equipment.id}/edit`}
                          className="group p-1.5 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors action-anim dynamic-button"
                          aria-label="Editar Equipamento"
                          title="Editar Equipamento"
                        >
                          <svg className="dynamic-icon group-hover:drop-shadow-md transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182l-12.12 12.12a2 2 0 0 1-.878.513l-3.06.817.817-3.06a2 2 0 0 1 .513-.878l12.12-12.12z" />
                            <path d="M15 6l3 3" />
                          </svg>
                        </Link>
                        <Link
                          to={`/dashboard/devices/${equipment.device}`}
                          className="group p-1.5 rounded-md text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors action-anim dynamic-button"
                          aria-label="Visualizar Detalhes do Device"
                          title="Ver Detalhes do Device"
                        >
                          <svg className="dynamic-icon group-hover:drop-shadow-md transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                            <circle cx="12" cy="12" r="3.5" />
                          </svg>
                        </Link>
                        <Link
                          to={`/dashboard/maintenance/${equipment.id}`}
                          className="group p-1.5 rounded-md text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 transition-colors action-anim dynamic-button"
                          aria-label="Manutenção"
                          title="Gerenciar Manutenção"
                        >
                          <svg className="dynamic-icon group-hover:drop-shadow-md transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.03 7.03 0 0 0-1.7-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.42l-.38 2.65a7.03 7.03 0 0 0-1.7.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.53.38 1.1.72 1.7.98l.38 2.65A.5.5 0 0 0 10 22h4a.5.5 0 0 0 .5-.42l.38-2.65a7.03 7.03 0 0 0 1.7-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(equipment.id)}
                          className="group p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors action-anim dynamic-button"
                          aria-label="Deletar Equipamento"
                          title="Deletar Equipamento"
                        >
                          <svg className="dynamic-icon group-hover:drop-shadow-md transition-all duration-200" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <rect x="5" y="6" width="14" height="14" rx="2" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={isMobile ? 6 : 10} className="py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="text-center">
                        <div className="font-semibold text-base mb-1">Nenhum equipamento encontrado</div>
                        {(search || maintenanceFilter !== 'all' || temperatureFilter !== 'all') ? (
                          <div className="text-sm">
                            Tente ajustar os filtros de busca ou
                            <button
                              onClick={() => {
                                setSearch('');
                                setMaintenanceFilter('all');
                                setTemperatureFilter('all');
                                setCurrentPage(1);
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-700 underline font-medium"
                            >
                              limpar todos os filtros
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm">Não há equipamentos cadastrados no sistema</div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Controle de Itens por Página e Informações */}
      <div className={`${isMobile ? 'mt-4 mb-4' : 'mt-6 mb-6'} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isMobile ? 'p-3' : 'p-4'} rounded-lg shadow border`}>
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
          {/* Informações da tabela */}
          <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-4`}>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
              <span className="font-semibold">{filteredEquipments.length}</span> equipamentos encontrados
            </span>
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
              Mostrando {Math.min(indexOfFirstItem + 1, filteredEquipments.length)} - {Math.min(indexOfLastItem, filteredEquipments.length)}
            </span>
          </div>

          {/* Controle de itens por página */}
          <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-3`}>
            <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold text-sm`}>
              Itens por página:
            </label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className={`border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {[10, 25, 50, 75, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ✅ Paginação Melhorada */}
      {totalPages > 1 && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${isMobile ? 'p-3' : 'p-4'} rounded-lg shadow border`}>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
            {/* Informações da página */}
            <div className={`${isMobile ? 'text-center' : ''}`}>
              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
              </span>
            </div>

            {/* Controles de navegação */}
            <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-2`}>
              {/* Primeira página */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md font-semibold text-sm transition-colors ${currentPage === 1
                  ? `${isDarkMode ? 'bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-200 text-gray-400 border-gray-300'} cursor-not-allowed border`
                  : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'} border`
                  }`}
              >
                ««
              </button>

              {/* Página anterior */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${currentPage === 1
                  ? `${isDarkMode ? 'bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-200 text-gray-400 border-gray-300'} cursor-not-allowed border`
                  : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'} border`
                  }`}
              >
                {isMobile ? '‹' : '« Anterior'}
              </button>

              {/* Páginas numéricas (apenas no desktop) */}
              {!isMobile && (
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-md font-semibold text-sm transition-colors border ${currentPage === pageNum
                          ? `${isDarkMode ? 'bg-blue-800 text-blue-200 border-blue-600' : 'bg-blue-600 text-white border-blue-500'}`
                          : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Próxima página */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${currentPage === totalPages
                  ? `${isDarkMode ? 'bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-200 text-gray-400 border-gray-300'} cursor-not-allowed border`
                  : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'} border`
                  }`}
              >
                {isMobile ? '›' : 'Próxima »'}
              </button>

              {/* Última página */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md font-semibold text-sm transition-colors ${currentPage === totalPages
                  ? `${isDarkMode ? 'bg-gray-700 text-gray-500 border-gray-600' : 'bg-gray-200 text-gray-400 border-gray-300'} cursor-not-allowed border`
                  : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'} border`
                  }`}
              >
                »»
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal do Mapa */}
      {showMapModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl ${isMobile ? 'w-full max-w-sm' : 'max-w-4xl w-full'} ${isMobile ? 'max-h-[85vh]' : 'max-h-[90vh]'} overflow-auto`}>
            {/* Header do Modal */}
            <div className={`flex justify-between items-center ${isMobile ? 'p-3' : 'p-4'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex-1 min-w-0">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} truncate`}>
                  {isMobile ? selectedEquipment.name : `Localização: ${selectedEquipment.name}`}
                </h2>
                <p className={`${isMobile ? 'text-sm' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                  {isMobile ? selectedEquipment.model : `Local de Trabalho: ${selectedEquipment.model}`}
                </p>
              </div>
              <button
                onClick={closeMapModal}
                className={`ml-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} ${isMobile ? 'text-xl' : 'text-2xl'} flex-shrink-0`}
                aria-label="Fechar Modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
              {selectedEquipment.deviceData?.latitude && selectedEquipment.deviceData?.longitude ? (
                <>
                  {/* Informações de GPS */}
                  <div className={`${isMobile ? 'mb-3' : 'mb-4'} grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-4'} ${isMobile ? 'text-sm' : 'text-sm'}`}>
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} ${isMobile ? 'p-2' : 'p-3'} rounded-lg`}>
                      <strong className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Latitude:</strong>
                      <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} ${isMobile ? 'text-xs' : ''}`}>{selectedEquipment.deviceData.latitude}</span>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} ${isMobile ? 'p-2' : 'p-3'} rounded-lg`}>
                      <strong className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Longitude:</strong>
                      <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} ${isMobile ? 'text-xs' : ''}`}>{selectedEquipment.deviceData.longitude}</span>
                    </div>
                  </div>

                  {/* Mapa Incorporado */}
                  <div className={`relative w-full ${isMobile ? 'h-64 mb-3' : 'h-96 mb-4'}`}>
                    <iframe
                      title={`Mapa de localização - ${selectedEquipment.name}`}
                      src={`https://maps.google.com/maps?q=${selectedEquipment.deviceData.latitude},${selectedEquipment.deviceData.longitude}&z=15&output=embed`}
                      className="w-full h-full border-0 rounded-lg"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-col sm:flex-row justify-between gap-3'}`}>
                    <button
                      onClick={closeMapModal}
                      className={`${isMobile ? 'w-full' : ''} px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${isMobile ? 'text-sm' : ''}`}
                    >
                      Fechar
                    </button>
                    <button
                      onClick={openGoogleMaps}
                      className={`${isMobile ? 'w-full' : ''} px-4 py-2 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'text-sm' : ''}`}
                    >
                      Abrir no Google Maps
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isMobile ? 'text-base' : 'text-lg'} mb-2`}>
                    📍 Coordenadas GPS não disponíveis
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ${isMobile ? 'text-sm mb-3' : 'mb-4'}`}>
                    Este equipamento não possui informações de localização.
                  </p>
                  <button
                    onClick={closeMapModal}
                    className={`${isMobile ? 'w-full' : ''} px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${isMobile ? 'text-sm' : ''}`}
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Tooltip */}
      {tooltip.visible && (
        <div 
          className={`fixed z-50 ${isDarkMode ? 'bg-gray-900 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-300'} text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none max-w-xs backdrop-blur-sm`}
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateX(-50%) translateY(-100%)' }}
        >
          <div className="whitespace-pre-line font-medium leading-normal">{tooltip.content}</div>
        </div>
      )}
    </div>
  );
};

export default Equipments;
