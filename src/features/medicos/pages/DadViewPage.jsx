import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';
import logoKala from '../../../assets/LogoKala.png';
import faqImg from '../../../assets/lawton.jpg';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const DadViewPage = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [historial, setHistorial] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [pagina, setPagina] = useState(0);
  const [nombrePaciente, setNombrePaciente] = useState('');
  const porPagina = 3;

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tkn = await user.getIdToken();
        setToken(tkn);
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (!token || !pacienteId) return;

    const fetchHistorial = async () => {
      try {
        const res = await axios.get(`${API_GATEWAY}/api/formularios/dad/historial/${pacienteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistorial(res.data);
        setEvaluacionSeleccionada(res.data[0]);
      } catch (err) {
        console.error('❌ Error al obtener historial DAD:', err);
        alert('No se encontró historial DAD para este paciente.');
      }
    };

    const fetchNombre = async () => {
      try {
        const res = await axios.get(`${API_GATEWAY}/api/pacientes/${pacienteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNombrePaciente(`${res.data.nombre} ${res.data.apellido}`);
      } catch (err) {
        console.error('❌ Error obteniendo nombre del paciente:', err);
      }
    };

    fetchHistorial();
    fetchNombre();
  }, [token, pacienteId]);

  const generarPDF = () => {
    const input = document.getElementById('evaluacion-dad');
    html2canvas(input, { scale: 2, useCORS: true, allowTaint: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`Evaluacion_DAD_${nombrePaciente}.pdf`);
    });
  };

  const acciones = ['Iniciar', 'Planificar', 'Ejecutar'];
  const secciones = [
    ['Higiene Personal', 'HigienePersonal'],
    ['Vestirse', 'Vestirse'],
    ['Alimentación', 'Comer'],
    ['Preparar Comidas', 'PrepararComidas'],
    ['Tareas Domésticas', 'TareasDomesticas'],
    ['Lavado de Ropa', 'LavarRopa'],
    ['Manejo de Medicación', 'Medicacion'],
    ['Manejo de Finanzas', 'ManejarDinero'],
    ['Seguridad / Orientación', 'Orientarse']
  ];

  const booleanToYesNo = (val) => (val ? '✔️ Sí' : '❌ No');
  const historialPaginado = historial.slice(pagina * porPagina, (pagina + 1) * porPagina);
  const totalPaginas = Math.ceil(historial.length / porPagina);

  return (
    <div className="flex min-h-screen bg-offWhite">
      <MenuLateralMedico />
      <main className="flex-1 p-8 animate-fadeInBlur">
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl border-t-8 border-purple" id="evaluacion-dad">
          <div className="h-56 rounded-t-2xl overflow-hidden relative">
            <img src={faqImg} alt="Cabecera DAD" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-purple mix-blend-multiply opacity-50"></div>
            <img src={logoKala} alt="Logo KALA" className="absolute top-4 left-4 w-20 h-20" />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center text-purple mb-1">Evaluación DAD</h1>
            <h2 className="text-center text-lg font-medium text-gray-600 mb-4">Paciente: {nombrePaciente}</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Fecha: {evaluacionSeleccionada ? new Date(evaluacionSeleccionada.fechaRegistro).toLocaleString('es-CO') : '...'}
            </p>

            {secciones.map(([label, baseKey]) => (
              <div key={baseKey} className="mb-4 bg-gray-50 p-3 rounded shadow-sm">
                <h3 className="font-semibold text-[#30028D] mb-2">{label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  {acciones.map((accion) => {
                    const key = `${accion.toLowerCase()}${baseKey}`;
                    const valor = evaluacionSeleccionada?.[key];
                    return (
                      <div key={key} className="flex justify-between">
                        <span>{accion}</span>
                        <span className={valor ? 'text-green-600 font-semibold' : 'text-red-500'}>
                          {valor ? '✔ Sí' : '✘ No'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <p className="mt-4 text-sm italic text-gray-700">
              <strong>Observaciones:</strong> {evaluacionSeleccionada?.observaciones || 'Ninguna'}
            </p>
            <div className="mt-6 text-right text-gray-600 font-medium">
              Nivel de independencia estimado:{' '}
              <span className="text-[#30028D]">{evaluacionSeleccionada?.porcentajeIndependencia}%</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={generarPDF}
            className="bg-purple hover:bg-[#30028D] text-white py-2 px-6 rounded-full transition flex items-center justify-center gap-2 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6-6m6 6l6-6" />
            </svg>
            Descargar PDF
          </button>
        </div>

        <div className="max-w-4xl mx-auto mt-10">
          <h2 className="text-2xl font-semibold text-[#30028D] mb-4">Historial de Evaluaciones DAD</h2>
          <div className="flex flex-col gap-4">
            {historialPaginado.map((ev, idx) => (
              <div
                key={idx + pagina * porPagina}
                onClick={() => setEvaluacionSeleccionada(ev)}
                className={`cursor-pointer transition-all border-l-4 rounded-xl shadow px-6 py-4 bg-white hover:shadow-md ${
                  ev === evaluacionSeleccionada ? 'border-[#30028D] bg-[#f5f0ff]' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-[#30028D]">Evaluación #{historial.length - historial.indexOf(ev)}</p>
                    <p className="text-sm text-gray-500">
                      Fecha: {new Date(ev.fechaRegistro).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p><strong>Independencia:</strong> {ev.porcentajeIndependencia}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPagina((prev) => Math.max(prev - 1, 0))}
                disabled={pagina === 0}
                className="text-purple hover:text-[#30028D] text-xl p-2 disabled:opacity-30"
              >
                <FiChevronLeft />
              </button>
              <span className="text-sm text-gray-600">Página {pagina + 1} de {totalPaginas}</span>
              <button
                onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas - 1))}
                disabled={pagina === totalPaginas - 1}
                className="text-purple hover:text-[#30028D] text-xl p-2 disabled:opacity-30"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-purple hover:bg-[#30028D] text-white py-2 px-6 rounded-full"
          >
            Volver
          </button>
        </div>
      </main>
    </div>
  );
};

export default DadViewPage;