import React, { useState, useEffect } from 'react';
import { Box, Fade, Grow, Slide } from '@mui/material';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';

/**
 * ✨ Componente para microinterações e feedback visual
 */
export const ShakeAnimation = ({ trigger, children }) => {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <Box
      sx={{
        animation: shake ? 'shake 0.5s ease-in-out' : 'none',
        '@keyframes shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-8px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(8px)' }
        }
      }}
    >
      {children}
    </Box>
  );
};

export const PulseAnimation = ({ trigger, children, color = '#1976d2' }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (trigger) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <Box
      sx={{
        animation: pulse ? 'pulse 1s ease-in-out' : 'none',
        '@keyframes pulse': {
          '0%': { 
            transform: 'scale(1)',
            boxShadow: `0 0 0 0 ${color}40`
          },
          '50%': { 
            transform: 'scale(1.02)',
            boxShadow: `0 0 0 8px ${color}20`
          },
          '100%': { 
            transform: 'scale(1)',
            boxShadow: `0 0 0 0 ${color}00`
          }
        }
      }}
    >
      {children}
    </Box>
  );
};

export const SuccessAnimation = ({ show, message }) => {
  return (
    <Grow in={show} timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          bgcolor: 'rgba(76, 175, 80, 0.95)',
          color: 'white',
          px: 3,
          py: 2,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
          animation: 'successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
      >
        <CheckCircle sx={{ fontSize: 24 }} />
        <Box sx={{ fontWeight: 600 }}>{message}</Box>
      </Box>
    </Grow>
  );
};

export const ErrorAnimation = ({ show, message }) => {
  return (
    <Slide direction="down" in={show} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          bgcolor: 'rgba(244, 67, 54, 0.95)',
          color: 'white',
          px: 3,
          py: 2,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
          animation: 'errorWobble 0.5s ease-in-out'
        }}
      >
        <Error sx={{ fontSize: 24 }} />
        <Box sx={{ fontWeight: 600 }}>{message}</Box>
      </Box>
    </Slide>
  );
};

export const LoadingDots = ({ isDarkMode }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        '& .dot': {
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isDarkMode ? '#90caf9' : '#1976d2',
          animation: 'loadingDots 1.4s ease-in-out infinite both',
        },
        '& .dot:nth-of-type(1)': { animationDelay: '-0.32s' },
        '& .dot:nth-of-type(2)': { animationDelay: '-0.16s' },
        '@keyframes loadingDots': {
          '0%, 80%, 100%': {
            transform: 'scale(0.8)',
            opacity: 0.5
          },
          '40%': {
            transform: 'scale(1)',
            opacity: 1
          }
        }
      }}
    >
      <Box className="dot" />
      <Box className="dot" />
      <Box className="dot" />
    </Box>
  );
};

export const FloatingParticles = ({ isDarkMode, count = 20 }) => {
  const particles = Array.from({ length: count }, (_, i) => i);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {particles.map((i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            borderRadius: '50%',
            backgroundColor: isDarkMode 
              ? `rgba(144, 202, 249, ${Math.random() * 0.3 + 0.1})`
              : `rgba(25, 118, 210, ${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            '@keyframes floatParticle': {
              '0%': {
                transform: 'translateY(100vh) translateX(0)',
                opacity: 0
              },
              '10%': {
                opacity: 1
              },
              '90%': {
                opacity: 1
              },
              '100%': {
                transform: `translateY(-100px) translateX(${Math.random() * 200 - 100}px)`,
                opacity: 0
              }
            }
          }}
        />
      ))}
    </Box>
  );
};

// Componente principal que engloba todas as animações
const MicroInteractions = {
  ShakeAnimation,
  PulseAnimation,
  SuccessAnimation,
  ErrorAnimation,
  LoadingDots,
  FloatingParticles
};

// CSS Global para animações
export const GlobalAnimations = () => (
  <style>{`
    @keyframes successPop {
      0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    @keyframes errorWobble {
      0%, 100% { transform: translateX(-50%) rotate(0deg); }
      25% { transform: translateX(-50%) rotate(-2deg); }
      75% { transform: translateX(-50%) rotate(2deg); }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .fade-in-up {
      animation: fadeInUp 0.6s ease-out;
    }

    /* Smooth focus transitions */
    input:focus,
    button:focus {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  `}</style>
);

export default MicroInteractions;
