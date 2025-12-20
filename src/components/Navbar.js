import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Info,
  LocalHospital,
  Close,
  Visibility,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: 'Trang chủ', path: '/', icon: <Home /> },
    { text: 'NIfTI Viewer', path: '/nifti-viewer', icon: <Visibility /> },
    { text: 'Giới thiệu', path: '/about', icon: <Info /> },
  ];

  const drawer = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        background: 'linear-gradient(135deg, rgba(26, 29, 58, 0.95) 0%, rgba(45, 27, 105, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          X-ray2CTPA
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>
      
      <List sx={{ mt: 2 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              mx: 1,
              mb: 1,
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: location.pathname === item.path 
                ? 'linear-gradient(45deg, rgba(0, 188, 212, 0.2), rgba(255, 87, 34, 0.2))'
                : 'transparent',
              '&:hover': {
                background: 'linear-gradient(45deg, rgba(0, 188, 212, 0.1), rgba(255, 87, 34, 0.1))',
                transform: 'translateX(8px)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontWeight: 600,
                  color: 'white'
                } 
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'rgba(26, 29, 58, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <LocalHospital
                sx={{
                  fontSize: 32,
                  color: 'primary.main',
                  mr: 1,
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #00bcd4, #ff5722)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                X-ray2CTPA
              </Typography>
            </Box>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Button
                      component={Link}
                      to={item.path}
                      startIcon={item.icon}
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: '25px',
                        background: location.pathname === item.path 
                          ? 'linear-gradient(45deg, rgba(0, 188, 212, 0.3), rgba(255, 87, 34, 0.3))'
                          : 'transparent',
                        border: location.pathname === item.path 
                          ? '1px solid rgba(0, 188, 212, 0.5)'
                          : '1px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(45deg, rgba(0, 188, 212, 0.2), rgba(255, 87, 34, 0.2))',
                          border: '1px solid rgba(0, 188, 212, 0.3)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  background: 'rgba(0, 188, 212, 0.1)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            background: 'transparent',
            border: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Toolbar spacing */}
      <Toolbar />
    </>
  );
};

export default Navbar; 