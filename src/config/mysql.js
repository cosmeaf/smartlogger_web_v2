const getMysqlConfig = () => {
  const isDevelopment = import.meta.env.MODE === 'development';
  
  if (isDevelopment) {
    return {
      host: import.meta.env.VITE_MYSQL_HOST || import.meta.env.REACT_APP_MYSQL_HOST || 'localhost',
      port: import.meta.env.VITE_MYSQL_PORT || import.meta.env.REACT_APP_MYSQL_PORT || '3002',
      baseURL: import.meta.env.VITE_MYSQL_BASE_URL || import.meta.env.REACT_APP_MYSQL_BASE_URL || 'http://localhost:3002',
      serverURL: import.meta.env.VITE_SERVER_URL || import.meta.env.REACT_APP_SERVER_URL || 'http://localhost:3002'
    };
  } else {
    return {
      host: import.meta.env.VITE_MYSQL_HOST || import.meta.env.REACT_APP_MYSQL_HOST || '77.37.41.27',
      port: import.meta.env.VITE_MYSQL_PORT || import.meta.env.REACT_APP_MYSQL_PORT || '4001',
      baseURL: import.meta.env.VITE_MYSQL_BASE_URL || import.meta.env.REACT_APP_MYSQL_BASE_URL || 'http://77.37.41.27:4001',
      serverURL: import.meta.env.VITE_SERVER_URL || import.meta.env.REACT_APP_SERVER_URL || 'http://77.37.41.27:4001'
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
