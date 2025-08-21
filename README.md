<div align="center">
	<img src="https://raw.githubusercontent.com/cosmeaf/smartlogger_web_v2/master/public/icon_maskable.png" width="120" alt="SmartLogger Logo" />
	<h1>SmartLogger Web v2</h1>
	<p>Sistema de monitoramento inteligente para equipamentos industriais e agrícolas</p>
</div>

---

## 🚀 Sobre o projeto

O <b>SmartLogger Web v2</b> é uma plataforma fullstack para monitoramento, visualização e análise de dados de equipamentos conectados via GPS, integrando frontend React + Vite e backend Node.js + MySQL.

### Funcionalidades principais
- Dashboard interativa com gráficos e relatórios avançados
- Consulta de dispositivos, posições, eventos e usuários do banco Traccar
- Filtros avançados por período, equipamento, status e categoria
- **Sistema de relatórios PDF profissionais** com análise técnica detalhada
- **Análise avançada de impactos** com zonas de intensidade e detecção de sequências
- **Gráficos de horímetro e impacto** com visualização temporal otimizada
- **Tabela otimizada** com quebra de linha em data/hora e atributos expandidos
- Visualização paginada e exportação de dados
- API RESTful para integração com outros sistemas
- Interface responsiva e tema escuro/claro

## � Sistema de Relatórios

### Relatórios PDF Profissionais
O sistema oferece geração automatizada de relatórios técnicos em PDF com:

#### Análise de Horímetro
- Gráfico temporal da evolução do horímetro
- Detalhamento diário de atividade com ranking por produtividade
- Identificação de dias com máquina parada
- Estatísticas do período (total trabalhado, médias, variações)

#### Análise Avançada de Impactos
- **Zonas de Intensidade**: Classificação automática (Crítico, Alto, Médio, Baixo)
- **Sequências Consecutivas**: Detecção de 3+ impactos em até 30 minutos
- **Distribuição Horária**: Padrões de impacto ao longo do dia
- **Períodos de Pico**: Dias com maior concentração de eventos
- **Medições em G**: Todos os valores exibidos em força gravitacional
- **Recomendações**: Alertas automáticos para eventos críticos

#### Tabela de Registros Otimizada
- Layout responsivo otimizado para páginas A4
- Data/Hora com quebra de linha para melhor legibilidade
- Coordenadas GPS precisas com 4 casas decimais
- Coluna expandida de atributos principais (IOs, sensores, dados operacionais)
- Paginação inteligente (100 registros por relatório)
- Zebra striping para facilitar leitura

#### Recursos Técnicos
- Geração assíncrona com feedback visual
- Visualização integrada no navegador
- Análise estatística avançada (desvio padrão, frequências)
- Exportação otimizada para impressão
- Compatibilidade total com jsPDF

## �🛠️ Tecnologias utilizadas

- Frontend: React, Vite, TailwindCSS, Chart.js, React-Chartjs-2, MUI
- Relatórios: jsPDF, Recharts, SweetAlert2 
- Backend: Node.js, Express, MySQL2, dotenv, cors
- DevTools: ESLint, VitePWA, concurrently


## 📁 Estrutura Completa do Projeto

