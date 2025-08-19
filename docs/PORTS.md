# Configuração de Portas - SmartLogger Web V2

## 🚀 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev:frontend    # Vite servidor de desenvolvimento (porta 3001)
npm run dev:backend     # Nodemon servidor de desenvolvimento (porta 3002)  
npm run dev            # Ambos simultaneamente com concurrently
```

### Build e Preview
```bash
npm run build          # Build para produção (porta 4000)
npm run build:dev      # Build para desenvolvimento (porta 3001)
npm run preview        # Preview de produção na porta 4000
npm run preview:dev    # Preview de desenvolvimento na porta 3001
```

### Deploy
```bash
npm run deploy:frontend   # Deploy apenas do frontend
npm run deploy:backend    # Deploy apenas do backend
npm run deploy:fullstack  # Deploy completo
```

### Produção
```bash
npm run build          # Build para produção (porta 4000)
npm run preview        # Preview de produção na porta 4000
npm run build:dev      # Build para desenvolvimento (porta 3001)
npm run preview:dev    # Preview de desenvolvimento na porta 3001
```

### Utilitários de Porta (Apenas Desenvolvimento)
```bash
npm run check-ports    # Verifica portas 3001/3002 (desenvolvimento)
npm run kill-ports     # Libera portas 3001/3002 (desenvolvimento)
```

> **Nota**: As portas de produção (4000/4001) são gerenciadas pelo deploy

## 🌐 Portas por Ambiente

| Ambiente      | Frontend | Backend |
|---------------|----------|---------|
| Desenvolvimento | 3001   | 3002    |
| Produção       | 4000   | 4001    |

## 🔗 URLs de Acesso

### Desenvolvimento
- Frontend: http://localhost:3001
- Backend: http://localhost:3002

### Produção
- Frontend: http://77.37.41.27:4000
- Backend: http://77.37.41.27:4001

## ⚙️ Como o Sistema Detecta o Ambiente

O Vite automaticamente detecta o ambiente através do parâmetro `--mode`:
- `--mode development`: Usa portas 3001/3002
- `--mode production`: Usa portas 4000/4001

**IMPORTANTE**: Agora o sistema usa `strictPort: true`, o que significa:
- ✅ Se a porta estiver livre, usa a porta configurada
- ❌ Se a porta estiver ocupada, o servidor falha com erro
- 🔧 Use `npm run check-ports` para verificar portas ocupadas
- 🔧 Use `npm run kill-ports` para liberar as portas

## 🛠️ Solucionando Problemas de Porta (Desenvolvimento)

### Se o erro "Port 3001 is in use" aparecer:

1. **Verificar portas de desenvolvimento ocupadas:**
   ```bash
   npm run check-ports
   ```

2. **Liberar portas de desenvolvimento automaticamente:**
   ```bash
   npm run kill-ports
   ```

3. **Liberar porta específica manualmente:**
   ```bash
   sudo lsof -ti :3001 | xargs kill -9  # Libera porta 3001 (frontend dev)
   sudo lsof -ti :3002 | xargs kill -9  # Libera porta 3002 (backend dev)
   ```

> **Importante**: As portas de produção (4000/4001) são automaticamente gerenciadas pelos scripts de deploy e não precisam ser liberadas manualmente.

## 📁 Arquivos de Configuração

- `.env` - Configurações de desenvolvimento
- `.env.production` - Configurações de produção  
- `vite.config.js` - Configuração das portas do frontend
# Configuração de Portas - SmartLogger Web V2

## 🚀 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev:frontend    # Vite servidor de desenvolvimento (porta 3001)
npm run dev:backend     # Nodemon servidor de desenvolvimento (porta 3002)  
npm run dev            # Ambos simultaneamente com concurrently
```

### Build e Preview
```bash
npm run build          # Build para produção (porta 4000)
npm run build:dev      # Build para desenvolvimento (porta 3001)
npm run preview        # Preview de produção na porta 4000
npm run preview:dev    # Preview de desenvolvimento na porta 3001
```

### Deploy
```bash
npm run deploy:frontend   # Deploy apenas do frontend
npm run deploy:backend    # Deploy apenas do backend
npm run deploy:fullstack  # Deploy completo
```

### Produção
```bash
npm run build          # Build para produção (porta 4000)
npm run preview        # Preview de produção na porta 4000
npm run build:dev      # Build para desenvolvimento (porta 3001)
npm run preview:dev    # Preview de desenvolvimento na porta 3001
```

### Utilitários de Porta (Apenas Desenvolvimento)
```bash
npm run check-ports    # Verifica portas 3001/3002 (desenvolvimento)
npm run kill-ports     # Libera portas 3001/3002 (desenvolvimento)
```

> **Nota**: As portas de produção (4000/4001) são gerenciadas pelo deploy

## 🌐 Portas por Ambiente

| Ambiente      | Frontend | Backend |
|---------------|----------|---------|
| Desenvolvimento | 3001   | 3002    |
| Produção       | 4000   | 4001    |

## 🔗 URLs de Acesso

### Desenvolvimento
- Frontend: http://localhost:3001
- Backend: http://localhost:3002

### Produção
- Frontend: http://77.37.41.27:4000
- Backend: http://77.37.41.27:4001

## ⚙️ Como o Sistema Detecta o Ambiente

O Vite automaticamente detecta o ambiente através do parâmetro `--mode`:
- `--mode development`: Usa portas 3001/3002
- `--mode production`: Usa portas 4000/4001

**IMPORTANTE**: Agora o sistema usa `strictPort: true`, o que significa:
- ✅ Se a porta estiver livre, usa a porta configurada
- ❌ Se a porta estiver ocupada, o servidor falha com erro
- 🔧 Use `npm run check-ports` para verificar portas ocupadas
- 🔧 Use `npm run kill-ports` para liberar as portas

## 🛠️ Solucionando Problemas de Porta (Desenvolvimento)

### Se o erro "Port 3001 is in use" aparecer:

1. **Verificar portas de desenvolvimento ocupadas:**
   ```bash
   npm run check-ports
   ```

2. **Liberar portas de desenvolvimento automaticamente:**
   ```bash
   npm run kill-ports
   ```

3. **Liberar porta específica manualmente:**
   ```bash
   sudo lsof -ti :3001 | xargs kill -9  # Libera porta 3001 (frontend dev)
   sudo lsof -ti :3002 | xargs kill -9  # Libera porta 3002 (backend dev)
   ```

> **Importante**: As portas de produção (4000/4001) são automaticamente gerenciadas pelos scripts de deploy e não precisam ser liberadas manualmente.

## 📁 Arquivos de Configuração

- `.env` - Configurações de desenvolvimento
- `.env.production` - Configurações de produção  
- `vite.config.js` - Configuração das portas do frontend
