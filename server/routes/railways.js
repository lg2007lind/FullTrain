const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 获取所有铁路线路
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const sql = `
      SELECT 
        id,
        name,
        railway,
        operator,
        tags,
        ST_AsGeoJSON(way) as geom
      FROM planet_osm_line
      WHERE railway IN ('rail', 'light_rail', 'subway', 'tram')
      ORDER BY name
      LIMIT $1 OFFSET $2
    `;
    
    const result = await query(sql, [limit, offset]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取指定线路详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        id,
        name,
        railway,
        operator,
        tags,
        ST_AsGeoJSON(way) as geom
      FROM planet_osm_line
      WHERE id = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '线路不存在'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取指定区域的铁路线路
router.get('/bounds', async (req, res) => {
  try {
    const { minLat, maxLat, minLon, maxLon } = req.query;
    
    if (!minLat || !maxLat || !minLon || !maxLon) {
      return res.status(400).json({
        success: false,
        error: '缺少必要的边界参数'
      });
    }
    
    const sql = `
      SELECT 
        id,
        name,
        railway,
        operator,
        tags,
        ST_AsGeoJSON(way) as geom
      FROM planet_osm_line
      WHERE railway IN ('rail', 'light_rail', 'subway', 'tram')
      AND ST_Intersects(
        way,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
    `;
    
    const result = await query(sql, [minLon, minLat, maxLon, maxLat]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;