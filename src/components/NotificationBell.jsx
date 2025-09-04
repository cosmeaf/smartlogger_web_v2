import React, { useState } from 'react';
import { FaBell, FaClock, FaExclamationTriangle, FaWrench, FaTimes, FaClipboardList } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from '../context/DeviceContext';

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    lastUpdate,
    getCriticalNotifications,
    getUrgentNotifications,
    getAttentionNotifications,
    getTopMaintenanceNeeded
  } = useNotification();
  const { isDarkMode } = useTheme();
  const { isMobile } = useDevice();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('todos'); // Filtro selecionado
  const [maintenanceMapping, setMaintenanceMapping] = useState(new Map()); // Mapeamento original -> normalizado
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Estado do dropdown customizado
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 }); // Posição do dropdown
  const filterButtonRef = React.useRef(null); // Referência do botão

  // Função para calcular similaridade entre duas strings (algoritmo de Levenshtein simplificado)
  const calculateSimilarity = (str1, str2) => {
    const normalize = (str) => str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ')
      .trim();
    
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    // Calcular distância de edição
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substituição
            matrix[i][j - 1] + 1,     // inserção
            matrix[i - 1][j] + 1      // deleção
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Função para agrupar tipos similares (75% de similaridade)
  const groupSimilarTypes = (types) => {
    const groups = [];
    const used = new Set();
    
    types.forEach(type => {
      if (used.has(type)) return;
      
      const group = [type];
      used.add(type);
      
      types.forEach(otherType => {
        if (type !== otherType && !used.has(otherType)) {
          const similarity = calculateSimilarity(type, otherType);
          if (similarity >= 0.75) {
            group.push(otherType);
            used.add(otherType);
          }
        }
      });
      
      groups.push(group);
    });
    
    return groups;
  };

  // Função para normalizar nome do grupo (pega o mais limpo/completo)
  const getGroupName = (group) => {
    // Pegar o nome mais comum ou mais completo do grupo
    return group.reduce((best, current) => {
      // Preferir nomes mais longos e mais completos
      if (current.length > best.length) return current;
      if (current.length === best.length) {
        // Se mesmo tamanho, preferir o que tem mais palavras separadas
        const currentWords = current.split(/\s+/).length;
        const bestWords = best.split(/\s+/).length;
        return currentWords > bestWords ? current : best;
      }
      return best;
    });
  };

  // Obter tipos únicos de manutenção com agrupamento por similaridade (75%)
  const maintenanceTypes = React.useMemo(() => {
    // Coletar todos os tipos únicos
    const allTypes = [...new Set(
      notifications
        .map(n => n.equipment.part_name)
        .filter(Boolean)
    )];
    
    if (allTypes.length === 0) return ['todos'];
    
    // Agrupar tipos similares
    const groups = groupSimilarTypes(allTypes);
    
    // Criar mapeamento e obter nomes dos grupos
    const typeToGroup = new Map();
    const groupNames = groups.map(group => {
      const groupName = getGroupName(group);
      group.forEach(type => {
        typeToGroup.set(type, groupName);
      });
      return groupName;
    });
    
    // Armazenar mapeamento para uso no filtro
    setMaintenanceMapping(typeToGroup);
    
    return ['todos', ...groupNames.sort()];
  }, [notifications]);

  // Filtrar notificações baseado no filtro selecionado com agrupamento por similaridade
  const filteredNotifications = React.useMemo(() => {
    if (selectedFilter === 'todos') {
      return notifications;
    }
    
    return notifications.filter(notification => {
      if (!notification.equipment.part_name) return false;
      
      const groupName = maintenanceMapping.get(notification.equipment.part_name);
      return groupName === selectedFilter;
    });
  }, [notifications, selectedFilter, maintenanceMapping]);

  // Estatísticas das notas de manutenção
  const criticalCount = getCriticalNotifications().length;
  const urgentCount = getUrgentNotifications().length;
  const attentionCount = getAttentionNotifications().length;

  // Fechar dropdown do filtro quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && !event.target.closest('.filter-dropdown')) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Calcular posição do dropdown
  const handleFilterToggle = () => {
    if (!isFilterOpen && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
    setIsFilterOpen(!isFilterOpen);
  };

  const handleNotificationClick = (notification) => {
    // Sempre permite visualizar, não marca como lida automaticamente
    // O usuário pode marcar como "vista" se quiser
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return isDarkMode 
          ? 'text-red-500 bg-red-900/20 border-red-800/40 backdrop-blur-md'
          : 'text-red-500 bg-red-50/25 border-red-200/25 backdrop-blur-xl';
      case 'urgent':
        return isDarkMode 
          ? 'text-orange-500 bg-orange-900/20 border-orange-800/40 backdrop-blur-md'
          : 'text-orange-500 bg-orange-50/25 border-orange-200/25 backdrop-blur-xl';
      case 'attention':
        return isDarkMode 
          ? 'text-yellow-500 bg-yellow-900/20 border-yellow-800/40 backdrop-blur-md'
          : 'text-yellow-500 bg-yellow-50/25 border-yellow-200/25 backdrop-blur-xl';
      default:
        return isDarkMode 
          ? 'text-blue-500 bg-blue-900/20 border-blue-800/40 backdrop-blur-md'
          : 'text-blue-500 bg-blue-50/25 border-blue-200/25 backdrop-blur-xl';
    }
  };

  const getStatusBadge = (status, priority) => {
    const colors = {
      'VENCIDO': isDarkMode 
        ? 'bg-red-900/30 text-red-400 backdrop-blur-md'
        : 'bg-red-100/25 text-red-800 backdrop-blur-xl',
      'URGENTE': isDarkMode 
        ? 'bg-orange-900/30 text-orange-400 backdrop-blur-md'
        : 'bg-orange-100/25 text-orange-800 backdrop-blur-xl',
      'ATENÇÃO': isDarkMode 
        ? 'bg-yellow-900/30 text-yellow-400 backdrop-blur-md'
        : 'bg-yellow-100/25 text-yellow-800 backdrop-blur-xl',
      'NORMAL': isDarkMode 
        ? 'bg-blue-900/30 text-blue-400 backdrop-blur-md'
        : 'bg-blue-100/25 text-blue-800 backdrop-blur-xl'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || colors['NORMAL']}`}>
        {status}
      </span>
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="relative">
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-lg transition-all duration-200 backdrop-blur-md ${
          isDarkMode 
            ? 'bg-gray-800/40 hover:bg-gray-700/50 text-gray-300 hover:text-blue-400 border border-gray-600/30' 
            : 'bg-white/20 hover:bg-gray-100/30 text-gray-600 hover:text-blue-600 border border-gray-200/20'
        }`}
        title="Manutenções Vencidas"
      >
        <FaClipboardList className={isMobile ? 'text-base' : 'text-xl'} />
        
        {/* Badge de contagem premium */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className="relative bg-white/40 dark:bg-gray-800/60 backdrop-blur-md rounded-full p-0.5 shadow-lg border border-gray-200/20 dark:border-gray-600/30">
              <span className={`text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-md transform transition-transform hover:scale-110 backdrop-blur-md ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-600/80 via-blue-700/80 to-blue-800/80'
                  : 'bg-gradient-to-br from-blue-900/70 via-blue-800/70 to-blue-900/70'
              }`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </span>
          </div>
        )}
        
        {/* Indicador de carregamento simplificado */}
        {loading && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500/80 backdrop-blur-sm rounded-full opacity-60 animate-pulse"></div>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-[9997]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de notificações */}
          <div className={`absolute ${
            isMobile 
              ? 'top-14 -right-20 w-[150vw] max-w-sm' 
              : 'right-0 top-14 w-[480px]'
          } z-[9998] ${
            isDarkMode ? 'bg-gray-800/60 border-gray-700/40' : 'bg-white/30 border-gray-200/25'
          } border rounded-xl shadow-2xl ${isMobile ? 'max-h-[80vh]' : 'max-h-[85vh]'} backdrop-blur-xl flex flex-col`}>
            
            {/* Header */}
            <div className={`flex-shrink-0 ${isMobile ? 'p-2.5' : 'p-3'} border-b ${
              isDarkMode 
                ? 'border-gray-700/40 bg-gray-800/30 backdrop-blur-md' 
                : 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-blue-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                  <div className={`${isMobile ? 'p-1' : 'p-1.5'} rounded-lg ${isDarkMode ? 'bg-blue-900/30 backdrop-blur-md' : 'bg-blue-700/30'}`}>
                    <FaClipboardList className={`${isMobile ? 'text-sm' : 'text-base'} ${isDarkMode ? 'text-blue-400' : 'text-white'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} ${isDarkMode ? 'text-white' : 'text-white'}`}>
                      {isMobile ? 'Manutenções' : 'Manutenções Vencidas'}
                    </h3>
                    <span className={`${isMobile ? 'text-xs' : 'text-xs'} ${isDarkMode ? 'text-gray-400' : 'text-blue-100'}`}>
                      {filteredNotifications.length} de {notifications.length} {isMobile ? 'críticas' : 'manutenções críticas'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`${isMobile ? 'p-1' : 'p-1.5'} rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700/40 text-gray-400 hover:text-gray-300 backdrop-blur-md' 
                      : 'hover:bg-blue-700/40 text-blue-300 hover:text-blue-200'
                  }`}
                >
                  <FaTimes className={`${isMobile ? 'text-xs' : 'text-sm'}`} />
                </button>
              </div>

              {/* Filtro por tipo de manutenção */}
              {maintenanceTypes.length > 2 && (
                <div className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
                  <label className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium block mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-blue-100'
                  }`}>
                    Filtrar por tipo:
                  </label>
                  
                  <div className="relative filter-dropdown">
                    {/* Botão do seletor customizado */}
                    <button
                      ref={filterButtonRef}
                      onClick={handleFilterToggle}
                      className={`w-full ${isMobile ? 'text-sm px-4 py-3' : 'text-sm px-4 py-3'} rounded-xl border-2 transition-all duration-200 cursor-pointer font-medium text-left flex items-center justify-between ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-500 text-white hover:bg-gray-600 hover:border-blue-400 focus:border-blue-400 focus:bg-gray-600' 
                          : 'bg-blue-800/60 border-blue-600/50 text-white hover:border-blue-400/80 focus:border-blue-300 focus:bg-blue-700/70 backdrop-blur-md'
                      } focus:outline-none focus:ring-2 ${
                        isDarkMode ? 'focus:ring-blue-400/50' : 'focus:ring-blue-300/40'
                      } shadow-lg ${isFilterOpen ? 'rounded-b-none' : ''}`}
                    >
                      <span>{selectedFilter === 'todos' ? 'Todos os tipos' : selectedFilter}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {selectedFilter !== 'todos' && (
                    <div className={`mt-3 flex items-center justify-between p-2.5 rounded-lg ${
                      isDarkMode 
                        ? 'bg-blue-900/20 border border-blue-800/40' 
                        : 'bg-blue-700/20 border border-blue-600/40'
                    } backdrop-blur-md`}>
                      <span className={`text-xs ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-100'
                      }`}>
                        Mostrando: <span className="font-semibold">{selectedFilter}</span>
                      </span>
                      <button
                        onClick={() => setSelectedFilter('todos')}
                        className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-600/40 text-gray-300 hover:bg-gray-600/60' 
                            : 'bg-blue-600/40 text-blue-100 hover:bg-blue-600/60'
                        }`}
                      >
                        Limpar
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Resumo de prioridades simplificado */}
              {filteredNotifications.length > 0 && (
                <div className={`flex items-center justify-between ${isMobile ? 'mt-2' : 'mt-3'} text-xs`}>
                  <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                    <div className={`flex items-center space-x-1 ${
                      isDarkMode ? 'text-red-400' : 'text-red-200'
                    }`}>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium">{filteredNotifications.length} vencidas</span>
                    </div>
                    {selectedFilter !== 'todos' && (
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        isDarkMode ? 'bg-blue-900/30 text-blue-400 backdrop-blur-md' : 'bg-blue-800/25 text-blue-100'
                      }`}>
                        {isMobile && selectedFilter.length > 12 
                          ? selectedFilter.substring(0, 12) + '...' 
                          : selectedFilter
                        }
                      </div>
                    )}
                  </div>
                  {selectedFilter !== 'todos' && (
                    <button
                      onClick={() => setSelectedFilter('todos')}
                      className={`text-xs hover:underline ${
                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-100 hover:text-white'
                      }`}>
                      {isMobile ? 'Todos' : 'Ver todos'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Lista de notificações */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              {filteredNotifications.length === 0 ? (
                <div className={`${isMobile ? 'p-8' : 'p-12'} text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700/40 backdrop-blur-md' : 'bg-gray-100/25 backdrop-blur-xl'
                  }`}>
                    <FaClipboardList className={`${isMobile ? 'text-xl' : 'text-2xl'} opacity-50`} />
                  </div>
                  {selectedFilter === 'todos' ? (
                    <>
                      <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Nenhuma manutenção vencida</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-xs'} mt-1 opacity-75`}>Todas as manutenções estão em dia</p>
                    </>
                  ) : (
                    <>
                      <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Nenhuma manutenção de "{selectedFilter}"</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-xs'} mt-1 opacity-75`}>Não há manutenções vencidas deste tipo</p>
                    </>
                  )}
                </div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`${isMobile ? 'p-3' : 'p-4'} border-b cursor-pointer transition-all duration-200 ${
                      isDarkMode ? 'border-gray-700/40 hover:bg-gray-700/30 backdrop-blur-md' : 'border-gray-100/25 hover:bg-gray-50/20 backdrop-blur-xl'
                    }`}
                  >
                    <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                      {/* Cabeçalho da máquina */}
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {isMobile 
                            ? `${notification.title} - ${(notification.equipment.part_name || 'MANUTENÇÃO').length > 15 
                                ? (notification.equipment.part_name || 'MANUTENÇÃO').substring(0, 15) + '...' 
                                : notification.equipment.part_name || 'MANUTENÇÃO'}`
                            : `${notification.title} - ${notification.equipment.part_name || 'MANUTENÇÃO'}`
                          }
                        </h4>
                        <span className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'} rounded ${
                          notification.equipment.remaining_hours < 0 
                            ? isDarkMode ? 'bg-red-900/30 text-red-400 backdrop-blur-md' : 'bg-red-100/25 text-red-700 backdrop-blur-xl'
                            : notification.equipment.remaining_hours <= 10 
                              ? isDarkMode ? 'bg-orange-900/30 text-orange-400 backdrop-blur-md' : 'bg-orange-100/25 text-orange-700 backdrop-blur-xl'
                              : isDarkMode ? 'bg-blue-900/30 text-blue-400 backdrop-blur-md' : 'bg-blue-100/25 text-blue-700 backdrop-blur-xl'
                        }`}>
                          {notification.equipment.remaining_hours < 0 
                            ? `Vencida há ${Math.abs(notification.equipment.remaining_hours)}h`
                            : `${notification.equipment.remaining_hours}h restantes`
                          }
                        </span>
                      </div>
                      
                      {/* Informações da máquina */}
                      <div className={`${isMobile ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-3'} text-xs`}>
                        <div className={`flex items-center space-x-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <FaClock className="text-xs opacity-60" />
                          <span>Trabalhadas: {parseFloat(notification.equipment.worked_hours || 0).toFixed(1)}h</span>
                        </div>
                        
                        <div className={`flex items-center space-x-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span>{formatTimeAgo(notification.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {lastUpdate && (
              <div className={`flex-shrink-0 ${isMobile ? 'px-3 py-2' : 'px-5 py-3'} border-t text-center ${
                isDarkMode ? 'border-gray-700/40 bg-gray-800/30 backdrop-blur-md' : 'border-gray-200/25 bg-gray-50/20 backdrop-blur-xl'
              }`}>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dropdown do filtro como overlay fixo */}
      {isFilterOpen && (
        <div 
          className={`fixed z-[9999] border-2 border-t-0 rounded-b-xl max-h-48 overflow-y-auto filter-dropdown ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-500 shadow-2xl shadow-black/50' 
              : 'bg-blue-800/95 border-blue-600/60 shadow-2xl shadow-blue-900/40 backdrop-blur-xl'
          }`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {maintenanceTypes.map(type => {
            const count = type === 'todos' 
              ? notifications.length 
              : notifications.filter(n => 
                  n.equipment.part_name && 
                  maintenanceMapping.get(n.equipment.part_name) === type
                ).length;
            
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedFilter(type);
                  setIsFilterOpen(false);
                }}
                className={`w-full text-left px-4 py-3 transition-colors duration-150 flex items-center justify-between border-b last:border-b-0 ${
                  selectedFilter === type 
                    ? isDarkMode 
                      ? 'bg-blue-600 text-white border-blue-500' 
                      : 'bg-blue-700/70 text-blue-100 border-blue-600/50'
                    : isDarkMode 
                      ? 'text-gray-200 hover:bg-gray-600 border-gray-500 hover:text-white' 
                      : 'text-white hover:bg-blue-700/70 border-blue-600/40 hover:border-blue-500/50'
                }`}
              >
                <span className="text-sm font-medium">
                  {type === 'todos' ? 'Todos os tipos' : type}
                </span>
                {type !== 'todos' && (
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    selectedFilter === type
                      ? isDarkMode 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-600/70 text-blue-50 border border-blue-500/50'
                      : isDarkMode 
                        ? 'bg-gray-600 text-gray-200' 
                        : 'bg-blue-900/50 text-blue-200 border border-blue-800/50'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
