// Messaging Theme
// Centralized styling for all messaging components

/**
 * Messaging theme configuration
 * @param {Object} theme - MUI theme object
 * @returns {Object} Messaging-specific theme styles
 */
export const getMessagingTheme = (theme) => ({
  // Colors
  colors: {
    primary: theme.palette.primary.main, // Grape #94618E
    secondary: theme.palette.secondary.main, 
    background: theme.palette.background.default,
    surface: '#F4DECB', // Sand
    accent: '#F8EEE7', // Shell
    childContext: theme.palette.primary.light,
    unread: theme.palette.error.main,
    online: theme.palette.success.main,
    offline: theme.palette.grey[400]
  },

  // Message bubble styles
  messageBubble: {
    own: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      borderRadius: '18px 18px 4px 18px',
      maxWidth: '70%',
      wordBreak: 'break-word'
    },
    other: {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.text.primary,
      borderRadius: '18px 18px 18px 4px', 
      maxWidth: '70%',
      wordBreak: 'break-word'
    }
  },

  // Child context display
  childContext: {
    header: {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      padding: theme.spacing(1, 2),
      borderRadius: theme.spacing(1),
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1)
    },
    avatar: {
      width: 32,
      height: 32,
      fontSize: '0.875rem',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    },
    text: {
      fontWeight: 600,
      fontSize: '0.875rem'
    }
  },

  // Action button styles
  buttons: {
    messages: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
      borderRadius: theme.spacing(1),
      minWidth: 'auto',
      padding: theme.spacing(0.75, 1.5),
      fontSize: '0.875rem',
      fontWeight: 500
    },
    secondary: {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: theme.palette.grey[200],
      },
      borderRadius: theme.spacing(1)
    }
  },

  // Conversation list styles
  conversation: {
    item: {
      borderRadius: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&.Mui-selected': {
        backgroundColor: theme.palette.primary.light,
        '&:hover': {
          backgroundColor: theme.palette.primary.light,
        },
      }
    },
    unreadBadge: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
      fontSize: '0.75rem',
      height: 20,
      minWidth: 20
    }
  },

  // Contact list styles
  contactList: {
    section: {
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    sectionTitle: {
      fontWeight: 600,
      color: theme.palette.text.primary,
      marginBottom: theme.spacing(1),
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    careTeamSection: {
      backgroundColor: theme.palette.primary.light + '20', // 20% opacity
      borderLeft: `4px solid ${theme.palette.primary.main}`
    }
  },

  // Search and filter styles
  search: {
    input: {
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.spacing(3),
      '& .MuiOutlinedInput-root': {
        borderRadius: theme.spacing(3),
      }
    },
    chip: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&.MuiChip-outlined': {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main
      }
    }
  },

  // Layout and spacing
  layout: {
    mobileBreakpoint: 'md',
    sidebarWidth: 380,
    headerHeight: 64,
    composerHeight: 'auto',
    padding: {
      small: theme.spacing(1),
      medium: theme.spacing(2),
      large: theme.spacing(3)
    }
  },

  // Animation and transitions
  transitions: {
    standard: theme.transitions.create(['all'], {
      duration: theme.transitions.duration.standard,
    }),
    fast: theme.transitions.create(['all'], {
      duration: theme.transitions.duration.short,
    })
  }
});

// Helper functions for consistent styling
export const getChildContextStyles = (theme) => getMessagingTheme(theme).childContext;
export const getMessageBubbleStyles = (theme) => getMessagingTheme(theme).messageBubble;
export const getMessagingColors = (theme) => getMessagingTheme(theme).colors;