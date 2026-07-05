import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Skeleton } from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined, TrackChangesOutlined, EmojiEventsOutlined } from '@mui/icons-material';
import { goalService } from '../services/goalService';
import { GoalForm } from '../components/GoalForm';
import { SideDrawer } from '../../../components/feedback/SideDrawer';
import { EmptyState, ProgressBar } from '../../../components/data-display/Badges';
import { SummaryCard } from '../../../components/data-display/SummaryCard';
import type { Goal, CreateGoalDTO, UpdateGoalDTO } from '../../../types/entities';
import { formatCurrency, calcProgress, formatDate, formatProgress } from '../../../utils/formatters';
import { parseISO, isPast } from 'date-fns';

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try { setGoals(await goalService.getAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (data: CreateGoalDTO | UpdateGoalDTO) => {
    if (editing) {
      await goalService.update(editing.financialItemId, data);
    } else {
      await goalService.create(data as CreateGoalDTO);
    }
    setDrawerOpen(false);
    setEditing(null);
    await fetchAll();
  };

  const handleDelete = async (goal: Goal) => {
    if (!confirm(`Excluir meta "${goal.title}"?`)) return;
    setGoals(prev => prev.filter(g => g.financialItemId !== goal.financialItemId));
    await goalService.remove(goal.financialItemId);
  };

  const openEdit = (goal: Goal) => { setEditing(goal); setDrawerOpen(true); };
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  const completed = goals.filter(g => calcProgress(g.financialItem?.amount || 0, g.targetAmount) >= 100).length;
  const totalSaved = goals.reduce((s, g) => s + (g.financialItem?.amount || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Metas Financeiras</Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
            {completed}/{goals.length} metas concluídas
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}
          sx={{ borderRadius: '10px', background: 'hsl(245, 85%, 65%)', fontWeight: 600, boxShadow: '0 4px 12px hsl(245, 85%, 65%, 0.3)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          Nova Meta
        </Button>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <SummaryCard
          icon={<TrackChangesOutlined sx={{ fontSize: 20, color: 'var(--color-accent)' }} />}
          label="Total de metas"
          value={String(goals.length)}
          iconBg="var(--color-accent-subtle)"
        />
        <SummaryCard
          icon={<EmojiEventsOutlined sx={{ fontSize: 20, color: 'var(--color-warning)' }} />}
          label="Concluídas"
          value={String(completed)}
          iconBg="var(--color-warning-subtle)"
        />
        <SummaryCard
          icon={<TrackChangesOutlined sx={{ fontSize: 20, color: 'var(--color-success)' }} />}
          label="Total economizado"
          value={formatCurrency(totalSaved)}
          subtitle={`de ${formatCurrency(totalTarget)}`}
          iconBg="var(--color-success-subtle)"
        />
      </Box>

      {/* Goals Grid */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: '12px', bgcolor: 'var(--color-bg-tertiary)' }} />)}
        </Box>
      ) : goals.length === 0 ? (
        <Box sx={{ p: 4, borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <EmptyState
            icon={<TrackChangesOutlined sx={{ fontSize: 40 }} />}
            title="Nenhuma meta criada"
            description="Defina suas metas financeiras para acompanhar seu progresso."
            action={<Button variant="contained" size="small" startIcon={<AddOutlined />} onClick={openCreate} sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)' }}>Nova Meta</Button>}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {goals.map(goal => {
            const progress = calcProgress(goal.financialItem?.amount || 0, goal.targetAmount);
            const done = progress >= 100;
            const overdue = goal.targetDate && isPast(parseISO(goal.targetDate)) && !done;
            const remaining = goal.targetAmount - (goal.financialItem?.amount || 0);

            return (
              <Box key={goal.financialItemId} sx={{
                p: 3, borderRadius: '14px',
                background: done ? 'linear-gradient(135deg, var(--color-success-subtle), var(--color-surface))' : 'var(--color-surface)',
                border: `1px solid ${done ? 'var(--color-success)' : overdue ? 'var(--color-danger)' : 'var(--color-border)'}`,
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                transition: 'transform 200ms, box-shadow 200ms',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)' },
                '&:hover .goal-actions': { opacity: 1 },
              }}>
                {/* Actions */}
                <Box className="goal-actions" sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 150ms' }}>
                  <IconButton size="small" onClick={() => openEdit(goal)} sx={{ borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>
                    <EditOutlined sx={{ fontSize: 15 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(goal)} sx={{ borderRadius: '6px', background: 'var(--color-surface)', color: 'var(--color-danger)' }}>
                    <DeleteOutlined sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>

                {/* Emoji / Status */}
                <Typography sx={{ fontSize: '24px', mb: 1 }}>{done ? '🏆' : overdue ? '⚠️' : '🎯'}</Typography>

                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', mb: 0.5, pr: 6 }}>
                  {goal.title}
                </Typography>

                {goal.targetDate && (
                  <Typography sx={{ fontSize: '12px', color: overdue ? 'var(--color-danger)' : 'var(--color-text-tertiary)', mb: 2 }}>
                    Prazo: {formatDate(goal.targetDate, 'dd/MM/yyyy')}
                    {overdue ? ' · Vencida' : ''}
                  </Typography>
                )}

                {/* Progress bar */}
                <ProgressBar
                  value={progress}
                  color={done ? 'var(--color-success)' : overdue ? 'var(--color-danger)' : 'var(--color-accent)'}
                  height={8}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {formatCurrency(goal.financialItem?.amount || 0)}
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {formatCurrency(goal.targetAmount)} · <strong>{formatProgress(progress)}</strong>
                  </Typography>
                </Box>

                {!done && remaining > 0 && (
                  <Typography sx={{ fontSize: '11px', color: 'var(--color-text-tertiary)', mt: 0.5 }}>
                    Faltam {formatCurrency(remaining)}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      <SideDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} title={editing ? 'Editar Meta' : 'Nova Meta'}>
        <GoalForm goal={editing ?? undefined} onSave={handleSave} onCancel={() => { setDrawerOpen(false); setEditing(null); }} />
      </SideDrawer>
    </Box>
  );
}
