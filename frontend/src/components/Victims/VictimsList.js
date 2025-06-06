import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { victimsAPI } from '../../api';
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
import WarningIcon from '@mui/icons-material/Warning';

const VictimsList = () => {
  const [victims, setVictims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    riskLevel: '',
    caseId: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchVictims();
  }, [page, rowsPerPage, filters]);

  const fetchVictims = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        type: filters.type || undefined,
        risk_level: filters.riskLevel || undefined,
        case_id: filters.caseId || undefined
      };
      
      const response = await victimsAPI.getAllVictims(params);
      setVictims(response.data.items || []);
      setTotalCount(response.data.total || 0);
      setLoading(false);
    } catch (error) {
      setError('Failed to load victims/witnesses data: ' + (error.response?.data?.detail || error.message));
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
    fetchVictims();
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleViewVictim = (victimId) => {
    navigate(`/victims/${victimId}`);
  };

  const handleEditVictim = (victimId) => {
    navigate(`/victims/${victimId}/edit`);
  };

  const handleCreateVictim = () => {
    navigate('/victims/new');
  };

  // Get risk level color
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get display name (real name or pseudonym)
  const getDisplayName = (victim) => {
    if (victim.anonymous) {
      return victim.pseudonym || 'Anonymous';
    }
    return victim.demographics?.name || `Person ID: ${victim._id.substring(0, 8)}`;
  };

  if (loading && victims.length === 0) {
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
          Victims & Witnesses Database
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateVictim}
          color="info"
        >
          Add Person
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
              placeholder="Search by pseudonym, occupation, or ethnicity"
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
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    name="type"
                    value={filters.type}
                    label="Type"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="victim">Victim</MenuItem>
                    <MenuItem value="witness">Witness</MenuItem>
                    <MenuItem value="both">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="risk-level-label">Risk Level</InputLabel>
                  <Select
                    labelId="risk-level-label"
                    name="riskLevel"
                    value={filters.riskLevel}
                    label="Risk Level"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Case ID"
                  name="caseId"
                  value={filters.caseId}
                  onChange={handleFilterChange}
                  placeholder="Filter by associated case"
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>
      
      {/* Victims Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="victims table">
          <TableHead>
            <TableRow>
              <TableCell>ID/Pseudonym</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Demographics</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Protection Needed</TableCell>
              <TableCell>Created</TableCell>
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
            ) : victims.length > 0 ? (
              victims.map((victim) => (
                <TableRow key={victim._id}>
                  <TableCell>
                    {getDisplayName(victim)}
                    {victim.anonymous && (
                      <Chip 
                        label="Anonymous" 
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={victim.type} 
                      color={
                        victim.type === 'victim' ? 'error' : 
                        victim.type === 'witness' ? 'primary' : 
                        'secondary'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {victim.demographics ? (
                      <>
                        {victim.demographics.gender && `${victim.demographics.gender}, `}
                        {victim.demographics.age && `${victim.demographics.age} years, `}
                        {victim.demographics.ethnicity && `${victim.demographics.ethnicity}, `}
                        {victim.demographics.occupation && victim.demographics.occupation}
                      </>
                    ) : 'No demographics provided'}
                  </TableCell>
                  <TableCell>
                    {victim.risk_assessment && (
                      <Chip 
                        label={victim.risk_assessment.level} 
                        color={getRiskLevelColor(victim.risk_assessment.level)}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {victim.risk_assessment?.protection_needed ? (
                      <Chip label="Yes" color="error" size="small" />
                    ) : (
                      <Chip label="No" size="small" />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(victim.created_at)}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewVictim(victim._id)}
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary" 
                      onClick={() => handleEditVictim(victim._id)}
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
                    No victims or witnesses found matching the criteria
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

export default VictimsList;
