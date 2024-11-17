import React from 'react';

const EquipmentDeleteModal = ({ equipmentId, onDelete, onClose }) => {
  const handleDelete = () => {
    onDelete(equipmentId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl mb-4">Tem certeza que deseja excluir este equipamento?</h2>
        <div className="flex justify-between">
          <button onClick={handleDelete} className="bg-red-500 text-white py-2 px-4 rounded">
            Excluir
          </button>
          <button onClick={onClose} className="bg-gray-300 py-2 px-4 rounded">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDeleteModal;