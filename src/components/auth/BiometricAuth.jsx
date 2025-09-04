import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
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
  const { loginWithBiometric, getBiometricCredentials } = useContext(AuthContext);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar suporte à biometria
  useEffect(() => {
    checkBiometricSupport();
    checkSavedCredentials();
  }, []);

  const checkSavedCredentials = () => {
    const credentials = getBiometricCredentials();
    setHasCredentials(!!credentials);
  };

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

      // Verificar se já há WebAuthn registrado
      const savedWebAuthn = localStorage.getItem('biometric_webauthn');
      setIsEnrolled(!!savedWebAuthn);

    } catch (err) {
      console.log('Biometric not supported:', err);
    }
  };

  const enrollBiometric = async () => {
    setLoading(true);
    setError('');

    try {
      // Verificar se há credenciais salvas primeiro
      const credentials = getBiometricCredentials();
      if (!credentials) {
        setError('Faça login primeiro para configurar a biometria');
        setLoading(false);
        return;
      }

      // Gerar challenge aleatório
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Gerar user ID baseado no email do usuário
      const userEmail = credentials.email;
      const encoder = new TextEncoder();
      const userIdArray = encoder.encode(userEmail);
      const userId = new Uint8Array(32);
      userId.set(userIdArray.slice(0, Math.min(userIdArray.length, 32)));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "SmartLogger",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: userEmail,
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
        // Salvar credencial biométrica localmente
        const credentialData = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          type: credential.type,
          userEmail: userEmail,
          enrolled: Date.now()
        };

        localStorage.setItem('biometric_webauthn', JSON.stringify(credentialData));
        setIsEnrolled(true);
        
        // Sucesso no enrollment
        setError('');
        console.log('Biometria configurada com sucesso para:', userEmail);
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
      // Verificar se há credenciais de login salvas
      const credentials = getBiometricCredentials();
      if (!credentials) {
        throw new Error('Nenhuma credencial de login encontrada. Faça login primeiro.');
      }

      // Verificar se há credencial biométrica registrada
      const savedWebAuthn = localStorage.getItem('biometric_webauthn');
      if (!savedWebAuthn) {
        throw new Error('Biometria não configurada');
      }

      const credData = JSON.parse(savedWebAuthn);
      
      // Gerar challenge aleatório
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Tentar autenticação biométrica primeiro
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
        // Biometria validada, agora fazer login real
        console.log('Biometria validada, fazendo login...');
        const loginSuccess = await loginWithBiometric();
        
        if (loginSuccess) {
          onSuccess && onSuccess({
            type: 'biometric',
            credential: assertion,
            email: credentials.email,
            timestamp: Date.now()
          });
        } else {
          throw new Error('Falha no login após validação biométrica');
        }
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

  if (!isSupported || !hasCredentials) {
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
