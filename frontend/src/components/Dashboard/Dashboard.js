import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Button,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CaseIcon from '@mui/icons-material/Gavel';
import ReportIcon from '@mui/icons-material/Report';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    totalReports: 0,
    totalVictims: 0,
    violationsByType: {},
    loading: true,
    error: null
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    // For now, we'll use mock data
    const fetchData = async () => {
      try {
        // Mock data - would be replaced with actual API calls
        setTimeout(() => {
          setStats({
            totalCases: 124,
            totalReports: 187,
            totalVictims: 256,
            violationsByType: {
              forced_displacement: 45,
              property_destruction: 38,
              arbitrary_detention: 67,
              torture: 29,
              extrajudicial_killing: 12,
              other: 23
            },
            loading: false,
            error: null
          });
        }, 1000);
      } catch (error) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const violationChartData = {
    labels: Object.keys(stats.violationsByType).map(key => 
      key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ),
    datasets: [
      {
        label: 'Violations by Type',
        data: Object.values(stats.violationsByType),
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

  if (stats.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (stats.error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: '#fff9f9' }}>
          <Typography color="error" variant="h6">
            <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {stats.error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Human Rights Cases" 
              avatar={<CaseIcon color="primary" />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" align="center" color="primary">
                {stats.totalCases}
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/cases')}
                >
                  View Cases
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Incident Reports" 
              avatar={<ReportIcon color="secondary" />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" align="center" color="secondary">
                {stats.totalReports}
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => navigate('/reports')}
                >
                  View Reports
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Victims & Witnesses" 
              avatar={<PeopleIcon color="info" />}
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Typography variant="h3" align="center" color="info.main">
                {stats.totalVictims}
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="info"
                  onClick={() => navigate('/victims')}
                >
                  View Database
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Violations by Type
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie data={violationChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Violations by Type
            </Typography>
            <Box sx={{ height: 300 }}>
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
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              onClick={() => navigate('/cases/new')}
            >
              New Case
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => navigate('/reports/new')}
            >
              New Report
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="info"
              onClick={() => navigate('/victims/new')}
            >
              Add Victim/Witness
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => navigate('/analytics')}
            >
              View Analytics
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
