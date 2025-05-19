import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';
import AyudaPopup from './components/AyudaPopup';
import { FiEye, FiCheckCircle, FiPlus } from 'react-icons/fi';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const FormulariosPage = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [medicoId, setMedicoId] = useState(null);
  const [completados, setCompletados] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [tabActivo, setTabActivo] = useState('lawton');
  const [showModal, setShowModal] = useState(false);
  const [tipoFormulario, setTipoFormulario] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        const res = await axios.get(
          `${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${user.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMedicoId(res.data.pkId);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPacientes = async () => {
      if (!medicoId) return;
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(`${API_GATEWAY}/api/pacientes/del-medico`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPacientes(res.data);

      const status = {};
      for (const paciente of res.data) {
        const id = paciente.pkId;
        const [lawton, dad, faq] = await Promise.allSettled([
          axios.get(`${API_GATEWAY}/api/formularios/lawton/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_GATEWAY}/api/formularios/dad/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_GATEWAY}/api/formularios/faq/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        status[id] = {
          lawton: lawton.status === 'fulfilled',
          dad: dad.status === 'fulfilled',
          faq: faq.status === 'fulfilled',
        };
      }
      setCompletados(status);
    };

    fetchPacientes();
  }, [medicoId]);

  const handleVer = (formulario, pacienteId) => {
    navigate(`/${formulario}-view/${pacienteId}`, { state: { pacienteId, medicoId } });
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    `${p.nombre} ${p.apellido} ${p.idDocumento}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const confirmarFormulario = () => {
    if (!tipoFormulario || !pacienteSeleccionado) return;
    navigate(`/${tipoFormulario}-form`, {
      state: {
        pacienteId: pacienteSeleccionado,
        medicoId: medicoId,
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-offWhite">
      <MenuLateralMedico />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple">Formularios</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm bg-purple text-white hover:bg-purple/90 transition"
            >
              <FiPlus size={18} />
              Nuevo Formulario
            </button>
            <AyudaPopup />
          </div>
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por nombre o identificación..."
          className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-purple"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {/* Tabs */}
        <div className="flex gap-2 bg-[#f0f0fa] rounded-lg mb-6 p-1">
          {['lawton', 'faq', 'dad'].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 rounded-md text-sm font-medium ${
                tabActivo === tab ? 'bg-white text-purple shadow' : 'text-gray-500'
              }`}
              onClick={() => setTabActivo(tab)}
            >
              {tab === 'lawton' ? 'Lawton y Brody' : tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-gray-600">Paciente</th>
                <th className="px-4 py-2 text-gray-600">Identificación</th>
                <th className="px-4 py-2 text-gray-600">Estado</th>
                <th className="px-4 py-2 text-center text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((p) => (
                <tr key={p.pkId} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{p.nombre} {p.apellido}</td>
                  <td className="px-4 py-2">{p.idDocumento}</td>
                  <td className="px-4 py-2">
                    {completados[p.pkId]?.[tabActivo] ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                        <FiCheckCircle className="text-green-500" /> Completo
                      </span>
                    ) : (
                      <span className="text-gray-400">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleVer(tabActivo, p.pkId)}
                      className="text-purple hover:text-purple/80"
                    >
                      <FiEye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {pacientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-400 py-4">
                    No se encontraron pacientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-purple">Crear nuevo formulario</h2>

              <div className="mb-4">
                <label className="block text-sm mb-1">Selecciona el tipo de formulario:</label>
                <select
                  className="w-full border p-2 rounded"
                  value={tipoFormulario}
                  onChange={(e) => setTipoFormulario(e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  <option value="lawton">Lawton y Brody</option>
                  <option value="faq">FAQ</option>
                  <option value="dad">DAD</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-1">Selecciona el paciente:</label>
                <select
                  className="w-full border p-2 rounded"
                  value={pacienteSeleccionado}
                  onChange={(e) => setPacienteSeleccionado(e.target.value)}
                >
                  <option value="">-- Selecciona --</option>
                  {pacientes.map((p) => (
                    <option key={p.pkId} value={p.pkId}>
                      {p.nombre} {p.apellido} - {p.idDocumento}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarFormulario}
                  className="px-4 py-2 rounded bg-purple text-white hover:bg-purple/90"
                  disabled={!tipoFormulario || !pacienteSeleccionado}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FormulariosPage;
