#!/bin/bash

# Script para rodar o backend com verificação automática de porta

echo "🚀 Iniciando backend do SmartLogger..."

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
        echo "ℹ️  Porta $port já estava livre"
    fi
}

# Verifica se a porta 3002 está ocupada
if lsof -i :3002 > /dev/null 2>&1; then
    echo "⚠️  Porta 3002 está ocupada. Liberando automaticamente..."
    kill_port 3002 "Backend"
    
    # Aguarda um momento para garantir que a porta foi liberada
    sleep 2
    
    # Verifica novamente
    if lsof -i :3002 > /dev/null 2>&1; then
        echo "❌ Erro: Não foi possível liberar a porta 3002"
        echo "🔧 Tente executar manualmente: sudo lsof -ti :3002 | xargs kill -9"
        exit 1
    fi
else
    echo "✅ Porta 3002 está livre"
fi

echo "🎯 Iniciando servidor backend na porta 3002..."
echo ""

# Muda para o diretório backend e executa
cd backend && npm run dev
