import { useState, useCallback } from 'react';

const useMysql = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuração do servidor MySQL
  const MYSQL_SERVER_URL = import.meta.env.VITE_SERVER_URL || 
    import.meta.env.REACT_APP_SERVER_URL ||
    (import.meta.env.MODE === 'production' 
      ? 'http://77.37.41.27:4001' 
      : 'http://localhost:3002');

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = endpoint.startsWith('/') ? `${MYSQL_SERVER_URL}${endpoint}` : `${MYSQL_SERVER_URL}/${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Erro na conexão MySQL: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Erro na conexão com servidor MySQL:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [MYSQL_SERVER_URL]);

  // Métodos específicos para as operações do MySQL
  const getDevices = useCallback(async () => {
    return await request('/api/table/tc_devices');
  }, [request]);

  const getPositions = useCallback(async (deviceId, startDate, endDate) => {
    return await request(`/api/positions/device/${deviceId}?startDate=${startDate}&endDate=${endDate}`);
  }, [request]);

  return { 
    request, 
    loading, 
    error, 
    MYSQL_SERVER_URL,
    getDevices,
    getPositions 
  };
};

export default useMysql;
