import { useState, useEffect } from 'react';
import { Box, Typography, Skeleton, Tooltip, IconButton, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBackOutlined, EditOutlined, FitnessCenterOutlined } from '@mui/icons-material';
import { format, eachDayOfInterval, subDays, isToday, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { habitService } from '../services/habitService';
import { dailyRecordService } from '../services/dailyRecordService';
import { HabitForm } from '../components/HabitForm';
import { SideDrawer } from '../../../components/feedback/SideDrawer';
import { SummaryCard } from '../../../components/data-display/SummaryCard';
import type { HabitModule, DailyRecord, UpdateHabitDTO } from '../../../types/entities';

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [habit, setHabit] = useState<HabitModule | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [h, r] = await Promise.allSettled([
          habitService.getById(id),
          dailyRecordService.getByHabitId(id),
        ]);
        if (h.status === 'fulfilled') setHabit(h.value);
        if (r.status === 'fulfilled') setRecords(r.value);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleToggleDay = async (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const rec = records.find(r => r.date.slice(0, 10) === dayStr);
    if (rec) {
      const updated = { ...rec, isCompleted: !rec.isCompleted };
      setRecords(prev => prev.map(r => r.id === rec.id ? updated : r));
      await dailyRecordService.update(rec.id, { isCompleted: !rec.isCompleted });
    } else {
      const newRec = await dailyRecordService.create({
        date: day.toISOString(),
        isCompleted: true,
        habitId: id!,
      });
      setRecords(prev => [...prev, newRec]);
    }
  };

  const getRecordForDay = (day: Date): DailyRecord | undefined => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return records.find(r => r.date.slice(0, 10) === dayStr);
  };

  const completedCount = records.filter(r => r.isCompleted).length;
  const totalDays = records.length;
  const completionRate = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  // Build calendar for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startingDayOfWeek = getDay(monthStart); // 0=Sunday
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="rounded" height={40} width={200} sx={{ bgcolor: 'var(--color-bg-tertiary)' }} />
      <Skeleton variant="rounded" height={120} sx={{ borderRadius: '12px', bgcolor: 'var(--color-bg-tertiary)' }} />
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: '12px', bgcolor: 'var(--color-bg-tertiary)' }} />
    </Box>
  );

  if (!habit) return (
    <Box sx={{ p: 4, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      Hábito não encontrado.
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/habitos')} sx={{ borderRadius: '8px', color: 'var(--color-text-secondary)', '&:hover': { background: 'var(--color-surface-hover)' } }}>
          <ArrowBackOutlined />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {habit.activity?.name ?? 'Sem nome'}
          </Typography>
          {habit.activity?.description && (
            <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.25 }}>
              {habit.activity.description}
            </Typography>
          )}
        </Box>
        <Button startIcon={<EditOutlined />} onClick={() => setDrawerOpen(true)}
          sx={{ borderRadius: '8px', color: 'var(--color-text-secondary)', '&:hover': { background: 'var(--color-surface-hover)' } }}>
          Editar
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <SummaryCard
          icon={<span style={{ fontSize: 20 }}>🔥</span>}
          label="Streak atual"
          value={`${habit.currentStreak} dias`}
          iconBg="var(--color-warning-subtle)"
        />
        <SummaryCard
          icon={<FitnessCenterOutlined sx={{ fontSize: 20, color: 'var(--color-success)' }} />}
          label="Taxa de conclusão"
          value={`${completionRate}%`}
          subtitle={`${completedCount}/${totalDays} dias registrados`}
          iconBg="var(--color-success-subtle)"
        />
        <SummaryCard
          icon={<span style={{ fontSize: 20 }}>✅</span>}
          label="Total completos"
          value={String(completedCount)}
          iconBg="var(--color-accent-subtle)"
        />
      </Box>

      {/* Notes */}
      {habit.notes && (
        <Box sx={{ p: 2.5, borderRadius: '12px', background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent)', borderOpacity: 0.3 }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', mb: 0.5 }}>Notas</Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{habit.notes}</Typography>
        </Box>
      )}

      {/* Monthly Calendar */}
      <Box sx={{ p: 3, borderRadius: '14px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        {/* Month navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <IconButton size="small" onClick={() => setCurrentMonth(m => subDays(startOfMonth(m), 1))} sx={{ borderRadius: '8px' }}>◀</IconButton>
          <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </Typography>
          <IconButton size="small" onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} sx={{ borderRadius: '8px' }}>▶</IconButton>
        </Box>

        {/* Day headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <Typography key={d} sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
              {d}
            </Typography>
          ))}
        </Box>

        {/* Calendar grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {/* Empty cells for start offset */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <Box key={`empty-${i}`} />
          ))}

          {calendarDays.map(day => {
            const rec = getRecordForDay(day);
            const done = rec?.isCompleted === true;
            const missed = rec?.isCompleted === false;
            const today = isToday(day);

            return (
              <Tooltip key={day.toISOString()} title={`${format(day, 'dd/MM')} — ${done ? 'Concluído ✅' : missed ? 'Não concluído ❌' : 'Sem registro'}`} placement="top">
                <Box
                  onClick={() => handleToggleDay(day)}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: today ? 700 : 400,
                    border: `2px solid ${today ? 'var(--color-accent)' : 'transparent'}`,
                    background: done
                      ? 'var(--color-success)'
                      : missed
                        ? 'var(--color-danger-subtle)'
                        : 'var(--color-bg-tertiary)',
                    color: done ? '#fff' : 'var(--color-text-primary)',
                    transition: 'all 150ms',
                    '&:hover': { transform: 'scale(1.1)', boxShadow: 'var(--shadow-sm)' },
                  }}
                >
                  {day.getDate()}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        <Typography sx={{ fontSize: '12px', color: 'var(--color-text-tertiary)', mt: 2, textAlign: 'center' }}>
          Clique em um dia para registrar a conclusão
        </Typography>
      </Box>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Editar Hábito">
        <HabitForm
          habit={habit}
          onSave={async (data: UpdateHabitDTO) => {
            const updated = await habitService.update(habit.activityId, data);
            setHabit(updated);
            setDrawerOpen(false);
          }}
          onCancel={() => setDrawerOpen(false)}
        />
      </SideDrawer>
    </Box>
  );
}
