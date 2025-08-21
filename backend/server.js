const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 4001 : 3002);

// Configuração do CORS com URLs permitidas
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3001',
  process.env.FRONTEND_PROD_URL || 'http://77.37.41.27:4000',
  process.env.FRONTEND_DEV_URL || 'http://localhost:3001'
].filter(Boolean);

// Middlewares
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Configuração do banco MySQL usando variáveis de ambiente
const dbConfig = {
  host: process.env.MYSQL_HOST || '77.37.41.27',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'superuser',
  password: process.env.MYSQL_PASSWORD || 'C0smeSmart@2024',
  database: process.env.MYSQL_DATABASE || 'traccar',
  // Configurações para reconexão automática
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: false
};

// Variável para armazenar a conexão
let connection;

// Função para criar/recriar conexão com o banco
function createConnection() {
  console.log('🔄 Criando nova conexão com o banco MySQL...');
  
  connection = mysql.createConnection(dbConfig);

  // Event listeners para a conexão
  connection.on('connect', () => {
    console.log('✅ Conectado ao banco MySQL com sucesso!');
  });

  connection.on('error', (err) => {
    console.error('❌ Erro na conexão MySQL:', err);

    // Sempre tenta reconectar em caso de erro de conexão
    if (
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ENETUNREACH' ||
      err.code === 'ECONNREFUSED'
    ) {
      console.log('🔄 Tentando reconectar ao banco de dados...');
      // Garante que não pare de tentar reconectar
      setTimeout(() => {
        try {
          createConnection();
        } catch (e) {
          console.error('❌ Falha ao tentar reconectar, tentando novamente em 5s...', e);
          setTimeout(createConnection, 5000);
        }
      }, 5000);
    } else {
      // Para outros erros, também tenta reconectar
      setTimeout(createConnection, 5000);
    }
  });

  connection.on('end', () => {
    console.log('⚠️ Conexão com MySQL foi encerrada');
    // Garante reconexão mesmo se for encerrada
    setTimeout(createConnection, 5000);
  });

  return connection;
}

// Função para executar queries com retry automático
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 3;
    
    function attemptQuery() {
      attempts++;
      
      if (!connection || connection.state === 'disconnected') {
        console.log('🔄 Conexão perdida, recriando...');
        createConnection();
      }
      
      connection.query(query, params, (error, results) => {
        if (error) {
          console.error(`❌ Erro na query (tentativa ${attempts}/${maxAttempts}):`, error);
          
          // Erros que justificam retry
          if ((error.code === 'PROTOCOL_CONNECTION_LOST' || 
               error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
               error.code === 'ECONNRESET' ||
               error.code === 'CONNECTION_LOST') && 
              attempts < maxAttempts) {
            
            console.log(`🔄 Tentando novamente em 2 segundos... (${attempts}/${maxAttempts})`);
            setTimeout(() => {
              createConnection();
              setTimeout(attemptQuery, 1000); // Aguardar 1 segundo após recriar conexão
            }, 2000);
            return;
          }
          
          reject(error);
        } else {
          resolve(results);
        }
      });
    }
    
    attemptQuery();
  });
}

// Criar conexão inicial
createConnection();

