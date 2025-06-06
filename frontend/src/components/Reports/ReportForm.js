import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

const ReportForm = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(reportId);
  
  const [formData, setFormData] = useState({
    reporter_type: 'victim',
    anonymous: false,
    contact_info: {
      email: '',
      phone: '',
      preferred_contact: 'email'
    },
    incident_details: {
      date: '',
      location: {
        country: '',
        city: ''
      },
      description: '',
      violation_types: []
    },
    evidence: [],
    status: 'new'
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  useEffect(() => {
    if (isEditMode) {
      // In a real implementation, this would fetch the report data from the API
      // For now, we'll use mock data
      const fetchReportData = async () => {
        try {
          // Mock data - would be replaced with actual API call
          setTimeout(() => {
            const mockReport = {
              _id: reportId,
              report_id: 'IR-2023-0789',
              reporter_type: 'victim',
              anonymous: false,
              contact_info: {
                email: 'reporter@example.com',
                phone: '+963912345678',
                preferred_contact: 'email'
              },
              incident_details: {
                date: '2023-05-10',
                location: {
                  country: 'Yemen',
                  city: 'Taiz'
                },
                description: 'Arbitrary detention of 15 civilians at checkpoint',
                violation_types: ['arbitrary_detention', 'torture']
              },
              evidence: [
                {
                  type: 'video',
                  url: '/evidence/ir0789-1.mp4',
                  description: 'Checkpoint footage'
                }
              ],
              status: 'new',
              created_at: '2023-05-12T08:45:00Z'
            };
            
            setFormData(mockReport);
            setLoading(false);
          }, 1000);
        } catch (error) {
          setError('Failed to load report data');
          setLoading(false);
        }
      };

      fetchReportData();
    }
  }, [reportId, isEditMode]);

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

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    const [parent, child, grandchild] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: {
          ...prev[parent][child],
          [grandchild]: value
        }
      }
    }));
    
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
      incident_details: {
        ...prev.incident_details,
        violation_types: e.target.value
      }
    }));
  };

  const handleAnonymousChange = (e) => {
    setFormData(prev => ({
      ...prev,
      anonymous: e.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.incident_details.description) errors['incident_details.description'] = 'Description is required';
    if (formData.incident_details.violation_types.length === 0) errors['incident_details.violation_types'] = 'At least one violation type is required';
    if (!formData.incident_details.location.country) errors['incident_details.location.country'] = 'Country is required';
    if (!formData.incident_details.date) errors['incident_details.date'] = 'Date is required';
    
    if (!formData.anonymous) {
      if (!formData.contact_info.email && !formData.contact_info.phone) {
        errors['contact_info'] = 'At least one contact method is required for non-anonymous reports';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // In a real implementation, this would send the data to the API
      // For now, we'll simulate a successful save
      setTimeout(() => {
        setSaving(false);
        setSuccess(true);
        
        // Navigate back to reports list after a short delay
        setTimeout(() => {
          navigate('/reports');
        }, 1500);
      }, 1000);
    } catch (error) {
      setError('Failed to save report');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/reports');
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
        {isEditMode ? 'Edit Incident Report' : 'Submit New Incident Report'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Report {isEditMode ? 'updated' : 'submitted'} successfully!
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Reporter Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Reporter Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="reporter-type-label">Reporter Type</InputLabel>
                <Select
                  labelId="reporter-type-label"
                  name="reporter_type"
                  value={formData.reporter_type}
                  onChange={handleChange}
                >
                  <MenuItem value="victim">Victim</MenuItem>
                  <MenuItem value="witness">Witness</MenuItem>
                  <MenuItem value="ngo">NGO</MenuItem>
                  <MenuItem value="journalist">Journalist</MenuItem>
                  <MenuItem value="anonymous">Anonymous</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.anonymous} 
                    onChange={handleAnonymousChange} 
                    name="anonymous" 
                  />
                }
                label="Submit Anonymously"
              />
            </Grid>
            
            {!formData.anonymous && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="contact_info.email"
                    value={formData.contact_info.email}
                    onChange={handleChange}
                    error={Boolean(validationErrors['contact_info'])}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="contact_info.phone"
                    value={formData.contact_info.phone}
                    onChange={handleChange}
                    error={Boolean(validationErrors['contact_info'])}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  {validationErrors['contact_info'] && (
                    <FormHelperText error>{validationErrors['contact_info']}</FormHelperText>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="preferred-contact-label">Preferred Contact Method</InputLabel>
                    <Select
                      labelId="preferred-contact-label"
                      name="contact_info.preferred_contact"
                      value={formData.contact_info.preferred_contact}
                      onChange={handleChange}
                    >
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="phone">Phone</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Incident Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="incident_details.description"
                value={formData.incident_details.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                error={Boolean(validationErrors['incident_details.description'])}
                helperText={validationErrors['incident_details.description']}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={Boolean(validationErrors['incident_details.violation_types'])}>
                <InputLabel id="violation-types-label">Violation Types</InputLabel>
                <Select
                  labelId="violation-types-label"
                  multiple
                  value={formData.incident_details.violation_types}
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
                {validationErrors['incident_details.violation_types'] && (
                  <FormHelperText>{validationErrors['incident_details.violation_types']}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Incident"
                name="incident_details.date"
                type="date"
                value={formData.incident_details.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={Boolean(validationErrors['incident_details.date'])}
                helperText={validationErrors['incident_details.date']}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                name="incident_details.location.country"
                value={formData.incident_details.location.country}
                onChange={handleNestedChange}
                required
                error={Boolean(validationErrors['incident_details.location.country'])}
                helperText={validationErrors['incident_details.location.country']}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City/Region"
                name="incident_details.location.city"
                value={formData.incident_details.location.city}
                onChange={handleNestedChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Evidence
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                In a full implementation, this section would allow uploading evidence files.
              </Typography>
            </Grid>
            
            {isEditMode && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Status
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-label">Report Status</InputLabel>
                    <Select
                      labelId="status-label"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="under_review">Under Review</MenuItem>
                      <MenuItem value="verified">Verified</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="merged">Merged with Case</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
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
                  >
                    Delete
                  </Button>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : isEditMode ? 'Save Report' : 'Submit Report'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportForm;
