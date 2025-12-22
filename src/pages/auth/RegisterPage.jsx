/**
 * Register Page
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonOutline,
    LockOutline,
    EmailOutline,
    LocalHospital,
    Badge,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, loading } = useAuth();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'doctor',
        // Doctor specific
        specialty: '',
        phone: '',
        hospital: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.username || !formData.email || !formData.password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        // Prepare data
        const userData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            role: formData.role,
        };

        if (formData.role === 'doctor') {
            userData.doctor_info = {
                specialty: formData.specialty,
                phone: formData.phone,
                hospital: formData.hospital,
            };
        }

        const result = await register(userData);
        
        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setError(result.error);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 50%, #164E63 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        {/* Logo & Title */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <LocalHospital
                                sx={{
                                    fontSize: 50,
                                    color: '#0891B2',
                                    mb: 1,
                                }}
                            />
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Đăng ký tài khoản
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tạo tài khoản để sử dụng hệ thống
                            </Typography>
                        </Box>

                        {/* Success Alert */}
                        {success && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Đăng ký thành công! Đang chuyển hướng...
                            </Alert>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Register Form */}
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="username"
                                        label="Tên đăng nhập *"
                                        value={formData.username}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonOutline color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="full_name"
                                        label="Họ và tên"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Badge color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label="Email *"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailOutline color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="password"
                                        label="Mật khẩu *"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockOutline color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="confirmPassword"
                                        label="Xác nhận mật khẩu *"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Vai trò</InputLabel>
                                        <Select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            label="Vai trò"
                                        >
                                            <MenuItem value="doctor">Bác sĩ</MenuItem>
                                            <MenuItem value="admin">Quản trị viên</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Doctor specific fields */}
                                {formData.role === 'doctor' && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                name="specialty"
                                                label="Chuyên khoa"
                                                value={formData.specialty}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                name="phone"
                                                label="Số điện thoại"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                name="hospital"
                                                label="Bệnh viện / Phòng khám"
                                                value={formData.hospital}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Đăng ký'
                                )}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/login"
                                    style={{
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                    }}
                                >
                                    Đăng nhập
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default RegisterPage;
