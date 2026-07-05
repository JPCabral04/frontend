import { type ReactNode } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}

export function SideDrawer({ open, onClose, title, children, width = 420 }: SideDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width,
          background: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5 }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'var(--color-text-secondary)', borderRadius: '8px', '&:hover': { background: 'var(--color-surface-hover)' } }}
        >
          <CloseOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'var(--color-border)' }} />

      {/* Content */}
      <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
        {children}
      </Box>
    </Drawer>
  );
}
