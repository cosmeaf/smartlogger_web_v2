import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  LinearProgress, 
  Typography, 
  Fade,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import { 
  Lock,
  Visibility, 
  VisibilityOff,
  CheckCircle,
  Error,
  Security
} from '@mui/icons-material';
import MicroInteractions from './MicroInteractions';

/**
 * 💪 Campo de senha com indicador de força em tempo real
 */
const PasswordStrengthIndicator = ({
  value,
  onChange,
  isDarkMode,
  disabled = false,
  label = "Senha",
  size = "medium",
  margin = "normal",
  showConfirmation = false,
  confirmValue = "",
  onConfirmChange = () => {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [confirmError, setConfirmError] = useState('');

  // Calcular força da senha
  useEffect(() => {
    if (!value) {
      setStrength(0);
      setFeedback([]);
      return;
    }

    const checks = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      numbers: /\d/.test(value),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
    };

    const score = Object.values(checks).filter(Boolean).length;
    setStrength(score);

    // Feedback personalizado
    const suggestions = [];
    if (!checks.length) suggestions.push("Pelo menos 8 caracteres");
    if (!checks.uppercase) suggestions.push("Uma letra maiúscula");
    if (!checks.lowercase) suggestions.push("Uma letra minúscula");
    if (!checks.numbers) suggestions.push("Um número");
    if (!checks.symbols) suggestions.push("Um símbolo especial");

    setFeedback(suggestions);
  }, [value]);

  // Validar confirmação de senha
  useEffect(() => {
    if (showConfirmation && confirmValue) {
      if (value !== confirmValue) {
        setConfirmError('As senhas não coincidem');
      } else {
        setConfirmError('');
      }
    }
  }, [value, confirmValue, showConfirmation]);

  const getStrengthColor = () => {
    const colors = ['#f44336', '#ff9800', '#ffc107', '#8bc34a', '#4caf50'];
    return colors[strength] || colors[0];
  };

  const getStrengthLabel = () => {
    const labels = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Forte'];
    return labels[strength] || labels[0];
  };

  const getStrengthPercentage = () => {
    return (strength / 5) * 100;
  };

  return (
    <Box>
      {/* Campo de senha principal */}
      <TextField
        margin={margin}
        required
        fullWidth
        name="password"
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        size={size}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ 
                color: strength >= 3 
                  ? '#4caf50' 
                  : strength >= 1 
                    ? '#ff9800' 
                    : isDarkMode ? 'grey.400' : 'action.active',
                fontSize: size === 'small' ? '1rem' : '1.25rem',
                transition: 'color 0.3s ease'
              }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
                size={size === 'small' ? 'small' : 'medium'}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
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
              boxShadow: strength >= 3 
                ? '0 0 0 2px rgba(76, 175, 80, 0.2)'
                : strength >= 1 
                  ? '0 0 0 2px rgba(255, 152, 0, 0.2)'
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

      {/* Indicador de força */}
      {value && (
        <Fade in={!!value}>
          <Box sx={{ mt: 1, px: 1 }}>
            {/* Barra de progresso */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={getStrengthPercentage()}
                sx={{
                  flexGrow: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? 'grey.700' : 'grey.300',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getStrengthColor(),
                    borderRadius: 3,
                    transition: 'all 0.3s ease'
                  }
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: getStrengthColor(),
                  fontWeight: 600,
                  minWidth: 60,
                  textAlign: 'right'
                }}
              >
                {getStrengthLabel()}
              </Typography>
            </Box>

            {/* Sugestões de melhoria */}
            {feedback.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {feedback.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: 24,
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '& .MuiChip-label': {
                        px: 1
                      }
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Indicadores visuais de critérios */}
            {strength > 0 && (
              <Box sx={{ 
                display: 'flex', 
                gap: 0.5, 
                mt: 1, 
                justifyContent: 'center'
              }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Box
                    key={level}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: strength >= level 
                        ? getStrengthColor() 
                        : isDarkMode ? 'grey.600' : 'grey.300',
                      transition: 'all 0.3s ease',
                      transform: strength >= level ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {/* Campo de confirmação de senha */}
      {showConfirmation && (
        <MicroInteractions.ShakeAnimation trigger={!!confirmError}>
          <TextField
            margin={margin}
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Senha"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmValue}
            onChange={onConfirmChange}
            disabled={disabled}
            size={size}
            error={!!confirmError}
            helperText={confirmError || (value && confirmValue && !confirmError ? 'Senhas coincidem!' : '')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {value && confirmValue && !confirmError ? (
                    <CheckCircle sx={{ color: '#4caf50', fontSize: size === 'small' ? '1rem' : '1.25rem' }} />
                  ) : confirmError ? (
                    <Error sx={{ color: '#f44336', fontSize: size === 'small' ? '1rem' : '1.25rem' }} />
                  ) : (
                    <Security sx={{ color: isDarkMode ? 'grey.400' : 'action.active', fontSize: size === 'small' ? '1rem' : '1.25rem' }} />
                  )}
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={disabled}
                    size={size === 'small' ? 'small' : 'medium'}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              style: {
                fontSize: size === 'small' ? '16px' : '14px'
              }
            }}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: isDarkMode ? 'grey.700' : 'background.paper',
                transition: 'all 0.3s ease',
                '&.Mui-error': {
                  '& fieldset': {
                    borderColor: '#f44336',
                    boxShadow: '0 0 0 2px rgba(244, 67, 54, 0.2)',
                  }
                },
                '&.Mui-focused:not(.Mui-error)': {
                  '& fieldset': {
                    borderColor: value && confirmValue && !confirmError ? '#4caf50' : undefined,
                    boxShadow: value && confirmValue && !confirmError ? '0 0 0 2px rgba(76, 175, 80, 0.2)' : undefined,
                  }
                }
              },
              '& .MuiInputLabel-root': {
                color: confirmError 
                  ? '#f44336'
                  : value && confirmValue && !confirmError 
                    ? '#4caf50'
                    : isDarkMode ? 'grey.300' : 'text.secondary',
              },
              '& .MuiFormHelperText-root': {
                color: confirmError 
                  ? '#f44336'
                  : value && confirmValue && !confirmError 
                    ? '#4caf50'
                    : isDarkMode ? 'grey.400' : 'text.secondary',
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
          />
        </MicroInteractions.ShakeAnimation>
      )}
    </Box>
  );
};

export default PasswordStrengthIndicator;
