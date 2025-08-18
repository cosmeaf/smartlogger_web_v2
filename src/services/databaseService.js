// src/services/databaseService.js
import axios from 'axios';

// URL local usando proxy do Vite - vai redirecionar para http://localhost:3002
const DATABASE_API_URL = '/database';

const databaseService = {
  // Buscar todos os dispositivos da tabela tc_devices
  async getTcDevices() {
    try {
      console.log('🔄 Buscando dispositivos da tabela tc_devices...');
      
      // Fazer requisição para /database/tc-devices (vai ser redirecionado pelo proxy)
      const response = await axios.get(`${DATABASE_API_URL}/tc-devices`);
      
      console.log('✅ Dados recebidos:', response.data);
      
      return {
        data: response.data.data || [],
        success: response.data.success,
        count: response.data.count,
        message: response.data.message || 'Dados obtidos com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar dispositivos:', error);
      
      // Se der erro na API, usar dados mock como fallback
      console.log('🔄 Usando dados mock como fallback...');
      const mockData = [
        {
          id: 1,
          name: 'Device 001',
          uniqueid: 'DEV001',
          status: 'online',
          lastupdate: '2025-08-14 10:30:00',
          positionid: 12345,
          groupid: 1,
          phone: '+5511999999999',
          model: 'GPS Tracker Model A',
          contact: 'João Silva',
          category: 'vehicle',
          disabled: false,
        },
        {
          id: 2,
          name: 'Device 002',
          uniqueid: 'DEV002',
          status: 'offline',
          lastupdate: '2025-08-14 09:15:00',
          positionid: 12346,
          groupid: 1,
          phone: '+5511888888888',
          model: 'GPS Tracker Model B',
          contact: 'Maria Santos',
          category: 'vehicle',
          disabled: false,
        },
        {
          id: 3,
          name: 'Device 003',
          uniqueid: 'DEV003',
          status: 'online',
          lastupdate: '2025-08-14 11:00:00',
          positionid: 12347,
          groupid: 2,
          phone: '+5511777777777',
          model: 'GPS Tracker Model C',
          contact: 'Pedro Costa',
          category: 'person',
          disabled: false,
        },
      ];

      return {
        data: mockData,
        success: true,
        count: mockData.length,
        message: '⚠️ Usando dados mock (erro na conexão com o banco)'
      };
    }
  },

  // Executar query SQL personalizada
  async executeSqlQuery(query) {
    try {
      console.log('📝 Executando query personalizada:', query);
      
      const response = await axios.post(`${DATABASE_API_URL}/query`, {
        query: query
      });

      console.log('✅ Query executada com sucesso:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro ao executar query SQL:', error);
      throw error;
    }
  },

  // Testar conexão com o servidor
  async testConnection() {
    try {
      const response = await axios.get(`${DATABASE_API_URL}/test`);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      throw error;
    }
  }
};

export default databaseService;
