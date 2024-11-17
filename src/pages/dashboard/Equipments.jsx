import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaTools, FaEye, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadPage from '../../components/LoadPage';

const Equipments = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);

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


  const getBackgroundColor = (remainingHours, workHours) => {
    if (remainingHours === null || workHours === null) return '';
    const remainingPercentage = (remainingHours / workHours) * 100;

    if (remainingPercentage <= 10) {
      return 'bg-red-100';
    } else if (remainingPercentage <= 30) {
      return 'bg-orange-100';
    } else if (remainingPercentage <= 50) {
      return 'bg-yellow-100';
    } else {
      return '';
    }
  };

  if (loading) {
    return <LoadPage />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-blue-900">Lista de Equipamentos</h2>
        <Link
          to="/dashboard/equipments/create"
          className="bg-blue-900 text-white py-2 px-4 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Novo Equipamento
        </Link>
      </div>

      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="w-1/5 text-left py-3 px-4 uppercase font-semibold text-sm">Device ID</th>
              <th className="w-1/5 text-left py-3 px-4 uppercase font-semibold text-sm">Nome</th>
              <th className="w-1/5 text-left py-3 px-4 uppercase font-semibold text-sm">Modelo</th>
              <th className="w-1/5 text-left py-3 px-4 uppercase font-semibold text-sm">Horas de Trabalho</th>
              <th className="w-1/5 text-left py-3 px-4 uppercase font-semibold text-sm">Horas Restantes</th>
              <th className="w-1/5 text-left py-3 px-4 uppercase font-semibold text-sm">Opções</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {equipments.map((equipment) => (
              <tr
                key={equipment.id}
                className={`${getBackgroundColor(equipment.min_remaining_hours, equipment.worked_hours)} border-b`}
              >
                <td className="text-left py-3 px-4">{equipment.device || 'N/A'}</td>
                <td className="text-left py-3 px-4">{equipment.name}</td>
                <td className="text-left py-3 px-4">{equipment.model || 'N/A'}</td>
                <td className="text-left py-3 px-4">{equipment.worked_hours}</td>
                <td className="text-left py-3 px-4">{equipment.min_remaining_hours}</td>
                <td className="text-left py-3 px-4">
                  <div className="flex space-x-2">
                    <Link to={`/dashboard/equipments/${equipment.id}/edit`} className="text-blue-500">
                      <FaEdit className="inline-block" />
                    </Link>
                    <Link to={`/dashboard/equipments/${equipment.id}/detail`} className="text-green-500">
                      <FaEye className="inline-block" />
                    </Link>
                    <button className="text-red-500" onClick={() => openDeleteModal(equipment.id)}>
                      <FaTrash className="inline-block" />
                    </button>
                    <Link to={`/dashboard/maintenance/${equipment.id}`} className="text-yellow-500">
                      <FaTools className="inline-block" />
                    </Link>
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
