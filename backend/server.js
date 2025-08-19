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
        <title>SmartLogger API - Traccar Database</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
            .header h1 { font-size: 2.5em; margin-bottom: 10px; }
            .status { text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4caf50; }
            .tables-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0; }
            .table-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .table-card h4 { color: #667eea; margin-bottom: 10px; }
            .btn { display: inline-block; padding: 8px 15px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 3px; font-size: 0.9em; }
            .btn:hover { background: #5a6fd8; }
            .btn.view { background: #28a745; }
            .btn.json { background: #17a2b8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 SmartLogger API</h1>
                <p>Interface para dados do Traccar Database</p>
            </div>

            <div class="status">
                <h3>📡 Status da Conexão</h3>
                <p><strong>Database:</strong> ${dbConfig.database} | <strong>Host:</strong> ${dbConfig.host} | <strong>Status:</strong> Online ✅</p>
            </div>

            <h2>🗂️ Principais Tabelas Traccar</h2>
            <div class="tables-grid">
                <div class="table-card">
                    <h4>📱 tc_devices</h4>
                    <p>Dispositivos GPS cadastrados</p>
                    <a href="/api/table/tc_devices" class="btn json">📥 JSON</a>
                    <a href="/view/tc_devices" class="btn view">👁️ Visualizar</a>
                </div>
                
                <div class="table-card">
                    <h4>📍 tc_positions</h4>
                    <p>Posições GPS registradas</p>
                    <a href="/api/table/tc_positions?limit=100" class="btn json">📥 JSON</a>
                    <a href="/view/tc_positions" class="btn view">👁️ Visualizar</a>
                </div>
                
                <div class="table-card">
                    <h4>👥 tc_users</h4>
                    <p>Usuários do sistema</p>
                    <a href="/api/table/tc_users" class="btn json">📥 JSON</a>
                    <a href="/view/tc_users" class="btn view">👁️ Visualizar</a>
                </div>
                
                <div class="table-card">
                    <h4>⚡ tc_events</h4>
                    <p>Eventos registrados</p>
                    <a href="/api/table/tc_events?limit=100" class="btn json">📥 JSON</a>
                    <a href="/view/tc_events" class="btn view">👁️ Visualizar</a>
                </div>
                
                <div class="table-card">
                    <h4>👥 tc_groups</h4>
                    <p>Grupos de dispositivos</p>
                    <a href="/api/table/tc_groups" class="btn json">📥 JSON</a>
                    <a href="/view/tc_groups" class="btn view">👁️ Visualizar</a>
                </div>
                
                <div class="table-card">
                    <h4>🗺️ tc_geofences</h4>
                    <p>Geocercas definidas</p>
                    <a href="/api/table/tc_geofences" class="btn json">📥 JSON</a>
                    <a href="/view/tc_geofences" class="btn view">👁️ Visualizar</a>
                </div>
                
                <div class="table-card">
                    <h4>📋 Todas as Tabelas</h4>
                    <p>Lista completa de 48 tabelas</p>
                    <a href="/api/tables" class="btn json">📥 Lista JSON</a>
                    <a href="/tables" class="btn view">👁️ Ver Todas</a>
                </div>
            </div>
            
      <div style="text-align: center; margin: 40px 0; color: #666;">
                <p>SmartLogger API v${process.env.APP_VERSION || require('./package.json').version} - Desenvolvido por Estevão Monteiro</p>
        <p>Servidor rodando na porta ${PORT}</p>
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
    const tables = results.map(row => Object.values(row)[0]);
    
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Todas as Tabelas - SmartLogger API</title>
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
          <title>${tableName} - SmartLogger API</title>
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
                                    if (typeof value === 'object') return '<td>📄 JSON</td>';
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
    const tables = results.map(row => Object.values(row)[0]);
    
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
