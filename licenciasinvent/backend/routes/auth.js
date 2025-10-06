const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('usuario', sql.NVarChar, usuario)
      .input('contrasena', sql.NVarChar, contrasena)
      .query(`
        SELECT TOP 1 usuario, esAdmin
        FROM Usuarios
        WHERE usuario = @usuario AND contrasena = @contrasena
      `);

    if (result.recordset.length > 0) {
      const { usuario: u, esAdmin } = result.recordset[0];
      res.json({ success: true, message: 'Login exitoso', usuario: u, esAdmin: !!esAdmin });
    } else {
      res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
