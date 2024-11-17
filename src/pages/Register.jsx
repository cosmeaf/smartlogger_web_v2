import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerService } from '../services/authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.password2) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    try {
      await registerService(formData);
      setIsLoading(false);
      toast.success('Usuário registrado com sucesso! Redirecionando...');
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao registrar usuário.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700">Nome</label>
              <input
                type="text"
                name="first_name"
                placeholder="Digite seu nome"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700">Sobrenome</label>
              <input
                type="text"
                name="last_name"
                placeholder="Digite seu sobrenome"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Digite seu email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-700">Senha</label>
              <input
                type="password"
                name="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700">Confirmar Senha</label>
              <input
                type="password"
                name="password2"
                placeholder="Confirme sua senha"
                value={formData.password2}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded text-white ${
              isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Carregando...' : 'Registrar'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p>
            <a
              onClick={() => navigate('/')}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Já tem uma conta? Faça login
            </a>
          </p>
          <p>
            <a
              onClick={() => navigate('/recovery')}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Esqueceu sua senha? Recupere-a aqui
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            Para mais informações, visite
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

export default Register;
