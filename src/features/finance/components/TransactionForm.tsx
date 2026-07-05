import { useEffect, useState } from 'react';
import {
  Box, TextField, Button, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Transaction, Category, CreateTransactionDTO, UpdateTransactionDTO } from '../../../types/entities';
import { categoryService } from '../../categories/services/categoryService';

interface TransactionFormProps {
  transaction?: Transaction;
  onSave: (data: CreateTransactionDTO | UpdateTransactionDTO) => Promise<void>;
  onCancel: () => void;
}

const schema = yup.object({
  amount: yup.number().positive('Valor deve ser positivo').required('Valor é obrigatório'),
  transactionType: yup.string().oneOf(['INCOME', 'EXPENSE']).required('Tipo é obrigatório'),
  date: yup.string().required('Data é obrigatória'),
  description: yup.string().optional(),
  categoryId: yup.string().optional(),
});

type FormData = {
  amount: number;
  transactionType: 'INCOME' | 'EXPENSE';
  date: string;
  description?: string;
  categoryId?: string;
};

export function TransactionForm({ transaction, onSave, onCancel }: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      amount: transaction?.financialItem?.amount ?? undefined,
      transactionType: transaction?.transactionType ?? 'EXPENSE',
      date: transaction?.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: transaction?.description ?? '',
      categoryId: transaction?.categoryId ?? '',
    },
  });

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSave({
        amount: data.amount,
        transactionType: data.transactionType,
        date: new Date(data.date).toISOString(),
        description: data.description || undefined,
        categoryId: data.categoryId || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Type selector */}
      <Controller
        name="transactionType"
        control={control}
        render={({ field }) => (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {(['INCOME', 'EXPENSE'] as const).map((type) => (
              <Box
                key={type}
                onClick={() => field.onChange(type)}
                sx={{
                  py: 1.5,
                  borderRadius: '10px',
                  border: `2px solid ${field.value === type
                    ? type === 'INCOME' ? 'var(--color-success)' : 'var(--color-danger)'
                    : 'var(--color-border)'}`,
                  background: field.value === type
                    ? type === 'INCOME' ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)'
                    : 'var(--color-surface)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: field.value === type
                    ? type === 'INCOME' ? 'var(--color-success)' : 'var(--color-danger)'
                    : 'var(--color-text-secondary)',
                  transition: 'all 200ms',
                }}
              >
                {type === 'INCOME' ? '⬆️ Receita' : '⬇️ Despesa'}
              </Box>
            ))}
          </Box>
        )}
      />

      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Valor (R$) *"
            type="number"
            fullWidth
            error={!!errors.amount}
            helperText={errors.amount?.message}
            slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
            autoFocus
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Descrição" fullWidth />
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Data *"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select {...field} label="Categoria">
                <MenuItem value="">Nenhuma</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: cat.hexColor ?? '#8B5CF6' }} />
                      {cat.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Box>

      <Divider sx={{ borderColor: 'var(--color-border)' }} />

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: '8px', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={loading}
          sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : transaction ? 'Salvar' : 'Adicionar'}
        </Button>
      </Box>
    </Box>
  );
}
