# Configuração de Ambiente MySQL

Este projeto usa variáveis de ambiente para configurar dinamicamente a conexão com o servidor MySQL no frontend e backend, permitindo diferentes configurações para desenvolvimento e produção.

## Portas do Sistema

### Desenvolvimento
- **Frontend React**: Porta 3001 (http://localhost:3001)
- **Backend MySQL**: Porta 3002 (http://localhost:3002)

### Produção (Deploy)
- **Frontend React**: Porta 4000 (http://77.37.41.27:4000)
- **Backend MySQL**: Porta 4001 (http://77.37.41.27:4001)

## Variáveis de Ambiente

### Frontend (.env)
```bash
# Configurações do servidor MySQL - Desenvolvimento
# Frontend: porta 3001 | Backend: porta 3002
REACT_APP_MYSQL_HOST=localhost
REACT_APP_MYSQL_PORT=3002
REACT_APP_MYSQL_BASE_URL=http://localhost:3002
REACT_APP_SERVER_URL=http://localhost:3002

# Porta do frontend React (também configurada no vite.config.js)
PORT=3001
```

### Backend (.env)
```bash
# Configurações do Backend - Desenvolvimento
NODE_ENV=development
PORT=3002
MYSQL_HOST=77.37.41.27
MYSQL_PORT=3306
MYSQL_DATABASE=traccar
MYSQL_USER=superuser
MYSQL_PASSWORD=C0smeSmart@2024

# Frontend URLs (para CORS)
FRONTEND_URL=http://localhost:3001
FRONTEND_PROD_URL=http://77.37.41.27:4000
```

### Produção (.env.production)
```bash
# Configurações do servidor MySQL - Produção
# Frontend: porta 4000 | Backend: porta 4001
REACT_APP_MYSQL_HOST=77.37.41.27
REACT_APP_MYSQL_PORT=4001
REACT_APP_MYSQL_BASE_URL=http://77.37.41.27:4001
REACT_APP_SERVER_URL=http://77.37.41.27:4001

# Porta do frontend React em produção
PORT=4000
```

## Configurações de Porta

### Frontend (React + Vite)
A porta do frontend é configurada automaticamente baseada no ambiente:
- **Desenvolvimento**: Porta 3001 (configurada no `vite.config.js`)
- **Produção**: Porta 4000 (configurada no `vite.config.js` + `.env.production`)

### Backend (Node.js/Express)
A porta do backend deve ser configurada no servidor backend:
- **Desenvolvimento**: Porta 3002
- **Produção**: Porta 4001

## Como Usar

1. **Desenvolvimento**: O projeto automaticamente usará as configurações do arquivo `.env`
2. **Produção**: Durante o build de produção, as configurações do `.env.production` serão utilizadas
3. **Port dinâmica**: Se a porta estiver ocupada, basta alterar a variável `REACT_APP_MYSQL_PORT` no arquivo correspondente

## Hook useMysql

O hook `useMysql` centraliza todas as chamadas para o servidor MySQL:

```javascript
import useMysql from '../hooks/useMysql';

const { getDevices, getPositions, loading, error } = useMysql();
```

### Métodos disponíveis:
- `getDevices()`: Busca todos os dispositivos
- `getPositions(deviceId, startDate, endDate)`: Busca posições de um dispositivo
- `loading`: Estado de carregamento
- `error`: Mensagens de erro

## Para Executar o Sistema

### Desenvolvimento
```bash
# Frontend (React) - Porta 3001
npm run dev:frontend

# Backend (Node.js) - Porta 3002
npm run dev:backend

# Ambos simultaneamente
npm run dev
```

### URLs de Acesso

#### Desenvolvimento
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3002

#### Produção
- **Frontend**: http://77.37.41.27:4000
- **Backend API**: http://77.37.41.27:4001

## Configuração do Servidor

### Para alterar o servidor de desenvolvimento:
1. Edite o arquivo `.env`
2. Modifique `REACT_APP_SERVER_URL=http://localhost:NOVA_PORTA`
3. **Nota**: A porta do frontend (3001) está fixa no `vite.config.js`

### Para alterar o servidor de produção:
1. Edite o arquivo `.env.production`
2. Modifique `REACT_APP_SERVER_URL=http://servidor-producao:porta`

## Notas Importantes

- **Portas Automáticas**: O sistema escolhe a porta automaticamente baseado no ambiente
  - **Desenvolvimento**: Frontend 3001, Backend 3002
  - **Produção**: Frontend 4000, Backend 4001
- Todas as variáveis devem começar com `REACT_APP_` para serem incluídas no build
- Reinicie o servidor de desenvolvimento após alterar as variáveis de ambiente
- Os arquivos `.env` e `.env.local` não devem ser commitados no git
- Configure as variáveis de ambiente diretamente no servidor de produção
- A configuração de porta do frontend é automática baseada no modo do Vite (development/production)
