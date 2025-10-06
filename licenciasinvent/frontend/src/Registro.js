import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { guardarRegistro, listarRegistros } from './api';
import { QRCodeCanvas } from 'qrcode.react';

const Registro = () => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState('');
  const [cantidadLicencias, setCantidadLicencias] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [horaExpiracion, setHoraExpiracion] = useState('10:10:10');

  const [registros, setRegistros] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const usuario = localStorage.getItem('usuario') || '';
  const esAdmin = (localStorage.getItem('esAdmin') === '1');

  const [q, setQ] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [qrSeleccionado, setQrSeleccionado] = useState('');
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const qrCanvasRef = useRef(null);

  const cargar = async (filtro = '') => {
    const data = await listarRegistros({ usuario, esAdmin, q: filtro });
    setRegistros(data);
  };

  useEffect(() => { cargar(q); /* eslint-disable-next-line */ }, []);

  const handleBuscar = (e) => { e.preventDefault(); cargar(q); };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!fechaExpiracion) { setMensaje('❌ Debes seleccionar fecha de expiración'); return; }
    const fechaHora = `${fechaExpiracion} ${horaExpiracion || '00:00:00'}`;
    const registro = {
      cliente,
      cantidadLicencias: parseInt(cantidadLicencias, 10),
      fechaExpiracion: fechaHora,
      creadoPor: usuario
    };
    const res = await guardarRegistro(registro);
    if (res.success) {
      setMensaje('✅ Registro guardado correctamente');
      setCliente(''); setCantidadLicencias(''); setFechaExpiracion(''); setHoraExpiracion('10:10:10');
      cargar(q);
    } else { setMensaje('❌ Error: ' + res.message); }
  };

  const abrirQR = (id, qrCodigo) => { setIdSeleccionado(id); setQrSeleccionado(qrCodigo || ''); setMostrarModal(true); };
  const cerrarQR = () => { setMostrarModal(false); setQrSeleccionado(''); setIdSeleccionado(null); };
  const descargarQR = () => {
    if (!qrCanvasRef.current) return;
    const url = qrCanvasRef.current.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = `licencia_${idSeleccionado ?? ''}.png`; a.click();
  };

  const formatearFechaHora = (valor) => {
    try { const d = new Date(valor); if (isNaN(d.getTime())) return valor; return d.toLocaleString(); }
    catch { return valor; }
  };

  return (
    <>
      <div className="card" style={{maxWidth:900}}>
        <h2 style={{ marginTop:0 }}>Registro de Licencias</h2>
        <div style={{ color:'var(--muted)', marginBottom:10 }}>
          Usuario: <b>{usuario}</b> {esAdmin && <span className="badge" style={{marginLeft:8}}>Admin</span>}
        </div>

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="full">
            <label>Cliente</label>
            <input type="text" value={cliente} onChange={(e)=>setCliente(e.target.value)} required placeholder="Cliente S.A." />
          </div>
          <div>
            <label>Cantidad de Licencias</label>
            <input type="number" value={cantidadLicencias} onChange={(e)=>setCantidadLicencias(e.target.value)} required min="1" />
          </div>
          <div>
            <label>Fecha de Expiración</label>
            <input type="date" value={fechaExpiracion} onChange={(e)=>setFechaExpiracion(e.target.value)} required />
          </div>
          <div>
            <label>Hora de Expiración</label>
            <input type="time" step="1" value={horaExpiracion} onChange={(e)=>setHoraExpiracion(e.target.value)} required />
          </div>
          <div className="full" style={{display:'flex', gap:8}}>
            <button type="submit" className="btn btn-green">Guardar</button>
            <button type="button" className="btn btn-ghost" onClick={()=>navigate('/')}>Salir</button>
          </div>
        </form>

        {mensaje && <p style={{ marginTop: 8 }}>{mensaje}</p>}
      </div>

      <div className="toolbar" style={{maxWidth:1100, margin:'0 auto'}}>
        <h3 style={{ margin:0 }}>Registros Guardados</h3>
        <form className="search" onSubmit={handleBuscar}>
          <input
            type="text"
            placeholder="Buscar por cliente o código"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Buscar</button>
        </form>
      </div>

      <div className="table-wrap" style={{maxWidth:1100, margin:'0 auto 24px'}}>
        <table>
          <thead>
            <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Cantidad</th>
            <th>Usados</th> {/* nuevo */}
            <th>Fecha Expiración</th>
            <th>Código</th>
            <th>Creado por</th>
            <th>Acción</th>
          </tr>
        </thead>
          <tbody>
  {registros.map((reg)=>(
    <tr key={reg.id}>
      <td>{reg.id}</td>
      <td>{reg.cliente}</td>
      <td>{reg.cantidadLicencias}</td>
      <td>
        <span className="badge" style={{background:'#222', color:'#fff', border:'1px solid #333'}}>
          {reg.contador ?? 0}
        </span>
      </td>
      <td>{formatearFechaHora(reg.fechaExpiracion)}</td>
      <td style={{ wordBreak:'break-all', maxWidth:280 }}>{reg.qrCodigo || ''}</td>
      <td><span className="badge" style={{background:'#fff', color:'#111'}}>{reg.creadoPor}</span></td>
      <td><button className="btn btn-primary" onClick={()=>abrirQR(reg.id, reg.qrCodigo)}>Ver QR</button></td>
    </tr>
  ))}
  {registros.length===0 && (
    <tr><td colSpan="8" style={{ textAlign:'center', color:'var(--muted)' }}>Sin resultados</td></tr>
  )}
</tbody>

        </table>
      </div>

      {/* MODAL QR */}
      {mostrarModal && (
        <div className="modal-back" onClick={cerrarQR}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <h3>QR de Licencia #{idSeleccionado}</h3>
            <div className="qr-box">
              <QRCodeCanvas value={qrSeleccionado || ''} size={256} includeMargin ref={qrCanvasRef} />
              <div style={{ fontSize:'.85rem', color:'var(--muted)', wordBreak:'break-all' }}>{qrSeleccionado}</div>
            </div>
            <div className="actions">
              <button className="btn btn-ghost" onClick={cerrarQR}>Cerrar</button>
              <button className="btn btn-primary" onClick={descargarQR}>Descargar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Registro;
