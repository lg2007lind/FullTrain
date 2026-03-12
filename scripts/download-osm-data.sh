#!/bin/bash

# OSM 数据下载脚本
# 用于下载中国区域的 OSM 数据

set -e

echo "🌍 下载中国 OSM 数据..."

# 数据源: Geofabrik
DATA_URL="https://download.geofabrik.de/asia/china-latest.osm.pbf"
DATA_DIR="../data"
DATA_FILE="${DATA_DIR}/china-latest.osm.pbf"

# 创建数据目录
mkdir -p "$DATA_DIR"

# 检查文件是否已存在
if [ -f "$DATA_FILE" ]; then
    echo "⚠️  文件已存在: $DATA_FILE"
    read -p "是否重新下载? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 取消下载"
        exit 0
    fi
    rm "$DATA_FILE"
fi

# 下载数据
echo "⏳ 正在下载..."
echo "📁 保存位置: $DATA_FILE"

if command -v wget &> /dev/null; then
    wget -O "$DATA_FILE" "$DATA_URL"
elif command -v curl &> /dev/null; then
    curl -o "$DATA_FILE" "$DATA_URL"
else
    echo "❌ 错误: 需要安装 wget 或 curl"
    exit 1
fi

# 检查下载是否成功
if [ -f "$DATA_FILE" ]; then
    FILE_SIZE=$(du -h "$DATA_FILE" | cut -f1)
    echo "✅ 下载完成!"
    echo "📦 文件大小: $FILE_SIZE"
    echo "💡 现在可以运行导入脚本: node scripts/import-osm-data.js"
else
    echo "❌ 下载失败"
    exit 1
fi