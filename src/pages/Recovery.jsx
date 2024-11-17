import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recoveryService } from '../services/authService'; // Certifique-se de que isso está configurado corretamente
import { toast } from 'react-toastify';

const Recovery = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await recoveryService(email); // Envia o email de recuperação para o endpoint
      toast.success('E-mail de recuperação enviado com sucesso!');
      setIsLoading(false);
      navigate('/'); // Redireciona para a página inicial
    } catch (err) {
      setIsLoading(false);
      toast.error('Erro ao enviar o e-mail de recuperação.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Recuperação de Senha</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">E-mail</label>
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded text-white ${
              isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p>
            <a
              onClick={() => navigate('/register')}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Não tem uma conta? Registre-se
            </a>
          </p>
          <p>
            <a
              onClick={() => navigate('/')}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Voltar para Login
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            Para mais informações, visite{' '}
            <a
              href="http://api.smartlogger.io"
              className="text-blue-500 hover:underline"
            >
              API Docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Recovery;
