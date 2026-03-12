const express = require('express');
const router = express.Router();

// 导入各个路由模块
const railwayRoutes = require('./railways');
const stationRoutes = require('./stations');
const mapRoutes = require('./map');

// 注册路由
router.use('/railways', railwayRoutes);
router.use('/stations', stationRoutes);
router.use('/map', mapRoutes);

// API 信息
router.get('/', (req, res) => {
  res.json({
    name: 'China Railway Map API',
    version: '1.0.0',
    endpoints: {
      railways: '/api/railways',
      stations: '/api/stations',
      map: '/api/map'
    }
  });
});

module.exports = router;