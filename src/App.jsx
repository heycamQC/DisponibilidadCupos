import { useState, useMemo, useEffect } from 'react';import { useHorarios } from './hooks/useHorarios';
import { FilaHorario } from './components/FilaHorario';
import { SillaIcon } from './components/SillaIcon';
import './App.css';

// DICCIONARIO DE TEMAS POR IDIOMA
const temasIdiomas = {
  'Alemán': {
    fondo: '#D35400',
    ocupada: '#F1C40F',
    disponible: '#FFFFFF',
    bloqueFondo: '#F1C40F',
    bloqueTexto: '#D35400'
  },
  'Francés': {
    fondo: '#a91100',       // Borrdó / Vino tinto característico
    ocupada: '#ff8317',     // Naranja cálido para reservados
    disponible: '#FFFFFF',  // Blanco para disponibles
    bloqueFondo: '#E67E22',
    bloqueTexto: '#78281F'
  },
  'Italiano': {
    fondo: '#1E5631',       // Verde oscuro corporativo
    ocupada: '#E74C3C',     // Rojo para reservados
    disponible: '#FFFFFF',  // Blanco para disponibles
    bloqueFondo: '#E74C3C',
    bloqueTexto: '#1E5631'
  },
  'Inglés': {
    fondo: '#0B194C',
    ocupada: '#4285F4',
    disponible: '#FFFFFF',
    bloqueFondo: '#64B5F6',
    bloqueTexto: '#0B194C'
  },
  'Portugués': {
    fondo: '#ff8d02',
    ocupada: '#00851b',
    disponible: '#FFFFFF',
    bloqueFondo: '#02ad47',
    bloqueTexto: '#fff898'
  },
  'Ruso': {
    fondo: '#440c6f',
    ocupada: '#ef90f8',
    disponible: '#FFFFFF',
    bloqueFondo: '#ba0a7f',
    bloqueTexto: '#f2f2f3'
  },
  'Chino': {
    fondo: '#790235',
    ocupada: '#fe7ac5',
    disponible: '#FFFFFF',
    bloqueFondo: '#ff9bde',
    bloqueTexto: '#040404'
  },
  'Coreano': {
    fondo: '#00909d',
    ocupada: '#593370',
    disponible: '#FFFFFF',
    bloqueFondo: '#144560',
    bloqueTexto: '#fcfcfc'
  },
  'Japonés': {
    fondo: '#ae7fdf',
    ocupada: '#593370',
    disponible: '#FFFFFF',
    bloqueFondo: '#541460',
    bloqueTexto: '#fcfcfc'
  },
  'default': {
    fondo: '#0B194C',
    ocupada: '#4285F4',
    disponible: '#FFFFFF',
    bloqueFondo: '#64B5F6',
    bloqueTexto: '#0B194C'
  }
};

const normalizarTexto = (texto) => {
  if (!texto) return "";
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

function App() {
  const { horarios, cargando, error } = useHorarios();
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState("");

  const parametroIdiomaUrl = new URLSearchParams(window.location.search).get("idioma");
  const parametroPlanUrl = new URLSearchParams(window.location.search).get("plan");
  
  const esVistaEstudiante = Boolean(parametroIdiomaUrl);

  const horariosActivos = useMemo(() => {
    return horarios.filter(h => h.Estado !== 'Inactivo');
  }, [horarios]);

  const idiomasDisponibles = useMemo(() => {
    return [...new Set(horariosActivos.map(h => h.Idioma))];
  }, [horariosActivos]);

  let idiomaRealAMostrar = "";

  if (esVistaEstudiante) {
    const idiomaEncontrado = idiomasDisponibles.find(
      idioma => normalizarTexto(idioma) === normalizarTexto(parametroIdiomaUrl)
    );
    idiomaRealAMostrar = idiomaEncontrado || parametroIdiomaUrl;
  } else {
    idiomaRealAMostrar = idiomaSeleccionado || (idiomasDisponibles.length > 0 ? idiomasDisponibles[0] : "");
  }

  const temaActual = temasIdiomas[idiomaRealAMostrar] || temasIdiomas['default'];

  useEffect(() => {
    document.documentElement.style.backgroundColor = temaActual.fondo;
    document.body.style.backgroundColor = temaActual.fondo;
    document.body.style.margin = "0";
  }, [temaActual]);
  
  if (cargando) {
    return (
      <div className="contenedor-principal" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Cargando cupos disponibles...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor-principal" style={{ textAlign: 'center', color: '#ff6b6b' }}>
        <h2>Ups, algo salió mal.</h2>
        <p>{error}</p>
      </div>
    );
  }

  const horariosDelIdioma = horariosActivos.filter(h => h.Idioma === idiomaRealAMostrar);
  const cursosEstandar = horariosDelIdioma.filter(h => h.Modalidad === 'Estándar');
  const cursosIntensivo = horariosDelIdioma.filter(h => h.Modalidad === 'Intensivo');

  const planNormalizado = normalizarTexto(parametroPlanUrl);
  const mostrarEstandar = !planNormalizado || planNormalizado.includes('estandar');
  const mostrarIntensivo = !planNormalizado || planNormalizado.includes('intensivo');

  return (
    <div className="contenedor-principal" style={{ 
      backgroundColor: temaActual.fondo, 
      minHeight: '100vh', 
      padding: esVistaEstudiante ? '15px' : '40px', 
      borderRadius: esVistaEstudiante ? '0px' : '16px' 
    }}>
      <div className="cabecera">
        <h1 className="titulo">Disponibilidad de Cupos  {idiomaRealAMostrar}</h1>
        
        <div className="leyenda">
          <div className="item-leyenda">
            <SillaIcon estado="disponible" colorDisponible={temaActual.disponible} />
            <span>Disponible</span>
          </div>
          <div className="item-leyenda">
            <SillaIcon estado="ocupada" colorOcupada={temaActual.ocupada} />
            <span>Reservado</span>
          </div>
        </div>
      </div>

      {!esVistaEstudiante && idiomasDisponibles.length > 1 && (
        <div className="menu-desplegable-container">
          <label htmlFor="select-idioma" className="label-idioma">Seleccionar Idioma:</label>
          <select 
            id="select-idioma"
            className="select-idioma"
            value={idiomaRealAMostrar}
            onChange={(e) => setIdiomaSeleccionado(e.target.value)}
          >
            {idiomasDisponibles.map(idioma => (
              <option key={idioma} value={idioma} style={{ backgroundColor: '#0B194C', color: 'white' }}>
                {idioma}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {mostrarEstandar && cursosEstandar.length > 0 && (
        <div className="seccion-modalidad">
          <h2 className="subtitulo">Estándar</h2>
          {cursosEstandar.map((horario, index) => (
            <FilaHorario key={`estandar-${index}`} dato={horario} temaColores={temaActual} />
          ))}
        </div>
      )}

      {/* 🚀 SECCIÓN INTENSIVO (Solo se muestra si corresponde) */}
      {mostrarIntensivo && cursosIntensivo.length > 0 && (
        <div className="seccion-modalidad">
          <h2 className="subtitulo">Intensivo</h2>
          {cursosIntensivo.map((horario, index) => (
            <FilaHorario key={`intensivo-${index}`} dato={horario} temaColores={temaActual} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;