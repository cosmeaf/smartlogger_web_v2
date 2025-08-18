const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

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
  database: process.env.MYSQL_DATABASE || 'traccar'
};

// Criar conexão com o banco
const connection = mysql.createConnection(dbConfig);

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
                <p>SmartLogger API v3.0 - Desenvolvido por CosmeDev</p>
                <p>Servidor rodando na porta ${PORT}</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// ========== PÁGINA COM TODAS AS TABELAS ==========
app.get('/tables', (req, res) => {
  const query = 'SHOW TABLES';
  
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).send('<h2>❌ Erro ao buscar tabelas: ' + error.message + '</h2>');
    }
    
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
  });
});

// ========== API ENDPOINTS ==========

// Endpoint genérico para qualquer tabela - JSON
app.get('/api/table/:tableName', (req, res) => {
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
  
  connection.query(query, [parseInt(limit)], (error, results) => {
    if (error) {
      console.error('❌ Erro na query:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados da tabela ' + tableName,
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      table: tableName,
      limit: limit,
      message: `${results.length} registros encontrados na tabela ${tableName}`
    });
  });
});

// Endpoint genérico para visualizador de tabelas
app.get('/view/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  const limit = req.query.limit || 20;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  
  // Validação básica do nome da tabela
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    return res.status(400).send('<h2>❌ Nome de tabela inválido</h2>');
  }
  
  // Query para contar total de registros
  const countQuery = `SELECT COUNT(*) as total FROM ${tableName}`;
  
  connection.query(countQuery, (countError, countResult) => {
    if (countError) {
      return res.status(500).send(`<h2>❌ Erro: ${countError.message}</h2>`);
    }
    
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);
    
    // Query principal com LIMIT e OFFSET
    const query = `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`;
    
    connection.query(query, [parseInt(limit), parseInt(offset)], (error, results) => {
      if (error) {
        return res.status(500).send(`<h2>❌ Erro: ${error.message}</h2>`);
      }
      
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
    });
  });
});

// Endpoint para listar todas as tabelas
app.get('/api/tables', (req, res) => {
  const query = 'SHOW TABLES';
  
  connection.query(query, (error, results) => {
    if (error) {
      console.error('❌ Erro na query:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar tabelas do banco',
        error: error.message
      });
    }
    
    const tables = results.map(row => Object.values(row)[0]);
    
    res.json({
      success: true,
      data: tables,
      count: tables.length,
      database: dbConfig.database,
      message: `${tables.length} tabelas encontradas com sucesso`
    });
  });
});

// Endpoint específico para relatórios - buscar posições por dispositivo e período
app.get('/api/positions/device/:deviceId', (req, res) => {
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
  
  connection.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('❌ Erro na query de posições:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar posições do dispositivo',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      deviceId: deviceId,
      period: { startDate, endDate },
      message: `${results.length} posições encontradas para o dispositivo ${deviceId}`
    });
  });
});

// ========== INICIALIZAÇÃO DO SERVIDOR ==========

// Testar conexão com o banco MySQL
connection.connect((error) => {
  if (error) {
    console.error('❌ Erro ao conectar com o banco MySQL:', error);
    console.log('🔧 Verifique:');
    console.log('   - Host:', dbConfig.host);
    console.log('   - Porta:', dbConfig.port);
    console.log('   - Usuário:', dbConfig.user);
    console.log('   - Banco:', dbConfig.database);
    return;
  }
  console.log('✅ Conectado ao banco MySQL com sucesso!');
});

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
