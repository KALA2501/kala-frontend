import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

export const subirImagen = async (archivo, carpeta) => {
  try {
    // Obtener la extensión del archivo
    const extension = archivo.name.split('.').pop();
    
    // Crear un nombre único para el archivo
    const nombreArchivo = `${carpeta}/${Date.now()}.${extension}`;
    
    // Obtener la referencia de Firebase Storage
    const storageRef = ref(storage, nombreArchivo);
    
    // Subir el archivo
    await uploadBytes(storageRef, archivo);
    
    // Obtener la URL de descarga
    const url = await getDownloadURL(storageRef);
    
    return url;
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    return null;
  }
}; 