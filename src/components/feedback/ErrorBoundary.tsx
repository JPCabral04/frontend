import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { RefreshOutlined, BugReportOutlined } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  /** Mensagem amigável exibida no fallback */
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary global — captura erros de render em qualquer componente filho
 * e exibe uma tela de recuperação amigável, impedindo que toda a UI quebre.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <MinhaPage />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log para debugging — substituir por serviço de monitoramento em produção
    console.error('[ErrorBoundary] Erro capturado:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            gap: 2,
            p: 4,
            borderRadius: '16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-danger-subtle)',
          }}
        >
          <BugReportOutlined sx={{ fontSize: 48, color: 'var(--color-danger)', opacity: 0.6 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', mb: 0.5 }}>
              {this.props.fallbackMessage ?? 'Ocorreu um erro inesperado'}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Tente recarregar esta seção ou navegue para outra página.
            </Typography>
            {import.meta.env.DEV && this.state.error && (
              <Typography
                sx={{
                  mt: 1,
                  fontSize: '11px',
                  color: 'var(--color-danger)',
                  fontFamily: 'monospace',
                  background: 'var(--color-danger-subtle)',
                  p: 1,
                  borderRadius: '6px',
                  maxWidth: 400,
                  overflow: 'auto',
                  textAlign: 'left',
                }}
              >
                {this.state.error.message}
              </Typography>
            )}
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshOutlined />}
            onClick={this.handleReset}
            sx={{
              borderRadius: '8px',
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border)',
              mt: 1,
            }}
          >
            Tentar novamente
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
