import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PersonOutlined,
  EmailOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  AutoAwesome,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

const schema = yup.object({
  name: yup.string().min(2, 'Nome muito curto').required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'Mínimo de 6 caracteres').required('Senha é obrigatória'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('Confirmação é obrigatória'),
}).required();

type RegisterFormData = yup.InferType<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(schema) as any,
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError('');
    setLoading(true);
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        passwordHash: data.password,
      });
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message;
      setApiError(msg === 'User already exists' ? 'Este email já está cadastrado.' : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.blob1} />
      <Box sx={styles.blob2} />

      <Box sx={styles.card} className="animate-scaleIn">
        {/* Logo */}
        <Box sx={styles.logo}>
          <AutoAwesome sx={{ fontSize: 28, color: 'hsl(245, 85%, 65%)' }} />
          <Typography sx={styles.logoText}>MySelf</Typography>
        </Box>

        <Typography variant="h2" sx={styles.title}>
          Crie sua conta
        </Typography>
        <Typography sx={styles.subtitle}>
          Comece a gerenciar sua vida de forma inteligente
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={styles.form}>
          <TextField
            label="Nome"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined sx={{ fontSize: 18, color: 'var(--color-text-tertiary)' }} />
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ fontSize: 18, color: 'var(--color-text-tertiary)' }} />
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ fontSize: 18, color: 'var(--color-text-tertiary)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword((p) => !p)} edge="end">
                      {showPassword
                        ? <VisibilityOffOutlined sx={{ fontSize: 18 }} />
                        : <VisibilityOutlined sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            label="Confirmar senha"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ fontSize: 18, color: 'var(--color-text-tertiary)' }} />
                  </InputAdornment>
                ),
              }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={styles.submitButton}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Criar conta'}
          </Button>
        </Box>

        <Typography sx={styles.loginLink}>
          Já tem uma conta?{' '}
          <Link to="/auth/login" style={{ color: 'hsl(245, 85%, 65%)', fontWeight: 600 }}>
            Entrar
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg-secondary)',
    position: 'relative',
    overflow: 'hidden',
    p: 2,
  },
  blob1: {
    position: 'absolute',
    top: '-15%',
    left: '-10%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, hsl(245, 85%, 65%, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    bottom: '-15%',
    right: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, hsl(152, 60%, 40%, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 420,
    p: 4,
    borderRadius: '20px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-xl)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 1, mb: 3 },
  logoText: { fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' },
  title: { mb: 0.5, fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' },
  subtitle: { mb: 3, fontSize: '14px', color: 'var(--color-text-secondary)' },
  form: { display: 'flex', flexDirection: 'column', gap: 2 },
  submitButton: {
    mt: 1,
    height: 44,
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    background: 'linear-gradient(135deg, hsl(245, 85%, 65%), hsl(245, 85%, 55%))',
    boxShadow: '0 4px 14px hsl(245, 85%, 65%, 0.35)',
    '&:hover': {
      background: 'linear-gradient(135deg, hsl(245, 85%, 58%), hsl(245, 85%, 48%))',
      boxShadow: '0 6px 20px hsl(245, 85%, 65%, 0.45)',
    },
  },
  loginLink: { mt: 3, textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' },
};
