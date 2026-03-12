import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './StationSearch.css';

const StationSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('请输入车站名称');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:3001/api/stations/search', {
        params: { q: searchTerm }
      });

      if (response.data && response.data.success) {
        setResults(response.data.data);
        if (response.data.data.length === 0) {
          setError('未找到匹配的车站');
        }
      } else {
        setError('搜索失败，请稍后重试');
      }
    } catch (err) {
      console.error('搜索失败:', err);
      setError('搜索失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStationClick = (station) => {
    // 将选中的车站传递给父组件
    if (window.onStationSelect) {
      window.onStationSelect(station);
    }
  };

  return (
    <Container className="station-search-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="search-card">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                🔍 搜索车站
              </Card.Title>
              
              <InputGroup className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="输入车站名称（如：北京、上海、广州）"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  variant="primary" 
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    '搜索'
                  )}
                </Button>
              </InputGroup>

              {error && (
                <div className="alert alert-warning" role="alert">
                  {error}
                </div>
              )}

              {results.length > 0 && (
                <div className="search-results">
                  <h6>搜索结果 ({results.length})</h6>
                  {results.map((station, index) => (
                    <Card 
                      key={index} 
                      className="station-card mb-2"
                      onClick={() => handleStationClick(station)}
                    >
                      <Card.Body>
                        <div className="station-info">
                          <h5>{station.properties?.name || station.name}</h5>
                          <div className="station-details">
                            <span className="badge bg-secondary">
                              {station.properties?.railway || station.railway}
                            </span>
                            {station.properties?.operator && (
                              <span className="badge bg-info">
                                {station.properties.operator}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StationSearch;