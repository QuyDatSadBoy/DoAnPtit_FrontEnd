/**
 * Patients List Page
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Alert,
    LinearProgress,
} from '@mui/material';
import {
    Add,
    Search,
    MoreVert,
    Visibility,
    Edit,
    Delete,
    MedicalServices,
    Male,
    Female,
    Phone,
    Email,
    CalendarMonth,
} from '@mui/icons-material';
import { patientsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const PatientsListPage = () => {
    const navigate = useNavigate();
    
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Menu & Dialog states
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    // Load patients
    const loadPatients = useCallback(async () => {
        setLoading(true);
        try {
            const response = await patientsAPI.getAll({
                skip: page * rowsPerPage,
                limit: rowsPerPage,
                search: searchQuery || undefined,
            });
            
            setPatients(response.items || response || []);
            setTotalCount(response.total || response.length || 0);
        } catch (err) {
            console.error('Failed to load patients:', err);
            toast.error('Không thể tải danh sách bệnh nhân');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchQuery]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            loadPatients();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Menu handlers
    const handleMenuOpen = (event, patient) => {
        setAnchorEl(event.currentTarget);
        setSelectedPatient(patient);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Delete handlers
    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await patientsAPI.delete(selectedPatient.id);
            toast.success('Đã xóa bệnh nhân');
            loadPatients();
        } catch (err) {
            toast.error('Không thể xóa bệnh nhân');
        }
        setDeleteDialogOpen(false);
        setSelectedPatient(null);
    };

    // View handlers
    const handleViewClick = () => {
        handleMenuClose();
        setViewDialogOpen(true);
    };

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return '-';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Quản lý bệnh nhân
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Quản lý danh sách và thông tin bệnh nhân
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/patients/new')}
                    size="large"
                >
                    Thêm bệnh nhân
                </Button>
            </Box>

            {/* Search & Filters */}
            <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent sx={{ py: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Tìm kiếm theo tên, số điện thoại..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                    />
                </CardContent>
            </Card>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Patients Table */}
            <Card sx={{ borderRadius: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Bệnh nhân</TableCell>
                                <TableCell>Giới tính</TableCell>
                                <TableCell>Tuổi</TableCell>
                                <TableCell>Số điện thoại</TableCell>
                                <TableCell>Địa chỉ</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {patients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            {searchQuery 
                                                ? 'Không tìm thấy bệnh nhân nào' 
                                                : 'Chưa có bệnh nhân nào trong hệ thống'
                                            }
                                        </Typography>
                                        {!searchQuery && (
                                            <Button
                                                variant="contained"
                                                startIcon={<Add />}
                                                sx={{ mt: 2 }}
                                                onClick={() => navigate('/patients/new')}
                                            >
                                                Thêm bệnh nhân đầu tiên
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                patients.map((patient) => (
                                    <TableRow
                                        key={patient.id}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/patients/${patient.id}`)}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: patient.gender === 'male' ? 'info.main' : 'secondary.main' }}>
                                                    {patient.full_name?.[0] || 'P'}
                                                </Avatar>
                                                <Box>
                                                    <Typography fontWeight={500}>
                                                        {patient.full_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {patient.id?.slice(0, 8)}...
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                icon={patient.gender === 'male' ? <Male /> : <Female />}
                                                label={patient.gender === 'male' ? 'Nam' : 'Nữ'}
                                                color={patient.gender === 'male' ? 'info' : 'secondary'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{calculateAge(patient.date_of_birth)}</TableCell>
                                        <TableCell>{patient.phone || '-'}</TableCell>
                                        <TableCell>{patient.address || '-'}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMenuOpen(e, patient);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                {patients.length > 0 && (
                    <TablePagination
                        component="div"
                        count={totalCount}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        labelRowsPerPage="Số hàng:"
                    />
                )}
            </Card>

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleViewClick}>
                    <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
                    Xem chi tiết
                </MenuItem>
                <MenuItem onClick={() => {
                    handleMenuClose();
                    navigate(`/patients/${selectedPatient?.id}/edit`);
                }}>
                    <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                    Chỉnh sửa
                </MenuItem>
                <MenuItem onClick={() => {
                    handleMenuClose();
                    navigate(`/patients/${selectedPatient?.id}/records`);
                }}>
                    <ListItemIcon><MedicalServices fontSize="small" /></ListItemIcon>
                    Hồ sơ bệnh án
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                    <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
                    Xóa
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa bệnh nhân <strong>{selectedPatient?.full_name}</strong>?
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Detail Dialog */}
            <Dialog 
                open={viewDialogOpen} 
                onClose={() => setViewDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Thông tin bệnh nhân</DialogTitle>
                <DialogContent dividers>
                    {selectedPatient && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        mx: 'auto',
                                        bgcolor: selectedPatient.gender === 'male' ? 'info.main' : 'secondary.main',
                                        fontSize: 32,
                                    }}
                                >
                                    {selectedPatient.full_name?.[0]}
                                </Avatar>
                                <Typography variant="h6" sx={{ mt: 1 }}>
                                    {selectedPatient.full_name}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Giới tính</Typography>
                                <Typography>{selectedPatient.gender === 'male' ? 'Nam' : 'Nữ'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Ngày sinh</Typography>
                                <Typography>
                                    {selectedPatient.date_of_birth 
                                        ? new Date(selectedPatient.date_of_birth).toLocaleDateString('vi-VN')
                                        : '-'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                                <Typography>{selectedPatient.phone || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                <Typography>{selectedPatient.email || '-'}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">Địa chỉ</Typography>
                                <Typography>{selectedPatient.address || '-'}</Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
                    <Button 
                        variant="contained"
                        onClick={() => {
                            setViewDialogOpen(false);
                            navigate(`/patients/${selectedPatient?.id}`);
                        }}
                    >
                        Xem đầy đủ
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PatientsListPage;
