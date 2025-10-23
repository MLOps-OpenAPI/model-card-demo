import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const formatScalarForYAML = (value) => {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'string') {
    if (value === '') {
      return "''";
    }
    return JSON.stringify(value);
  }

  return JSON.stringify(value);
};

const convertToYAML = (value, indent = 0) => {
  const indentStr = '  '.repeat(indent);
  const nextIndentStr = '  '.repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${indentStr}[]`;
    }

    const lines = [];
    value.forEach((item) => {
      if (item !== null && typeof item === 'object') {
        const itemLines = convertToYAML(item, indent + 1).split('\n');
        const firstLine = itemLines[0] || '';
        const normalizedFirstLine = firstLine.startsWith(nextIndentStr)
          ? firstLine.slice(nextIndentStr.length)
          : firstLine.trimStart();
        lines.push(`${indentStr}- ${normalizedFirstLine}`);
        for (let i = 1; i < itemLines.length; i += 1) {
          const currentLine = itemLines[i] || '';
          const normalizedLine = currentLine.startsWith(nextIndentStr)
            ? currentLine.slice(nextIndentStr.length)
            : currentLine.trimStart();
          lines.push(`${nextIndentStr}${normalizedLine}`);
        }
      } else {
        lines.push(`${indentStr}- ${formatScalarForYAML(item)}`);
      }
    });

    return lines.join('\n');
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return `${indentStr}{}`;
    }

    const lines = [];
    entries.forEach(([key, val]) => {
      if (val === undefined) {
        lines.push(`${indentStr}${key}:`);
      } else if (val === null) {
        lines.push(`${indentStr}${key}: null`);
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          lines.push(`${indentStr}${key}: []`);
        } else {
          const arrayYAML = convertToYAML(val, indent + 1);
          lines.push(`${indentStr}${key}:`);
          lines.push(arrayYAML);
        }
      } else if (typeof val === 'object') {
        const nestedYAML = convertToYAML(val, indent + 1);
        lines.push(`${indentStr}${key}:`);
        lines.push(nestedYAML);
      } else if (val === '') {
        lines.push(`${indentStr}${key}: ''`);
      } else {
        lines.push(`${indentStr}${key}: ${formatScalarForYAML(val)}`);
      }
    });

    return lines.join('\n');
  }

  if (value === '') {
    return `${indentStr}''`;
  }

  return `${indentStr}${formatScalarForYAML(value)}`;
};

const ModelCardForm = () => {
  const [formData, setFormData] = useState({
    identity_and_basic_information: {
      model_name: '',
      model_type: '',
      version: {
        name: '',
        date: '',
        model_difference: '',
        date_of_model_delivery: ''
      },
      overview: '',
      intended_use: '',
      out_of_scope: '',
      risk_level: '',
      license: '',
      references: [''],
      // citation: ''
    },
    source_and_distribution: {
      data: {
        train: {
          name: '',
          link: '',
          sensitive: false,
          hash: '',
          hash_algorithm: '',
          // dataset_link: ''
        },
        eval: {
          name: '',
          link: '',
          sensitive: false,
          hash: '',
          hash_algorithm: '',
          // dataset_link: ''
        }
      },
      data_schema: '',
      model_artifact: {
        hash: '',
        hash_algorithm: ''
      },
      source_code_url: '',
      model_origin: ''
    },
    ownership_and_governance: {
      owners: [{
        name: '',
        contact: ''
      }]
    },
    technical_specifications: {
      model_parameters: {
        model_architecture: '',
        ontology_and_semantic_mapping: {
          ontologies: [''],
          // semantic_models: '',
          // external_factors: ''
        },
        input_format: '',
        output_format: '',
        format: '',
        libraries: ['']
      },
      training_parameters: {
        training_methodology: '',
        data_card_link: '',
        dependencies: ''
      },
      preprocessing_steps: [''], // Document each transformation applied before training
      post_training_steps: [''], // Capture calibrations, distillation, or other post-training work
      hyperparameter_tuning_steps: [''], // Outline search strategies and optimized parameter sets
      inference_requirements: {
        software: '',
        hardware: '',
        deployment_constraints: '',
        model_output: {
          output_format: '',
          coordinate_base_used: '',
          geolocation_rules: ''
        },
        inference_format: [{
          name: '',
          version: '',
          data_type: '',
          serialization: '',
          protocol: '',
          notes: ''
        }]
      }
    },
    evaluation_and_performance: {
      metrics: {
        type: '',
        value: '',
        description: '',
        confidence_interval: {
          lower_bound: '',
          upper_bound: ''
        },
        decision_thresholds: '',
        slice: '',
        assumptions: ''
      },
      evaluation_infrastructure: {
        hardware_requirements: '',
        evaluation_constraints: '',
        other_evaluation_requirements: ''
      },
      evaluation_data: [{
        name: '',
        version: '',
        source: ''
      }],
      evaluation_team: [{
        name: '',
        role: '',
        affiliation: '',
        expertise: '',
        evaluation_type: '',
        contact: ''
      }],
      evaluation_objective: '',
      evaluation_system: '',
      bias_analysis: '',
      fairness_metrics: '',
      environmental_impact_of_training: '',
      reviewers: [{
        name: '',
        contact: '',
        date_reviewed: ''
      }],
      continuous_monitoring: {
        enabled: '',
        data_uri: ''
      },
      benchmark_standard: [{
        name: '',
        version: '',
        source: ''
      }]
    },
    limitations_and_constraints: {
      limitations: [''],
      tradeoffs: ['']
    },
    security_and_compliance: {
      security_card_link: '',
      risk: [{
        risk_type: '',
        mitigation_strategy: ''
      }]
    }
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (path, index, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      if (!Array.isArray(current[keys[keys.length - 1]])) {
        current[keys[keys.length - 1]] = [];
      }
      
      current[keys[keys.length - 1]][index] = value;
      return newData;
    });
  };

  const addArrayItem = (path, defaultValue = '') => {
    setFormData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid mutations
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      if (!Array.isArray(current[keys[keys.length - 1]])) {
        current[keys[keys.length - 1]] = [];
      }
      
      current[keys[keys.length - 1]].push(defaultValue);
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]].splice(index, 1);
      return newData;
    });
  };

  const validateMandatoryFields = () => {
    const errors = [];
    
    // Check Model Name
    if (!formData.identity_and_basic_information.model_name.trim()) {
      errors.push('Model Name is required');
    }
    
    // Check Model Type
    if (!formData.identity_and_basic_information.model_type.trim()) {
      errors.push('Model Type is required');
    }
    
    // Check Version Name
    if (!formData.identity_and_basic_information.version.name.trim()) {
      errors.push('Version Name is required');
    }
    
    // Check Date of Delivery
    if (!formData.identity_and_basic_information.version.date_of_model_delivery.trim()) {
      errors.push('Date of Delivery is required');
    }
    
    // Check Owner's name (first owner)
    if (!formData.ownership_and_governance.owners[0]?.name.trim()) {
      errors.push('Owner Name is required');
    }
    
    // Check Owner contract (first owner)
    if (!formData.ownership_and_governance.owners[0]?.contact.trim()) {
      errors.push('Owner Contact is required');
    }
    
    return errors;
  };

  const downloadModelCard = (format = 'json') => {
    const errors = validateMandatoryFields();

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowSuccess(false);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Clear any previous validation errors
    setValidationErrors([]);

    let dataStr = '';
    let mimeType = 'application/json';
    let extension = 'json';

    if (format === 'yaml') {
      dataStr = `---\n${convertToYAML(formData)}`;
      mimeType = 'text/yaml';
      extension = 'yaml';
    } else {
      dataStr = JSON.stringify(formData, null, 2);
    }

    const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = `${formData.identity_and_basic_information.model_name || 'model_card'}_${new Date().toISOString().split('T')[0]}.${extension}`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    const formatLabel = format === 'yaml' ? 'YAML' : 'JSON';
    setSuccessMessage(`Model card downloaded as ${formatLabel}!`);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage('');
    }, 3000);
  };

  const modelTypes = ["Computer Vision", "Radio Frequency", "Natural Language Processing", "Large Language Model", "Other"];

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h2 className="mb-0">Aether Model Card</h2>
              <p className="mb-0">Fill out the form below to create a model card</p>
            </Card.Header>
            <Card.Body>
              {showSuccess && (
                <Alert variant="success" className="mb-4">
                  {successMessage || 'Model card downloaded successfully!'}
                </Alert>
              )}

              {validationErrors.length > 0 && (
                <Alert variant="danger" className="mb-4">
                  <Alert.Heading>Please fill out all required fields:</Alert.Heading>
                  <ul className="mb-0">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              <Form>
                {/* Identity and Basic Information */}
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Identity and Basic Information</h4>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Model Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.identity_and_basic_information.model_name}
                            onChange={(e) => handleInputChange('identity_and_basic_information.model_name', e.target.value)}
                            placeholder="Enter model name"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Model Type <span className="text-danger">*</span></Form.Label>
                          <Form.Select
                            value={formData.identity_and_basic_information.model_type}
                            onChange={(e) => handleInputChange('identity_and_basic_information.model_type', e.target.value)}
                            required
                          >
                            <option value="">Select model type</option>
                            {modelTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="form-section">
                      <h5>Version Information</h5>
                    </div>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Version Name <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.identity_and_basic_information.version.name}
                            onChange={(e) => handleInputChange('identity_and_basic_information.version.name', e.target.value)}
                            placeholder="e.g., v1.0.0"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date of Model Delivery <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.identity_and_basic_information.version.date_of_model_delivery}
                            onChange={(e) => handleInputChange('identity_and_basic_information.version.date_of_model_delivery', e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Model Difference</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.identity_and_basic_information.version.model_difference}
                        onChange={(e) => handleInputChange('identity_and_basic_information.version.model_difference', e.target.value)}
                        placeholder="Describe changes from previous version"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Overview</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.identity_and_basic_information.overview}
                        onChange={(e) => handleInputChange('identity_and_basic_information.overview', e.target.value)}
                        placeholder="What makes this model unique or distinguished from other models"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Intended Use</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.identity_and_basic_information.intended_use}
                        onChange={(e) => handleInputChange('identity_and_basic_information.intended_use', e.target.value)}
                        placeholder="Describe primary applications and supported scenarios"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Out-of-Scope</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.identity_and_basic_information.out_of_scope}
                        onChange={(e) => handleInputChange('identity_and_basic_information.out_of_scope', e.target.value)}
                        placeholder="Document disallowed, high-risk, or unsupported uses"
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>License</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.identity_and_basic_information.license}
                            onChange={(e) => handleInputChange('identity_and_basic_information.license', e.target.value)}
                            placeholder="e.g., MIT, Apache 2.0"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Risk Level</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.identity_and_basic_information.risk_level}
                            onChange={(e) => handleInputChange('identity_and_basic_information.risk_level', e.target.value)}
                            placeholder="e.g., Low, Medium, High"
                          />
                        </Form.Group>
                      </Col>
                      {/* <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Citation</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.identity_and_basic_information.citation}
                            onChange={(e) => handleInputChange('identity_and_basic_information.citation', e.target.value)}
                            placeholder="How to reference this model card"
                          />
                        </Form.Group>
                      </Col> */}
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>References</Form.Label>
                      {formData.identity_and_basic_information.references.map((ref, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            type="url"
                            value={ref}
                            onChange={(e) => handleArrayChange('identity_and_basic_information.references', index, e.target.value)}
                            placeholder="https://example.com"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            onClick={() => removeArrayItem('identity_and_basic_information.references', index)}
                            disabled={formData.identity_and_basic_information.references.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => addArrayItem('identity_and_basic_information.references', '')}
                      >
                        Add Reference
                      </Button>
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Source and Distribution */}
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Source and Distribution</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Data Schema</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.source_and_distribution.data_schema}
                        onChange={(e) => handleInputChange('source_and_distribution.data_schema', e.target.value)}
                        placeholder="Describe the structure and fields of the data"
                      />
                    </Form.Group>

                    <div className="form-section">
                      <h5>Training Data</h5>
                    </div>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dataset Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.data.train.name}
                            onChange={(e) => handleInputChange('source_and_distribution.data.train.name', e.target.value)}
                            placeholder="Training dataset name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dataset Hash</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.data.train.hash}
                            onChange={(e) => handleInputChange('source_and_distribution.data.train.hash', e.target.value)}
                            placeholder="Checksum or fingerprint"
                          />
                          <Form.Text className="text-muted">
                            Provide the digest used to validate the training dataset contents.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Hashing Algorithm</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.data.train.hash_algorithm}
                            onChange={(e) => handleInputChange('source_and_distribution.data.train.hash_algorithm', e.target.value)}
                            placeholder="e.g., SHA-256"
                          />
                          <Form.Text className="text-muted">
                            Document the algorithm used to produce this dataset hash.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      {/* <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dataset Link</Form.Label>
                          <Form.Control
                            type="url"
                            value={formData.source_and_distribution.data.train.dataset_link}
                            onChange={(e) => handleInputChange('source_and_distribution.data.train.dataset_link', e.target.value)}
                            placeholder="https://example.com/dataset"
                          />
                        </Form.Group>
                      </Col> */}
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Contains sensitive data"
                        checked={formData.source_and_distribution.data.train.sensitive}
                        onChange={(e) => handleInputChange('source_and_distribution.data.train.sensitive', e.target.checked)}
                      />
                    </Form.Group>

                    <div className="form-section">
                      <h5>Evaluation Data</h5>
                    </div>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dataset Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.data.eval.name}
                            onChange={(e) => handleInputChange('source_and_distribution.data.eval.name', e.target.value)}
                            placeholder="Evaluation dataset name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dataset Hash</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.data.eval.hash}
                            onChange={(e) => handleInputChange('source_and_distribution.data.eval.hash', e.target.value)}
                            placeholder="Checksum or fingerprint"
                          />
                          <Form.Text className="text-muted">
                            Enter the digest verifying the evaluation dataset snapshot.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Hashing Algorithm</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.data.eval.hash_algorithm}
                            onChange={(e) => handleInputChange('source_and_distribution.data.eval.hash_algorithm', e.target.value)}
                            placeholder="e.g., SHA-256"
                          />
                          <Form.Text className="text-muted">
                            Record the algorithm associated with this evaluation dataset hash.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      {/* <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dataset Link</Form.Label>
                          <Form.Control
                            type="url"
                            value={formData.source_and_distribution.data.eval.dataset_link}
                            onChange={(e) => handleInputChange('source_and_distribution.data.eval.dataset_link', e.target.value)}
                            placeholder="https://example.com/dataset"
                          />
                        </Form.Group>
                      </Col> */}
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Contains sensitive data"
                        checked={formData.source_and_distribution.data.eval.sensitive}
                        onChange={(e) => handleInputChange('source_and_distribution.data.eval.sensitive', e.target.checked)}
                      />
                    </Form.Group>

                    <div className="form-section">
                      <h5>Model Artifact Integrity</h5>
                    </div>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Model Hash</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.model_artifact.hash}
                            onChange={(e) => handleInputChange('source_and_distribution.model_artifact.hash', e.target.value)}
                            placeholder="Checksum or fingerprint for the model artifact"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Hashing Algorithm</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.model_artifact.hash_algorithm}
                            onChange={(e) => handleInputChange('source_and_distribution.model_artifact.hash_algorithm', e.target.value)}
                            placeholder="e.g., SHA-256"
                          />
                          <Form.Text className="text-muted">
                            Specify the algorithm used to verify the model artifact.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      {/* <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Source Code URL</Form.Label>
                          <Form.Control
                            type="url"
                            value={formData.source_and_distribution.source_code_url}
                            onChange={(e) => handleInputChange('source_and_distribution.source_code_url', e.target.value)}
                            placeholder="https://github.com/example/repo"
                          />
                        </Form.Group>
                      </Col> */}
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Model Origin</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.source_and_distribution.model_origin}
                            onChange={(e) => handleInputChange('source_and_distribution.model_origin', e.target.value)}
                            placeholder="Where or by whom was the model developed"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Ownership and Governance */}
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Ownership and Governance</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Owners</Form.Label>
                      {formData.ownership_and_governance.owners.map((owner, index) => (
                        <div key={index} className="array-item">
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Name {index === 0 && <span className="text-danger">*</span>}</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={owner.name}
                                  onChange={(e) => {
                                    const newOwners = [...formData.ownership_and_governance.owners];
                                    newOwners[index].name = e.target.value;
                                    handleInputChange('ownership_and_governance.owners', newOwners);
                                  }}
                                  placeholder="Owner name"
                                  required={index === 0}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Contact {index === 0 && <span className="text-danger">*</span>}</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={owner.contact}
                                  onChange={(e) => {
                                    const newOwners = [...formData.ownership_and_governance.owners];
                                    newOwners[index].contact = e.target.value;
                                    handleInputChange('ownership_and_governance.owners', newOwners);
                                  }}
                                  placeholder="Contact information"
                                  required={index === 0}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            onClick={() => removeArrayItem('ownership_and_governance.owners', index)}
                            disabled={formData.ownership_and_governance.owners.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => addArrayItem('ownership_and_governance.owners', { name: '', contact: '' })}
                      >
                        Add Owner
                      </Button>
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Technical Specifications */}
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Technical Specifications</h4>
                  </Card.Header>
                  <Card.Body>
                    <div className="form-section">
                      <h5>Model Parameters</h5>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label>Model Architecture</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.technical_specifications.model_parameters.model_architecture}
                        onChange={(e) => handleInputChange('technical_specifications.model_parameters.model_architecture', e.target.value)}
                        placeholder="e.g., Transformer, CNN, RNN"
                      />
                    </Form.Group>

                    <div className="form-section">
                      <h5>Ontology</h5>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label>Ontologies</Form.Label>
                      {formData.technical_specifications.model_parameters.ontology_and_semantic_mapping.ontologies.map((ontology, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            type="text"
                            value={ontology}
                            onChange={(e) => handleArrayChange('technical_specifications.model_parameters.ontology_and_semantic_mapping.ontologies', index, e.target.value)}
                            placeholder="Specify any ontologies used"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            onClick={() => removeArrayItem('technical_specifications.model_parameters.ontology_and_semantic_mapping.ontologies', index)}
                            disabled={formData.technical_specifications.model_parameters.ontology_and_semantic_mapping.ontologies.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => addArrayItem('technical_specifications.model_parameters.ontology_and_semantic_mapping.ontologies', '')}
                      >
                        Add Ontology
                      </Button>
                    </Form.Group>

                    {/* <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Semantic Models</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={formData.technical_specifications.model_parameters.ontology_and_semantic_mapping.semantic_models}
                            onChange={(e) => handleInputChange('technical_specifications.model_parameters.ontology_and_semantic_mapping.semantic_models', e.target.value)}
                            placeholder="Specify any semantic models used"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>External Factors</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={formData.technical_specifications.model_parameters.ontology_and_semantic_mapping.external_factors}
                            onChange={(e) => handleInputChange('technical_specifications.model_parameters.ontology_and_semantic_mapping.external_factors', e.target.value)}
                            placeholder="Specify any external factors that influenced classification and their integration within the ontology or semantic model"
                          />
                        </Form.Group>
                      </Col>
                    </Row> */}

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Input Format</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.technical_specifications.model_parameters.input_format}
                            onChange={(e) => handleInputChange('technical_specifications.model_parameters.input_format', e.target.value)}
                            placeholder="e.g., JSON, CSV, Image"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Output Format</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.technical_specifications.model_parameters.output_format}
                            onChange={(e) => handleInputChange('technical_specifications.model_parameters.output_format', e.target.value)}
                            placeholder="e.g., JSON, Probabilities"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Model Format</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.technical_specifications.model_parameters.format}
                            onChange={(e) => handleInputChange('technical_specifications.model_parameters.format', e.target.value)}
                            placeholder="e.g., ONNX, PyTorch, TensorFlow"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Libraries</Form.Label>
                      {formData.technical_specifications.model_parameters.libraries.map((lib, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            type="text"
                            value={lib}
                            onChange={(e) => handleArrayChange('technical_specifications.model_parameters.libraries', index, e.target.value)}
                            placeholder="Library name and version"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            onClick={() => removeArrayItem('technical_specifications.model_parameters.libraries', index)}
                            disabled={formData.technical_specifications.model_parameters.libraries.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => addArrayItem('technical_specifications.model_parameters.libraries', '')}
                      >
                        Add Library
                      </Button>
                    </Form.Group>

                    <div className="form-section">
                      <h5>Training Parameters</h5>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label>Training Methodology</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.technical_specifications.training_parameters.training_methodology}
                        onChange={(e) => handleInputChange('technical_specifications.training_parameters.training_methodology', e.target.value)}
                        placeholder="Describe how the model was trained"
                      />
                    </Form.Group>

                    <Row>
                      {/* <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Data Card Link</Form.Label>
                          <Form.Control
                            type="url"
                            value={formData.technical_specifications.training_parameters.data_card_link}
                            onChange={(e) => handleInputChange('technical_specifications.training_parameters.data_card_link', e.target.value)}
                            placeholder="https://example.com/data-card"
                          />
                        </Form.Group>
                      </Col> */}
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Dependencies</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.technical_specifications.training_parameters.dependencies}
                            onChange={(e) => handleInputChange('technical_specifications.training_parameters.dependencies', e.target.value)}
                            placeholder="Lock file or dependency information"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Preprocessing Steps</Form.Label>
                      {formData.technical_specifications.preprocessing_steps.map((step, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={step}
                            onChange={(e) => handleArrayChange('technical_specifications.preprocessing_steps', index, e.target.value)}
                            placeholder="Describe a preprocessing step"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            onClick={() => removeArrayItem('technical_specifications.preprocessing_steps', index)}
                            disabled={formData.technical_specifications.preprocessing_steps.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => addArrayItem('technical_specifications.preprocessing_steps', '')}
                      >
                        Add Step
                      </Button>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Post-Training Steps</Form.Label>
                      {formData.technical_specifications.post_training_steps.map((step, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={step}
                            onChange={(e) => handleArrayChange('technical_specifications.post_training_steps', index, e.target.value)}
                            placeholder="Document an applied post-training adjustment"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            onClick={() => removeArrayItem('technical_specifications.post_training_steps', index)}
                            disabled={formData.technical_specifications.post_training_steps.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => addArrayItem('technical_specifications.post_training_steps', '')}
                      >
                        Add Step
                      </Button>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Hyperparameter Tuning Steps</Form.Label>
                      {formData.technical_specifications.hyperparameter_tuning_steps.map((step, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={step}
                            onChange={(e) => handleArrayChange('technical_specifications.hyperparameter_tuning_steps', index, e.target.value)}
                            placeholder="Summarize hyperparameter tuning iterations or results"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            type="button"
                            onClick={() => removeArrayItem('technical_specifications.hyperparameter_tuning_steps', index)}
                            disabled={formData.technical_specifications.hyperparameter_tuning_steps.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => addArrayItem('technical_specifications.hyperparameter_tuning_steps', '')}
                      >
                        Add Step
                      </Button>
                    </Form.Group>

                    <div className="form-section">
                      <h5>Inference Requirements</h5>
                    </div>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Software Requirements</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={formData.technical_specifications.inference_requirements.software}
                            onChange={(e) => handleInputChange('technical_specifications.inference_requirements.software', e.target.value)}
                            placeholder="Deployment library dependencies"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Hardware Requirements</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={formData.technical_specifications.inference_requirements.hardware}
                            onChange={(e) => handleInputChange('technical_specifications.inference_requirements.hardware', e.target.value)}
                            placeholder="Hardware required for deployment"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Deployment Constraints</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.technical_specifications.inference_requirements.deployment_constraints}
                        onChange={(e) => handleInputChange('technical_specifications.inference_requirements.deployment_constraints', e.target.value)}
                        placeholder="On-premises, cloud, edge devices, or hybrid environments"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                {/* Evaluation and Performance */}
                <Card className="mb-4">
                  <Card.Header>
                    <h4>Evaluation and Performance</h4>
                  </Card.Header>
                  <Card.Body>
                    <div className="form-section">
                      <h5>Metrics</h5>
                    </div>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Metric Type</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.evaluation_and_performance.metrics.type}
                            onChange={(e) => handleInputChange('evaluation_and_performance.metrics.type', e.target.value)}
                            placeholder="e.g., Accuracy, F1-Score"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Metric Value</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.001"
                            value={formData.evaluation_and_performance.metrics.value}
                            onChange={(e) => handleInputChange('evaluation_and_performance.metrics.value', parseFloat(e.target.value) || '')}
                            placeholder="0.00"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Decision Thresholds</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.evaluation_and_performance.metrics.decision_thresholds}
                            onChange={(e) => handleInputChange('evaluation_and_performance.metrics.decision_thresholds', e.target.value)}
                            placeholder="0.00"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Metric Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.evaluation_and_performance.metrics.description}
                        onChange={(e) => handleInputChange('evaluation_and_performance.metrics.description', e.target.value)}
                        placeholder="Method or other relevant information"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Environmental Impact of Training</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.evaluation_and_performance.environmental_impact_of_training}
                        onChange={(e) =>
                          handleInputChange('evaluation_and_performance.environmental_impact_of_training', e.target.value)
                        }
                        placeholder="Summarize compute usage, carbon footprint, or sustainability considerations"
                      />
                      <Form.Text className="text-muted">
                        Document energy consumption estimates, offsets, or other sustainability metrics gathered during training.
                      </Form.Text>
                    </Form.Group>

                    <div className="form-section">
                      <h5>Reviewers</h5>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label>Reviewer Details</Form.Label>
                      {formData.evaluation_and_performance.reviewers.map((reviewer, index) => (
                        <div key={index} className="array-item mb-3 p-3 border rounded">
                          <Row>
                            <Col md={4}>
                              <Form.Group className="mb-3 mb-md-0">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={reviewer.name}
                                  onChange={(e) => {
                                    const reviewers = [...formData.evaluation_and_performance.reviewers];
                                    reviewers[index] = {
                                      ...reviewers[index],
                                      name: e.target.value
                                    };
                                    handleInputChange('evaluation_and_performance.reviewers', reviewers);
                                  }}
                                  placeholder="Reviewer name"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group className="mb-3 mb-md-0">
                                <Form.Label>Contact</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={reviewer.contact}
                                  onChange={(e) => {
                                    const reviewers = [...formData.evaluation_and_performance.reviewers];
                                    reviewers[index] = {
                                      ...reviewers[index],
                                      contact: e.target.value
                                    };
                                    handleInputChange('evaluation_and_performance.reviewers', reviewers);
                                  }}
                                  placeholder="email@example.com"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Date Reviewed</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={reviewer.date_reviewed}
                                  onChange={(e) => {
                                    const reviewers = [...formData.evaluation_and_performance.reviewers];
                                    reviewers[index] = {
                                      ...reviewers[index],
                                      date_reviewed: e.target.value
                                    };
                                    handleInputChange('evaluation_and_performance.reviewers', reviewers);
                                  }}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <div className="text-end mt-2">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              type="button"
                              onClick={() => {
                                const reviewers = [...formData.evaluation_and_performance.reviewers];
                                reviewers.splice(index, 1);
                                handleInputChange(
                                  'evaluation_and_performance.reviewers',
                                  reviewers.length > 0 ? reviewers : [{ name: '', contact: '', date_reviewed: '' }]
                                );
                              }}
                              disabled={formData.evaluation_and_performance.reviewers.length === 1}
                            >
                              Remove Reviewer
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        type="button"
                        onClick={() => {
                          const reviewers = [
                            ...formData.evaluation_and_performance.reviewers,
                            { name: '', contact: '', date_reviewed: '' }
                          ];
                          handleInputChange('evaluation_and_performance.reviewers', reviewers);
                        }}
                      >
                        Add Reviewer
                      </Button>
                    </Form.Group>

                    <div className="form-section">
                      <h5>Continuous Monitoring</h5>
                    </div>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Continuous Monitoring</Form.Label>
                          <Form.Select
                            value={formData.evaluation_and_performance.continuous_monitoring.enabled}
                            onChange={(e) =>
                              handleInputChange('evaluation_and_performance.continuous_monitoring.enabled', e.target.value)
                            }
                          >
                            <option value="">Select an option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Continuous Monitoring Data URI</Form.Label>
                          <Form.Control
                            type="url"
                            value={formData.evaluation_and_performance.continuous_monitoring.data_uri}
                            onChange={(e) =>
                              handleInputChange('evaluation_and_performance.continuous_monitoring.data_uri', e.target.value)
                            }
                            placeholder="https://example.com/monitoring-data"
                            disabled={formData.evaluation_and_performance.continuous_monitoring.enabled !== 'Yes'}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Bias Analysis</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.evaluation_and_performance.bias_analysis}
                        onChange={(e) => handleInputChange('evaluation_and_performance.bias_analysis', e.target.value)}
                        placeholder="Summarize any bias evaluation procedures and findings"
                      />
                      <Form.Text className="text-muted">
                        Note methodologies, affected cohorts, and mitigations discovered during bias studies.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Fairness Metrics</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.evaluation_and_performance.fairness_metrics}
                        onChange={(e) => handleInputChange('evaluation_and_performance.fairness_metrics', e.target.value)}
                        placeholder="List fairness or equity metrics and associated outcomes"
                      />
                      <Form.Text className="text-muted">
                        Capture quantitative fairness indicators (e.g., demographic parity) and resulting values.
                      </Form.Text>
                    </Form.Group>
{/*
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confidence Interval - Lower Bound</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.001"
                            value={formData.evaluation_and_performance.metrics.confidence_interval.lower_bound}
                            onChange={(e) => handleInputChange('evaluation_and_performance.metrics.confidence_interval.lower_bound', parseFloat(e.target.value) || '')}
                            placeholder="0.90"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confidence Interval - Upper Bound</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.001"
                            value={formData.evaluation_and_performance.metrics.confidence_interval.upper_bound}
                            onChange={(e) => handleInputChange('evaluation_and_performance.metrics.confidence_interval.upper_bound', parseFloat(e.target.value) || '')}
                            placeholder="0.98"
                          />
                        </Form.Group>
                      </Col>
                    </Row> */}

                    {/* <Form.Group className="mb-3">
                      <Form.Label>Evaluation Objective</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.evaluation_and_performance.evaluation_objective}
                        onChange={(e) => handleInputChange('evaluation_and_performance.evaluation_objective', e.target.value)}
                        placeholder="State the primary goals and intended outcomes of the evaluation process"
                      />
                    </Form.Group> */}

                    {/* <Form.Group className="mb-3">
                      <Form.Label>Evaluation System</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.evaluation_and_performance.evaluation_system}
                        onChange={(e) => handleInputChange('evaluation_and_performance.evaluation_system', e.target.value)}
                        placeholder="System(s), platform(s), or testbed environment(s) used"
                      />
                    </Form.Group> */}
                  </Card.Body>
                </Card>

                {/* Limitations and Constraints */}
                {/* <Card className="mb-4">
                  <Card.Header>
                    <h4>Limitations and Constraints</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Limitations</Form.Label>
                      {formData.limitations_and_constraints.limitations.map((limitation, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={limitation}
                            onChange={(e) => handleArrayChange('limitations_and_constraints.limitations', index, e.target.value)}
                            placeholder="Describe a limitation"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeArrayItem('limitations_and_constraints.limitations', index)}
                            disabled={formData.limitations_and_constraints.limitations.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => addArrayItem('limitations_and_constraints.limitations', '')}
                      >
                        Add Limitation
                      </Button>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Tradeoffs</Form.Label>
                      {formData.limitations_and_constraints.tradeoffs.map((tradeoff, index) => (
                        <div key={index} className="d-flex mb-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={tradeoff}
                            onChange={(e) => handleArrayChange('limitations_and_constraints.tradeoffs', index, e.target.value)}
                            placeholder="Describe a tradeoff"
                            className="me-2"
                          />
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeArrayItem('limitations_and_constraints.tradeoffs', index)}
                            disabled={formData.limitations_and_constraints.tradeoffs.length === 1}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => addArrayItem('limitations_and_constraints.tradeoffs', '')}
                      >
                        Add Tradeoff
                      </Button>
                    </Form.Group>
                  </Card.Body>
                </Card> */}

                {/* Security and Compliance */}
                {/* <Card className="mb-4">
                  <Card.Header>
                    <h4>Security and Compliance</h4>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Security Card Link</Form.Label>
                      <Form.Control
                        type="url"
                        value={formData.security_and_compliance.security_card_link}
                        onChange={(e) => handleInputChange('security_and_compliance.security_card_link', e.target.value)}
                        placeholder="https://example.com/security-card"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Risk Assessment</Form.Label>
                      {formData.security_and_compliance.risk.map((risk, index) => (
                        <div key={index} className="border p-3 mb-3 rounded">
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Risk Type</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={risk.risk_type}
                                  onChange={(e) => {
                                    const newRisks = [...formData.security_and_compliance.risk];
                                    newRisks[index].risk_type = e.target.value;
                                    handleInputChange('security_and_compliance.risk', newRisks);
                                  }}
                                  placeholder="Type of risk"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Mitigation Strategy</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  value={risk.mitigation_strategy}
                                  onChange={(e) => {
                                    const newRisks = [...formData.security_and_compliance.risk];
                                    newRisks[index].mitigation_strategy = e.target.value;
                                    handleInputChange('security_and_compliance.risk', newRisks);
                                  }}
                                  placeholder="How this risk is mitigated"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeArrayItem('security_and_compliance.risk', index)}
                            disabled={formData.security_and_compliance.risk.length === 1}
                          >
                            Remove Risk
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => addArrayItem('security_and_compliance.risk', { risk_type: '', mitigation_strategy: '' })}
                      >
                        Add Risk
                      </Button>
                    </Form.Group>
                  </Card.Body>
                </Card> */}

                {/* Download Button */}
                <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                  <Button
                    variant="success"
                    size="lg"
                    type="button"
                    onClick={() => downloadModelCard('json')}
                    className="px-4"
                  >
                    Download JSON
                  </Button>
                  <Button
                    variant="outline-success"
                    size="lg"
                    type="button"
                    onClick={() => downloadModelCard('yaml')}
                    className="px-4"
                  >
                    Download YAML
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ModelCardForm;
