import React, { useState } from 'react';
import { Container, Navbar, Nav, Form, Button } from 'react-bootstrap';
import RailwayMap from './components/RailwayMap';
import StationSearch from './components/StationSearch';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedStation, setSelectedStation] = useState(null);

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setActiveTab('map');
  };

  return (
    <div className="app">
      <Navbar bg="dark" variant="dark" expand="lg" className="app-navbar">
        <Container>
          <Navbar.Brand href="#">
            🚂 中国铁路地图
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                active={activeTab === 'map'} 
                onClick={() => setActiveTab('map')}
              >
                地图
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'search'} 
                onClick={() => setActiveTab('search')}
              >
                搜索车站
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="app-main">
        {activeTab === 'map' && (
          <RailwayMap selectedStation={selectedStation} />
        )}
        {activeTab === 'search' && (
          <StationSearch onStationSelect={handleStationSelect} />
        )}
      </main>
    </div>
  );
}

export default App;