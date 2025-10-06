// frontend/src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// LOGIN
export const login = async (usuario, contrasena) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/login`, { usuario, contrasena });
    return data; // { success, usuario, esAdmin }
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error de red' };
  }
};

// GUARDAR REGISTRO
export const guardarRegistro = async (registro) => {
  try {
    const { data } = await axios.post(`${API_URL}/records/guardar`, registro);
    return data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error al guardar' };
  }
};

// LISTAR REGISTROS (filtro por usuario, admin y búsqueda q)
export const listarRegistros = async ({ usuario, esAdmin, q }) => {
  try {
    const params = new URLSearchParams();
    if (usuario) params.append('usuario', usuario);
    if (typeof esAdmin !== 'undefined') params.append('esAdmin', esAdmin ? '1' : '0');
    if (q) params.append('q', q);

    const { data } = await axios.get(`${API_URL}/records/listar?${params.toString()}`);
    return data;
  } catch (error) {
    console.error('Error al listar registros:', error);
    return [];
  }
};
