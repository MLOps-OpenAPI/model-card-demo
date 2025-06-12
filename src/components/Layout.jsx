import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/home" className="d-flex align-items-center">
            <img
              src="./Aether.png" 
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
            />
            æther
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/modelcardupload">Upload Model Cards</Nav.Link>
              <Nav.Link as={Link} to="/marketplace">Model Card Library</Nav.Link>
              <Nav.Link as={Link} to="/create">Create Model Card</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>{children}</Container>
    </>
  );
};

export default Layout;
