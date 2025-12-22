/**
 * Patient Detail Page
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Avatar,
    Chip,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Breadcrumbs,
    Link,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';
import {
    ArrowBack,
    Edit,
    Delete,
    Add,
    MedicalServices,
    Biotech,
    CalendarMonth,
    Phone,
    Email,
    LocationOn,
    Visibility,
    Male,
    Female,
} from '@mui/icons-material';
import { patientsAPI, medicalRecordsAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
    <div role="tabpanel" hidden={value !== index} {...other}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

const PatientDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [patient, setPatient] = useState(null);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Load patient data
    const loadPatient = useCallback(async () => {
        setLoading(true);
        try {
            const [patientData, recordsData] = await Promise.all([
                patientsAPI.getById(id),
                medicalRecordsAPI.getByPatient(id).catch(() => []),
            ]);
            
            setPatient(patientData);
            setMedicalRecords(recordsData.items || recordsData || []);
        } catch (err) {
            console.error('Failed to load patient:', err);
            toast.error('Không thể tải thông tin bệnh nhân');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadPatient();
    }, [loadPatient]);

    // Calculate age
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return '-';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return `${age} tuổi`;
    };

    // Delete handlers
    const handleDelete = async () => {
        try {
            await patientsAPI.delete(id);
            toast.success('Đã xóa bệnh nhân');
            navigate('/patients');
        } catch (err) {
            toast.error('Không thể xóa bệnh nhân');
        }
        setDeleteDialogOpen(false);
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!patient) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="error">Không tìm thấy bệnh nhân</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate('/dashboard')}
                    sx={{ cursor: 'pointer' }}
                >
                    Dashboard
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate('/patients')}
                    sx={{ cursor: 'pointer' }}
                >
                    Bệnh nhân
                </Link>
                <Typography color="text.primary">{patient.full_name}</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/patients')}>
                    Quay lại
                </Button>
            </Box>

            {/* Patient Info Card */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        {/* Avatar & Basic Info */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: patient.gender === 'male' ? 'info.main' : 'secondary.main',
                                        fontSize: 48,
                                        mb: 2,
                                    }}
                                >
                                    {patient.full_name?.[0]}
                                </Avatar>
                                <Typography variant="h5" fontWeight="bold" textAlign="center">
                                    {patient.full_name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    <Chip
                                        size="small"
                                        icon={patient.gender === 'male' ? <Male /> : <Female />}
                                        label={patient.gender === 'male' ? 'Nam' : 'Nữ'}
                                        color={patient.gender === 'male' ? 'info' : 'secondary'}
                                    />
                                    <Chip
                                        size="small"
                                        label={calculateAge(patient.date_of_birth)}
                                    />
                                </Box>
                                <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Edit />}
                                        onClick={() => navigate(`/patients/${id}/edit`)}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        Xóa
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Thông tin chi tiết
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <CalendarMonth color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Ngày sinh
                                            </Typography>
                                            <Typography>
                                                {patient.date_of_birth 
                                                    ? new Date(patient.date_of_birth).toLocaleDateString('vi-VN')
                                                    : '-'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Phone color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Số điện thoại
                                            </Typography>
                                            <Typography>{patient.phone || '-'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Email color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Email
                                            </Typography>
                                            <Typography>{patient.email || '-'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <LocationOn color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Địa chỉ
                                            </Typography>
                                            <Typography>{patient.address || '-'}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                {patient.notes && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Ghi chú
                                        </Typography>
                                        <Typography>{patient.notes}</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Card sx={{ borderRadius: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab icon={<MedicalServices />} label="Hồ sơ bệnh án" iconPosition="start" />
                    <Tab icon={<Biotech />} label="Lịch sử tái tạo CT" iconPosition="start" />
                </Tabs>

                {/* Medical Records Tab */}
                <TabPanel value={tabValue} index={0}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight="bold">
                                Hồ sơ bệnh án ({medicalRecords.length})
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => navigate(`/medical-records/new?patient_id=${id}`)}
                            >
                                Thêm hồ sơ
                            </Button>
                        </Box>

                        {medicalRecords.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                                <MedicalServices sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                <Typography color="text.secondary">
                                    Chưa có hồ sơ bệnh án nào
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate(`/medical-records/new?patient_id=${id}`)}
                                >
                                    Tạo hồ sơ đầu tiên
                                </Button>
                            </Paper>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ngày khám</TableCell>
                                            <TableCell>Chẩn đoán</TableCell>
                                            <TableCell>Bác sĩ</TableCell>
                                            <TableCell>Số lần tái tạo CT</TableCell>
                                            <TableCell align="right">Thao tác</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {medicalRecords.map((record) => (
                                            <TableRow key={record.id} hover>
                                                <TableCell>
                                                    {new Date(record.visit_date).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell>{record.diagnosis || '-'}</TableCell>
                                                <TableCell>{record.doctor_name || '-'}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={record.infer_history?.length || 0}
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        onClick={() => navigate(`/medical-records/${record.id}`)}
                                                    >
                                                        <Visibility />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </TabPanel>

                {/* Inference History Tab */}
                <TabPanel value={tabValue} index={1}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Lịch sử tái tạo CT
                        </Typography>
                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                            <Biotech sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography color="text.secondary">
                                Xem lịch sử tái tạo CT trong từng hồ sơ bệnh án
                            </Typography>
                        </Paper>
                    </CardContent>
                </TabPanel>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa bệnh nhân <strong>{patient?.full_name}</strong>?
                        Tất cả hồ sơ bệnh án liên quan cũng sẽ bị xóa. Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PatientDetailPage;
