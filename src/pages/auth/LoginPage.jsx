/**
 * Login Page
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
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonOutline,
    LockOutline,
    LocalHospital,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, loading, error } = useAuth();
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            setFormError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const result = await login(formData.username, formData.password);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setFormError(result.error);
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
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <LocalHospital
                                sx={{
                                    fontSize: 60,
                                    color: '#0891B2',
                                    mb: 2,
                                }}
                            />
                            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                                Medical Imaging
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Hệ thống tái tạo ảnh CT 3D từ X-ray
                            </Typography>
                        </Box>

                        {/* Error Alert */}
                        {(formError || error) && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {formError || error}
                            </Alert>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                name="username"
                                label="Tên đăng nhập"
                                value={formData.username}
                                onChange={handleChange}
                                margin="normal"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                name="password"
                                label="Mật khẩu"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                margin="normal"
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
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

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
                                    'Đăng nhập'
                                )}
                            </Button>
                        </form>

                        {/* Register Link */}
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Chưa có tài khoản?{' '}
                                <Link
                                    to="/register"
                                    style={{
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                    }}
                                >
                                    Đăng ký ngay
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default LoginPage;
