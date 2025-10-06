const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

/**
 * POST /api/records/guardar
 * body: { cliente, cantidadLicencias, fechaExpiracion, creadoPor }
 */
router.post('/guardar', async (req, res) => {
  const { cliente, cantidadLicencias, fechaExpiracion, creadoPor } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('cliente', sql.NVarChar, cliente)
      .input('cantidadLicencias', sql.Int, cantidadLicencias)
      .input('fechaExpiracion', sql.DateTime2, fechaExpiracion)
      .input('creadoPor', sql.NVarChar, creadoPor)
      .query(`
        DECLARE @qr NVARCHAR(200) = CONCAT(CONVERT(VARCHAR(36), NEWID()), '|', CONVERT(VARCHAR(19), @fechaExpiracion, 120));

        INSERT INTO Registros (cliente, cantidadLicencias, fechaExpiracion, qrCodigo, creadoPor,contador)
        VALUES (@cliente, @cantidadLicencias, @fechaExpiracion, @qr, @creadoPor,0);

        SELECT SCOPE_IDENTITY() AS id, @qr AS qrCodigo;
      `);

    const inserted = result.recordset?.[0];
    res.json({
      success: true,
      message: 'Registro guardado correctamente',
      id: inserted?.id,
      qrCodigo: inserted?.qrCodigo
    });
  } catch (err) {
    console.error('Error al guardar el registro:', err);
    res.status(500).json({ success: false, message: 'Error al guardar el registro' });
  }
});

/**
 * GET /api/records/listar
 * query: usuario, esAdmin (0/1), q (buscador opcional)
 */
router.get('/listar', async (req, res) => {
  try {
    const { usuario, esAdmin, q } = req.query;
    const pool = await poolPromise;
    const request = pool.request();

    let where = '';
    if (esAdmin !== '1') {
      where = 'WHERE creadoPor = @usuario';
      request.input('usuario', sql.NVarChar, usuario || '');
    }

    if (q && q.trim() !== '') {
      // busco en cliente o qrCodigo
      if (where) {
        where += ' AND (cliente LIKE @q OR qrCodigo LIKE @q)';
      } else {
        where = 'WHERE (cliente LIKE @q OR qrCodigo LIKE @q)';
      }
      request.input('q', sql.NVarChar, `%${q}%`);
    }

    const query = `
      SELECT id, cliente, cantidadLicencias, fechaExpiracion, qrCodigo, creadoPor, contador
      FROM Registros
      ${where}
      ORDER BY id DESC
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener registros:', err);
    res.status(500).json({ message: 'Error al obtener los registros' });
  }
});

module.exports = router;
