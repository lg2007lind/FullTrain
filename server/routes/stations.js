const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 获取所有车站
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, search } = req.query;
    
    let sql = `
      SELECT 
        osmid,
        name,
        railway,
        operator,
        tags,
        ST_AsGeoJSON(way) as geom
      FROM planet_osm_point
      WHERE railway IN ('station', 'halt', 'stop')
    `;
    let params = [];
    
    if (search) {
      sql += ` AND name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }
    
    sql += ` ORDER BY name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    
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

// 搜索车站
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: '缺少搜索关键词'
      });
    }
    
    const sql = `
      SELECT 
        osmid,
        name,
        railway,
        operator,
        tags,
        ST_AsGeoJSON(way) as geom
      FROM planet_osm_point
      WHERE railway IN ('station', 'halt', 'stop')
      AND name ILIKE $1
      ORDER BY name
      LIMIT 20
    `;
    
    const result = await query(sql, [`%${q}%`]);
    
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

// 获取指定车站详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT 
        osmid,
        name,
        railway,
        operator,
        tags,
        ST_AsGeoJSON(way) as geom
      FROM planet_osm_point
      WHERE osmid = $1
    `;
    
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '车站不存在'
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

// 获取附近的车站
router.get('/:id/nearby', async (req, res) => {
  try {
    const { id } = req.params;
    const { radius = 5000 } = req.query; // 默认 5km
    
    // 首先获取指定车站的位置
    const stationSql = `
      SELECT way
      FROM planet_osm_point
      WHERE osmid = $1
    `;
    
    const stationResult = await query(stationSql, [id]);
    
    if (stationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '车站不存在'
      });
    }
    
    const point = stationResult.rows[0].way;
    
    // 查找附近的车站
    const nearbySql = `
      SELECT 
        osmid,
        name,
        railway,
        operator,
        tags,
        ST_AsGeoJSON(way) as geom,
        ST_Distance(way, $1) as distance
      FROM planet_osm_point
      WHERE railway IN ('station', 'halt', 'stop')
      AND osmid != $2
      AND ST_DWithin(way, $1, $3)
      ORDER BY distance
      LIMIT 10
    `;
    
    const result = await query(nearbySql, [point, id, radius]);
    
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