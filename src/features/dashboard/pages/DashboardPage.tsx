import { useState, useEffect } from 'react';
import { Box, Typography, Checkbox, Skeleton } from '@mui/material';
import {
  CalendarTodayOutlined,
  AccountBalanceWalletOutlined,
  FitnessCenterOutlined,
  CheckBoxOutlined,
  EventOutlined,
  TrackChangesOutlined,
} from '@mui/icons-material';
import { isToday, parseISO } from 'date-fns';
import { SummaryCard } from '../../../components/data-display/SummaryCard';
import { CategoryTag, PriorityBadge, ProgressBar, EmptyState } from '../../../components/data-display/Badges';
import { taskService } from '../../agenda/services/taskService';
import { eventService } from '../../agenda/services/eventService';
import { transactionService } from '../../finance/services/transactionService';
import { goalService } from '../../finance/services/goalService';
import { habitService } from '../../habits/services/habitService';
import { dailyRecordService } from '../../habits/services/dailyRecordService';
import type { Task, Event, HabitModule, DailyRecord, Transaction, Goal } from '../../../types/entities';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getGreeting,
  formatTime,
  getDueDateLabel,
  calcProgress,
  formatCurrencyCompact,
  formatCurrency,
  formatProgress,
} from '../../../utils/formatters';

