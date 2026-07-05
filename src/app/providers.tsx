import { type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { AuthProvider } from '../features/auth/hooks/useAuth';
import getTheme from './theme';

function MuiThemeBridge({ children }: { children: ReactNode }) {
  const { mode } = useTheme();
  const muiTheme = getTheme(mode);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MuiThemeBridge>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MuiThemeBridge>
    </ThemeProvider>
  );
}