```text
smartlogger_web_v2/                          # 🏗️ Raiz do projeto fullstack
│
├── 📂 backend/                               # 🚀 Backend Node.js + Express + MySQL
│   ├── 📄 server.js                         # 🎯 Servidor principal Express
│   ├── 📄 server.js.backup                  # 💾 Backup do servidor
│   ├── 📄 api.php                           # 🔧 API PHP auxiliar (legacy)
│   ├── 📄 package.json                      # 📦 Dependências do backend
│   ├── 📄 package-lock.json                 # 🔒 Lock de dependências
│   ├── 📄 .env.example                      # 🔐 Exemplo de variáveis ambiente
│   ├── 📄 .env.production                   # 🚀 Configuração produção
│   ├── 📄 .gitignore                        # 🚫 Arquivos ignorados pelo Git
│   └── 📂 node_modules/                     # 📚 Módulos Node.js
│
├── 📂 src/                                   # ⚛️ Frontend React + Vite
│   ├── 📄 App.jsx                           # 🎭 Componente raiz da aplicação
│   ├── 📄 App.css                           # 🎨 Estilos globais do App
│   ├── 📄 main.jsx                          # 🏁 Ponto de entrada React
│   ├── 📄 index.css                         # 🌈 Estilos CSS globais + Tailwind
│   │
│   ├── 📂 pages/                            # 📱 Páginas da aplicação
│   │   ├── 📂 auth/                         # 🔐 Autenticação e segurança
│   │   │   ├── 📄 Login.jsx                 # 🚪 Página de login
│   │   │   ├── 📄 Register.jsx              # ✍️ Registro de novos usuários
│   │   │   └── 📄 Recovery.jsx              # 🔑 Recuperação de senha
│   │   │
│   │   ├── 📂 dashboard/                    # 📊 Dashboard e visualizações
│   │   │   ├── 📄 Dashboard.jsx             # 🎛️ Dashboard principal
│   │   │   ├── 📄 Home.jsx                  # 🏠 Página inicial
│   │   │   ├── 📄 Main.jsx                  # 📈 Painel principal
│   │   │   └── 📄 main_backup.jsx           # 💾 Backup do painel principal
│   │   │
│   │   ├── 📂 devices/                      # 📡 Gestão de dispositivos GPS
│   │   │   ├── 📄 Devices.jsx               # 📋 Lista de dispositivos
│   │   │   ├── 📄 DeviceDetails.jsx         # 🔍 Detalhes do dispositivo
│   │   │   └── 📄 DeviceLocation.jsx        # 🗺️ Localização em tempo real
│   │   │
│   │   ├── 📂 equipments/                   # 🚜 Gestão de equipamentos
│   │   │   ├── 📄 Equipments.jsx            # 📋 Lista principal
│   │   │   ├── 📄 EquipmentCreate.jsx       # ➕ Criar equipamento
│   │   │   ├── 📄 EquipmentEdit.jsx         # ✏️ Editar equipamento
│   │   │   ├── 📄 Equipments_ORIG.jsx       # 💾 Versão original
│   │   │   └── 📄 Equipments_filter.jsx     # 🔍 Sistema de filtros
│   │   │
│   │   ├── 📂 maintenance/                  # 🔧 Gestão de manutenção
│   │   │   ├── 📄 Maintenance.jsx           # 📋 Lista de manutenções
│   │   │   ├── 📄 MaintenanceCreate.jsx     # ➕ Criar manutenção
│   │   │   └── 📄 MaintenanceEdit.jsx       # ✏️ Editar manutenção
│   │   │
│   │   └── 📂 records/                      # 📑 Relatórios e registros
│   │       └── 📄 Reports.jsx               # 📊 Sistema completo de relatórios PDF
│   │                                        #     ├── Análise de horímetro
│   │                                        #     ├── Análise avançada de impactos
│   │                                        #     ├── Gráficos interativos
│   │                                        #     ├── Tabela otimizada
│   │                                        #     └── Exportação PDF profissional
│   │
│   ├── 📂 components/                       # 🧩 Componentes reutilizáveis
│   │   ├── 📄 Header.jsx                    # 🎯 Cabeçalho principal
│   │   ├── 📄 Sidebar.jsx                   # 📋 Menu lateral
│   │   ├── 📄 Sidebar_ORIG.jsx              # 💾 Sidebar original
│   │   ├── 📄 LoadPage.jsx                  # ⏳ Tela de carregamento
│   │   ├── 📄 ProtectedRoute.jsx            # 🔐 Rotas protegidas
│   │   ├── 📄 PublicRoute.jsx               # 🌐 Rotas públicas
│   │   ├── 📄 LogoutHandler.jsx             # 🚪 Gerenciador de logout
│   │   ├── 📄 NotificationBell.jsx          # 🔔 Sino de notificações
│   │   ├── 📄 ResponsiveComponents.jsx      # 📱 Componentes responsivos
│   │   ├── 📄 FleetSummary.jsx              # 📊 Resumo da frota
│   │   ├── 📄 DeviceInfo.jsx                # 📡 Informações do dispositivo
│   │   ├── 📄 EquipmentDeleteModal.jsx      # 🗑️ Modal deletar equipamento
│   │   └── 📄 EmployeeDeleteModal.jsx       # 🗑️ Modal deletar funcionário
│   │
│   ├── 📂 context/                          # 🌐 Contextos globais React
│   │   ├── 📄 AuthContext.jsx               # 🔐 Contexto de autenticação
│   │   └── 📄 ThemeContext.jsx              # 🎨 Contexto de tema (dark/light)
│   │
│   ├── 📂 services/                         # 🔄 Serviços e integrações
│   │   ├── 📄 databaseService.js            # 🗄️ Serviço de banco de dados
│   │   ├── 📄 authService.js                # 🔐 Serviço de autenticação
│   │   └── 📄 apiService.js                 # 🌐 Cliente HTTP para API
│   │
│   ├── 📂 hooks/                            # 🎣 Custom Hooks React
│   │   ├── 📄 useAuth.js                    # 🔐 Hook de autenticação
│   │   ├── 📄 useTheme.js                   # 🎨 Hook de tema
│   │   └── 📄 useDevice.js                  # 📱 Hook responsividade
│   │
│   ├── 📂 config/                           # ⚙️ Configurações
│   │   ├── 📄 constants.js                  # 📋 Constantes da aplicação
│   │   └── 📄 database.js                   # 🗄️ Configuração do banco
│   │
│   └── 📂 assets/                           # 🎨 Assets estáticos
│       ├── 📂 images/                       # 🖼️ Imagens
│       ├── 📂 icons/                        # 🎯 Ícones
│       └── 📂 fonts/                        # 🔤 Fontes customizadas
│
├── 📂 public/                               # 🌐 Assets públicos
│   ├── 📄 index.html                        # 🏠 HTML principal
│   ├── 📄 manifest.json                     # 📱 Manifest PWA
│   ├── 📄 service-worker.js                 # ⚡ Service Worker
│   ├── 📄 browserconfig.xml                 # 🌐 Configuração do navegador
│   ├── 📄 vite.svg                          # ⚡ Logo Vite
│   ├── 📄 logo.png                          # 🏢 Logo da empresa
│   ├── 📄 Smartlogger.png                   # 🎯 Logo SmartLogger
│   ├── 📄 icone.svg                         # 🎨 Ícone SVG
│   ├── 📄 icon_maskable.png                 # 📱 Ícone PWA maskable
│   ├── 📄 icon-192x192.png                  # 📱 Ícone 192px
│   ├── 📄 icon-192x192.svg                  # 📱 Ícone SVG 192px
│   ├── 📄 icon-512x512.png                  # 📱 Ícone 512px
│   └── 📄 icon-512x512.svg                  # 📱 Ícone SVG 512px
│
├── 📂 docs/                                 # 📚 Documentação técnica
│   ├── 📄 PORTS.md                          # 🔌 Configuração de portas
│   ├── 📄 NOTIFICACOES.md                   # 🔔 Sistema de notificações
│   ├── 📄 README_DATABASE.md                # 🗄️ Documentação do banco
│   ├── 📄 MYSQL_CONFIG.md                   # 🐬 Configuração MySQL
│   └── 📄 REPORTS_REBUILD.md                # 📊 Relatórios e reconstrução
│
├── 📂 scripts/                              # 🛠️ Scripts de automação
│   ├── 📄 build.sh                          # 🏗️ Script de build
│   ├── 📄 deploy.sh                         # 🚀 Script de deploy
│   └── 📄 backup.sh                         # 💾 Script de backup
│
├── 📂 .vscode/                              # 🔧 Configurações VS Code
│   ├── 📄 settings.json                     # ⚙️ Configurações do editor
│   ├── 📄 extensions.json                   # 🧩 Extensões recomendadas
│   └── 📄 launch.json                       # 🚀 Configurações de debug
│
├── 📂 .git/                                 # 🌳 Controle de versão Git
│
├── 📄 package.json                          # 📦 Dependências frontend
├── 📄 package-lock.json                     # 🔒 Lock de dependências
├── 📄 vite.config.js                        # ⚡ Configuração Vite
├── 📄 tailwind.config.js                    # 🎨 Configuração Tailwind CSS
├── 📄 postcss.config.js                     # 🎨 Configuração PostCSS
├── 📄 postcss.config.cjs                    # 🎨 PostCSS (CommonJS)
├── 📄 eslint.config.js                      # 🔍 Configuração ESLint
├── 📄 .gitignore                            # 🚫 Arquivos ignorados
├── 📄 .env                                  # 🔐 Variáveis de ambiente (local)
├── 📄 .env.development                      # 🧪 Variáveis desenvolvimento
├── 📄 .env.production                       # 🚀 Variáveis produção
├── 📄 Dockerfile                            # 🐳 Container Docker frontend
├── 📄 Dockerfile.backend                    # 🐳 Container Docker backend
├── 📄 Dockerfile.fullstack                  # 🐳 Container Docker completo
└── 📄 README.md                             # 📖 Documentação principal
```

