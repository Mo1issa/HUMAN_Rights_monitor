import React, { useState, useEffect } from 'react';
import AlertTitle from '@mui/material/AlertTitle';

import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  Chip, 
  Button, 
  Divider, 
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Assignment as CaseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VictimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader, isAdmin, isOrganization } = useAuth();
  
  const [victimData, setVictimData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [riskAssessmentDialogOpen, setRiskAssessmentDialogOpen] = useState(false);
  const [riskLevel, setRiskLevel] = useState('');
  const [riskNote, setRiskNote] = useState('');
  
  // Check if user has permission to view victim details
  const hasPermission = () => {
    return isAdmin() || isOrganization();
  };
  
  useEffect(() => {
    const fetchVictimData = async () => {
      try {
        setLoading(true);
        
        // Only fetch if user has permission
        if (!hasPermission()) {
          throw new Error('You do not have permission to view victim details');
        }
        
        const response = await fetch(`/api/v1/victims/${id}`, {
          headers: {
            ...getAuthHeader()
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch victim details');
        }
        
        const data = await response.json();
        setVictimData(data);
      } catch (err) {
        console.error('Error fetching victim details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVictimData();
  }, [id, getAuthHeader]);
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/victims/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete victim record');
      }
      
      // Navigate back to victims list
      navigate('/victims');
    } catch (err) {
      console.error('Error deleting victim record:', err);
      setError(err.message);
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleUpdateRiskAssessment = async () => {
    try {
      const response = await fetch(`/api/v1/victims/${id}/risk-assessment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          risk_level: riskLevel,
          risk_note: riskNote
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update risk assessment');
      }
      
      // Refresh victim data
      const updatedVictim = await response.json();
      setVictimData(updatedVictim);
      setRiskAssessmentDialogOpen(false);
    } catch (err) {
      console.error('Error updating risk assessment:', err);
      setError(err.message);
    }
  };
  
  // Helper function to get risk level color
  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/victims"
          sx={{ mt: 2 }}
        >
          Back to Victims/Witnesses
        </Button>
      </Container>
    );
  }
  
  if (!victimData) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>
          Victim/Witness record not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/victims"
          sx={{ mt: 2 }}
        >
          Back to Victims/Witnesses
        </Button>
      </Container>
    );
  }
  
  return (
    <Container>
      {/* Back button and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/victims"
        >
          Back to Victims/Witnesses
        </Button>
        
        <Box>
          {hasPermission() && (
            <>
              <Button
                startIcon={<EditIcon />}
                component={RouterLink}
                to={`/victims/${id}/edit`}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </Box>
      
      {/* Security notice */}
      <Alert severity="warning" sx={{ mb: 4 }}>
        <AlertTitle>Sensitive Information</AlertTitle>
        This record contains sensitive personal information. Handle with care and in accordance with privacy regulations.
      </Alert>
      
      {/* Victim header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {victimData.name || 'Anonymous'}
              {!victimData.name && (
                <Chip label="Anonymous" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {victimData.type === 'victim' ? 'Victim' : 'Witness'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                Added on: {formatDate(victimData.created_at)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SecurityIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ mr: 1 }}>
                Risk Level:
              </Typography>
              <Chip 
                label={victimData.risk_level || 'Not Assessed'} 
                color={getRiskLevelColor(victimData.risk_level)}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              ID: {victimData.id}
            </Typography>
          </Box>
        </Box>
        
        {/* Risk assessment button */}
        {hasPermission() && (
          <Button 
            variant="outlined" 
            startIcon={<WarningIcon />}
            onClick={() => {
              setRiskLevel(victimData.risk_level || 'low');
              setRiskNote(victimData.risk_note || '');
              setRiskAssessmentDialogOpen(true);
            }}
            sx={{ mt: 2 }}
          >
            Update Risk Assessment
          </Button>
        )}
      </Paper>
      
      {/* Victim details */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Personal information */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Age
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {victimData.age || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {victimData.gender || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nationality
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {victimData.nationality || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Language
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {victimData.language || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Current Location
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {victimData.current_location || 'Not provided'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Testimony/Statement */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Testimony/Statement
            </Typography>
            
            {victimData.statement ? (
              <Typography variant="body1" paragraph>
                {victimData.statement}
              </Typography>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No statement provided
              </Typography>
            )}
            
            {victimData.statement_date && (
              <Typography variant="body2" color="text.secondary">
                Statement recorded on: {formatDate(victimData.statement_date)}
              </Typography>
            )}
          </Paper>
          
          {/* Risk assessment details */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Risk Assessment
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Risk Level
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  label={victimData.risk_level || 'Not Assessed'} 
                  color={getRiskLevelColor(victimData.risk_level)}
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Last updated: {formatDate(victimData.risk_updated_at)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Risk Assessment Notes
              </Typography>
              <Typography variant="body1">
                {victimData.risk_note || 'No risk assessment notes provided'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Protection Measures
              </Typography>
              {victimData.protection_measures && victimData.protection_measures.length > 0 ? (
                <List>
                  {victimData.protection_measures.map((measure, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText primary={measure} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1">
                  No protection measures recorded
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Contact information */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">
                {victimData.phone || 'Not provided'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {victimData.email || 'Not provided'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Preferred Contact Method
              </Typography>
              <Typography variant="body1">
                {victimData.preferred_contact_method || 'Not specified'}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Notes
              </Typography>
              <Typography variant="body1">
                {victimData.contact_notes || 'No contact notes provided'}
              </Typography>
            </Box>
          </Paper>
          
          {/* Related cases */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Related Cases
            </Typography>
            
            {victimData.related_cases && victimData.related_cases.length > 0 ? (
              <List>
                {victimData.related_cases.map((caseItem, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CaseIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={caseItem.title} 
                      secondary={`Status: ${caseItem.status?.replace('_', ' ')}`} 
                    />
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/cases/${caseItem.id}`}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No related cases
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Victim/Witness Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this victim/witness record? This action cannot be undone and may impact related cases.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Risk assessment dialog */}
      <Dialog
        open={riskAssessmentDialogOpen}
        onClose={() => setRiskAssessmentDialogOpen(false)}
      >
        <DialogTitle>Update Risk Assessment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the risk level and provide notes about the risk assessment.
          </DialogContentText>
          
          <TextField
            select
            label="Risk Level"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            fullWidth
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </TextField>
          
          <TextField
            label="Risk Assessment Notes"
            value={riskNote}
            onChange={(e) => setRiskNote(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            placeholder="Provide details about the risk assessment and any recommended protection measures"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRiskAssessmentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateRiskAssessment} color="primary">Update Assessment</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VictimDetail;
