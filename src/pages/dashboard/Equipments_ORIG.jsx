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
  const itemsPerPage = 10;

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
          Swal.fire('Erro!', `Falha ao deletar o equipamento: ${error.response?.data?.detail || 'Erro desconhecido'}`, 'error');
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
  };

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
    const sorted = [...filteredEquipments].sort((a, b) => {
      const nameA = a.name?.toUpperCase() || '';
      const nameB = b.name?.toUpperCase() || '';
      if (sortDirection === 'asc') {
        return nameA > nameB ? 1 : -1;
      } else {
        return nameA < nameB ? 1 : -1;
      }
    });
    setEquipments(sorted);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
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

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* ✅ Filtros */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          name="name"
          placeholder="Filtrar por Nome"
          value={filters.name}
          onChange={handleFilterChange}
          className="p-2 border rounded-md"
        />
        <input
          type="text"
          name="model"
          placeholder="Filtrar por Modelo"
          value={filters.model}
          onChange={handleFilterChange}
          className="p-2 border rounded-md"
        />
        <input
          type="number"
          name="minHours"
          placeholder="Horas Mínimas"
          value={filters.minHours}
          onChange={handleFilterChange}
          className="p-2 border rounded-md"
        />
        <input
          type="number"
          name="maxHours"
          placeholder="Horas Máximas"
          value={filters.maxHours}
          onChange={handleFilterChange}
          className="p-2 border rounded-md"
        />
      </div>

      {/* ✅ Tabela */}
      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th>Device ID</th>
              <th onClick={handleSortByNome} className="cursor-pointer">
                Nome {sortDirection === 'asc' ? '↑' : '↓'}
              </th>
              <th>Modelo</th>
              <th>Horas de Trabalho</th>
              <th>Horas Restantes</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {currentItems.map((equipment) => (
              <tr key={equipment.id} className={`${getBackgroundColor(equipment.min_remaining_hours, equipment.worked_hours)} border-b`}>
                <td>{equipment.device || 'N/A'}</td>
                <td>{equipment.name}</td>
                <td>{equipment.model || 'N/A'}</td>
                <td>{equipment.worked_hours}</td>
                <td>{equipment.min_remaining_hours}</td>
                <td>
                  <div className="flex space-x-2">
                    <Link to={`/dashboard/equipments/${equipment.id}/edit`} className="text-blue-500"><FaEdit /></Link>
                    <Link to={`/dashboard/equipments/${equipment.id}/detail`} className="text-green-500"><FaEye /></Link>
                    <button onClick={() => openDeleteModal(equipment.id)} className="text-red-500"><FaTrash /></button>
                    <Link to={`/dashboard/maintenance/${equipment.id}`} className="text-yellow-500"><FaTools /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Equipments;
