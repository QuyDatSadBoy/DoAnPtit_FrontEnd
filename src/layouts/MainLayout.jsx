/**
 * Main Layout Component
 * Sidebar navigation + Header + Main content
 */
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Badge,
    useTheme,
    useMediaQuery,
    Tooltip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    People,
    MedicalServices,
    Biotech,
    Settings,
    Logout,
    Person,
    Notifications,
    LocalHospital,
    AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 260;

// Navigation items
const getNavItems = (isAdmin) => [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Bệnh nhân', icon: <People />, path: '/patients' },
    { text: 'Xem CT Viewer', icon: <Biotech />, path: '/viewer' },
    ...(isAdmin ? [
        { divider: true },
        { text: 'Quản lý Users', icon: <AdminPanelSettings />, path: '/admin/users' },
        { text: 'Cài đặt', icon: <Settings />, path: '/settings' },
    ] : []),
];

const MainLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAdmin } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavClick = (path) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleLogout = () => {
        setAnchorEl(null);
        logout();
        navigate('/login');
    };

    const navItems = getNavItems(isAdmin());

    // Drawer content
    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <LocalHospital sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                        Medical Imaging
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        X-ray to CT 3D
                    </Typography>
                </Box>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, py: 2 }}>
                {navItems.map((item, index) => (
                    item.divider ? (
                        <Divider key={index} sx={{ my: 2 }} />
                    ) : (
                        <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavClick(item.path)}
                                selected={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    )
                ))}
            </List>

            {/* User info */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'grey.100',
                    }}
                >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                            {user?.full_name || user?.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {user?.role === 'admin' ? 'Quản trị viên' : 'Bác sĩ'}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 1,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flex: 1 }} />

                    {/* Notifications */}
                    <Tooltip title="Thông báo">
                        <IconButton onClick={(e) => setNotificationAnchor(e.currentTarget)}>
                            <Badge badgeContent={0} color="error">
                                <Notifications />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* User Menu */}
                    <Tooltip title="Tài khoản">
                        <IconButton
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={{ ml: 1 }}
                        >
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    {/* User Menu Popover */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {user?.full_name || user?.username}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
                            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                            Hồ sơ cá nhân
                        </MenuItem>
                        <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
                            <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                            Cài đặt
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                            Đăng xuất
                        </MenuItem>
                    </Menu>

                    {/* Notifications Popover */}
                    <Menu
                        anchorEl={notificationAnchor}
                        open={Boolean(notificationAnchor)}
                        onClose={() => setNotificationAnchor(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
                    >
                        <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Thông báo
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                Không có thông báo mới
                            </Typography>
                        </Box>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            borderRight: 1,
                            borderColor: 'divider',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    bgcolor: '#F0FDFA',  // Light cyan healthcare background
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
