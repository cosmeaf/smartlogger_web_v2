<div align="center">
	<img src="https://raw.githubusercontent.com/cosmeaf/smartlogger_web_v2/master/public/icon_maskable.png" width="120" alt="SmartLogger Logo" />
	<h1>SmartLogger Web v2</h1>
	<p>Sistema de monitoramento inteligente para equipamentos industriais e agrícolas</p>
</div>

---

## 🚀 Sobre o projeto

O <b>SmartLogger Web v2</b> é uma plataforma fullstack para monitoramento, visualização e análise de dados de equipamentos conectados via GPS, integrando frontend React + Vite e backend Node.js + MySQL.

### Funcionalidades principais
- Dashboard interativa com gráficos e relatórios
- Consulta de dispositivos, posições, eventos e usuários do banco Traccar
- Filtros avançados por período, equipamento, status e categoria
- Visualização paginada e exportação de dados
- API RESTful para integração com outros sistemas
- Interface responsiva e tema escuro/claro

## 🛠️ Tecnologias utilizadas

- Frontend: React, Vite, TailwindCSS, Chart.js, React-Chartjs-2, MUI
- Backend: Node.js, Express, MySQL2, dotenv, cors
- DevTools: ESLint, VitePWA, concurrently


## � Estrutura de Pastas

```text
smartlogger_web_v2/
├── backend/           # Backend Node.js (API, conexão MySQL, endpoints)
│   ├── server.js      # Servidor principal Express
│   ├── package.json   # Dependências do backend
│   └── ...
├── src/               # Frontend React
│   ├── pages/         # Páginas agrupadas por funcionalidade
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Recovery.jsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Main.jsx
│   │   │   └── main_backup.jsx
│   │   ├── devices/
│   │   │   ├── Devices.jsx
│   │   │   ├── DeviceDetails.jsx
│   │   │   └── DeviceLocation.jsx
│   │   ├── equipments/
│   │   │   ├── Equipments.jsx
│   │   │   ├── EquipmentCreate.jsx
│   │   │   ├── EquipmentEdit.jsx
│   │   │   ├── Equipments_ORIG.jsx
│   │   │   ├── Equipments_filter.jsx
│   │   │   └── ...
│   │   ├── maintenance/
│   │   │   ├── Maintenance.jsx
│   │   │   ├── MaintenanceCreate.jsx
│   │   │   └── MaintenanceEdit.jsx
│   │   ├── records/
│   │   │   └── Reports.jsx
│   │   └── ...
│   ├── services/      # Serviços de integração com API
│   ├── context/       # Contextos globais (Theme, Auth)
│   └── ...
├── public/            # Assets públicos (ícones, manifest, etc)
├── docs/              # Documentação extra
│   ├── PORTS.md           # Configuração de portas
│   ├── NOTIFICACOES.md    # Sistema de notificações
│   ├── README_DATABASE.md # Documentação do banco
│   ├── MYSQL_CONFIG.md    # Configuração MySQL
│   ├── REPORTS_REBUILD.md # Relatórios e reconstrução
│   └── ...
├── package.json       # Dependências do frontend
├── vite.config.js     # Configuração do Vite
└── README.md          # Documentação principal
```
## 📚 Documentação extra

Veja detalhes técnicos e operacionais nos arquivos da pasta `docs`:

- [PORTS.md](docs/PORTS.md) — Configuração de portas e scripts
- [NOTIFICACOES.md](docs/NOTIFICACOES.md) — Sistema de notificações
- [README_DATABASE.md](docs/README_DATABASE.md) — Documentação do banco
- [MYSQL_CONFIG.md](docs/MYSQL_CONFIG.md) — Configuração do MySQL
- [REPORTS_REBUILD.md](docs/REPORTS_REBUILD.md) — Relatórios e reconstrução

## 📑 Endpoints principais

- `/api/table/tc_devices` — Lista de dispositivos
- `/api/table/tc_positions` — Posições GPS
- `/api/positions/device/:deviceId` — Relatório por equipamento/período
- `/api/tables` — Lista de todas as tabelas

## � Licença

Todos os direitos reservados para Injetec Automação. Proibida a reprodução ou distribuição sem autorização expressa.

---

<div align="center">
	<sub>Desenvolvido por Injetec Automação • 2025</sub>
</div>
