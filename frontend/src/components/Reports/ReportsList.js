import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../api';
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

const ReportsList = () => {
  const [reports, setReports] = useState([]);
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
    fetchReports();
  }, [page, rowsPerPage, filters]);

  const fetchReports = async () => {
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
      
      const response = await reportsAPI.getAllReports(params);
      setReports(response.data.items || []);
      setTotalCount(response.data.total || 0);
      setLoading(false);
    } catch (error) {
      setError('Failed to load reports: ' + (error.response?.data?.detail || error.message));
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
    fetchReports();
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  const handleEditReport = (reportId) => {
    navigate(`/reports/${reportId}/edit`);
  };

  const handleCreateReport = () => {
    navigate('/reports/new');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'under_review':
        return 'warning';
      case 'verified':
        return 'success';
      case 'rejected':
        return 'error';
      case 'merged':
        return 'secondary';
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

  if (loading && reports.length === 0) {
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
          Incident Reports
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateReport}
          color="secondary"
        >
          New Report
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
              placeholder="Search reports by ID or description"
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
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="merged">Merged</MenuItem>
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
      
      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="reports table">
          <TableHead>
            <TableRow>
              <TableCell>Report ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Reporter Type</TableCell>
              <TableCell>Status</TableCell>
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
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report.report_id}</TableCell>
                  <TableCell>{report.incident_details.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={report.reporter_type} 
                      size="small"
                      color={report.anonymous ? "default" : "primary"}
                    />
                    {report.anonymous && (
                      <Chip 
                        label="Anonymous" 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status.replace('_', ' ')} 
                      color={getStatusColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{`${report.incident_details.location.country}${report.incident_details.location.city ? ', ' + report.incident_details.location.city : ''}`}</TableCell>
                  <TableCell>{formatDate(report.incident_details.date)}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewReport(report._id)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      onClick={() => handleEditReport(report._id)}
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
                    No reports found matching the criteria
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

export default ReportsList;
