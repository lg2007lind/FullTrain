#!/usr/bin/env node

/**
 * OSM 数据导入脚本
 * 
 * 此脚本用于将 OSM PBF 格式的铁路数据导入到 PostgreSQL 数据库
 * 
 * 使用方法:
 * node scripts/import-osm-data.js
 * 
 * 前置条件:
 * 1. 安装 osm2pgsql: https://osm2pgsql.org/
 * 2. 下载 OSM PBF 数据: https://download.geofabrik.de/asia/china.html
 * 3. 确保 PostgreSQL 和 PostGIS 已安装
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
  // 数据库配置
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || 5432,
  dbName: process.env.DB_NAME || 'china_railway',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD,
  
  // OSM 数据文件路径
  osmDataPath: path.join(__dirname, '../data/china-latest.osm.pbf'),
  
  // osm2pgsql 配置
  osm2pgsqlPath: 'osm2pgsql', // 确保 osm2pgsql 在 PATH 中
  styleFile: path.join(__dirname, 'osm2pgsql.style'),
  cacheSize: 2000, // MB
  numberProcesses: 4,
};

// 验证配置
function validateConfig() {
  console.log('📋 验证配置...');
  
  if (!fs.existsSync(config.osmDataPath)) {
    console.error('❌ OSM 数据文件不存在:', config.osmDataPath);
    console.log('💡 请从 https://download.geofabrik.de/asia/china.html 下载中国 OSM 数据');
    return false;
  }
  
  if (!fs.existsSync(config.styleFile)) {
    console.error('❌ osm2pgsql 样式文件不存在:', config.styleFile);
    return false;
  }
  
  console.log('✅ 配置验证通过');
  return true;
}

// 检查数据库连接
function checkDatabaseConnection() {
  console.log('🔍 检查数据库连接...');
  
  try {
    execSync(`PGPASSWORD=${config.dbPassword} psql -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -c "SELECT 1"`, {
      stdio: 'pipe'
    });
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 创建数据库表
function createTables() {
  console.log('📊 创建数据库表...');
  
  const sqlCommands = [
    // 创建扩展
    'CREATE EXTENSION IF NOT EXISTS postgis;',
    'CREATE EXTENSION IF NOT EXISTS hstore;',
    
    // 创建铁路线表
    `CREATE TABLE IF NOT EXISTS planet_osm_line (
      osmid BIGINT PRIMARY KEY,
      way GEOMETRY(LineString,4326),
      tags HSTORE
    );`,
    
    // 创建车站表
    `CREATE TABLE IF NOT EXISTS planet_osm_point (
      osmid BIGINT PRIMARY KEY,
      way GEOMETRY(Point,4326),
      tags HSTORE
    );`,
    
    // 创建索引
    'CREATE INDEX IF NOT EXISTS idx_planet_osm_line_way ON planet_osm_line USING GIST (way);',
    'CREATE INDEX IF NOT EXISTS idx_planet_osm_point_way ON planet_osm_point USING GIST (way);',
    'CREATE INDEX IF NOT EXISTS idx_planet_osm_line_tags ON planet_osm_line USING GIN (tags);',
    'CREATE INDEX IF NOT EXISTS idx_planet_osm_point_tags ON planet_osm_point USING GIN (tags);',
  ];
  
  try {
    for (const sql of sqlCommands) {
      execSync(`PGPASSWORD=${config.dbPassword} psql -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -c "${sql}"`, {
        stdio: 'pipe'
      });
    }
    console.log('✅ 数据库表创建成功');
    return true;
  } catch (error) {
    console.error('❌ 创建数据库表失败:', error.message);
    return false;
  }
}

// 导入 OSM 数据
function importOSMData() {
  console.log('🚂 开始导入 OSM 数据...');
  console.log(`📁 数据文件: ${config.osmDataPath}`);
  
  const command = [
    config.osm2pgsqlPath,
    `-H ${config.dbHost}`,
    `-P ${config.dbPort}`,
    `-U ${config.dbUser}`,
    `-d ${config.dbName}`,
    `-c`, // 清除现有数据
    `--hstore`, // 存储 tags
    `--style ${config.styleFile}`,
    `-C ${config.cacheSize}`,
    `--number-processes ${config.numberProcesses}`,
    config.osmDataPath
  ].join(' ');
  
  try {
    console.log('⏳ 导入中，这可能需要几分钟时间...');
    execSync(command, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PGPASSWORD: config.dbPassword
      }
    });
    console.log('✅ OSM 数据导入成功');
    return true;
  } catch (error) {
    console.error('❌ OSM 数据导入失败:', error.message);
    return false;
  }
}

// 验证导入结果
function verifyImport() {
  console.log('🔍 验证导入结果...');
  
  try {
    const result = execSync(`PGPASSWORD=${config.dbPassword} psql -h ${config.dbHost} -p ${config.dbPort} -U ${config.dbUser} -d ${config.dbName} -t -c "SELECT COUNT(*) FROM planet_osm_line WHERE tags ? 'railway'"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const count = parseInt(result.trim());
    console.log(`✅ 导入了 ${count} 条铁路记录`);
    return true;
  } catch (error) {
    console.error('❌ 验证导入结果失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 开始 OSM 数据导入流程\n');
  
  try {
    // 验证配置
    if (!validateConfig()) {
      process.exit(1);
    }
    
    // 检查数据库连接
    if (!checkDatabaseConnection()) {
      process.exit(1);
    }
    
    // 创建数据库表
    if (!createTables()) {
      process.exit(1);
    }
    
    // 导入 OSM 数据
    if (!importOSMData()) {
      process.exit(1);
    }
    
    // 验证导入结果
    if (!verifyImport()) {
      process.exit(1);
    }
    
    console.log('\n🎉 OSM 数据导入完成！');
    console.log('💡 现在可以启动应用查看地图了');
    
  } catch (error) {
    console.error('❌ 导入过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行主函数
main();