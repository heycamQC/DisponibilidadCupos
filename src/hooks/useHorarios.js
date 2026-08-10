import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const csvUrlBase = import.meta.env.VITE_CSV_URL;

export const useHorarios = () => {
  // Inicializamos el estado del error de una vez si falta la variable (Cero efectos innecesarios)
  const [horarios, setHorarios] = useState(() => {
    const datosGuardados = sessionStorage.getItem('cupos_cache');
    return datosGuardados ? JSON.parse(datosGuardados) : [];
  });
  
  const [cargando, setCargando] = useState(() => !sessionStorage.getItem('cupos_cache'));
  const [error, setError] = useState(() => !csvUrlBase ? "Falta configurar la URL de Google Sheets en el archivo .env." : null);

  useEffect(() => {
    if (!csvUrlBase) return;

  
    const urlSinCache = `${csvUrlBase}&t=${new Date().getTime()}`;

    Papa.parse(urlSinCache, {
      download: true,
      header: true,
      complete: (resultados) => {
        const datosLimpios = resultados.data.filter(fila => fila.Idioma);
        setHorarios(datosLimpios);
        sessionStorage.setItem('cupos_cache', JSON.stringify(datosLimpios));
        setCargando(false);
      },
      error: () => {
        if (!sessionStorage.getItem('cupos_cache')) {
          setError("Error al cargar los datos de los cupos.");
        }
        setCargando(false);
      }
    });
  }, []);

  return { horarios, cargando, error };
};