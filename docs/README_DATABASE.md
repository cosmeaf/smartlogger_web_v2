# SmartLogger Web v2 - Integração com Banco de Dados

## Como executar o projeto completo:

### 1. **Iniciar o servidor de banco (Terminal 1):**
```bash
cd /root/projects/react/smartlogger_web_v2/backend
npm start
```

### 2. **Iniciar o React (Terminal 2):**
```bash
cd /root/projects/react/smartlogger_web_v2
npm run dev
```

### Ou executar tudo junto:
```bash
cd /root/projects/react/smartlogger_web_v2
npm run start:full
```

## Estrutura criada:

### Arquivos principais:
- `/backend/server.js` - Servidor Node.js para MySQL
- `/src/pages/records/Records.jsx` - Página de Registros
- `/src/services/databaseService.js` - Serviço para comunicação com banco
- `vite.config.js` - Configuração do proxy

### Endpoints disponíveis:
- `GET /database/tc-devices` - Lista todos os dispositivos
- `POST /database/query` - Executa query personalizada
- `GET /database/test` - Testa a conexão

### Como funciona:
1. **Frontend React** (porta 3001) faz requisição para `/database/tc-devices`
2. **Proxy do Vite** redireciona para `http://localhost:3002/database/tc-devices`
3. **Servidor Node.js** (porta 3002) conecta no **MySQL** e executa `SELECT * FROM tc_devices`
4. **Dados JSON** retornam para a página de Registros

## Para Deploy:
1. **Produção**: Configure o servidor Node.js no mesmo servidor que o React
2. **Proxy**: Ajuste as configurações de proxy para o ambiente de produção
3. **Build**: Use `npm run build` para gerar a versão otimizada

## Navegação:
- Acesse: **Dashboard → Registros** (sidebar)
- URL: `http://localhost:3001/dashboard/records`
