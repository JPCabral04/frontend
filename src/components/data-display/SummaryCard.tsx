import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps } from '@mui/material';

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
  sx?: SxProps;
}

export function SummaryCard({ icon, label, value, subtitle, iconBg, trend, sx }: SummaryCardProps) {
  return (
    <Box sx={{ ...styles.card, ...sx }} className="animate-fadeInUp card">
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ ...styles.iconWrapper, background: iconBg ?? 'var(--color-accent-subtle)' }}>
          {icon}
        </Box>
        {trend && (
          <Box sx={{
            ...styles.trend,
            color: trend.positive ? 'var(--color-success)' : 'var(--color-danger)',
            background: trend.positive ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
          }}>
            {trend.positive ? '▲' : '▼'} {trend.value}
          </Box>
        )}
      </Box>

      <Typography sx={styles.value}>{value}</Typography>
      <Typography sx={styles.label}>{label}</Typography>
      {subtitle && <Typography sx={styles.subtitle}>{subtitle}</Typography>}
    </Box>
  );
}

const styles = {
  card: {
    p: 2.5,
    borderRadius: '12px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform 200ms ease, box-shadow 200ms ease',
    cursor: 'default',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-md)',
    },
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    lineHeight: 1.2,
  },
  label: {
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    mt: 0.25,
    fontWeight: 500,
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--color-text-tertiary)',
    mt: 0.5,
  },
  trend: {
    fontSize: '11px',
    fontWeight: 600,
    px: 1,
    py: 0.5,
    borderRadius: '6px',
  },
};
