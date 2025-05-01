// src/features/admin/pages/AdminPanelPage.jsx
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminNavbar from '../components/AdminNavbar';
import AdminFooter from '../components/AdminFooter';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const AdminPanelPage = () => {
    const [usuarios, setUsuarios] = useState({
        centro_medico: [],
        doctor: [],
        paciente: []
    });
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [activeTab, setActiveTab] = useState('usuarios');
    const [adminEmail, setAdminEmail] = useState('');
    const [rolSeleccionado, setRolSeleccionado] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user || user.email !== 'admin@kala.com') {
                navigate('/login');
            } else {
                setAdminEmail(user.email);
                cargarDatos();
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            await Promise.all([cargarUsuarios(), cargarSolicitudes()]);
        } finally {
            setLoading(false);
        }
    };
    // Y EL VARIABLE DE ENTORNO XD KHE TE DIVIERTAS CAMBIANDO CADA UNA A MANO
    const cargarUsuarios = async () => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            const res = await axios.get('${API_GATEWAY}/api/admin/usuarios-firebase', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("🚀 Usuarios cargados:", res.data.usuariosPorRol);
            const raw = res.data.usuariosPorRol;
            setUsuarios({
                centro_medico: raw?.['centro_medico'] ?? [],
                doctor: raw?.['medico'] ?? [],
                paciente: raw?.['paciente'] ?? []
            });
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al cargar usuarios');
        }
    };

    const cargarSolicitudes = async () => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            const res = await axios.get('${API_GATEWAY}/api/solicitudes-centro-medico', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSolicitudes(res.data);
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al cargar solicitudes');
        }
    };

    const cerrarSesion = async () => {
        try {
            await signOut(getAuth());
            navigate('/');
        } catch (error) {
            setMensaje('❌ Error al cerrar sesión');
        }
    };

    const eliminarUsuario = async (uid) => {
        if (!window.confirm('¿Confirmas eliminar este usuario?')) return;
        try {
            await axios.delete(`${API_GATEWAY}/api/admin/usuarios-firebase/${uid}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setMensaje('✅ Usuario eliminado');
            await cargarUsuarios();
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al eliminar usuario');
        }
    };

    const procesarSolicitud = async (id, rol) => {
        if (!rol) {
            setMensaje('❌ Selecciona un rol para procesar');
            return;
        }
        try {
            const token = await getAuth().currentUser.getIdToken();

            // ⚡ Normalizar el rol antes de enviar
            let rolFormateado = '';

            switch (rol) {
                case 'CENTRO_MEDICO':
                    rolFormateado = 'centro_medico';
                    break;
                case 'PACIENTE':
                    rolFormateado = 'paciente';
                    break;
                case 'MEDICO':
                    rolFormateado = 'doctor';
                    break;
                case 'ADMINISTRADOR':
                    rolFormateado = 'admin';
                    break;
                default:
                    rolFormateado = rol.toLowerCase();
                    break;
            }

            // ⚡ Ahora enviar el rol como parámetro en la URL, no en el body
            await axios.put(
                `${API_GATEWAY}/api/solicitudes-centro-medico/${id}/procesar?rol=${rolFormateado}`,
                null,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMensaje('✅ Solicitud procesada');
            await cargarDatos();
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al procesar solicitud');
        }
    };

    const revertirSolicitud = async (id) => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            await axios.put(`${API_GATEWAY}/api/solicitudes-centro-medico/${id}/revertir`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje('✅ Solicitud revertida');
            await cargarDatos();
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al revertir solicitud');
        }
    };

    const eliminarSolicitud = async (id) => {
        if (!window.confirm('¿Eliminar esta solicitud definitivamente?')) return;
        try {
            const token = await getAuth().currentUser.getIdToken();
            await axios.delete(`${API_GATEWAY}/api/solicitudes-centro-medico/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje('✅ Solicitud eliminada');
            await cargarDatos();
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al eliminar solicitud');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h2 className="text-2xl font-bold text-[#30028D]">Cargando...</h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
            <AdminNavbar adminEmail={adminEmail} onLogout={cerrarSesion} />

            {mensaje && (
                <div className={`max-w-6xl mx-auto mt-6 px-6 py-4 rounded-lg ${mensaje.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {mensaje}
                </div>
            )}

            <div className="max-w-6xl mx-auto mt-8 flex justify-center gap-4">
                <button
                    onClick={() => setActiveTab('usuarios')}
                    className={`py-2 px-6 rounded-lg font-semibold transition ${activeTab === 'usuarios' ? 'bg-[#7358F5] text-white' : 'bg-white text-[#30028D] border border-[#7358F5]'}`}
                >
                    Usuarios
                </button>
                <button
                    onClick={() => setActiveTab('solicitudes')}
                    className={`py-2 px-6 rounded-lg font-semibold transition ${activeTab === 'solicitudes' ? 'bg-[#7358F5] text-white' : 'bg-white text-[#30028D] border border-[#7358F5]'}`}
                >
                    Solicitudes
                </button>
            </div>

            <div className="max-w-6xl mx-auto mt-8 mb-16 px-4">
                {activeTab === 'usuarios' ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-[#30028D] mb-6">Usuarios por Rol</h2>
                        {Object.entries(usuarios).map(([rol, listaUsuarios]) => (
                            <div key={rol} className="mb-10">
                                <h3 className="text-xl font-semibold text-[#7358F5] mb-4 capitalize">
                                    {rol.replace('_', ' ')} ({listaUsuarios.length})
                                </h3>
                                {listaUsuarios.length === 0 ? (
                                    <p className="text-gray-600">No hay usuarios en este rol.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                            <thead className="bg-[#F9CFA7]">
                                                <tr>
                                                    <th className="py-3 px-6 text-left font-semibold">Email</th>
                                                    <th className="py-3 px-6 text-left font-semibold">Estado</th>
                                                    <th className="py-3 px-6 text-left font-semibold">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {listaUsuarios.map((usuario) => (
                                                    <tr key={usuario.uid} className="border-b">
                                                        <td className="py-3 px-6">{usuario.email}</td>
                                                        <td className="py-3 px-6">{usuario.disabled ? 'Desactivado' : 'Activo'}</td>
                                                        <td className="py-3 px-6">
                                                            <button
                                                                onClick={() => eliminarUsuario(usuario.uid)}
                                                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded-lg transition"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-[#30028D] mb-6">Solicitudes de Registro</h2>
                        {solicitudes.length === 0 ? (
                            <p className="text-gray-600">No hay solicitudes pendientes.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                    <thead className="bg-[#F9CFA7]">
                                        <tr>
                                            <th className="py-3 px-6 text-left font-semibold">Nombre</th>
                                            <th className="py-3 px-6 text-left font-semibold">Correo</th>
                                            <th className="py-3 px-6 text-left font-semibold">Teléfono</th>
                                            <th className="py-3 px-6 text-left font-semibold">Estado</th>
                                            <th className="py-3 px-6 text-left font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {solicitudes.map((solicitud) => (
                                            <tr key={solicitud.id} className="border-b">
                                                <td className="py-3 px-6">{solicitud.nombre}</td>
                                                <td className="py-3 px-6">{solicitud.correo}</td>
                                                <td className="py-3 px-6">{solicitud.telefono}</td>
                                                <td className="py-3 px-6">{solicitud.estado}</td>
                                                <td className="py-3 px-6 flex flex-col md:flex-row gap-2">
                                                    {!solicitud.procesado ? (
                                                        <>
                                                            <select
                                                                value={rolSeleccionado[solicitud.id] || ''}
                                                                onChange={(e) =>
                                                                    setRolSeleccionado((prev) => ({
                                                                        ...prev,
                                                                        [solicitud.id]: e.target.value
                                                                    }))
                                                                }
                                                                className="border border-gray-300 rounded-lg p-2"
                                                            >
                                                                <option value="">Seleccionar rol</option>
                                                                <option value="ADMINISTRADOR">Administrador</option>
                                                                <option value="CENTRO_MEDICO">Centro Médico</option>
                                                                <option value="MEDICO">Médico</option>
                                                                <option value="PACIENTE">Paciente</option>
                                                            </select>
                                                            <button
                                                                onClick={() => procesarSolicitud(solicitud.id, rolSeleccionado[solicitud.id])}
                                                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                                                            >
                                                                Procesar
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => revertirSolicitud(solicitud.id)}
                                                            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                                                        >
                                                            Revertir
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => eliminarSolicitud(solicitud.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AdminFooter />
        </div>
    );
};

export default AdminPanelPage;
