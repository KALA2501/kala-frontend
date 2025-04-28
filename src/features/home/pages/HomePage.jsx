// features/home/pages/HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subirImagen } from '../../../services/firebase';
import { getAuth, signInAnonymously } from 'firebase/auth';
import axios from 'axios';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import MissionSection from './MissionSection';
import BenefitsSection from './BenefitsSection';
import FormularioSection from './FormularioSection';
import HomeNavbar from './HomeNavbar';
import Footer from './Footer';

const HomePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        correo: '',
        telefono: '',
        urlLogo: ''
    });

    const [errors, setErrors] = useState({});
    const [mensaje, setMensaje] = useState('');
    const [subiendoLogo, setSubiendoLogo] = useState(false);
    const [archivoLogo, setArchivoLogo] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogoUpload = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        setArchivoLogo(archivo);
        setMensaje('✅ Imagen seleccionada. Se subirá cuando envíes la solicitud.');
    };

    const validar = () => {
        let newErrors = {};
        if (!formData.nombre) newErrors.nombre = 'Nombre requerido';
        if (!formData.direccion) newErrors.direccion = 'Dirección requerida';
        if (!formData.correo) {
            newErrors.correo = 'Correo requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
            newErrors.correo = 'Correo inválido';
        }
        if (!formData.telefono) newErrors.telefono = 'Teléfono requerido';
        if (!archivoLogo && !formData.urlLogo) newErrors.urlLogo = 'Debes subir el logo del centro';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errores = validar();
        if (Object.keys(errores).length > 0) {
            setErrors(errores);
            return;
        }

        try {
            setSubiendoLogo(true);
            let urlLogoFinal = formData.urlLogo;

            const auth = getAuth();
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }

            const token = await auth.currentUser.getIdToken();

            if (archivoLogo && !urlLogoFinal) {
                urlLogoFinal = await subirImagen(archivoLogo, 'centros-medicos');
            }

            await axios.post('http://localhost:8080/api/solicitudes-centro-medico', {
                ...formData,
                urlLogo: urlLogoFinal,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            setMensaje('✅ Centro médico registrado correctamente. Revisa tu correo.');
            setFormData({
                nombre: '',
                direccion: '',
                correo: '',
                telefono: '',
                urlLogo: ''
            });
            setArchivoLogo(null);
            setErrors({});
        } catch (error) {
            console.error(error);
            if (error.response?.status === 409) {
                setMensaje('⚠️ Ya existe una solicitud con ese correo o teléfono.');
            } else {
                setMensaje('❌ Ocurrió un error al registrar. Intenta más tarde.');
            }
        } finally {
            setSubiendoLogo(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <HomeNavbar />
            <HeroSection />
            <AboutSection />
            <MissionSection />
            <BenefitsSection />
            <FormularioSection
                formData={formData}
                errors={errors}
                mensaje={mensaje}
                subiendoLogo={subiendoLogo}
                archivoLogo={archivoLogo}
                handleChange={handleChange}
                handleLogoUpload={handleLogoUpload}
                handleSubmit={handleSubmit}
            />
            <Footer />
        </div>
    );
};

export default HomePage;
