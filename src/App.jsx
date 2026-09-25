import { useState, useMemo ,useEffect } from 'react';
import { useHorarios } from './hooks/useHorarios';
import { FilaHorario } from './components/FilaHorario';
import { SillaIcon } from './components/SillaIcon';
import './App.css';

// DICCIONARIO DE TEMAS POR IDIOMA
const temasIdiomas = {
  'Alemán': { fondo: '#D35400', ocupada: '#F1C40F', disponible: '#FFFFFF', bloqueFondo: '#F1C40F', bloqueTexto: '#D35400' },
  'Francés': { fondo: '#a91100', ocupada: '#ff8317', disponible: '#FFFFFF', bloqueFondo: '#E67E22', bloqueTexto: '#78281F' },
  'Italiano': { fondo: '#1E5631', ocupada: '#E74C3C', disponible: '#FFFFFF', bloqueFondo: '#E74C3C', bloqueTexto: '#1E5631' },
  'Inglés': { fondo: '#0B194C', ocupada: '#4285F4', disponible: '#FFFFFF', bloqueFondo: '#64B5F6', bloqueTexto: '#0B194C' },
  'Portugués': { fondo: '#ff8d02', ocupada: '#00851b', disponible: '#FFFFFF', bloqueFondo: '#02ad47', bloqueTexto: '#fff898' },
  'Ruso': { fondo: '#440c6f', ocupada: '#ef90f8', disponible: '#FFFFFF', bloqueFondo: '#ba0a7f', bloqueTexto: '#f2f2f3' },
  'Chino': { fondo: '#790235', ocupada: '#fe7ac5', disponible: '#FFFFFF', bloqueFondo: '#ff9bde', bloqueTexto: '#040404' },
  'Coreano': { fondo: '#00909d', ocupada: '#593370', disponible: '#FFFFFF', bloqueFondo: '#144560', bloqueTexto: '#fcfcfc' },
  'Japonés': { fondo: '#ae7fdf', ocupada: '#593370', disponible: '#FFFFFF', bloqueFondo: '#541460', bloqueTexto: '#fcfcfc' },
  'default': { fondo: '#040405', ocupada: '#f442f4', disponible: '#ffb5d7', bloqueFondo: '#64007d', bloqueTexto: '#ffbae4' }
};

const normalizarTexto = (texto) => {
  if (!texto) return "";
  return String(texto).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

function App() {
  const { horarios, cargando, error } = useHorarios();
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");

  // Lectura de parámetros URL (convertidos a strings puros para evitar warnings del React Compiler)
  const searchParams = new URLSearchParams(window.location.search);
  const parametroCursoUrl = String(searchParams.get("curso") || searchParams.get("taller") || searchParams.get("idioma") || "");
  const parametroPlanUrl = String(searchParams.get("plan") || searchParams.get("modalidad") || "");
  const parametroVista = String(searchParams.get("vista") || "");

  const esVistaEstudiante = Boolean(parametroCursoUrl);

  const horariosActivos = useMemo(() => {
    return horarios.filter(h => h.Estado !== 'Inactivo');
  }, [horarios]);

  const cursosDisponibles = useMemo(() => {
    let unicos = [...new Set(horariosActivos.map(h => h.NombreCurso))];
    
    if (parametroVista === 'idiomas') {
      unicos = unicos.filter(c => temasIdiomas[c] && c !== 'default');
    } 
    else if (parametroVista === 'talleres') {
      unicos = unicos.filter(c => !temasIdiomas[c] || c === 'default');
    }
    
    return unicos;
  }, [horariosActivos, parametroVista]);

  let cursoRealAMostrar = "";
  
  if (esVistaEstudiante) {
    const cursoEncontrado = cursosDisponibles.find(
      c => normalizarTexto(c) === normalizarTexto(parametroCursoUrl)
    );
    cursoRealAMostrar = cursoEncontrado || parametroCursoUrl;
  } else {
    cursoRealAMostrar = cursoSeleccionado || (cursosDisponibles.length > 0 ? cursosDisponibles[0] : "");
  }

  const horariosDelCurso = useMemo(() => {
    return horariosActivos.filter(h => normalizarTexto(h.NombreCurso) === normalizarTexto(cursoRealAMostrar));
  }, [horariosActivos, cursoRealAMostrar]);

  const temaActual = useMemo(() => {
    const primeraFila = horariosDelCurso[0];
    if (primeraFila && primeraFila.ColorFondo && primeraFila.ColorOcupada) {
      return {
        fondo: primeraFila.ColorFondo,
        ocupada: primeraFila.ColorOcupada,
        disponible: primeraFila.ColorDisponible || '#FFFFFF',
        bloqueFondo: primeraFila.ColorBloqueFondo || '#1E1E1E',
        bloqueTexto: primeraFila.ColorBloqueTexto || '#FFFFFF'
      };
    }
    return temasIdiomas[cursoRealAMostrar] || temasIdiomas['default'];
  }, [horariosDelCurso, cursoRealAMostrar]);

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

  const cursosEstandar = horariosDelCurso.filter(h => h.Modalidad === 'Estándar');
  const cursosIntensivo = horariosDelCurso.filter(h => h.Modalidad === 'Intensivo');
  const horariosSinModalidad = horariosDelCurso.filter(h =>!h.Modalidad ||(normalizarTexto(h.Modalidad) !== 'estandar' && normalizarTexto(h.Modalidad) !== 'intensivo'));
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
        <h1 className="titulo">Disponibilidad de Cupos {cursoRealAMostrar}</h1>

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

      {!esVistaEstudiante && cursosDisponibles.length > 1 && (
        <div className="menu-desplegable-container">
          <label htmlFor="select-curso" className="label-idioma">Seleccionar Curso:</label>
          <select
            id="select-curso"
            className="select-idioma"
            value={cursoRealAMostrar}
            onChange={(e) => setCursoSeleccionado(e.target.value)}
          >
            {cursosDisponibles.map(curso => (
              <option key={curso} value={curso} style={{ backgroundColor: temaActual.fondo, color: temasIdiomas }}>
                {curso}
              </option>
            ))}
          </select>
        </div>
      )}

      {horariosSinModalidad.length > 0 && (
        <div className="seccion-modalidad">
          <h2 className="subtitulo">Talleres {cursoRealAMostrar}</h2>
          {horariosSinModalidad.map((horario, index) => (
            <FilaHorario key={`sin-modalidad-${index}`} dato={horario} temaColores={temaActual} />
          ))}
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