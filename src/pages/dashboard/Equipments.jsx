import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaTools, FaEye, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadPage from '../../components/LoadPage';

const Equipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState('asc'); // Direção de ordenação
  const [filters, setFilters] = useState({ name: '', model: '', minHours: '', maxHours: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Novas opções de paginação

  /**
   * ✅ Buscar Equipamentos
   */
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const { data } = await api.get('/equipments/');
        setEquipments(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar equipamentos:', error.message);
        Swal.fire('Erro', 'Não foi possível carregar os equipamentos.', 'error');
        setLoading(false);
      }
    };

    fetchEquipments();

    // Atualiza a lista a cada 30 segundos, apenas se a aba estiver visível
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchEquipments();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
   * ✅ Filtros
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Quando filtrar, volta para a página 1
  };

  /**
   * ✅ Equipamentos Filtrados
   */
  const filteredEquipments = equipments.filter((equipment) => {
    return (
      equipment.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      equipment.model.toLowerCase().includes(filters.model.toLowerCase()) &&
      (filters.minHours === '' || equipment.min_remaining_hours >= parseFloat(filters.minHours)) &&
      (filters.maxHours === '' || equipment.min_remaining_hours <= parseFloat(filters.maxHours))
    );
  });

  /**
   * ✅ Ordenação pela Coluna Nome
   */
  const handleSortByNome = () => {
    // Ordena apenas o array filtrado, sem perder os itens
    const sorted = [...filteredEquipments].sort((a, b) => {
      const nameA = a.name?.toUpperCase() || '';
      const nameB = b.name?.toUpperCase() || '';
      if (sortDirection === 'asc') {
        return nameA > nameB ? 1 : -1;
      } else {
        return nameA < nameB ? 1 : -1;
      }
    });
    // Define a lista de equipamentos ordenados
    setEquipments(sorted);
    // Alterna a direção
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    // Reseta a página ao reordenar
    setCurrentPage(1);
  };

  /**
   * ✅ Cálculo de Coloração das Linhas
   */
  const getBackgroundColor = (remainingHours, workHours) => {
    if (remainingHours === null || workHours === null) return '';
    const remainingPercentage = (remainingHours / workHours) * 100;

    if (remainingPercentage <= 10) return 'bg-red-200';
    if (remainingPercentage <= 30) return 'bg-orange-200';
    if (remainingPercentage <= 50) return 'bg-yellow-200';
    return 'bg-green-200';
  };

  /**
   * ✅ Paginação
   */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEquipments.slice(indexOfFirstItem, indexOfLastItem);

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
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* ✅ Cabeçalho com Botão Adicionar Novo */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        {/* Botões de Filtro */}
        <div className="flex flex-wrap justify-center gap-4">
          <input
            type="text"
            name="name"
            placeholder="Filtrar por Nome"
            value={filters.name}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="model"
            placeholder="Filtrar por Modelo"
            value={filters.model}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="minHours"
            placeholder="Horas Mínimas"
            value={filters.minHours}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="maxHours"
            placeholder="Horas Máximas"
            value={filters.maxHours}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              setFilters({ name: '', model: '', minHours: '', maxHours: '' });
              setCurrentPage(1);
            }}
            className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Limpar Filtros"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Botão Adicionar Novo Equipamento */}
        <Link
          to="/dashboard/equipments/create"
          className="mt-4 md:mt-0 bg-blue-900 text-white py-2 px-4 rounded-md flex items-center hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Adicionar Novo Equipamento"
        >
          <FaPlus className="mr-2" /> Novo Equipamento
        </Link>
      </div>

      {/* ✅ Controle de Itens por Página */}
      <div className="mb-4 flex justify-end items-center gap-2">
        <label className="text-gray-700">Itens por página:</label>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[10, 25, 50, 75, 100].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Tabela */}
      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-center">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="py-2 px-4">Device ID</th>
              <th
                onClick={handleSortByNome}
                className="py-2 px-4 cursor-pointer flex items-center justify-center"
              >
                Nome{' '}
                <span className="ml-1">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              </th>
              <th className="py-2 px-4">Modelo</th>
              <th className="py-2 px-4">Horas de Trabalho</th>
              <th className="py-2 px-4">Horas Restantes</th>
              <th className="py-2 px-4">Opções</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {currentItems.map((equipment) => (
              <tr
                key={equipment.id}
                className={`${getBackgroundColor(
                  equipment.min_remaining_hours,
                  equipment.worked_hours
                )} border-b`}
              >
                <td className="py-2 px-4">{equipment.device || 'N/A'}</td>
                <td className="py-2 px-4">{equipment.name}</td>
                <td className="py-2 px-4">{equipment.model || 'N/A'}</td>
                <td className="py-2 px-4">{equipment.worked_hours}</td>
                <td className="py-2 px-4">{equipment.min_remaining_hours}</td>
                <td className="py-2 px-4">
                  <div className="flex justify-center space-x-4">
                    <Link
                      to={`/dashboard/equipments/${equipment.id}/edit`}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label="Editar Equipamento"
                    >
                      <FaEdit />
                    </Link>
                    <Link
                      to={`/dashboard/equipments/${equipment.id}/detail`}
                      className="text-green-500 hover:text-green-700"
                      aria-label="Visualizar Detalhes"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => openDeleteModal(equipment.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Deletar Equipamento"
                    >
                      <FaTrash />
                    </button>
                    <Link
                      to={`/dashboard/maintenance/${equipment.id}`}
                      className="text-yellow-500 hover:text-yellow-700"
                      aria-label="Manutenção"
                    >
                      <FaTools />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-gray-500">
                  Nenhum equipamento encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    </div>
  );
};

export default Equipments;
