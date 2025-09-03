# Scripts de Desenvolvimento - SmartLogger

## Novos Scripts Disponíveis

### Frontend
- `npm run dev:frontend` - **RECOMENDADO** - Verifica e libera automaticamente a porta 3001, depois inicia o frontend
- `npm run dev:frontend:simple` - Versão simples que não verifica portas (pode falhar se a porta estiver ocupada)

### Backend  
- `npm run dev:backend` - **RECOMENDADO** - Verifica e libera automaticamente a porta 3002, depois inicia o backend
- `npm run dev:backend:simple` - Versão simples que não verifica portas (pode falhar se a porta estiver ocupada)

### Ambos
- `npm run dev` - Inicia backend e frontend simultaneamente (com verificação automática de portas)

## Como Funciona

### Verificação Automática de Portas
Os novos scripts (`dev:frontend` e `dev:backend`) fazem automaticamente:

1. ✅ **Verificação** - Checam se a porta está ocupada
2. 🔄 **Liberação** - Se ocupada, mata os processos automaticamente
3. ⏱️ **Aguarda** - Espera 2 segundos para garantir que a porta foi liberada
4. 🚀 **Inicia** - Executa o servidor normalmente

### Exemplo de Uso

```bash
# Frontend com verificação automática
npm run dev:frontend

# Saída esperada:
# 🚀 Iniciando frontend do SmartLogger...
# ⚠️  Porta 3001 está ocupada. Liberando automaticamente...
# 🔄 Liberando porta 3001 (Frontend React)...
# ✅ Porta 3001 liberada com sucesso
# 🎯 Iniciando servidor de desenvolvimento na porta 3001...
```

## Scripts Auxiliares

### Verificação Manual de Portas
- `npm run check-ports` - Verifica todas as portas de desenvolvimento e produção
- `npm run check-ports:prod` - Verifica apenas portas de produção

### Scripts dos Arquivos
- `/scripts/dev-frontend.sh` - Script de frontend com verificação
- `/scripts/dev-backend.sh` - Script de backend com verificação  
- `/scripts/check-ports.sh` - Verificação manual de portas

## Solução de Problemas

### Se o script falhar em liberar a porta:
```bash
# Libera porta 3001 manualmente
sudo lsof -ti :3001 | xargs kill -9

# Libera porta 3002 manualmente  
sudo lsof -ti :3002 | xargs kill -9
```

### Para ver quais processos estão usando uma porta:
```bash
lsof -i :3001  # Frontend
lsof -i :3002  # Backend
```

## Benefícios

✅ **Não mais erros** de "porta já está em uso"
✅ **Inicialização automática** sem intervenção manual
✅ **Desenvolvimento mais fluido** 
✅ **Scripts compatíveis** com o fluxo existente
✅ **Fallback manual** se algo der errado

---

**Nota**: Os scripts originais (`dev:frontend:simple`, `dev:backend:simple`) continuam disponíveis caso você precise deles por algum motivo específico.
