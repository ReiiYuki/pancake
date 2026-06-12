export const theme = {
  colors: {
    primary: '#F06A6A', // Asana-like warm coral/salmon
    primaryHover: '#E05A5A',
    secondary: '#36D399', // Bright mint
    background: '#F9FAFC', // Very soft off-white/blue
    surface: '#FFFFFF', // Clean white
    surfaceElevated: 'rgba(255, 255, 255, 0.7)', // For glassmorphism
    text: {
      main: '#151B26', // Deep slate
      light: '#6D7A8C', // Muted blue-grey
    },
    border: '#E8ECEE',
    status: {
      todo: '#F2F4F7',
      inProgress: '#E5F1FF',
      done: '#E3FCEF',
    },
    statusText: {
      todo: '#6D7A8C',
      inProgress: '#0052CC',
      done: '#006644',
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    round: '9999px',
  },
  shadows: {
    sm: '0 2px 4px rgba(21, 27, 38, 0.04)',
    md: '0 4px 8px rgba(21, 27, 38, 0.06)',
    lg: '0 12px 24px rgba(21, 27, 38, 0.08)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  },
  transitions: {
    default: '0.2s ease-in-out',
    smooth: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }
};

export type Theme = typeof theme;
