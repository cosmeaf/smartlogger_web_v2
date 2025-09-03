import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 🎭 Hook para transições suaves de tema - PERFORMANCE OPTIMIZED
 * Gerencia animações e efeitos visuais durante mudanças de tema
 */
export const useThemeTransitions = (toggleTheme, isDarkMode) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const waveRef = useRef(null);
  const iconRef = useRef(null);
  const buttonRef = useRef(null);
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);

  // Detecta se é um dispositivo com baixa performance
  const isLowPerformance = useRef(
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  );

  /**
   * 🌊 Cria efeito de onda otimizado
   */
  const createWaveEffect = useCallback((clickX, clickY) => {
    // Skip wave effect em dispositivos low-performance
    if (isLowPerformance.current) return;

    // Remove onda anterior se existir
    const existingWave = document.querySelector('.theme-wave');
    if (existingWave) {
      existingWave.remove();
    }

    // Usa requestAnimationFrame para melhor performance
    rafRef.current = requestAnimationFrame(() => {
      // Cria container da onda se não existir
      let waveContainer = document.querySelector('.theme-wave-container');
      if (!waveContainer) {
        waveContainer = document.createElement('div');
        waveContainer.className = 'theme-wave-container';
        document.body.appendChild(waveContainer);
      }

      // Cria elemento da onda
      const wave = document.createElement('div');
      wave.className = `theme-wave ${isDarkMode ? 'to-light' : 'to-dark'}`;
      
      // Tamanho otimizado da onda
      const waveSize = Math.min(window.innerWidth, window.innerHeight) * 1.5;

      // Posiciona a onda no local do clique
      wave.style.width = `${waveSize}px`;
      wave.style.height = `${waveSize}px`;
      wave.style.left = `${clickX - waveSize / 2}px`;
      wave.style.top = `${clickY - waveSize / 2}px`;

      waveContainer.appendChild(wave);
      waveRef.current = wave;

      // Inicia animação da onda com delay mínimo
      requestAnimationFrame(() => {
        wave.classList.add('active');
      });

      // Remove onda após animação
      timeoutRef.current = setTimeout(() => {
        if (wave && wave.parentNode) {
          wave.parentNode.removeChild(wave);
        }
        if (waveContainer && waveContainer.children.length === 0) {
          waveContainer.remove();
        }
      }, 400); // Tempo reduzido
    });
  }, [isDarkMode]);

  /**
   * 🎯 Anima ícone do botão de tema - otimizado
   */
  const animateThemeIcon = useCallback(() => {
    if (iconRef.current) {
      iconRef.current.classList.add('rotating');
      
      timeoutRef.current = setTimeout(() => {
        if (iconRef.current) {
          iconRef.current.classList.remove('rotating');
        }
      }, 300); // Tempo reduzido
    }
  }, []);

  /**
   * ✨ Cria efeito ripple no botão - otimizado
   */
  const createRippleEffect = useCallback(() => {
    if (buttonRef.current) {
      buttonRef.current.classList.add('ripple');
      
      timeoutRef.current = setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.classList.remove('ripple');
        }
      }, 200); // Tempo reduzido
    }
  }, []);

  /**
   * 🎪 Adiciona feedback visual no body - simplificado
   */
  const addBodyFeedback = useCallback(() => {
    document.body.classList.add('theme-loading');
    
    timeoutRef.current = setTimeout(() => {
      document.body.classList.remove('theme-loading');
    }, 150); // Tempo muito reduzido
  }, []);

  /**
   * 🚀 Função principal para mudança de tema com animações - OPTIMIZED
   */
  const handleThemeChange = useCallback((event) => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // Obter posição do clique
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    // Usar requestAnimationFrame para melhor sincronização
    rafRef.current = requestAnimationFrame(() => {
      try {
        // 1. Iniciar animações visuais instantaneamente
        createRippleEffect();
        animateThemeIcon();

        // 2. Criar efeito de onda (se não for low-performance)
        createWaveEffect(clickX, clickY);

        // 3. Mudar tema rapidamente
        timeoutRef.current = setTimeout(() => {
          toggleTheme();
        }, 80); // Muito mais rápido

        // 4. Finalizar transição
        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 300); // Tempo total reduzido

      } catch (error) {
        console.error('Erro na transição de tema:', error);
        setIsTransitioning(false);
        toggleTheme(); // Fallback sem animação
      }
    });
  }, [isTransitioning, toggleTheme, createWaveEffect, createRippleEffect, animateThemeIcon]);

  /**
   * 🧹 Cleanup function - melhorada
   */
  const cleanup = useCallback(() => {
    // Cancela animações pendentes
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Remove qualquer onda ativa
    const waves = document.querySelectorAll('.theme-wave');
    waves.forEach(wave => wave.remove());

    // Remove container se vazio
    const container = document.querySelector('.theme-wave-container');
    if (container && container.children.length === 0) {
      container.remove();
    }

    // Remove classes do body
    document.body.classList.remove('theme-loading');
    
    setIsTransitioning(false);
  }, []);

  // Cleanup automático ao desmontar
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Estados
    isTransitioning,
    
    // Refs para animações
    waveRef,
    iconRef,
    buttonRef,
    
    // Função principal
    handleThemeChange,
    
    // Funções individuais (caso precise usar separadamente)
    createWaveEffect,
    animateThemeIcon,
    createRippleEffect,
    addBodyFeedback,
    
    // Cleanup
    cleanup,
    
    // Info de performance
    isLowPerformance: isLowPerformance.current
  };
};
