import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Registro from './Registro';
import './App.css';

function TopBar(){
  const navigate = useNavigate();
  const usuario = localStorage.getItem('usuario');
  const esAdmin = localStorage.getItem('esAdmin') === '1';

  const salir = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('esAdmin');
    navigate('/');
  };

  return (
    <div className="topbar">
      <div className="topbar__inner">
        <div className="brand" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
          <img src="/tdslogo.png" alt="TDS" />
          <h1>TDS Licencias</h1>
          <span className="badge">AMERICA</span>
        </div>

        <div>
          {usuario ? (
            <>
              <span className="badge" style={{background:'#fff', color:'#111', marginRight:8}}>
                {esAdmin ? 'Admin' : 'Usuario'}
              </span>
              <span style={{opacity:.9, marginRight:10}}>{usuario}</span>
              <button className="btn btn-ghost" onClick={salir}>Salir</button>
            </>
          ) : (
            <span style={{opacity:.7}}>No autenticado</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Layout(){
  return (
    <div className="app">
      <TopBar />
      <div className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  return (
    <Router>
      <Layout />
    </Router>
  );
}
