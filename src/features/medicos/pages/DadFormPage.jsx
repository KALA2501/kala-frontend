import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import MenuLateralMedico from './components/MenuLateralMedico';

const API_GATEWAY = process.env.REACT_APP_GATEWAY;

const DadFormPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    iniciarHigienePersonal: false,
    planificarHigienePersonal: false,
    ejecutarHigienePersonal: false,
    iniciarVestirse: false,
    planificarVestirse: false,
    ejecutarVestirse: false,
    iniciarComer: false,
    planificarComer: false,
    ejecutarComer: false,
    iniciarPrepararComidas: false,
    planificarPrepararComidas: false,
    ejecutarPrepararComidas: false,
    iniciarTareasDomesticas: false,
    planificarTareasDomesticas: false,
    ejecutarTareasDomesticas: false,
    iniciarLavarRopa: false,
    planificarLavarRopa: false,
    ejecutarLavarRopa: false,
    iniciarMedicacion: false,
    planificarMedicacion: false,
    ejecutarMedicacion: false,
    iniciarManejarDinero: false,
    planificarManejarDinero: false,
    ejecutarManejarDinero: false,
    iniciarOrientarse: false,
    planificarOrientarse: false,
    ejecutarOrientarse: false,
    observaciones: '',
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setForm({ ...form, [name]: checked });
  };

  const calcularPorcentaje = () => {
    const total = Object.keys(form).filter(key => key.startsWith('iniciar') || key.startsWith('planificar') || key.startsWith('ejecutar'));
    const cumplidos = total.filter(key => form[key]).length;
    return ((cumplidos / total.length) * 100).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !state?.pacienteId || !state?.medicoId) return alert('Datos incompletos');

    const token = await user.getIdToken();

    const data = {
      ...form,
      porcentajeIndependencia: calcularPorcentaje(),
      paciente: { pkId: state.pacienteId },
      medico: { pkId: state.medicoId },
    };

    try {
      await axios.post(`${API_GATEWAY}/api/formularios/dad`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Formulario DAD enviado correctamente');
      navigate('/formularios');
    } catch (error) {
      console.error('❌ Error al enviar el formulario:', error);
      alert('Error al guardar el formulario DAD');
    }
  };

  const renderCampo = (label, campoBase) => (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold text-lg mb-2 text-[#30028D]">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <label><input type="checkbox" name={`iniciar${campoBase}`} checked={form[`iniciar${campoBase}`]} onChange={handleChange} /> Iniciar</label>
        <label><input type="checkbox" name={`planificar${campoBase}`} checked={form[`planificar${campoBase}`]} onChange={handleChange} /> Planificar</label>
        <label><input type="checkbox" name={`ejecutar${campoBase}`} checked={form[`ejecutar${campoBase}`]} onChange={handleChange} /> Ejecutar</label>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <MenuLateralMedico />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#30028D] mb-6 text-center">Formulario DAD</h1>
          <form onSubmit={handleSubmit}>
            {renderCampo('A. Higiene Personal', 'HigienePersonal')}
            {renderCampo('B. Vestirse', 'Vestirse')}
            {renderCampo('C. Alimentación', 'Comer')}
            {renderCampo('D. Preparar Comidas', 'PrepararComidas')}
            {renderCampo('E. Tareas Domésticas', 'TareasDomesticas')}
            {renderCampo('F. Lavado de Ropa', 'LavarRopa')}
            {renderCampo('G. Manejo de Medicación', 'Medicacion')}
            {renderCampo('H. Manejo de Finanzas', 'ManejarDinero')}
            {renderCampo('I. Seguridad / Orientación', 'Orientarse')}

            <div className="mb-4">
              <label className="block font-semibold mb-1">Observaciones</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                rows={4}
                className="w-full p-2 border rounded"
                placeholder="Escribe observaciones aquí..."
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-[#30028D] text-white py-2 px-4 rounded hover:bg-[#210265]">
              Guardar Evaluación DAD
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default DadFormPage;
