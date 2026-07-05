import { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, TextField, Skeleton } from '@mui/material';
import { AddOutlined, DeleteOutlined, EditOutlined, LabelOutlined } from '@mui/icons-material';
import { categoryService } from '../services/categoryService';
import { SideDrawer } from '../../../components/feedback/SideDrawer';
import { EmptyState } from '../../../components/data-display/Badges';
import type { Category, CreateCategoryDTO } from '../../../types/entities';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CircularProgress, Divider, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

// -- Category Form (embedded) --
const PRESET_COLORS = [
  '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316',
  '#6366F1', '#84CC16',
];

const categorySchema = yup.object({
  name: yup.string().min(1, 'Nome é obrigatório').required(),
  hexColor: yup.string().optional(),
  moduleType: yup.string().optional(),
});

type CategoryFormData = { name: string; hexColor?: string; moduleType?: string };

function CategoryForm({ category, onSave, onCancel }: {
  category?: Category;
  onSave: (data: CreateCategoryDTO) => Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(category?.hexColor ?? PRESET_COLORS[0]);

  const { control, handleSubmit, formState: { errors } } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema) as any,
    defaultValues: { name: category?.name ?? '', moduleType: category?.moduleType ?? '' },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      await onSave({ name: data.name, hexColor: selectedColor, moduleType: data.moduleType || undefined });
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
          <TextField {...field} label="Nome da categoria *" fullWidth error={!!errors.name} helperText={errors.name?.message} autoFocus />
        )}
      />

      <Controller
        name="moduleType"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth size="small">
            <InputLabel>Módulo</InputLabel>
            <Select {...field} label="Módulo">
              <MenuItem value="">Geral</MenuItem>
              <MenuItem value="AGENDA">Agenda</MenuItem>
              <MenuItem value="FINANCE">Financeiro</MenuItem>
              <MenuItem value="HABIT">Hábitos</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      {/* Color Picker */}
      <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', mb: 1 }}>Cor</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {PRESET_COLORS.map(color => (
            <Box
              key={color}
              onClick={() => setSelectedColor(color)}
              sx={{
                width: 28, height: 28, borderRadius: '8px', background: color, cursor: 'pointer',
                border: `3px solid ${selectedColor === color ? 'var(--color-text-primary)' : 'transparent'}`,
                transition: 'transform 150ms, border-color 150ms',
                '&:hover': { transform: 'scale(1.15)' },
              }}
            />
          ))}
        </Box>
        {/* Preview */}
        <Box sx={{ mt: 2, display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75, borderRadius: '8px', background: `${selectedColor}18`, border: `1px solid ${selectedColor}40`, color: selectedColor, fontSize: '13px', fontWeight: 500 }}>
          <LabelOutlined sx={{ fontSize: 14 }} />
          Preview
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'var(--color-border)' }} />

      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: '8px', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={loading}
          sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : category ? 'Salvar' : 'Criar'}
        </Button>
      </Box>
    </Box>
  );
}

// -- Categories Page --
const MODULE_LABEL: Record<string, string> = {
  AGENDA: 'Agenda', FINANCE: 'Financeiro', HABIT: 'Hábitos', '': 'Geral',
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try { setCategories(await categoryService.getAll()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (data: CreateCategoryDTO) => {
    if (editing) {
      const updated = await categoryService.update(editing.id, data);
      setCategories(prev => prev.map(c => c.id === editing.id ? updated : c));
    } else {
      const created = await categoryService.create(data);
      setCategories(prev => [...prev, created]);
    }
    setDrawerOpen(false);
    setEditing(null);
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Excluir categoria "${cat.name}"?`)) return;
    setCategories(prev => prev.filter(c => c.id !== cat.id));
    await categoryService.remove(cat.id);
  };

  const openEdit = (cat: Category) => { setEditing(cat); setDrawerOpen(true); };
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} className="animate-fadeIn">
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Categorias</Typography>
          <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
            {categories.length} categorias criadas
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}
          sx={{ borderRadius: '10px', background: 'hsl(245, 85%, 65%)', fontWeight: 600, boxShadow: '0 4px 12px hsl(245, 85%, 65%, 0.3)', '&:hover': { background: 'hsl(245, 85%, 58%)' } }}>
          Nova Categoria
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: '10px', bgcolor: 'var(--color-bg-tertiary)' }} />)}
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={{ p: 4, borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <EmptyState
            icon={<LabelOutlined sx={{ fontSize: 40 }} />}
            title="Nenhuma categoria criada"
            description="Crie categorias para organizar tarefas e transações."
            action={<Button variant="contained" size="small" startIcon={<AddOutlined />} onClick={openCreate} sx={{ borderRadius: '8px', background: 'hsl(245, 85%, 65%)' }}>Nova Categoria</Button>}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {categories.map(cat => (
            <Box key={cat.id} sx={{
              p: 2, borderRadius: '12px',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 1.5,
              transition: 'transform 200ms, box-shadow 200ms',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 'var(--shadow-md)' },
              '&:hover .cat-actions': { opacity: 1 },
            }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: `${cat.hexColor ?? '#8B5CF6'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LabelOutlined sx={{ fontSize: 18, color: cat.hexColor ?? '#8B5CF6' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </Typography>
                {cat.moduleType && (
                  <Typography sx={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    {MODULE_LABEL[cat.moduleType] ?? cat.moduleType}
                  </Typography>
                )}
              </Box>
              <Box className="cat-actions" sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 150ms' }}>
                <IconButton size="small" onClick={() => openEdit(cat)} sx={{ borderRadius: '6px', color: 'var(--color-text-secondary)' }}>
                  <EditOutlined sx={{ fontSize: 15 }} />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(cat)} sx={{ borderRadius: '6px', color: 'var(--color-danger)' }}>
                  <DeleteOutlined sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <SideDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} title={editing ? 'Editar Categoria' : 'Nova Categoria'}>
        <CategoryForm category={editing ?? undefined} onSave={handleSave} onCancel={() => { setDrawerOpen(false); setEditing(null); }} />
      </SideDrawer>
    </Box>
  );
}
