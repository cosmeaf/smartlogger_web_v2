import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Função para buscar dados de manutenção
  const fetchMaintenanceNotifications = async () => {
    try {
      setLoading(true);
      
      const [devices, equipments, maintenances] = await Promise.all([
        api.get('/devices/'),
        api.get('/equipments/'),
        api.get('/maintenances/') // Buscar dados de manutenção
      ]);

      // Merge equipamentos com devices e manutenções
      const mergedEquipments = equipments.data.map((equipment) => {
        const deviceData = devices.data.find((d) => String(d.device_id) === String(equipment.device));
        return { ...equipment, deviceData };
      });

      // Primeiro filtro: equipamentos que precisam de manutenção (min_remaining_hours < 0)
      const equipmentsNeedingMaintenance = mergedEquipments.filter(eq => 
        eq.min_remaining_hours !== undefined && 
        eq.min_remaining_hours !== null &&
        eq.min_remaining_hours < 0 && // Equipamento precisa de manutenção
        eq.name
      );

      // Para cada equipamento que precisa de manutenção, buscar todas as peças críticas
      const criticalMaintenances = [];
      
      equipmentsNeedingMaintenance.forEach(equipment => {
        // Buscar todas as manutenções deste equipamento que estão vencidas
        const equipmentMaintenances = maintenances.data.filter(maintenance => 
          String(maintenance.equipment) === String(equipment.id) &&
          maintenance.remaining_hours !== undefined &&
          maintenance.remaining_hours !== null &&
          maintenance.remaining_hours < 0 && // Manutenção vencida
          maintenance.name
        );

        // Adicionar cada manutenção vencida à lista
        equipmentMaintenances.forEach(maintenance => {
          criticalMaintenances.push({
            equipment: equipment,
            maintenance: maintenance
          });
        });
      });

      console.log('=== FILTRO DE MANUTENÇÕES ===');
      console.log('Equipamentos que precisam de manutenção:', equipmentsNeedingMaintenance.length);
      console.log('Total de manutenções críticas encontradas:', criticalMaintenances.length);
      
      if (criticalMaintenances.length > 0) {
        console.log('Exemplo de manutenção crítica:', {
          equipamento: criticalMaintenances[0].equipment.name,
          peca: criticalMaintenances[0].maintenance.name,
          horasVencidas: Math.abs(criticalMaintenances[0].maintenance.remaining_hours)
        });
      }

      // Ordenar por urgência: mais vencidas primeiro (números mais negativos)
      const sortedMaintenances = criticalMaintenances
        .sort((a, b) => a.maintenance.remaining_hours - b.maintenance.remaining_hours);

      // Criar notas de manutenção (todas serão críticas pois estão vencidas)
      const maintenanceNotifications = sortedMaintenances.map((item, index) => {
        const { equipment, maintenance } = item;
        const priority = 'critical';
        const type = 'error';
        const message = `${maintenance.name} vencida há ${Math.abs(maintenance.remaining_hours)} horas de uso`;
        const icon = '🚨';
        const status = 'VENCIDO';

        return {
          id: `maintenance_${equipment.id}_${maintenance.id}`,
          title: equipment.name, // Nome da máquina
          message,
          type,
          priority,
          icon,
          status,
          timestamp: new Date(),
          read: false,
          position: index + 1, // Posição no ranking
          equipment: {
            id: equipment.id,
            name: equipment.name,
            part_name: maintenance.name, // Nome da peça/manutenção (ex: "Óleo do motor")
            remaining_hours: maintenance.remaining_hours,
            worked_hours: maintenance.worked_hours || 0,
            device_id: equipment.device,
            alarm_hours: maintenance.alarm_hours,
            initial_hour_maintenance: maintenance.initial_hour_maintenance,
            min_remaining_hours: equipment.min_remaining_hours // Valor geral do equipamento
          }
        };
      });

      setNotifications(maintenanceNotifications);
      
      // Todas são críticas (vencidas), então o contador é igual ao total
      setUnreadCount(maintenanceNotifications.length);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Erro ao buscar notificações de manutenção:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Atualizar contador
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Obter notificações por prioridade
  const getNotificationsByPriority = (priority) => {
    return notifications.filter(n => n.priority === priority);
  };

  // Obter notificações críticas
  const getCriticalNotifications = () => {
    return notifications.filter(n => n.priority === 'critical');
  };

  // Obter notificações urgentes
  const getUrgentNotifications = () => {
    return notifications.filter(n => n.priority === 'urgent');
  };

  // Obter notificações que precisam de atenção
  const getAttentionNotifications = () => {
    return notifications.filter(n => n.priority === 'attention');
  };

  // Obter top máquinas mais próximas de trocar óleo
  const getTopMaintenanceNeeded = (limit = 5) => {
    return notifications.slice(0, limit);
  };

  // Atualizar notificações automaticamente a cada 5 minutos
  useEffect(() => {
    fetchMaintenanceNotifications();
    
    const interval = setInterval(() => {
      fetchMaintenanceNotifications();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    lastUpdate,
    fetchMaintenanceNotifications,
    markAsRead,
    markAllAsRead,
    getNotificationsByPriority,
    getCriticalNotifications,
    getUrgentNotifications,
    getAttentionNotifications,
    getTopMaintenanceNeeded
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
