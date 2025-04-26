import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

import AdminNavbar from '../components/AdminNavbar';
import AdminFooter from '../components/AdminFooter';
import AdminTabs from '../components/AdminTabs';
import AdminTableUsuarios from '../components/AdminTableUsuarios';
import AdminTableSolicitudes from '../components/AdminTableSolicitudes';

const AdminPanelPage = () => {
    const [usuarios, setUsuarios] = useState({
        centro_medico: [],
        doctor: [],
        paciente: [],
    });
    const [solicitudes, setSolicitudes] = useState([]);
    const [rolesSeleccionados, setRolesSeleccionados] = useState({});
    const [activeTab, setActiveTab] = useState('usuarios');
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [adminEmail, setAdminEmail] = useState('');

    const navigate = useNavigate();

    // Verificación de autenticación
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

    // Cargar usuarios y solicitudes
    const cargarDatos = async () => {
        setLoading(true);
        setMensaje('');
        await Promise.all([cargarUsuarios(), cargarSolicitudes()]);
        setLoading(false);
    };

    const cargarUsuarios = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const res = await axios.get('http://localhost:8080/api/admin/usuarios-firebase', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const raw = res.data.usuariosPorRol;
            setUsuarios({
                centro_medico: raw?.['centro_medico'] ?? [],
                doctor: raw?.['doctor'] ?? [],
                paciente: raw?.['paciente'] ?? [],
            });
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al cargar usuarios');
        }
    };

    const cargarSolicitudes = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const res = await axios.get('http://localhost:8080/api/solicitudes-centro-medico', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSolicitudes(res.data);
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al cargar solicitudes');
        }
    };

    const procesarSolicitud = async (id, rol) => {
        if (!rol) {
            setMensaje('❌ Por favor selecciona un rol para esta solicitud');
            return;
        }

        try {
            const token = await getAuth().currentUser.getIdToken();
            await axios.put(
                `http://localhost:8080/api/solicitudes-centro-medico/${id}/procesar`,
                null,
                {
                    params: { rol },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSolicitudes(prev => prev.filter((s) => s.id !== id));
            setMensaje('✅ Solicitud procesada correctamente');
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al procesar la solicitud');
        }
    };

    const eliminarSolicitud = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta solicitud?')) return;

        try {
            const token = await getAuth().currentUser.getIdToken();
            await axios.delete(`http://localhost:8080/api/solicitudes-centro-medico/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSolicitudes(prev => prev.filter((s) => s.id !== id));
            setMensaje('✅ Solicitud eliminada');
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al eliminar la solicitud');
        }
    };

    const revertirSolicitud = async (id) => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            await axios.put(`http://localhost:8080/api/solicitudes-centro-medico/${id}/revertir`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await cargarSolicitudes();
            setMensaje('🔁 Solicitud revertida correctamente');
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al revertir solicitud');
        }
    };

    const eliminarUsuario = async (uid) => {
        if (!window.confirm('¿Confirmas eliminar este usuario?')) return;

        try {
            await axios.delete(`http://localhost:8080/api/admin/usuarios-firebase/${uid}`);
            setMensaje('🗑️ Usuario eliminado');
            await cargarUsuarios();
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al eliminar usuario');
        }
    };

    const cerrarSesion = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error(error);
            setMensaje('❌ Error al cerrar sesión');
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
            {/* Navbar */}
            <AdminNavbar adminEmail={adminEmail} onLogout={cerrarSesion} />

            {/* Mensaje */}
            {mensaje && (
                <div
                    className={`max-w-6xl mx-auto mt-6 px-6 py-4 rounded-lg ${mensaje.includes('❌')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                >
                    {mensaje}
                </div>
            )}

            {/* Contenido de Tabs y Tablas */}
            <main className="flex-1 flex flex-col items-center justify-start w-full">
                <div className="w-full max-w-7xl px-4">
                    <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                    <div className="mt-8 mb-16">
                        {activeTab === 'usuarios' ? (
                            <AdminTableUsuarios
                                usuarios={usuarios}
                                eliminarUsuario={eliminarUsuario}
                            />
                        ) : (
                            <AdminTableSolicitudes
                                solicitudes={solicitudes}
                                rolSeleccionado={rolesSeleccionados}
                                setRolSeleccionado={setRolesSeleccionados}
                                procesarSolicitud={procesarSolicitud}
                                eliminarSolicitud={eliminarSolicitud}
                                revertirSolicitud={revertirSolicitud}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <AdminFooter />
        </div>
    );

};

export default AdminPanelPage;
