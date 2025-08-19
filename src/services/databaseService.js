// src/services/databaseService.js
import axios from 'axios';

// URL base do backend - usar proxy do Vite em desenvolvimento
// Configuração da URL base da API
const getApiBaseUrl = () => {
  if (import.meta.env.MODE === 'development') {
    return import.meta.env.VITE_API_URL || 'http://localhost:3002';
  } else {
    return import.meta.env.VITE_API_URL || 'http://localhost:4001';
  }
};

const API_BASE_URL = getApiBaseUrl();

const databaseService = {
  // Método genérico para buscar dados de qualquer tabela
  async getTableData(tableName, limit = 100, filters = {}) {
    try {
      console.log(`🔄 Buscando dados da tabela ${tableName}...`);
      
      // Construir parâmetros da query
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...filters
      });
      
      const response = await axios.get(`/api/table/${tableName}?${params.toString()}`);
      
      console.log('✅ Dados recebidos:', response.data);
      
      return {
        data: response.data.data || [],
        success: response.data.success,
        count: response.data.count,
        message: response.data.message || 'Dados obtidos com sucesso',
        tableName
      };
      
    } catch (error) {
      console.error(`❌ Erro ao buscar dados da tabela ${tableName}:`, error);
      throw error;
    }
  },

  // Método para buscar dados com query SQL personalizada
  async getCustomQuery(tableName, whereClause = '', orderBy = '', limit = 100) {
    try {
      console.log(`🔄 Executando query personalizada na tabela ${tableName}...`);
      
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      if (whereClause) params.append('where', whereClause);
      if (orderBy) params.append('order', orderBy);
      
      const response = await axios.get(`/api/table/${tableName}?${params.toString()}`);
      
      console.log('✅ Query personalizada executada:', response.data);
      
      return {
        data: response.data.data || [],
        success: response.data.success,
        count: response.data.count,
        message: response.data.message || 'Query executada com sucesso',
        tableName
      };
      
    } catch (error) {
      console.error(`❌ Erro ao executar query personalizada:`, error);
      throw error;
    }
  },

  // Buscar todos os dispositivos da tabela tc_devices
  async getTcDevices() {
    try {
      console.log('🔄 Buscando dispositivos da tabela tc_devices...');
      
      const response = await axios.get('/api/table/tc_devices');
      
      console.log('✅ Dispositivos recebidos:', response.data);
      
      return response.data.data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar dispositivos:', error);
      throw error;
    }
  },

  // Buscar posições de um dispositivo específico com filtro de período
  async getDevicePositions(deviceId, startDate, endDate, limit = 1000) {
    try {
      console.log(`🔄 Buscando posições do dispositivo ${deviceId}...`);
      
      let url = `/api/positions/device/${deviceId}?limit=${limit}`;
      
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await axios.get(url);
      
      console.log('✅ Posições recebidas:', response.data);
      
      return response.data.data || [];
      
    } catch (error) {
      console.error(`❌ Erro ao buscar posições do dispositivo ${deviceId}:`, error);
      throw error;
    }
  },

  // Listar todas as tabelas disponíveis no banco
  async getAllTables() {
    try {
      console.log('🔄 Buscando lista de tabelas...');
      
      const response = await axios.get('/api/tables');
      
      console.log('✅ Tabelas recebidas:', response.data);
      
      return {
        data: response.data.data || [],
        success: response.data.success,
        count: response.data.count,
        message: response.data.message || 'Tabelas obtidas com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar tabelas:', error);
      throw error;
    }
  },

  // Buscar dados com filtros avançados para qualquer tabela
  async getAdvancedData(tableName, options = {}) {
    try {
      const {
        where = '',
        orderBy = 'id DESC',
        limit = 100,
        offset = 0,
        columns = '*'
      } = options;

      console.log(`🔄 Buscando dados avançados da tabela ${tableName}...`, options);
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });

      if (where) params.append('where', where);
      if (orderBy) params.append('order', orderBy);
      if (columns !== '*') params.append('columns', columns);
      
      const response = await axios.get(`/api/table/${tableName}?${params.toString()}`);
      
      console.log('✅ Dados avançados recebidos:', response.data);
      
      return {
        data: response.data.data || [],
        success: response.data.success,
        count: response.data.count,
        message: response.data.message || 'Dados obtidos com sucesso',
        tableName,
        options
      };
      
    } catch (error) {
      console.error(`❌ Erro ao buscar dados avançados da tabela ${tableName}:`, error);
      throw error;
    }
  },

  // Buscar posições com filtros específicos
  async getPositionsWithFilters(deviceId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        minSpeed = null,
        maxSpeed = null,
        hasAttributes = null,
        limit = 1000
      } = filters;

      console.log(`🔄 Buscando posições filtradas do dispositivo ${deviceId}...`, filters);
      
      let whereConditions = [`deviceid = ${deviceId}`];
      
      if (startDate && endDate) {
        whereConditions.push(`devicetime BETWEEN '${startDate}' AND '${endDate}'`);
      }
      
      if (minSpeed !== null) {
        whereConditions.push(`speed >= ${minSpeed}`);
      }
      
      if (maxSpeed !== null) {
        whereConditions.push(`speed <= ${maxSpeed}`);
      }
      
      if (hasAttributes !== null) {
        whereConditions.push(hasAttributes ? 'attributes IS NOT NULL' : 'attributes IS NULL');
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      return await this.getAdvancedData('tc_positions', {
        where: whereClause,
        orderBy: 'devicetime DESC',
        limit
      });
      
    } catch (error) {
      console.error(`❌ Erro ao buscar posições filtradas:`, error);
      throw error;
    }
  },

  // Testar conexão com o servidor
  async testConnection() {
    try {
      const response = await axios.get('/api/tables');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      throw error;
    }
  },

  // Buscar dados de estatísticas
  async getStats(tableName) {
    try {
      console.log(`🔄 Buscando estatísticas da tabela ${tableName}...`);
      
      const response = await axios.get(`/api/table/${tableName}?limit=1`);
      
      return {
        tableName,
        totalRecords: response.data.count || 0,
        hasData: (response.data.data && response.data.data.length > 0),
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas da tabela ${tableName}:`, error);
      return {
        tableName,
        totalRecords: 0,
        hasData: false,
        error: error.message
      };
    }
  },

  // Método para buscar dados paginados
  async getPaginatedData(tableName, page = 1, pageSize = 20, filters = {}) {
    try {
      const offset = (page - 1) * pageSize;
      
      return await this.getAdvancedData(tableName, {
        limit: pageSize,
        offset,
        ...filters
      });
      
    } catch (error) {
      console.error(`❌ Erro ao buscar dados paginados:`, error);
      throw error;
    }
  }
};

export default databaseService;
