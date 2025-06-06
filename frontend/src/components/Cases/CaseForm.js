import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { casesAPI } from '../../api';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  FormHelperText,
  Tab,
  Tabs
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploader from '../common/FileUploader';

const CaseForm = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = Boolean(caseId);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    violation_types: [],
    status: 'new',
    priority: 'medium',
    location: {
      country: '',
      region: '',
      coordinates: null
    },
    date_occurred: '',
    date_reported: '',
    victims: [],
    perpetrators: [],
    evidence: []
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  useEffect(() => {
    if (isEditMode) {
      const fetchCaseData = async () => {
        try {
          setLoading(true);
          const response = await casesAPI.getCaseById(caseId);
          setFormData(response.data);
          setLoading(false);
        } catch (error) {
          setError('Failed to load case data: ' + (error.response?.data?.detail || error.message));
          setLoading(false);
        }
      };

      fetchCaseData();
    }
  }, [caseId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleViolationTypeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      violation_types: e.target.value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFileUpload = async (files) => {
    if (!isEditMode) {
      // For new cases, just store the files temporarily
      setUploadedFiles(files);
      return;
    }
    
    try {
      // For existing cases, upload the files to the server
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await casesAPI.uploadEvidence(caseId, formData);
      
      // Update the evidence list in the form data
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, ...response.data]
      }));
      
      return response.data;
    } catch (error) {
      setError('Failed to upload evidence: ' + (error.response?.data?.detail || error.message));
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.description) errors.description = 'Description is required';
    if (formData.violation_types.length === 0) errors.violation_types = 'At least one violation type is required';
    if (!formData.location.country) errors['location.country'] = 'Country is required';
    if (!formData.date_occurred) errors.date_occurred = 'Date occurred is required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      let response;
      
      if (isEditMode) {
        response = await casesAPI.updateCase(caseId, formData);
      } else {
        response = await casesAPI.createCase(formData);
        
        // If there are uploaded files, upload them to the new case
        if (uploadedFiles.length > 0) {
          const newCaseId = response.data._id;
          const formData = new FormData();
          uploadedFiles.forEach(file => {
            formData.append('files', file);
          });
          
          await casesAPI.uploadEvidence(newCaseId, formData);
        }
      }
      
      setSaving(false);
      setSuccess(true);
      
      // Navigate back to cases list after a short delay
      setTimeout(() => {
        navigate('/cases');
      }, 1500);
    } catch (error) {
      setError('Failed to save case: ' + (error.response?.data?.detail || error.message));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await casesAPI.deleteCase(caseId);
      navigate('/cases');
    } catch (error) {
      setError('Failed to delete case: ' + (error.response?.data?.detail || error.message));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/cases');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Edit Case' : 'Create New Case'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Case {isEditMode ? 'updated' : 'created'} successfully!
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Basic Information" />
          <Tab label="Location & Dates" />
          <Tab label="Evidence & Files" />
        </Tabs>
        
        <Box component="form" onSubmit={handleSubmit}>
          {/* Basic Information Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  error={Boolean(validationErrors.title)}
                  helperText={validationErrors.title}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  error={Boolean(validationErrors.description)}
                  helperText={validationErrors.description}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={Boolean(validationErrors.violation_types)}>
                  <InputLabel id="violation-types-label">Violation Types</InputLabel>
                  <Select
                    labelId="violation-types-label"
                    multiple
                    value={formData.violation_types}
                    onChange={handleViolationTypeChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} 
                          />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="forced_displacement">Forced Displacement</MenuItem>
                    <MenuItem value="property_destruction">Property Destruction</MenuItem>
                    <MenuItem value="arbitrary_detention">Arbitrary Detention</MenuItem>
                    <MenuItem value="torture">Torture</MenuItem>
                    <MenuItem value="extrajudicial_killing">Extrajudicial Killing</MenuItem>
                    <MenuItem value="enforced_disappearance">Enforced Disappearance</MenuItem>
                    <MenuItem value="sexual_violence">Sexual Violence</MenuItem>
                    <MenuItem value="child_recruitment">Child Recruitment</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {validationErrors.violation_types && (
                    <FormHelperText>{validationErrors.violation_types}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="under_investigation">Under Investigation</MenuItem>
                    <MenuItem value="pending_evidence">Pending Evidence</MenuItem>
                    <MenuItem value="legal_action">Legal Action</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          
          {/* Location & Dates Tab */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  required
                  error={Boolean(validationErrors['location.country'])}
                  helperText={validationErrors['location.country']}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Region/City"
                  name="location.region"
                  value={formData.location.region}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date Occurred"
                  name="date_occurred"
                  type="date"
                  value={formData.date_occurred}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={Boolean(validationErrors.date_occurred)}
                  helperText={validationErrors.date_occurred}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date Reported"
                  name="date_reported"
                  type="date"
                  value={formData.date_reported}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
          
          {/* Evidence & Files Tab */}
          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FileUploader 
                  title="Upload Evidence Files"
                  description="Upload photos, videos, documents, or other evidence related to this case"
                  onUpload={handleFileUpload}
                  maxFiles={10}
                  acceptedFileTypes="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  maxFileSize={20}
                  disabled={saving}
                  parentId={isEditMode ? caseId : null}
                />
              </Grid>
              
              {isEditMode && formData.evidence && formData.evidence.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Existing Evidence
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {formData.evidence.map((item, index) => (
                      <Chip 
                        key={index}
                        label={item.filename || `Evidence ${index + 1}`}
                        sx={{ m: 0.5 }}
                        onClick={() => window.open(item.url, '_blank')}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            
            <Box>
              {isEditMode && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  sx={{ mr: 2 }}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={24} /> : <SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Case'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CaseForm;
