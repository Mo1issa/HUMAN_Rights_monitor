import React, { useState } from 'react';
import { authAPI } from '../../api';
import { 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Box, 
  Container, 
  Alert, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.password || !formData.full_name) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      const userData = {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role
      };
      
      // Call the register function from AuthContext
      const success = await register(userData);
      
      if (success) {
        // Show success message and redirect to login
        setLoading(false);
        navigate('/login', { state: { registrationSuccess: true } });
      } else {
        setError('Failed to register. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred during registration: ' + (err.response?.data?.detail || err.message));
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Human Rights Monitor MIS
        </Typography>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h2" variant="h5" align="center" sx={{ mb: 2 }}>
            Register
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="full_name"
              label="Full Name"
              id="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="investigator">Investigator</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Login
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
