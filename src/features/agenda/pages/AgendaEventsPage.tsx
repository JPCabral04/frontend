import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Skeleton, TextField, InputAdornment } from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined, EventOutlined, SearchOutlined, AccessTimeOutlined } from '@mui/icons-material';
import { parseISO, isToday, isTomorrow, isThisWeek, isFuture } from 'date-fns';

import { eventService } from '../services/eventService';
import { EventForm } from '../components/EventForm';
import { SideDrawer } from '../../../components/feedback/SideDrawer';
import { EmptyState } from '../../../components/data-display/Badges';
import type { Event, CreateEventDTO, UpdateEventDTO } from '../../../types/entities';
import { formatTime } from '../../../utils/formatters';

function groupEvents(events: Event[]): Record<string, Event[]> {
  const groups: Record<string, Event[]> = {};
  events.forEach(ev => {
    const date = parseISO(ev.startDate);
    let group: string;
    if (isToday(date)) group = '📅 Hoje';
    else if (isTomorrow(date)) group = '📆 Amanhã';
    else if (isThisWeek(date) && isFuture(date)) group = '🗓 Esta semana';
    else if (isFuture(date)) group = '📋 Próximos';
    else group = '📁 Passados';

    if (!groups[group]) groups[group] = [];
    groups[group].push(ev);
  });

  const order = ['📅 Hoje', '📆 Amanhã', '🗓 Esta semana', '📋 Próximos', '📁 Passados'];
  const sorted: Record<string, Event[]> = {};
  order.forEach(k => { if (groups[k]) sorted[k] = groups[k]; });
  return sorted;
}

export function AgendaEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try { setEvents(await eventService.getAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filtered = events
    .filter(e => search ? (e.agendaItem?.title?.toLowerCase().includes(search.toLowerCase()) ?? false) : true)
    .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

  const grouped = groupEvents(filtered);

  const handleSave = async (data: CreateEventDTO | UpdateEventDTO) => {
    if (editing) {
      await eventService.update(editing.agendaItemId, data);
    } else {
      await eventService.create(data as CreateEventDTO);
    }
    setDrawerOpen(false);
    setEditing(null);
    await fetchEvents();
  };

  const handleDelete = async (ev: Event) => {
    if (!confirm(`Excluir "${ev.agendaItem?.title || 'Evento'}"?`)) return;
    setEvents(prev => prev.filter(e => e.agendaItemId !== ev.agendaItemId));
    await eventService.remove(ev.agendaItemId);
  };

  const openEdit = (ev: Event) => { setEditing(ev); setDrawerOpen(true); };
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Eventos</Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
            {events.filter(e => isFuture(parseISO(e.startDate))).length} eventos futuros
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}
          sx={{ borderRadius: '10px', background: 'hsl(245, 85%, 65%)', fontWeight: 600, boxShadow: '0 4px 12px hsl(245, 85%, 65%, 0.3)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          Novo Evento
        </Button>
      </Box>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Buscar eventos..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 18, color: 'var(--color-text-tertiary)' }} /></InputAdornment>,
          }
        }}
        sx={{ maxWidth: 320, '& .MuiOutlinedInput-root': { borderRadius: '8px', background: 'var(--color-surface)' } }}
      />

      {/* Events */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '8px', bgcolor: 'var(--color-bg-tertiary)' }} />)}
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ p: 4, borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <EmptyState
            icon={<EventOutlined sx={{ fontSize: 40 }} />}
            title="Nenhum evento encontrado"
            description="Crie seu primeiro evento clicando em 'Novo Evento'."
            action={<Button variant="contained" size="small" startIcon={<AddOutlined />} onClick={openCreate} sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)' }}>Novo Evento</Button>}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(grouped).map(([group, groupEvents]) => (
            <Box key={group}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {group}
              </Typography>
              <Box sx={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                {groupEvents.map((ev, idx) => (
                  <Box key={ev.agendaItemId}>
                    {idx > 0 && <Box sx={{ height: 1, background: 'var(--color-border)', mx: 2 }} />}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      transition: 'background 150ms',
                      '&:hover': { background: 'var(--color-surface-hover)' },
                      '&:hover .event-actions': { opacity: 1 },
                    }}>
                      {/* Time indicator */}
                      <Box sx={{ textAlign: 'center', minWidth: 48 }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}>
                          {formatTime(ev.startDate)}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                          {formatTime(ev.endDate)}
                        </Typography>
                      </Box>

                      {/* Vertical line */}
                      <Box sx={{ width: 3, height: 40, borderRadius: '999px', background: 'hsl(245, 85%, 65%)', flexShrink: 0 }} />

                      {/* Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.agendaItem?.title || 'Sem título'}
                        </Typography>
                        {ev.agendaItem?.description && (
                          <Typography sx={{ fontSize: '12px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.agendaItem.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Duration */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'var(--color-text-tertiary)' }}>
                        <AccessTimeOutlined sx={{ fontSize: 13 }} />
                        <Typography sx={{ fontSize: '12px' }}>
                          {Math.round((parseISO(ev.endDate).getTime() - parseISO(ev.startDate).getTime()) / 60000)}min
                        </Typography>
                      </Box>

                      {/* Actions */}
                      <Box className="event-actions" sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 150ms' }}>
                        <IconButton size="small" onClick={() => openEdit(ev)} sx={{ borderRadius: '6px', color: 'var(--color-text-secondary)' }}>
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(ev)} sx={{ borderRadius: '6px', color: 'var(--color-danger)' }}>
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
      <SideDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} title={editing ? 'Editar Evento' : 'Novo Evento'}>
        <EventForm event={editing ?? undefined} onSave={handleSave} onCancel={() => { setDrawerOpen(false); setEditing(null); }} />
      </SideDrawer>
    </Box>
  );
}
