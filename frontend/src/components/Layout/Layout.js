import React from 'react';
import { AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Container } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CaseIcon from '@mui/icons-material/Gavel';
import ReportIcon from '@mui/icons-material/Report';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Cases', icon: <CaseIcon />, path: '/cases' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    { text: 'Victims/Witnesses', icon: <PeopleIcon />, path: '/victims' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Human Rights Monitor MIS
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} onClick={() => navigate(item.path)}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
