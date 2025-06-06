import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout components
import Layout from './components/Layout/Layout';

// Auth components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Module components
import Dashboard from './components/Dashboard/Dashboard';
import CasesList from './components/Cases/CasesList';
import CaseDetail from './components/Cases/CaseDetail';
import CaseForm from './components/Cases/CaseForm';
import ReportsList from './components/Reports/ReportsList';
import ReportDetail from './components/Reports/ReportDetail';
import ReportForm from './components/Reports/ReportForm';
import VictimsList from './components/Victims/VictimsList';
import VictimDetail from './components/Victims/VictimDetail';
import VictimForm from './components/Victims/VictimForm';
import Analytics from './components/Analytics/Analytics';

// Auth context
import { AuthProvider } from './contexts/AuthContext';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="cases">
                <Route index element={<CasesList />} />
                <Route path="new" element={<CaseForm />} />
                <Route path=":caseId" element={<CaseDetail />} />
                <Route path=":caseId/edit" element={<CaseForm />} />
              </Route>
              <Route path="reports">
                <Route index element={<ReportsList />} />
                <Route path="new" element={<ReportForm />} />
                <Route path=":reportId" element={<ReportDetail />} />
                <Route path=":reportId/edit" element={<ReportForm />} />
              </Route>
              <Route path="victims">
                <Route index element={<VictimsList />} />
                <Route path="new" element={<VictimForm />} />
                <Route path=":victimId" element={<VictimDetail />} />
                <Route path=":victimId/edit" element={<VictimForm />} />
              </Route>
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
