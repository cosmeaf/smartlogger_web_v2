// Utilitário para debug das variáveis de ambiente
export const debugEnvVars = () => {
  console.log('🔍 DEBUG: Variáveis de Ambiente Carregadas');
  console.log('MODE:', import.meta.env.MODE);
  console.log('PROD:', import.meta.env.PROD);
  console.log('DEV:', import.meta.env.DEV);
  console.log('');
  
  console.log('📡 Variáveis VITE_:');
  console.log('VITE_MYSQL_HOST:', import.meta.env.VITE_MYSQL_HOST);
  console.log('VITE_MYSQL_PORT:', import.meta.env.VITE_MYSQL_PORT);
  console.log('VITE_SERVER_URL:', import.meta.env.VITE_SERVER_URL);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('VITE_FRONTEND_DOMAIN:', import.meta.env.VITE_FRONTEND_DOMAIN);
  console.log('');
  
  console.log('⚛️ Variáveis REACT_APP_:');
  console.log('REACT_APP_MYSQL_HOST:', import.meta.env.REACT_APP_MYSQL_HOST);
  console.log('REACT_APP_MYSQL_PORT:', import.meta.env.REACT_APP_MYSQL_PORT);
  console.log('REACT_APP_SERVER_URL:', import.meta.env.REACT_APP_SERVER_URL);
  
  const finalConfig = {
    host: import.meta.env.VITE_MYSQL_HOST || import.meta.env.REACT_APP_MYSQL_HOST || '77.37.41.27',
    port: import.meta.env.VITE_MYSQL_PORT || import.meta.env.REACT_APP_MYSQL_PORT || '4001',
    serverURL: import.meta.env.VITE_SERVER_URL || import.meta.env.REACT_APP_SERVER_URL || 'http://77.37.41.27:4001',
    domain: import.meta.env.VITE_FRONTEND_DOMAIN || 'https://smartlogger.com.br'
  };
  
  console.log('⚙️ Configuração Final Resolvida:', finalConfig);
  console.log('=====================================');
  
  return finalConfig;
};
