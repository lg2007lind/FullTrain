import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import axios from 'axios';
import './RailwayMap.css';

const RailwayMap = ({ selectedStation }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [stationInfo, setStationInfo] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // 初始化地图
    const map = new Map({
      target: mapRef.current,
      layers: [
        // 底图层
        new TileLayer({
          source: new OSM(),
        }),
        // 铁路线层
        new VectorLayer({
          source: new VectorSource(),
          style: new Style({
            stroke: new Stroke({
              color: '#FF6B6B',
              width: 2,
            }),
          }),
        }),
        // 车站层
        new VectorLayer({
          source: new VectorSource(),
          style: new Style({
            image: new CircleStyle({
              radius: 5,
              fill: new Fill({ color: '#4ECDC4' }),
              stroke: new Stroke({ color: '#fff', width: 2 }),
            }),
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([116.4074, 39.9042]), // 北京
        zoom: 4,
      }),
    });

    mapInstance.current = map;

    // 加载铁路数据
    loadRailwayData(map);

    return () => {
      map.setTarget(null);
    };
  }, []);

  // 当选择的车站改变时，移动地图
  useEffect(() => {
    if (selectedStation && mapInstance.current) {
      const coords = selectedStation.geom?.coordinates;
      if (coords) {
        const view = mapInstance.current.getView();
        view.animate({
          center: fromLonLat(coords),
          zoom: 12,
          duration: 1000,
        });
        setStationInfo(selectedStation);
      }
    }
  }, [selectedStation]);

  const loadRailwayData = async (map) => {
    setLoading(true);
    try {
      // 加载中国区域的铁路数据
      const bounds = {
        minLat: 18,
        maxLat: 54,
        minLon: 73,
        maxLon: 135
      };

      const response = await axios.get('http://localhost:3001/api/map/features', {
        params: {
          type: 'railways',
          ...bounds
        }
      });

      if (response.data && response.data.features) {
        const railwayLayer = map.getLayers().getArray()[1];
        const source = railwayLayer.getSource();
        
        const features = new GeoJSON().readFeatures(response.data, {
          featureProjection: 'EPSG:3857'
        });
        
        source.addFeatures(features);
      }
    } catch (error) {
      console.error('加载铁路数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStationData = async (map) => {
    try {
      const bounds = {
        minLat: 18,
        maxLat: 54,
        minLon: 73,
        maxLon: 135
      };

      const response = await axios.get('http://localhost:3001/api/map/features', {
        params: {
          type: 'stations',
          ...bounds
        }
      });

      if (response.data && response.data.features) {
        const stationLayer = map.getLayers().getArray()[2];
        const source = stationLayer.getSource();
        
        const features = new GeoJSON().readFeatures(response.data, {
          featureProjection: 'EPSG:3857'
        });
        
        source.addFeatures(features);
      }
    } catch (error) {
      console.error('加载车站数据失败:', error);
    }
  };

  const handleMapClick = async (event) => {
    const map = mapInstance.current;
    const coordinate = event.coordinate;
    const lonLat = toLonLat(coordinate);
    
    try {
      const response = await axios.get('http://localhost:3001/api/stations', {
        params: {
          limit: 5
        }
      });
      
      if (response.data && response.data.data) {
        console.log('附近车站:', response.data.data);
      }
    } catch (error) {
      console.error('获取车站信息失败:', error);
    }
  };

  return (
    <div className="railway-map-container">
      <div ref={mapRef} className="map" />
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <p>加载地图数据中...</p>
        </div>
      )}
      {stationInfo && (
        <div className="station-info-panel">
          <h5>{stationInfo.properties?.name}</h5>
          <p>类型: {stationInfo.properties?.railway}</p>
          <p>运营商: {stationInfo.properties?.operator || '未知'}</p>
        </div>
      )}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#FF6B6B' }}></span>
          <span>铁路线</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#4ECDC4' }}></span>
          <span>车站</span>
        </div>
      </div>
    </div>
  );
};

export default RailwayMap;