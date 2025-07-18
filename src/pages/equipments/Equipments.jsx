import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaTools, FaEye, FaPlus, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import LoadPage from '../../components/LoadPage';

const Equipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState('asc'); // Direção de ordenação
  const [sortBy, setSortBy] = useState('name'); // Coluna de ordenação
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100); // Novas opções de paginação
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [temperatureFilter, setTemperatureFilter] = useState('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos
  const { isDarkMode } = useTheme();

  /**
   * ✅ Buscar Equipamentos
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentsRes, devicesRes] = await Promise.all([
          api.get('/equipments/'),
          api.get('/devices/')
        ]);
        setEquipments(equipmentsRes.data);
        setDevices(devicesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error.message);
        Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
                      return minMaintenance.name || '-';
      }
    };

    fetchData();

    // Atualiza a lista a cada intervalo configurado, apenas se a aba estiver visível e auto-refresh ativo
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && autoRefresh) {
        fetchData();
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  /**
   * ✅ Modal de Exclusão
   */
  const openDeleteModal = (equipmentId) => {
    if (!equipmentId) {
      Swal.fire('Erro!', 'ID inválido.', 'error');
      return;
    }

    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/equipments/${equipmentId}/`);
          Swal.fire('Deletado!', 'O equipamento foi deletado com sucesso.', 'success');
          setEquipments((prevEquipments) =>
            prevEquipments.filter((equipment) => equipment.id !== equipmentId)
          );
        } catch (error) {
          console.error('Erro ao deletar equipamento:', error.response?.data || error.message);
          Swal.fire(
            'Erro!',
            `Falha ao deletar o equipamento: ${
              error.response?.data?.detail || 'Erro desconhecido'
            }`,
            'error'
          );
        }
      }
    });
  };

  /**
   * ✅ Modal do Mapa
   */
  const openMapModal = (equipment) => {
    if (!equipment.deviceData?.latitude || !equipment.deviceData?.longitude) {
      Swal.fire('Aviso', 'Coordenadas GPS não disponíveis para este equipamento.', 'warning');
      return;
    }
    setSelectedEquipment(equipment);
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedEquipment(null);
  };

  const openGoogleMaps = () => {
    if (selectedEquipment?.deviceData?.latitude && selectedEquipment?.deviceData?.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${selectedEquipment.deviceData.latitude},${selectedEquipment.deviceData.longitude}`,
        "_blank"
      );
    }
  };

  /**
   * ✅ Exportar Dados
   */
  const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'Local', 'Horas Trabalhadas', 'Horas Restantes', 'Temperatura', 'Status'];
    const csvData = [
      headers.join(','),
      ...filteredEquipments.map(eq => [
        eq.device || 'N/A',
        `"${eq.name}"`,
        `"${eq.model || 'N/A'}"`,
        eq.worked_hours || 0,
        eq.min_remaining_hours || 0,
        eq.deviceData?.calculated_temperature || 'N/A',
        getMaintenanceStatus(eq.min_remaining_hours)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipamentos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * ✅ Status Helper
   */
  const getMaintenanceStatus = (remaining) => {
    if (remaining < 0) return 'URGENTE';
    if (remaining < 100) return 'ATENÇÃO';
    return 'OK';
  };

  const getTemperatureStatus = (temp) => {
    if (!temp || temp > 150) return 'N/A';
    if (temp > 90) return 'ALTA';
    if (temp > 60) return 'MÉDIA';
    return 'NORMAL';
  };

  /**
   * ✅ Filtros
   */
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  /**
   * ✅ Equipamentos Filtrados
   */
  // Merge equipamentos com devices (pelo device_id)
  const mergedEquipments = equipments.map((equipment) => {
    const deviceData = devices.find((d) => String(d.device_id) === String(equipment.device));
    return { ...equipment, deviceData };
  });

  const filteredEquipments = mergedEquipments.filter((equipment) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = equipment.name.toLowerCase().includes(searchLower) ||
                         equipment.model.toLowerCase().includes(searchLower);
    
    // Filtro de status de manutenção
    const maintenanceStatus = getMaintenanceStatus(equipment.min_remaining_hours);
    const matchesMaintenance = maintenanceFilter === 'all' || 
                              (maintenanceFilter === 'urgent' && maintenanceStatus === 'URGENTE') ||
                              (maintenanceFilter === 'attention' && maintenanceStatus === 'ATENÇÃO') ||
                              (maintenanceFilter === 'ok' && maintenanceStatus === 'OK');

    // Filtro de temperatura
    const tempStatus = getTemperatureStatus(equipment.deviceData?.calculated_temperature);
    const matchesTemperature = temperatureFilter === 'all' ||
                              (temperatureFilter === 'high' && tempStatus === 'ALTA') ||
                              (temperatureFilter === 'medium' && tempStatus === 'MÉDIA') ||
                              (temperatureFilter === 'normal' && tempStatus === 'NORMAL');

    return matchesSearch && matchesMaintenance && matchesTemperature;
  });

  // Ordenação dinâmica
  const handleSort = (column) => {
    let direction = sortDirection;
    if (sortBy === column) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      direction = 'asc';
    }
    setSortBy(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const sortedEquipments = [...filteredEquipments].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.name?.toUpperCase() || '';
      const nameB = b.name?.toUpperCase() || '';
      if (sortDirection === 'asc') {
        return nameA > nameB ? 1 : -1;
      } else {
        return nameA < nameB ? 1 : -1;
      }
    } else if (sortBy === 'min_remaining_hours') {
      if (sortDirection === 'asc') {
        return a.min_remaining_hours - b.min_remaining_hours;
      } else {
        return b.min_remaining_hours - a.min_remaining_hours;
      }
    } else if (sortBy === 'worked_hours') {
      if (sortDirection === 'asc') {
        return a.worked_hours - b.worked_hours;
      } else {
        return b.worked_hours - a.worked_hours;
      }
    } else if (sortBy === 'temperature') {
      const tempA = a.deviceData?.calculated_temperature !== undefined ? a.deviceData.calculated_temperature : -Infinity;
      const tempB = b.deviceData?.calculated_temperature !== undefined ? b.deviceData.calculated_temperature : -Infinity;
      if (sortDirection === 'asc') {
        return tempA - tempB;
      } else {
        return tempB - tempA;
      }
    }
    return 0;
  });

  /**
   * ✅ Cálculo de Coloração das Linhas
   */
  // Esquema de cores inline, sem classes Tailwind
  const getRowStyle = (remaining) => {
    if (remaining < 0) return { backgroundColor: 'rgba(248, 151, 151, 0.8)' };
    if (remaining < 100) return { backgroundColor: 'rgba(245, 245, 139, 0.8)' };
    return { backgroundColor: 'rgba(153, 243, 153, 0.8)' };
  };

  /**
   * ✅ Paginação
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEquipments.slice(indexOfFirstItem, indexOfLastItem);

  // Para exibir os botões de página
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);

  // Função para trocar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Troca de itens por página
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-6 min-h-screen">
      {/* ✅ Barra de Ferramentas */}
      <div className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg shadow border`}>
        {/* Primeira linha: Busca e Filtros */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Pesquisar por nome ou modelo..."
              value={search}
              onChange={handleSearchChange}
              className={`p-2 px-4 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[280px]`}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 px-4 rounded-md flex items-center ${showFilters ? 
                (isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700') : 
                (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')
              } hover:${isDarkMode ? 'bg-blue-800' : 'bg-blue-200'}`}
            >
              🔍 Filtros Avançados
            </button>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setTemperatureFilter('all');
                setMaintenanceFilter('all');
                setCurrentPage(1);
              }}
              className={`p-2 px-4 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-md`}
            >
              Limpar Filtros
            </button>
          </div>

          <div className="flex gap-2 items-center">
            {/* Botão Exportar CSV */}
            <button
              onClick={exportToCSV}
              className={`${isDarkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white py-2 px-4 rounded-md flex items-center whitespace-nowrap`}
            >
              📊 Exportar CSV
            </button>
            {/* Botão Adicionar Novo Equipamento */}
            <Link
              to="/dashboard/equipments/create"
              className={`${isDarkMode ? 'bg-blue-800 hover:bg-blue-700' : 'bg-blue-900 hover:bg-blue-800'} text-white py-2 px-4 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap`}
              aria-label="Adicionar Novo Equipamento"
            >
              <FaPlus className="mr-2" /> Novo Equipamento
            </Link>
          </div>
        </div>

        {/* Filtros Avançados (Colapsável) */}
        {showFilters && (
          <div className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg space-y-4`}>
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Status Manutenção</label>
                <select
                  value={maintenanceFilter}
                  onChange={(e) => setMaintenanceFilter(e.target.value)}
                  className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md py-2 px-3`}
                >
                  <option value="all">Todos</option>
                  <option value="urgent">🔴 Urgente</option>
                  <option value="attention">🟡 Atenção</option>
                  <option value="ok">🟢 OK</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Temperatura</label>
                <select
                  value={temperatureFilter}
                  onChange={(e) => setTemperatureFilter(e.target.value)}
                  className={`w-full border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md py-2 px-3`}
                >
                  <option value="all">Todas</option>
                  <option value="high">🔥 Alta (&gt;90°C)</option>
                  <option value="medium">🟡 Média (60-89°C)</option>
                  <option value="normal">❄️ Normal (&lt;60°C)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Tabela */}
      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-center">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="py-2 px-4">ID</th>
              <th
                onClick={() => handleSort('name')}
                className="py-2 px-4 cursor-pointer flex items-center justify-center"
              >
                Nome{' '}
                {sortBy === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="py-2 px-4">Local </th>
              <th
                onClick={() => handleSort('worked_hours')}
                className="py-2 px-4 cursor-pointer text-center"
                style={{ whiteSpace: 'nowrap' }}
              >
                <span className="inline-flex items-center">
                  Horas Trabalho
                  {sortBy === 'worked_hours' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
              <th
                onClick={() => handleSort('min_remaining_hours')}
                className="py-2 px-4 cursor-pointer text-center"
              >
                <span className="inline-flex items-center justify-center">
                  Horas Restantes 
                  {sortBy === 'min_remaining_hours' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
              <th
                onClick={() => handleSort('temperature')}
                className="py-2 px-4 cursor-pointer text-center"
                style={{ whiteSpace: 'nowrap' }}
              >
                <span className="inline-flex items-center">
                  Temperatura 
                  {sortBy === 'temperature' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {currentItems.map((equipment) => (
              <tr
                key={equipment.id}
                style={getRowStyle(equipment.min_remaining_hours)}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-2 px-4 font-mono text-sm">{equipment.device || 'N/A'}</td>
                <td className="py-2 px-4">{equipment.name}</td>
                <td 
                  className="py-2 px-4 cursor-pointer text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1" 
                  onClick={() => openMapModal(equipment)}
                  title="Clique para ver no mapa"
                >
                   {equipment.model || 'N/A'}
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center justify-center gap-1">
                    
                    <span>
                      {Number(equipment.worked_hours).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <span>
                      {Number(equipment.min_remaining_hours).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h
                    </span>
                  </div>
                </td>
                <td className="py-2 px-4">
                  {equipment.deviceData?.calculated_temperature !== undefined
                    ? (
                        equipment.deviceData.calculated_temperature > 150
                          ? <span className="text-gray-400">N/A</span>
                          : <div className="flex items-center justify-center gap-1">
                              <span className={`text-lg ${
                                equipment.deviceData.calculated_temperature > 90 ? '🔥' :
                                equipment.deviceData.calculated_temperature > 60 ? '🟡' : '❄️'
                              }`}>
                                🌡️
                              </span>
                              <span className="font-mono">
                                {Number(equipment.deviceData.calculated_temperature).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°C
                              </span>
                            </div>
                      )
                    : <span className="text-gray-400">N/A</span>
                  }
                </td>
                <td className="py-2 px-4">
                  <div className="flex flex-col gap-1">
                    {/* Status de Manutenção (Horas Restantes) */}
                    <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
                      getMaintenanceStatus(equipment.min_remaining_hours) === 'URGENTE' ? 'bg-red-100 text-red-800' :
                      getMaintenanceStatus(equipment.min_remaining_hours) === 'ATENÇÃO' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getMaintenanceStatus(equipment.min_remaining_hours) === 'URGENTE' ? '🔴' :
                       getMaintenanceStatus(equipment.min_remaining_hours) === 'ATENÇÃO' ? '🟡' :
                       '🟢'} Manut.
                    </span>
                    
                    {/* Status de Temperatura */}
                    {equipment.deviceData?.calculated_temperature !== undefined && equipment.deviceData.calculated_temperature <= 150 && (
                      <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
                        equipment.deviceData.calculated_temperature > 90 ? 'bg-red-100 text-red-800' :
                        equipment.deviceData.calculated_temperature > 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {equipment.deviceData.calculated_temperature > 90 ? '🔥' :
                         equipment.deviceData.calculated_temperature > 60 ? '🟡' :
                         '❄️'} Temp.
                      </span>
                    )}
                  </div>
                </td>
    
                <td className="py-2 px-4">
                  <div className="flex justify-center space-x-4">
                    <Link
                      to={`/dashboard/equipments/${equipment.id}/edit`}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label="Editar Equipamento"
                    >
                      <span style={{ display: 'inline-flex', borderRadius: '50%', padding: 0 }}>
                        <FaEdit style={{ stroke: '#000', strokeWidth: 3 }} />
                      </span>
                    </Link>
                    <Link
                      to={`/dashboard/devices/${equipment.device}`}
                      className="text-green-500 hover:text-green-700"
                      aria-label="Visualizar Detalhes do Device"
                    >
                      <span style={{ display: 'inline-flex', borderRadius: '50%', padding: 0 }}>
                        <FaEye style={{ stroke: '#000', strokeWidth: 3 }} />
                      </span>
                    </Link>
                    <button
                      onClick={() => openDeleteModal(equipment.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Deletar Equipamento"
                    >
                      <span style={{ display: 'inline-flex', borderRadius: '50%', padding: 0 }}>
                        <FaTrash style={{ stroke: '#000', strokeWidth: 3 }} />
                      </span>
                    </button>
                    <Link
                      to={`/dashboard/maintenance/${equipment.id}`}
                      className="text-yellow-500 hover:text-yellow-700"
                      aria-label="Manutenção"
                    >
                      <span style={{ display: 'inline-flex', borderRadius: '50%', padding: 0 }}>
                        <FaTools style={{ stroke: '#000', strokeWidth: 3 }} />
                      </span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-gray-500">
                  Nenhum equipamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Controle de Itens por Página */}
      <div className="mt-4 mb-4 flex justify-end items-center gap-2">
        <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Itens por página:</label>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className={`border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {[10, 25, 50, 75, 100].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Paginação Simples */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          {/* Botão Anterior */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            aria-label="Página Anterior"
          >
            Anterior
          </button>

          {/* Indicador de Páginas */}
          <span className="px-2">
            Página {currentPage} de {totalPages}
          </span>

          {/* Botão Próxima */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            aria-label="Próxima Página"
          >
            Próxima
          </button>
        </div>
      )}

      {/* ✅ Modal do Mapa */}
      {showMapModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto`}>
            {/* Header do Modal */}
            <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Localização: {selectedEquipment.name}
                </h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Local de Trabalho: {selectedEquipment.model}
                </p>
              </div>
              <button
                onClick={closeMapModal}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} text-2xl`}
                aria-label="Fechar Modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-4">
              {selectedEquipment.deviceData?.latitude && selectedEquipment.deviceData?.longitude ? (
                <>
                  {/* Informações de GPS */}
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg`}>
                      <strong className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Latitude:</strong>
                      <span className={`ml-2 font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.deviceData.latitude}</span>
                    </div>
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg`}>
                      <strong className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Longitude:</strong>
                      <span className={`ml-2 font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedEquipment.deviceData.longitude}</span>
                    </div>
                  </div>

                  {/* Mapa Incorporado */}
                  <div className="relative w-full h-96 mb-4">
                    <iframe
                      title={`Mapa de localização - ${selectedEquipment.name}`}
                      src={`https://maps.google.com/maps?q=${selectedEquipment.deviceData.latitude},${selectedEquipment.deviceData.longitude}&z=15&output=embed`}
                      className="w-full h-full border-0 rounded-lg"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <button
                      onClick={closeMapModal}
                      className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500`}
                    >
                      Fechar
                    </button>
                    <button
                      onClick={openGoogleMaps}
                      className={`px-4 py-2 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      Abrir no Google Maps
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-lg mb-2`}>
                    📍 Coordenadas GPS não disponíveis
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-4`}>
                    Este equipamento não possui informações de localização.
                  </p>
                  <button
                    onClick={closeMapModal}
                    className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500`}
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipments;
