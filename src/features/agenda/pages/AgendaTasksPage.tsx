import { useState, useEffect } from 'react';
import {
  Box, Typography, Checkbox, Button, Chip, IconButton,
  Skeleton, TextField, InputAdornment,
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, DeleteOutlined, EditOutlined,
  CheckBoxOutlined,
} from '@mui/icons-material';
import { isToday, isTomorrow, isThisWeek, parseISO, isPast, isFuture } from 'date-fns';
import { taskService } from '../services/taskService';
import { TaskForm } from '../components/TaskForm';
import { SideDrawer } from '../../../components/feedback/SideDrawer';
import { PriorityBadge, CategoryTag, EmptyState } from '../../../components/data-display/Badges';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '../../../types/entities';
import { getDueDateLabel } from '../../../utils/formatters';

type FilterTab = 'all' | 'today' | 'week' | 'overdue';

function groupTasks(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {};

  tasks.forEach(task => {
    let group = 'Sem data';
    if (!task.dueDate) {
      group = 'Sem data';
    } else {
      const date = parseISO(task.dueDate);
      if (isToday(date)) group = '📅 Hoje';
      else if (isTomorrow(date)) group = '📆 Amanhã';
      else if (isThisWeek(date) && isFuture(date)) group = '🗓 Esta semana';
      else if (isPast(date)) group = '⚠️ Atrasadas';
      else group = '📋 Futuras';
    }
    if (!groups[group]) groups[group] = [];
    groups[group].push(task);
  });

  // Sort groups in logical order
  const order = ['⚠️ Atrasadas', '📅 Hoje', '📆 Amanhã', '🗓 Esta semana', '📋 Futuras', 'Sem data'];
  const sorted: Record<string, Task[]> = {};
  order.forEach(key => { if (groups[key]) sorted[key] = groups[key]; });

  return sorted;
}

export function AgendaTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = search ? (task.agendaItem?.title?.toLowerCase().includes(search.toLowerCase()) ?? false) : true;

    let matchesFilter = true;
    if (filter === 'today') matchesFilter = !!task.dueDate && isToday(parseISO(task.dueDate));
    if (filter === 'week') matchesFilter = !!task.dueDate && isThisWeek(parseISO(task.dueDate));
    if (filter === 'overdue') matchesFilter = !!task.dueDate && isPast(parseISO(task.dueDate)) && !task.isCompleted;

    return matchesSearch && matchesFilter;
  });

  const grouped = groupTasks(filteredTasks);

  const handleToggle = async (task: Task) => {
    const updated = !task.isCompleted;
    setTasks(prev => prev.map(t => t.agendaItemId === task.agendaItemId ? { ...t, isCompleted: updated } : t));
    try {
      await taskService.update(task.agendaItemId, { isCompleted: updated });
    } catch {
      setTasks(prev => prev.map(t => t.agendaItemId === task.agendaItemId ? { ...t, isCompleted: task.isCompleted } : t));
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Excluir "${task.agendaItem?.title || 'Tarefa'}"?`)) return;
    setTasks(prev => prev.filter(t => t.agendaItemId !== task.agendaItemId));
    await taskService.remove(task.agendaItemId);
  };

  const handleSave = async (data: CreateTaskDTO | UpdateTaskDTO) => {
    if (editing) {
      await taskService.update(editing.agendaItemId, data);
    } else {
      await taskService.create(data as CreateTaskDTO);
    }
    setDrawerOpen(false);
    setEditing(null);
    await fetchTasks();
  };

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (task: Task) => { setEditing(task); setDrawerOpen(true); };

  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Tarefas
          </Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
            {completedCount}/{tasks.length} concluídas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={openCreate}
          sx={{
            borderRadius: '10px',
            background: 'hsl(245, 85%, 65%)',
            fontWeight: 600,
            boxShadow: '0 4px 12px hsl(245, 85%, 65%, 0.3)',
            '&:hover': { background: 'hsl(245, 85%, 58%)' },
          }}
        >
          Nova Tarefa
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar tarefas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ fontSize: 18, color: 'var(--color-text-tertiary)' }} />
                </InputAdornment>
              ),
            }
          }}
          sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '8px', background: 'var(--color-surface)' } }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['all', 'today', 'week', 'overdue'] as FilterTab[]).map(tab => (
            <Chip
              key={tab}
              label={{ all: 'Todas', today: 'Hoje', week: 'Esta semana', overdue: 'Atrasadas' }[tab]}
              onClick={() => setFilter(tab)}
              variant={filter === tab ? 'filled' : 'outlined'}
              size="small"
              sx={{
                borderRadius: '8px',
                fontWeight: filter === tab ? 600 : 400,
                background: filter === tab ? 'hsl(245, 85%, 65%)' : 'var(--color-surface)',
                color: filter === tab ? '#fff' : 'var(--color-text-secondary)',
                borderColor: filter === tab ? 'transparent' : 'var(--color-border)',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Tasks List */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: '8px', bgcolor: 'var(--color-bg-tertiary)' }} />
          ))}
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Box sx={{ p: 4, borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <EmptyState
            icon={<CheckBoxOutlined sx={{ fontSize: 40 }} />}
            title="Nenhuma tarefa encontrada"
            description="Crie sua primeira tarefa clicando em 'Nova Tarefa'."
            action={
              <Button variant="contained" size="small" startIcon={<AddOutlined />} onClick={openCreate}
                sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)' }}>
                Nova Tarefa
              </Button>
            }
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(grouped).map(([group, groupTasks]) => (
            <Box key={group}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {group}
              </Typography>
              <Box sx={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                {groupTasks.map((task, idx) => (
                  <Box key={task.agendaItemId}>
                    {idx > 0 && <Box sx={{ height: 1, background: 'var(--color-border)', mx: 2 }} />}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.25,
                      transition: 'background 150ms',
                      '&:hover': { background: 'var(--color-surface-hover)' },
                      '&:hover .task-actions': { opacity: 1 },
                    }}>
                      <Checkbox
                        checked={task.isCompleted}
                        onChange={() => handleToggle(task)}
                        size="small"
                        sx={{ p: 0.25, color: 'var(--color-border-strong)', '&.Mui-checked': { color: 'var(--color-accent)' } }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: task.isCompleted ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                          textDecoration: task.isCompleted ? 'line-through' : 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {task.agendaItem?.title || 'Sem título'}
                        </Typography>
                        {task.agendaItem?.description && (
                          <Typography sx={{ fontSize: '12px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.agendaItem.description}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                        {task.dueDate && (
                          <Typography sx={{ fontSize: '12px', color: isPast(parseISO(task.dueDate)) && !task.isCompleted ? 'var(--color-danger)' : 'var(--color-text-tertiary)' }}>
                            {getDueDateLabel(task.dueDate)}
                          </Typography>
                        )}
                        <PriorityBadge priority={task.priority} size="sm" />
                        <CategoryTag category={task.category} size="sm" />
                      </Box>
                      <Box className="task-actions" sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 150ms' }}>
                        <IconButton size="small" onClick={() => openEdit(task)} sx={{ borderRadius: '6px', color: 'var(--color-text-secondary)' }}>
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(task)} sx={{ borderRadius: '6px', color: 'var(--color-danger)' }}>
                          <DeleteOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Drawer */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        title={editing ? 'Editar Tarefa' : 'Nova Tarefa'}
      >
        <TaskForm
          task={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        />
      </SideDrawer>
    </Box>
  );
}
