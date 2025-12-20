import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  Psychology,
  Memory,
  Speed,
  Security,
  CheckCircle,
  LocalHospital,
  Science,
  Visibility,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const features = [
    {
      icon: <Psychology />,
      title: 'AI-Powered Conversion',
      description: 'Sử dụng mô hình diffusion tiên tiến để chuyển đổi X-ray 2D thành CTPA 3D với độ chính xác cao.',
    },
    {
      icon: <Memory />,
      title: 'Deep Learning Architecture',
      description: 'Kiến trúc Unet3D kết hợp với VAE encoder để tạo ra hình ảnh 3D chất lượng cao.',
    },
    {
      icon: <Speed />,
      title: 'Fast Processing',
      description: 'Xử lý nhanh chóng với GPU acceleration, tối ưu hóa cho môi trường production.',
    },
    {
      icon: <Security />,
      title: 'Medical Grade',
      description: 'Tuân thủ các tiêu chuẩn y tế, hỗ trợ format DICOM và NIfTI.',
    },
    {
      icon: <Visibility />,
      title: 'Interactive Visualization',
      description: 'Giao diện 3D tương tác với medical windowing và slice navigation.',
    },
    {
      icon: <LocalHospital />,
      title: 'Clinical Applications',
      description: 'Hỗ trợ chẩn đoán y khoa với các preset windowing chuyên biệt.',
    },
  ];

  const technologies = [
    'PyTorch',
    'Diffusion Models',
    'VAE/VQGAN',
    'FastAPI',
    'React',
    'Material-UI',
    'SimpleITK',
    'OpenCV',
  ];

  const applications = [
    'Chẩn đoán hình ảnh y khoa',
    'Nghiên cứu y sinh học',
    'Giáo dục y khoa',
    'Phát triển thuật toán AI',
    'Visualization 3D',
    'Medical imaging workflow',
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box textAlign="center" mb={8}>
          <Typography variant="h1" gutterBottom>
            Về X-ray2CTPA
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
            Hệ thống AI tiên tiến chuyển đổi ảnh X-ray 2D thành CTPA 3D, 
            mang lại giải pháp visualization hiện đại cho y học
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            {technologies.map((tech) => (
              <Chip
                key={tech}
                label={tech}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Box>
        </Box>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Typography variant="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Tính năng nổi bật
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, rgba(0, 188, 212, 0.1), rgba(255, 87, 34, 0.1))',
                        color: 'primary.main',
                        mb: 3,
                      }}
                    >
                      {React.cloneElement(feature.icon, { sx: { fontSize: 40 } })}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Technology & Applications */}
      <Grid container spacing={6}>
        {/* Technology Stack */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Science sx={{ mr: 2, color: 'primary.main' }} />
                  Công nghệ
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  X-ray2CTPA được xây dựng trên nền tảng công nghệ hiện đại nhất:
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Backend Technologies
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="PyTorch & Diffusion Models"
                        secondary="Mô hình AI tiên tiến cho medical imaging"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="FastAPI"
                        secondary="High-performance REST API framework"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="SimpleITK & OpenCV"
                        secondary="Medical image processing libraries"
                      />
                    </ListItem>
                  </List>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Frontend Technologies
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="React & Material-UI"
                        secondary="Modern, responsive user interface"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Framer Motion"
                        secondary="Smooth animations và transitions"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Axios & React Router"
                        secondary="API communication và routing"
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Applications */}
        <Grid item xs={12} lg={6}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalHospital sx={{ mr: 2, color: 'secondary.main' }} />
                  Ứng dụng
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Hệ thống có thể được ứng dụng trong nhiều lĩnh vực y tế:
                </Typography>

                <List>
                  {applications.map((app, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={app} />
                    </ListItem>
                  ))}
                </List>

                <Paper 
                  sx={{ 
                    p: 3, 
                    mt: 4, 
                    background: 'linear-gradient(45deg, rgba(0, 188, 212, 0.1), rgba(255, 87, 34, 0.1))',
                    border: '1px solid rgba(0, 188, 212, 0.3)',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Lưu ý quan trọng
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đây là công cụ nghiên cứu và phát triển. Kết quả chỉ mang tính tham khảo 
                    và không thể thay thế cho chẩn đoán y khoa chuyên nghiệp.
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Model Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Box mt={8}>
          <Typography variant="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            Kiến trúc Model
          </Typography>
          
          <Card>
            <CardContent sx={{ p: 6 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #00bcd4, #0097a7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h4" color="white">1</Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom>Input Processing</Typography>
                    <Typography variant="body2" color="text.secondary">
                      X-ray 2D được tiền xử lý và encode bằng VAE encoder
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #ff5722, #f4511e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h4" color="white">2</Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom>Diffusion Process</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unet3D thực hiện quá trình diffusion để generate 3D features
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #9c27b0, #7b1fa2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography variant="h4" color="white">3</Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom>Output Generation</Typography>
                    <Typography variant="body2" color="text.secondary">
                      VAE decoder tạo ra CTPA 3D volume từ latent features
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </motion.div>
    </Container>
  );
};

export default AboutPage;