# GeoServer 配置指南

## 安装 GeoServer

1. 下载 GeoServer
   - 官网: https://geoserver.org/release/stable/
   - 选择 Windows 独立版本
   - 解压到指定目录

2. 启动 GeoServer
   ```bash
   cd geoserver-2.23.x\bin
   startup.bat
   ```

3. 访问 GeoServer 管理界面
   - URL: http://localhost:8080/geoserver
   - 默认账号: admin / geoserver

## 创建工作空间

1. 登录 GeoServer 管理界面
2. 导航到 "工作空间" → "添加新的工作空间"
3. 配置:
   - 名称: `china_railway`
   - 命名空间 URI: `http://china-railway.org`
   - 勾选 "默认工作空间"

## 创建数据存储

### PostgreSQL 数据存储

1. 导航到 "存储库" → "添加新的存储库"
2. 选择 "PostGIS - PostGIS Database"
3. 配置连接参数:
   - 工作空间: `china_railway`
   - 数据源名称: `railway_db`
   - 数据库: `china_railway`
   - 主机: `localhost`
   - 端口: `5432`
   - 用户: `postgres`
   - 密码: `your_password`
   - Schema: `public`

4. 点击 "保存"

## 发布图层

### 发布铁路线图层

1. 导航到 "图层" → "添加新的资源"
2. 选择 `railway_db` 存储库
3. 配置图层:
   - 名称: `railway_line`
   - 标题: 中国铁路线路
   - 选择表: `planet_osm_line`
   - SRS: `EPSG:4326`
   
4. 在 "数据" 标签页:
   - 边界框: 自动计算
   - 坐标参考系统: `EPSG:4326`

5. 在 "发布" 标签页:
   - WMS 信息: 填写标题和摘要
   - 关键词: 铁路, 地图, China

6. 点击 "发布"

### 发布车站图层

1. 重复上述步骤
2. 配置:
   - 名称: `station_point`
   - 标题: 中国铁路车站
   - 选择表: `planet_osm_point`
   - SRS: `EPSG:4326`

## 配置图层样式

### 创建铁路线样式 (SLD)

1. 导航到 "样式" → "添加新的样式"
2. 名称: `railway_style`
3. 格式: `SLD`
4. 工作空间: `china_railway`

5. 编辑样式 XML:

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0" 
  xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" 
  xmlns="http://www.opengis.net/sld" 
  xmlns:ogc="http://www.opengis.net/ogc" 
  xmlns:xlink="http://www.w3.org/1999/xlink" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>railway_line</Name>
    <UserStyle>
      <Title>中国铁路线路样式</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>Railway Line</Name>
          <LineSymbolizer>
            <Stroke>
              <CssParameter name="stroke">#FF6B6B</CssParameter>
              <CssParameter name="stroke-width">2</CssParameter>
              <CssParameter name="stroke-opacity">1.0</CssParameter>
            </Stroke>
          </LineSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
```

### 创建车站样式 (SLD)

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<StyledLayerDescriptor version="1.0.0"
  xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>station_point</Name>
    <UserStyle>
      <Title>中国铁路车站样式</Title>
      <FeatureTypeStyle>
        <Rule>
          <Name>Station Point</Name>
          <PointSymbolizer>
            <Graphic>
              <Mark>
                <WellKnownName>circle</WellKnownName>
                <Fill>
                  <CssParameter name="fill">#4ECDC4</CssParameter>
                  <CssParameter name="fill-opacity">1.0</CssParameter>
                </Fill>
                <Stroke>
                  <CssParameter name="stroke">#FFFFFF</CssParameter>
                  <CssParameter name="stroke-width">2</CssParameter>
                </Stroke>
              </Mark>
              <Size>8</Size>
            </Graphic>
          </PointSymbolizer>
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>name</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">SimHei</CssParameter>
              <CssParameter name="font-size">12</CssParameter>
              <CssParameter name="font-weight">bold</CssParameter>
            </Font>
            <Fill>
              <CssParameter name="fill">#333333</CssParameter>
            </Fill>
            <VendorOption name="autoWrap">100</VendorOption>
            <VendorOption name="maxDisplacement">10</VendorOption>
          </TextSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
```

## 应用样式

1. 编辑 `railway_line` 图层
2. 在 "发布" 标签页
3. 在 "样式" 部分，添加 `railway_style` 作为默认样式
4. 保存

## 配置 WMS 服务

1. 导航到 "服务" → "WMS"
2. 确保 WMS 服务已启用
3. 配置级别: "基本" 或 "中间"
4. 保存

## 测试 WMS 服务

1. 在浏览器中访问:
   ```
   http://localhost:8080/geoserver/china_railway/wms?service=WMS&version=1.1.0&request=GetMap&layers=china_railway:railway_line&styles=&bbox=73,18,135,54&width=800&height=600&srs=EPSG:4326&format=image/png
   ```

2. 如果成功，应该看到中国铁路线路的地图

## 配置缓存 (可选)

为了提高性能，可以配置 GeoServer 缓存:

1. 导航到 "工具" → "GeoWebCache"
2. 创建新的缓存图层
3. 配置瓦片大小、格式等参数

## 常见问题

### 连接数据库失败

- 检查 PostgreSQL 服务是否启动
- 验证连接参数是否正确
- 确保数据库已启用 PostGIS 扩展

### 图层不显示

- 检查图层边界框是否正确
- 验证 SRS 设置
- 查看 GeoServer 日志

### 中文乱码

- 确保数据库使用 UTF-8 编码
- 在样式中指定中文字体
- 检查 GeoServer 的 JVM 参数

## 性能优化

1. 启用数据库索引
2. 配置空间索引
3. 使用缓存
4. 优化查询条件
5. 限制返回的数据量