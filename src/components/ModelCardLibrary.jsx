import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ModelMarketplace = () => {
  const [modelCards, setModelCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedCards = JSON.parse(localStorage.getItem('modelCards')) || [];
    setModelCards(storedCards);
  }, []);

  const handleDelete = (indexToDelete) => {
    const updatedCards = modelCards.filter((_, index) => index !== indexToDelete);
    setModelCards(updatedCards);
    localStorage.setItem('modelCards', JSON.stringify(updatedCards));
  };

  const filteredCards = modelCards.filter((card) =>
    card['identity_and_basic_information']?.model_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Model Card Library</h2>
      <Form className="mb-4">
        <Form.Group controlId="searchBar">
          <Form.Control
            type="text"
            placeholder="Search model cards by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
      </Form>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredCards.map((card, index) => (
          <Col key={index}>
            <Card>
              <Card.Body>
                <Card.Title>{card['identity_and_basic_information']?.model_name || 'Unnamed Model'}</Card.Title>
                <Card.Text>{card['identity_and_basic_information']?.overview}</Card.Text>
                <Button as={Link} to={`/card/${index}`} variant="primary" className="me-2">
                  View Full Card
                </Button>
                <Button variant="danger" onClick={() => handleDelete(index)} className="me-2">
                  Delete
                </Button>
                <Button as={Link} to={`/edit/${index}`} variant="btn btn-light btn btn-outline-secondary" className="me-2">
                  Edit 
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ModelMarketplace;

