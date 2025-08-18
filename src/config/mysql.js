const getMysqlConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    return {
      host: process.env.REACT_APP_MYSQL_HOST || 'localhost',
      port: process.env.REACT_APP_MYSQL_PORT || '3002',
      baseURL: process.env.REACT_APP_MYSQL_BASE_URL || 'http://localhost:3002',
      serverURL: process.env.REACT_APP_SERVER_URL || 'http://localhost:3002'
    };
  } else {
    return {
      host: process.env.REACT_APP_MYSQL_HOST || '77.37.41.27',
      port: process.env.REACT_APP_MYSQL_PORT || '4001',
      baseURL: process.env.REACT_APP_MYSQL_BASE_URL || 'http://77.37.41.27:4001',
      serverURL: process.env.REACT_APP_SERVER_URL || 'http://77.37.41.27:4001'
    };
  }
};

export const MYSQL_CONFIG = getMysqlConfig();

// Funções utilitárias para construir URLs
export const buildMysqlUrl = (endpoint) => {
  const baseUrl = MYSQL_CONFIG.serverURL;
  return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
};

export const buildDevicesUrl = () => buildMysqlUrl('/api/table/tc_devices');

export const buildPositionsUrl = (deviceId, startDate, endDate) => 
  buildMysqlUrl(`/api/positions/device/${deviceId}?startDate=${startDate}&endDate=${endDate}`);

export default MYSQL_CONFIG;
