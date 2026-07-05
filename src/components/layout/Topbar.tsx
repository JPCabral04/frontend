import { useState, type MouseEvent } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  DarkModeOutlined,
  LightModeOutlined,
  LogoutOutlined,
  PersonOutlined,
  SettingsOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export function Topbar() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    handleMenuClose();
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <Box sx={styles.topbar}>
      {/* Right side actions */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {/* Theme toggle */}
        <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
          <IconButton onClick={toggleTheme} size="small" sx={styles.iconBtn}>
            {mode === 'dark'
              ? <LightModeOutlined sx={{ fontSize: 18 }} />
              : <DarkModeOutlined sx={{ fontSize: 18 }} />}
          </IconButton>
        </Tooltip>

        {/* Avatar / User menu */}
        <Tooltip title={user?.name ?? 'Perfil'}>
          <Avatar
            onClick={handleMenuOpen}
            sx={styles.avatar}
          >
            {initials}
          </Avatar>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: styles.menu } }}
        >
          {/* User info header */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
              {user?.name}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {user?.email}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: 'var(--color-border)' }} />

          <MenuItem onClick={() => { navigate('/perfil'); handleMenuClose(); }} sx={styles.menuItem}>
            <PersonOutlined sx={{ fontSize: 16 }} />
            Perfil
          </MenuItem>

          <MenuItem onClick={() => { navigate('/perfil/configuracoes'); handleMenuClose(); }} sx={styles.menuItem}>
            <SettingsOutlined sx={{ fontSize: 16 }} />
            Configurações
          </MenuItem>

          <Divider sx={{ borderColor: 'var(--color-border)' }} />

          <MenuItem onClick={handleLogout} sx={{ ...styles.menuItem, color: 'var(--color-danger)' }}>
            <LogoutOutlined sx={{ fontSize: 16 }} />
            Sair
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

const styles = {
  topbar: {
    height: 64,
    px: 3,
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  iconBtn: {
    color: 'var(--color-text-secondary)',
    borderRadius: '8px',
    width: 36,
    height: 36,
    '&:hover': {
      background: 'var(--color-surface-hover)',
      color: 'var(--color-text-primary)',
    },
  },
  avatar: {
    width: 34,
    height: 34,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'hsl(245, 85%, 65%)',
    transition: 'opacity 150ms',
    ml: 0.5,
    '&:hover': { opacity: 0.85 },
  },
  menu: {
    mt: 1,
    minWidth: 200,
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-lg)',
    background: 'var(--color-surface)',
  },
  menuItem: {
    display: 'flex',
    gap: 1.5,
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    py: 1,
    px: 2,
    '&:hover': { background: 'var(--color-surface-hover)' },
  },
};
