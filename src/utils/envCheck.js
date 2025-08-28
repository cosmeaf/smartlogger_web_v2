// Utilitário para debug das variáveis de ambiente
export const debugEnvVars = () => {
  const currentMode = import.meta.env.MODE;
  const isProduction = import.meta.env.PROD;
  const isDevelopment = import.meta.env.DEV;

  console.log('🔍 DEBUG: Variáveis de Ambiente Carregadas');
  console.log('=====================================');

  // Mostra apenas o modo atual de forma clara
  if (isDevelopment) {
    console.log('�️ MODO: DESENVOLVIMENTO');
    console.log('📁 Arquivo: .env.development');
  } else if (isProduction) {
    console.log('🏭 MODO: PRODUÇÃO');
    console.log('📁 Arquivo: .env.production');
  } else {
    console.log('❓ MODO: DESCONHECIDO');
  }

  console.log('');

  // Configuração final resolvida de forma compacta
  const finalConfig = {
    mode: currentMode,
    host: import.meta.env.VITE_MYSQL_HOST || '77.37.41.27',
    port: isDevelopment
      ? import.meta.env.VITE_PORT || '3001'
      : import.meta.env.VITE_MYSQL_PORT || '4001',
    serverURL: import.meta.env.VITE_SERVER_URL || 'http://77.37.41.27:4001',
    apiURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL,
    domain: import.meta.env.VITE_FRONTEND_DOMAIN || 'https://smartlogger.com.br',
    apiProxy: import.meta.env.VITE_API_PROXY,
    nodeEnv: import.meta.env.NODE_ENV
  };

  console.log('⚙️ CONFIGURAÇÃO FINAL:', finalConfig);
  console.log('=====================================');

  return finalConfig;
};
