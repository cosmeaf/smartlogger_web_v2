#!/bin/bash

# Script para rodar o frontend com verificação automática de porta

echo "🚀 Iniciando frontend do SmartLogger..."

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

# Verifica se a porta 3001 está ocupada
if lsof -i :3001 > /dev/null 2>&1; then
    echo "⚠️  Porta 3001 está ocupada. Liberando automaticamente..."
    kill_port 3001 "Frontend React"
    
    # Aguarda um momento para garantir que a porta foi liberada
    sleep 2
    
    # Verifica novamente
    if lsof -i :3001 > /dev/null 2>&1; then
        echo "❌ Erro: Não foi possível liberar a porta 3001"
        echo "🔧 Tente executar manualmente: sudo lsof -ti :3001 | xargs kill -9"
        exit 1
    fi
else
    echo "✅ Porta 3001 está livre"
fi

echo "🎯 Iniciando servidor de desenvolvimento na porta 3001..."
echo ""

# Executa o Vite
exec vite --mode development
