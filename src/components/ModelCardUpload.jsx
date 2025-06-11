import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ModelCardManager = () => {
  const [modelCards, setModelCards] = useState(() => {
    const stored = localStorage.getItem('modelCards');
    return stored ? JSON.parse(stored) : [];
  });

  const navigate = useNavigate();

  const handleDelete = (indexToDelete) => {
    const updatedCards = modelCards.filter((_, index) => index !== indexToDelete);
    setModelCards(updatedCards);
    localStorage.setItem('modelCards', JSON.stringify(updatedCards));
  };

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem('modelCards', JSON.stringify(modelCards));
  }, [modelCards]);

  const handleUpload = (e) => {
    const files = e.target.files;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          setModelCards((prev) => [...prev, json]);
        } catch (err) {
          alert(`Invalid JSON: ${file.name}`);
        }
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="container mt-4">
      <h2>Upload Model Cards</h2>
      <input type="file" accept=".json" multiple onChange={handleUpload} className="form-control mb-3" />
      <div className="row">
        {modelCards.map((card, index) => (
          <div className="col-md-4" key={index}>
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{card["identity_and_basic_information"]?.model_name || `Card ${index + 1}`}</h5>
                <p className="card-text">{card["identity_and_basic_information"]?.overview || 'No description available.'}</p>
                <button className="btn btn-primary me-2" onClick={() => navigate(`/card/${index}`)}>
                  View Full Card
                </button>
                <button className='btn btn-danger me-2' onClick={() => handleDelete(index)}>
                  Delete
                </button>
                <button onClick={() => navigate(`/edit/${index}`)} className="btn btn-light btn btn-outline-secondary me-2">
                  Edit 
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelCardManager;
