import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, Skeleton } from '@mui/material';
import { ChevronLeftOutlined, ChevronRightOutlined, EventOutlined, TaskAltOutlined } from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { taskService } from '../services/taskService';
import { eventService } from '../services/eventService';
import type { Task, Event } from '../../../types/entities';

export function AgendaCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [t, e] = await Promise.allSettled([taskService.getAll(), eventService.getAll()]);
        if (t.status === 'fulfilled') setTasks(t.value);
        if (e.status === 'fulfilled') setEvents(e.value);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;

  // For a full grid, we often need leading/trailing days to fill the weeks, but let's stick to the exact month for simplicity,
  // padded by empty cells for the first row.
  const startingDayOfWeek = getDay(monthStart);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getItemsForDay = (date: Date) => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) === dayStr);
    const dayEvents = events.filter(e => e.startDate.slice(0, 10) === dayStr);
    return { dayTasks, dayEvents };
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToday = () => setCurrentMonth(new Date());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }} className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Calendário
          </Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
            Visão mensal das suas tarefas e eventos
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            onClick={goToday}
            sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Hoje
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'var(--color-surface)', borderRadius: '8px', p: 0.5, border: '1px solid var(--color-border)' }}>
            <IconButton size="small" onClick={prevMonth} sx={{ borderRadius: '6px' }}><ChevronLeftOutlined /></IconButton>
            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', minWidth: 120, textAlign: 'center', textTransform: 'capitalize' }}>
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </Typography>
            <IconButton size="small" onClick={nextMonth} sx={{ borderRadius: '6px' }}><ChevronRightOutlined /></IconButton>
          </Box>
        </Box>
      </Box>

      {/* Calendar Grid */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {/* Days of week header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <Box key={day} sx={{ py: 1.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Days grid */}
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: '8px', bgcolor: 'var(--color-bg-tertiary)' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', flex: 1 }}>
            {/* Empty cells for first week offset */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <Box key={`empty-${i}`} sx={{ borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }} />
            ))}

            {calendarDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const { dayTasks, dayEvents } = getItemsForDay(day);

              return (
                <Box
                  key={day.toISOString()}
                  sx={{
                    borderRight: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    p: 1,
                    background: isCurrentMonth ? 'transparent' : 'var(--color-bg-tertiary)',
                    opacity: isCurrentMonth ? 1 : 0.5,
                    display: 'flex', flexDirection: 'column', gap: 0.5,
                    transition: 'background 150ms',
                    '&:hover': { background: 'var(--color-surface-hover)' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                    <Typography sx={{
                      fontSize: '13px', fontWeight: isTodayDate ? 700 : 500,
                      color: isTodayDate ? '#fff' : 'var(--color-text-secondary)',
                      background: isTodayDate ? 'var(--color-accent)' : 'transparent',
                      width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                    }}>
                      {format(day, 'd')}
                    </Typography>
                  </Box>

                  {/* Render Events */}
                  {dayEvents.map(ev => (
                    <Box key={ev.agendaItemId} sx={{
                      px: 1, py: 0.5, borderRadius: '4px', background: 'var(--color-success-subtle)', borderLeft: '3px solid var(--color-success)',
                      display: 'flex', alignItems: 'center', gap: 0.5, overflow: 'hidden',
                    }}>
                      <EventOutlined sx={{ fontSize: 12, color: 'var(--color-success)' }} />
                      <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-success)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.agendaItem?.title || 'Sem título'}
                      </Typography>
                    </Box>
                  ))}

                  {/* Render Tasks */}
                  {dayTasks.map(tk => (
                    <Box key={tk.agendaItemId} sx={{
                      px: 1, py: 0.5, borderRadius: '4px', background: 'var(--color-accent-subtle)', borderLeft: '3px solid var(--color-accent)',
                      display: 'flex', alignItems: 'center', gap: 0.5, overflow: 'hidden',
                    }}>
                      <TaskAltOutlined sx={{ fontSize: 12, color: 'var(--color-accent)' }} />
                      <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tk.agendaItem?.title || 'Sem título'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