### 🔍 Legenda dos Diretórios e Arquivos

| 📁 **Categoria** | 🎯 **Função** | 📝 **Descrição** |
|------------------|---------------|------------------|
| **Backend** | 🚀 API + Database | Servidor Express, endpoints REST, integração MySQL |
| **Frontend** | ⚛️ Interface | React + Vite, componentes, páginas, contextos |
| **Pages** | 📱 Telas | Páginas principais organizadas por funcionalidade |
| **Components** | 🧩 Reutilizáveis | Componentes compartilhados entre páginas |
| **Services** | 🔄 Integrações | Camada de comunicação com APIs e serviços |
| **Context** | 🌐 Estado Global | Gerenciamento de estado React (Auth, Theme) |
| **Hooks** | 🎣 Lógica Custom | Custom hooks para reutilização de lógica |
| **Config** | ⚙️ Configurações | Constantes, configurações de banco e sistema |
| **Assets** | 🎨 Recursos | Imagens, ícones, fontes e recursos estáticos |
| **Public** | 🌐 Públicos | Assets servidos diretamente pelo servidor |
| **Docs** | 📚 Documentação | Manuais técnicos, guias de configuração |
| **Scripts** | 🛠️ Automação | Scripts de build, deploy e manutenção |

### 📊 Estatísticas do Projeto

