
import { Box, Typography, Avatar, Button, Divider, Paper } from '@mui/material';
import { useAuth } from '../../auth/hooks/useAuth';
import { EmailOutlined, PersonOutlined, VpnKeyOutlined, EditOutlined } from '@mui/icons-material';


export function ProfilePage() {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800, margin: '0 auto', width: '100%' }} className="animate-fadeIn">
      <Box>
        <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Meu Perfil
        </Typography>
        <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
          Gerencie suas informações pessoais
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, fontSize: '28px', fontWeight: 700, background: 'hsl(245, 85%, 65%)' }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {user?.name}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Membro
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<EditOutlined />} sx={{ borderRadius: '8px', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}>
            Editar Perfil
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'var(--color-border)', mb: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonOutlined sx={{ color: 'var(--color-text-secondary)' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', mb: 0.25 }}>Nome Completo</Typography>
              <Typography sx={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>{user?.name}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmailOutlined sx={{ color: 'var(--color-text-secondary)' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', mb: 0.25 }}>E-mail</Typography>
              <Typography sx={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>{user?.email}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VpnKeyOutlined sx={{ color: 'var(--color-text-secondary)' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', mb: 0.25 }}>Senha</Typography>
              <Typography sx={{ fontSize: '15px', color: 'var(--color-text-primary)' }}>••••••••</Typography>
            </Box>
            <Button size="small" sx={{ color: 'var(--color-accent)', fontWeight: 600 }}>Alterar Senha</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
