import React from 'react';
import { Box, Typography } from '@mui/material';
import { LabelOutlined } from '@mui/icons-material';
import type { Category } from '../../types/entities';

interface CategoryTagProps {
  category?: Category | null;
  size?: 'sm' | 'md';
}

export function CategoryTag({ category, size = 'md' }: CategoryTagProps) {
  if (!category) return null;

  const color = category.hexColor ?? '#8B5CF6';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: size === 'sm' ? 0.75 : 1,
        py: size === 'sm' ? 0.25 : 0.5,
        borderRadius: '6px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 500,
        color: color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        whiteSpace: 'nowrap',
      }}
    >
      <LabelOutlined sx={{ fontSize: size === 'sm' ? 11 : 13 }} />
      {category.name}
    </Box>
  );
}

interface PriorityBadgeProps {
  priority?: string;
  size?: 'sm' | 'md';
}

const PRIORITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  HIGH:   { label: 'Alta',  color: 'var(--color-priority-high)',   bg: 'var(--color-priority-high-bg)' },
  MEDIUM: { label: 'Média', color: 'var(--color-priority-medium)', bg: 'var(--color-priority-medium-bg)' },
  LOW:    { label: 'Baixa', color: 'var(--color-priority-low)',    bg: 'var(--color-priority-low-bg)' },
};

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  if (!priority) return null;
  const p = PRIORITY_MAP[priority];
  if (!p) return null;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: size === 'sm' ? 0.75 : 1,
        py: size === 'sm' ? 0.25 : 0.5,
        borderRadius: '6px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        color: p.color,
        background: p.bg,
        letterSpacing: '0.2px',
      }}
    >
      {p.label}
    </Box>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      py: 6,
      px: 3,
      textAlign: 'center',
    }}>
      <Box sx={{ color: 'var(--color-text-tertiary)', opacity: 0.7 }}>{icon}</Box>
      <Typography sx={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-secondary)' }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: '13px', color: 'var(--color-text-tertiary)', maxWidth: 280 }}>
        {description}
      </Typography>
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  animated?: boolean;
}

export function ProgressBar({ value, color = 'var(--color-accent)', height = 6, animated = true }: ProgressBarProps) {
  const pct = Math.min(value, 100);
  return (
    <Box sx={{ width: '100%', height, borderRadius: '999px', background: 'var(--color-bg-tertiary)', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%',
          width: pct > 0 ? `max(${pct}%, 4px)` : '0%',
          borderRadius: '999px',
          background: color,
          transition: animated ? 'width 800ms ease-out' : 'none',
        }}
      />
    </Box>
  );
}
