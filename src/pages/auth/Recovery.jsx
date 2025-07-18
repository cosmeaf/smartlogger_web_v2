import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recoveryService } from '../../services/authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Avatar,
  Box,
  Button,
  TextField,
  Typography,
  Link
} from '@mui/material';
import { Email, Apartment } from '@mui/icons-material';

const Recovery = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await recoveryService(email);
      toast.success('E-mail de recuperação enviado com sucesso!');
      setIsLoading(false);
      navigate('/');
    } catch (err) {
      setIsLoading(false);
      toast.error('Erro ao enviar o e-mail de recuperação.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Ondas SVG animadas no rodapé */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '200%', zIndex: 0, pointerEvents: 'none', height: 200, overflow: 'hidden' }}>
        {/* Onda de trás */}
        <Box
          component="svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '200%',
            height: 200,
            fill: '#1565c0',
            opacity: 0.4,
            zIndex: 0,
            animation: 'loginMove 12s linear infinite',
          }}
        >
          <path d="M0,128L80,117.3C160,107,320,85,480,80C640,75,800,85,960,117.3C1120,149,1280,203,1360,229.3L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
        </Box>
        {/* Onda da frente */}
        <Box
          component="svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '200%',
            height: 160,
            fill: '#1976d2',
            opacity: 0.6,
            zIndex: 1,
            animation: 'loginMoveReverse 10s linear infinite reverse',
          }}
        >
          <path d="M0,96L80,106.7C160,117,320,139,480,154.7C640,171,800,181,960,170.7C1120,160,1280,128,1360,112L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
        </Box>
        {/* Keyframes para animação das ondas */}
        <style>{`
          @keyframes loginMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes loginMoveReverse {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 3, sm: 6, md: 8 },
          py: { xs: 3, sm: 5 },
          width: { xs: '100%', sm: 420, md: 480 },
          maxWidth: 520,
          mx: 'auto',
          borderRadius: 4,
          zIndex: 1,
          position: 'relative',
          bgcolor: 'background.paper',
          boxShadow: 4
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main', mb: 2, width: 56, height: 56, color: 'background.paper' }}>
          <Apartment fontSize="large" />
        </Avatar>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Recuperação de Senha
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3} align="center">
          Informe seu e-mail para receber o link de recuperação
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-mail"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <Email sx={{ mr: 1 }} />
              ),
            }}
            disabled={isLoading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ py: 1.5, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" mt={2}>
          Não tem uma conta?{' '}
          <Link component="button" variant="body2" onClick={() => navigate('/register')}>
            Registre-se
          </Link>
        </Typography>
        <Typography variant="body2" align="center" mt={1}>
          <Link component="button" variant="body2" onClick={() => navigate('/')}>Voltar para Login</Link>
        </Typography>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Para mais informações, visite{' '}
            <Link href="http://api.smartlogger.io" target="_blank" rel="noopener noreferrer">
              API Docs
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Recovery;
