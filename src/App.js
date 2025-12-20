import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { motion } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ViewerPage from './pages/ViewerPage';
import AboutPage from './pages/AboutPage';
import NiftiVisualization from './pages/NiftiVisualization';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00bcd4', // Cyan
      light: '#62efff',
      dark: '#008ba3',
    },
    secondary: {
      main: '#ff5722', // Deep Orange
      light: '#ff8a50',
      dark: '#c41c00',
    },
    background: {
      default: '#0a0e27',
      paper: '#1a1d3a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      background: 'linear-gradient(45deg, #00bcd4, #ff5722)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: '0 4px 14px 0 rgba(0, 188, 212, 0.25)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px 0 rgba(0, 188, 212, 0.35)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00acc1, #00838f)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          background: 'rgba(26, 29, 58, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          background: 'rgba(26, 29, 58, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0e27 0%, #1a1d3a 50%, #2d1b69 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background animation */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `
                radial-gradient(circle at 20% 80%, rgba(0, 188, 212, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 87, 34, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(156, 39, 176, 0.1) 0%, transparent 50%)
              `,
              zIndex: -1,
            }}
          />
          
          <Navbar />
          
          <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/viewer/:sessionId" element={<ViewerPage />} />
              <Route path="/nifti-viewer" element={<NiftiVisualization />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </motion.div>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 