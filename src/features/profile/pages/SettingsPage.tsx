
import { Box, Typography, Paper, Switch, Divider, FormControl, Select, MenuItem } from '@mui/material';
import { DarkModeOutlined, NotificationsNoneOutlined, LanguageOutlined, SecurityOutlined } from '@mui/icons-material';
import { useTheme } from '../../../hooks/useTheme';

export function SettingsPage() {
  const { mode, toggleTheme } = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800, margin: '0 auto', width: '100%' }} className="animate-fadeIn">
      <Box>
        <Typography sx={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Configurações
        </Typography>
        <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)', mt: 0.5 }}>
          Ajuste as preferências do seu aplicativo
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Appearance */}
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Aparência
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DarkModeOutlined sx={{ color: 'var(--color-text-secondary)' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Modo Escuro</Typography>
                <Typography sx={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Alternar entre tema claro e escuro</Typography>
              </Box>
            </Box>
            <Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'var(--color-border)' }} />

        {/* Preferences */}
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Preferências
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LanguageOutlined sx={{ color: 'var(--color-text-secondary)' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Idioma</Typography>
                  <Typography sx={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Selecione o idioma da interface</Typography>
                </Box>
              </Box>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value="pt-BR" sx={{ borderRadius: '8px' }}>
                  <MenuItem value="pt-BR">Português (BR)</MenuItem>
                  <MenuItem value="en-US">English (US)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <NotificationsNoneOutlined sx={{ color: 'var(--color-text-secondary)' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Notificações</Typography>
                  <Typography sx={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Receber alertas e lembretes</Typography>
                </Box>
              </Box>
              <Switch defaultChecked color="primary" />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'var(--color-border)' }} />

        {/* Privacy */}
        <Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Privacidade e Segurança
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SecurityOutlined sx={{ color: 'var(--color-text-secondary)' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Autenticação em Duas Etapas (2FA)</Typography>
                <Typography sx={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Adicione uma camada extra de segurança</Typography>
              </Box>
            </Box>
            <Switch color="primary" />
          </Box>
        </Box>

      </Paper>
    </Box>
  );
}
