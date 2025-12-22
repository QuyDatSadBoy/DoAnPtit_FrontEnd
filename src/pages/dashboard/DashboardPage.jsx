/**
 * Dashboard Page
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    LinearProgress,
    IconButton,
    Paper,
} from '@mui/material';
import {
    People,
    MedicalServices,
    LocalHospital,
    TrendingUp,
    Add,
    ArrowForward,
    Biotech,
    CheckCircle,
    Error,
    Pending,
    Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { statisticsAPI, patientsAPI } from '../../services/api';
import socketService from '../../services/socket';

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card
        sx={{
            height: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.3s',
            '&:hover': {
                transform: 'translateY(-4px)',
            },
        }}
    >
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ color }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Avatar
                    sx={{
                        bgcolor: `${color}20`,
                        color: color,
                        width: 56,
                        height: 56,
                    }}
                >
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

// Inference Status Badge
const InferenceStatusBadge = ({ status }) => {
    const configs = {
        pending: { color: 'warning', icon: <Pending fontSize="small" />, label: 'Đang chờ' },
        processing: { color: 'info', icon: <Biotech fontSize="small" />, label: 'Đang xử lý' },
        completed: { color: 'success', icon: <CheckCircle fontSize="small" />, label: 'Hoàn thành' },
        failed: { color: 'error', icon: <Error fontSize="small" />, label: 'Thất bại' },
    };
    const config = configs[status] || configs.pending;
    
    return (
        <Chip
            size="small"
            icon={config.icon}
            label={config.label}
            color={config.color}
            variant="outlined"
        />
    );
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    
    const [stats, setStats] = useState({
        total_patients: 0,
        total_records: 0,
        total_inferences: 0,
        completed_inferences: 0,
    });
    const [recentPatients, setRecentPatients] = useState([]);
    const [recentInferences, setRecentInferences] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load dashboard data
    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsData, patientsData] = await Promise.all([
                statisticsAPI.getDashboard().catch(() => ({})),
                patientsAPI.getAll({ limit: 5 }).catch(() => ({ items: [] })),
            ]);

            setStats({
                total_patients: statsData.total_patients || 0,
                total_records: statsData.total_records || 0,
                total_inferences: statsData.total_inferences || 0,
                completed_inferences: statsData.completed_inferences || 0,
            });
            setRecentPatients(patientsData.items || patientsData || []);
            setRecentInferences(statsData.recent_inferences || []);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Socket.IO listeners for real-time updates
    useEffect(() => {
        const unsubComplete = socketService.on('inference_completed', (data) => {
            loadDashboardData();
        });

        const unsubFailed = socketService.on('inference_failed', (data) => {
            loadDashboardData();
        });

        return () => {
            unsubComplete();
            unsubFailed();
        };
    }, [loadDashboardData]);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Xin chào, {user?.full_name || user?.username}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Chào mừng bạn đến với hệ thống Medical Imaging
                    </Typography>
                </Box>
                <IconButton onClick={loadDashboardData} disabled={loading}>
                    <Refresh />
                </IconButton>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tổng bệnh nhân"
                        value={stats.total_patients}
                        icon={<People />}
                        color="#2196f3"
                        subtitle="Trong hệ thống"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Hồ sơ bệnh án"
                        value={stats.total_records}
                        icon={<MedicalServices />}
                        color="#4caf50"
                        subtitle="Tổng số hồ sơ"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Lượt tái tạo CT"
                        value={stats.total_inferences}
                        icon={<Biotech />}
                        color="#ff9800"
                        subtitle={`${stats.completed_inferences} hoàn thành`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tỷ lệ thành công"
                        value={stats.total_inferences > 0 
                            ? `${Math.round((stats.completed_inferences / stats.total_inferences) * 100)}%`
                            : '0%'
                        }
                        icon={<TrendingUp />}
                        color="#9c27b0"
                        subtitle="Tái tạo CT"
                    />
                </Grid>
            </Grid>

            {/* Content Grid */}
            <Grid container spacing={3}>
                {/* Recent Patients */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Bệnh nhân gần đây
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForward />}
                                    onClick={() => navigate('/patients')}
                                >
                                    Xem tất cả
                                </Button>
                            </Box>
                            
                            {recentPatients.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <People sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography color="text.secondary">
                                        Chưa có bệnh nhân nào
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        sx={{ mt: 2 }}
                                        onClick={() => navigate('/patients/new')}
                                    >
                                        Thêm bệnh nhân
                                    </Button>
                                </Box>
                            ) : (
                                <List>
                                    {recentPatients.map((patient, index) => (
                                        <ListItem
                                            key={patient.id || index}
                                            button
                                            onClick={() => navigate(`/patients/${patient.id}`)}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                '&:hover': { bgcolor: 'action.hover' },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {patient.full_name?.[0] || 'P'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={patient.full_name || patient.name}
                                                secondary={`${patient.gender === 'male' ? 'Nam' : 'Nữ'} • ${patient.phone || ''}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Inferences */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Tái tạo CT gần đây
                                </Typography>
                            </Box>
                            
                            {recentInferences.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Biotech sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography color="text.secondary">
                                        Chưa có lượt tái tạo nào
                                    </Typography>
                                </Box>
                            ) : (
                                <List>
                                    {recentInferences.map((inference, index) => (
                                        <ListItem
                                            key={inference.id || index}
                                            sx={{
                                                borderRadius: 2,
                                                mb: 1,
                                                bgcolor: 'grey.50',
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                    <LocalHospital />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={inference.patient_name || `Bệnh nhân #${index + 1}`}
                                                secondary={new Date(inference.created_at).toLocaleString('vi-VN')}
                                            />
                                            <InferenceStatusBadge status={inference.status} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
                        <Grid container alignItems="center" spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    Tái tạo ảnh CT 3D từ X-ray
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    Sử dụng công nghệ AI tiên tiến để tái tạo ảnh CT 3D từ ảnh X-ray 2D.
                                    Thời gian xử lý trung bình: 2-3 phút.
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: 'grey.100' },
                                    }}
                                    onClick={() => navigate('/patients')}
                                >
                                    Bắt đầu ngay
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardPage;
