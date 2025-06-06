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
  Card, 
  CardContent,
  CardActions,
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
  Assignment as CaseIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachFile as AttachmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader, isAdmin, isOrganization } = useAuth();
  
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  
  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/cases/${id}`, {
          headers: {
            ...getAuthHeader()
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch case details');
        }
        
        const data = await response.json();
        setCaseData(data);
      } catch (err) {
        console.error('Error fetching case details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCaseData();
  }, [id, getAuthHeader]);
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/v1/cases/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete case');
      }
      
      // Navigate back to cases list
      navigate('/cases');
    } catch (err) {
      console.error('Error deleting case:', err);
      setError(err.message);
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`/api/v1/cases/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update case status');
      }
      
      // Refresh case data
      const updatedCase = await response.json();
      setCaseData(updatedCase);
      setUpdateStatusDialogOpen(false);
    } catch (err) {
      console.error('Error updating case status:', err);
      setError(err.message);
    }
  };
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'under_investigation':
        return 'primary';
      case 'pending_evidence':
        return 'warning';
      case 'legal_action':
        return 'secondary';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      case 'rejected':
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
          to="/cases"
          sx={{ mt: 2 }}
        >
          Back to Cases
        </Button>
      </Container>
    );
  }
  
  if (!caseData) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>
          Case not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/cases"
          sx={{ mt: 2 }}
        >
          Back to Cases
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
          to="/cases"
        >
          Back to Cases
        </Button>
        
        <Box>
          {(isAdmin() || caseData.submitted_by === 'current_user_id') && (
            <>
              <Button
                startIcon={<EditIcon />}
                component={RouterLink}
                to={`/cases/${id}/edit`}
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
      
      {/* Case header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {caseData.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {caseData.location?.country}
                {caseData.location?.region && `, ${caseData.location.region}`}
                {caseData.location?.city && `, ${caseData.location.city}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                Occurred: {formatDate(caseData.date_occurred)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip 
              label={caseData.status?.replace('_', ' ')} 
              color={getStatusColor(caseData.status)}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Case ID: {caseData.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reported: {formatDate(caseData.date_reported)}
            </Typography>
          </Box>
        </Box>
        
        {/* Status update button for admins and organizations */}
        {(isAdmin() || isOrganization()) && (
          <Button 
            variant="outlined" 
            onClick={() => {
              setNewStatus(caseData.status);
              setUpdateStatusDialogOpen(true);
            }}
            sx={{ mt: 2 }}
          >
            Update Status
          </Button>
        )}
      </Paper>
      
      {/* Case details */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Description */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {caseData.description}
            </Typography>
            
            {/* Violation types */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Violation Types:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {caseData.violation_types?.map((type, index) => (
                  <Chip key={index} label={type.replace('_', ' ')} />
                ))}
              </Box>
            </Box>
          </Paper>
          
          {/* Evidence and attachments */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Evidence and Attachments
            </Typography>
            
            {caseData.attachments && caseData.attachments.length > 0 ? (
              <List>
                {caseData.attachments.map((attachment, index) => (
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
            
            {/* Add attachment button for authorized users */}
            {(isAdmin() || caseData.submitted_by === 'current_user_id' || isOrganization()) && (
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => alert('Attachment upload functionality would be implemented here')}
              >
                Add Attachment
              </Button>
            )}
          </Paper>
          
          {/* Case history */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Case History
            </Typography>
            
            {caseData.history && caseData.history.length > 0 ? (
              <List>
                {caseData.history.map((event, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={event.action}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {event.user_name} - {formatDate(event.timestamp)}
                            </Typography>
                            {event.note && (
                              <Typography component="p" variant="body2">
                                {event.note}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < caseData.history.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No history available
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Case metadata */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Case Details
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Priority
              </Typography>
              <Typography variant="body1">
                {caseData.priority || 'Not set'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Submitted By
              </Typography>
              <Typography variant="body1">
                {caseData.submitted_by_name || 'Anonymous'}
              </Typography>
            </Box>
            
            {caseData.assigned_to && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Assigned To
                </Typography>
                <Typography variant="body1">
                  {caseData.assigned_to_name || 'Not assigned'}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {formatDate(caseData.updated_at)}
              </Typography>
            </Box>
          </Paper>
          
          {/* Related victims/witnesses */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Related Victims/Witnesses
            </Typography>
            
            {caseData.victims && caseData.victims.length > 0 ? (
              <List>
                {caseData.victims.map((victim, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={victim.name || 'Anonymous'} 
                      secondary={`Type: ${victim.type}`} 
                    />
                    {(isAdmin() || isOrganization()) && (
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to={`/victims/${victim.id}`}
                      >
                        View
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No related victims or witnesses
              </Typography>
            )}
            
            {/* Add victim/witness button for authorized users */}
            {(isAdmin() || isOrganization()) && (
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ mt: 2 }}
                component={RouterLink}
                to={`/victims/new?case_id=${id}`}
              >
                Add Victim/Witness
              </Button>
            )}
          </Paper>
          
          {/* Related reports */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Related Reports
            </Typography>
            
            {caseData.reports && caseData.reports.length > 0 ? (
              <List>
                {caseData.reports.map((report, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CaseIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={report.title} 
                      secondary={`Created: ${formatDate(report.created_at)}`} 
                    />
                    <Button 
                      size="small" 
                      component={RouterLink} 
                      to={`/reports/${report.id}`}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No related reports
              </Typography>
            )}
            
            {/* Add report button */}
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              sx={{ mt: 2 }}
              component={RouterLink}
              to={`/reports/new?case_id=${id}`}
            >
              Add Report
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Case</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this case? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Update status dialog */}
      <Dialog
        open={updateStatusDialogOpen}
        onClose={() => setUpdateStatusDialogOpen(false)}
      >
        <DialogTitle>Update Case Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the status of this case and provide a note explaining the change.
          </DialogContentText>
          
          <TextField
            select
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="new">New</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="pending_evidence">Pending Evidence</option>
            <option value="legal_action">Legal Action</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </TextField>
          
          <TextField
            label="Status Note"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            placeholder="Provide a reason for this status change"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStatus} color="primary">Update Status</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CaseDetail;
