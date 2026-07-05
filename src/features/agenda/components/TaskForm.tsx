import { useEffect, useState } from 'react';
import {
  Box, TextField, Button, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Task, Category, CreateTaskDTO, UpdateTaskDTO } from '../../../types/entities';
import { categoryService } from '../../categories/services/categoryService';

interface TaskFormProps {
  task?: Task;
  onSave: (data: CreateTaskDTO | UpdateTaskDTO) => Promise<void>;
  onCancel: () => void;
}

const schema = yup.object({
  title: yup.string().min(1, 'Título é obrigatório').required(),
  description: yup.string().optional(),
  dueDate: yup.string().optional(),
  priority: yup.string().oneOf(['HIGH', 'MEDIUM', 'LOW', '']).optional(),
  categoryId: yup.string().optional(),
});

type FormData = {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: string;
  categoryId?: string;
};

export function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: task?.agendaItem.title ?? '',
      description: task?.agendaItem.description ?? '',
      dueDate: task?.dueDate ? task.dueDate.slice(0, 16) : '',
      priority: task?.priority ?? '',
      categoryId: task?.categoryId ?? '',
    },
  });

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onSave({
        title: data.title,
        description: data.description || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        priority: (data.priority as 'HIGH' | 'MEDIUM' | 'LOW') || undefined,
        categoryId: data.categoryId || undefined,
        isCompleted: task?.isCompleted ?? false,
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
          <TextField
            {...field}
            label="Título *"
            fullWidth
            error={!!errors.title}
            helperText={errors.title?.message}
            autoFocus
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Descrição"
            fullWidth
            multiline
            rows={3}
          />
        )}
      />

      <Controller
        name="dueDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Data de entrega"
            type="datetime-local"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small">
              <InputLabel>Prioridade</InputLabel>
              <Select {...field} label="Prioridade">
                <MenuItem value="">Nenhuma</MenuItem>
                <MenuItem value="HIGH">🔴 Alta</MenuItem>
                <MenuItem value="MEDIUM">🟡 Média</MenuItem>
                <MenuItem value="LOW">🔵 Baixa</MenuItem>
              </Select>
            </FormControl>
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
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : task ? 'Salvar alterações' : 'Criar tarefa'}
        </Button>
      </Box>
    </Box>
  );
}
