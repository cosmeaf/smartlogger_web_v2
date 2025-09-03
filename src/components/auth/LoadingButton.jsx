import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CheckCircle, Send } from '@mui/icons-material';

/**
 * 🔄 Botão com estados de loading melhorados
 */
const LoadingButton = ({ 
  isLoading, 
  success, 
  children, 
  successMessage = "Sucesso!", 
  loadingMessage = "Carregando...",
  isDarkMode,
  ...props 
}) => {
  const getButtonContent = () => {
    if (success) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          animation: 'successPulse 0.5s ease'
        }}>
          <CheckCircle sx={{ fontSize: 20 }} />
          <span>{successMessage}</span>
        </Box>
      );
    }

    if (isLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5
        }}>
          <CircularProgress 
            size={18} 
            thickness={4}
            sx={{ 
              color: 'inherit',
              animation: 'spin 1s linear infinite'
            }}
          />
          <span>{loadingMessage}</span>
        </Box>
      );
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        transition: 'all 0.2s ease'
      }}>
        <Send sx={{ 
          fontSize: 18,
          transition: 'transform 0.2s ease',
          transform: isLoading ? 'translateX(5px)' : 'translateX(0)'
        }} />
        <span>{children}</span>
      </Box>
    );
  };

  return (
    <>
      <Box 
        component="button"
        type="submit"
        disabled={isLoading || success}
        sx={{
          width: '100%',
          py: 1.5,
          px: 3,
          border: 'none',
          borderRadius: 2,
          cursor: isLoading || success ? 'not-allowed' : 'pointer',
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: 'inherit',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          
          // Estados visuais
          backgroundColor: success 
            ? '#4caf50' 
            : isLoading 
              ? (isDarkMode ? '#424242' : '#e0e0e0')
              : (isDarkMode ? '#1976d2' : '#1976d2'),
          
          color: success || !isLoading ? '#ffffff' : (isDarkMode ? '#bdbdbd' : '#757575'),
          
          boxShadow: success
            ? '0 8px 24px rgba(76, 175, 80, 0.3)'
            : isLoading 
              ? 'none'
              : '0 8px 24px rgba(25, 118, 210, 0.3)',

          // Hover effect
          '&:hover:not(:disabled)': {
            transform: 'translateY(-2px)',
            boxShadow: success
              ? '0 12px 32px rgba(76, 175, 80, 0.4)'
              : '0 12px 32px rgba(25, 118, 210, 0.4)',
          },

          // Active effect
          '&:active:not(:disabled)': {
            transform: 'translateY(0)',
          },

          // Ripple effect
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '0',
            height: '0',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.3s ease, height 0.3s ease',
          },

          '&:active::before': {
            width: '100px',
            height: '100px',
          }
        }}
        {...props}
      >
        {getButtonContent()}
      </Box>

      {/* Animações CSS */}
      <style>{`
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default LoadingButton;
