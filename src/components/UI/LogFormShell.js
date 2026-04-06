import React from 'react';
import {
  Box,
  Dialog,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

const LogFormShell = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  mobileBreakpoint = 'md',
  maxWidth = 'sm',
  forceDrawer = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));
  const useDrawer = forceDrawer || isMobile;

  const surfaceSx = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '100vw',
    boxSizing: 'border-box',
    overflow: 'hidden',
    bgcolor: 'background.paper',
    ...(isMobile
      ? {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          height: '85vh',
          maxHeight: '85vh',
        }
      : {
          borderRadius: 3,
          height: 'min(88dvh, 88vh)',
          maxHeight: 'min(88dvh, 88vh)',
        }),
  };

  const headerSx = {
    flex: 'none',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
    px: { xs: 3, sm: 4 },
    pt: { xs: 2.5, sm: 3 },
    pb: 2.5,
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
  };

  const bodySx = {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    px: { xs: 3, sm: 4 },
    pt: 2.75,
    pb: 2.5,
  };

  const footerSx = {
    flex: 'none',
    px: { xs: 3, sm: 4 },
    pb: { xs: 3, sm: 4 },
    pt: 0.5,
  };

  const titleBlock = (
    <Box sx={{ pr: 1, minWidth: 0, flex: 1 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: 'text.primary',
          lineHeight: 1.1,
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
        }}
      >
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.75, fontSize: { xs: '0.95rem', sm: '1rem' } }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );

  const closeButton = (
    <IconButton
      onClick={onClose}
      sx={{
        flexShrink: 0,
        width: 48,
        height: 48,
        bgcolor: 'rgba(0,0,0,0.04)',
        '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
      }}
    >
      <CloseIcon sx={{ fontSize: 30 }} />
    </IconButton>
  );

  const content = (
    <Box className="log-form-shell-print" sx={surfaceSx}>
      <Box sx={headerSx}>
        {titleBlock}
        {closeButton}
      </Box>
      <Box sx={bodySx}>{children}</Box>
      {footer ? <Box sx={footerSx}>{footer}</Box> : null}
    </Box>
  );

  if (useDrawer) {
    return (
        <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            ...surfaceSx,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden',
            height: '85vh',
            maxHeight: '85vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1.5 }}>
          <Box
            sx={{
              width: 46,
              height: 5,
              borderRadius: 999,
              bgcolor: 'rgba(148, 163, 184, 0.45)',
            }}
          />
        </Box>
        {content}
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      keepMounted
      PaperProps={{
        sx: {
          ...surfaceSx,
          width: '100%',
        },
      }}
    >
      {content}
    </Dialog>
  );
};

export default LogFormShell;
