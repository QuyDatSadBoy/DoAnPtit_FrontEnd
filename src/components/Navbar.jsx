import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Brain,
  Upload,
  FileText,
  Eye,
  WifiOff,
  Computer,
  CloudOff,
  Visibility,
  Home,
  Info,
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Check server connectivity
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          timeout: 3000 
        });
        setIsOffline(!response.ok);
      } catch (error) {
        setIsOffline(true);
      }
    };

    checkConnectivity();
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/nifti-viewer', label: 'NIfTI Viewer', icon: <Visibility size={18} /> },
    { path: '/about', label: 'About', icon: <Info size={18} /> },
  ];

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <IconButton
            component={Link}
            to="/"
            sx={{ 
              p: 0, 
              mr: 2,
              color: 'inherit',
              '&:hover': { backgroundColor: 'transparent' }
            }}
          >
            <Brain size={32} />
          </IconButton>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              fontWeight: 700,
              textDecoration: 'none',
              color: 'inherit',
              background: 'linear-gradient(45deg, #ffffff, #e0e0e0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              '&:hover': {
                background: 'linear-gradient(45deg, #f5f5f5, #cccccc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }
            }}
          >
            X-ray2CTPA
          </Typography>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              startIcon={item.icon}
              sx={{
                color: 'inherit',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.active': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  fontWeight: 600,
                }
              }}
              className={isActive(item.path) ? 'active' : ''}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Connection Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isOffline ? 'Server offline - NIfTI viewer works offline' : 'Server online - All features available'}>
            <Chip
              icon={isOffline ? <WifiOff size={16} /> : <Computer size={16} />}
              label={isOffline ? 'Offline' : 'Online'}
              size="small"
              color={isOffline ? 'warning' : 'success'}
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
                '&.MuiChip-colorWarning': {
                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  borderColor: 'rgba(255, 152, 0, 0.5)',
                },
                '&.MuiChip-colorSuccess': {
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  borderColor: 'rgba(76, 175, 80, 0.5)',
                },
              }}
            />
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 