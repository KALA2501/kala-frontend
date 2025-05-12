import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const DoctorPanelPage = () => {
  const navigate = useNavigate();
  const [doctorImage, setDoctorImage] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [medicoId, setMedicoId] = useState('');
  const [medico, setMedico] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await axios.get(`${API_GATEWAY}/api/medicos/buscar-por-correo?correo=${encodeURIComponent(user.email)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const doctorData = res.data;
          setDoctorImage(doctorData.urlImagen);
          setMedicoId(doctorData.pkId);
          setMedico(doctorData);
        } catch (err) {
          console.error('❌ Error obteniendo médico:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPacientes = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && medicoId) {
        const token = await user.getIdToken();
        try {
          const res = await axios.get(`${API_GATEWAY}/api/pacientes/del-medico/${medicoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPacientes(res.data);
        } catch (err) {
          console.error('❌ Error obteniendo pacientes:', err);
        }
      }
    };
    fetchPacientes();
  }, [medicoId]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateralMedico />
      <main className="flex-1 p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#30028D]">Bienvenido, {medico?.nombre}</h1>
          {doctorImage && (
            <img src={doctorImage} alt="Perfil" className="w-16 h-16 rounded-full object-cover border" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-4 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#30028D]">Resultados Recientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Etapa</th>
                    <th className="p-2 text-left">Actividad</th>
                    <th className="p-2 text-left">Errores</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.slice(0, 5).map((paciente) => (
                    <tr key={paciente.pkId} className="border-b hover:bg-gray-50">
                      <td className="p-2 flex items-center gap-2">
                        <img src={paciente.urlImagen || 'https://via.placeholder.com/32'} alt="Paciente" className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium">{paciente.nombre}</span>
                      </td>
                      <td className="p-2">{paciente.etapa || '-'}</td>
                      <td className="p-2">Pastillero</td>
                      <td className="p-2">5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-[#30028D] mb-2">Pacientes activos</h2>
            <p className="text-5xl font-bold text-green-600">{pacientes.length}</p>
            <p className="text-sm text-gray-500">Pacientes registrados a tu cargo</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/register-patient', { state: { medico } })}
            className="bg-[#7358F5] hover:bg-[#30028D] text-white py-2 px-4 rounded-lg transition"
          >
            ➕ Registrar Paciente
          </button>
          <button
            onClick={() => navigate('/lawton-reportes')}
            className="bg-[#28A745] hover:bg-[#1E7E34] text-white py-2 px-4 rounded-lg transition"
          >
            📄 Ver Reportes Lawton
          </button>
        </div>
      </main>
    </div>
  );
};

export default DoctorPanelPage;
