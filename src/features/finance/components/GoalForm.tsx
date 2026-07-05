import { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Goal, CreateGoalDTO, UpdateGoalDTO } from '../../../types/entities';

interface GoalFormProps {
  goal?: Goal;
  onSave: (data: CreateGoalDTO | UpdateGoalDTO) => Promise<void>;
  onCancel: () => void;
}

const schema = yup.object({
  title: yup.string().min(1, 'Título é obrigatório').required(),
  amount: yup.number().min(0).required('Valor atual é obrigatório'),
  targetAmount: yup.number().positive('Meta deve ser positiva').required('Valor da meta é obrigatório'),
  targetDate: yup.string().optional(),
});

type FormData = {
  title: string;
  amount: number;
  targetAmount: number;
  targetDate?: string;
};

export function GoalForm({ goal, onSave, onCancel }: GoalFormProps) {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: goal?.title ?? '',
      amount: goal?.financialItem.amount ?? 0,
      targetAmount: goal?.targetAmount ?? ('' as unknown as number),
      targetDate: goal?.targetDate ? goal.targetDate.slice(0, 10) : '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSave({
        title: data.title,
        amount: data.amount,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
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
          <TextField {...field} label="Nome da meta *" fullWidth error={!!errors.title} helperText={errors.title?.message} autoFocus />
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Valor atual (R$) *" type="number" fullWidth error={!!errors.amount} helperText={errors.amount?.message} slotProps={{ htmlInput: { step: '0.01', min: '0' } }} />
          )}
        />
        <Controller
          name="targetAmount"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Meta (R$) *" type="number" fullWidth error={!!errors.targetAmount} helperText={errors.targetAmount?.message} slotProps={{ htmlInput: { step: '0.01', min: '0' } }} />
          )}
        />
      </Box>

      <Controller
        name="targetDate"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Prazo" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
        )}
      />

      <Divider sx={{ borderColor: 'var(--color-border)' }} />

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: '8px', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={loading}
          sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : goal ? 'Salvar' : 'Criar meta'}
        </Button>
      </Box>
    </Box>
  );
}
