import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import apiService from '../../services/apiService';

export default function DeviceLocation() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Criar tema do Material-UI baseado no tema atual
  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
    },
  });

  useEffect(() => {
    apiService
      .get('/devices/')
      .then((response) => {
        const data = response.data;
        const list = Array.isArray(data) ? data : [data];
        const found = list.find((d) => d.device_id === id);
        if (!found) {
          setError("Dispositivo não encontrado.");
        } else {
          setDevice(found);
        }
      })
      .catch(() => {
        setError("Erro ao carregar dispositivo.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <ThemeProvider theme={muiTheme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={300}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={muiTheme}>
        <Typography color="error" sx={{ m: 2 }}>
          {error}
        </Typography>
      </ThemeProvider>
    );
  }

  if (!device) {
    return (
      <ThemeProvider theme={muiTheme}>
        <Typography sx={{ m: 2 }}>Dispositivo não encontrado.</Typography>
      </ThemeProvider>
    );
  }

  const openMap = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${device.latitude},${device.longitude}`,
      "_blank"
    );
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Card sx={{ m: 2, maxWidth: 600, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
        <Typography variant="h5" gutterBottom>
          Localização do Dispositivo {device.device_id}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Latitude:</strong> {device.latitude ?? "n/a"}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Longitude:</strong> {device.longitude ?? "n/a"}
        </Typography>

        {device.latitude != null && device.longitude != null && (
          <Box
            mt={2}
            sx={{
              position: "relative",
              width: "100%",
              pt: "56.25%", // 16:9 aspect ratio
            }}
          >
            <iframe
              title="Mapa de localização"
              src={`https://maps.google.com/maps?q=${device.latitude},${device.longitude}&z=15&output=embed`}
              style={{
                border: 0,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              allowFullScreen
              loading="lazy"
            />
          </Box>
        )}

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Button variant="contained" color="secondary" onClick={openMap}>
            Ver no mapa
          </Button>
        </Box>
      </CardContent>
    </Card>
    </ThemeProvider>
  );
}
