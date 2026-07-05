import { useState } from 'react';
import {
  Box, TextField, Button, CircularProgress, Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Event, CreateEventDTO, UpdateEventDTO } from '../../../types/entities';

interface EventFormProps {
  event?: Event;
  onSave: (data: CreateEventDTO | UpdateEventDTO) => Promise<void>;
  onCancel: () => void;
}

const schema = yup.object({
  title: yup.string().min(1, 'Título é obrigatório').required(),
  description: yup.string().optional(),
  startDate: yup.string().required('Data de início é obrigatória'),
  endDate: yup.string().required('Data de término é obrigatória'),
});

type FormData = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
};

export function EventForm({ event, onSave, onCancel }: EventFormProps) {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: event?.agendaItem.title ?? '',
      description: event?.agendaItem.description ?? '',
      startDate: event?.startDate ? event.startDate.slice(0, 16) : '',
      endDate: event?.endDate ? event.endDate.slice(0, 16) : '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSave({
        title: data.title,
        description: data.description || undefined,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Título *" fullWidth error={!!errors.title} helperText={errors.title?.message} autoFocus />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Descrição" fullWidth multiline rows={3} />
        )}
      />

      <Controller
        name="startDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Início *"
            type="datetime-local"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.startDate}
            helperText={errors.startDate?.message}
          />
        )}
      />

      <Controller
        name="endDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Término *"
            type="datetime-local"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.endDate}
            helperText={errors.endDate?.message}
          />
        )}
      />

      <Divider sx={{ borderColor: 'var(--color-border)' }} />

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: '8px', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : event ? 'Salvar alterações' : 'Criar evento'}
        </Button>
      </Box>
    </Box>
  );
}