// ========== PÁGINA INICIAL ==========
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SmartLogger Database - Traccar Database</title>
        <style>
            * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
            }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                background: #f8fafc;
                color: #1a202c;
                line-height: 1.6;
            }
            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 40px 20px; 
            }
            .header { 
                background: white;
                padding: 40px; 
                text-align: center; 
                border-radius: 8px; 
                margin-bottom: 32px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                border: 1px solid #e2e8f0;
            }
            .header h1 { 
                font-size: 2.25rem; 
                margin-bottom: 8px; 
                color: #2d3748;
                font-weight: 600;
            }
            .header p {
                font-size: 1.1rem;
                color: #718096;
            }
            .status { 
                background: white;
                padding: 24px; 
                border-radius: 8px; 
                margin-bottom: 32px; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                border: 1px solid #e2e8f0;
                border-left: 4px solid #48bb78;
            }
            .status h3 {
                color: #2d3748;
                margin-bottom: 8px;
                font-size: 1.125rem;
                font-weight: 600;
            }
            .status p {
                color: #4a5568;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
                font-size: 0.9rem;
            }
            .section-title {
                font-size: 1.5rem;
                font-weight: 600;
                color: #2d3748;
                margin: 40px 0 24px 0;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 8px;
            }
            .tables-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
                gap: 20px; 
                margin-bottom: 40px;
            }
            .table-card { 
                background: white;
                padding: 24px; 
                border-radius: 8px; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                border: 1px solid #e2e8f0;
                transition: box-shadow 0.2s ease;
            }
            .table-card:hover { 
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .table-card h4 { 
                color: #2d3748; 
                margin-bottom: 8px; 
                font-size: 1.125rem;
                font-weight: 600;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
            }
            .table-card p {
                color: #718096;
                margin-bottom: 16px;
                font-size: 0.9rem;
                line-height: 1.5;
            }
            .btn-group {
                display: flex;
                gap: 8px;
            }
            .btn { 
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px; 
                background: #4299e1;
                color: white; 
                text-decoration: none; 
                border-radius: 6px; 
                font-size: 0.875rem;
                font-weight: 500;
                transition: background-color 0.2s ease;
                border: none;
                cursor: pointer;
            }
            .btn:hover { 
                background: #3182ce;
            }
            .btn.view { 
                background: #48bb78;
            }
            .btn.view:hover {
                background: #38a169;
            }
            .btn.json { 
                background: #ed8936;
            }
            .btn.json:hover {
                background: #dd6b20;
            }
            .footer {
                text-align: center;
                margin-top: 48px;
                padding-top: 24px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 0.875rem;
            }
            .footer p {
                margin: 4px 0;
            }
            .tech-info {
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
                font-size: 0.8rem;
                color: #a0aec0;
            }
            @media (max-width: 768px) {
                .container { padding: 20px 16px; }
                .header { padding: 24px; }
                .tables-grid { grid-template-columns: 1fr; gap: 16px; }
                .btn-group { flex-wrap: wrap; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1> SmartLogger Database</h1>
                <p>Interface para dados do Traccar Database</p>
            </div>

            <div class="status">
                <h3>Database Connection</h3>
                <p>HOST: ${dbConfig.host} | PORT: ${dbConfig.port} | DB: ${dbConfig.database} | STATUS: ONLINE</p>
            </div>

            <h2 class="section-title">Database Tables</h2>
            <div class="tables-grid">
                <div class="table-card">
                    <h4>tc_devices</h4>
                    <p>GPS tracking devices registered in the system</p>
                    <div class="btn-group">
                        <a href="/api/table/tc_devices" class="btn json">JSON</a>
                        <a href="/view/tc_devices" class="btn view">View</a>
                    </div>
                </div>
                
                <div class="table-card">
                    <h4>tc_positions</h4>
                    <p>GPS positions with telemetry data</p>
                    <div class="btn-group">
                        <a href="/api/table/tc_positions?limit=100" class="btn json">JSON</a>
                        <a href="/view/tc_positions" class="btn view">View</a>
                    </div>
                </div>
                
                <div class="table-card">
                    <h4>tc_events</h4>
                    <p>System events logged by devices</p>
                    <div class="btn-group">
                        <a href="/api/table/tc_events?limit=100" class="btn json">JSON</a>
                        <a href="/view/tc_events" class="btn view">View</a>
                    </div>
                </div>
                
                <div class="table-card">
                    <h4>tc_groups</h4>
                    <p>Device groups organization</p>
                    <div class="btn-group">
                        <a href="/api/table/tc_groups" class="btn json">JSON</a>
                        <a href="/view/tc_groups" class="btn view">View</a>
                    </div>
                </div>
                
                <div class="table-card">
                    <h4>tc_geofences</h4>
                    <p>Geofencing areas definition</p>
                    <div class="btn-group">
                        <a href="/api/table/tc_geofences" class="btn json">JSON</a>
                        <a href="/view/tc_geofences" class="btn view">View</a>
                    </div>
                </div>
                
                <div class="table-card">
                    <h4>All Tables</h4>
                    <p>Complete database schema browser</p>
                    <div class="btn-group">
                        <a href="/api/tables" class="btn json">List</a>
                        <a href="/tables" class="btn view">Browse</a>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>SmartLogger Database v${process.env.APP_VERSION || require('./package.json').version}</p>
                <p class="tech-info">Server running on port ${PORT} | Developed by Estevão Monteiro</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// ========== PÁGINA COM TODAS AS TABELAS ==========
app.get('/tables', async (req, res) => {
  const query = 'SHOW TABLES';
  
  try {
    const results = await executeQuery(query);
    let tables = results.map(row => Object.values(row)[0]);
    
    // Filtrar tabelas sensíveis por segurança
    tables = tables.filter(table => table !== 'tc_users');
    
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>All Tables - SmartLogger Database</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
              .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
              .nav { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .nav a { color: #667eea; text-decoration: none; margin-right: 15px; font-weight: 500; }
              .tables-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
              .table-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .table-card h4 { color: #667eea; margin-bottom: 8px; font-size: 0.9em; }
              .btn { display: inline-block; padding: 6px 12px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 2px; font-size: 0.8em; }
              .btn:hover { background: #5a6fd8; }
              .btn.view { background: #28a745; }
              .btn.json { background: #17a2b8; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🗂️ Todas as Tabelas Traccar</h1>
                  <p>Total: ${tables.length} tabelas disponíveis</p>
              </div>
              
              <div class="nav">
                  <a href="/">🏠 Início</a>
                  <a href="/api/tables">📥 JSON das Tabelas</a>
              </div>
              
              <div class="tables-grid">
                  ${tables.map(table => `
                      <div class="table-card">
                          <h4>${table}</h4>
                          <a href="/api/table/${table}" class="btn json">📥 JSON</a>
                          <a href="/view/${table}" class="btn view">👁️ Ver</a>
                      </div>
                  `).join('')}
              </div>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Erro ao buscar tabelas:', error);
    res.status(500).send(`
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2 style="color: #dc3545;">❌ Erro de Conexão com o Banco</h2>
        <p style="color: #6c757d; margin: 20px 0;">Não foi possível conectar ao banco de dados MySQL.</p>
        <p style="color: #6c757d;">Erro: ${error.message}</p>
        <button onclick="location.reload()" style="
          background: #007bff; color: white; border: none; padding: 10px 20px; 
          border-radius: 5px; cursor: pointer; margin-top: 20px;
        ">🔄 Tentar Novamente</button>
      </div>
    `);
  }
});

// ========== API ENDPOINTS ==========

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await executeQuery('SELECT 1 as test');
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      message: 'Servidor e banco de dados funcionando normalmente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
      message: 'Erro na conexão com o banco de dados'
    });
  }
});

// Endpoint genérico para qualquer tabela - JSON
app.get('/api/table/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  const limit = req.query.limit || 100;
  
  // Validação básica do nome da tabela
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return res.status(400).json({
      success: false,
      message: 'Nome de tabela inválido'
    });
  }
  
  // Bloquear acesso à tabela de usuários por segurança
  if (tableName === 'tc_users') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado: Tabela contém informações sensíveis de usuários',
      code: 'ACCESS_FORBIDDEN'
    });
  }
  
  const query = `SELECT * FROM ${tableName} LIMIT ?`;
  
  try {
    const results = await executeQuery(query, [parseInt(limit)]);
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      table: tableName,
      limit: limit,
      message: `${results.length} registros encontrados na tabela ${tableName}`
    });
  } catch (error) {
    console.error('❌ Erro na query:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados da tabela ' + tableName,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Endpoint genérico para visualizador de tabelas
app.get('/view/:tableName', async (req, res) => {
  const tableName = req.params.tableName;
  const limit = req.query.limit || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  
  // Validação básica do nome da tabela
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return res.status(400).send('<h2>❌ Nome de tabela inválido</h2>');
  }
  
  // Bloquear acesso à tabela de usuários por segurança
  if (tableName === 'tc_users') {
    return res.status(403).send(`
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2 style="color: #dc3545;">🚫 Acesso Negado</h2>
        <p style="color: #6c757d; margin: 20px 0;">A tabela <strong>${tableName}</strong> contém informações sensíveis de usuários.</p>
        <p style="color: #6c757d;">Acesso restrito por medidas de segurança.</p>
        <a href="/tables" style="
          background: #007bff; color: white; text-decoration: none; padding: 10px 20px; 
          border-radius: 5px; display: inline-block; margin-top: 20px;
        ">📋 Ver Outras Tabelas</a>
        <a href="/" style="
          background: #6c757d; color: white; text-decoration: none; padding: 10px 20px; 
          border-radius: 5px; display: inline-block; margin-top: 20px; margin-left: 10px;
        ">🏠 Início</a>
      </div>
    `);
  }
  
  try {
    // Query para contar total de registros
    const countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
    const countResult = await executeQuery(countQuery);
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);
    
    // Query principal com LIMIT e OFFSET
    const query = `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`;
    const results = await executeQuery(query, [parseInt(limit), parseInt(offset)]);
    
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${tableName} - SmartLogger Database</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8f9fa; color: #333; line-height: 1.6; }
              .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
              .nav { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .nav a { color: #667eea; text-decoration: none; margin-right: 15px; font-weight: 500; }
              .info-bar { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
              .table-container { background: white; border-radius: 8px; overflow: hidden; margin-bottom: 20px; overflow-x: auto; }
              table { width: 100%; border-collapse: collapse; min-width: 600px; }
              th { background: #f8f9fa; padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057; font-size: 0.9em; }
              td { padding: 10px 8px; border-bottom: 1px solid #dee2e6; font-size: 0.85em; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
              tr:hover { background: #f8f9fa; }
              .pagination { display: flex; justify-content: center; align-items: center; gap: 10px; margin: 20px 0; background: white; padding: 20px; border-radius: 8px; }
              .page-btn { padding: 8px 12px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-size: 0.9em; }
              .page-btn:hover { background: #5a6fd8; }
              .page-btn.disabled { background: #ccc; pointer-events: none; }
              .page-btn.current { background: #764ba2; }
              .controls { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .controls select { padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px; margin: 0 10px; }
              .btn { padding: 8px 15px; background: #667eea; color: white; border: none; border-radius: 4px; text-decoration: none; display: inline-block; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>📊 ${tableName}</h1>
                  <p>Visualizador de Dados - SmartLogger API</p>
              </div>
              
              <div class="nav">
                  <a href="/">🏠 Início</a>
                  <a href="/tables">📋 Todas as Tabelas</a>
                  <a href="/api/table/${tableName}?limit=10">📥 JSON Raw</a>
              </div>
              
              <div class="info-bar">
                  <div>
                      <strong>Tabela:</strong> ${tableName} | 
                      <strong>Total:</strong> ${totalRecords.toLocaleString()} registros
                  </div>
                  <div>
                      <strong>Página:</strong> ${page} de ${totalPages} | 
                      <strong>Exibindo:</strong> ${results.length} registros
                  </div>
              </div>
              
              <div class="controls">
                  <label>Registros por página:</label>
                  <select onchange="changeLimit(this.value)">
                      <option value="10" ${limit == 10 ? 'selected' : ''}>10</option>
                      <option value="20" ${limit == 20 ? 'selected' : ''}>20</option>
                      <option value="50" ${limit == 50 ? 'selected' : ''}>50</option>
                      <option value="100" ${limit == 100 ? 'selected' : ''}>100</option>
                  </select>
                  
                  <a href="/api/table/${tableName}?limit=${limit}" class="btn" target="_blank">📥 Baixar JSON</a>
              </div>
              
              <div class="table-container">
                  <table>
                      <thead>
                          <tr>
                              ${results.length > 0 ? Object.keys(results[0]).map(key => `<th>${key}</th>`).join('') : '<th>Sem dados</th>'}
                          </tr>
                      </thead>
                      <tbody>
                          ${results.map(row => `
                              <tr>
                                  ${Object.values(row).map(value => {
                                    if (value === null) return '<td><em>null</em></td>';
                                    if (typeof value === 'object') {
                                      // Tentar exibir JSON formatado
                                      try {
                                        const jsonStr = JSON.stringify(value, null, 2);
                                        const truncated = jsonStr.length > 100 ? jsonStr.substring(0, 100) + '...' : jsonStr;
                                        return `<td title="${jsonStr.replace(/"/g, '&quot;')}" style="font-family: monospace; font-size: 0.8em;">${truncated}</td>`;
                                      } catch (e) {
                                        return '<td>Object</td>';
                                      }
                                    }
                                    let displayValue = String(value);
                                    if (displayValue.length > 50) {
                                      displayValue = displayValue.substring(0, 50) + '...';
                                    }
                                    return `<td title="${String(value).replace(/"/g, '&quot;')}">${displayValue}</td>`;
                                  }).join('')}
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>
              </div>
              
              ${totalPages > 1 ? `
              <div class="pagination">
                  <a href="?page=1&limit=${limit}" class="page-btn ${page <= 1 ? 'disabled' : ''}">⏮️ Primeira</a>
                  <a href="?page=${Math.max(1, page - 1)}&limit=${limit}" class="page-btn ${page <= 1 ? 'disabled' : ''}">⬅️ Anterior</a>
                  
                  ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i));
                    return `<a href="?page=${pageNum}&limit=${limit}" class="page-btn ${pageNum === page ? 'current' : ''}">${pageNum}</a>`;
                  }).join('')}
                  
                  <a href="?page=${Math.min(totalPages, page + 1)}&limit=${limit}" class="page-btn ${page >= totalPages ? 'disabled' : ''}">➡️ Próxima</a>
                  <a href="?page=${totalPages}&limit=${limit}" class="page-btn ${page >= totalPages ? 'disabled' : ''}">⏭️ Última</a>
              </div>
              ` : ''}
          </div>
          
          <script>
              function changeLimit(newLimit) {
                  window.location.href = '?page=1&limit=' + newLimit;
              }
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Erro ao buscar dados da tabela:', error);
    res.status(500).send(`
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h2 style="color: #dc3545;">❌ Erro de Conexão com o Banco</h2>
        <p style="color: #6c757d; margin: 20px 0;">Tabela: ${tableName}</p>
        <p style="color: #6c757d;">Erro: ${error.message}</p>
        <button onclick="location.reload()" style="
          background: #007bff; color: white; border: none; padding: 10px 20px; 
          border-radius: 5px; cursor: pointer; margin-top: 20px;
        ">🔄 Tentar Novamente</button>
      </div>
    `);
  }
});

// Endpoint para listar todas as tabelas
app.get('/api/tables', async (req, res) => {
  const query = 'SHOW TABLES';
  
  try {
    const results = await executeQuery(query);
    let tables = results.map(row => Object.values(row)[0]);
    
    // Filtrar tabelas sensíveis por segurança
    tables = tables.filter(table => table !== 'tc_users');
    
    res.json({
      success: true,
      data: tables,
      count: tables.length,
      database: dbConfig.database,
      message: `${tables.length} tabelas encontradas com sucesso`
    });
  } catch (error) {
    console.error('❌ Erro na query:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tabelas do banco',
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Endpoint específico para relatórios - buscar posições por dispositivo e período
app.get('/api/positions/device/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const limit = req.query.limit || 1000;
  
  // Validação básica
  if (!deviceId || isNaN(parseInt(deviceId))) {
    return res.status(400).json({
      success: false,
      message: 'ID do dispositivo inválido'
    });
  }
  
  let query = 'SELECT * FROM tc_positions WHERE deviceid = ?';
  let queryParams = [parseInt(deviceId)];
  
  // Adicionar filtro de data se fornecido
  if (startDate && endDate) {
    query += ' AND devicetime BETWEEN ? AND ?';
    queryParams.push(startDate, endDate);
  }
  
  // Ordenar por data mais recente primeiro
  query += ' ORDER BY devicetime DESC LIMIT ?';
  queryParams.push(parseInt(limit));
  
  try {
    const results = await executeQuery(query, queryParams);
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      deviceId: deviceId,
      period: { startDate, endDate },
      message: `${results.length} posições encontradas para o dispositivo ${deviceId}`
    });
  } catch (error) {
    console.error('❌ Erro na query de posições:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar posições do dispositivo',
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// ========== INICIALIZAÇÃO DO SERVIDOR ==========

// Testar conexão com o banco MySQL
async function testConnection() {
  try {
    await executeQuery('SELECT 1');
    console.log('✅ Teste de conexão MySQL realizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao testar conexão MySQL:', error);
    console.log('🔧 Verifique:');
    console.log('   - Host:', dbConfig.host);
    console.log('   - Porta:', dbConfig.port);
    console.log('   - Usuário:', dbConfig.user);
    console.log('   - Banco:', dbConfig.database);
  }
}

// Executar teste de conexão
testConnection();

// Função para encontrar porta disponível
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// Iniciar servidor com porta dinâmica
findAvailablePort(PORT).then((availablePort) => {
  app.listen(availablePort, () => {
    console.log(`🚀 Servidor SmartLogger API rodando na porta ${availablePort}`);
    console.log(`📡 Acesse: http://localhost:${availablePort}`);
    console.log(`🗄️ Database: ${dbConfig.database} em ${dbConfig.host}`);
  });
}).catch((err) => {
  console.error('❌ Erro ao iniciar servidor:', err);
});
