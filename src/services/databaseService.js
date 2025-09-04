// src/services/databaseService.js
import axios from 'axios';

// URLs possíveis para tentar conectar
const getApiUrls = () => {
  const urls = [];
  
  if (import.meta.env.MODE === 'development') {
    // Em desenvolvimento, tentar primeiro localhost, depois produção
    urls.push(import.meta.env.VITE_SERVER_URL || 'http://localhost:3002');
    urls.push('https://apidev.smartlogger.com.br');
  } else {
    // Em produção, tentar primeiro produção, depois localhost
    urls.push(import.meta.env.VITE_SERVER_URL || 'https://api.smartlogger.com.br');
    urls.push('http://localhost:3002');
  }
  
  return urls;
};

const API_URLS = getApiUrls();

// Sistema de cache para URL funcional
let workingApiUrl = null;
let lastFailureTime = {};
const RETRY_DELAY = 30000; // 30 segundos antes de tentar novamente uma URL que falhou

console.log('🌐 Database Service - URLs disponíveis:', API_URLS);
console.log('🔧 Modo:', import.meta.env.MODE);
console.log('🔧 VITE_SERVER_URL:', import.meta.env.VITE_SERVER_URL);

// Função inteligente para tentar conectar com cache e retry
const smartRequest = async (endpoint, options = {}) => {
  const now = Date.now();
  
  // Se temos uma URL que funciona, tentar ela primeiro
  if (workingApiUrl) {
    try {
      const response = await axios({
        ...options,
        url: `${workingApiUrl}${endpoint}`,
        timeout: 15000, // Aumentado para 15 segundos
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      return response;
      
    } catch (error) {
      console.warn(`⚠️ URL cachada falhou: ${workingApiUrl} - tentando outras opções...`);
      workingApiUrl = null; // Limpar cache
    }
  }
  
  // Tentar todas as URLs disponíveis
  const urlsToTry = API_URLS.filter(url => {
    // Pular URLs que falharam recentemente
    const lastFailure = lastFailureTime[url];
    if (lastFailure && (now - lastFailure) < RETRY_DELAY) {
      return false;
    }
    return true;
  });
  
  if (urlsToTry.length === 0) {
    // Se todas as URLs estão em cooldown, tentar a mais antiga
    urlsToTry.push(API_URLS[0]);
  }
  
  let lastError = null;
  
  for (const url of urlsToTry) {
    try {
      console.log(`🔄 Tentando: ${url}${endpoint}`);
      
      const response = await axios({
        ...options,
        url: `${url}${endpoint}`,
        timeout: 15000, // Aumentado para 15 segundos
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      // Sucesso! Cachear esta URL
      workingApiUrl = url;
      delete lastFailureTime[url]; // Limpar falhas anteriores
      
      if (urlsToTry.indexOf(url) > 0) {
        console.log(`✅ Conectado com sucesso em: ${url}`);
      }
      
      return response;
      
    } catch (error) {
      lastError = error;
      lastFailureTime[url] = now;
      
      // Só mostrar erro detalhado se for o último URL
      if (urlsToTry.indexOf(url) === urlsToTry.length - 1) {
        console.error(`❌ Todas as URLs falharam para ${endpoint}`);
        console.error('Último erro:', error.message);
      }
    }
  }
  
  throw lastError;
};

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
      
      const response = await smartRequest(`/api/table/${tableName}?${params.toString()}`, {
        method: 'GET'
      });
      
      console.log('✅ Dados recebidos:', response.data);
      
      return {
        data: response.data.data || [],
        success: response.data.success,
        count: response.data.count,
        message: response.data.message || 'Dados obtidos com sucesso',
        tableName
      };
      
    } catch (error) {
      console.error(`❌ Erro ao buscar dados da tabela ${tableName}:`, error.message);
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
      
      const response = await smartRequest(`/api/table/${tableName}?${params.toString()}`, {
        method: 'GET'
      });
      
      console.log('✅ Query personalizada executada:', response.data);
      
      return {
        data: response.data.data || [],
        success: response.data.success,
        count: response.data.count,
        message: response.data.message || 'Query executada com sucesso',
        tableName
      };
      
    } catch (error) {
      console.error(`❌ Erro ao executar query personalizada:`, error.message);
      throw error;
    }
  },

  // Buscar todos os dispositivos da tabela tc_devices
  async getTcDevices() {
    try {
      console.log('🔄 Buscando dispositivos da tabela tc_devices...');
      console.log('🌐 URLs disponíveis:', API_URLS);
      console.log('📱 URL em cache:', workingApiUrl);
      
      const response = await smartRequest('/api/table/tc_devices', {
        method: 'GET'
      });
      
      console.log('✅ Dispositivos recebidos:', response.data);
      
      return response.data.data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar dispositivos:', error.message);
      console.error('🔍 Detalhes do erro:', {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Buscar posições de um dispositivo específico com filtro de período
  async getDevicePositions(deviceId, startDate, endDate, limit = 1000) {
    try {
      console.log(`🔄 Buscando posições do dispositivo ${deviceId}...`);
      
      let endpoint = `/api/positions/device/${deviceId}?limit=${limit}`;
      
      if (startDate && endDate) {
        endpoint += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await smartRequest(endpoint, {
        method: 'GET'
      });
      
      console.log('✅ Posições recebidas:', response.data);
      
      return response.data.data || [];
      
    } catch (error) {
      console.error(`❌ Erro ao buscar posições do dispositivo ${deviceId}:`, error.message);
      throw error;
    }
  },

  // Listar todas as tabelas disponíveis no banco
  async getAllTables() {
    try {
      console.log('🔄 Buscando lista de tabelas...');
      
      const response = await smartRequest('/api/tables', {
        method: 'GET'
      });
      
      console.log('✅ Tabelas recebidas:', response.data);
      
      return {
        data: response.data.data || [],
        success: response.data.success,
        count: response.data.count,
        message: response.data.message || 'Tabelas obtidas com sucesso'
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar tabelas:', error.message);
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
      
      const response = await smartRequest(`/api/table/${tableName}?${params.toString()}`, {
        method: 'GET'
      });
      
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
      console.error(`❌ Erro ao buscar dados avançados da tabela ${tableName}:`, error.message);
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
      const response = await smartRequest('/api/tables', {
        method: 'GET'
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error.message);
      throw error;
    }
  },

  // Buscar dados de estatísticas
  async getStats(tableName) {
    try {
      console.log(`🔄 Buscando estatísticas da tabela ${tableName}...`);
      
      const response = await smartRequest(`/api/table/${tableName}?limit=1`, {
        method: 'GET'
      });
      
      return {
        tableName,
        totalRecords: response.data.count || 0,
        hasData: (response.data.data && response.data.data.length > 0),
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas da tabela ${tableName}:`, error.message);
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
      console.error(`❌ Erro ao buscar dados paginados:`, error.message);
      throw error;
    }
  },

  // Método para obter informações do sistema de conexão
  getConnectionInfo() {
    return {
      workingUrl: workingApiUrl,
      availableUrls: API_URLS,
      failureTimes: lastFailureTime,
      retryDelay: RETRY_DELAY,
      mode: import.meta.env.MODE
    };
  },

  // Método para forçar reset do cache de URLs
  resetConnectionCache() {
    workingApiUrl = null;
    Object.keys(lastFailureTime).forEach(url => {
      delete lastFailureTime[url];
    });
    console.log('🔄 Cache de conexão resetado');
  }
};

export default databaseService;
