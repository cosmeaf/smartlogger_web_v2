#!/bin/bash

# Script para verificar portas de PRODUÇÃO do SmartLogger
# Este script é usado pelos scripts de deploy

echo "🔍 Verificando portas de produção do SmartLogger..."

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

# Verifica apenas portas de produção
echo ""
echo "📋 PORTAS DE PRODUÇÃO:"
check_port 4000 "Frontend React (Prod)"
prod_frontend_free=$?

check_port 4001 "Backend MySQL (Prod)"
prod_backend_free=$?

# Se alguma porta de produção estiver ocupada, libera automaticamente
if [ $prod_frontend_free -ne 0 ] || [ $prod_backend_free -ne 0 ]; then
    echo ""
    echo "🔄 Liberando portas de produção para deploy..."
    kill_port 4000 "Frontend React (Prod)"
    kill_port 4001 "Backend MySQL (Prod)"
    
    echo ""
    echo "✅ Portas de produção liberadas para deploy!"
else
    echo ""
    echo "🎉 Todas as portas de produção estão livres para deploy!"
fi
