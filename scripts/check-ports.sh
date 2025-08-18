#!/bin/bash

# Script para verificar e liberar portas de DESENVOLVIMENTO do SmartLogger

echo "🔍 Verificando portas de desenvolvimento do SmartLogger..."

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    local service=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo "⚠️  Porta $port ($service) está ocupada"
        echo "Processos usando a porta $port:"
        lsof -i :$port
        echo ""
        return 1
    else
        echo "✅ Porta $port ($service) está livre"
        return 0
    fi
}

# Função para matar processos em uma porta específica
kill_port() {
    local port=$1
    local service=$2
    
    echo "🔄 Liberando porta $port ($service)..."
    
    # Mata todos os processos usando a porta
    lsof -ti :$port | xargs kill -9 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Porta $port liberada com sucesso"
    else
        echo "ℹ️  Nenhum processo encontrado na porta $port"
    fi
}

# Verifica apenas portas de desenvolvimento
echo ""
echo "📋 PORTAS DE DESENVOLVIMENTO:"
check_port 3001 "Frontend React (Dev)"
dev_frontend_free=$?

check_port 3002 "Backend MySQL (Dev)"
dev_backend_free=$?

echo ""
echo "ℹ️  Portas de produção (4000/4001) são gerenciadas pelo deploy"

# Se alguma porta de desenvolvimento estiver ocupada, pergunta se quer liberar
if [ $dev_frontend_free -ne 0 ] || [ $dev_backend_free -ne 0 ]; then
    echo ""
    echo "❓ Algumas portas de desenvolvimento estão ocupadas. Deseja liberar as portas 3001 e 3002? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo ""
        echo "🔄 Liberando portas de desenvolvimento..."
        kill_port 3001 "Frontend React (Dev)"
        kill_port 3002 "Backend MySQL (Dev)"
        
        echo ""
        echo "✅ Portas de desenvolvimento liberadas!"
        echo "🚀 Agora você pode executar:"
        echo "   npm run dev:frontend  # Frontend na porta 3001"
        echo "   npm run dev:backend   # Backend na porta 3002"
        echo "   npm run dev          # Ambos simultaneamente"
    else
        echo "ℹ️  Portas não foram liberadas. Use comandos específicos se necessário:"
        echo "   sudo lsof -ti :3001 | xargs kill -9  # Libera porta 3001"
        echo "   sudo lsof -ti :3002 | xargs kill -9  # Libera porta 3002"
    fi
else
    echo ""
    echo "🎉 Todas as portas de desenvolvimento estão livres! Você pode executar o sistema normalmente."
fi

echo ""
echo "📖 Para mais informações, consulte: PORTS.md"
