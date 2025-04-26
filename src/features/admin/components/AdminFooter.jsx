// src/features/admin/components/AdminFooter.jsx
import React from 'react';

const AdminFooter = () => {
    return (
        <footer className="bg-[#30028D] text-white text-center py-6 mt-12">
            © {new Date().getFullYear()} KALA. Todos los derechos reservados.
        </footer>
    );
};

export default AdminFooter;
