@echo off
REM OSM 数据下载脚本 (Windows 版本)

echo 🌍 下载中国 OSM 数据...

REM 数据源: Geofabrik
set DATA_URL=https://download.geofabrik.de/asia/china-latest.osm.pbf
set DATA_DIR=..\data
set DATA_FILE=%DATA_DIR%\china-latest.osm.pbf

REM 创建数据目录
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

REM 检查文件是否已存在
if exist "%DATA_FILE%" (
    echo ⚠️  文件已存在: %DATA_FILE%
    set /p REPLY="是否重新下载? (y/n): "
    if /i not "%REPLY%"=="y" (
        echo ❌ 取消下载
        exit /b 0
    )
    del "%DATA_FILE%"
)

REM 下载数据
echo ⏳ 正在下载...
echo 📁 保存位置: %DATA_FILE%

REM 使用 curl 下载
curl -o "%DATA_FILE%" "%DATA_URL%"

REM 检查下载是否成功
if exist "%DATA_FILE%" (
    echo ✅ 下载完成!
    echo 💡 现在可以运行导入脚本: node scripts\import-osm-data.js
) else (
    echo ❌ 下载失败
    exit /b 1
)