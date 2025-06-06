import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI } from '../../api';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import MapIcon from '@mui/icons-material/Map';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import DownloadIcon from '@mui/icons-material/Download';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalCases: 0,
    totalReports: 0,
    totalVictims: 0,
    violationCounts: [],
    timelineData: [],
    geoData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    country: '',
    violationType: ''
  });
  const [tabValue, setTabValue] = useState(0);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch violation stats
      const violationResponse = await analyticsAPI.getViolationStats();
      
      // Fetch timeline data
      const timelineResponse = await analyticsAPI.getTimelineData();
      
      // Fetch geo data
      const geoResponse = await analyticsAPI.getGeoData();
      
      // Combine all data
      setAnalyticsData({
        totalCases: violationResponse.data.total_cases || 0,
        totalReports: violationResponse.data.total_reports || 0,
        totalVictims: violationResponse.data.total_victims || 0,
        violationCounts: violationResponse.data.violation_counts || [],
        timelineData: timelineResponse.data.timeline || [],
        geoData: geoResponse.data.geo_data || []
      });
      
      setLoading(false);
    } catch (error) {
      setError('Failed to load analytics data: ' + (error.response?.data?.detail || error.message));
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        country: filters.country || undefined,
        violation_type: filters.violationType || undefined
      };
      
      // Fetch filtered violation stats
      const violationResponse = await analyticsAPI.getViolationStats(params);
      
      // Fetch filtered timeline data
      const timelineResponse = await analyticsAPI.getTimelineData(params);
      
      // Fetch filtered geo data
      const geoResponse = await analyticsAPI.getGeoData(params);
      
      // Combine all data
      setAnalyticsData({
        totalCases: violationResponse.data.total_cases || 0,
        totalReports: violationResponse.data.total_reports || 0,
        totalVictims: violationResponse.data.total_victims || 0,
        violationCounts: violationResponse.data.violation_counts || [],
        timelineData: timelineResponse.data.timeline || [],
        geoData: geoResponse.data.geo_data || []
      });
      
      setLoading(false);
    } catch (error) {
      setError('Failed to apply filters: ' + (error.response?.data?.detail || error.message));
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      country: '',
      violationType: ''
    });
    fetchAnalyticsData();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExportData = async (format) => {
    try {
      // Prepare query parameters
      const params = {
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        country: filters.country || undefined,
        violation_type: filters.violationType || undefined
      };
      
      const response = await analyticsAPI.exportData(format, params);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `human_rights_data.${format}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      setError('Failed to export data: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Format data for charts
  const violationChartData = {
    labels: analyticsData.violationCounts.map(item => 
      item.violation_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ),
    datasets: [
      {
        label: 'Violations by Type',
        data: analyticsData.violationCounts.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const timelineChartData = {
    labels: analyticsData.timelineData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Cases Over Time',
        data: analyticsData.timelineData.map(item => item.count),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      },
    ],
  };

  // Geo data visualization
  const geoChartData = {
    labels: analyticsData.geoData.map(item => `${item.country}, ${item.region}`),
    datasets: [
      {
        label: 'Cases by Location',
        data: analyticsData.geoData.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderWidth: 1,
      },
    ],
  };

  if (loading && Object.values(analyticsData).every(value => 
    Array.isArray(value) ? value.length === 0 : value === 0
  )) {
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
          Data Analysis & Visualization
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExportData('pdf')}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExportData('excel')}
          >
            Export Excel
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Cases
              </Typography>
              <Typography variant="h3" color="primary">
                {analyticsData.totalCases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Reports
              </Typography>
              <Typography variant="h3" color="secondary">
                {analyticsData.totalReports}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Victims/Witnesses
              </Typography>
              <Typography variant="h3" color="info.main">
                {analyticsData.totalVictims}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
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
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              onClick={handleApplyFilters}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Apply'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleResetFilters}
              disabled={loading}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Visualization Tabs */}
      <Paper sx={{ p: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab icon={<PieChartIcon />} label="Violation Types" />
          <Tab icon={<TimelineIcon />} label="Timeline" />
          <Tab icon={<MapIcon />} label="Geographic Distribution" />
        </Tabs>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && (
          <>
            {/* Tab Panels */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 400 }}>
                    <Typography variant="h6" gutterBottom align="center">
                      Violations by Type (Pie Chart)
                    </Typography>
                    {analyticsData.violationCounts.length > 0 ? (
                      <Pie data={violationChartData} options={{ maintainAspectRatio: false }} />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body1" color="text.secondary">
                          No violation data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 400 }}>
                    <Typography variant="h6" gutterBottom align="center">
                      Violations by Type (Bar Chart)
                    </Typography>
                    {analyticsData.violationCounts.length > 0 ? (
                      <Bar 
                        data={violationChartData} 
                        options={{ 
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }} 
                      />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body1" color="text.secondary">
                          No violation data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ height: 400 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Cases Over Time
                </Typography>
                {analyticsData.timelineData.length > 0 ? (
                  <Line 
                    data={timelineChartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      No timeline data available
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom align="center">
                  Geographic Distribution of Cases
                </Typography>
                <Box sx={{ height: 400 }}>
                  {analyticsData.geoData.length > 0 ? (
                    <Bar 
                      data={geoChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                          x: {
                            beginAtZero: true
                          }
                        }
                      }} 
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No geographic data available
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Note: In a production environment, this would be an interactive map visualization.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Analytics;
