# 中国铁路地图系统

基于 OpenLayers、React、Node.js、Express、PostgreSQL + PostGIS 和 GeoServer 的中国铁路在线地图系统。

## 技术栈

- **前端**: React + OpenLayers + Bootstrap
- **后端**: Node.js + Express
- **数据库**: PostgreSQL + PostGIS
- **地图服务**: GeoServer
- **数据源**: OpenStreetMap (OSM)

## 项目结构

```
FullTrain/
├── client/              # React 前端
├── server/              # Express 后端
├── data/                # 数据文件
├── scripts/             # 数据处理脚本
├── config/              # 配置文件
└── docs/                # 文档
```

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并配置数据库连接信息。

### 3. 启动开发服务器

```bash
# 启动后端服务器
npm run dev:server

# 启动前端开发服务器
npm run dev:client
```

## 数据库设置

### 1. 安装 PostgreSQL 和 PostGIS

```bash
# Windows: 下载安装 PostgreSQL (包含 PostGIS)
# https://www.postgresql.org/download/windows/
```

### 2. 创建数据库

```sql
CREATE DATABASE china_railway;
\c china_railway
CREATE EXTENSION postgis;
CREATE EXTENSION hstore;
```

### 3. 导入数据

运行数据处理脚本导入 OSM 铁路数据。

## GeoServer 设置

1. 下载并安装 GeoServer: https://geoserver.org/
2. 创建工作空间和数据存储
3. 发布地图图层
4. 配置 WMS/WMTS 服务

## 功能特性

- 🗺️ 交互式地图显示
- 🚂 铁路线路和车站信息
- 🔍 车站搜索功能
- 📊 时刻表信息展示
- 🎨 现代化 UI 设计

## 开发计划

- [x] 项目基础架构
- [ ] 后端 API 开发
- [ ] 前端地图组件
- [ ] 数据导入脚本
- [ ] GeoServer 集成
- [ ] 测试和优化

## 许可证

MIT