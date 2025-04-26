// features/home/pages/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[#30028D] text-white py-6 px-4 mt-auto">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
                <p className="text-center md:text-left text-sm">&copy; {new Date().getFullYear()} KALA. Todos los derechos reservados.</p>
                <div className="flex space-x-4 mt-4 md:mt-0">
                    <a href="#" className="hover:underline text-sm">Política de Privacidad</a>
                    <a href="#" className="hover:underline text-sm">Términos y Condiciones</a>
                    <a href="#" className="hover:underline text-sm">Contacto</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
