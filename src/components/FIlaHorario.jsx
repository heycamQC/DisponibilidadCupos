
import { SillaIcon } from './SillaIcon';

export const FilaHorario = ({ dato, temaColores }) => {
  const maximo = parseInt(dato['Capacidad Máxima']) || 0;
  const ocupados = parseInt(dato['Cupos Ocupados']) || 0;
  const disponibles = maximo - ocupados > 0 ? maximo - ocupados : 0;

  const sillasOcupadas = Array.from({ length: ocupados });
  const sillasDisponibles = Array.from({ length: disponibles });

  return (
    <div className="fila-horario">
      <div className="info-grupo">
   
        <div className="bloque-letra" style={{ backgroundColor: temaColores.bloqueFondo, color: temaColores.bloqueTexto }}>
          {dato.Grupo}
        </div>
        <div className="texto-horario">{dato['Días y Horas']}</div>
      </div>
      
      <div className="contenedor-sillas">
        {sillasOcupadas.map((_, index) => (
          <SillaIcon 
            key={`ocupada-${index}`} 
            estado="ocupada" 
            colorOcupada={temaColores.ocupada} 
          />
        ))}
        {sillasDisponibles.map((_, index) => (
          <SillaIcon 
            key={`disponible-${index}`} 
            estado="disponible" 
            colorDisponible={temaColores.disponible} 
          />
        ))}
      </div>
    </div>
  );
};