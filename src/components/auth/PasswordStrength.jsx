import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Warning,
  Security
} from '@mui/icons-material';

/**
 * 💪 Componente para mostrar a força da senha
 */
const PasswordStrength = ({ password, isDarkMode }) => {
  const getStrengthData = (pass) => {
    let score = 0;
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      numbers: /[0-9]/.test(pass),
      symbols: /[^A-Za-z0-9]/.test(pass)
    };

    // Calcular score
    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    // Configurações baseadas no score
    const configs = [
      { 
        label: 'Muito fraca', 
        color: '#f44336', 
        icon: <Cancel sx={{ fontSize: 16 }} />,
        bgColor: 'rgba(244, 67, 54, 0.1)' 
      },
      { 
        label: 'Fraca', 
        color: '#ff5722', 
        icon: <Warning sx={{ fontSize: 16 }} />,
        bgColor: 'rgba(255, 87, 34, 0.1)' 
      },
      { 
        label: 'Regular', 
        color: '#ff9800', 
        icon: <Warning sx={{ fontSize: 16 }} />,
        bgColor: 'rgba(255, 152, 0, 0.1)' 
      },
      { 
        label: 'Boa', 
        color: '#4caf50', 
        icon: <Security sx={{ fontSize: 16 }} />,
        bgColor: 'rgba(76, 175, 80, 0.1)' 
      },
      { 
        label: 'Forte', 
        color: '#2e7d32', 
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
        bgColor: 'rgba(46, 125, 50, 0.1)' 
      }
    ];

    return {
      score,
      checks,
      config: configs[score] || configs[0],
      percentage: (score / 5) * 100
    };
  };

  if (!password) return null;

  const { score, checks, config, percentage } = getStrengthData(password);

  const requirements = [
    { key: 'length', label: 'Pelo menos 8 caracteres', check: checks.length },
    { key: 'uppercase', label: 'Uma letra maiúscula', check: checks.uppercase },
    { key: 'lowercase', label: 'Uma letra minúscula', check: checks.lowercase },
    { key: 'numbers', label: 'Um número', check: checks.numbers },
    { key: 'symbols', label: 'Um símbolo (!@#$%)', check: checks.symbols }
  ];

  return (
    <Box sx={{ mt: 1.5, mb: 1 }}>
      {/* Barra de força */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 0.5 
        }}>
          {config.icon}
          <Typography 
            variant="body2" 
            sx={{ 
              color: config.color,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            Força da senha: {config.label}
          </Typography>
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{ 
            height: 6,
            borderRadius: 3,
            backgroundColor: isDarkMode ? 'grey.700' : 'grey.300',
            '& .MuiLinearProgress-bar': {
              backgroundColor: config.color,
              borderRadius: 3,
              transition: 'all 0.3s ease'
            }
          }}
        />
      </Box>

      {/* Requisitos da senha */}
      <Box sx={{ 
        bgcolor: config.bgColor,
        border: `1px solid ${config.color}30`,
        borderRadius: 2,
        p: 1.5,
        mt: 1
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: isDarkMode ? 'grey.300' : 'grey.600',
            fontWeight: 600,
            mb: 1,
            display: 'block'
          }}
        >
          Requisitos da senha:
        </Typography>
        
        {requirements.map((req) => (
          <Box 
            key={req.key}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              mb: 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            {req.check ? (
              <CheckCircle sx={{ 
                fontSize: 14, 
                color: '#4caf50',
                animation: req.check ? 'checkPulse 0.3s ease' : 'none'
              }} />
            ) : (
              <Cancel sx={{ 
                fontSize: 14, 
                color: isDarkMode ? 'grey.500' : 'grey.400'
              }} />
            )}
            <Typography 
              variant="caption" 
              sx={{ 
                color: req.check 
                  ? '#4caf50' 
                  : isDarkMode ? 'grey.400' : 'grey.500',
                fontSize: '0.75rem',
                textDecoration: req.check ? 'line-through' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {req.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Animação CSS */}
      <style>{`
        @keyframes checkPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Box>
  );
};

export default PasswordStrength;
