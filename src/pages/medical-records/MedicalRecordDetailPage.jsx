/**
 * Medical Record Detail Page
 * With X-ray upload and CT inference functionality
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    Chip,
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
    TextField,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from '@mui/material';
import {
    ArrowBack,
    Edit,
    Delete,
    CloudUpload,
    Image,
    Biotech,
    CheckCircle,
    Error,
    Pending,
    HourglassEmpty,
    Visibility,
    Download,
    Refresh,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { medicalRecordsAPI, inferenceAPI, patientsAPI } from '../../services/api';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';

// Inference Status Component
const InferenceStatusChip = ({ status }) => {
    const configs = {
        pending: { color: 'warning', icon: <HourglassEmpty />, label: 'Đang chờ' },
        processing: { color: 'info', icon: <Biotech />, label: 'Đang xử lý' },
        completed: { color: 'success', icon: <CheckCircle />, label: 'Hoàn thành' },
        failed: { color: 'error', icon: <Error />, label: 'Thất bại' },
    };
    const config = configs[status] || configs.pending;
    
    return (
        <Chip
            icon={config.icon}
            label={config.label}
            color={config.color}
            size="small"
        />
    );
};

const MedicalRecordDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const patientIdParam = searchParams.get('patient_id');
    
    const isNew = id === 'new';
    
    const [record, setRecord] = useState(null);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    
    // Form data for new record
    const [formData, setFormData] = useState({
        patient_id: patientIdParam || '',
        visit_date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        notes: '',
    });
    
    // Selected X-ray file
    const [xrayFile, setXrayFile] = useState(null);
    const [xrayPreview, setXrayPreview] = useState(null);

    // Dropzone for X-ray upload
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setXrayFile(file);
                setXrayPreview(URL.createObjectURL(file));
            }
        },
    });

    // Load data
    const loadData = useCallback(async () => {
        if (isNew) {
            if (patientIdParam) {
                try {
                    const patientData = await patientsAPI.getById(patientIdParam);
                    setPatient(patientData);
                } catch (err) {
                    console.error('Failed to load patient:', err);
                }
            }
            return;
        }

        setLoading(true);
        try {
            const recordData = await medicalRecordsAPI.getById(id);
            setRecord(recordData);
            
            if (recordData.patient_id) {
                const patientData = await patientsAPI.getById(recordData.patient_id);
                setPatient(patientData);
            }
        } catch (err) {
            console.error('Failed to load record:', err);
            toast.error('Không thể tải hồ sơ bệnh án');
        } finally {
            setLoading(false);
        }
    }, [id, isNew, patientIdParam]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Socket.IO listeners for inference updates
    useEffect(() => {
        const unsubStatus = socketService.on('inference_status', (data) => {
            if (data.medical_record_id === id) {
                loadData();
            }
        });

        const unsubComplete = socketService.on('inference_completed', (data) => {
            if (data.medical_record_id === id) {
                toast.success('Tái tạo CT hoàn thành!');
                loadData();
            }
        });

        const unsubFailed = socketService.on('inference_failed', (data) => {
            if (data.medical_record_id === id) {
                toast.error('Tái tạo CT thất bại: ' + (data.error || 'Unknown error'));
                loadData();
            }
        });

        return () => {
            unsubStatus();
            unsubComplete();
            unsubFailed();
        };
    }, [id, loadData]);

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Save record
    const handleSave = async () => {
        if (!formData.patient_id) {
            toast.error('Vui lòng chọn bệnh nhân');
            return;
        }

        setSaving(true);
        try {
            if (isNew) {
                const newRecord = await medicalRecordsAPI.create(formData);
                toast.success('Đã tạo hồ sơ bệnh án');
                navigate(`/medical-records/${newRecord.id}`, { replace: true });
            } else {
                await medicalRecordsAPI.update(id, formData);
                toast.success('Đã cập nhật hồ sơ');
                loadData();
            }
        } catch (err) {
            toast.error('Không thể lưu hồ sơ');
        } finally {
            setSaving(false);
        }
    };

    // Start inference
    const handleStartInference = async () => {
        if (!xrayFile) {
            toast.error('Vui lòng chọn ảnh X-ray');
            return;
        }

        setUploading(true);
        try {
            const response = await inferenceAPI.startInference(id, xrayFile);
            toast.success('Đã bắt đầu tái tạo CT. Vui lòng đợi...');
            setXrayFile(null);
            setXrayPreview(null);
            loadData();
        } catch (err) {
            toast.error('Không thể bắt đầu tái tạo CT');
        } finally {
            setUploading(false);
        }
    };

    // Delete record
    const handleDelete = async () => {
        try {
            await medicalRecordsAPI.delete(id);
            toast.success('Đã xóa hồ sơ bệnh án');
            navigate(`/patients/${record?.patient_id}`);
        } catch (err) {
            toast.error('Không thể xóa hồ sơ');
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
                {patient && (
                    <Link
                        underline="hover"
                        color="inherit"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        sx={{ cursor: 'pointer' }}
                    >
                        {patient.full_name}
                    </Link>
                )}
                <Typography color="text.primary">
                    {isNew ? 'Tạo hồ sơ mới' : 'Hồ sơ bệnh án'}
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                    <Typography variant="h4" fontWeight="bold">
                        {isNew ? 'Tạo hồ sơ bệnh án' : 'Chi tiết hồ sơ'}
                    </Typography>
                </Box>
                {!isNew && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={loadData}>
                            <Refresh />
                        </IconButton>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Xóa
                        </Button>
                    </Box>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Record Info */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Thông tin hồ sơ
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {patient && (
                                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Bệnh nhân
                                    </Typography>
                                    <Typography variant="h6">{patient.full_name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {patient.gender === 'male' ? 'Nam' : 'Nữ'} • {patient.phone || 'Chưa có SĐT'}
                                    </Typography>
                                </Box>
                            )}

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="visit_date"
                                        label="Ngày khám"
                                        type="date"
                                        value={isNew ? formData.visit_date : (record?.visit_date?.split('T')[0] || '')}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        disabled={!isNew}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="diagnosis"
                                        label="Chẩn đoán"
                                        value={isNew ? formData.diagnosis : (record?.diagnosis || '')}
                                        onChange={handleChange}
                                        multiline
                                        rows={3}
                                        disabled={!isNew}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="notes"
                                        label="Ghi chú"
                                        value={isNew ? formData.notes : (record?.notes || '')}
                                        onChange={handleChange}
                                        multiline
                                        rows={3}
                                        disabled={!isNew}
                                    />
                                </Grid>
                            </Grid>

                            {isNew && (
                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? <CircularProgress size={24} /> : 'Tạo hồ sơ'}
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* X-ray Upload & Inference */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Tái tạo CT 3D
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {isNew ? (
                                <Alert severity="info">
                                    Vui lòng tạo hồ sơ trước khi tải ảnh X-ray
                                </Alert>
                            ) : (
                                <>
                                    {/* Upload Zone */}
                                    <Paper
                                        {...getRootProps()}
                                        sx={{
                                            p: 4,
                                            textAlign: 'center',
                                            border: '2px dashed',
                                            borderColor: isDragActive ? 'primary.main' : 'grey.300',
                                            bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: 'primary.50',
                                            },
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        {xrayPreview ? (
                                            <Box>
                                                <img
                                                    src={xrayPreview}
                                                    alt="X-ray preview"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: 200,
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                                <Typography variant="body2" sx={{ mt: 1 }}>
                                                    {xrayFile?.name}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box>
                                                <CloudUpload sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                                <Typography>
                                                    Kéo thả ảnh X-ray vào đây
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    hoặc click để chọn file
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>

                                    {xrayFile && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <Biotech />}
                                            onClick={handleStartInference}
                                            disabled={uploading}
                                            sx={{ mt: 2 }}
                                        >
                                            {uploading ? 'Đang tải lên...' : 'Bắt đầu tái tạo CT'}
                                        </Button>
                                    )}

                                    {/* Inference History */}
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            Lịch sử tái tạo ({record?.infer_history?.length || 0})
                                        </Typography>
                                        
                                        {(!record?.infer_history || record.infer_history.length === 0) ? (
                                            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                                                <Image sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                                <Typography color="text.secondary">
                                                    Chưa có lượt tái tạo nào
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <List>
                                                {record.infer_history.map((item, index) => (
                                                    <ListItem
                                                        key={item.id || index}
                                                        sx={{
                                                            bgcolor: 'grey.50',
                                                            borderRadius: 2,
                                                            mb: 1,
                                                        }}
                                                    >
                                                        <ListItemIcon>
                                                            <Biotech color="primary" />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={new Date(item.created_at).toLocaleString('vi-VN')}
                                                            secondary={
                                                                item.status === 'processing' 
                                                                    ? 'Đang xử lý...' 
                                                                    : item.error || 'Click để xem kết quả'
                                                            }
                                                        />
                                                        <ListItemSecondaryAction>
                                                            <InferenceStatusChip status={item.status} />
                                                            {item.status === 'completed' && item.ct_path && (
                                                                <IconButton
                                                                    onClick={() => navigate(`/viewer?file=${encodeURIComponent(item.ct_path)}`)}
                                                                    sx={{ ml: 1 }}
                                                                >
                                                                    <Visibility />
                                                                </IconButton>
                                                            )}
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        )}
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa hồ sơ bệnh án này? 
                        Tất cả dữ liệu tái tạo CT liên quan cũng sẽ bị xóa.
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

export default MedicalRecordDetailPage;
