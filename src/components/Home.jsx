import React, { useState, useEffect } from "react";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [modelCards, setModelCards] = useState([]);

  useEffect(() => {
    const storedCards = JSON.parse(localStorage.getItem("modelCards")) || [];
    setModelCards(storedCards.slice(0, 3)); // Show top 3 cards as preview
  }, []);

  const handleCreate = () => navigate("/create");

  return (
    <Container className="my-4">
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col xs={2}>
          <img src="./Aether.png" alt="Logo" className="img-fluid" />
        </Col>
        <Col>
          <h1 className="display-5">AI Model Card Hub</h1>
          <p className="text-muted">Upload, Create, and Explore Model Cards</p>
        </Col>
      </Row>

      {/* Buttons */}
      <Row className="mb-4">
        <Col md={6} className="d-grid mb-2">
          <Button variant="primary" onClick={() => navigate(`/modelcardupload`)}>
            Upload Model Card
          </Button>
        </Col>
        <Col md={6} className="d-grid mb-2">
          <Button variant="success" onClick={handleCreate}>
            Create New Model Card
          </Button>
        </Col>
      </Row>

      {/* Preview section */}
      <h4 className="mb-3">Recently Added</h4>
      <Row>
        {modelCards.length > 0 ? (
          modelCards.map((card, index) => {
            const details = card["identity_and_basic_information"] || {};
            return (
              <Col md={4} key={index} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{details.model_name || "Untitled Model"}</Card.Title>
                    <Card.Text>
                      {details.overview?.substring(0, 100) || "No description available."}
                    </Card.Text>
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate(`/card/${index}`)}
                    >
                      View
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <p>No model cards available yet.</p>
        )}
      </Row>
    </Container>
  );
};

export default Home;
