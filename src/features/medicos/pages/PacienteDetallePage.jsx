import React, { useEffect, useState } from "react";
import MenuLateralMedico from "./components/MenuLateralMedico";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import axios from "axios";

const API_PACIENTE = `${process.env.REACT_APP_GATEWAY}/api/pacientes`;

const PacienteDetallePage = () => {
  const { pacienteId } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPaciente = async () => {
      setLoading(true);
      setError("");
      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error("No hay usuario autenticado.");
        const token = await user.getIdToken();
        const res = await axios.get(`${API_PACIENTE}/${pacienteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaciente(res.data);
      } catch (err) {
        setError("No se pudo cargar la información del paciente.");
      } finally {
        setLoading(false);
      }
    };
    if (pacienteId) fetchPaciente();
  }, [pacienteId]);

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <MenuLateralMedico />
      <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold text-purple mb-6">
          Detalle del Paciente
        </h1>

        {loading && <div className="text-lg text-gray-500">Cargando...</div>}

        {error && (
          <div className="text-lg text-red-600 font-semibold mb-4">
            {error}
          </div>
        )}

        {paciente && (
          <div className="bg-white rounded-2xl shadow p-8 max-w-xl">
            <div className="flex flex-col items-center mb-6">
              <img
                src={paciente.urlImagen || "https://via.placeholder.com/120"}
                alt="Foto paciente"
                className="w-24 h-24 rounded-full object-cover mb-2"
              />
              <h2 className="text-2xl font-bold text-purple mb-1">
                {paciente.nombre} {paciente.apellido}
              </h2>
              <div className="text-md text-gray-700">{paciente.email}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Documento" value={paciente.idDocumento} />
              <Field label="Teléfono" value={paciente.telefono} />
              <Field label="Dirección" value={paciente.direccion} />
              <Field label="Género" value={paciente.genero} />
              <Field label="Etapa" value={paciente.etapa} />
              <Field label="Código CIE" value={paciente.codigoCIE} />
              <Field label="Fecha de Nacimiento" value={paciente.fechaNacimiento ? paciente.fechaNacimiento.split("T")[0] : ""} />
              {/* Agrega más campos si quieres */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div>
    <div className="text-gray-600 font-semibold">{label}</div>
    <div className="text-lg">{value || <span className="text-gray-400">-</span>}</div>
  </div>
);

export default PacienteDetallePage;
