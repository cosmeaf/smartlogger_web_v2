import React, { useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Button, 
  Typography, 
  Fade,
  Alert 
} from '@mui/material';
import { 
  Fingerprint, 
  FaceRetouchingNatural,
  Security,
  CheckCircle,
  Warning
} from '@mui/icons-material';

/**
 * 🔐 Componente de autenticação biométrica para PWA
 */
const BiometricAuth = ({ 
  onSuccess, 
  onError, 
  isDarkMode,
  disabled = false 
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar suporte à biometria
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Verificar se WebAuthn está disponível
      if (!window.PublicKeyCredential) {
        return;
      }

      // Verificar se há autenticador disponível
      const available = await PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable();
      
      setIsSupported(available);

      // Verificar se já há credenciais salvas
      const savedCredentials = localStorage.getItem('biometric_enrolled');
      setIsEnrolled(!!savedCredentials);

    } catch (err) {
      console.log('Biometric not supported:', err);
    }
  };

  const enrollBiometric = async () => {
    setLoading(true);
    setError('');

    try {
      // Gerar challenge aleatório
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Gerar user ID aleatório
      const userId = new Uint8Array(32);
      crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "SmartLogger",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: "user@smartlogger.com",
            displayName: "SmartLogger User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: "direct"
        }
      });

      if (credential) {
        // Salvar credencial localmente (em produção, salvar no servidor)
        const credentialData = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          type: credential.type,
          enrolled: Date.now()
        };

        localStorage.setItem('biometric_enrolled', JSON.stringify(credentialData));
        setIsEnrolled(true);
        
        // Executar login automaticamente após enrollment
        authenticateWithBiometric();
      }

    } catch (err) {
      console.error('Enrollment error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithBiometric = async () => {
    setLoading(true);
    setError('');

    try {
      const savedCredentials = localStorage.getItem('biometric_enrolled');
      if (!savedCredentials) {
        throw new Error('No credentials found');
      }

      const credData = JSON.parse(savedCredentials);
      
      // Gerar challenge aleatório
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          allowCredentials: [{
            id: new Uint8Array(credData.rawId),
            type: "public-key"
          }],
          userVerification: "required",
          timeout: 60000
        }
      });

      if (assertion) {
        // Sucesso na autenticação
        onSuccess && onSuccess({
          type: 'biometric',
          credential: assertion,
          timestamp: Date.now()
        });
      }

    } catch (err) {
      console.error('Authentication error:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      onError && onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (err) => {
    if (err.name === 'NotAllowedError') {
      return 'Acesso negado pelo usuário';
    }
    if (err.name === 'AbortError') {
      return 'Operação cancelada';
    }
    if (err.name === 'NotSupportedError') {
      return 'Biometria não suportada';
    }
    if (err.name === 'InvalidStateError') {
      return 'Credencial já registrada';
    }
    return 'Erro na autenticação biométrica';
  };

  const getBiometricIcon = () => {
    // Detectar tipo de dispositivo para mostrar ícone apropriado
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      return <FaceRetouchingNatural sx={{ fontSize: 24 }} />;
    }
    if (isAndroid) {
      return <Fingerprint sx={{ fontSize: 24 }} />;
    }
    return <Security sx={{ fontSize: 24 }} />;
  };

  const getBiometricLabel = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) return 'Face ID / Touch ID';
    return 'Biometria';
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      {/* Botão principal de biometria */}
      <Button
        variant="outlined"
        fullWidth
        disabled={disabled || loading}
        onClick={isEnrolled ? authenticateWithBiometric : enrollBiometric}
        sx={{
          py: 1.5,
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: isDarkMode ? 'primary.light' : 'primary.main',
          color: isDarkMode ? 'primary.light' : 'primary.main',
          backgroundColor: 'transparent',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderStyle: 'solid',
            backgroundColor: isDarkMode 
              ? 'rgba(144, 202, 249, 0.08)' 
              : 'rgba(25, 118, 210, 0.04)',
            transform: 'translateY(-1px)',
          },
          '&:disabled': {
            opacity: 0.5,
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.3s ease'
        }}>
          {loading ? (
            <Box sx={{ 
              animation: 'pulse 1.5s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center'
            }}>
              {getBiometricIcon()}
            </Box>
          ) : isEnrolled ? (
            <>
              {getBiometricIcon()}
              <Typography variant="body2" fontWeight={600}>
                Entrar com {getBiometricLabel()}
              </Typography>
            </>
          ) : (
            <>
              {getBiometricIcon()}
              <Typography variant="body2" fontWeight={600}>
                Configurar {getBiometricLabel()}
              </Typography>
            </>
          )}
        </Box>
      </Button>

      {/* Indicador de status */}
      {isEnrolled && (
        <Fade in={isEnrolled}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5, 
            mt: 1,
            justifyContent: 'center'
          }}>
            <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#4caf50',
                fontWeight: 500
              }}
            >
              Biometria configurada
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Erro */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            sx={{ mt: 1, fontSize: '0.875rem' }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Animações CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </Box>
  );
};

export default BiometricAuth;
