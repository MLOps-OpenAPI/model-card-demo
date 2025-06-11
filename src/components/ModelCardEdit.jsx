import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DynamicModelForm from './ModelCardTemplate';

function ModelCardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('modelCards')) || [];
    const dataToEdit = stored[parseInt(id)];
    if (dataToEdit) {
      setInitialData(dataToEdit);
    } else {
      alert('Model card not found');
      navigate('/');
    }
  }, [id, navigate]);

  const handleUpdate = (updatedData) => {
    const stored = JSON.parse(localStorage.getItem('modelCards')) || [];
    stored[parseInt(id)] = updatedData;
    localStorage.setItem('modelCards', JSON.stringify(stored));
    alert('Model Card Updated!');
    navigate(`/card/${id}`); //redirect to the details page
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate(`/card/${id}`);
  };

  if (!initialData) return <div>Loading...</div>;

  return (
    <DynamicModelForm
      initialData={initialData}
      isEdit={true}
      onSave={handleUpdate}
      onCancel={handleCancel}
      onChange={() => setHasChanges(true)}
    />
  );
}

export default ModelCardEdit;
