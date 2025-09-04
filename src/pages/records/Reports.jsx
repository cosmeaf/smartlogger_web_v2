import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { FaChartBar, FaChartLine, FaFilter, FaTable, FaCalendarAlt, FaFileAlt, FaSpinner, FaMapMarkerAlt, FaPlay, FaPause, FaRedo, FaInfoCircle } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useDevice } from '../../context/DeviceContext';
import databaseService from '../../services/databaseService';
import LoadPage from '../../components/LoadPage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Brush, ReferenceArea } from 'recharts';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Reports = () => {
  const { isDarkMode } = useTheme();
  const { isMobile, isTablet, isDesktop, getGridCols, getResponsiveClasses } = useDevice();
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [selectedDeviceData, setSelectedDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(false);
  
  // Novos estados para seleção de período
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);

  // Estados para zoom do gráfico
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [left, setLeft] = useState('dataMin');
  const [right, setRight] = useState('dataMax');
  const [top, setTop] = useState('dataMax+1');
  const [bottom, setBottom] = useState('dataMin-1');
  const [animation, setAnimation] = useState(true);

  // Estados para o mapa de calor (MapLibre)
  const [map, setMap] = useState(null);
  const [heatmapSource, setHeatmapSource] = useState(null);
  const [validHeatmapPoints, setValidHeatmapPoints] = useState([]);
  const [heatmapIntensity, setHeatmapIntensity] = useState('high'); // Sempre alto
  const [mapStyle, setMapStyle] = useState('satellite'); // Começar com satélite
  const mapContainer = useRef(null);

  // Estados para o mapa de rotas
  const [mapRef, setMapRef] = useState(null);
  const [routeMarker, setRouteMarker] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [playInterval, setPlayInterval] = useState(null);

  // Sistema de controle de logs para evitar spam
  const logThrottleRef = useRef({
    horimeter: { lastLog: 0, lastData: null },
    impact: { lastLog: 0, lastData: null },
    heatmap: { lastLog: 0, count: 0 }
  });

  // Buscar dispositivos ao carregar o componente
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const devicesData = await databaseService.getTcDevices();
        // Ordenar dispositivos por nome em ordem alfabética
        const sortedDevices = devicesData.sort((a, b) => a.name.localeCompare(b.name));
        setDevices(sortedDevices);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dispositivos:', err);
        setError('Erro ao carregar dispositivos');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Lidar com a seleção de dispositivo
  const handleDeviceSelect = (event) => {
    const selectedName = event.target.value;
    setSelectedDevice(selectedName);
    
    // Encontrar o dispositivo selecionado
    const device = devices.find(device => device.name === selectedName);
    if (device) {
      setSelectedDeviceId(device.id);
      setSelectedDeviceData(device);
      // Limpar dados anteriores
      setPositions([]);
      setReportData([]);
    } else {
      setSelectedDeviceId('');
      setSelectedDeviceData(null);
      setPositions([]);
      setReportData([]);
    }
  };

  // Calcular datas baseado no período selecionado
  const calculateDateRange = (period) => {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0] + ' 23:59:59';
    let startDate;

    switch (period) {
      case 'hoje':
        startDate = now.toISOString().split('T')[0] + ' 00:00:00';
        return { startDate, endDate };
      case 'ontem':
        const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        startDate = yesterday.toISOString().split('T')[0] + ' 00:00:00';
        const yesterdayEnd = yesterday.toISOString().split('T')[0] + ' 23:59:59';
        return { startDate, endDate: yesterdayEnd };
      case '7':
        const date7 = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        startDate = date7.toISOString().split('T')[0] + ' 00:00:00';
        break;
      case '15':
        const date15 = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));
        startDate = date15.toISOString().split('T')[0] + ' 00:00:00';
        break;
      case '30':
        const date30 = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        startDate = date30.toISOString().split('T')[0] + ' 00:00:00';
        break;
      case 'custom':
        startDate = customStartDate + ' 00:00:00';
        const customEnd = new Date(customEndDate);
        return {
          startDate,
          endDate: customEndDate + ' 23:59:59'
        };
      default:
        return null;
    }

    return { startDate, endDate };
  };

  // Processar relatório - buscar dados do período selecionado
  const processReport = async () => {
    if (!selectedDeviceId) {
      setError('Selecione um dispositivo primeiro');
      return;
    }

    if (!selectedPeriod) {
      setError('Selecione um período para pesquisa');
      return;
    }

    if (selectedPeriod === 'custom' && (!customStartDate || !customEndDate)) {
      setError('Preencha as datas de início e fim para período personalizado');
      return;
    }

    try {
      setLoadingPositions(true);
      setError(null);
      
      const dateRange = calculateDateRange(selectedPeriod);
      if (!dateRange) {
        setError('Erro ao calcular período de datas');
        return;
      }

      console.log(`🔄 Processando relatório do dispositivo ${selectedDeviceId} de ${dateRange.startDate} até ${dateRange.endDate}`);
      
      const positionsData = await databaseService.getDevicePositions(
        selectedDeviceId, 
        dateRange.startDate, 
        dateRange.endDate,
        10000 // Limite maior para relatórios
      );
      
      setReportData(positionsData);
      console.log(`✅ Relatório processado: ${positionsData.length} registros encontrados`);
      
    } catch (err) {
      console.error('Erro ao processar relatório:', err);
      setError('Erro ao buscar dados do relatório. Verifique se o servidor está funcionando.');
    } finally {
      setLoadingPositions(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Função para preparar dados do gráfico IO18 (Horímetro)
  const prepareIO18ChartData = () => {
    if (!reportData.length) return [];
    
    // Calcular pontos baseado no total de registros - máximo 200 pontos
    const totalRecords = reportData.length;
    const maxPoints = Math.min(200, totalRecords);
    const step = Math.max(1, Math.floor(totalRecords / maxPoints));
    
    const selectedData = [];
    
    // Filtrar dados com IO18 válido primeiro
    const validData = reportData.filter(position => {
      let attrs = position.attributes;
      if (typeof attrs === 'string') {
        try {
          attrs = JSON.parse(attrs);
        } catch {
          return false;
        }
      }
      return attrs?.io18 !== undefined && attrs?.io18 !== null;
    });
    
    // Se não há dados válidos, retornar vazio
    if (!validData.length) return [];
    
    // Amostrar dados uniformemente
    for (let i = 0; i < validData.length; i += step) {
      const position = validData[i];
      let attrs = position.attributes;
      if (typeof attrs === 'string') {
        try {
          attrs = JSON.parse(attrs);
        } catch {
          continue;
        }
      }
      
      const io18Value = attrs?.io18;
      const time = position.devicetime || position.servertime;
      
      if (io18Value !== undefined && io18Value !== null && time) {
        const date = new Date(time);
        
        // Converter minutos para horas
        const hoursValue = Number(io18Value) / 60;
        selectedData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
          horimetro: Number(hoursValue.toFixed(2)),
          timestamp: date.getTime(),
          fullDate: date.toLocaleString('pt-BR')
        });
      }
    }
    
    // Ordenar cronologicamente
    selectedData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Log inteligente com throttle - apenas se os dados mudaram significativamente
    const now = Date.now();
    const dataKey = `${validData.length}_${selectedData.length}`;
    const throttle = logThrottleRef.current.horimeter;
    
    if (selectedData.length > 0 && 
        (now - throttle.lastLog > 5000 || throttle.lastData !== dataKey)) { // 5 segundos ou dados diferentes
      console.log(`⏱️ Horímetro: ${validData.length} registros válidos → ${selectedData.length} pontos no gráfico`);
      throttle.lastLog = now;
      throttle.lastData = dataKey;
    }
    
    return selectedData;
  };

  // Função para preparar dados do gráfico de Impacto
  const prepareImpactChartData = () => {
    if (!reportData.length) return [];
    
    // Calcular pontos baseado no total de registros - máximo 200 pontos
    const totalRecords = reportData.length;
    const maxPoints = Math.min(200, totalRecords);
    const step = Math.max(1, Math.floor(totalRecords / maxPoints));
    
    const selectedData = [];
    
    // Filtrar dados com impacto válido primeiro
    const validData = reportData.filter(position => {
      let attrs = position.attributes;
      if (typeof attrs === 'string') {
        try {
          attrs = JSON.parse(attrs);
        } catch {
          return false;
        }
      }
      
      // Buscar por diferentes variáveis de impacto
      const impactValue = attrs?.impact || attrs?.IMPACT || attrs?.Impact ||
                          attrs?.impacto || attrs?.IMPACTO || attrs?.Impacto ||
                          attrs?.vibration || attrs?.VIBRATION || attrs?.Vibration ||
                          attrs?.vibracao || attrs?.VIBRACAO || attrs?.Vibracao ||
                          attrs?.shock || attrs?.SHOCK || attrs?.Shock ||
                          attrs?.choque || attrs?.CHOQUE || attrs?.Choque ||
                          attrs?.accel || attrs?.ACCEL || attrs?.Accel ||
                          attrs?.acceleration || attrs?.ACCELERATION ||
                          attrs?.g_force || attrs?.G_FORCE || attrs?.gForce ||
                          attrs?.bump || attrs?.BUMP || attrs?.Bump ||
                          attrs?.hit || attrs?.HIT || attrs?.Hit;
      
      return impactValue !== undefined && impactValue !== null;
    });
    
    // Debug: mostrar alguns atributos para identificar a nomenclatura correta
    if (validData.length === 0 && reportData.length > 0 && Math.random() < 0.1) {
      const sampleAttrs = reportData[0].attributes;
      let parsed = sampleAttrs;
      if (typeof sampleAttrs === 'string') {
        try {
          parsed = JSON.parse(sampleAttrs);
        } catch {}
      }
      console.log('🔍 Atributos disponíveis (amostra):', Object.keys(parsed || {}));
    }
    
    // Se não há dados válidos, retornar vazio
    if (!validData.length) return [];
    
    // Amostrar dados uniformemente
    for (let i = 0; i < validData.length; i += step) {
      const position = validData[i];
      let attrs = position.attributes;
      if (typeof attrs === 'string') {
        try {
          attrs = JSON.parse(attrs);
        } catch {
          continue;
        }
      }
      
      // Buscar valor de impacto
      const impactValue = attrs?.impact || attrs?.IMPACT || attrs?.Impact ||
                          attrs?.impacto || attrs?.IMPACTO || attrs?.Impacto ||
                          attrs?.vibration || attrs?.VIBRATION || attrs?.Vibration ||
                          attrs?.vibracao || attrs?.VIBRACAO || attrs?.Vibracao ||
                          attrs?.shock || attrs?.SHOCK || attrs?.Shock ||
                          attrs?.choque || attrs?.CHOQUE || attrs?.Choque ||
                          attrs?.accel || attrs?.ACCEL || attrs?.Accel ||
                          attrs?.acceleration || attrs?.ACCELERATION ||
                          attrs?.g_force || attrs?.G_FORCE || attrs?.gForce ||
                          attrs?.bump || attrs?.BUMP || attrs?.Bump ||
                          attrs?.hit || attrs?.HIT || attrs?.Hit;
      
      const time = position.devicetime || position.servertime;
      
      if (impactValue !== undefined && impactValue !== null && time) {
        const date = new Date(time);
        const impactNumValue = Number(impactValue);
        
        selectedData.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
          impacto: Number(impactNumValue.toFixed(2)),
          timestamp: date.getTime(),
          fullDate: date.toLocaleString('pt-BR')
        });
      }
    }
    
    // Ordenar cronologicamente
    selectedData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Log inteligente com throttle - apenas se os dados mudaram significativamente
    const now = Date.now();
    const dataKey = `${validData.length}_${selectedData.length}`;
    const throttle = logThrottleRef.current.impact;
    
    if (selectedData.length > 0 && 
        (now - throttle.lastLog > 5000 || throttle.lastData !== dataKey)) { // 5 segundos ou dados diferentes
      console.log(`📊 Impacto: ${validData.length} registros válidos → ${selectedData.length} pontos no gráfico`);
      throttle.lastLog = now;
      throttle.lastData = dataKey;
    }
    
    return selectedData;
  };

  // Função para calcular índice de utilização por dia e viagem
  const calculateUtilizationIndex = () => {
    if (!reportData.length) return [];
    
    // Filtrar dados com IO19 (Trip Horímetro) e IO20 (Idle Time) válidos
    const validData = reportData.filter(position => {
      let attrs = position.attributes;
      if (typeof attrs === 'string') {
        try {
          attrs = JSON.parse(attrs);
        } catch {
          return false;
        }
      }
      
      const io19 = attrs?.io19; // Trip Horímetro (tempo de trabalho ativo)
      const io20 = attrs?.io20; // Idle Time (tempo ocioso)
      
      // Verificar se ambos os valores existem e são válidos (não zero)
      return io19 !== undefined && io19 !== null && io19 > 0 &&
             io20 !== undefined && io20 !== null && io20 >= 0;
    });
    
    if (!validData.length) {
      console.log('📈 Utilização: Nenhum dado válido encontrado para IO19 e IO20');
      return [];
    }
    
    // Agrupar dados por dia para calcular utilização diária
    const dailyData = {};
    
    validData.forEach(position => {
      let attrs = position.attributes;
      if (typeof attrs === 'string') {
        try {
          attrs = JSON.parse(attrs);
        } catch {
          return;
        }
      }
      
      const io19 = Number(attrs?.io19) || 0; // Trip Horímetro (minutos de trabalho)
      const io20 = Number(attrs?.io20) || 0; // Idle Time (minutos ociosos)
      const time = position.devicetime || position.servertime;
      
      if (time && io19 > 0) { // Só considera se há tempo de trabalho
        const date = new Date(time);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: dateKey,
            tripHours: [],
            idleHours: [],
            timestamp: date.getTime(),
            fullDate: date.toLocaleDateString('pt-BR')
          };
        }
        
        // Converter minutos para horas
        dailyData[dateKey].tripHours.push(io19 / 60);
        dailyData[dateKey].idleHours.push(io20 / 60);
      }
    });
    
    // Calcular índice de utilização para cada dia
    const utilizationData = [];
    
    Object.values(dailyData).forEach(dayData => {
      // Usar valores máximos do dia (representam o acumulado)
      const maxTripHours = Math.max(...dayData.tripHours);
      const maxIdleHours = Math.max(...dayData.idleHours);
      
      // Calcular utilização: Trip Hours / (Trip Hours + Idle Hours) * 100
      const totalHours = maxTripHours + maxIdleHours;
      
      if (totalHours > 0) {
        const utilizationPercentage = (maxTripHours / totalHours) * 100;
        
        utilizationData.push({
          date: dayData.fullDate,
          utilizacao: Number(utilizationPercentage.toFixed(1)),
          tripHours: Number(maxTripHours.toFixed(2)),
          idleHours: Number(maxIdleHours.toFixed(2)),
          totalHours: Number(totalHours.toFixed(2)),
          timestamp: dayData.timestamp,
          fullDate: `${dayData.fullDate} - Utilização: ${utilizationPercentage.toFixed(1)}%`
        });
      }
    });
    
    // Ordenar cronologicamente
    utilizationData.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log(`📈 Utilização: ${validData.length} registros válidos → ${utilizationData.length} dias com dados de utilização`);
    
    return utilizationData;
  };

  // Função para calcular domínios dinâmicos do gráfico
  const getChartDomains = () => {
    const data = prepareIO18ChartData();
    if (!data.length) return { yDomain: [0, 100], xDomain: ['dataMin', 'dataMax'] };

    // Calcular domínio Y (valores Horímetro em horas)
    const horimetroValues = data.map(item => item.horimetro);
    const minY = Math.min(...horimetroValues);
    const maxY = Math.max(...horimetroValues);
    
    // Adicionar uma margem de 5% para melhor visualização
    const yMargin = Math.max((maxY - minY) * 0.05, 0.1); // Margem mínima de 0.1 horas
    const yDomain = [
      Math.max(0, Number((minY - yMargin).toFixed(2))), // Não pode ser menor que 0
      Number((maxY + yMargin).toFixed(2))
    ];

    // Calcular domínio X (timestamps) - ordem cronológica reversa
    const timestamps = data.map(item => item.timestamp);
    const minX = Math.min(...timestamps);
    const maxX = Math.max(...timestamps);
    
    // Adicionar margem de tempo (2% da diferença total)
    const timeRange = maxX - minX;
    const timeMargin = timeRange * 0.02;
    const xDomain = [
      maxX + timeMargin, // Inverter: mais recente à esquerda
      minX - timeMargin  // mais antigo à direita
    ];

    return { yDomain, xDomain };
  };

  // Função para calcular domínios dinâmicos do gráfico de impacto
  const getImpactChartDomains = () => {
    const data = prepareImpactChartData();
    if (!data.length) return { yDomain: [0, 10], xDomain: ['dataMin', 'dataMax'] };

    // Calcular domínio Y (valores de Impacto)
    const impactValues = data.map(item => item.impacto);
    const minY = Math.min(...impactValues);
    const maxY = Math.max(...impactValues);
    
    // Adicionar uma margem de 10% para melhor visualização
    const yMargin = Math.max((maxY - minY) * 0.1, 0.1); // Margem mínima de 0.1
    const yDomain = [
      Math.max(0, Number((minY - yMargin).toFixed(2))), // Não pode ser menor que 0
      Number((maxY + yMargin).toFixed(2))
    ];

    // Calcular domínio X (timestamps) - ordem cronológica reversa
    const timestamps = data.map(item => item.timestamp);
    const minX = Math.min(...timestamps);
    const maxX = Math.max(...timestamps);
    
    // Adicionar margem de tempo (2% da diferença total)
    const timeRange = maxX - minX;
    const timeMargin = timeRange * 0.02;
    const xDomain = [
      maxX + timeMargin, // Inverter: mais recente à esquerda
      minX - timeMargin  // mais antigo à direita
    ];

    return { yDomain, xDomain };
  };

  // Função para calcular domínios dinâmicos do gráfico de utilização
  const getUtilizationChartDomains = () => {
    const data = calculateUtilizationIndex();
    if (!data.length) return { yDomain: [0, 100], xDomain: ['dataMin', 'dataMax'] };

    // Calcular domínio Y (valores de Utilização em %)
    const utilizationValues = data.map(item => item.utilizacao);
    const minY = Math.min(...utilizationValues);
    const maxY = Math.max(...utilizationValues);
    
    // Adicionar uma margem de 5% para melhor visualização
    const yMargin = Math.max((maxY - minY) * 0.05, 2); // Margem mínima de 2%
    const yDomain = [
      Math.max(0, Number((minY - yMargin).toFixed(1))), // Não pode ser menor que 0
      Math.min(100, Number((maxY + yMargin).toFixed(1))) // Não pode ser maior que 100
    ];

    // Calcular domínio X (timestamps) - ordem cronológica reversa
    const timestamps = data.map(item => item.timestamp);
    const minX = Math.min(...timestamps);
    const maxX = Math.max(...timestamps);
    
    // Adicionar margem de tempo (2% da diferença total)
    const timeRange = maxX - minX;
    const timeMargin = timeRange * 0.02;
    const xDomain = [
      maxX + timeMargin, // Inverter: mais recente à esquerda
      minX - timeMargin  // mais antigo à direita
    ];

    return { yDomain, xDomain };
  };


  // Funções para controle de zoom
  const getAxisYDomain = (from, to, ref, offset) => {
    const refData = prepareIO18ChartData().slice(from - 1, to);
    let [bottom, top] = [refData[0][ref], refData[0][ref]];
    
    refData.forEach((d) => {
      if (d[ref] > top) top = d[ref];
      if (d[ref] < bottom) bottom = d[ref];
    });
    
    return [(bottom | 0) - offset, (top | 0) + offset];
  };

  const zoom = () => {
    let { refAreaLeft, refAreaRight } = { refAreaLeft, refAreaRight };
    
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const data = prepareIO18ChartData();
    const leftIndex = data.findIndex(item => item.date === refAreaLeft);
    const rightIndex = data.findIndex(item => item.date === refAreaRight);
    
    if (leftIndex >= 0 && rightIndex >= 0) {
      const [bottom, top] = getAxisYDomain(leftIndex, rightIndex, 'horimetro', 1);
      setRefAreaLeft('');
      setRefAreaRight('');
      setLeft(refAreaLeft);
      setRight(refAreaRight);
      setBottom(bottom);
      setTop(top);
    }
  };

  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setTop('dataMax+1');
    setBottom('dataMin-1');
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  // Modal para exibir atributos detalhados
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [modalAttrs, setModalAttrs] = useState({});

  const handleShowAttrs = (attrs) => {
    let parsed = attrs;
    if (typeof attrs === 'string') {
      try {
        parsed = JSON.parse(attrs);
      } catch {
        parsed = attrs;
      }
    }
    setModalAttrs(parsed);
    setShowAttrModal(true);
  };

  // Funções para modal do mapa
  const openMapModal = (position) => {
    if (!position.latitude || !position.longitude) {
      Swal.fire({
        title: 'Aviso',
        text: 'Coordenadas GPS não disponíveis para este registro.',
        icon: 'warning',
        confirmButtonColor: isDarkMode ? '#3b82f6' : '#2563eb',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
      return;
    }

    // Criar apenas o mapa incorporado
    const mapHtml = `
      <div style="width: 100%; height: 400px; border-radius: 8px; overflow: hidden;">
        <iframe 
          src="https://maps.google.com/maps?q=${position.latitude},${position.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%" 
          height="400" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    `;

    Swal.fire({
      title: 'GPS',
      html: mapHtml,
      showCancelButton: false,
      confirmButtonText: 'Voltar',
      confirmButtonColor: isDarkMode ? '#3b82f6' : '#2563eb',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#f9fafb' : '#111827',
      width: '700px',
      padding: '1rem',
      customClass: {
        popup: 'swal-map-popup'
      }
    });
  };

  // ========== FUNÇÕES DO MAPA DE CALOR (MapLibre GL JS) ==========
  
  // Estilos de mapa disponíveis
  const getMapStyles = () => {
    const styles = {
      osm: {
        name: 'OpenStreetMap',
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              source: 'osm',
              type: 'raster'
            }
          ]
        },
        description: 'Mapa colaborativo OpenStreetMap'
      },
      satellite: {
        name: 'Satélite',
        style: {
          version: 8,
          sources: {
            'satellite': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              ],
              tileSize: 256,
              attribution: '© Esri'
            }
          },
          layers: [
            {
              id: 'satellite',
              source: 'satellite',
              type: 'raster'
            }
          ]
        },
        description: 'Vista de satélite realista'
      },
      streets: {
        name: 'Ruas',
        style: {
          version: 8,
          sources: {
            'carto': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
              ],
              tileSize: 256,
              attribution: '© CARTO'
            }
          },
          layers: [
            {
              id: 'carto',
              source: 'carto',
              type: 'raster'
            }
          ]
        },
        description: 'Mapa de ruas tradicional'
      }
    };
    
    // Log apenas uma vez na inicialização para evitar spam
    if (!window.__MAP_STYLES_LOGGED) {
      console.log('🗺️ Estilos de mapa disponíveis:', Object.keys(styles));
      window.__MAP_STYLES_LOGGED = true;
    }
    return styles;
  };

  // Mudar estilo do mapa - versão otimizada
  const changeMapStyle = async (styleKey) => {
    console.log(`🔄 Mudando estilo do mapa para: ${styleKey}`);
    console.log(`🔄 Estilo anterior: ${mapStyle}`);
    
    if (styleKey === mapStyle) {
      console.log('⚠️ Estilo já está selecionado, não fazendo nada');
      return;
    }
    
    setMapStyle(styleKey);
    
    // Se não há mapa ativo ou pontos, apenas atualizar o estado
    if (!map || !validHeatmapPoints.length) {
      console.log('⚠️ Mapa ou pontos não disponíveis, apenas atualizando estado');
      return;
    }
    
    try {
      console.log('🔄 Mudando estilo do mapa existente...');
      
      // Obter novo estilo
      const styles = getMapStyles();
      const newStyle = styles[styleKey];
      
      if (!newStyle) {
        console.warn(`❌ Estilo ${styleKey} não encontrado`);
        return;
      }
      
      // Mudar estilo do mapa existente (mais eficiente que reinicializar)
      map.setStyle(newStyle.style);
      
      // Aguardar o novo estilo carregar e re-adicionar as camadas
      const styleChangePromise = new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 15; // Máximo 15 tentativas (15 segundos)
        
        const checkStyleLoaded = () => {
          attempts++;
          console.log(`🔍 Tentativa ${attempts}/${maxAttempts} - Verificando carregamento do estilo ${styleKey}...`);
          
          try {
            // Verificar se o mapa ainda existe e se o estilo carregou
            if (!map || !map.isStyleLoaded()) {
              if (attempts >= maxAttempts) {
                console.warn(`⚠️ Timeout ao carregar estilo ${styleKey} após ${maxAttempts} tentativas`);
                reject(new Error(`Timeout loading style ${styleKey}`));
                return;
              }
              
              console.log(`⏳ Estilo ${styleKey} ainda carregando... tentativa ${attempts}`);
              setTimeout(checkStyleLoaded, 1000);
              return;
            }
            
            console.log(`✅ Estilo ${styleKey} carregado com sucesso!`);
            resolve();
            
          } catch (error) {
            console.error(`❌ Erro ao verificar estilo ${styleKey}:`, error);
            reject(error);
          }
        };
        
        // Aguardar um pouco antes da primeira verificação para dar tempo ao MapLibre
        setTimeout(checkStyleLoaded, 500);
      });
      
      // Aguardar o estilo carregar e depois re-adicionar as camadas
      await styleChangePromise;
      
      // Re-adicionar as camadas do heatmap
      console.log('🔄 Re-adicionando camadas do heatmap no novo estilo...');
      setTimeout(() => {
        addHeatmapLayers(map);
      }, 300);
      
    } catch (error) {
      console.error(`❌ Erro ao mudar estilo para ${styleKey}:`, error);
      
      // Fallback: tentar com OpenStreetMap se falhar
      if (styleKey !== 'osm') {
        console.log('🔄 Fallback: tentando com OpenStreetMap...');
        setMapStyle('osm');
        setTimeout(() => changeMapStyle('osm'), 1000);
      } else {
        console.error('❌ Falha crítica: nem OSM funcionou, reinicializando mapa...');
        setTimeout(() => initHeatmap(), 2000);
      }
    }
  };

  // Função separada para adicionar camadas do heatmap
  const addHeatmapLayers = (mapInstance = null, pointsToUse = null) => {
    const targetMap = mapInstance || map;
    const heatmapPoints = pointsToUse || validHeatmapPoints;
    
    if (!targetMap || !heatmapPoints.length) {
      console.warn('❌ Não é possível adicionar camadas: mapa ou pontos inválidos');
      return;
    }

    // Verificar se o mapa está carregado e pronto
    if (!targetMap.isStyleLoaded() || !targetMap.loaded()) {
      console.warn('❌ Mapa ainda não está carregado completamente');
      return;
    }

    try {
      console.log('🔄 Verificando camadas existentes...');
      
      // Verificar se as camadas já existem e removê-las (com verificações de segurança)
      try {
        if (targetMap.getSource('heatmap-source')) {
          if (targetMap.getLayer('heatmap-layer')) {
            targetMap.removeLayer('heatmap-layer');
            console.log('🗑️ Camada heatmap-layer removida');
          }
          if (targetMap.getLayer('points-layer')) {
            targetMap.removeLayer('points-layer');
            console.log('🗑️ Camada points-layer removida');
          }
          targetMap.removeSource('heatmap-source');
          console.log('🗑️ Source heatmap-source removido');
        }
      } catch (cleanupError) {
        console.warn('⚠️ Erro na limpeza das camadas (ignorado):', cleanupError);
      }

      // Preparar dados para o heatmap (limitado para evitar travamentos)
      const maxPoints = Math.min(heatmapPoints.length, 1000); // Limitar a 1000 pontos
      const heatmapData = heatmapPoints.slice(0, maxPoints).map(point => {
        let weight = 1; // Peso base simples
        
        // Calcular peso baseado na velocidade (simplificado)
        if (point.speed > 0) {
          weight += Math.min(point.speed * 0.1, 5); // Máximo 5
        }

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude]
          },
          properties: {
            weight: Math.max(1, Math.min(weight, 10)) // Entre 1 e 10
          }
        };
      });

      console.log(`📊 Preparando ${heatmapData.length} pontos para o heatmap`);

      // Criar GeoJSON source
      const geojsonSource = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: heatmapData
        }
      };

      // Adicionar source
      targetMap.addSource('heatmap-source', geojsonSource);
      console.log('✅ Source heatmap-source adicionado');

      // Configurar intensidade do heatmap (sempre alta com vermelho mais forte)
      const config = { radius: 35, weight: 1.0, opacity: 0.9 };

      // Adicionar camada heatmap (configuração melhorada para todos os zooms)
      targetMap.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap-source',
        maxzoom: 18, // Aumentar maxzoom para funcionar em zoom alto
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0, 0,
            10, config.weight
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, config.opacity * 0.5,
            10, config.opacity,
            15, config.opacity * 1.5,
            18, config.opacity * 2
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.1, 'rgb(0,100,255)',
            0.3, 'rgb(0,200,100)',
            0.5, 'rgb(255,255,0)',
            0.7, 'rgb(255,120,0)',
            0.85, 'rgb(255,50,0)', // Vermelho mais forte
            1, 'rgb(220,0,0)' // Vermelho bem intenso no máximo
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, config.radius * 0.5,
            10, config.radius,
            15, config.radius * 1.5,
            18, config.radius * 2
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, config.opacity,
            10, config.opacity,
            15, config.opacity * 0.8,
            18, config.opacity * 0.3 // Reduzir um pouco em zoom muito alto
          ]
        }
      });
      console.log('✅ Camada heatmap-layer adicionada (intensidade alta, vermelho forte)');

      // Adicionar camada de pontos individuais para zoom alto (configuração melhorada)
      targetMap.addLayer({
        id: 'points-layer',
        type: 'circle',
        source: 'heatmap-source',
        minzoom: 16, // Aparecer só em zoom bem alto
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            16, 3,
            18, 6
          ],
          'circle-color': '#ff0000', // Vermelho fixo como estava antes
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            16, 0.6,
            18, 0.9
          ]
        }
      });
      console.log('✅ Camada points-layer adicionada (pontos vermelhos)');

      console.log(`✅ Camadas do heatmap adicionadas com sucesso: ${heatmapData.length} pontos`);

    } catch (error) {
      console.error('❌ Erro ao adicionar camadas do heatmap:', error);
    }
  };
  
  // Inicializar mapa de calor
  const initHeatmap = async (pointsToUse = null) => {
    // Usar os pontos passados como parâmetro ou o estado atual
    const heatmapPoints = pointsToUse || validHeatmapPoints;
    
    console.log('🗺️ Iniciando inicialização do mapa...');
    console.log(`📍 Pontos GPS válidos: ${heatmapPoints.length}`);
    console.log(`� Pontos GPS válidos: ${validHeatmapPoints.length}`);
    
    if (!heatmapPoints.length) {
      console.log('❌ Nenhum ponto GPS válido encontrado');
      return;
    }

    try {
      // Verificar se o elemento do mapa existe
      if (!mapContainer.current) {
        console.warn('❌ Elemento do container do mapa não encontrado');
        return;
      }

      // Destruir mapa existente se houver
      if (map) {
        console.log('🧹 Removendo mapa existente...');
        try {
          // MapLibre usa remove(), não destroy()
          if (typeof map.remove === 'function') {
            map.remove();
          }
        } catch (error) {
          console.warn('⚠️ Erro ao remover mapa anterior:', error);
        }
        setMap(null);
      }

      // Calcular centro do mapa usando os pontos corretos
      const centerLat = heatmapPoints.reduce((sum, p) => sum + p.latitude, 0) / heatmapPoints.length;
      const centerLng = heatmapPoints.reduce((sum, p) => sum + p.longitude, 0) / heatmapPoints.length;

      console.log(`🎯 Centro do mapa: ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}`);

      // Obter estilo selecionado
      const styles = getMapStyles();
      let selectedMapStyle = styles[mapStyle];
      
      // Fallback para satellite se o estilo não existir
      if (!selectedMapStyle) {
        console.log(`⚠️ Estilo ${mapStyle} não encontrado, usando satélite`);
        selectedMapStyle = styles.satellite;
        setMapStyle('satellite');
      }

      console.log(`🎨 Usando estilo: ${mapStyle}`);

      // Criar mapa MapLibre com configurações simplificadas
      const newMap = new maplibregl.Map({
        container: mapContainer.current,
        style: selectedMapStyle.style,
        center: [centerLng, centerLat],
        zoom: 12,
        maxZoom: 18,
        minZoom: 5,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
        touchZoomRotate: {
          disableRotation: true
        }
      });

      // Aguardar carregamento completo do mapa
      newMap.on('load', () => {
        console.log('✅ Mapa carregado com sucesso!');
        
        // Aguardar o estilo estar completamente pronto
        let attempts = 0;
        const maxAttempts = 15; // Máximo 15 tentativas (15 segundos)
        
        const checkStyleAndAddLayers = () => {
          attempts++;
          console.log(`🔍 Tentativa ${attempts}/${maxAttempts} - Verificando estilo... isStyleLoaded(): ${newMap.isStyleLoaded()}`);
          
          // Verificar se excedeu o máximo de tentativas
          if (attempts > maxAttempts) {
            console.error(`❌ Máximo de tentativas (${maxAttempts}) atingido. Falha ao carregar estilo ${mapStyle}`);
            
            // Fallback: tentar com OpenStreetMap se não for OSM
            if (mapStyle !== 'osm') {
              console.log('🔄 Fallback: mudando para OpenStreetMap...');
              setMapStyle('osm');
              return;
            }
            
            // Se OSM também falhou, mostrar erro
            setError('Erro ao carregar mapa. Verifique sua conexão com a internet.');
            return;
          }
          console.log(`� Verificando estilo... isStyleLoaded(): ${newMap.isStyleLoaded()}`);
          
          if (newMap.isStyleLoaded() && heatmapPoints.length > 0) {
            console.log('✅ Estilo carregado, adicionando camadas...');
            addHeatmapLayers(newMap, heatmapPoints); // Passar os pontos diretamente
            
            // Ajustar bounds para mostrar todos os pontos usando os pontos corretos
            setTimeout(() => {
              try {
                const bounds = new maplibregl.LngLatBounds();
                heatmapPoints.forEach(p => bounds.extend([p.longitude, p.latitude]));
                newMap.fitBounds(bounds, { 
                  padding: 50,
                  maxZoom: 15,
                  duration: 1000
                });
                console.log('✅ Bounds ajustados para mostrar todos os pontos');
              } catch (error) {
                console.warn('⚠️ Erro ao ajustar bounds:', error);
              }
            }, 500);
          } else {
            console.log('⏳ Estilo ainda não está pronto, parando após 15 tentativas...');
            return; // PARAR LOOP INFINITO
          }
        };
        
        // Iniciar verificação após um delay inicial
        setTimeout(checkStyleAndAddLayers, 1500);
      });

      // Tratamento de erros
      newMap.on('error', (e) => {
        console.error('❌ Erro no mapa MapLibre:', e);
        
        // Tentar com estilo de fallback se não for OSM
        if (mapStyle !== 'osm') {
          console.log('🔄 Tentando com OpenStreetMap...');
          setMapStyle('osm');
          // NÃO chamar initHeatmap() novamente para evitar loops infinitos
          return;
        }
        
        setError('Erro ao carregar mapa de calor. Verifique sua conexão.');
      });

      // Eventos de debug - com throttling melhorado para evitar spam
      let lastLogTime = 0;
      newMap.on('sourcedata', (e) => {
        if (e.sourceId === 'heatmap-source') {
          const now = Date.now();
          const throttle = logThrottleRef.current.heatmap;
          throttle.count++;
          
          // Log apenas a cada 10 segundos e máximo 3 vezes
          if (now - throttle.lastLog > 10000 && throttle.count <= 3) {
            console.log(`📊 Dados do heatmap carregados (${throttle.count}ª vez)`);
            throttle.lastLog = now;
          }
        }
      });

      // Adicionar controles básicos
      try {
        newMap.addControl(new maplibregl.NavigationControl({
          showCompass: false,
          showZoom: true
        }), 'top-right');
        
        newMap.addControl(new maplibregl.ScaleControl({
          maxWidth: 80,
          unit: 'metric'
        }), 'bottom-left');
      } catch (error) {
        console.warn('⚠️ Erro ao adicionar controles:', error);
      }

      setMap(newMap);
      console.log('✅ Mapa inicializado com sucesso!');

    } catch (error) {
      console.error('❌ Erro fatal ao inicializar mapa:', error);
      setError('Erro crítico ao carregar mapa. Tente recarregar a página.');
    }
  };

  // Toggle do heatmap
  const toggleHeatmap = () => {
    if (map && map.getLayer('heatmap-layer')) {
      try {
        const visibility = map.getLayoutProperty('heatmap-layer', 'visibility');
        
        if (visibility === 'visible' || visibility === undefined) {
          map.setLayoutProperty('heatmap-layer', 'visibility', 'none');
          map.setLayoutProperty('points-layer', 'visibility', 'none');
          console.log('🔇 Camadas do heatmap ocultadas');
        } else {
          map.setLayoutProperty('heatmap-layer', 'visibility', 'visible');
          map.setLayoutProperty('points-layer', 'visibility', 'visible');
          console.log('🔊 Camadas do heatmap visíveis');
        }
      } catch (error) {
        console.error('❌ Erro ao alternar heatmap:', error);
      }
    } else {
      console.warn('⚠️ Mapa ou camadas não disponíveis para toggle');
    }
  };

  // Reinicializar mapa quando dados mudarem
  useEffect(() => {
    console.log('📊 useEffect do mapa: dados ou estilo mudaram');
    console.log(`📊 reportData.length: ${reportData.length}`);
    
    if (reportData.length > 0) {
      console.log('� Validando pontos GPS...');
      
      // Validar pontos GPS ANTES de tentar renderizar o mapa
      const validPoints = reportData.filter(p => {
        const hasLat = p.latitude !== undefined && p.latitude !== null && p.latitude !== '' && p.latitude !== 0;
        const hasLng = p.longitude !== undefined && p.longitude !== null && p.longitude !== '' && p.longitude !== 0;
        const isValidLat = !isNaN(parseFloat(p.latitude)) && isFinite(p.latitude);
        const isValidLng = !isNaN(parseFloat(p.longitude)) && isFinite(p.longitude);
        
        return hasLat && hasLng && isValidLat && isValidLng;
      }).slice(0, 2000);
      
      console.log(`📍 Pontos GPS válidos encontrados: ${validPoints.length} de ${reportData.length}`);
      setValidHeatmapPoints(validPoints);
      
      // Só tentar inicializar o mapa se houver pontos válidos
      if (validPoints.length > 0) {
        console.log('✅ Pontos GPS válidos encontrados, aguardando container...');
        
        // Aguardar um pouco para o container ser renderizado
        const timeoutId = setTimeout(() => {
          console.log(`📊 mapContainer.current após timeout:`, mapContainer.current);
          if (mapContainer.current) {
            console.log('🚀 Iniciando mapa após timeout...');
            initHeatmap(validPoints); // Passar os pontos diretamente
          } else {
            console.log('⚠️ Container do mapa ainda não está disponível');
          }
        }, 2000); // Aumentar para 2 segundos

        return () => {
          console.log('🧹 Limpando timeout do mapa');
          clearTimeout(timeoutId);
        };
      } else {
        console.log('❌ Nenhum ponto GPS válido, não renderizando mapa');
        setValidHeatmapPoints([]);
      }
    } else {
      console.log('❌ Sem dados do relatório');
      setValidHeatmapPoints([]);
    }

    // Cleanup function quando componente desmonta
    return () => {
      if (map) {
        console.log('🧹 Removendo mapa no cleanup');
        try {
          map.remove();
          setMap(null);
        } catch (error) {
          console.warn('⚠️ Erro ao remover mapa:', error);
        }
      }
    };
  }, [reportData.length, mapStyle]); // Usar reportData.length ao invés do array completo

  // Efeito separado para mudança de intensidade (evitar reinicialização)
  useEffect(() => {
    // Log removido para evitar spam - intensidade sempre é 'high'
    // Função changeHeatmapIntensity removida pois não é necessária - intensidade é sempre alta
    
    if (map && heatmapIntensity && map.getLayer('heatmap-layer')) {
      // Intensidade já é configurada na criação das camadas, não precisa de função separada
      console.log(`🎨 Intensidade do heatmap: ${heatmapIntensity} (configurado nas camadas)`);
    }
  }, [heatmapIntensity]); // Remover dependência do 'map' para evitar loops

  // ========== FIM DAS FUNÇÕES DO MAPA DE CALOR ==========
  
  // Função inteligente de análise de dados
  const analyzeData = () => {
    if (!reportData.length) return {};

    // Análises básicas
    const speeds = reportData.map(p => p.speed || 0).filter(v => typeof v === 'number');
    const avgSpeed = speeds.length ? (speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;
    const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
    const minSpeed = speeds.length ? Math.min(...speeds) : 0;

    // Análise de horímetro - USAR A MESMA LÓGICA DA INTERFACE
    const horimetroData = prepareIO18ChartData();
    
    // Calcular valores absolutos mínimo e máximo de TODO o período (igual à interface)
    const allHorimetroValues = horimetroData.length > 0 ? horimetroData.map(item => item.horimetro) : [];
    const absoluteMin = allHorimetroValues.length > 0 ? Math.min(...allHorimetroValues) : 0;
    const absoluteMax = allHorimetroValues.length > 0 ? Math.max(...allHorimetroValues) : 0;
    const totalHorasRodadas = absoluteMax - absoluteMin; // Igual ao cálculo da interface
    
    const horimetroAnalysis = {
      totalHours: absoluteMax,
      workingDays: [],
      peakHours: [],
      // Valores reais do período completo
      periodMin: absoluteMin,     // Menor valor absoluto do período
      periodMax: absoluteMax,     // Maior valor absoluto do período  
      totalPeriodHours: totalHorasRodadas // Total de horas rodadas no período
    };

    // Agrupar por dias e encontrar os dias de maior trabalho
    const dailyWork = {};
    horimetroData.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!dailyWork[date]) dailyWork[date] = { hours: [], date };
      dailyWork[date].hours.push(item.horimetro);
    });

    // Calcular período total de análise para identificar dias parados
    const startDate = reportData.length > 0 ? new Date(reportData[reportData.length - 1].devicetime || reportData[reportData.length - 1].servertime) : null;
    const endDate = reportData.length > 0 ? new Date(reportData[0].devicetime || reportData[0].servertime) : null;
    
    // Gerar lista de todos os dias no período
    const allDaysInPeriod = [];
    if (startDate && endDate) {
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        allDaysInPeriod.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    Object.entries(dailyWork).forEach(([date, data]) => {
      const maxHour = Math.max(...data.hours);
      const minHour = Math.min(...data.hours);
      const workHours = maxHour - minHour;
      horimetroAnalysis.workingDays.push({ date, workHours, maxHour, minHour });
    });

    // Identificar dias com máquina parada (sem registros de horímetro ou com 0 horas trabalhadas)
    const stoppedDays = [];
    allDaysInPeriod.forEach(date => {
      const dayWork = dailyWork[date];
      if (!dayWork || dayWork.hours.length === 0) {
        // Dia sem registros de horímetro
        stoppedDays.push({ date, reason: 'Sem registros de horímetro' });
      } else {
        const maxHour = Math.max(...dayWork.hours);
        const minHour = Math.min(...dayWork.hours);
        const workHours = maxHour - minHour;
        if (workHours <= 0.1) { // Considera parado se trabalhou menos de 0.1h (6 minutos)
          stoppedDays.push({ date, reason: 'Horímetro sem variação significativa', workHours: workHours.toFixed(2) });
        }
      }
    });

    horimetroAnalysis.workingDays.sort((a, b) => b.workHours - a.workHours);
    horimetroAnalysis.peakHours = horimetroAnalysis.workingDays; // Incluir todos os dias, não apenas os 5 primeiros
    horimetroAnalysis.stoppedDays = stoppedDays; // Adicionar dias parados
    horimetroAnalysis.totalDaysInPeriod = allDaysInPeriod.length; // Total de dias no período

    // Análise de impacto expandida
    const impactData = prepareImpactChartData();
    const impactAnalysis = {
      totalImpacts: impactData.length,
      highImpacts: [],
      mediumImpacts: [],
      lowImpacts: [],
      avgImpact: 0,
      maxImpact: 0,
      minImpact: 0,
      // Análises por intensidade
      criticalImpacts: [], // > média + 100%
      severeImpacts: [],   // > média + 75%
      moderateImpacts: [], // > média + 25%
      // Análises temporais
      dailyImpacts: {},
      hourlyDistribution: {},
      impactTrends: [],
      // Estatísticas avançadas
      standardDeviation: 0,
      impactFrequency: 0, // impactos por hora
      peakImpactPeriods: [], // períodos com mais impactos
      consecutiveImpacts: [], // sequências de impactos
      impactIntensityZones: {
        low: { count: 0, percentage: 0, threshold: 0 },
        medium: { count: 0, percentage: 0, threshold: 0 },
        high: { count: 0, percentage: 0, threshold: 0 },
        critical: { count: 0, percentage: 0, threshold: 0 }
      }
    };

    if (impactData.length > 0) {
      // Estatísticas básicas
      const impactValues = impactData.map(i => i.impacto);
      impactAnalysis.avgImpact = impactValues.reduce((a, b) => a + b, 0) / impactValues.length;
      impactAnalysis.maxImpact = Math.max(...impactValues);
      impactAnalysis.minImpact = Math.min(...impactValues);
      
      // Desvio padrão
      const variance = impactValues.reduce((sum, value) => sum + Math.pow(value - impactAnalysis.avgImpact, 2), 0) / impactValues.length;
      impactAnalysis.standardDeviation = Math.sqrt(variance);
      
      // Definir limiares de intensidade em G (força gravitacional)
      const avgImpact = impactAnalysis.avgImpact;
      // Limiares baseados em padrões industriais para impactos em G
      const lowThreshold = Math.max(0.5, avgImpact * 0.5);      // Impactos leves: > 0.5G
      const mediumThreshold = Math.max(1.0, avgImpact * 1.25);  // Impactos moderados: > 1.0G  
      const highThreshold = Math.max(2.0, avgImpact * 1.75);    // Impactos severos: > 2.0G
      const criticalThreshold = Math.max(3.0, avgImpact * 2.0); // Impactos críticos: > 3.0G
      
      // Classificar impactos por intensidade
      impactData.forEach(impact => {
        if (impact.impacto >= criticalThreshold) {
          impactAnalysis.criticalImpacts.push(impact);
          impactAnalysis.impactIntensityZones.critical.count++;
        } else if (impact.impacto >= highThreshold) {
          impactAnalysis.severeImpacts.push(impact);
          impactAnalysis.impactIntensityZones.high.count++;
        } else if (impact.impacto >= mediumThreshold) {
          impactAnalysis.moderateImpacts.push(impact);
          impactAnalysis.impactIntensityZones.medium.count++;
        } else {
          impactAnalysis.lowImpacts.push(impact);
          impactAnalysis.impactIntensityZones.low.count++;
        }
        
        // Agrupar por dia
        const dateKey = new Date(impact.timestamp).toISOString().split('T')[0];
        if (!impactAnalysis.dailyImpacts[dateKey]) {
          impactAnalysis.dailyImpacts[dateKey] = [];
        }
        impactAnalysis.dailyImpacts[dateKey].push(impact);
        
        // Distribuição por hora
        const hour = new Date(impact.timestamp).getHours();
        if (!impactAnalysis.hourlyDistribution[hour]) {
          impactAnalysis.hourlyDistribution[hour] = 0;
        }
        impactAnalysis.hourlyDistribution[hour]++;
      });
      
      // Calcular percentuais das zonas de intensidade
      const totalImpacts = impactData.length;
      impactAnalysis.impactIntensityZones.low.percentage = (impactAnalysis.impactIntensityZones.low.count / totalImpacts) * 100;
      impactAnalysis.impactIntensityZones.medium.percentage = (impactAnalysis.impactIntensityZones.medium.count / totalImpacts) * 100;
      impactAnalysis.impactIntensityZones.high.percentage = (impactAnalysis.impactIntensityZones.high.count / totalImpacts) * 100;
      impactAnalysis.impactIntensityZones.critical.percentage = (impactAnalysis.impactIntensityZones.critical.count / totalImpacts) * 100;
      
      impactAnalysis.impactIntensityZones.low.threshold = lowThreshold;
      impactAnalysis.impactIntensityZones.medium.threshold = mediumThreshold;
      impactAnalysis.impactIntensityZones.high.threshold = highThreshold;
      impactAnalysis.impactIntensityZones.critical.threshold = criticalThreshold;
      
      // Ordenar impactos por intensidade
      impactAnalysis.criticalImpacts.sort((a, b) => b.impacto - a.impacto);
      impactAnalysis.severeImpacts.sort((a, b) => b.impacto - a.impacto);
      impactAnalysis.moderateImpacts.sort((a, b) => b.impacto - a.impacto);
      
      // Compatibilidade com código existente
      const threshold = impactAnalysis.avgImpact * 1.5;
      impactAnalysis.highImpacts = impactData
        .filter(i => i.impacto > threshold)
        .sort((a, b) => b.impacto - a.impacto)
        .slice(0, 10);
      
      // Frequência de impactos (impactos por hora)
      if (reportData.length > 0) {
        const startTime = new Date(reportData[reportData.length - 1].devicetime || reportData[reportData.length - 1].servertime);
        const endTime = new Date(reportData[0].devicetime || reportData[0].servertime);
        const totalHours = Math.max(1, (endTime - startTime) / (1000 * 60 * 60));
        impactAnalysis.impactFrequency = impactData.length / totalHours;
      }
      
      // Análise de períodos de pico
      const dailyImpactCounts = Object.entries(impactAnalysis.dailyImpacts)
        .map(([date, impacts]) => ({
          date,
          count: impacts.length,
          avgIntensity: impacts.reduce((sum, imp) => sum + imp.impacto, 0) / impacts.length,
          maxIntensity: Math.max(...impacts.map(imp => imp.impacto)),
          impacts: impacts
        }))
        .sort((a, b) => b.count - a.count);
      
      impactAnalysis.peakImpactPeriods = dailyImpactCounts.slice(0, 5);
      
      // Detectar impactos consecutivos (dentro de 30 minutos)
      const sortedImpacts = [...impactData].sort((a, b) => a.timestamp - b.timestamp);
      let consecutiveSequences = [];
      let currentSequence = [sortedImpacts[0]];
      
      for (let i = 1; i < sortedImpacts.length; i++) {
        const timeDiff = sortedImpacts[i].timestamp - sortedImpacts[i-1].timestamp;
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutos em ms
        
        if (timeDiff <= thirtyMinutes) {
          currentSequence.push(sortedImpacts[i]);
        } else {
          if (currentSequence.length >= 3) { // Sequência de pelo menos 3 impactos
            consecutiveSequences.push({
              count: currentSequence.length,
              startTime: currentSequence[0].timestamp,
              endTime: currentSequence[currentSequence.length - 1].timestamp,
              avgIntensity: currentSequence.reduce((sum, imp) => sum + imp.impacto, 0) / currentSequence.length,
              maxIntensity: Math.max(...currentSequence.map(imp => imp.impacto)),
              impacts: currentSequence
            });
          }
          currentSequence = [sortedImpacts[i]];
        }
      }
      
      // Verificar a última sequência
      if (currentSequence.length >= 3) {
        consecutiveSequences.push({
          count: currentSequence.length,
          startTime: currentSequence[0].timestamp,
          endTime: currentSequence[currentSequence.length - 1].timestamp,
          avgIntensity: currentSequence.reduce((sum, imp) => sum + imp.impacto, 0) / currentSequence.length,
          maxIntensity: Math.max(...currentSequence.map(imp => imp.impacto)),
          impacts: currentSequence
        });
      }
      
      impactAnalysis.consecutiveImpacts = consecutiveSequences.sort((a, b) => b.count - a.count);
    }

    // Análise de posicionamento
    const validPositions = reportData.filter(p => p.latitude && p.longitude);
    const positionAnalysis = {
      totalPositions: validPositions.length,
      coverage: validPositions.length / reportData.length,
      boundaries: { north: 0, south: 0, east: 0, west: 0 }
    };

    if (validPositions.length > 0) {
      positionAnalysis.boundaries = {
        north: Math.max(...validPositions.map(p => p.latitude)),
        south: Math.min(...validPositions.map(p => p.latitude)),
        east: Math.max(...validPositions.map(p => p.longitude)),
        west: Math.min(...validPositions.map(p => p.longitude))
      };
    }

    return {
      speeds: { avg: avgSpeed, max: maxSpeed, min: minSpeed, count: speeds.length },
      horimetro: horimetroAnalysis,
      impact: impactAnalysis,
      position: positionAnalysis,
      totalRecords: reportData.length,
      dateRange: {
        start: reportData.length > 0 ? new Date(reportData[reportData.length - 1].devicetime || reportData[reportData.length - 1].servertime) : null,
        end: reportData.length > 0 ? new Date(reportData[0].devicetime || reportData[0].servertime) : null
      }
    };
  };

  const exportPDF = async () => {
    if (!reportData.length) return;
    
    // Mostrar loading
    const loadingSwal = Swal.fire({
      title: 'Gerando Relatório',
      text: 'Processando dados e criando PDF profissional...',
      allowOutsideClick: false,
      showConfirmButton: false,
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#f9fafb' : '#111827',
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 50;

      // Análise dos dados
      const analysis = analyzeData();

      // === FUNÇÃO PARA ADICIONAR NOVA PÁGINA ===
      const addNewPage = (showHeader = true) => {
        // Rodapé da página anterior
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`SmartLogger - Relatório de Equipamentos | Página ${doc.internal.getCurrentPageInfo().pageNumber}`, 
                 margin, pageHeight - 20);
        doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 
                 pageWidth - 200, pageHeight - 20);
        
        doc.addPage();
        yPos = margin;
        
        if (showHeader) {
          // Mini cabeçalho nas páginas subsequentes
          doc.setFontSize(10);
          doc.setTextColor(41, 128, 185);
          doc.text(`${selectedDeviceData?.name || 'Equipamento'} - Relatório Técnico`, margin, yPos);
          yPos += 25;
          
          // Linha separadora
          doc.setDrawColor(41, 128, 185);
          doc.setLineWidth(0.5);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 20;
        }
      };

      // === FUNÇÃO PARA VERIFICAR ESPAÇO ===
      const checkPageSpace = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - 80) {
          addNewPage();
        }
      };

      // === FUNÇÃO PARA DESENHAR BOX ===
      const drawBox = (x, y, width, height, fillColor = null, borderColor = [200, 200, 200]) => {
        if (fillColor) {
          doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
          doc.rect(x, y, width, height, 'F');
        }
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.setLineWidth(0.5);
        doc.rect(x, y, width, height);
      };

      // === CAPA PROFISSIONAL ===
      // Background azul para cabeçalho
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageWidth, 120, 'F');
      
      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('RELATÓRIO TÉCNICO', pageWidth / 2, 50, { align: 'center' });
      doc.setFontSize(16);
      doc.text('ANÁLISE DE EQUIPAMENTO', pageWidth / 2, 75, { align: 'center' });
      
      yPos = 150;
      
      // Informações principais em cards
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(14);
      doc.text('INFORMAÇÕES DO RELATÓRIO', margin, yPos);
      yPos += 30;
      
      // Card 1 - Equipamento
      drawBox(margin, yPos, contentWidth / 2 - 10, 60, [248, 250, 252], [41, 128, 185]);
      doc.setFontSize(10);
      doc.setTextColor(41, 128, 185);
      doc.text('EQUIPAMENTO', margin + 15, yPos + 20);
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      const deviceName = selectedDeviceData?.name || 'Não identificado';
      doc.text(deviceName, margin + 15, yPos + 40);
      
      // Card 2 - Período
      drawBox(margin + contentWidth / 2 + 10, yPos, contentWidth / 2 - 10, 60, [248, 250, 252], [41, 128, 185]);
      doc.setFontSize(10);
      doc.setTextColor(41, 128, 185);
      doc.text('PERÍODO ANALISADO', margin + contentWidth / 2 + 25, yPos + 20);
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      const periodText = selectedPeriod === 'custom' ? 
        `${customStartDate} até ${customEndDate}` : 
        selectedPeriod === 'hoje' ? 'Hoje' :
        selectedPeriod === 'ontem' ? 'Ontem' :
        `Últimos ${selectedPeriod} dias`;
      doc.text(periodText, margin + contentWidth / 2 + 25, yPos + 40);
      
      yPos += 80;
      
      // Card 3 - Registros
      drawBox(margin, yPos, contentWidth / 3 - 10, 60, [240, 253, 244], [34, 197, 94]);
      doc.setFontSize(10);
      doc.setTextColor(34, 197, 94);
      doc.text('TOTAL DE REGISTROS', margin + 15, yPos + 20);
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text(reportData.length.toString(), margin + 15, yPos + 45);
      
      // Card 4 - Cobertura GPS
      drawBox(margin + contentWidth / 3 + 5, yPos, contentWidth / 3 - 10, 60, [254, 249, 195], [245, 158, 11]);
      doc.setFontSize(10);
      doc.setTextColor(245, 158, 11);
      doc.text('COBERTURA GPS', margin + contentWidth / 3 + 20, yPos + 20);
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text(`${(analysis.position.coverage * 100).toFixed(1)}%`, margin + contentWidth / 3 + 20, yPos + 45);
      
      // Card 5 - Velocidade Média
      drawBox(margin + (contentWidth / 3 * 2) + 10, yPos, contentWidth / 3 - 10, 60, [254, 242, 242], [239, 68, 68]);
      doc.setFontSize(10);
      doc.setTextColor(239, 68, 68);
      doc.text('VELOCIDADE MÉDIA', margin + (contentWidth / 3 * 2) + 25, yPos + 20);
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text(`${analysis.speeds.avg.toFixed(1)} km/h`, margin + (contentWidth / 3 * 2) + 25, yPos + 45);
      
      yPos += 100;


      // === ANÁLISE DE HORÍMETRO ===
      if (analysis.horimetro.peakHours.length > 0) {
        
        
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text('ANÁLISE COMPLETA DE HORÍMETRO', margin, yPos);
        yPos += 30;

        // === GRÁFICO DE HORÍMETRO ===
        checkPageSpace(250);
        
        const horimetroChartData = prepareIO18ChartData();
        if (horimetroChartData.length > 0) {
          // Título do gráfico
          doc.setFontSize(12);
          doc.setTextColor(60, 60, 60);
          doc.text('Evolução do Horímetro no Período:', margin, yPos);
          yPos += 25;
          
          // Dimensões do gráfico melhoradas
          const chartWidth = contentWidth - 20; // Mais espaço nas laterais
          const chartHeight = 180; // Altura maior
          const chartStartX = margin + 10;
          const chartStartY = yPos;
          const leftMargin = 50; // Margem esquerda para labels Y
          const bottomMargin = 40; // Margem inferior para labels X
          const plotWidth = chartWidth - leftMargin - 20;
          const plotHeight = chartHeight - bottomMargin - 10;
          
          // Background do gráfico com bordas mais suaves
          drawBox(chartStartX, chartStartY, chartWidth, chartHeight, [252, 254, 255], [220, 220, 220]);
          
          // Calcular valores para o gráfico
          const horimetroValues = horimetroChartData.map(item => item.horimetro);
          const minValue = Math.min(...horimetroValues);
          const maxValue = Math.max(...horimetroValues);
          const valueRange = maxValue - minValue;
          
          // Adicionar margem nos valores para melhor visualização
          const valuePadding = valueRange * 0.1;
          const adjustedMin = Math.max(0, minValue - valuePadding);
          const adjustedMax = maxValue + valuePadding;
          const adjustedRange = adjustedMax - adjustedMin;
          
          // Grid e eixos mais organizados
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          
          // Grid horizontal (6 linhas para melhor divisão)
          for (let i = 0; i <= 5; i++) {
            const gridY = chartStartY + 10 + (plotHeight * i / 5);
            // Linha do grid
            doc.line(chartStartX + leftMargin, gridY, chartStartX + leftMargin + plotWidth, gridY);
            
            // Labels do eixo Y - melhor formatação
            const labelValue = adjustedMax - (adjustedRange * i / 5);
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text(`${labelValue.toFixed(1)}h`, chartStartX + leftMargin - 35, gridY + 3);
          }
          
          // Grid vertical com distribuição melhor
          const maxGridLines = Math.min(8, horimetroChartData.length);
          for (let i = 0; i <= maxGridLines; i++) {
            const gridX = chartStartX + leftMargin + (plotWidth * i / maxGridLines);
            // Linha do grid vertical
            doc.setDrawColor(230, 230, 230);
            doc.line(gridX, chartStartY + 10, gridX, chartStartY + 10 + plotHeight);
            
            // Labels do eixo X - melhor espaçamento e rotação
            if (i < horimetroChartData.length) {
              const dataIndex = Math.floor((horimetroChartData.length - 1) * i / maxGridLines);
              const dataItem = horimetroChartData[dataIndex];
              if (dataItem) {
                doc.setFontSize(8);
                doc.setTextColor(80, 80, 80);
                const date = new Date(dataItem.timestamp);
                const dateLabel = date.toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit'
                });
                const timeLabel = date.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                });
                
                // Data
                doc.text(dateLabel, gridX - 15, chartStartY + chartHeight - 25);
                // Hora (menor)
                doc.setFontSize(7);
                doc.setTextColor(120, 120, 120);
                doc.text(timeLabel, gridX - 15, chartStartY + chartHeight - 12);
              }
            }
          }
          
          // Eixos principais
          doc.setDrawColor(100, 100, 100);
          doc.setLineWidth(1);
          // Eixo Y
          doc.line(chartStartX + leftMargin, chartStartY + 10, chartStartX + leftMargin, chartStartY + 10 + plotHeight);
          // Eixo X
          doc.line(chartStartX + leftMargin, chartStartY + 10 + plotHeight, chartStartX + leftMargin + plotWidth, chartStartY + 10 + plotHeight);
          
          // Linha do gráfico com gradiente visual
          doc.setDrawColor(41, 128, 185);
          doc.setLineWidth(3); // Linha mais espessa
          
          for (let i = 0; i < horimetroChartData.length - 1; i++) {
            const currentItem = horimetroChartData[i];
            const nextItem = horimetroChartData[i + 1];
            
            // Posição X proporcional
            const currentX = chartStartX + leftMargin + (plotWidth * i / Math.max(1, horimetroChartData.length - 1));
            const nextX = chartStartX + leftMargin + (plotWidth * (i + 1) / Math.max(1, horimetroChartData.length - 1));
            
            // Posição Y baseada no valor ajustado
            const currentY = chartStartY + 10 + plotHeight - (plotHeight * (currentItem.horimetro - adjustedMin) / adjustedRange);
            const nextY = chartStartY + 10 + plotHeight - (plotHeight * (nextItem.horimetro - adjustedMin) / adjustedRange);
            
            doc.line(currentX, currentY, nextX, nextY);
            
            // Pontos no gráfico - maiores e com borda
            doc.setFillColor(255, 255, 255); // Fundo branco
            doc.circle(currentX, currentY, 3, 'F');
            doc.setDrawColor(41, 128, 185);
            doc.setLineWidth(2);
            doc.circle(currentX, currentY, 3);
          }
          
          // Último ponto
          if (horimetroChartData.length > 0) {
            const lastItem = horimetroChartData[horimetroChartData.length - 1];
            const lastX = chartStartX + leftMargin + plotWidth;
            const lastY = chartStartY + 10 + plotHeight - (plotHeight * (lastItem.horimetro - adjustedMin) / adjustedRange);
            doc.setFillColor(255, 255, 255);
            doc.circle(lastX, lastY, 3, 'F');
            doc.setDrawColor(41, 128, 185);
            doc.setLineWidth(2);
            doc.circle(lastX, lastY, 3);
          }
          
          // Títulos dos eixos - posicionamento simples e limpo
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          
          // Título eixo Y - simples, sem rotação
          doc.text('Horímetro (h)', chartStartX + 5, chartStartY - 5);
          
          // Espaçamento após o gráfico
          yPos += chartHeight + 30;
        }

        // Resumo geral do período
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        const periodText = selectedPeriod === 'custom' ? 
          `Período: ${customStartDate} até ${customEndDate}` : 
          selectedPeriod === 'hoje' ? 'Período: Hoje' :
          selectedPeriod === 'ontem' ? 'Período: Ontem' :
          `Período: Últimos ${selectedPeriod} dias`;
        doc.text(periodText, margin, yPos);
        yPos += 20;

        doc.text(`Total de dias analisados: ${analysis.horimetro.peakHours.length}`, margin, yPos);
        yPos += 15;
        
        const totalWorkHours = analysis.horimetro.peakHours.reduce((sum, day) => sum + day.workHours, 0);
        doc.text(`Total de horas trabalhadas no período: ${totalWorkHours.toFixed(1)}h`, margin, yPos);
        yPos += 15;
        
        const avgWorkHours = totalWorkHours / analysis.horimetro.peakHours.length;
        doc.text(`Média de horas trabalhadas por dia: ${avgWorkHours.toFixed(1)}h`, margin, yPos);
        yPos += 25;


        // === NOVA PÁGINA PARA DETALHAMENTO DIÁRIO ===
        addNewPage();
        
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text('DETALHAMENTO DIÁRIO DE ATIVIDADE', margin, yPos);
        yPos += 30;

        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text('Detalhamento por dia (ordenado por maior atividade):', margin, yPos);
        yPos += 25;

        // Lista completa dos dias com paginação automática
        analysis.horimetro.peakHours.forEach((day, index) => {
          checkPageSpace(10); // Verificar espaço para cada item
          
          const dateFormatted = new Date(day.date).toLocaleDateString('pt-BR');
          const dayOfWeek = new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'long' });
          
          // Cor baseada na atividade (alta, média, baixa)
          let bgColor = [240, 253, 244]; // Verde claro (baixa atividade)
          let borderColor = [34, 197, 94]; // Verde
          
          if (day.workHours > avgWorkHours * 1.5) {
            bgColor = [254, 242, 242]; // Vermelho claro (alta atividade)
            borderColor = [239, 68, 68]; // Vermelho
          } else if (day.workHours > avgWorkHours) {
            bgColor = [254, 249, 195]; // Amarelo claro (média atividade)
            borderColor = [245, 158, 11]; // Amarelo
          }
          
          drawBox(margin, yPos, contentWidth, 40, bgColor, borderColor);
          
          // Ranking
          doc.setFontSize(12);
          doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
          doc.text(`${index + 1}º`, margin + 15, yPos + 25);
          
          // Data e dia da semana
          doc.setTextColor(60, 60, 60);
          doc.text(`${dateFormatted} (${dayOfWeek})`, margin + 50, yPos + 18);
          
          // Horas trabalhadas (destaque)
          doc.setFontSize(14);
          doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
          doc.text(`${day.workHours.toFixed(1)}h`, margin + 200, yPos + 25);
          
          // Detalhes do horário
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`Início: ${day.minHour.toFixed(1)}h | Fim: ${day.maxHour.toFixed(1)}h`, margin + 280, yPos + 18);
          
          // Percentual em relação à média
          const percentVsAvg = ((day.workHours / avgWorkHours) * 100).toFixed(0);
          let statusText = '';
          if (day.workHours > avgWorkHours * 1.5) {
            statusText = `${percentVsAvg}% da média (ALTA)`;
          } else if (day.workHours > avgWorkHours) {
            statusText = `${percentVsAvg}% da média (MÉDIA)`;
          } else {
            statusText = `${percentVsAvg}% da média (BAIXA)`;
          }
          doc.text(statusText, margin + 280, yPos + 32);
          
          yPos += 50;
        });

        // Estatísticas adicionais do período
        yPos += 20;
        checkPageSpace(100);
        
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text('ESTATÍSTICAS DO PERÍODO:', margin, yPos);
        yPos += 25;
        
        const maxWorkDay = analysis.horimetro.peakHours[0];
        const minWorkDay = analysis.horimetro.peakHours[analysis.horimetro.peakHours.length - 1];
        
        const stats = [
          `Dia de maior atividade: ${new Date(maxWorkDay.date).toLocaleDateString('pt-BR')} (${maxWorkDay.workHours.toFixed(1)}h)`,
          `Dia de menor atividade: ${new Date(minWorkDay.date).toLocaleDateString('pt-BR')} (${minWorkDay.workHours.toFixed(1)}h)`,
          `Variação entre maior e menor: ${(maxWorkDay.workHours - minWorkDay.workHours).toFixed(1)}h`,
          `Horímetro inicial do período: ${analysis.horimetro.periodMin.toFixed(1)}h`,
          `Horímetro final do período: ${analysis.horimetro.periodMax.toFixed(1)}h`,
          `Total acumulado no período: ${analysis.horimetro.totalPeriodHours.toFixed(1)}h`,
          `Total de dias no período: ${analysis.horimetro.totalDaysInPeriod || 0}`,
          `Dias com máquina parada: ${analysis.horimetro.stoppedDays?.length || 0}`
        ];
        
        stats.forEach((stat, index) => {
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`• ${stat}`, margin + 20, yPos);
          yPos += 18;
        });

        // === SEÇÃO ESPECÍFICA PARA DIAS COM MÁQUINA PARADA ===
        if (analysis.horimetro.stoppedDays && analysis.horimetro.stoppedDays.length > 0) {
          yPos += 20;
          checkPageSpace(150);
          
          doc.setFontSize(14);
          doc.setTextColor(239, 68, 68); // Vermelho para destacar
          doc.text('DIAS COM MÁQUINA PARADA:', margin, yPos);
          yPos += 25;
          
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          doc.text(`Identificados ${analysis.horimetro.stoppedDays.length} dia(s) sem atividade significativa:`, margin, yPos);
          yPos += 25;

          // Listar cada dia parado
          analysis.horimetro.stoppedDays.forEach((stoppedDay, index) => {
            checkPageSpace(40);
            
            const dateFormatted = new Date(stoppedDay.date).toLocaleDateString('pt-BR');
            const dayOfWeek = new Date(stoppedDay.date).toLocaleDateString('pt-BR', { weekday: 'long' });
            
            // Box vermelho para dias parados
            drawBox(margin, yPos, contentWidth, 35, [254, 242, 242], [239, 68, 68]);
            
            // Número sequencial
            doc.setFontSize(12);
            doc.setTextColor(239, 68, 68);
            doc.text(`${index + 1}º`, margin + 15, yPos + 22);
            
            // Data e dia da semana
            doc.setTextColor(60, 60, 60);
            doc.text(`${dateFormatted} (${dayOfWeek})`, margin + 50, yPos + 22);
            
            // Motivo da parada
            doc.setFontSize(10);
            doc.setTextColor(120, 120, 120);
            let reasonText = stoppedDay.reason;
            if (stoppedDay.workHours) {
              reasonText += ` (${stoppedDay.workHours}h trabalhadas)`;
            }
            doc.text(reasonText, margin + 250, yPos + 22);
            
            yPos += 40;
          });
          
          // Resumo dos dias parados
          yPos += 10;
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          const percentStopped = ((analysis.horimetro.stoppedDays.length / analysis.horimetro.totalDaysInPeriod) * 100).toFixed(1);
          doc.text(`Percentual de dias parados: ${percentStopped}% do período analisado`, margin + 20, yPos);
        }
      }

      // === ANÁLISE DE IMPACTOS ===
      yPos += 40;
      if (analysis.impact.totalImpacts > 0) {
        
        
        doc.setFontSize(16);
        doc.setTextColor(239, 68, 68);
        doc.text('ANÁLISE COMPLETA DE IMPACTOS', margin, yPos);
        yPos += 30;

        // === GRÁFICO DE IMPACTOS ===
        checkPageSpace(250);
        
        const impactChartData = prepareImpactChartData();
        if (impactChartData.length > 0) {
          // Título do gráfico
          doc.setFontSize(12);
          doc.setTextColor(60, 60, 60);
          doc.text('Evolução dos Impactos no Período:', margin, yPos);
          yPos += 25;
          
          // Dimensões do gráfico melhoradas
          const chartWidth = contentWidth - 20;
          const chartHeight = 180;
          const chartStartX = margin + 10;
          const chartStartY = yPos;
          const leftMargin = 50;
          const bottomMargin = 40;
          const plotWidth = chartWidth - leftMargin - 20;
          const plotHeight = chartHeight - bottomMargin - 10;
          
          // Background do gráfico
          drawBox(chartStartX, chartStartY, chartWidth, chartHeight, [255, 252, 252], [220, 180, 180]);
          
          // Calcular valores para o gráfico
          const impactValues = impactChartData.map(item => item.impacto);
          const minValue = Math.min(...impactValues);
          const maxValue = Math.max(...impactValues);
          const valueRange = maxValue - minValue;
          
          // Adicionar margem nos valores para melhor visualização
          const valuePadding = valueRange * 0.1;
          const adjustedMin = Math.max(0, minValue - valuePadding);
          const adjustedMax = maxValue + valuePadding;
          const adjustedRange = adjustedMax - adjustedMin;
          
          // Grid e eixos
          doc.setDrawColor(200, 180, 180);
          doc.setLineWidth(0.5);
          
          // Grid horizontal
          for (let i = 0; i <= 5; i++) {
            const gridY = chartStartY + 10 + (plotHeight * i / 5);
            doc.line(chartStartX + leftMargin, gridY, chartStartX + leftMargin + plotWidth, gridY);
            
            // Labels do eixo Y
            const labelValue = adjustedMax - (adjustedRange * i / 5);
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text(`${labelValue.toFixed(2)}`, chartStartX + leftMargin - 35, gridY + 3);
          }
          
          // Grid vertical
          const maxGridLines = Math.min(8, impactChartData.length);
          for (let i = 0; i <= maxGridLines; i++) {
            const gridX = chartStartX + leftMargin + (plotWidth * i / maxGridLines);
            doc.setDrawColor(230, 210, 210);
            doc.line(gridX, chartStartY + 10, gridX, chartStartY + 10 + plotHeight);
            
            // Labels do eixo X
            if (i < impactChartData.length) {
              const dataIndex = Math.floor((impactChartData.length - 1) * i / maxGridLines);
              const dataItem = impactChartData[dataIndex];
              if (dataItem) {
                doc.setFontSize(8);
                doc.setTextColor(80, 80, 80);
                const date = new Date(dataItem.timestamp);
                const dateLabel = date.toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit'
                });
                const timeLabel = date.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                });
                
                doc.text(dateLabel, gridX - 15, chartStartY + chartHeight - 25);
                doc.setFontSize(7);
                doc.setTextColor(120, 120, 120);
                doc.text(timeLabel, gridX - 15, chartStartY + chartHeight - 12);
              }
            }
          }
          
          // Eixos principais
          doc.setDrawColor(100, 100, 100);
          doc.setLineWidth(1);
          doc.line(chartStartX + leftMargin, chartStartY + 10, chartStartX + leftMargin, chartStartY + 10 + plotHeight);
          doc.line(chartStartX + leftMargin, chartStartY + 10 + plotHeight, chartStartX + leftMargin + plotWidth, chartStartY + 10 + plotHeight);
          
          // Linha do gráfico
          doc.setDrawColor(239, 68, 68);
          doc.setLineWidth(3);
          
          for (let i = 0; i < impactChartData.length - 1; i++) {
            const currentItem = impactChartData[i];
            const nextItem = impactChartData[i + 1];
            
            const currentX = chartStartX + leftMargin + (plotWidth * i / Math.max(1, impactChartData.length - 1));
            const nextX = chartStartX + leftMargin + (plotWidth * (i + 1) / Math.max(1, impactChartData.length - 1));
            
            const currentY = chartStartY + 10 + plotHeight - (plotHeight * (currentItem.impacto - adjustedMin) / adjustedRange);
            const nextY = chartStartY + 10 + plotHeight - (plotHeight * (nextItem.impacto - adjustedMin) / adjustedRange);
            
            doc.line(currentX, currentY, nextX, nextY);
            
            // Pontos no gráfico
            doc.setFillColor(255, 255, 255);
            doc.circle(currentX, currentY, 3, 'F');
            doc.setDrawColor(239, 68, 68);
            doc.setLineWidth(2);
            doc.circle(currentX, currentY, 3);
          }
          
          // Último ponto
          if (impactChartData.length > 0) {
            const lastItem = impactChartData[impactChartData.length - 1];
            const lastX = chartStartX + leftMargin + plotWidth;
            const lastY = chartStartY + 10 + plotHeight - (plotHeight * (lastItem.impacto - adjustedMin) / adjustedRange);
            doc.setFillColor(255, 255, 255);
            doc.circle(lastX, lastY, 3, 'F');
            doc.setDrawColor(239, 68, 68);
            doc.setLineWidth(2);
            doc.circle(lastX, lastY, 3);
          }
          
          // Título do eixo Y
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          doc.text('Impacto', chartStartX + 5, chartStartY - 5);
          
          yPos += chartHeight + 30;
        }
        // Estatísticas detalhadas de impacto
        yPos += 30;
        checkPageSpace(200);
        
        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68);
        doc.text('ESTATÍSTICAS DETALHADAS DE IMPACTO', margin, yPos);
        yPos += 25;

        // Cards com estatísticas principais - linha 1
        const impactStats1 = [
          { label: 'Total de Impactos', value: analysis.impact.totalImpacts.toString(), color: [239, 68, 68] },
          { label: 'Impacto Médio', value: `${analysis.impact.avgImpact.toFixed(2)}G`, color: [239, 68, 68] },
          { label: 'Impacto Máximo', value: `${analysis.impact.maxImpact.toFixed(2)}G`, color: [239, 68, 68] }
        ];

        // Cards da primeira linha
        impactStats1.forEach((stat, index) => {
          const cardX = margin + (contentWidth / 3) * index + (index > 0 ? 10 * index : 0);
          const cardWidth = contentWidth / 3 - 10;
          
          // Card background
          drawBox(cardX, yPos, cardWidth, 60, [248, 250, 252], stat.color);
          
          // Label
          doc.setFontSize(10);
          doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
          doc.text(stat.label.toUpperCase(), cardX + 15, yPos + 20);
          
          // Value
          doc.setFontSize(16);
          doc.setTextColor(60, 60, 60);
          doc.text(stat.value, cardX + 15, yPos + 45);
        });
        
        yPos += 80;

        // Cards da segunda linha
        const impactStats2 = [
          { label: 'Desvio Padrão', value: `${analysis.impact.standardDeviation.toFixed(2)}G`, color: [239, 68, 68] },
          { label: 'Frequência/Hora', value: `${analysis.impact.impactFrequency.toFixed(1)}`, color: [239, 68, 68] }
        ];

        // Cards da segunda linha (alinhados à esquerda igual à primeira linha)
        impactStats2.forEach((stat, index) => {
          const cardX = margin + (contentWidth / 3) * index + (index > 0 ? 10 * index : 0);
          const cardWidth = contentWidth / 3 - 10;
          
          // Card background
          drawBox(cardX, yPos, cardWidth, 60, [248, 250, 252], stat.color);
          
          // Label
          doc.setFontSize(10);
          doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
          doc.text(stat.label.toUpperCase(), cardX + 15, yPos + 20);
          
          // Value
          doc.setFontSize(16);
          doc.setTextColor(60, 60, 60);
          doc.text(stat.value, cardX + 15, yPos + 45);
        });
        
        yPos += 100;

        // === DISTRIBUIÇÃO POR ZONAS DE INTENSIDADE ===
        checkPageSpace(150);
        doc.setFontSize(13);
        doc.setTextColor(239, 68, 68);
        doc.text('DISTRIBUIÇÃO POR INTENSIDADE', margin, yPos);
        yPos += 25;

        const zones = [
          { name: 'CRÍTICOS', data: analysis.impact.impactIntensityZones.critical, color: [220, 38, 38] },
          { name: 'ALTOS', data: analysis.impact.impactIntensityZones.high, color: [239, 68, 68] },
          { name: 'MÉDIOS', data: analysis.impact.impactIntensityZones.medium, color: [245, 158, 11] },
          { name: 'BAIXOS', data: analysis.impact.impactIntensityZones.low, color: [34, 197, 94] }
        ];

        zones.forEach((zone, index) => {
          const zoneY = yPos + (index * 25);
          const barWidth = Math.max(10, (zone.data.percentage / 100) * (contentWidth - 200));
          
          // Barra de porcentagem
          drawBox(margin + 120, zoneY, barWidth, 18, zone.color, zone.color);
          
          // Labels
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`${zone.name}:`, margin, zoneY + 12);
          doc.text(`${zone.data.count} (${zone.data.percentage.toFixed(1)}%)`, margin + 330, zoneY + 12);
          doc.text(`> ${zone.data.threshold.toFixed(2)}G`, margin + 430, zoneY + 12);
        });

        yPos += 120;

        // === IMPACTOS CRÍTICOS DETALHADOS ===
        if (analysis.impact.criticalImpacts.length > 0) {
          checkPageSpace(100);
          doc.setFontSize(13);
          doc.setTextColor(220, 38, 38);
          doc.text('IMPACTOS CRÍTICOS (MAIS SEVEROS)', margin, yPos);
          yPos += 25;

          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`Impactos acima de ${analysis.impact.impactIntensityZones.critical.threshold.toFixed(2)}G (${analysis.impact.criticalImpacts.length} eventos):`, margin, yPos);
          yPos += 20;

          analysis.impact.criticalImpacts.slice(0, 8).forEach((impact, index) => {
            checkPageSpace(25);
            
            // Box destacado para impactos críticos
            drawBox(margin, yPos, contentWidth, 20, [254, 242, 242], [220, 38, 38]);
            
            doc.setFontSize(9);
            doc.setTextColor(220, 38, 38);
            doc.text(`${index + 1}º`, margin + 10, yPos + 13);
            
            doc.setTextColor(60, 60, 60);
            doc.text(impact.fullDate, margin + 40, yPos + 13);
            
            // Intensidade destacada
            doc.setFontSize(11);
            doc.setTextColor(220, 38, 38);
            doc.text(`${impact.impacto.toFixed(2)}G`, margin + 350, yPos + 13);
            
            // Nível de criticidade
            const criticalLevel = (impact.impacto / analysis.impact.maxImpact * 100);
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(`${criticalLevel.toFixed(0)}% do máximo`, margin + 420, yPos + 13);
            
            yPos += 25;
          });
        }

        // === SEQUÊNCIAS DE IMPACTOS CONSECUTIVOS ===
        if (analysis.impact.consecutiveImpacts.length > 0) {
          yPos += 20;
          checkPageSpace(100);
          
          doc.setFontSize(13);
          doc.setTextColor(239, 68, 68);
          doc.text('SEQUÊNCIAS DE IMPACTOS CONSECUTIVOS', margin, yPos);
          yPos += 25;
          
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`Sequências de 3+ impactos em até 30 minutos (${analysis.impact.consecutiveImpacts.length} sequências):`, margin, yPos);
          yPos += 20;

          analysis.impact.consecutiveImpacts.slice(0, 5).forEach((sequence, index) => {
            checkPageSpace(35);
            
            const startTime = new Date(sequence.startTime);
            const endTime = new Date(sequence.endTime);
            const duration = Math.round((endTime - startTime) / (1000 * 60)); // em minutos
            
            // Box para sequências
            drawBox(margin, yPos, contentWidth, 30, [254, 249, 195], [245, 158, 11]);
            
            doc.setFontSize(10);
            doc.setTextColor(245, 158, 11);
            doc.text(`SEQUÊNCIA ${index + 1}`, margin + 10, yPos + 15);
            
            doc.setTextColor(60, 60, 60);
            doc.text(`${sequence.count} impactos em ${duration} min`, margin + 90, yPos + 15);
            doc.text(`Início: ${startTime.toLocaleString('pt-BR')}`, margin + 200, yPos + 15);
            
            // Estatísticas da sequência
            doc.setFontSize(9);
            doc.text(`Máx: ${sequence.maxIntensity.toFixed(2)}G`, margin + 400, yPos + 10);
            doc.text(`Méd: ${sequence.avgIntensity.toFixed(2)}G`, margin + 400, yPos + 22);
            
            yPos += 35;
          });
        }

        // === PERÍODOS DE PICO DE IMPACTOS ===
        if (analysis.impact.peakImpactPeriods.length > 0) {
          yPos += 20;
          checkPageSpace(120);
          
          doc.setFontSize(13);
          doc.setTextColor(239, 68, 68);
          doc.text('PERÍODOS COM MAIS IMPACTOS', margin, yPos);
          yPos += 25;
          
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text('Dias ordenados por maior quantidade de impactos:', margin, yPos);
          yPos += 20;

          analysis.impact.peakImpactPeriods.forEach((period, index) => {
            checkPageSpace(25);
            
            const dateFormatted = new Date(period.date).toLocaleDateString('pt-BR');
            const dayOfWeek = new Date(period.date).toLocaleDateString('pt-BR', { weekday: 'long' });
            
            // Cor baseada na quantidade de impactos
            let boxColor = [240, 253, 244]; // Verde claro
            let borderColor = [34, 197, 94]; // Verde
            
            if (period.count > analysis.impact.totalImpacts / analysis.impact.peakImpactPeriods.length * 2) {
              boxColor = [254, 242, 242]; // Vermelho claro
              borderColor = [239, 68, 68]; // Vermelho
            } else if (period.count > analysis.impact.totalImpacts / analysis.impact.peakImpactPeriods.length * 1.5) {
              boxColor = [254, 249, 195]; // Amarelo claro
              borderColor = [245, 158, 11]; // Amarelo
            }
            
            drawBox(margin, yPos, contentWidth, 20, boxColor, borderColor);
            
            doc.setFontSize(10);
            doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
            doc.text(`${index + 1}º`, margin + 10, yPos + 13);
            
            doc.setTextColor(60, 60, 60);
            doc.text(`${dateFormatted} (${dayOfWeek})`, margin + 40, yPos + 13);
            doc.text(`${period.count} impactos`, margin + 200, yPos + 13);
            
            doc.setFontSize(9);
            doc.text(`Máx: ${period.maxIntensity.toFixed(2)}G`, margin + 300, yPos + 13);
            doc.text(`Méd: ${period.avgIntensity.toFixed(2)}G`, margin + 370, yPos + 13);
            
            // Percentual do dia em relação ao total
            const percentOfTotal = (period.count / analysis.impact.totalImpacts * 100);
            doc.text(`${percentOfTotal.toFixed(1)}% do total`, margin + 440, yPos + 13);
            
            yPos += 25;
          });
        }

        // === DISTRIBUIÇÃO HORÁRIA DE IMPACTOS ===
        yPos += 20;
        checkPageSpace(100);
        
        doc.setFontSize(13);
        doc.setTextColor(239, 68, 68);
        doc.text('DISTRIBUIÇÃO POR HORÁRIO DO DIA', margin, yPos);
        yPos += 25;
        
        if (Object.keys(analysis.impact.hourlyDistribution).length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text('Horários com maior concentração de impactos:', margin, yPos);
          yPos += 20;
          
          // Encontrar os horários com mais impactos
          const hourlyData = Object.entries(analysis.impact.hourlyDistribution)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
          
          // Gráfico de barras horizontal simples para distribuição horária
          const maxHourlyCount = Math.max(...hourlyData.map(h => h.count));
          
          hourlyData.forEach((hourData, index) => {
            checkPageSpace(15);
            
            const barWidth = Math.max(5, (hourData.count / maxHourlyCount) * 200);
            const hourLabel = `${hourData.hour.toString().padStart(2, '0')}:00`;
            
            // Barra
            drawBox(margin + 80, yPos, barWidth, 12, [239, 68, 68], [239, 68, 68]);
            
            // Labels
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(hourLabel, margin + 10, yPos + 8);
            doc.text(`${hourData.count} impactos`, margin + 300, yPos + 8);
            doc.text(`(${(hourData.count / analysis.impact.totalImpacts * 100).toFixed(1)}%)`, margin + 380, yPos + 8);
            
            yPos += 17;
          });
        }

        // === RESUMO FINAL DE IMPACTOS ===
        yPos += 30;
        checkPageSpace(120);
        
        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68);
        doc.text('RESUMO EXECUTIVO - IMPACTOS', margin, yPos);
        yPos += 25;
        
        const impactSummary = [
          `Total de eventos de impacto registrados: ${analysis.impact.totalImpacts}`,
          `Frequência média: ${analysis.impact.impactFrequency.toFixed(2)} impactos por hora`,
          `Intensidade média: ${analysis.impact.avgImpact.toFixed(2)}G (desvio: ±${analysis.impact.standardDeviation.toFixed(2)}G)`,
          `Eventos críticos (>${analysis.impact.impactIntensityZones.critical.threshold.toFixed(2)}G): ${analysis.impact.criticalImpacts.length} (${analysis.impact.impactIntensityZones.critical.percentage.toFixed(1)}%)`,
          `Eventos altos (>${analysis.impact.impactIntensityZones.high.threshold.toFixed(2)}G): ${analysis.impact.severeImpacts.length} (${analysis.impact.impactIntensityZones.high.percentage.toFixed(1)}%)`,
          `Sequências consecutivas detectadas: ${analysis.impact.consecutiveImpacts.length}`,
          `Dia com mais impactos: ${analysis.impact.peakImpactPeriods.length > 0 ? 
            `${new Date(analysis.impact.peakImpactPeriods[0].date).toLocaleDateString('pt-BR')} (${analysis.impact.peakImpactPeriods[0].count} eventos)` : 'N/A'}`,
          `Impacto mais severo registrado: ${analysis.impact.maxImpact.toFixed(2)}G em ${analysis.impact.criticalImpacts.length > 0 ? 
            new Date(analysis.impact.criticalImpacts[0].timestamp).toLocaleString('pt-BR') : 'N/A'}`
        ];
        
        impactSummary.forEach((summary, index) => {
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`• ${summary}`, margin + 10, yPos);
          yPos += 15;
        });

        // Se houver muitos impactos críticos, adicionar recomendação
        if (analysis.impact.criticalImpacts.length > analysis.impact.totalImpacts * 0.1) {
          yPos += 10;
          drawBox(margin, yPos, contentWidth, 40, [254, 242, 242], [239, 68, 68]);
          
          doc.setFontSize(11);
          doc.setTextColor(239, 68, 68);
          doc.text('⚠️  ATENÇÃO: Alto número de impactos críticos detectados!', margin + 15, yPos + 15);
          
          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`${analysis.impact.criticalImpacts.length} eventos críticos representam ${analysis.impact.impactIntensityZones.critical.percentage.toFixed(1)}% do total.`, margin + 15, yPos + 30);
          doc.text('Recomenda-se investigação técnica detalhada e possível manutenção preventiva.', margin + 15, yPos + 42);
          
          yPos += 50;
        }

        // Análise de impactos severos existente (manter compatibilidade)
        if (analysis.impact.highImpacts.length > 0) {
          yPos += 20;
          checkPageSpace(100);
          
          doc.setFontSize(13);
          doc.setTextColor(239, 68, 68);
          doc.text('EVENTOS DE ALTO IMPACTO (COMPATIBILIDADE)', margin, yPos);
          yPos += 25;

          doc.setFontSize(10);
          doc.setTextColor(60, 60, 60);
          doc.text(`Eventos de impacto acima do limiar (${(analysis.impact.avgImpact * 1.5).toFixed(2)}G):`, margin, yPos);
          yPos += 20;

          analysis.impact.highImpacts.slice(0, 5).forEach((impact, index) => {
            checkPageSpace(25);
            
            drawBox(margin, yPos, contentWidth, 20, [254, 242, 242], [239, 68, 68]);
            
            doc.setFontSize(10);
            doc.setTextColor(239, 68, 68);
            doc.text(`${index + 1}º`, margin + 15, yPos + 13);
            
            doc.setTextColor(60, 60, 60);
            doc.text(impact.fullDate, margin + 50, yPos + 13);
            
            doc.setFontSize(12);
            doc.setTextColor(239, 68, 68);
            doc.text(`${impact.impacto.toFixed(2)}G`, margin + 350, yPos + 13);
            
            yPos += 25;
          });
        }
      }

      // === REGISTROS DETALHADOS ===
      addNewPage();
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text('REGISTROS DETALHADOS', margin, yPos);
      yPos += 20;
      
      // Nota explicativa sobre a tabela
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Tabela otimizada com as informações mais relevantes dos registros de telemetria:', margin, yPos);
      yPos += 15;
      
      doc.setFontSize(8);
      doc.text('• Data/Hora: Data e horário do registro (formato dd/mm/aaaa hh:mm)', margin + 10, yPos);
      yPos += 12;
      doc.text('• GPS: Coordenadas de latitude e longitude do equipamento', margin + 10, yPos);
      yPos += 12;
      doc.text('• Vel: Velocidade do equipamento em km/h', margin + 10, yPos);
      yPos += 12;
      doc.text('• Horímetro: Tempo de operação acumulado convertido para horas', margin + 10, yPos);
      yPos += 12;
      doc.text('• Atributos: IOs, sensores e outros dados de telemetria disponíveis', margin + 10, yPos);
      yPos += 20;

      // Tabela otimizada - sem ID e sem Impacto (N/A), com quebra de linha em Data/Hora
      const headers = ['Data/Hora', 'GPS (Lat/Lng)', 'Vel', 'Horímetro', 'Atributos Principais'];
      const columnWidths = [75, 85, 35, 55, 265]; // Total: 515pt (cabe em A4)
      let tableX = margin;

      // Verificar se a tabela cabe na largura da página
      const totalTableWidth = columnWidths.reduce((sum, width) => sum + width, 0);
      console.log(`Largura total da tabela: ${totalTableWidth}pt, Largura disponível: ${contentWidth}pt`);

      // Desenhar cabeçalho
      headers.forEach((header, index) => {
        drawBox(tableX, yPos, columnWidths[index], 25, [41, 128, 185]);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(header, tableX + 3, yPos + 15);
        tableX += columnWidths[index];
      });
      yPos += 25;

      // Registros (limitados para performance)
      const recordsToShow = Math.min(reportData.length, 100); // Aumentar para 100 registros
      doc.setFontSize(7);

      for (let i = 0; i < recordsToShow; i++) {
        checkPageSpace(22); // Aumentar espaço para linhas maiores
        const position = reportData[i];
        let attrs = position.attributes;
        
        if (typeof attrs === 'string') {
          try { attrs = JSON.parse(attrs); } catch {}
        }

        // Preparar dados otimizados para as novas colunas
        const gpsCoords = (position.latitude && position.longitude) ? 
          `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : 'GPS indisponível';
        
        // Horímetro em horas (converter de minutos se necessário)
        const horimetroValue = attrs?.io18 ? `${(attrs.io18 / 60).toFixed(1)}h` : 'N/A';
        
        // Data/Hora com quebra de linha (data na primeira linha, hora na segunda)
        const dateTime = formatDate(position.devicetime || position.servertime);
        const [datePart, timePart] = dateTime.includes(' ') ? dateTime.split(' ') : [dateTime, ''];
        
        // Atributos principais expandidos e organizados
        const mainAttributes = (() => {
          const attrs_list = [];
          
          // Dados operacionais principais
          if (attrs?.type) attrs_list.push(`Evento: ${attrs.type}`);
          if (attrs?.battery) attrs_list.push(`Bateria: ${attrs.battery}%`);
          if (attrs?.temp || attrs?.temperature) attrs_list.push(`Temp: ${attrs.temp || attrs.temperature}°C`);
          if (attrs?.fuel) attrs_list.push(`Combustível: ${attrs.fuel}%`);
          
          // IOs mais importantes
          const ioData = [];
          if (attrs?.io1 !== undefined) ioData.push(`IO1: ${attrs.io1}`);
          if (attrs?.io16 !== undefined) ioData.push(`IO16: ${attrs.io16}`);
          if (attrs?.io17 !== undefined) ioData.push(`IO17: ${attrs.io17}`);
          if (attrs?.io19 !== undefined) ioData.push(`IO19: ${attrs.io19}`);
          if (attrs?.io20 !== undefined) ioData.push(`IO20: ${attrs.io20}`);
          
          if (ioData.length > 0) attrs_list.push(`IOs: ${ioData.join(', ')}`);
          
          // Outros dados relevantes
          if (attrs?.ignition !== undefined) attrs_list.push(`Ignição: ${attrs.ignition ? 'ON' : 'OFF'}`);
          if (attrs?.alarm !== undefined) attrs_list.push(`Alarme: ${attrs.alarm}`);
          if (attrs?.signal !== undefined) attrs_list.push(`Sinal: ${attrs.signal}%`);
          
          return attrs_list.length > 0 ? attrs_list.join(' | ') : 'Sem atributos adicionais';
        })();

        // Dados da linha otimizada (sem ID e sem Impacto)
        const rowData = [
          { text: datePart, subText: timePart }, // Data/Hora com quebra
          gpsCoords,
          `${(position.speed || 0).toFixed(0)} km/h`,
          horimetroValue,
          mainAttributes
        ];

        // Desenhar linha com zebra striping e altura maior
        tableX = margin;
        const isEvenRow = i % 2 === 0;
        const rowHeight = 22; // Altura maior para acomodar quebra de linha
        
        rowData.forEach((data, colIndex) => {
          // Zebra striping
          if (isEvenRow) {
            drawBox(tableX, yPos, columnWidths[colIndex], rowHeight, [248, 250, 252]);
          } else {
            drawBox(tableX, yPos, columnWidths[colIndex], rowHeight, [255, 255, 255]);
          }
          
          // Cores especiais para algumas colunas
          if (colIndex === 3 && horimetroValue !== 'N/A') {
            // Horímetro em azul
            doc.setTextColor(41, 128, 185);
          } else {
            doc.setTextColor(60, 60, 60);
          }
          
          // Renderizar conteúdo baseado no tipo
          if (colIndex === 0 && typeof data === 'object') {
            // Data/Hora com quebra de linha
            doc.setFontSize(7);
            doc.text(data.text, tableX + 3, yPos + 8); // Data na parte superior
            
            if (data.subText) {
              doc.setFontSize(6);
              doc.setTextColor(100, 100, 100);
              doc.text(data.subText, tableX + 3, yPos + 17); // Hora na parte inferior
            }
          } else if (colIndex === 4) {
            // Atributos principais - fonte menor e quebra se necessário
            doc.setFontSize(6);
            const maxWidth = columnWidths[colIndex] - 6;
            const lines = doc.splitTextToSize(data, maxWidth);
            
            // Limitar a 2 linhas para caber na altura da célula
            const displayLines = lines.slice(0, 2);
            displayLines.forEach((line, lineIndex) => {
              doc.text(line, tableX + 3, yPos + 8 + (lineIndex * 7));
            });
            
            // Se há mais linhas, adicionar "..."
            if (lines.length > 2) {
              doc.text('...', tableX + maxWidth - 10, yPos + 17);
            }
          } else {
            // Outras colunas normalmente
            doc.setFontSize(7);
            doc.text(data, tableX + 3, yPos + 13);
          }
          
          tableX += columnWidths[colIndex];
        });
        
        yPos += rowHeight;
      }

      // Nota se há mais registros
      if (reportData.length > recordsToShow) {
        yPos += 15;
        checkPageSpace(40);
        
        yPos += 25;
        doc.setFontSize(11);
        doc.setTextColor(41, 128, 185);
        doc.text('INFORMAÇÃO ADICIONAL', margin, yPos);
        
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const remainingRecords = reportData.length - recordsToShow;
        doc.text(`Existem mais ${remainingRecords.toLocaleString('pt-BR')} registros não exibidos nesta tabela.`, margin + 15, yPos + 25);
        doc.text(`Total de registros no período: ${reportData.length.toLocaleString('pt-BR')} | Exibidos na tabela: ${recordsToShow}`, margin + 15, yPos + 37);
        
        yPos += 45;
      } else {
        yPos += 15;
        doc.setFontSize(9);
        doc.setTextColor(34, 197, 94);
        doc.text(`✓ Todos os ${reportData.length} registros do período foram exibidos na tabela acima.`, margin, yPos);
        yPos += 20;
      }

      // Legenda da tabela
      yPos += 10;
      checkPageSpace(60);
      
      doc.setFontSize(11);
      doc.setTextColor(41, 128, 185);
      doc.text('LEGENDA DA TABELA:', margin, yPos);
      yPos += 20;
      
      const legendItems = [
        'Data/Hora: Data e horário do registro com quebra de linha (dd/mm/aaaa hh:mm)',
        'GPS: Coordenadas de latitude e longitude em formato decimal',
        'Vel: Velocidade instantânea em km/h no momento do registro',
        'Horímetro: Tempo acumulado de operação em horas (convertido de IO18)',
        'Atributos: IOs digitais, sensores e informações operacionais relevantes'
      ];
      
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      
      legendItems.forEach((item, index) => {
        checkPageSpace(12);
        doc.text(`• ${item}`, margin + 10, yPos);
        yPos += 12;
      });

      // === PÁGINA FINAL ===
      addNewPage(false);
      
      // Background final
      doc.setFillColor(41, 128, 185);
      doc.rect(0, pageHeight - 150, pageWidth, 150, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('RELATÓRIO CONCLUÍDO', pageWidth / 2, pageHeight - 100, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('Sistema SmartLogger - Monitoramento Inteligente', pageWidth / 2, pageHeight - 70, { align: 'center' });
      doc.text('Relatório gerado automaticamente', pageWidth / 2, pageHeight - 50, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, pageHeight - 30, { align: 'center' });

      // Fechar loading e abrir visualização
      loadingSwal.close();
      
      // Gerar PDF como blob para visualização
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Nome do arquivo mais limpo e legível
      const deviceNameClean = selectedDeviceData?.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Equipamento';
      const dateFormatted = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const fileName = `Relatorio_${deviceNameClean}_${dateFormatted}.pdf`;
      
      // Abrir PDF em nova aba com opções de download e impressão
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${fileName}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f8fafc; 
              height: 100vh;
              overflow: hidden;
            }
            iframe { 
              width: 100%; 
              height: 100vh; 
              border: none;
            }
            .loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: #666;
              font-size: 16px;
              z-index: 10;
              text-align: center;
            }
            .loading h3 {
              margin-bottom: 8px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="loading" id="loading">
            <h3>📄 ${fileName}</h3>
            <p>Carregando relatório...</p>
          </div>
          <iframe 
            id="pdfFrame"
            src="${pdfUrl}"
            style="display: none;"
            onload="showPDF()"
            title="Relatório - ${selectedDeviceData?.name || 'Equipamento'}">
          </iframe>
          
          <script>
            const fileName = '${fileName}';
            const pdfUrl = '${pdfUrl}';
            
            function showPDF() {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('pdfFrame').style.display = 'block';
            }
            
            // Cleanup quando a janela for fechada
            window.addEventListener('beforeunload', () => {
              URL.revokeObjectURL(pdfUrl);
            });
          </script>
        </body>
        </html>
      `);

      // Sucesso
      Swal.fire({
        title: 'Relatório Gerado!',
        text: 'O relatório profissional foi gerado com sucesso.',
        icon: 'success',
        confirmButtonText: 'Entendi',
        confirmButtonColor: isDarkMode ? '#3b82f6' : '#2563eb',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });

    } catch (error) {
      loadingSwal.close();
      console.error('Erro ao gerar PDF:', error);
      Swal.fire({
        title: 'Erro ao Gerar Relatório',
        text: 'Ocorreu um erro ao gerar o PDF. Tente novamente.',
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: isDarkMode ? '#dc2626' : '#ef4444',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#111827'
      });
    }
  };

  // Função para determinar status visual
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'moving': return 'text-blue-500';
      default: return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  if (loading) {
    return <LoadPage />;
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900' : 'bg-red-100'}`}> 
              <FaFileAlt className={`text-xl ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                Erro ao Carregar Relatórios
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 truncate`}>
                Houve um problema ao carregar os dados dos equipamentos
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
            <div className="p-12 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Erro ao carregar dados
              </h3>
              <p className={`text-red-500 mb-4`}>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                  isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                } text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      {/* Header inspirado no EquipmentEdit */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}> 
            <FaFileAlt className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
              Relatórios de Equipamentos
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 truncate`}>
              Selecione o equipamento e período para gerar relatórios detalhados
            </p>
          </div>
        </div>
      </div>

      {/* Configuração do Relatório */}
      <div className="max-w-6xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden mb-6`}>
          {/* Header do Card */}
          <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <FaFilter className={`text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Configuração do Relatório
              </h2>
            </div>
          </div>

          {/* Formulário de Configuração */}
          <div className="p-4">
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); processReport(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seletor de Equipamento */}
                <div className="space-y-1">
                  <label htmlFor="device-select" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FaChartBar className="text-xs" />
                    Equipamento <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="device-select"
                    value={selectedDevice} 
                    onChange={handleDeviceSelect}
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm`}
                  >
                    <option value="">Selecione um equipamento</option>
                    {[...devices].sort((a, b) => a.name.localeCompare(b.name)).map((device) => (
                      <option key={device.id} value={device.name}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seletor de Período */}
                <div className="space-y-1">
                  <label htmlFor="period-select" className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <FaCalendarAlt className="text-xs" />
                    Período <span className="text-red-500">*</span>
                  </label>
                  <select 
                    id="period-select"
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm`}
                  >
                    <option value="">Selecione um período</option>
                    <option value="hoje">Hoje</option>
                    <option value="ontem">Ontem</option>
                    <option value="7">Últimos 7 dias</option>
                    <option value="15">Últimos 15 dias</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="custom">Período personalizado</option>
                  </select>
                </div>
              </div>

              {/* Datas Personalizadas */}
              {selectedPeriod === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-opacity-50 border border-dashed border-gray-300 dark:border-gray-600">
                  <div className="space-y-1">
                    <label htmlFor="start-date" className={`flex items-center gap-1 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Data Início <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="start-date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="end-date" className={`flex items-center gap-1 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Data Final <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="end-date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm`}
                    />
                  </div>
                </div>
              )}

              {/* Botão de Processar */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!selectedDeviceId || !selectedPeriod || loadingPositions}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-200 ${
                    (!selectedDeviceId || !selectedPeriod || loadingPositions)
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : `${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} hover:shadow-lg`
                  } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium`}
                >
                  {loadingPositions ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <FaTable className="text-sm" />
                      Processar Dados
                    </>
                  )}
                </button>

                {/* Botão de Exportar PDF */}
                {reportData.length > 0 && (
                  <button
                    onClick={exportPDF}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-200 ${
                      isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                    } text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium`}
                    title="Exportar relatório profissional em PDF"
                  >
                    <FaFileAlt className="text-sm" />
                    Exportar PDF
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Informação quando não há dispositivos */}
          {devices.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-5xl mb-3">📭</div>
              <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Nenhum equipamento encontrado
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                Não há equipamentos disponíveis para gerar relatórios
              </p>
            </div>
          )}
        </div>

        {/* Mostrar erro se houver */}
        {error && (
          <div className={`${isDarkMode ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'} border rounded-xl p-4 mb-6`}>
            <div className="flex items-center gap-3">
              <div className="text-red-500 text-xl">⚠️</div>
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                  Erro no processamento
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}


        {/* Gráfico Horímetro (IO18) */}
        {reportData.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden mb-6`}>
            {/* Header do Gráfico */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-2">
                  <FaChartBar className={`text-lg ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Horímetro
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    horas
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
                    {prepareIO18ChartData().length} pontos
                  </div>
                  {(() => {
                    const data = prepareIO18ChartData();
                    if (data.length > 0) {
                      const values = data.map(item => item.horimetro);
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
                      const horasRodadas = (max - min).toFixed(1); // Diferença entre max e min
                      
                      return (
                        <>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-green-200' : 'bg-green-100 text-green-800'}`}>
                            Min: {min}h
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-red-200' : 'bg-red-100 text-red-800'}`}>
                            Max: {max}h
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            Média: {avg}h
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-orange-200' : 'bg-orange-100 text-orange-800'}`}>
                            total de horas rodadas no periodo: {horasRodadas}h
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* Conteúdo do Gráfico */}
            <div className="p-6">
              {prepareIO18ChartData().length > 0 ? (
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <LineChart 
                      data={[...prepareIO18ChartData()].reverse()} // Inverter dados para eixo X reverso
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={isDarkMode ? '#374151' : '#d1d5db'} 
                        strokeWidth={1}
                      />
                      <XAxis 
                        dataKey="date" 
                        stroke={isDarkMode ? '#9ca3af' : '#4b5563'}
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        type="category"
                        scale="auto"
                        reversed={true} // Inverter eixo X
                      />
                      <YAxis 
                        stroke={isDarkMode ? '#9ca3af' : '#4b5563'}
                        fontSize={12}
                        domain={getChartDomains().yDomain}
                        type="number"
                        scale="linear"
                        tickCount={8}
                        label={{ 
                          value: 'Horas', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#4b5563' }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                          borderRadius: '8px',
                          color: isDarkMode ? '#f9fafb' : '#111827',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{
                          color: isDarkMode ? '#f9fafb' : '#111827',
                          fontWeight: 'bold'
                        }}
                        formatter={(value, name, props) => [
                          `${value} horas`,
                          'Horímetro'
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return `${data.fullDate || label}`;
                          }
                          return label;
                        }}
                        cursor={{ stroke: isDarkMode ? '#8b5cf6' : '#7c3aed', strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="horimetro" 
                        stroke={isDarkMode ? '#8b5cf6' : '#7c3aed'}
                        strokeWidth={2}
                        dot={{ 
                          fill: isDarkMode ? '#8b5cf6' : '#7c3aed', 
                          strokeWidth: 2, 
                          r: 4,
                          stroke: isDarkMode ? '#a78bfa' : '#8b5cf6'
                        }}
                        activeDot={{ 
                          r: 6, 
                          fill: isDarkMode ? '#a78bfa' : '#8b5cf6',
                          stroke: isDarkMode ? '#c4b5fd' : '#a78bfa',
                          strokeWidth: 2
                        }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⏱️</div>
                  <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Sem Dados de Horímetro
                  </h4>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Não há dados de horímetro (IO18) disponíveis para este período
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gráfico de Impacto */}
        {reportData.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden mb-6`}>
            {/* Header do Gráfico */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-2">
                  <FaChartBar className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Impacto/Vibração
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    unidades
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-red-200' : 'bg-red-100 text-red-800'}`}>
                    {prepareImpactChartData().length} pontos
                  </div>
                  {(() => {
                    const data = prepareImpactChartData();
                    if (data.length > 0) {
                      const values = data.map(item => item.impacto);
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
                      
                      return (
                        <>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-green-200' : 'bg-green-100 text-green-800'}`}>
                            Min: {min}
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-red-200' : 'bg-red-100 text-red-800'}`}>
                            Max: {max}
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            Média: {avg}
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* Conteúdo do Gráfico */}
            <div className="p-6">
              {prepareImpactChartData().length > 0 ? (
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <LineChart 
                      data={[...prepareImpactChartData()].reverse()} // Inverter dados para eixo X reverso
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={isDarkMode ? '#374151' : '#d1d5db'} 
                        strokeWidth={1}
                      />
                      <XAxis 
                        dataKey="date" 
                        stroke={isDarkMode ? '#9ca3af' : '#4b5563'}
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        type="category"
                        scale="auto"
                        reversed={true} // Inverter eixo X
                      />
                      <YAxis 
                        stroke={isDarkMode ? '#9ca3af' : '#4b5563'}
                        fontSize={12}
                        domain={getImpactChartDomains().yDomain}
                        type="number"
                        scale="linear"
                        tickCount={8}
                        label={{ 
                          value: 'Impacto', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#4b5563' }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                          borderRadius: '8px',
                          color: isDarkMode ? '#f9fafb' : '#111827',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{
                          color: isDarkMode ? '#f9fafb' : '#111827',
                          fontWeight: 'bold'
                        }}
                        formatter={(value, name, props) => [
                          `${value}`,
                          'Impacto'
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return `${data.fullDate || label}`;
                          }
                          return label;
                        }}
                        cursor={{ stroke: isDarkMode ? '#ef4444' : '#dc2626', strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="impacto" 
                        stroke={isDarkMode ? '#ef4444' : '#dc2626'}
                        strokeWidth={2}
                        dot={{ 
                          fill: isDarkMode ? '#ef4444' : '#dc2626', 
                          strokeWidth: 2, 
                          r: 4,
                          stroke: isDarkMode ? '#f87171' : '#ef4444'
                        }}
                        activeDot={{ 
                          r: 6, 
                          fill: isDarkMode ? '#f87171' : '#ef4444',
                          stroke: isDarkMode ? '#fca5a5' : '#f87171',
                          strokeWidth: 2
                        }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Sem Dados de Impacto
                  </h4>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Não há dados de impacto/vibração disponíveis para este período
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gráfico de Índice de Utilização */}
        {reportData.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden mb-6`}>
            {/* Header do Gráfico */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-2">
                  <FaChartLine className={`text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Índice de Utilização
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    % eficiência
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-indigo-200' : 'bg-indigo-100 text-indigo-800'}`}>
                    {calculateUtilizationIndex().length} pontos
                  </div>
                  {(() => {
                    const data = calculateUtilizationIndex();
                    if (data.length > 0) {
                      const values = data.map(item => item.utilizacao);
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
                      
                      return (
                        <>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-green-200' : 'bg-green-100 text-green-800'}`}>
                            Min: {min.toFixed(1)}%
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-red-200' : 'bg-red-100 text-red-800'}`}>
                            Max: {max.toFixed(1)}%
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            Média: {avg}%
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* Conteúdo do Gráfico */}
            <div className="p-6">
              {calculateUtilizationIndex().length > 0 ? (
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <LineChart 
                      data={[...calculateUtilizationIndex()].reverse()} // Inverter dados para eixo X reverso
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={isDarkMode ? '#374151' : '#d1d5db'} 
                        strokeWidth={1}
                      />
                      <XAxis 
                        dataKey="date" 
                        stroke={isDarkMode ? '#9ca3af' : '#4b5563'}
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        type="category"
                        scale="auto"
                        reversed={true} // Inverter eixo X
                      />
                      <YAxis 
                        stroke={isDarkMode ? '#9ca3af' : '#4b5563'}
                        fontSize={12}
                        domain={getUtilizationChartDomains().yDomain}
                        type="number"
                        scale="linear"
                        tickCount={6}
                        label={{ 
                          value: 'Utilização (%)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#4b5563' }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#374151' : '#d1d5db'}`,
                          borderRadius: '8px',
                          color: isDarkMode ? '#f9fafb' : '#111827',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelStyle={{
                          color: isDarkMode ? '#f9fafb' : '#111827',
                          fontWeight: 'bold'
                        }}
                        formatter={(value, name, props) => [
                          `${value.toFixed(1)}%`,
                          'Utilização'
                        ]}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return `${data.fullDate || label}`;
                          }
                          return label;
                        }}
                        cursor={{ stroke: isDarkMode ? '#6366f1' : '#4f46e5', strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="utilizacao" 
                        stroke={isDarkMode ? '#6366f1' : '#4f46e5'}
                        strokeWidth={2}
                        dot={{ 
                          fill: isDarkMode ? '#6366f1' : '#4f46e5', 
                          strokeWidth: 2, 
                          r: 4,
                          stroke: isDarkMode ? '#818cf8' : '#6366f1'
                        }}
                        activeDot={{ 
                          r: 6, 
                          fill: isDarkMode ? '#818cf8' : '#6366f1',
                          stroke: isDarkMode ? '#a5b4fc' : '#818cf8',
                          strokeWidth: 2
                        }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📈</div>
                  <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Sem Dados de Utilização
                  </h4>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Não há dados de Horímetro da Viagem (IO19) e Tempo Ocioso (IO20) disponíveis para calcular a utilização
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mapa de Calor */}
        {reportData.length > 0 && validHeatmapPoints.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden mb-6`}>
            {/* Header do Mapa */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className={`text-lg ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Mapa de Calor - Densidade de Atividade
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                    Heatmap
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-orange-200' : 'bg-orange-100 text-orange-800'}`}>
                    {validHeatmapPoints.length} pontos GPS
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    Intensidade: {heatmapIntensity}
                  </div>
                </div>
              </div>
            </div>

            {/* Controles do Mapa de Calor */}
            <div className={`px-6 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r ${isDarkMode ? 'from-gray-800 to-gray-750' : 'from-gray-50 to-gray-100'}`}>
              {/* Linha única com Estilo do Mapa e Alternar Camada */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Estilo do Mapa:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const styles = getMapStyles();
                      return Object.entries(styles).map(([key, style]) => (
                        <button
                          key={key}
                          onClick={() => changeMapStyle(key)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            mapStyle === key
                              ? `${isDarkMode ? 'bg-green-700 text-white' : 'bg-green-600 text-white'} shadow-lg`
                              : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`
                          } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1`}
                          title={style.description}
                        >
                          {style.name}
                        </button>
                      ));
                    })()}
                  </div>
                </div>

                {/* Controle de Toggle na mesma linha */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleHeatmap}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'
                    } text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-sm font-medium`}
                  >
                    <FaInfoCircle className="text-sm" />
                    Alternar Camada
                  </button>
                </div>
              </div>
            </div>

            {/* Container do Mapa */}
            <div className="relative">
              <div 
                ref={mapContainer}
                className="w-full h-[500px] bg-gray-100 dark:bg-gray-700"
                style={{ minHeight: '500px' }}
              />
              
              {/* Overlay de Loading */}
              {!map && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <div className="text-center">
                    <FaSpinner className={`animate-spin text-4xl mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Carregando Mapa de Calor...
                    </h4>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Processando densidade de atividade
                    </p>
                  </div>
                </div>
              )}

              {/* Legenda do Mapa de Calor */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg p-3 shadow-lg`}>
                  <h5 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Densidade de Atividade
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-sm"></div>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Baixa densidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-sm"></div>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Média densidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-3 bg-gradient-to-r from-red-500 to-red-400 rounded-sm"></div>
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Alta densidade</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estatísticas do Mapa */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg p-3 shadow-lg`}>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between gap-4">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total de pontos:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {validHeatmapPoints.length}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Cobertura GPS:</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {((validHeatmapPoints.length / reportData.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando não há pontos GPS válidos */}
        {reportData.length > 0 && validHeatmapPoints.length === 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden mb-6`}>
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Sem Dados GPS para Mapa de Calor
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Não há coordenadas GPS válidas nos registros selecionados para gerar o mapa de calor.
              </p>
              <div className={`inline-flex items-center px-4 py-2 rounded-lg ${isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                <FaInfoCircle className="mr-2" />
                Verifique se o equipamento possui GPS ativo durante o período selecionado
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Resultados do Relatório */}
        {reportData.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
            {/* Header da Tabela */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <FaTable className={`text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Resultados do Relatório
                    </h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                    Equipamento: <span className="font-semibold">{selectedDeviceData?.name || '-'}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-green-200' : 'bg-green-100 text-green-800'}`}>
                    Registros: <span className="font-semibold">{reportData.length}</span>
                  </div>
                </div>
              </div>

              {/* Info do Período */}
              <div className="mt-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  <FaCalendarAlt className="mr-2" />
                  Período: <span className="ml-1 font-semibold">
                    {selectedPeriod === 'custom' ? `${customStartDate} até ${customEndDate}` : `Últimos ${selectedPeriod} dias`}
                  </span>
                </div>
              </div>
            </div>

            {/* Controles da Tabela */}
            <div className={`px-6 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mostrando {Math.min(itemsPerPage, reportData.length - (currentPage - 1) * itemsPerPage)} de {reportData.length} registros
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Seletor de itens por página */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="items-per-page" className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Itens por página:
                    </label>
                    <select
                      id="items-per-page"
                      value={itemsPerPage}
                      onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className={`px-2 py-1 rounded border text-xs ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                    >
                      {[25, 50, 100, 200].filter(opt => opt < reportData.length || opt === 25).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      {reportData.length > 200 && (
                        <option value={reportData.length}>Todos ({reportData.length})</option>
                      )}
                    </select>
                  </div>

                  {/* Paginação ao lado */}
                  {Math.ceil(reportData.length / itemsPerPage) > 1 && (
                    <div className="flex items-center gap-1">
                      <span className={`text-xs mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Página:
                      </span>
                      {Array.from({ length: Math.ceil(reportData.length / itemsPerPage) }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            currentPage === i + 1 
                              ? `${isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'} shadow-sm` 
                              : `${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabela Responsiva */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}> 
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>ID</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Data/Hora Dispositivo</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Data/Hora Servidor</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Mapa</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Velocidade</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Direção</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tipo</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>IO1</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Odômetro gps</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Distância da Viagem</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Horímetro</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Horímetro da Viagem</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tempo Ocioso</th>
                    <th className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Atributos</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((position, index) => (
                      <tr
                        key={position.id || index}
                        className={`border-t transition-colors duration-200 ${
                          isDarkMode 
                            ? 'border-gray-700 hover:bg-gray-700' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {position.id}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(position.devicetime)}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatDate(position.servertime)}
                        </td>
                        <td className={`px-4 py-3`}>
                          <button
                            className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                              isDarkMode 
                                ? 'bg-green-700 hover:bg-green-600 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                            onClick={() => openMapModal(position)}
                            title={`Lat: ${position.latitude?.toFixed(6) || 'N/A'}, Lng: ${position.longitude?.toFixed(6) || 'N/A'}`}
                          >
                           Mapa
                          </button>
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {position.speed ? `${position.speed.toFixed(1)} km/h` : 'N/A'}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {position.course ? `${position.course.toFixed(0)}°` : 'N/A'}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(() => {
                            let attrs = position.attributes;
                            if (typeof attrs === 'string') {
                              try { 
                                attrs = JSON.parse(attrs); 
                              } catch { 
                                return 'N/A'; 
                              }
                            }
                            return attrs?.type || 'N/A';
                          })()}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(() => {
                            let attrs = position.attributes;
                            if (typeof attrs === 'string') {
                              try { 
                                attrs = JSON.parse(attrs); 
                              } catch { 
                                return 'N/A'; 
                              }
                            }
                            return attrs?.io1 ?? 'N/A';
                          })()}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(() => {
                            let attrs = position.attributes;
                            if (typeof attrs === 'string') {
                              try { 
                                attrs = JSON.parse(attrs); 
                              } catch { 
                                return 'N/A'; 
                              }
                            }
                            return attrs?.io16 ?? 'N/A';
                          })()}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(() => {
                            let attrs = position.attributes;
                            if (typeof attrs === 'string') {
                              try { 
                                attrs = JSON.parse(attrs); 
                              } catch { 
                                return 'N/A'; 
                              }
                            }
                            return attrs?.io17 ?? 'N/A';
                          })()}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(() => {
                            let attrs = position.attributes;
                            if (typeof attrs === 'string') {
                              try { 
                                attrs = JSON.parse(attrs); 
                              } catch { 
                                return 'N/A'; 
                              }
                            }
                            return attrs?.io18 ?? 'N/A';
                          })()}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(() => {
                            let attrs = position.attributes;
                            if (typeof attrs === 'string') {
                              try { 
                                attrs = JSON.parse(attrs); 
                              } catch { 
                                return 'N/A'; 
                              }
                            }
                            return attrs?.io19 ?? 'N/A';
                          })()}
                        </td>
                        <td className={`px-4 py-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(() => {
                            let attrs = position.attributes;
                            if (typeof attrs === 'string') {
                              try { 
                                attrs = JSON.parse(attrs); 
                              } catch { 
                                return 'N/A'; 
                              }
                            }
                            return attrs?.io20 ?? 'N/A';
                          })()}
                        </td>
                        <td className={`px-4 py-3`}>
                          <button
                            className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                              isDarkMode 
                                ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                            onClick={() => handleShowAttrs(position.attributes)}
                            title="Ver todos os atributos"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estado quando nenhum dispositivo está selecionado */}
        {!selectedDevice && devices.length > 0 && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Configure o Relatório
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                Para gerar o relatório detalhado, selecione um equipamento e defina o período desejado acima. Caso tenha dúvidas, consulte o administrador do sistema.
              </p>
            </div>
          </div>
        )}

        {/* Estado quando o relatório foi processado mas não há dados */}
        {selectedDevice && selectedPeriod && reportData.length === 0 && !loadingPositions && (
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
            <div className="p-12 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
                <FaTable className="text-3xl" />
              </div>
              <h3 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Nenhum Registro Encontrado
              </h3>
              <div className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-lg">
                  Não foram encontrados registros para o período selecionado.
                </p>

              </div>
            </div>
          </div>
        )}

        {/* Modal de atributos melhorado */}
        {showAttrModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-2xl border max-w-4xl w-full max-h-[85vh] overflow-hidden`}>
              {/* Header do Modal */}
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <FaTable className={`text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Atributos do Registro
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      Visualização detalhada de todos os atributos disponíveis
                    </p>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {modalAttrs && typeof modalAttrs === 'object' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(modalAttrs).map(([key, value]) => (
                      <div key={key} className={`p-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'border-gray-600 bg-gray-700 hover:bg-gray-650' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold uppercase tracking-wide ${
                              isDarkMode ? 'text-blue-300' : 'text-blue-600'
                            }`}>
                              {key}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {typeof value}
                            </span>
                          </div>
                          <div className={`p-2 rounded-md ${
                            isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                          }`}>
                            <span className={`text-xs font-mono break-all ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              {String(value)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-6 rounded-lg border ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="text-center">
                      <div className="text-4xl mb-4">📄</div>
                      <h4 className={`text-lg font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Conteúdo Simples
                      </h4>
                      <div className={`p-4 rounded-md ${
                        isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                      }`}>
                        <span className={`font-mono text-sm break-all ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          {String(modalAttrs)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer do Modal */}
              <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'} flex justify-center`}>
                <button
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium`}
                  onClick={() => setShowAttrModal(false)}
                >
                  ✓ Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
