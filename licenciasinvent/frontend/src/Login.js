import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './api';

const Login = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(usuario, contrasena);
    if (res.success) {
      localStorage.setItem('usuario', res.usuario);
      localStorage.setItem('esAdmin', res.esAdmin ? '1' : '0');
      navigate('/registro');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="center-viewport">
      <div className="card">
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
          <img src="/tdslogo.png" alt="TDS" style={{height:46, borderRadius:6}} />
          <div>
            <h2 style={{margin:0}}>Iniciar sesión</h2>
            <div style={{color:'var(--muted)', fontSize:13}}>Accede para gestionar licencias</div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="form-grid">
          <div className="full">
            <label>Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              placeholder="tu.usuario"
            />
          </div>
          <div className="full">
            <label>Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className="full" style={{ display:'flex', gap:8 }}>
            <button type="submit" className="btn btn-primary">Ingresar</button>
            <button type="reset" className="btn btn-ghost" onClick={()=>{ setUsuario(''); setContrasena(''); setError(''); }}>Limpiar</button>
          </div>
        </form>

        {error && <p style={{ color:'var(--danger)', marginTop:10 }}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;
