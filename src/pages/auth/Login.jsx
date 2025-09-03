
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import { useThemeTransitions } from '../../hooks/useThemeTransitions';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/transitions.css';

// Componentes de melhorias
import ValidatedEmailField from '../../components/auth/ValidatedEmailField';
import BiometricAuth from '../../components/auth/BiometricAuth';
import MicroInteractions, { GlobalAnimations } from '../../components/auth/MicroInteractions';
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

import { Visibility, VisibilityOff, Lock, Apartment, DarkMode, LightMode } from '@mui/icons-material';


const Login = () => {
  const { login, error, showLogoutSuccess, clearLogoutSuccess } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMobile, isTablet, screenWidth } = useDevice();
  
  // 🎭 Hook para transições suaves de tema
  const {
    isTransitioning,
    iconRef,
    buttonRef,
    handleThemeChange
  } = useThemeTransitions(toggleTheme, isDarkMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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
    setLoginError(false);
    setFormErrors({});
    
    // Validações básicas
    const errors = {};
    if (!email.trim()) errors.email = 'E-mail é obrigatório';
    if (!password.trim()) errors.password = 'Senha é obrigatória';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoginError(true);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Iniciando processo de login...');
      const success = await login(email, password, rememberMe);
      if (success) {
        setLoginSuccess(true);
        toast.success('Login realizado com sucesso!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: isDarkMode ? "dark" : "light",
        });
        
        // Pequeno delay para mostrar animação de sucesso
        setTimeout(() => {
          console.log('Redirecionando para dashboard...');
          navigate('/dashboard');
        }, 1500);
      } else {
        setLoginError(true);
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
      setLoginError(true);
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
      setTimeout(() => {
        setIsLoading(false);
        setLoginSuccess(false);
      }, loginSuccess ? 1500 : 0);
    }
  };

  const handleBiometricSuccess = (result) => {
    setLoginSuccess(true);
    toast.success('Login biométrico realizado com sucesso!', {
      position: "top-right",
      autoClose: 3000,
      theme: isDarkMode ? "dark" : "light",
    });
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleBiometricError = (error) => {
    toast.error(`Erro na biometria: ${error}`, {
      position: "top-right",
      autoClose: 4000,
      theme: isDarkMode ? "dark" : "light",
    });
  };

  return (
    <>
      {/* Animações CSS globais */}
      <GlobalAnimations />
      
      {/* Animações de feedback */}
      <MicroInteractions.SuccessAnimation 
        show={loginSuccess} 
        message="Login realizado com sucesso!" 
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
      <MicroInteractions.FloatingParticles isDarkMode={isDarkMode} count={15} />
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
          bgcolor: isDarkMode ? 'grey.800' : 'background.paper',
          boxShadow: isDarkMode 
            ? '0 16px 32px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)' 
            : '0 16px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08)',
          position: 'relative',
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
          Bem-vindo de volta!
        </Typography>
        <Typography variant={isMobile ? "body2" : "body1"} mb={isMobile ? 2 : 2.5} textAlign="center"
          sx={{ 
            color: isDarkMode ? 'grey.300' : 'text.secondary',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: 400,
            lineHeight: 1.4,
            opacity: 0.9
          }}>
          Entre com suas credenciais para acessar sua conta
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
          {/* Email com validação em tempo real */}
          <ValidatedEmailField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isDarkMode={isDarkMode}
            disabled={isLoading}
            size={isMobile ? "small" : "medium"}
            margin={isMobile ? "dense" : "normal"}
            autoFocus={!isMobile}
          />

          {/* Senha com animação de shake para erro */}
          <MicroInteractions.ShakeAnimation trigger={loginError && !password}>
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
              error={formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{
                    '& .MuiSvgIcon-root': {
                      color: formErrors.password 
                        ? '#f44336'
                        : isDarkMode ? 'grey.400' : 'action.active',
                      fontSize: isMobile ? '1rem' : '1.25rem',
                      zIndex: 1,
                      position: 'relative',
                      transition: 'color 0.3s ease'
                    }
                  }}>
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{
                    '& .MuiIconButton-root': {
                      color: isDarkMode ? 'grey.400' : 'action.active',
                      zIndex: 1,
                      position: 'relative',
                      bgcolor: 'transparent !important'
                    },
                    '& .MuiSvgIcon-root': {
                      color: isDarkMode ? 'grey.400' : 'action.active',
                      zIndex: 1,
                      position: 'relative'
                    }
                  }}>
                    <IconButton
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                      size={isMobile ? "small" : "medium"}
                      disabled={isLoading}
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
                  transition: 'all 0.3s ease',
                  '&.Mui-error': {
                    '& fieldset': {
                      borderColor: '#f44336',
                      boxShadow: '0 0 0 2px rgba(244, 67, 54, 0.2)',
                    }
                  }
                },
                '& .MuiInputLabel-root': {
                  color: formErrors.password 
                    ? '#f44336'
                    : isDarkMode ? 'grey.300' : 'text.secondary',
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
            />
          </MicroInteractions.ShakeAnimation>

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

          {/* Botão de login simplificado */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              py: isMobile ? 1.5 : 1.8, 
              mb: isMobile ? 1.5 : 2,
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
                Entrando...
              </Box>
            ) : (
              'Entrar'
            )}
          </Button>

          {/* Autenticação Biométrica */}
          <BiometricAuth
            onSuccess={handleBiometricSuccess}
            onError={handleBiometricError}
            isDarkMode={isDarkMode}
            disabled={isLoading}
          />

          <Typography variant="body2" align="center" 
            sx={{ 
              color: isDarkMode ? 'grey.400' : 'text.secondary',
              mb: isMobile ? 1 : 1.5,
              position: 'relative',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                width: '25%',
                height: '1px',
                background: isDarkMode 
                  ? 'rgba(255,255,255,0.15)' 
                  : 'rgba(0,0,0,0.1)',
              },
              '&::before': {
                left: '15%',
              },
              '&::after': {
                right: '15%',
              }
            }}>
            ou
          </Typography>

          <Typography variant="body1" align="center"
            sx={{ 
              color: isDarkMode ? 'grey.200' : 'text.primary',
              fontSize: '15px',
              fontWeight: 500
            }}>
            Ainda não tem uma conta?{' '}
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate('/register')}
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
              }}
            >
              Criar agora
            </Link>
          </Typography>
        </Box>

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
    </>
  );
};

export default Login;
