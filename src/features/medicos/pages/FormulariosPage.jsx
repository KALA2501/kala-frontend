import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';
import AyudaPopup from './components/AyudaPopup';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const FormulariosPage = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [medicoId, setMedicoId] = useState(null);
  const [modoVer, setModoVer] = useState(false);
  const [completados, setCompletados] = useState({});

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


  const handleClick = (ruta, pacienteId) => {
    navigate(ruta, { state: { pacienteId, medicoId } });
  };

  return (
    <div className="flex min-h-screen bg-offWhite">
      <MenuLateralMedico />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#30028D]">Formularios Clínicos</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setModoVer(!modoVer)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 bg-purple text-white`}
            >
              {modoVer ? 'Ver Formularios' : 'Llenar Formularios'}
            </button>
            <AyudaPopup />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={modoVer ? 'ver' : 'llenar'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4"
          >
            {pacientes.map((p) => (
              <div
                key={p.pkId}
                className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.urlImagen || 'https://via.placeholder.com/40'}
                    alt={`Foto de ${p.nombre} ${p.apellido}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{p.nombre} {p.apellido}</h3>
                    <p className="text-sm text-gray-500">ID: {p.pkId}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleClick(modoVer ? `/lawton-view/${p.pkId}` : '/lawton-form', p.pkId)}
                    className="bg-purple hover:bg-[#886ede] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    Lawton & Brody
                    {completados[p.pkId]?.lawton && <FiCheckCircle className="text-white bg-green-500 rounded-full p-[1px]" size={18} />}
                  </button>
                  <button
                    onClick={() => handleClick(modoVer ? `/faq-view/${p.pkId}` : '/faq-form', p.pkId)}
                    className="bg-[#FFD54F] hover:bg-[#f4c32f] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    FAQ
                    {completados[p.pkId]?.faq && <FiCheckCircle className="text-white bg-green-500 rounded-full p-[1px]" size={18} />}
                  </button>
                  <button
                    onClick={() => handleClick(modoVer ? `/dad-view/${p.pkId}` : '/dad-form', p.pkId)}
                    className="bg-[#F48FB1] hover:bg-[#ec6e98] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    DAD
                    {completados[p.pkId]?.dad && <FiCheckCircle className="text-white bg-green-500 rounded-full p-[1px]" size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FormulariosPage;
