import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import { useThemeTransitions } from '../../hooks/useThemeTransitions';
import { registerService } from '../../services/authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/transitions.css';

// Componentes de melhorias
import ValidatedEmailField from '../../components/auth/ValidatedEmailField';
import MicroInteractions, { GlobalAnimations } from '../../components/auth/MicroInteractions';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
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
  
  // 🎭 Hook para transições suaves de tema
  const {
    isTransitioning,
    iconRef,
    buttonRef,
    handleThemeChange
  } = useThemeTransitions(toggleTheme, isDarkMode);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, password: value });
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, password2: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFormErrors({});

    // Validações básicas
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'Nome é obrigatório';
    if (!formData.last_name.trim()) errors.last_name = 'Sobrenome é obrigatório';
    if (!formData.email.trim()) errors.email = 'E-mail é obrigatório';
    if (!formData.password.trim()) errors.password = 'Senha é obrigatória';
    if (formData.password !== formData.password2) {
      errors.password2 = 'As senhas não coincidem';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      await registerService(formData);
      setRegisterSuccess(true);
      setIsLoading(false);
      toast.success('Usuário registrado com sucesso! Redirecionando...');
      
      // Pequeno delay para mostrar animação de sucesso
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erro ao registrar usuário.');
      setIsLoading(false);
      toast.error('Erro ao registrar usuário.');
    }
  };

  return (
    <>
      {/* Animações CSS globais */}
      <GlobalAnimations />
      
      {/* Animações de feedback */}
      <MicroInteractions.SuccessAnimation 
        show={registerSuccess} 
        message="Registro realizado com sucesso!" 
      />
      
    <Box sx={{ 
      minHeight: '100vh', 
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0d1421 0%, #1a1a2e 25%, #16213e 50%, #0f1419 75%, #0a0e27 100%)' 
        : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%)',
      position: 'relative', 
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      px: isMobile ? 2 : 0,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDarkMode 
          ? 'radial-gradient(circle at 30% 20%, rgba(25, 118, 210, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(66, 165, 245, 0.1) 0%, transparent 50%)' 
          : 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
        pointerEvents: 'none',
      }
    }}>
      {/* Partículas flutuantes */}
      <MicroInteractions.FloatingParticles isDarkMode={isDarkMode} count={12} />
      {/* Theme Toggle Button with Smooth Animations */}
      <IconButton
        ref={buttonRef}
        onClick={handleThemeChange}
        disabled={isTransitioning}
        className="theme-button"
        sx={{
          position: 'fixed',
          top: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          zIndex: 1000,
          bgcolor: isDarkMode ? 'grey.800' : 'background.paper',
          border: 1,
          borderColor: isDarkMode ? 'grey.700' : 'grey.300',
          width: isMobile ? 48 : 56,
          height: isMobile ? 48 : 56,
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            bgcolor: isDarkMode ? 'grey.700' : 'grey.100',
            transform: 'scale(1.05)',
            boxShadow: isDarkMode 
              ? '0 12px 40px rgba(0, 0, 0, 0.4)' 
              : '0 12px 40px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&.Mui-disabled': {
            bgcolor: isDarkMode ? 'grey.800' : 'background.paper',
            opacity: 0.7,
          }
        }}
      >
        <Box
          ref={iconRef}
          className="theme-icon"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDarkMode ? 'warning.main' : 'primary.main',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
          }}
        >
          {isDarkMode ? <LightMode /> : <DarkMode />}
        </Box>
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
          p: isMobile ? 3 : 5,
          width: isMobile ? 360 : 440,
          borderRadius: 4,
          zIndex: 10,
          position: 'relative',
          bgcolor: isDarkMode ? 'grey.800' : 'background.paper',
          boxShadow: isDarkMode 
            ? '0 16px 32px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)' 
            : '0 16px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(10px)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            mb: isMobile ? 2 : 3,
            mt: isMobile ? 0 : -0.5,
            position: 'relative'
          }}
        >
          <Box
            sx={{
              background: isDarkMode 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)' 
                : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.7) 100%)',
              borderRadius: 2,
              px: isMobile ? 1.5 : 2,
              py: isMobile ? 0.8 : 1,
              display: 'inline-block',
              boxShadow: isDarkMode 
                ? '0 4px 16px rgba(0, 0, 0, 0.2)' 
                : '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: isDarkMode 
                ? '1px solid rgba(255, 255, 255, 0.15)' 
                : '1px solid rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            <img
              src="/logo.png"
              alt="Logo SmartLogger"
              style={{
                width: isMobile ? '160px' : '180px',
                height: 'auto',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </Box>
        </Box>
        <Typography
          variant={isMobile ? "h5" : "h5"}
          fontWeight={700}
          gutterBottom
          sx={{
            color: isDarkMode ? 'grey.100' : 'text.primary',
            mb: isMobile ? 0.8 : 1,
            fontSize: isMobile ? '1.5rem' : '1.6rem',
            background: isDarkMode 
              ? 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)' 
              : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
            letterSpacing: '-0.3px'
          }}
        >
          Criar Conta
        </Typography>
        <Typography variant={isMobile ? "body2" : "body1"} mb={isMobile ? 2 : 2.5} align="center"
          sx={{ 
            color: isDarkMode ? 'grey.300' : 'text.secondary',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: 400,
            lineHeight: 1.4,
            opacity: 0.9
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
              error={!!formErrors.first_name}
              helperText={formErrors.first_name}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                style: {
                  fontSize: isMobile ? '16px' : '14px'
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDarkMode ? 'grey.700' : 'background.paper',
                  '&.Mui-error': {
                    animation: formErrors.first_name ? 'shake 0.5s ease-in-out' : 'none',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? 'grey.300' : 'text.secondary',
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? 'grey.100' : 'text.primary',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: isDarkMode ? '0 0 0 1000px #616161 inset !important' : '0 0 0 1000px #fff inset !important',
                    WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
                    transition: 'background-color 5000s ease-in-out 0s !important',
                    borderRadius: 'inherit !important',
                  },
                  '&:-webkit-autofill:hover': {
                    WebkitBoxShadow: isDarkMode ? '0 0 0 1000px #616161 inset !important' : '0 0 0 1000px #fff inset !important',
                    WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
                  },
                  '&:-webkit-autofill:focus': {
                    WebkitBoxShadow: isDarkMode ? '0 0 0 1000px #616161 inset !important' : '0 0 0 1000px #fff inset !important',
                    WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
                  },
                  '&:-webkit-autofill:active': {
                    WebkitBoxShadow: isDarkMode ? '0 0 0 1000px #616161 inset !important' : '0 0 0 1000px #fff inset !important',
                    WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
                  }
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
              error={!!formErrors.last_name}
              helperText={formErrors.last_name}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                style: {
                  fontSize: isMobile ? '16px' : '14px'
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDarkMode ? 'grey.700' : 'background.paper',
                  '&.Mui-error': {
                    animation: formErrors.last_name ? 'shake 0.5s ease-in-out' : 'none',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: isDarkMode ? 'grey.300' : 'text.secondary',
                },
                '& .MuiInputBase-input': {
                  color: isDarkMode ? 'grey.100' : 'text.primary',
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: isDarkMode ? '0 0 0 1000px #616161 inset !important' : '0 0 0 1000px #fff inset !important',
                    WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
                    transition: 'background-color 5000s ease-in-out 0s !important',
                    borderRadius: 'inherit !important',
                  },
                  '&:-webkit-autofill:hover': {
                    WebkitBoxShadow: isDarkMode ? '0 0 0 1000px #616161 inset !important' : '0 0 0 1000px #fff inset !important',
                    WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
                  },
                  '&:-webkit-autofill:focus': {
                    WebkitBoxShadow: isDarkMode ? '0 0 0 1000px #616161 inset !important' : '0 0 0 1000px #fff inset !important',
                    WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
                  },
                  '&:-webkit-autofill:active': {
                    WebkitBoxShadow: isDarkMode ? '0 0 0 1000px #616161 inset !important' : '0 0 0 1000px #fff inset !important',
                    WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
                  }
                }
              }}
              disabled={isLoading}
            />
          </Box>
          {/* Email com validação em tempo real */}
          <ValidatedEmailField
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            isDarkMode={isDarkMode}
            disabled={isLoading}
            size={isMobile ? "small" : "medium"}
            margin={isMobile ? "dense" : "normal"}
          />
          
          {/* Campo de senha com indicador de força */}
          <PasswordStrengthIndicator
            value={formData.password}
            onChange={handlePasswordChange}
            isDarkMode={isDarkMode}
            disabled={isLoading}
            size={isMobile ? "small" : "medium"}
            margin={isMobile ? "dense" : "normal"}
            label="Senha"
            showConfirmation={true}
            confirmValue={formData.password2}
            onConfirmChange={handleConfirmPasswordChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          
          {/* Botão de registro melhorado */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              py: isMobile ? 1.5 : 1.8, 
              mb: isMobile ? 1.5 : 2,
              mt: isMobile ? 0.5 : 0,
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: 600,
              borderRadius: 2,
              background: isDarkMode 
                ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' 
                : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(25, 118, 210, 0.3)' 
                : '0 4px 12px rgba(25, 118, 210, 0.25)',
              border: 'none',
              textTransform: 'none',
              letterSpacing: '0.3px',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)' 
                  : 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                boxShadow: isDarkMode 
                  ? '0 6px 16px rgba(25, 118, 210, 0.4)' 
                  : '0 6px 16px rgba(25, 118, 210, 0.3)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: isDarkMode ? 'grey.700' : 'grey.300',
                color: isDarkMode ? 'grey.500' : 'grey.500',
                boxShadow: 'none',
                transform: 'none',
              }
            }}
            disabled={isLoading}
            size={isMobile ? "large" : "large"}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
                Criando...
              </Box>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </Box>

        <Typography variant="body1" align="center" mt={isMobile ? 0.5 : 2}
          sx={{ 
            color: isDarkMode ? 'grey.200' : 'text.primary',
            fontSize: '15px',
            fontWeight: 500
          }}>
          Já tem uma conta?{' '}
          <Link component="button" variant="body1" onClick={() => navigate('/')}
            sx={{ 
              fontSize: '15px',
              fontWeight: 600,
              color: isDarkMode ? 'primary.light' : 'primary.main',
              textDecoration: 'none',
              position: 'relative',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: isDarkMode ? '#64b5f6' : '#1565c0',
                textDecoration: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '0',
                height: '2px',
                bottom: '-2px',
                left: '50%',
                background: isDarkMode ? '#64b5f6' : '#1565c0',
                transition: 'all 0.3s ease',
                transform: 'translateX(-50%)',
              },
              '&:hover::after': {
                width: '100%',
              }
            }}>
            Faça login
          </Link>
        </Typography>
        <Typography variant="body2" align="center" mt={isMobile ? 0.3 : 1}
          sx={{ 
            color: isDarkMode ? 'grey.200' : 'text.primary',
            fontSize: isMobile ? '13px' : '14px'
          }}>
          <Link component="button" variant="body2" onClick={() => navigate('/recovery')}
            sx={{ 
              color: isDarkMode ? 'primary.light' : 'primary.main',
              fontSize: isMobile ? '13px' : '14px',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}>
            Esqueceu sua senha? Recupere-a aqui
          </Link>
        </Typography>

        <Box sx={{ 
          mt: isMobile ? 1.5 : 2, 
          textAlign: 'center',
          mb: 0
        }}>
          <Typography variant="caption" 
            sx={{ 
              color: isDarkMode ? 'grey.400' : 'text.secondary',
              fontSize: isMobile ? '11px' : '12px',
              opacity: 0.8
            }}>
            Para suporte técnico, acesse{' '}
            <Link 
              href="http://api.smartlogger.io" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                color: isDarkMode ? 'primary.light' : 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              nossa documentação
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default Register;
