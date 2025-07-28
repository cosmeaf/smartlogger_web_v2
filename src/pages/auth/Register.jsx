import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import { registerService } from '../../services/authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Avatar,
  Box,
  Button,
  TextField,
  Typography,
  Link,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Email, Lock, Apartment, DarkMode, LightMode } from '@mui/icons-material';

const Register = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMobile, isTablet, screenWidth } = useDevice();
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
          position: 'relative',
          bgcolor: isDarkMode ? 'grey.800' : 'background.paper',
          boxShadow: 4,
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
          Registro
        </Typography>
        <Typography variant={isMobile ? "body2" : "body1"} mb={isMobile ? 1.5 : 3} align="center"
          sx={{ 
            color: isDarkMode ? 'grey.300' : 'text.secondary'
          }}>
          Preencha os campos para criar sua conta
        </Typography>

        {error && (
          <Box sx={{ 
            bgcolor: isDarkMode ? 'error.dark' : 'error.light', 
            border: 1, 
            borderColor: 'error.main', 
            color: isDarkMode ? 'error.light' : 'error.dark', 
            px: isMobile ? 1 : 2, 
            py: isMobile ? 0.3 : 1, 
            borderRadius: 1, 
            mb: isMobile ? 1 : 2,
            width: '100%'
          }}>
            <Typography variant="body2"
              sx={{ 
                color: isDarkMode ? 'grey.100' : 'error.dark',
                fontSize: isMobile ? '12px' : 'inherit'
              }}>
              {error}
            </Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <TextField
              margin={isMobile ? "dense" : "normal"}
              required
              fullWidth
              name="first_name"
              label="Nome"
              value={formData.first_name}
              onChange={handleChange}
              size={isMobile ? "small" : "medium"}
              InputProps={{
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
              disabled={isLoading}
            />
            <TextField
              margin={isMobile ? "dense" : "normal"}
              required
              fullWidth
              name="last_name"
              label="Sobrenome"
              value={formData.last_name}
              onChange={handleChange}
              size={isMobile ? "small" : "medium"}
              InputProps={{
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
              disabled={isLoading}
            />
          </Box>
          <TextField
            margin={isMobile ? "dense" : "normal"}
            required
            fullWidth
            name="email"
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={handleChange}
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
            disabled={isLoading}
          />
          <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, flexDirection: isMobile ? 'column' : 'row' }}>
            <TextField
              margin={isMobile ? "dense" : "normal"}
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              value={formData.password}
              onChange={handleChange}
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
              disabled={isLoading}
            />
            <TextField
              margin={isMobile ? "dense" : "normal"}
              required
              fullWidth
              name="password2"
              label="Confirmar Senha"
              type="password"
              value={formData.password2}
              onChange={handleChange}
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
              disabled={isLoading}
            />
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              py: isMobile ? 1 : 1.5, 
              mb: isMobile ? 1 : 2,
              mt: isMobile ? 0.5 : 0,
              fontSize: isMobile ? '14px' : '14px'
            }}
            disabled={isLoading}
            size={isMobile ? "medium" : "medium"}
          >
            {isLoading ? 'Carregando...' : 'Registrar'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" mt={isMobile ? 0.5 : 2}
          sx={{ 
            color: isDarkMode ? 'grey.200' : 'text.primary',
            fontSize: isMobile ? '12px' : 'inherit'
          }}>
          Já tem uma conta?{' '}
          <Link component="button" variant="body2" onClick={() => navigate('/')}
            sx={{ 
              color: isDarkMode ? 'primary.light' : 'primary.main',
              fontSize: isMobile ? '12px' : 'inherit'
            }}>
            Faça login
          </Link>
        </Typography>
        <Typography variant="body2" align="center" mt={isMobile ? 0.3 : 1}
          sx={{ 
            color: isDarkMode ? 'grey.200' : 'text.primary',
            fontSize: isMobile ? '12px' : 'inherit'
          }}>
          <Link component="button" variant="body2" onClick={() => navigate('/recovery')}
            sx={{ 
              color: isDarkMode ? 'primary.light' : 'primary.main',
              fontSize: isMobile ? '12px' : 'inherit'
            }}>
            Esqueceu sua senha? Recupere-a aqui
          </Link>
        </Typography>

        <Box sx={{ 
          mt: isMobile ? 0.5 : 3, 
          textAlign: 'center',
          mb: 0
        }}>
          <Typography variant="caption" 
            sx={{ 
              color: isDarkMode ? 'grey.400' : 'text.secondary',
              fontSize: isMobile ? '10px' : '12px'
            }}>
            Para mais informações, visite{' '}
            <Link href="http://api.smartlogger.io" target="_blank" rel="noopener noreferrer"
              sx={{ color: isDarkMode ? 'primary.light' : 'primary.main' }}>
              API Docs
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
