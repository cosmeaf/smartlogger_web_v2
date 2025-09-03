import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, Fade, Zoom } from '@mui/material';
import { 
  Email, 
  CheckCircle, 
  Error as ErrorIcon,
  Info
} from '@mui/icons-material';

/**
 * 🎯 Campo de email com validação em tempo real
 */
const ValidatedEmailField = ({ 
  value, 
  onChange, 
  isDarkMode, 
  disabled = false,
  size = "medium",
  margin = "normal",
  autoFocus = false,
  ...props 
}) => {
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  // Validação em tempo real
  useEffect(() => {
    if (!value || !touched) {
      setError('');
      setIsValid(false);
      setSuggestion('');
      return;
    }

    // Validação básica de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(value);

    if (!isValidFormat) {
      setError('Formato de e-mail inválido');
      setIsValid(false);
      
      // Sugestões inteligentes
      if (value.includes('@') && !value.includes('.')) {
        setSuggestion('Que tal adicionar ".com" no final?');
      } else if (!value.includes('@')) {
        setSuggestion('Não esqueça do @');
      } else {
        setSuggestion('');
      }
      return;
    }

    // Validações adicionais
    const domain = value.split('@')[1];
    const localPart = value.split('@')[0];

    if (localPart.length < 2) {
      setError('Nome muito curto antes do @');
      setIsValid(false);
      return;
    }

    if (domain && domain.length < 4) {
      setError('Domínio muito curto');
      setIsValid(false);
      return;
    }

    // Domínios comuns para sugestões
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const similarDomain = commonDomains.find(d => 
      domain && d.includes(domain.split('.')[0])
    );

    if (similarDomain && domain !== similarDomain) {
      setSuggestion(`Você quis dizer ${localPart}@${similarDomain}?`);
    } else {
      setSuggestion('');
    }

    setError('');
    setIsValid(true);
  }, [value, touched]);

  const handleChange = (e) => {
    onChange(e);
    if (!touched) setTouched(true);
  };

  const handleBlur = () => {
    if (!touched) setTouched(true);
  };

  const getHelperText = () => {
    if (error) return error;
    if (suggestion) return suggestion;
    return '';
  };

  const getHelperIcon = () => {
    if (error) return <ErrorIcon sx={{ fontSize: 16, color: '#f44336' }} />;
    if (suggestion) return <Info sx={{ fontSize: 16, color: '#ff9800' }} />;
    if (isValid) return <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />;
    return null;
  };

  return (
    <Box>
      <TextField
        margin={margin}
        required
        fullWidth
        id="email"
        label="E-mail"
        autoComplete="email"
        autoFocus={autoFocus}
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        size={size}
        error={!!error}
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              <Email sx={{ 
                color: isValid 
                  ? '#4caf50' 
                  : error 
                    ? '#f44336' 
                    : isDarkMode ? 'grey.400' : 'action.active',
                fontSize: size === 'small' ? '1rem' : '1.25rem',
                transition: 'color 0.3s ease'
              }} />
            </Box>
          ),
          endAdornment: touched && (
            <Zoom in={touched}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getHelperIcon()}
              </Box>
            </Zoom>
          ),
          style: {
            fontSize: size === 'small' ? '16px' : '14px'
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: isDarkMode ? 'grey.700' : 'background.paper',
            transition: 'all 0.3s ease',
            '&.Mui-focused': {
              boxShadow: isValid 
                ? '0 0 0 2px rgba(76, 175, 80, 0.2)'
                : error 
                  ? '0 0 0 2px rgba(244, 67, 54, 0.2)'
                  : '0 0 0 2px rgba(25, 118, 210, 0.2)',
            }
          },
          '& .MuiInputLabel-root': {
            color: isDarkMode ? 'grey.300' : 'text.secondary',
          },
          '& .MuiInputBase-input': {
            color: isDarkMode ? 'grey.100' : 'text.primary',
            '&:-webkit-autofill': {
              WebkitBoxShadow: isDarkMode 
                ? '0 0 0 1000px #616161 inset !important' 
                : '0 0 0 1000px #fff inset !important',
              WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
              transition: 'background-color 5000s ease-in-out 0s !important',
              borderRadius: 'inherit !important',
            },
            '&:-webkit-autofill:hover': {
              WebkitBoxShadow: isDarkMode 
                ? '0 0 0 1000px #616161 inset !important' 
                : '0 0 0 1000px #fff inset !important',
              WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
            },
            '&:-webkit-autofill:focus': {
              WebkitBoxShadow: isDarkMode 
                ? '0 0 0 1000px #616161 inset !important' 
                : '0 0 0 1000px #fff inset !important',
              WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
            },
            '&:-webkit-autofill:active': {
              WebkitBoxShadow: isDarkMode 
                ? '0 0 0 1000px #616161 inset !important' 
                : '0 0 0 1000px #fff inset !important',
              WebkitTextFillColor: isDarkMode ? '#f5f5f5 !important' : '#000 !important',
            }
          }
        }}
        {...props}
      />

      {/* Helper text com animação */}
      {(error || suggestion) && (
        <Fade in={!!(error || suggestion)}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            mt: 0.5,
            ml: 1.5
          }}>
            {getHelperIcon()}
            <Typography 
              variant="caption" 
              sx={{ 
                color: error 
                  ? '#f44336' 
                  : suggestion 
                    ? '#ff9800' 
                    : '#4caf50',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              {getHelperText()}
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default ValidatedEmailField;