export function DashboardPage() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<HabitModule[]>([]);
  const [todayRecords, setTodayRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, e, tr, g, h, dr] = await Promise.allSettled([
          taskService.getAll(),
          eventService.getAll(),
          transactionService.getAll(),
          goalService.getAll(),
          habitService.getAll(),
          dailyRecordService.getAll(),
        ]);
        if (t.status === 'fulfilled') setTasks(t.value);
        if (e.status === 'fulfilled') setEvents(e.value);
        if (tr.status === 'fulfilled') setTransactions(tr.value);
        if (g.status === 'fulfilled') setGoals(g.value);
        if (h.status === 'fulfilled') setHabits(h.value);
        if (dr.status === 'fulfilled') setTodayRecords(dr.value.filter(r => isToday(parseISO(r.date))));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Derived data
  const todayTasks = tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)));
  const now = new Date();
  const upcomingEvents = events
    .filter(e => parseISO(e.endDate) >= now)
    .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
    .slice(0, 5);

  const totalIncome = transactions
    .filter(t => t.transactionType === 'INCOME')
    .reduce((sum, t) => sum + (t.financialItem?.amount || 0), 0);
  const totalExpense = transactions
    .filter(t => t.transactionType === 'EXPENSE')
    .reduce((sum, t) => sum + (t.financialItem?.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  const completedHabitsToday = todayRecords.filter(r => r.isCompleted).length;
  const habitRate = habits.length > 0
    ? Math.round((completedHabitsToday / habits.length) * 100)
    : 0;

  const toggleTask = async (task: Task) => {
    const updated = !task.isCompleted;
    setTasks(prev =>
      prev.map(t => t.agendaItemId === task.agendaItemId ? { ...t, isCompleted: updated } : t)
    );
    try {
      await taskService.update(task.agendaItemId, { isCompleted: updated });
    } catch {
      setTasks(prev =>
        prev.map(t => t.agendaItemId === task.agendaItemId ? { ...t, isCompleted: task.isCompleted } : t)
      );
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      {/* Greeting */}
      <Box>
        <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </Typography>
        <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <SummaryCard
          icon={<CalendarTodayOutlined sx={{ fontSize: 20, color: 'hsl(245, 85%, 65%)' }} />}
          label="Agenda hoje"
          value={`${todayTasks.length} tarefa${todayTasks.length !== 1 ? 's' : ''}`}
          subtitle={`${upcomingEvents.length} evento${upcomingEvents.length !== 1 ? 's' : ''} futuros`}
          iconBg="var(--color-accent-subtle)"
        />
        <SummaryCard
          icon={<AccountBalanceWalletOutlined sx={{ fontSize: 20, color: 'hsl(152, 60%, 40%)' }} />}
          label="Saldo"
          value={formatCurrencyCompact(balance)}
          subtitle={`${formatCurrencyCompact(totalIncome)} entrada · ${formatCurrencyCompact(totalExpense)} saída`}
          iconBg="var(--color-success-subtle)"
          trend={balance >= 0 ? { value: 'positivo', positive: true } : { value: 'negativo', positive: false }}
        />
        <SummaryCard
          icon={<FitnessCenterOutlined sx={{ fontSize: 20, color: 'hsl(38, 95%, 50%)' }} />}
          label="Hábitos hoje"
          value={`${completedHabitsToday}/${habits.length}`}
          subtitle={`${habitRate}% concluídos`}
          iconBg="var(--color-warning-subtle)"
        />
      </Box>

      {/* Main Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {/* Today's Tasks */}
        <Box sx={styles.panel}>
          <Box sx={styles.panelHeader}>
            <CheckBoxOutlined sx={{ fontSize: 18, color: 'var(--color-accent)' }} />
            <Typography sx={styles.panelTitle}>Tarefas de Hoje</Typography>
            <Typography sx={styles.panelCount}>{todayTasks.length}</Typography>
          </Box>

          {todayTasks.length === 0 ? (
            <EmptyState
              icon={<CheckBoxOutlined sx={{ fontSize: 36 }} />}
              title="Nenhuma tarefa para hoje"
              description="Aproveite o dia livre! Ou adicione novas tarefas na aba Agenda."
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {todayTasks.map((task) => (
                <TaskRow key={task.agendaItemId} task={task} onToggle={toggleTask} />
              ))}
            </Box>
          )}
        </Box>

        {/* Today's Habits */}
        <Box sx={styles.panel}>
          <Box sx={styles.panelHeader}>
            <FitnessCenterOutlined sx={{ fontSize: 18, color: 'hsl(38, 95%, 50%)' }} />
            <Typography sx={styles.panelTitle}>Hábitos do Dia</Typography>
            <Typography sx={styles.panelCount}>{completedHabitsToday}/{habits.length}</Typography>
          </Box>

          {habits.length === 0 ? (
            <EmptyState
              icon={<FitnessCenterOutlined sx={{ fontSize: 36 }} />}
              title="Nenhum hábito criado"
              description="Crie seus primeiros hábitos na aba Hábitos."
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {habits.map((habit) => {
                const todayRecord = todayRecords.find(r => r.habitId === habit.activityId);
                return (
                  <HabitRow
                    key={habit.activityId}
                    habit={habit}
                    todayRecord={todayRecord}
                    onToggle={async (h, rec) => {
                      if (rec) {
                        const updated = { ...rec, isCompleted: !rec.isCompleted };
                        setTodayRecords(prev => prev.map(r => r.id === rec.id ? updated : r));
                        await dailyRecordService.update(rec.id, { isCompleted: !rec.isCompleted });
                      } else {
                        const newRec = await dailyRecordService.create({
                          date: new Date().toISOString(),
                          isCompleted: true,
                          habitId: h.activityId,
                        });
                        setTodayRecords(prev => [...prev, newRec]);
                      }
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>

        {/* Upcoming Events */}
        <Box sx={styles.panel}>
          <Box sx={styles.panelHeader}>
            <EventOutlined sx={{ fontSize: 18, color: 'hsl(210, 80%, 52%)' }} />
            <Typography sx={styles.panelTitle}>Próximos Eventos</Typography>
          </Box>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<EventOutlined sx={{ fontSize: 36 }} />}
              title="Nenhum evento próximo"
              description="Adicione eventos na aba Agenda."
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {upcomingEvents.map((event) => (
                <Box key={event.agendaItemId} sx={styles.eventRow}>
                  <Box sx={styles.eventDot} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.agendaItem?.title || 'Sem título'}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                      {getDueDateLabel(event.startDate)} · {formatTime(event.startDate)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Goal Progress */}
        <Box sx={styles.panel}>
          <Box sx={styles.panelHeader}>
            <TrackChangesOutlined sx={{ fontSize: 18, color: 'hsl(152, 60%, 40%)' }} />
            <Typography sx={styles.panelTitle}>Metas Financeiras</Typography>
          </Box>

          {goals.length === 0 ? (
            <EmptyState
              icon={<TrackChangesOutlined sx={{ fontSize: 36 }} />}
              title="Nenhuma meta criada"
              description="Defina metas financeiras na aba Financeiro."
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {goals.slice(0, 3).map((goal) => {
                const progress = calcProgress(goal.financialItem?.amount || 0, goal.targetAmount);
                return (
                  <Box key={goal.financialItemId}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {goal.title}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {formatProgress(progress)}
                      </Typography>
                    </Box>
                    <ProgressBar
                      value={progress}
                      color={progress >= 80 ? 'var(--color-success)' : 'var(--color-accent)'}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography sx={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        {formatCurrency(goal.financialItem?.amount || 0)}
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        {formatCurrency(goal.targetAmount)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ---- Sub-components ----
function TaskRow({ task, onToggle }: { task: Task; onToggle: (t: Task) => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: '8px',
        transition: 'background 150ms',
        '&:hover': { background: 'var(--color-surface-hover)' },
        cursor: 'pointer',
      }}
      onClick={() => onToggle(task)}
    >
      <Checkbox
        checked={task.isCompleted}
        size="small"
        sx={{ p: 0, color: 'var(--color-border-strong)', '&.Mui-checked': { color: 'var(--color-accent)' } }}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggle(task)}
      />
      <Typography
        sx={{
          flex: 1,
          fontSize: '13px',
          color: task.isCompleted ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
          textDecoration: task.isCompleted ? 'line-through' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {task.agendaItem?.title || 'Sem título'}
      </Typography>
      <PriorityBadge priority={task.priority} size="sm" />
      <CategoryTag category={task.category} size="sm" />
    </Box>
  );
}

function HabitRow({ habit, todayRecord, onToggle }: {
  habit: HabitModule;
  todayRecord?: DailyRecord;
  onToggle: (h: HabitModule, rec?: DailyRecord) => void;
}) {
  const done = todayRecord?.isCompleted ?? false;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1,
        borderRadius: '8px',
        transition: 'background 150ms',
        '&:hover': { background: 'var(--color-surface-hover)' },
        cursor: 'pointer',
      }}
      onClick={() => onToggle(habit, todayRecord)}
    >
      <Box sx={{
        width: 22,
        height: 22,
        borderRadius: '6px',
        border: `2px solid ${done ? 'var(--color-success)' : 'var(--color-border-strong)'}`,
        background: done ? 'var(--color-success)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 200ms',
        color: '#fff',
        fontSize: '12px',
      }}>
        {done && '✓'}
      </Box>
      <Typography sx={{
        flex: 1,
        fontSize: '13px',
        color: done ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
        textDecoration: done ? 'line-through' : 'none',
      }}>
        {habit.activity?.name ?? 'Sem nome'}
      </Typography>
      {habit.currentStreak > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, fontSize: '12px', color: 'var(--color-warning)' }}>
          <span className="streak-fire">🔥</span>
          <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-warning)' }}>
            {habit.currentStreak}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function DashboardSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Skeleton variant="text" width={220} height={32} sx={{ bgcolor: 'var(--color-bg-tertiary)' }} />
        <Skeleton variant="text" width={180} height={20} sx={{ bgcolor: 'var(--color-bg-tertiary)' }} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: '12px', bgcolor: 'var(--color-bg-tertiary)' }} />
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: '12px', bgcolor: 'var(--color-bg-tertiary)' }} />
        ))}
      </Box>
    </Box>
  );
}

const styles = {
  panel: {
    p: 2.5,
    borderRadius: '12px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2,
  },
  panelTitle: {
    flex: 1,
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  panelCount: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-tertiary)',
    background: 'var(--color-bg-tertiary)',
    px: 1,
    py: 0.25,
    borderRadius: '999px',
  },
  eventRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.5,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--color-accent)',
    mt: 0.6,
    flexShrink: 0,
  },
};
