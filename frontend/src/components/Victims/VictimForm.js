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

const VictimForm = () => {
  const { victimId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(victimId);
  
  const [formData, setFormData] = useState({
    type: 'victim',
    anonymous: false,
    pseudonym: '',
    demographics: {
      gender: '',
      age: '',
      ethnicity: '',
      occupation: ''
    },
    contact_info: {
      email: '',
      phone: '',
      secure_messaging: ''
    },
    cases_involved: [],
    risk_assessment: {
      level: 'low',
      threats: [],
      protection_needed: false,
      notes: ''
    },
    support_services: []
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  useEffect(() => {
    if (isEditMode) {
      // In a real implementation, this would fetch the victim data from the API
      // For now, we'll use mock data
      const fetchVictimData = async () => {
        try {
          // Mock data - would be replaced with actual API call
          setTimeout(() => {
            const mockVictim = {
              _id: victimId,
              type: 'victim',
              anonymous: false,
              pseudonym: null,
              demographics: {
                gender: 'female',
                age: 34,
                ethnicity: 'Kurdish',
                occupation: 'teacher'
              },
              contact_info: {
                email: 'safecontact@example.org',
                phone: '+963987654321',
                secure_messaging: 'signal'
              },
              cases_involved: ['507f1f77bcf86cd799439011'],
              risk_assessment: {
                level: 'medium',
                threats: ['intimidation', 'surveillance'],
                protection_needed: true,
                notes: 'Subject has reported being followed on multiple occasions'
              },
              support_services: [
                {
                  type: 'legal',
                  provider: 'HRM Legal Team',
                  status: 'active'
                }
              ],
              created_at: '2023-04-21T10:00:00Z',
              updated_at: '2023-05-15T14:20:00Z'
            };
            
            setFormData(mockVictim);
            setLoading(false);
          }, 1000);
        } catch (error) {
          setError('Failed to load victim/witness data');
          setLoading(false);
        }
      };

      fetchVictimData();
    }
  }, [victimId, isEditMode]);

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

  const handleAnonymousChange = (e) => {
    setFormData(prev => ({
      ...prev,
      anonymous: e.target.checked
    }));
  };

  const handleProtectionNeededChange = (e) => {
    setFormData(prev => ({
      ...prev,
      risk_assessment: {
        ...prev.risk_assessment,
        protection_needed: e.target.checked
      }
    }));
  };

  const handleThreatsChange = (e) => {
    setFormData(prev => ({
      ...prev,
      risk_assessment: {
        ...prev.risk_assessment,
        threats: e.target.value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    if (!formData.type) errors.type = 'Type is required';
    
    if (formData.anonymous && !formData.pseudonym) {
      errors.pseudonym = 'Pseudonym is required for anonymous individuals';
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
        
        // Navigate back to victims list after a short delay
        setTimeout(() => {
          navigate('/victims');
        }, 1500);
      }, 1000);
    } catch (error) {
      setError('Failed to save victim/witness data');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/victims');
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
        {isEditMode ? 'Edit Victim/Witness' : 'Add New Victim/Witness'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Victim/witness data {isEditMode ? 'updated' : 'saved'} successfully!
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required error={Boolean(validationErrors.type)}>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <MenuItem value="victim">Victim</MenuItem>
                  <MenuItem value="witness">Witness</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
                {validationErrors.type && (
                  <FormHelperText>{validationErrors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.anonymous} 
                    onChange={handleAnonymousChange} 
                    name="anonymous" 
                  />
                }
                label="Anonymous"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pseudonym"
                name="pseudonym"
                value={formData.pseudonym || ''}
                onChange={handleChange}
                error={Boolean(validationErrors.pseudonym)}
                helperText={validationErrors.pseudonym}
                disabled={!formData.anonymous}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Demographics
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="demographics.gender"
                  value={formData.demographics.gender || ''}
                  onChange={handleChange}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Age"
                name="demographics.age"
                type="number"
                value={formData.demographics.age || ''}
                onChange={handleChange}
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Ethnicity"
                name="demographics.ethnicity"
                value={formData.demographics.ethnicity || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Occupation"
                name="demographics.occupation"
                value={formData.demographics.occupation || ''}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email"
                name="contact_info.email"
                value={formData.contact_info.email || ''}
                onChange={handleChange}
                disabled={formData.anonymous}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone"
                name="contact_info.phone"
                value={formData.contact_info.phone || ''}
                onChange={handleChange}
                disabled={formData.anonymous}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Secure Messaging"
                name="contact_info.secure_messaging"
                value={formData.contact_info.secure_messaging || ''}
                onChange={handleChange}
                placeholder="e.g., Signal, WhatsApp"
                disabled={formData.anonymous}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Risk Assessment
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="risk-level-label">Risk Level</InputLabel>
                <Select
                  labelId="risk-level-label"
                  name="risk_assessment.level"
                  value={formData.risk_assessment.level}
                  onChange={handleChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="threats-label">Threats</InputLabel>
                <Select
                  labelId="threats-label"
                  multiple
                  value={formData.risk_assessment.threats}
                  onChange={handleThreatsChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="intimidation">Intimidation</MenuItem>
                  <MenuItem value="surveillance">Surveillance</MenuItem>
                  <MenuItem value="physical_violence">Physical Violence</MenuItem>
                  <MenuItem value="digital_threats">Digital Threats</MenuItem>
                  <MenuItem value="legal_harassment">Legal Harassment</MenuItem>
                  <MenuItem value="family_threats">Threats to Family</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.risk_assessment.protection_needed} 
                    onChange={handleProtectionNeededChange} 
                    name="protection_needed" 
                  />
                }
                label="Protection Needed"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Risk Assessment Notes"
                name="risk_assessment.notes"
                value={formData.risk_assessment.notes || ''}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Case Association
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                In a full implementation, this section would allow linking to specific cases.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Support Services
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                In a full implementation, this section would allow adding support services.
              </Typography>
            </Grid>
            
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
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default VictimForm;
