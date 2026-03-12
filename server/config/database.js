const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'china_railway',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 测试数据库连接
pool.on('connect', () => {
  console.log('✅ 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('❌ 数据库连接错误:', err);
  process.exit(-1);
});

// 查询函数
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 查询执行时间:', duration, 'ms');
    return res;
  } catch (error) {
    console.error('❌ 查询错误:', error);
    throw error;
  }
};

// 地理查询函数
const geoQuery = async (text, params) => {
  try {
    const result = await query(text, params);
    // 处理几何数据，转换为 GeoJSON 格式
    if (result.rows && result.rows.length > 0) {
      result.rows = result.rows.map(row => {
        if (row.geom) {
          row.geom = JSON.parse(row.geom);
        }
        if (row.way) {
          row.way = JSON.parse(row.way);
        }
        return row;
      });
    }
    return result;
  } catch (error) {
    console.error('❌ 地理查询错误:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  geoQuery,
};