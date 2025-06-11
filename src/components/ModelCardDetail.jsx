import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Accordion } from 'react-bootstrap';

const ModelCardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const modelCards = JSON.parse(localStorage.getItem('modelCards') || '[]');
  const card = modelCards[id];

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${card?.['Model Details']?.Name || 'model_card'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  };

  if (!card) return <div className="container mt-4">Model card not found.</div>;

  const renderObject = (obj) => {
    if (Array.isArray(obj)) {
      return (
        <ul>
          {obj.map((item, i) => (
            <li key={i}>{renderObject(item)}</li>
          ))}
        </ul>
      );
    } else if (typeof obj === 'object' && obj !== null) {
      return (
        <div className="ms-3">
          {Object.entries(obj).map(([key, value]) => (
            <div key={key} className="mb-2">
              <strong>{key}:</strong> {renderObject(value)}
            </div>
          ))}
        </div>
      );
    } else {
      return <span>{String(obj)}</span>;
    }
  };

  return (
    <div className="container py-4">
      <h2>Model Card Details</h2>
      <div className="mb-3">
        <button className="btn btn-secondary me-2" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button className="btn btn-primary me-2" onClick={() => navigate(`/edit/${id}`)}>
            Edit
        </button>
        <button className="btn btn-success" onClick={handleDownload}>
          Download JSON
        </button>
      </div>

      <Accordion defaultActiveKey="0">
        {Object.entries(card).map(([sectionName, sectionData], i) => (
          <Accordion.Item eventKey={String(i)} key={sectionName}>
            <Accordion.Header>{sectionName}</Accordion.Header>
            <Accordion.Body>{renderObject(sectionData)}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default ModelCardDetail;
