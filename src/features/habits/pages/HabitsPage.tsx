import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Skeleton, Tooltip } from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined, FitnessCenterOutlined, NavigateNextOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { isToday, parseISO, subDays, format, eachDayOfInterval } from 'date-fns';
import { habitService } from '../services/habitService';
import { dailyRecordService } from '../services/dailyRecordService';
import { HabitForm } from '../components/HabitForm';
import { SideDrawer } from '../../../components/feedback/SideDrawer';
import { EmptyState } from '../../../components/data-display/Badges';
import { SummaryCard } from '../../../components/data-display/SummaryCard';
import type { HabitModule, DailyRecord, CreateHabitDTO, UpdateHabitDTO } from '../../../types/entities';

export function HabitsPage() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<HabitModule[]>([]);
  const [allRecords, setAllRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<HabitModule | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [h, r] = await Promise.allSettled([habitService.getAll(), dailyRecordService.getAll()]);
      if (h.status === 'fulfilled') setHabits(h.value);
      if (r.status === 'fulfilled') setAllRecords(r.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const todayRecords = allRecords.filter(r => isToday(parseISO(r.date)));
  const completedToday = todayRecords.filter(r => r.isCompleted).length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);
  const todayRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const handleToggleToday = async (habit: HabitModule) => {
    const rec = todayRecords.find(r => r.habitId === habit.activityId);
    if (rec) {
      const updated = { ...rec, isCompleted: !rec.isCompleted };
      setAllRecords(prev => prev.map(r => r.id === rec.id ? updated : r));
      await dailyRecordService.update(rec.id, { isCompleted: !rec.isCompleted });
    } else {
      const newRec = await dailyRecordService.create({
        date: new Date().toISOString(),
        isCompleted: true,
        habitId: habit.activityId,
      });
      setAllRecords(prev => [...prev, newRec]);
    }
  };

  const handleSave = async (data: CreateHabitDTO | UpdateHabitDTO) => {
    if (editing) {
      const updated = await habitService.update(editing.activityId, data);
      setHabits(prev => prev.map(h => h.activityId === editing.activityId ? updated : h));
    } else {
      const created = await habitService.create(data as CreateHabitDTO);
      setHabits(prev => [...prev, created]);
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleDelete = async (habit: HabitModule) => {
    if (!confirm(`Excluir hábito "${habit.activity?.name ?? 'hábito'}"?`)) return;
    setHabits(prev => prev.filter(h => h.activityId !== habit.activityId));
    await habitService.remove(habit.activityId);
  };

  const openEdit = (habit: HabitModule) => { setEditing(habit); setDrawerOpen(true); };
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  // Build 28-day consistency grid (last 4 weeks)
  const last28 = eachDayOfInterval({ start: subDays(new Date(), 27), end: new Date() });

  const getDayScore = (day: Date): number => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayRecords = allRecords.filter(r => r.date.slice(0, 10) === dayStr);
    if (habits.length === 0 || dayRecords.length === 0) return -1; // no data
    return Math.round((dayRecords.filter(r => r.isCompleted).length / habits.length) * 100);
  };

  const getCellColor = (score: number) => {
    if (score < 0) return 'var(--color-bg-tertiary)';
    if (score === 0) return 'var(--color-danger-subtle)';
    if (score < 50) return 'hsl(38, 95%, 80%)';
    if (score < 80) return 'hsl(152, 60%, 70%)';
    return 'var(--color-success)';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Hábitos</Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
            {habits.length} hábito{habits.length !== 1 ? 's' : ''} ativos
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}
          sx={{ borderRadius: '10px', background: 'hsl(245, 85%, 65%)', fontWeight: 600, boxShadow: '0 4px 12px hsl(245, 85%, 65%, 0.3)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          Novo Hábito
        </Button>
      </Box>

      {/* Summary */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <SummaryCard
          icon={<FitnessCenterOutlined sx={{ fontSize: 20, color: 'var(--color-accent)' }} />}
          label="Hábitos ativos"
          value={String(habits.length)}
          iconBg="var(--color-accent-subtle)"
        />
        <SummaryCard
          icon={<span style={{ fontSize: 20 }}>🔥</span>}
          label="Maior streak"
          value={`${bestStreak} dias`}
          iconBg="var(--color-warning-subtle)"
        />
        <SummaryCard
          icon={<span style={{ fontSize: 20 }}>✅</span>}
          label="Taxa hoje"
          value={`${completedToday}/${habits.length}`}
          subtitle={`${todayRate}% concluídos`}
          iconBg="var(--color-success-subtle)"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {/* Daily Checklist */}
        <Box sx={{ p: 2.5, borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1 }}>
              Check-in de Hoje
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'var(--color-text-tertiary)', background: 'var(--color-bg-tertiary)', px: 1, py: 0.25, borderRadius: '999px', fontWeight: 600 }}>
              {completedToday}/{habits.length}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={44} sx={{ borderRadius: '8px', bgcolor: 'var(--color-bg-tertiary)' }} />)}
            </Box>
          ) : habits.length === 0 ? (
            <EmptyState
              icon={<FitnessCenterOutlined sx={{ fontSize: 32 }} />}
              title="Nenhum hábito"
              description="Crie seu primeiro hábito."
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {habits.map(habit => {
                const rec = todayRecords.find(r => r.habitId === habit.activityId);
                const done = rec?.isCompleted ?? false;
                return (
                  <Box key={habit.activityId}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: '8px',
                      cursor: 'pointer', transition: 'background 150ms',
                      '&:hover': { background: 'var(--color-surface-hover)' },
                      '&:hover .habit-row-actions': { opacity: 1 },
                    }}
                  >
                    {/* Custom checkbox */}
                    <Box
                      onClick={() => handleToggleToday(habit)}
                      sx={{
                        width: 24, height: 24, borderRadius: '7px', flexShrink: 0,
                        border: `2px solid ${done ? 'var(--color-success)' : 'var(--color-border-strong)'}`,
                        background: done ? 'var(--color-success)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '13px', fontWeight: 700,
                        transition: 'all 200ms',
                      }}
                    >
                      {done && '✓'}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => handleToggleToday(habit)}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 500, color: done ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)', textDecoration: done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {habit.activity?.name ?? 'Sem nome'}
                      </Typography>
                      {habit.currentStreak > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <span style={{ fontSize: '11px' }}>🔥</span>
                          <Typography sx={{ fontSize: '11px', color: 'var(--color-warning)', fontWeight: 600 }}>
                            {habit.currentStreak} dias
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Actions */}
                    <Box className="habit-row-actions" sx={{ display: 'flex', gap: 0.25, opacity: 0, transition: 'opacity 150ms' }}>
                      <IconButton size="small" onClick={() => navigate(`/habitos/${habit.activityId}`)} sx={{ borderRadius: '6px', color: 'var(--color-accent)' }}>
                        <NavigateNextOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => openEdit(habit)} sx={{ borderRadius: '6px', color: 'var(--color-text-secondary)' }}>
                        <EditOutlined sx={{ fontSize: 15 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(habit)} sx={{ borderRadius: '6px', color: 'var(--color-danger)' }}>
                        <DeleteOutlined sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Consistency Calendar (GitHub-style) */}
        <Box sx={{ p: 2.5, borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', mb: 2 }}>
            Consistência — Últimos 28 dias
          </Typography>

          {/* Day-of-week headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <Typography key={i} sx={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textAlign: 'center', fontWeight: 600 }}>
                {d}
              </Typography>
            ))}
          </Box>

          {/* Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {last28.map((day, idx) => {
              const score = getDayScore(day);
              const label = `${format(day, 'dd/MM')}: ${score < 0 ? 'sem dados' : `${score}%`}`;
              return (
                <Tooltip key={idx} title={label} placement="top">
                  <Box sx={{
                    aspectRatio: '1',
                    borderRadius: '4px',
                    background: getCellColor(score),
                    cursor: 'default',
                    transition: 'transform 100ms',
                    '&:hover': { transform: 'scale(1.2)' },
                    border: isToday(day) ? '2px solid var(--color-accent)' : 'none',
                  }} />
                </Tooltip>
              );
            })}
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
            {[
              { color: 'var(--color-bg-tertiary)', label: 'Sem dados' },
              { color: 'var(--color-danger-subtle)', label: '0%' },
              { color: 'hsl(38, 95%, 80%)', label: '<50%' },
              { color: 'hsl(152, 60%, 70%)', label: '<80%' },
              { color: 'var(--color-success)', label: '100%' },
            ].map(({ color, label }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '3px', background: color }} />
                <Typography sx={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <SideDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} title={editing ? 'Editar Hábito' : 'Novo Hábito'}>
        <HabitForm habit={editing ?? undefined} onSave={handleSave} onCancel={() => { setDrawerOpen(false); setEditing(null); }} />
      </SideDrawer>
    </Box>
  );
}
