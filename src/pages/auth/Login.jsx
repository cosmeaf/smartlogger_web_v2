
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
  Paper
} from '@mui/material';

import { Visibility, VisibilityOff, Email, Lock, Apartment, DarkMode, LightMode } from '@mui/icons-material';


const Login = () => {
  const { login, error, showLogoutSuccess, clearLogoutSuccess } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMobile, isTablet, screenWidth } = useDevice();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Efeito para mostrar notificação de logout bem-sucedido
  React.useEffect(() => {
    if (showLogoutSuccess) {
      toast.success('Logout realizado com sucesso!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? "dark" : "light",
      });
      clearLogoutSuccess(); // Limpa a flag após mostrar
    }
  }, [showLogoutSuccess, clearLogoutSuccess, isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Iniciando processo de login...');
      const success = await login(email, password, rememberMe);
      if (success) {
        toast.success('Login realizado com sucesso!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: isDarkMode ? "dark" : "light",
        });
        console.log('Redirecionando para dashboard...');
        navigate('/dashboard');
      } else {
        console.log('Login falhou, permanecendo na página');
        toast.error('Falha no login. Por favor, verifique suas credenciais.', {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: isDarkMode ? "dark" : "light",
        });
      }
    } catch (err) {
      console.error('Erro durante o processo de login:', err);
      toast.error('Erro ao tentar fazer login. Tente novamente.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: isDarkMode ? "dark" : "light",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: isDarkMode ? 'grey.900' : 'grey.100', 
      position: 'relative', 
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      px: isMobile ? 2 : 0
    }}>
      {/* Theme Toggle Button */}
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'fixed',
          top: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          zIndex: 1000,
          bgcolor: isDarkMode ? 'grey.800' : 'background.paper',
          border: 1,
          borderColor: isDarkMode ? 'grey.700' : 'grey.300',
          '&:hover': {
            bgcolor: isDarkMode ? 'grey.700' : 'grey.100',
          }
        }}
      >
        {isDarkMode ? <LightMode /> : <DarkMode />}
      </IconButton>

      {/* Ondas SVG animadas no rodapé */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '200%', zIndex: 0, pointerEvents: 'none', height: isMobile ? 150 : 200, overflow: 'hidden' }}>
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
            height: isMobile ? 150 : 200,
            fill: isDarkMode ? '#1e3a8a' : '#1565c0',
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
            height: isMobile ? 120 : 160,
            fill: isDarkMode ? '#2563eb' : '#1976d2',
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
          p: isMobile ? 3 : 6,
          width: isMobile ? 360 : 480,
          borderRadius: 4,
          zIndex: 10,
          bgcolor: isDarkMode ? 'grey.800' : 'background.paper',
          boxShadow: 4,
          position: 'relative',
          animation: 'fadeInUp 0.6s ease-out',
          '@keyframes fadeInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(30px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        <Avatar sx={{ 
          bgcolor: 'primary.main', 
          mb: isMobile ? 1 : 2, 
          width: isMobile ? 36 : 56, 
          height: isMobile ? 36 : 56, 
          color: 'background.paper',
          mt: isMobile ? 1 : 0
        }}>
          <Apartment fontSize={isMobile ? "small" : "large"} />
        </Avatar>
        <Typography variant={isMobile ? "body1" : "h5"} fontWeight={700} gutterBottom 
          sx={{ 
            color: isDarkMode ? 'grey.100' : 'text.primary',
            mb: isMobile ? 0.5 : 1
          }}>
          Bem-vindo de volta!
        </Typography>
        <Typography variant={isMobile ? "body2" : "body1"} mb={isMobile ? 1.5 : 3} textAlign="center"
          sx={{ color: isDarkMode ? 'grey.300' : 'text.secondary' }}>
          Faça login com seu e-mail
        </Typography>

        {error && (
          <Box sx={{ 
            bgcolor: isDarkMode ? 'error.dark' : 'error.light', 
            border: 1, 
            borderColor: 'error.main', 
            color: isDarkMode ? 'error.light' : 'error.dark', 
            px: 2, 
            py: 1, 
            borderRadius: 1, 
            mb: 2,
            width: '100%'
          }}>
            <Typography variant={isMobile ? "body2" : "body1"}
              sx={{ color: isDarkMode ? 'grey.100' : 'error.dark' }}>
              {error}
            </Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin={isMobile ? "dense" : "normal"}
            required
            fullWidth
            id="email"
            label="E-mail"
            autoComplete="email"
            autoFocus={!isMobile} // Evita zoom no iOS
            value={email}
            onChange={e => setEmail(e.target.value)}
            size={isMobile ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ 
                    color: isDarkMode ? 'grey.400' : 'action.active',
                    fontSize: isMobile ? '1rem' : '1.25rem'
                  }} />
                </InputAdornment>
              ),
              style: {
                fontSize: isMobile ? '16px' : '14px' // Evita zoom no iOS
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? 'grey.700' : 'background.paper',
              },
              '& .MuiInputLabel-root': {
                color: isDarkMode ? 'grey.300' : 'text.secondary',
              },
              '& .MuiInputBase-input': {
                color: isDarkMode ? 'grey.100' : 'text.primary',
              }
            }}
          />

          <TextField
            margin={isMobile ? "dense" : "normal"}
            required
            fullWidth
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            size={isMobile ? "small" : "medium"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ 
                    color: isDarkMode ? 'grey.400' : 'action.active',
                    fontSize: isMobile ? '1rem' : '1.25rem'
                  }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(prev => !prev)}
                    edge="end"
                    size={isMobile ? "small" : "medium"}
                    sx={{ color: isDarkMode ? 'grey.400' : 'action.active' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: {
                fontSize: isMobile ? '16px' : '14px'
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? 'grey.700' : 'background.paper',
              },
              '& .MuiInputLabel-root': {
                color: isDarkMode ? 'grey.300' : 'text.secondary',
              },
              '& .MuiInputBase-input': {
                color: isDarkMode ? 'grey.100' : 'text.primary',
              }
            }}
          />

          <Box sx={{ 
            mt: isMobile ? 0.5 : 1, 
            mb: isMobile ? 1 : 2, 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 0.5 : 0
          }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{ 
                    color: isDarkMode ? 'grey.300' : 'primary.main',
                    p: isMobile ? 0.5 : 1
                  }}
                />
              }
              label={
                <Typography variant="body2"
                  sx={{ color: isDarkMode ? 'grey.200' : 'text.primary' }}>
                  Lembrar de mim
                </Typography>
              }
            />
            <Link
              component="button"
              variant="body2"
              type="button"
              onClick={() => navigate('/recovery')}
              tabIndex={0}
              sx={{ 
                alignSelf: isMobile ? 'flex-end' : 'auto',
                fontSize: '13px',
                color: isDarkMode ? 'primary.light' : 'primary.main'
              }}
            >
              Esqueceu a senha?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              py: isMobile ? 1.2 : 1.5, 
              mb: isMobile ? 1 : 2,
              fontSize: isMobile ? '15px' : '14px'
            }}
            disabled={isLoading}
            size={isMobile ? "medium" : "medium"}
          >
            {isLoading ? 'Carregando...' : 'Entrar'}
          </Button>

          <Typography variant="body2" align="center" 
            sx={{ 
              color: isDarkMode ? 'grey.400' : 'text.secondary',
              mb: isMobile ? 0.5 : 1
            }}>
            ou
          </Typography>

          <Typography variant="body2" align="center"
            sx={{ color: isDarkMode ? 'grey.200' : 'text.primary' }}>
            Não tem conta?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ 
                fontSize: '13px',
                color: isDarkMode ? 'primary.light' : 'primary.main'
              }}
            >
              Criar agora
            </Link>
          </Typography>
        </Box>

        <Box sx={{ 
          mt: isMobile ? 1 : 3, 
          textAlign: 'center',
          mb: 0
        }}>
          <Typography variant="caption" 
            sx={{ 
              color: isDarkMode ? 'grey.400' : 'text.secondary',
              fontSize: isMobile ? '11px' : '12px'
            }}>
            Para mais informações, visite{' '}
            <Link href="http://api.smartlogger.io" target="_blank" rel="noopener noreferrer"
              sx={{ color: isDarkMode ? 'primary.light' : 'primary.main' }}>
              API Docs
            </Link>
          </Typography>
        </Box>
      </Box>

      {/* ToastContainer para notificações */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
      />
    </Box>
  );
};

export default Login;