- **Total de arquivos**: ~85+ arquivos
- **Linguagens principais**: JavaScript/JSX (90%), CSS (5%), Markdown (3%), Shell (2%)
- **Frameworks**: React 18, Vite 5, Express 4, Tailwind CSS 3
- **Banco de dados**: MySQL 8.0+ (compatível com Traccar)
- **Containerização**: Docker + Docker Compose
- **PWA**: Service Worker + Manifest
## 📚 Documentação Técnica Detalhada

A pasta `docs/` contém documentação especializada para diferentes aspectos do sistema:

### 🔌 **Configuração e Infraestrutura**
| 📄 **Arquivo** | 🎯 **Propósito** | 📝 **Conteúdo** |
|----------------|------------------|------------------|
| [`PORTS.md`](docs/PORTS.md) | Configuração de portas e scripts | Portas do sistema, scripts npm, configuração de ambiente |
| [`MYSQL_CONFIG.md`](docs/MYSQL_CONFIG.md) | Setup do banco MySQL | Instalação, configuração, otimização, backup |

### 🔔 **Sistemas e Funcionalidades**
| 📄 **Arquivo** | 🎯 **Propósito** | 📝 **Conteúdo** |
|----------------|------------------|------------------|
| [`NOTIFICACOES.md`](docs/NOTIFICACOES.md) | Sistema de notificações | Push notifications, alertas em tempo real |
| [`REPORTS_REBUILD.md`](docs/REPORTS_REBUILD.md) | Relatórios e reconstrução | Sistema de relatórios PDF, análises avançadas |

### 🗄️ **Banco de Dados**
| 📄 **Arquivo** | 🎯 **Propósito** | 📝 **Conteúdo** |
|----------------|------------------|------------------|
| [`README_DATABASE.md`](docs/README_DATABASE.md) | Documentação completa do BD | Estrutura das tabelas, relacionamentos, queries |

### 📖 **Como usar a documentação**

1. **Para desenvolvedores**: Comece com `PORTS.md` e `MYSQL_CONFIG.md`
2. **Para configuração**: Siga `README_DATABASE.md` para setup do banco
3. **Para funcionalidades**: Consulte `NOTIFICACOES.md` e `REPORTS_REBUILD.md`
4. **Para produção**: Revise todos os arquivos para configuração otimizada

## 📑 Endpoints principais

- `/api/table/tc_devices` — Lista de dispositivos
- `/api/table/tc_positions` — Posições GPS
- `/api/positions/device/:deviceId` — Relatório por equipamento/período
- `/api/tables` — Lista de todas as tabelas

### Endpoints para Relatórios
- `GET /api/positions/device/:deviceId?start=&end=&limit=` — Dados para análise temporal
- `GET /api/table/tc_devices/:id` — Detalhes específicos do equipamento
- Processamento local: Análise de impactos, horímetro e geração de PDF

## 🚀 Como usar os Relatórios

1. **Acesse a seção Relatórios** no menu principal
2. **Selecione o equipamento** desejado no dropdown
3. **Defina o período** de análise:
   - Períodos pré-definidos: Hoje, Ontem, 7/15/30 dias
   - Período personalizado: Data inicial e final
4. **Clique em "Processar Relatório"** para carregar os dados
5. **Visualize os gráficos** de horímetro e impacto na interface
6. **Gere o PDF** clicando em "Exportar PDF" para relatório completo

### Conteúdo do Relatório PDF
- **Capa profissional** com informações do equipamento e período
- **Análise de horímetro** com gráficos e detalhamento diário
- **Análise de impactos** com zonas de intensidade e eventos críticos
- **Tabela de registros** otimizada com dados mais relevantes
- **Resumos executivos** com recomendações técnicas

## � Licença

Todos os direitos reservados para Injetec Automação. Proibida a reprodução ou distribuição sem autorização expressa.

---

<div align="center">
	<sub>Desenvolvido por Injetec Automação • 2025</sub>
</div>
