import { createTheme, type Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    surface: { main: string };
  }
  interface PaletteOptions {
    surface?: { main: string };
  }
}

const getTheme = (mode: 'light' | 'dark'): Theme => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: 'hsl(245, 85%, 65%)',
        light: 'hsl(245, 85%, 75%)',
        dark: 'hsl(245, 85%, 55%)',
        contrastText: '#fff',
      },
      secondary: {
        main: 'hsl(152, 60%, 40%)',
      },
      error: {
        main: 'hsl(0, 75%, 55%)',
      },
      warning: {
        main: 'hsl(38, 95%, 50%)',
      },
      success: {
        main: 'hsl(152, 60%, 40%)',
      },
      background: {
        default: isLight ? 'hsl(220, 20%, 97%)' : 'hsl(225, 20%, 8%)',
        paper: isLight ? 'hsl(0, 0%, 100%)' : 'hsl(225, 18%, 14%)',
      },
      text: {
        primary: isLight ? 'hsl(220, 25%, 10%)' : 'hsl(0, 0%, 95%)',
        secondary: isLight ? 'hsl(220, 10%, 45%)' : 'hsl(220, 10%, 65%)',
      },
      divider: isLight ? 'hsl(220, 16%, 90%)' : 'hsl(225, 14%, 22%)',
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h1: { fontSize: '28px', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '22px', fontWeight: 700, lineHeight: 1.25 },
      h3: { fontSize: '18px', fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: '16px', fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4 },
      h6: { fontSize: '12px', fontWeight: 600, lineHeight: 1.5 },
      body1: { fontSize: '14px', lineHeight: 1.5 },
      body2: { fontSize: '13px', lineHeight: 1.5 },
      caption: { fontSize: '12px', lineHeight: 1.5 },
      button: { fontSize: '14px', fontWeight: 500, textTransform: 'none' },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0 1px 2px rgba(0,0,0,0.05)',
      '0 2px 6px rgba(0,0,0,0.07)',
      '0 4px 12px rgba(0,0,0,0.08)',
      '0 8px 24px rgba(0,0,0,0.12)',
      '0 16px 48px rgba(0,0,0,0.16)',
      ...Array(19).fill('none') as string[],
    ] as Theme['shadows'],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          contained: {
            background: 'hsl(245, 85%, 65%)',
            '&:hover': { background: 'hsl(245, 85%, 58%)' },
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small', variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              fontSize: '14px',
            },
          },
        },
      },
      MuiSelect: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: { borderRadius: '8px', fontSize: '14px' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: isLight
              ? '0 1px 2px rgba(0,0,0,0.05)'
              : '0 1px 2px rgba(0,0,0,0.3)',
            border: `1px solid ${isLight ? 'hsl(220, 16%, 90%)' : 'hsl(225, 14%, 22%)'}`,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: '16px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: '6px', fontSize: '12px', fontWeight: 500 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 400,
          },
        },
      },
    },
  });
};

export default getTheme;
