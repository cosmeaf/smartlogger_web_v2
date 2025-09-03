import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import { useThemeTransitions } from '../../hooks/useThemeTransitions';
import { recoveryService } from '../../services/authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/transitions.css';

// Componentes de melhorias
import ValidatedEmailField from '../../components/auth/ValidatedEmailField';
import MicroInteractions, { GlobalAnimations } from '../../components/auth/MicroInteractions';
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
import { Email, Apartment, DarkMode, LightMode } from '@mui/icons-material';

const Recovery = () => {
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
  const [isLoading, setIsLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError('');

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Por favor, insira um e-mail válido');
      setIsLoading(false);
      return;
    }

    try {
      await recoveryService(email);
      setRecoverySuccess(true);
      toast.success('E-mail de recuperação enviado com sucesso!');
      setIsLoading(false);
      
      // Pequeno delay para mostrar animação de sucesso
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setIsLoading(false);
      toast.error('Erro ao enviar o e-mail de recuperação.');
    }
  };

  return (
    <>
      {/* Animações CSS globais */}
      <GlobalAnimations />
      
      {/* Animações de feedback */}
      <MicroInteractions.SuccessAnimation 
        show={recoverySuccess} 
        message="E-mail de recuperação enviado!" 
      />
      
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
      {/* Partículas flutuantes */}
      <MicroInteractions.FloatingParticles isDarkMode={isDarkMode} count={8} />
      
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            mb: isMobile ? 2 : 3,
            mt: isMobile ? 1 : 0
          }}
        >
          <Box
            sx={{
              background: isDarkMode ? 'rgba(255,255,255,0.85)' : 'transparent',
              borderRadius: 2,
              px: isMobile ? 1.5 : 2.5,
              py: isMobile ? 0.5 : 1,
              display: 'inline-block',
              transition: 'background 0.3s'
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
            mb: isMobile ? 0.5 : 1,
            fontSize: isMobile ? '1.4rem' : undefined
          }}
        >
          Recuperação de Senha
        </Typography>
        <Typography variant={isMobile ? "body2" : "body1"} mb={isMobile ? 2 : 3} align="center"
          sx={{ color: isDarkMode ? 'grey.300' : 'text.secondary' }}>
          Informe seu e-mail para receber o link de recuperação
        </Typography>

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
            error={!!emailError}
            helperText={emailError}
          />

          {/* Botão de envio padrão do Material-UI */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              py: isMobile ? 1.2 : 1.5, 
              mb: isMobile ? 1.5 : 2,
              mt: isMobile ? 1 : 1.5,
              fontSize: isMobile ? '15px' : '14px'
            }}
            size={isMobile ? "medium" : "medium"}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </Button>
        </Box>

        <Typography variant="body2" align="center" mt={isMobile ? 1 : 2}
          sx={{ color: isDarkMode ? 'grey.200' : 'text.primary' }}>
          Não tem uma conta?{' '}
          <Link component="button" variant="body2" onClick={() => navigate('/register')}
            sx={{ 
              color: isDarkMode ? 'primary.light' : 'primary.main',
              fontSize: '13px'
            }}>
            Registre-se
          </Link>
        </Typography>
        <Typography variant="body2" align="center" mt={isMobile ? 0.5 : 1}
          sx={{ color: isDarkMode ? 'grey.200' : 'text.primary' }}>
          <Link component="button" variant="body2" onClick={() => navigate('/')}
            sx={{ 
              color: isDarkMode ? 'primary.light' : 'primary.main',
              fontSize: '13px'
            }}>
            Voltar para Login
          </Link>
        </Typography>

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
    </Box>
    </>
  );
};

export default Recovery;
