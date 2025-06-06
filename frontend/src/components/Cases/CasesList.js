import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { casesAPI } from '../../api';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  TextField, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const CasesList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    violationType: '',
    country: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchCases();
  }, [page, rowsPerPage, filters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        status: filters.status || undefined,
        violation_type: filters.violationType || undefined,
        country: filters.country || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined
      };
      
      const response = await casesAPI.getAllCases(params);
      setCases(response.data.items || []);
      setTotalCount(response.data.total || 0);
      setLoading(false);
    } catch (error) {
      setError('Failed to load cases: ' + (error.response?.data?.detail || error.message));
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    setPage(0);
    fetchCases();
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleViewCase = (caseId) => {
    navigate(`/cases/${caseId}`);
  };

  const handleEditCase = (caseId) => {
    navigate(`/cases/${caseId}/edit`);
  };

  const handleCreateCase = () => {
    navigate('/cases/new');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'under_investigation':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && cases.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Human Rights Cases
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateCase}
        >
          New Case
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search cases by title, ID, or description"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={handleSearch}>Search</Button>
                  </InputAdornment>
                )
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              color="primary"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
          
          {showFilters && (
            <>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={filters.status}
                    label="Status"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
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
                  <InputLabel id="violation-type-label">Violation Type</InputLabel>
                  <Select
                    labelId="violation-type-label"
                    name="violationType"
                    value={filters.violationType}
                    label="Violation Type"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="forced_displacement">Forced Displacement</MenuItem>
                    <MenuItem value="property_destruction">Property Destruction</MenuItem>
                    <MenuItem value="arbitrary_detention">Arbitrary Detention</MenuItem>
                    <MenuItem value="torture">Torture</MenuItem>
                    <MenuItem value="extrajudicial_killing">Extrajudicial Killing</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={filters.country}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Cases Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="cases table">
          <TableHead>
            <TableRow>
              <TableCell>Case ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Date Occurred</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : cases.length > 0 ? (
              cases.map((caseItem) => (
                <TableRow key={caseItem._id}>
                  <TableCell>{caseItem.case_id}</TableCell>
                  <TableCell>{caseItem.title}</TableCell>
                  <TableCell>
                    <Chip 
                      label={caseItem.status.replace('_', ' ')} 
                      color={getStatusColor(caseItem.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={caseItem.priority} 
                      color={caseItem.priority === 'high' ? 'error' : 
                             caseItem.priority === 'medium' ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{`${caseItem.location.country}${caseItem.location.region ? ', ' + caseItem.location.region : ''}`}</TableCell>
                  <TableCell>{formatDate(caseItem.date_occurred)}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewCase(caseItem._id)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      onClick={() => handleEditCase(caseItem._id)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No cases found matching the criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default CasesList;
