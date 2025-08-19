# Sistema de Notificações de Manutenção - SmartLogger

## 📋 **Visão Geral**

O sistema de notificações monitora automaticamente **apenas as máquinas críticas**: aquelas com óleo vencido ou que vão vencer em até **200 horas**.

## 🔔 **Funcionalidades**

### **1. Monitoramento Crítico**
- Atualização automática a cada 5 minutos
- **Filtro super focado**: Apenas máquinas com `min_remaining_hours ≤ 200`
- Foco absoluto em **crítico e urgente**
- Zero ruído - apenas o que realmente importa

### **2. Classificação Simplificada**

#### 🚨 **CRÍTICA** (Vermelha)
- **Condição**: `min_remaining_hours < 0`
- **Mensagem**: "Troca de óleo VENCIDA há X horas"
- **Ícone**: 🚨

#### ⚠️ **ALERTA** (Laranja)
- **Condição**: `min_remaining_hours ≤ 200`
- **Mensagem**: "Troca de óleo em X horas"
- **Ícone**: ⚠️

### **3. Interface do Usuário**

#### **Sino de Notificações**
- **Localização**: Header da aplicação (mobile e desktop)
- **Badge**: Mostra quantidade de notificações críticas e de alta prioridade
- **Animação**: Badge pisca para chamar atenção
- **Indicador de carregamento**: Quando está atualizando dados

#### **Painel de Notificações**
- **Abertura**: Clique no sino
- **Filtro ultra-focado**: Apenas máquinas críticas (≤ 200 horas)
- **Organização**: Críticas primeiro, depois alertas
- **Estado vazio**: Mensagem positiva quando não há alertas críticos
- **Simplicidade**: Lista limpa apenas com o essencial
- **Resumo visual**: Contador separado (X vencidas, Y próximas)
- **Detalhes**: Para cada máquina mostra:
  - Nome do equipamento
  - Horas trabalhadas
  - Horas restantes para manutenção
  - Status de prioridade
  - Tempo desde a última atualização

### **4. Funcionalidades Avançadas**

#### **Marcar como Lida**
- Clique na notificação para marcar como lida
- Botão "Marcar todas como lidas"
- Contador de não lidas atualizado automaticamente

#### **Responsividade**
- Layout adaptado para mobile e desktop
- Tamanhos otimizados para diferentes telas

## 🛠 **Arquitetura Técnica**

### **Contexto de Notificações** (`NotificationContext.jsx`)
```javascript
// Funcionalidades principais:
- fetchMaintenanceNotifications() // Busca dados da API
- markAsRead(id) // Marca notificação como lida
- markAllAsRead() // Marca todas como lidas
- getNotificationsByPriority(priority) // Filtra por prioridade
- getCriticalNotifications() // Apenas críticas
- getHighPriorityNotifications() // Apenas alta prioridade
```

### **Componente NotificationBell** (`NotificationBell.jsx`)
```javascript
// Estados principais:
- isOpen // Controla abertura do painel
- notifications // Lista de TODAS as notificações
- unreadCount // Contador de não lidas
- loading // Estado de carregamento
- criticalCount // Contador de críticas
- highCount // Contador de alta prioridade
- mediumCount // Contador de média prioridade
- lowCount // Contador de baixa prioridade
```

### **Integração com Header** (`Header.jsx`)
- Componente `<NotificationBell />` adicionado
- Posicionamento responsivo (mobile e desktop)
- Integração com sistema de temas (claro/escuro)

## 📊 **Dados da API**

### **Endpoints Utilizados**
```javascript
GET /devices/ // Dados dos dispositivos
GET /equipments/ // Dados dos equipamentos
```

### **Campos Essenciais**
```javascript
// Equipment
{
  id: number,
  name: string,
  min_remaining_hours: number, // CRUCIAL para cálculos
  worked_hours: number,
  device: string // device_id para merge
}

// Device
{
  device_id: string,
  // outros campos de telemetria...
}
```

## 🎨 **Estilos e Temas**

### **Suporte a Tema Escuro/Claro**
- Cores automáticas baseadas no contexto de tema
- Gradientes e sombras adaptados
- Ícones e textos com cores apropriadas

### **Cores por Prioridade**
```css
/* Crítica */
.critical { background: red-50/red-900; border: red-200/red-800; }

/* Alta */
.high { background: orange-50/orange-900; border: orange-200/orange-800; }

/* Média */
.medium { background: yellow-50/yellow-900; border: yellow-200/yellow-800; }

/* Baixa */
.low { background: blue-50/blue-900; border: blue-200/blue-800; }
```

## 🔄 **Atualização Automática**

- **Intervalo**: 5 minutos
- **Ao carregar**: Busca imediata
- **Controle**: useEffect com cleanup de interval
- **Performance**: Otimizado para não sobrecarregar API

## 📱 **Experiência Mobile**

- **Dropdown responsivo**: Largura 320px (mobile) vs 384px (desktop)
- **Touch friendly**: Botões e áreas de toque otimizadas
- **Scroll suave**: Lista de notificações com scroll vertical
- **Overlay**: Toque fora fecha o painel

## 🚀 **Como Usar**

1. **Automático**: Sistema funciona automaticamente após login
2. **Visualizar**: Clique no sino no header para ver apenas alertas críticos
3. **Priorização**: Máquinas vencidas aparecem primeiro
4. **Foco total**: Apenas críticas (vencidas) e próximas (≤ 200h)
5. **Gerenciar**: Marque notificações como lidas conforme necessário
6. **Monitorar**: Badge mostra total de alertas críticos

## ✨ **Atualização Final: Foco Ultra-Crítico**

### 🎯 **Sistema Simplificado:**

#### **Filtro Ultra-Focado:**
- ✅ **Apenas críticos**: Filtra máquinas com ≤ 200 horas
- ✅ **Zero ruído**: Removidas categorias média e baixa
- ✅ **Máximo foco**: Apenas vencidas + próximas de vencer
- ✅ **Ação imediata**: Tudo que aparece precisa de ação

#### **Classificação Simplificada:**
- 🚨 **CRÍTICAS**: Óleo vencido (< 0 horas)
- ⚠️ **ALERTAS**: Próximas 200 horas

#### **Interface Limpa:**
- ✅ Título "Alertas Críticos" mais direto
- ✅ Contador "X vencidas, Y próximas"
- ✅ Mensagem "Sem alertas críticos" quando vazio
- ✅ Lista ultra-focada sem distrações

## 🔧 **Manutenção e Suporte**

- **Logs**: Console logs para debug de atualizações
- **Error handling**: Try/catch em todas as chamadas de API
- **Fallbacks**: Graceful degradation se API falhar
- **Performance**: Otimizado para evitar re-renders desnecessários

---

**Desenvolvido para SmartLogger v2** 🚜⚡
