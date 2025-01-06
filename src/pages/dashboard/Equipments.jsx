import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadPage from '../../components/LoadPage';

const Equipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

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

    const interval = setInterval(fetchEquipments, 30000);
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
            `Falha ao deletar o equipamento: ${error.response?.data?.detail || 'Erro desconhecido'}`,
            'error'
          );
        }
      }
    });
  };

  /**
   * ✅ Cálculo de Coloração das Linhas
   */
  const getBackgroundColor = (remainingPercentage) => {
    if (isNaN(remainingPercentage) || remainingPercentage < 0) {
      return '';
    }

    if (remainingPercentage <= 10) {
      return 'bg-red-100';
    }
    if (remainingPercentage <= 30) {
      return 'bg-orange-100';
    }
    if (remainingPercentage <= 50) {
      return 'bg-yellow-100';
    }

    return '';
  };

  /**
   * ✅ Ordenação de Colunas
   */
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedEquipments = [...equipments].sort((a, b) => {
    if (!sortColumn) return 0;

    const valueA = a[sortColumn] || '';
    const valueB = b[sortColumn] || '';

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }

    return sortDirection === 'asc'
      ? valueA.toString().localeCompare(valueB.toString())
      : valueB.toString().localeCompare(valueA.toString());
  });

  /**
   * ✅ Paginação
   */
  const offset = currentPage * itemsPerPage;
  const currentItems = sortedEquipments.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(sortedEquipments.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  if (loading) {
    return <LoadPage />;
  }

  /**
   * ✅ Renderização do Componente
   */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-900">Lista de Equipamentos</h2>
        <Link
          to="/dashboard/equipments/create"
          className="bg-blue-900 text-white py-2 px-4 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Novo Equipamento
        </Link>
      </div>

      {/* Controle de Itens por Página */}
      <div className="flex justify-end mb-4">
        <label className="mr-2 text-gray-700">Itens por página:</label>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border border-gray-300 rounded-md py-1 px-2"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-center">
          <thead className="bg-blue-900 text-white">
            <tr>
              {['device', 'name', 'model', 'worked_hours', 'min_remaining_hours'].map((column) => (
                <th key={column} onClick={() => handleSort(column)} className="cursor-pointer">
                  {column.toUpperCase()} {sortColumn === column ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((equipment) => {
              const remainingPercentage =
                (parseFloat(equipment.min_remaining_hours || 0) / parseFloat(equipment.alarm_hours || 1)) * 100;

              return (
                <tr key={equipment.id} className={`${getBackgroundColor(remainingPercentage)} border-b`}>
                  <td>{equipment.device || 'N/A'}</td>
                  <td>{equipment.name || 'N/A'}</td>
                  <td>{equipment.model || 'N/A'}</td>
                  <td>{parseFloat(equipment.worked_hours || 0).toFixed(2)}</td>
                  <td>{parseFloat(equipment.min_remaining_hours || 0).toFixed(2)}</td>
                  <td className="flex justify-center space-x-4">
                    <Link to={`/dashboard/equipments/${equipment.id}/edit`} className="text-blue-500">Editar</Link>
                    <button onClick={() => openDeleteModal(equipment.id)} className="text-red-500">Deletar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 rounded-md ${currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Equipments;
