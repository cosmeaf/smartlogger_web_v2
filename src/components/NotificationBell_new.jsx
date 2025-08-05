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

  // Obter tipos únicos de manutenção
  const maintenanceTypes = React.useMemo(() => {
    const types = new Set();
    notifications.forEach(notification => {
      if (notification.equipment.part_name) {
        types.add(notification.equipment.part_name);
      }
    });
    return ['todos', ...Array.from(types).sort()];
  }, [notifications]);

  // Filtrar notificações baseado no filtro selecionado
  const filteredNotifications = React.useMemo(() => {
    if (selectedFilter === 'todos') {
      return notifications;
    }
    return notifications.filter(notification => 
      notification.equipment.part_name === selectedFilter
    );
  }, [notifications, selectedFilter]);

  // Estatísticas das notas de manutenção
  const criticalCount = getCriticalNotifications().length;
  const urgentCount = getUrgentNotifications().length;
  const attentionCount = getAttentionNotifications().length;

  const handleNotificationClick = (notification) => {
    // Sempre permite visualizar, não marca como lida automaticamente
    // O usuário pode marcar como "vista" se quiser
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'urgent':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'attention':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusBadge = (status, priority) => {
    const colors = {
      'VENCIDO': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'URGENTE': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'ATENÇÃO': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'NORMAL': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
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
        className={`relative p-3 rounded-lg transition-all duration-200 ${
          isDarkMode 
            ? 'hover:bg-gray-700/50 text-gray-300 hover:text-blue-400' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
        }`}
        title="Manutenções Vencidas"
      >
        <FaClipboardList className={isMobile ? 'text-base' : 'text-xl'} />
        
        {/* Badge de contagem simplificado */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Indicador de carregamento simplificado */}
        {loading && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
        )}
      </button>

      {/* Dropdown de notificações */}
      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de notificações */}
          <div className={`absolute ${isMobile ? 'right-0 top-14 w-80' : 'right-0 top-14 w-96'} z-50 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border rounded-xl shadow-2xl max-h-[80vh] overflow-hidden backdrop-blur-sm`}>
            
            {/* Header */}
            <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <FaClipboardList className={`text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Manutenções Vencidas
                    </h3>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {filteredNotifications.length} de {notifications.length} manutenções críticas
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>

              {/* Filtro por tipo de manutenção */}
              {maintenanceTypes.length > 2 && (
                <div className="mt-4">
                  <label className={`text-xs font-medium block mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Filtrar por tipo:
                  </label>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    {maintenanceTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'todos' ? 'Todos os tipos' : type}
                        {type !== 'todos' && ` (${notifications.filter(n => n.equipment.part_name === type).length})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Resumo de prioridades simplificado */}
              {filteredNotifications.length > 0 && (
                <div className="flex items-center justify-between mt-4 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-1 ${
                      isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium">{filteredNotifications.length} vencidas</span>
                    </div>
                    {selectedFilter !== 'todos' && (
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedFilter}
                      </div>
                    )}
                  </div>
                  {selectedFilter !== 'todos' && (
                    <button
                      onClick={() => setSelectedFilter('todos')}
                      className={`text-xs hover:underline ${
                        isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      Ver todos
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Lista de notificações */}
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className={`p-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <FaClipboardList className="text-2xl opacity-50" />
                  </div>
                  {selectedFilter === 'todos' ? (
                    <>
                      <p className="font-medium text-sm">Nenhuma manutenção vencida</p>
                      <p className="text-xs mt-1 opacity-75">Todas as manutenções estão em dia</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-sm">Nenhuma manutenção de "{selectedFilter}"</p>
                      <p className="text-xs mt-1 opacity-75">Não há manutenções vencidas deste tipo</p>
                    </>
                  )}
                </div>
              ) : (
                filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Cabeçalho da máquina */}
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-sm ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.title} - {notification.equipment.part_name || 'MANUTENÇÃO'}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          notification.equipment.remaining_hours < 0 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : notification.equipment.remaining_hours <= 10 
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {notification.equipment.remaining_hours < 0 
                            ? `Vencida há ${Math.abs(notification.equipment.remaining_hours)}h`
                            : `${notification.equipment.remaining_hours}h restantes`
                          }
                        </span>
                      </div>
                      
                      {/* Informações da máquina */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className={`flex items-center space-x-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <FaClock className="text-xs opacity-60" />
                          <span>Trabalhadas: {notification.equipment.worked_hours}h</span>
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
              <div className={`px-5 py-3 border-t text-center ${
                isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
              }`}>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
