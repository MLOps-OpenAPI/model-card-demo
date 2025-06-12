import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Accordion } from 'react-bootstrap';
import schemaV1 from '../schemas/Model_Card_Template_Schema_v1.json';
import schemaV2 from '../schemas/Model_Card_Template_Schema_v2.json';
import schemaV3 from '../schemas/Model_Card_Template_Schema_v3.json';

const createEmptyDataFromSchema = (schema) => {
  if (!schema) return null;

  if ('default' in schema) return schema.default;

  if (schema.type === 'object' && schema.properties) {
    const obj = {};
    for (const key in schema.properties) {
      obj[key] = createEmptyDataFromSchema(schema.properties[key]);
    }
    return obj;
  }

  if (schema.type === 'array') return [];

  if (schema.type === 'string') {
    switch (schema.format) {
      case 'uri': return 'https://example.com';
      case 'email': return 'user@example.com';
      case 'date': return new Date().toISOString().split('T')[0];
      case 'date-time': return new Date().toISOString();
      case 'uuid': return '00000000-0000-0000-0000-000000000000';
      default: return '';
    }
  }

  if (schema.type === 'boolean') return false;
  if (schema.type === 'number' || schema.type === 'integer') return 0;

  return null;
};

function DynamicModelForm({ initialData = null, onSave, onCancel, onChange, isEdit = false }) {
  const schemaOptions = [
    { label: 'Model Card v1', schema: schemaV1 },
    { label: 'Model Card v2', schema: schemaV2 },
    { label: 'Model Card v3', schema: schemaV3 },
  ];

  const [selectedVersion, setSelectedVersion] = useState(schemaOptions[0]);
  const [schema, setSchema] = useState(schemaOptions[0].schema);
  const [formData, setFormData] = useState(null);
  const [fileName, setFileName] = useState(schemaOptions[0].label);

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData(initialData);
      // Try to infer schema from keys if needed, else fallback
      setSchema(schemaOptions.find(opt => Object.keys(opt.schema.properties).toString() === Object.keys(initialData).toString())?.schema || schemaOptions[0].schema);
    } else {
      setSchema(selectedVersion.schema);
      setFormData(createEmptyDataFromSchema(selectedVersion.schema));
      setFileName(selectedVersion.label);
    }
  }, [selectedVersion, initialData, isEdit]);

  const notifyChange = () => {
    if (onChange) onChange();
  };

  const handleChange = (path, value) => {
    const keys = path.split('.');
    setFormData((prevData) => {
      const newData = { ...prevData };
      let obj = newData;
      keys.slice(0, -1).forEach((key) => {
        if (!obj[key]) obj[key] = {};
        obj = obj[key];
      });
      obj[keys[keys.length - 1]] = value;
      return newData;
    });
    notifyChange();
  };

  const handleAddArrayItem = (path) => {
    const keys = path.split('.');
    setFormData((prevData) => {
      const newData = { ...prevData };
      let obj = newData;
      keys.forEach((key) => {
        if (!obj[key]) obj[key] = [];
        obj = obj[key];
      });
      obj.push('');
      return newData;
    });
    notifyChange();
  };

  const handleRemoveArrayItem = (path, idx) => {
    const keys = path.split('.');
    setFormData((prevData) => {
      const newData = { ...prevData };
      let obj = newData;
      keys.forEach((key) => {
        obj = obj[key];
      });
      obj.splice(idx, 1);
      return newData;
    });
    notifyChange();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = JSON.parse(event.target.result);
      setSchema(json);
      setFormData(createEmptyDataFromSchema(json));
    };
    reader.readAsText(file);
  };

  const renderField = (key, dataValue, schemaNode, path = '') => {
    const fullPath = path ? `${path}.${key}` : key;
    const type = schemaNode?.type;
    if (!type) return null;

    if (schemaNode.enum) {
      return (
        <Form.Group key={fullPath} className="mb-3">
          <Form.Label>{key}</Form.Label>
          <Form.Select
            value={dataValue || ''}
            onChange={(e) => handleChange(fullPath, e.target.value)}
          >
            <option value="" disabled>Select an option</option>
            {schemaNode.enum.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Form.Select>
        </Form.Group>
      );
    }

    if (type === 'boolean') {
      return (
        <Form.Check
          key={fullPath}
          type="checkbox"
          id={fullPath}
          label={key}
          checked={dataValue}
          onChange={(e) => handleChange(fullPath, e.target.checked)}
          className="mb-3"
        />
      );
    }

    if (type === 'string') {
      let inputType = 'text';
      switch (schemaNode.format) {
        case 'email':
        case 'uri':
          inputType = schemaNode.format;
          break;
        case 'date':
          inputType = 'date';
          break;
        case 'date-time':
          inputType = 'datetime-local';
          break;
        default:
          inputType = 'text';
      }

      return (
        <Form.Group key={fullPath} className="mb-3">
          <Form.Label>{key}</Form.Label>
          <Form.Control
            type={inputType}
            value={dataValue || ''}
            onChange={(e) => handleChange(fullPath, e.target.value)}
          />
        </Form.Group>
      );
    }

    if (type === 'number' || type === 'integer') {
      return (
        <Form.Group key={fullPath} className="mb-3">
          <Form.Label>{key}</Form.Label>
          <Form.Control
            type="number"
            value={dataValue}
            onChange={(e) => {
              const val = e.target.value;
              handleChange(fullPath, val === '' ? '' : Number(val));
            }}
          />
        </Form.Group>
      );
    }

    if (type === 'array') {
      const itemsSchema = schemaNode.items || {};
      const safeArray = Array.isArray(dataValue) ? dataValue : [];

      return (
        <Form.Group key={fullPath} className="mb-3">
          <Form.Label>{key}</Form.Label>
          {safeArray.map((item, idx) => (
            <div key={`${fullPath}.${idx}`} className="d-flex align-items-center mb-2">
              {itemsSchema.type === 'object' ? (
                <div className="flex-grow-1 border p-2 me-2">
                  {renderFormFields(item, itemsSchema, `${fullPath}.${idx}`)}
                </div>
              ) : (
                <Form.Control
                  type={itemsSchema.type === 'number' ? 'number' : 'text'}
                  value={item}
                  onChange={(e) => {
                    const newVal = itemsSchema.type === 'number' ? Number(e.target.value) : e.target.value;
                    handleChange(`${fullPath}.${idx}`, newVal);
                  }}
                  className="me-2"
                />
              )}
              <Button variant="danger" size="sm" onClick={() => handleRemoveArrayItem(fullPath, idx)}>Remove</Button>
            </div>
          ))}
          <Button size="sm" onClick={() => handleAddArrayItem(fullPath)}>Add Item</Button>
        </Form.Group>
      );
    }

    if (type === 'object') {
      return (
        <Accordion key={fullPath} alwaysOpen>
          <Accordion.Item eventKey={fullPath}>
            <Accordion.Header>{key}</Accordion.Header>
            <Accordion.Body>{renderFormFields(dataValue, schemaNode, fullPath)}</Accordion.Body>
          </Accordion.Item>
        </Accordion>
      );
    }

    return null;
  };

  const renderFormFields = (dataNode, schemaNode, path = '') => {
    if (!dataNode || !schemaNode || !schemaNode.properties) return null;

    return Object.entries(schemaNode.properties).map(([key, propSchema]) =>
      renderField(key, dataNode[key], propSchema, path)
    );
  };

  const handleSaveClick = () => {
    if (onSave) {
      onSave(formData);
    } else {
      const stored = JSON.parse(localStorage.getItem('modelCards')) || [];
      localStorage.setItem('modelCards', JSON.stringify([...stored, formData]));
      alert('Saved!');
    }
  };

  return (
    <Container className="my-4">
      <h2>{isEdit ? 'Edit Model Card' : 'Create from JSON Schema'}</h2>

      {!isEdit && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Select Model Card Schema Version</Form.Label>
            <Form.Select
              value={selectedVersion.label}
              onChange={(e) => {
                const version = schemaOptions.find((opt) => opt.label === e.target.value);
                if (version) setSelectedVersion(version);
              }}
            >
              {schemaOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>{opt.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Or Upload Custom JSON Schema</Form.Label>
            <Form.Control type="file" accept=".json" onChange={handleFileUpload} />
            {fileName && <div className="mt-2 text-muted">Loaded: {fileName}</div>}
          </Form.Group>
        </>
      )}

      {schema && formData && (
        <>
          <Accordion alwaysOpen>{renderFormFields(formData, schema)}</Accordion>
          <div className="mt-4 d-flex gap-2">
            <Button variant="success" onClick={handleSaveClick}>
              {isEdit ? 'Update' : 'Save Model Card'}
            </Button>
            {isEdit && (
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </>
      )}
    </Container>
  );
}

export default DynamicModelForm;
