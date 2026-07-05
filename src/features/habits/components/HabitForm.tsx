import { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { HabitModule, CreateHabitDTO, UpdateHabitDTO } from '../../../types/entities';

interface HabitFormProps {
  habit?: HabitModule;
  onSave: (data: CreateHabitDTO | UpdateHabitDTO) => Promise<void>;
  onCancel: () => void;
}

const schema = yup.object({
  name: yup.string().min(1, 'Nome é obrigatório').required(),
  description: yup.string().optional(),
  notes: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

export function HabitForm({ habit, onSave, onCancel }: HabitFormProps) {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: habit?.activity.name ?? '',
      description: habit?.activity.description ?? '',
      notes: habit?.notes ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSave({
        name: data.name,
        description: data.description || undefined,
        notes: data.notes || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Nome do hábito *" placeholder="Ex: Exercício físico, Leitura 30min..." fullWidth error={!!errors.name} helperText={errors.name?.message} autoFocus />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Descrição" placeholder="Descreva o que precisa fazer..." fullWidth multiline rows={2} />
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Notas" placeholder="Observações, dicas, motivação..." fullWidth multiline rows={3} />
        )}
      />

      <Divider sx={{ borderColor: 'var(--color-border)' }} />

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: '8px', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={loading}
          sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : habit ? 'Salvar' : 'Criar hábito'}
        </Button>
      </Box>
    </Box>
  );
}
