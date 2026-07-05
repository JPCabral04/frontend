import { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Investment, CreateInvestmentDTO, UpdateInvestmentDTO } from '../../../types/entities';

interface InvestmentFormProps {
  investment?: Investment;
  onSave: (data: CreateInvestmentDTO | UpdateInvestmentDTO) => Promise<void>;
  onCancel: () => void;
}

const schema = yup.object({
  assetName: yup.string().min(1, 'Nome do ativo é obrigatório').required(),
  amount: yup.number().positive('Valor deve ser positivo').required('Valor é obrigatório'),
  estimatedReturn: yup.number().min(0).optional(),
});

type FormData = {
  assetName: string;
  amount: number;
  estimatedReturn?: number;
};

export function InvestmentForm({ investment, onSave, onCancel }: InvestmentFormProps) {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      assetName: investment?.assetName ?? '',
      amount: investment?.financialItem.amount ?? undefined,
      estimatedReturn: investment?.estimatedReturn ?? undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSave({
        assetName: data.assetName,
        amount: data.amount,
        estimatedReturn: data.estimatedReturn ?? undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Controller
        name="assetName"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Ativo *" placeholder="Ex: Tesouro Selic, PETR4, Bitcoin..." fullWidth error={!!errors.assetName} helperText={errors.assetName?.message} autoFocus />
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Valor investido (R$) *" type="number" fullWidth error={!!errors.amount} helperText={errors.amount?.message} slotProps={{ htmlInput: { step: '0.01', min: '0' } }} />
          )}
        />
        <Controller
          name="estimatedReturn"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Retorno estimado (% a.a.)" type="number" fullWidth slotProps={{ htmlInput: { step: '0.01', min: '0' } }} />
          )}
        />
      </Box>

      <Divider sx={{ borderColor: 'var(--color-border)' }} />

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: '8px', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={loading}
          sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : investment ? 'Salvar' : 'Adicionar'}
        </Button>
      </Box>
    </Box>
  );
}
