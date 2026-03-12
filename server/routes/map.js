const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// 获取地图瓦片数据（从 GeoServer）
router.get('/tiles/:z/:x/:y', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const geoserverUrl = process.env.GEOSERVER_URL;
    const workspace = process.env.GEOSERVER_WORKSPACE || 'china_railway';
    
    // 重定向到 GeoServer WMS 服务
    const tileUrl = `${geoserverUrl}/${workspace}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${workspace}:railway_line,${workspace}:station_point&styles=&bbox=${getTileBBox(z, x, y)}&width=256&height=256&srs=EPSG:3857&format=image/png`;
    
    res.redirect(tileUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取指定区域的地理数据
router.get('/features', async (req, res) => {
  try {
    const { type, minLat, maxLat, minLon, maxLon } = req.query;
    
    if (!minLat || !maxLat || !minLon || !maxLon) {
      return res.status(400).json({
        success: false,
        error: '缺少必要的边界参数'
      });
    }
    
    let sql = '';
    let params = [minLon, minLat, maxLon, maxLat];
    
    if (type === 'railways') {
      sql = `
        SELECT 
          id,
          name,
          railway,
          operator,
          ST_AsGeoJSON(way) as geometry,
          jsonb_build_object(
            'name', name,
            'railway', railway,
            'operator', operator
          ) as properties
        FROM planet_osm_line
        WHERE railway IN ('rail', 'light_rail', 'subway', 'tram')
        AND ST_Intersects(
          way,
          ST_MakeEnvelope($1, $2, $3, $4, 4326)
        )
      `;
    } else if (type === 'stations') {
      sql = `
        SELECT 
          osmid,
          name,
          railway,
          operator,
          ST_AsGeoJSON(way) as geometry,
          jsonb_build_object(
            'name', name,
            'railway', railway,
            'operator', operator
          ) as properties
        FROM planet_osm_point
        WHERE railway IN ('station', 'halt', 'stop')
        AND ST_Intersects(
          way,
          ST_MakeEnvelope($1, $2, $3, $4, 4326)
        )
      `;
    } else {
      return res.status(400).json({
        success: false,
        error: '无效的类型参数，必须是 railways 或 stations'
      });
    }
    
    const result = await query(sql, params);
    
    // 构建 GeoJSON FeatureCollection
    const features = result.rows.map(row => ({
      type: 'Feature',
      geometry: JSON.parse(row.geometry),
      properties: row.properties
    }));
    
    res.json({
      type: 'FeatureCollection',
      features: features
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 辅助函数：计算瓦片边界
function getTileBBox(z, x, y) {
  const tileSize = 256;
  const initialResolution = 2 * Math.PI * 6378137 / tileSize;
  const originShift = 2 * Math.PI * 6378137 / 2;
  
  const resolution = initialResolution / Math.pow(2, z);
  const minx = x * tileSize * resolution - originShift;
  const miny = (Math.pow(2, z) - 1 - y) * tileSize * resolution - originShift;
  const maxx = (x + 1) * tileSize * resolution - originShift;
  const maxy = (Math.pow(2, z) - y) * tileSize * resolution - originShift;
  
  return `${minx},${miny},${maxx},${maxy}`;
}

module.exports = router;