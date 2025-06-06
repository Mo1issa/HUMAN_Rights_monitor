import React, { useState, useEffect } from 'react';
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
  DialogActions
} from '@mui/material';
import { 
  Description as ReportIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachFile as AttachmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Assignment as CaseIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader, isAdmin, isOrganization } = useAuth();
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/reports/${id}`, {
          headers: {
            ...getAuthHeader()
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch report details');
        }
        
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [id, getAuthHeader]);
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/reports/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete report');
      }
      
      // Navigate back to reports list
      navigate('/reports');
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err.message);
    } finally {
      setDeleteDialogOpen(false);
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
          to="/reports"
          sx={{ mt: 2 }}
        >
          Back to Reports
        </Button>
      </Container>
    );
  }
  
  if (!reportData) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>
          Report not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/reports"
          sx={{ mt: 2 }}
        >
          Back to Reports
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
          to="/reports"
        >
          Back to Reports
        </Button>
        
        <Box>
          {(isAdmin() || reportData.reporter_id === 'current_user_id') && (
            <>
              <Button
                startIcon={<EditIcon />}
                component={RouterLink}
                to={`/reports/${id}/edit`}
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
      
      {/* Report header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {reportData.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                Reported on: {formatDate(reportData.created_at)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip 
              label={reportData.status?.replace('_', ' ')} 
              color={reportData.status === 'verified' ? 'success' : 'default'}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Report ID: {reportData.id}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Report details */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Content */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Report Content
            </Typography>
            <Typography variant="body1" paragraph>
              {reportData.content}
            </Typography>
            
            {/* Tags */}
            {reportData.tags && reportData.tags.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {reportData.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
          
          {/* Evidence and attachments */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evidence and Attachments
            </Typography>
            
            {reportData.attachments && reportData.attachments.length > 0 ? (
              <List>
                {reportData.attachments.map((attachment, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AttachmentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={attachment.filename} 
                      secondary={`Uploaded on ${formatDate(attachment.upload_date)}`} 
                    />
                    <Button size="small" href={attachment.url} target="_blank">
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No attachments available
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Report metadata */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Report Details
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Reporter
              </Typography>
              <Typography variant="body1">
                {reportData.reporter_name || 'Anonymous'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Information
              </Typography>
              <Typography variant="body1">
                {reportData.contact_info || 'Not provided'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">
                {reportData.location || 'Not specified'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {formatDate(reportData.updated_at)}
              </Typography>
            </Box>
          </Paper>
          
          {/* Related cases */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Related Cases
            </Typography>
            
            {reportData.related_cases && reportData.related_cases.length > 0 ? (
              <List>
                {reportData.related_cases.map((caseItem, index) => (
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
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No related cases
                </Typography>
                
                {/* Link to create case from report */}
                {(isAdmin() || isOrganization()) && (
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to={`/cases/new?report_id=${id}`}
                  >
                    Create Case from Report
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this report? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportDetail;
