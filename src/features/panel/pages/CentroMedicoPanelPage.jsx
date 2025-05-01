import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import CentroMedicoNavbar from '../components/CentroMedicoNavbar';
import CentroMedicoFooter from '../components/CentroMedicoFooter';
import CentroMedicoTabs from '../components/CentroMedicoTabs';
import CentroMedicoTableMedicos from '../components/CentroMedicoTableMedicos';
import CentroMedicoTablePacientes from '../components/CentroMedicoTablePacientes';
import CentroMedicoFormMedico from '../components/CentroMedicoFormMedico';
import { subirImagen } from '../../../services/firebase'; // Asegúrate de que el import esté bien

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const CentroMedicoPanelPage = () => {
    const [medicos, setMedicos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [activeTab, setActiveTab] = useState('medicos');
    const [centro, setCentro] = useState(null);
    const [logo, setLogo] = useState('');
    const [logoSubido, setLogoSubido] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        tipoDocumento: 'CC',
        idDocumento: '',
        fechaNacimiento: '',
        profesion: 'Médico',
        especialidad: 'General',
        especialidadCustom: '',
        telefono: '',
        direccion: '',
        genero: '',
        tarjetaProfesional: '',
        urlLogo: '',
        correo: ''
    });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email;
                const token = await user.getIdToken();
                try {
                    const res = await axios.get(
                        `${API_GATEWAY}/api/centro-medico/buscar-por-correo?correo=${encodeURIComponent(email)}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const centroData = res.data;
                    setCentro(centroData);
                    const centroId = centroData.pkId;
                    localStorage.setItem('idCentro', centroId);
                    cargarDatos(centroId, token);
                } catch (error) {
                    console.error('Error al obtener centro:', error);
                    setMensaje('❌ No se pudo identificar el centro médico');
                }
            } else {
                window.location.href = '/';
            }
        });

        return () => unsubscribe();
    }, []);

    const cargarDatos = async (idCentro, token) => {
        try {
            setLoading(true);
            const [medicosRes, pacientesRes] = await Promise.all([
                axios.get(`${API_GATEWAY}/api/medicos/centro-medico/${idCentro}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_GATEWAY}/api/pacientes/centro-medico/${idCentro}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setMedicos(medicosRes.data);
            setPacientes(pacientesRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setMensaje('❌ Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEspecialidadChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            especialidad: value,
            especialidadCustom: value === 'Otra' ? prev.especialidadCustom : ''
        }));
    };

    const handleLogoCentro = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        try {
            const url = await subirImagen(archivo, 'centros-medicos');
            setLogo(url);
            setLogoSubido(true);
            setFormData((prev) => ({ ...prev, urlLogo: url }));
        } catch (error) {
            console.error('Error subiendo logo', error);
            setMensaje('❌ Error al subir el logo');
        }
    };

    const handleImagenMedico = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        try {
            const url = await subirImagen(archivo, 'medicos');
            setLogo(url);
            setLogoSubido(true);
            setFormData((prev) => ({ ...prev, urlLogo: url }));
        } catch (error) {
            console.error('Error subiendo imagen del médico', error);
            setMensaje('❌ Error al subir la imagen del médico');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!logoSubido || !logo) {
            setMensaje('❌ Debes subir la imagen del médico antes de continuar');
            return;
        }
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await user.getIdToken();

            let especialidadFinal = formData.especialidad;
            if (especialidadFinal === 'Otra' && formData.especialidadCustom.trim() !== '') {
                especialidadFinal = formData.especialidadCustom.trim();
            }

            const medicoAEnviar = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                tipoDocumento: { id: formData.tipoDocumento },
                idDocumento: formData.idDocumento,
                fechaNacimiento: formData.fechaNacimiento,
                profesion: 'Médico',
                especialidad: especialidadFinal,
                telefono: formData.telefono,
                direccion: formData.direccion,
                genero: formData.genero,
                tarjetaProfesional: formData.tarjetaProfesional,
                urlImagen: logo,
                correo: formData.correo,
                centroMedico: { pkId: centro.pkId }
            };

            await axios.post(`${API_GATEWAY}/api/medicos`, medicoAEnviar, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensaje('✅ Médico creado exitosamente');
            setShowForm(false);
            setFormData({
                nombre: '', apellido: '', tipoDocumento: 'CC', idDocumento: '', fechaNacimiento: '',
                profesion: 'Médico', especialidad: 'General', especialidadCustom: '', telefono: '',
                direccion: '', genero: '', tarjetaProfesional: '', urlLogo: '', correo: ''
            });
            setLogo('');
            setLogoSubido(false);

            const idCentro = localStorage.getItem('idCentro');
            cargarDatos(idCentro, token);
        } catch (error) {
            console.error('Error al crear el médico:', error.response?.data || error.message);
            setMensaje(`❌ ${error.response?.data || 'Error al crear el médico'}`);
        }
    };

    const handleLogout = async () => {
        const auth = getAuth();
        await auth.signOut();
        localStorage.removeItem('idCentro');
        window.location.href = '/';
    };

    const eliminarMedico = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este médico?')) return;
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const token = await user.getIdToken();
            await axios.delete(`${API_GATEWAY}/api/medicos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje('✅ Médico eliminado');
            const idCentro = localStorage.getItem('idCentro');
            cargarDatos(idCentro, token);
        } catch (error) {
            console.error(error);
            setMensaje(`❌ ${error.response?.data || 'Error al eliminar el médico'}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-[#30028D]">Cargando...</h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
            <CentroMedicoNavbar nombreCentro={centro?.nombre || 'Centro Médico'} onLogout={handleLogout} />

            {mensaje && (
                <div className={`max-w-6xl mx-auto mt-6 px-6 py-4 rounded-lg ${mensaje.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {mensaje}
                </div>
            )}

            <main className="flex-1 w-full max-w-7xl mx-auto px-4">
                <div className="flex justify-end mt-8">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[#7358F5] hover:bg-[#30028D] text-white py-2 px-6 rounded-lg transition"
                    >
                        {showForm ? 'Cancelar' : 'Agregar Médico'}
                    </button>
                </div>

                {showForm && (
                    <CentroMedicoFormMedico
                        formData={formData}
                        handleChange={handleChange}
                        handleEspecialidadChange={handleEspecialidadChange}
                        handleImagenMedico={handleImagenMedico}
                        handleSubmit={handleSubmit}
                        logo={logo}
                    />
                )}

                <CentroMedicoTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                {activeTab === 'medicos' ? (
                    <CentroMedicoTableMedicos medicos={medicos} eliminarMedico={eliminarMedico} />
                ) : (
                    <CentroMedicoTablePacientes pacientes={pacientes} />
                )}
            </main>

            <CentroMedicoFooter />
        </div>
    );
};

export default CentroMedicoPanelPage;
