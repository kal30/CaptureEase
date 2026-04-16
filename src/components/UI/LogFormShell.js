import React, { useEffect, useRef } from 'react';
import {
  Box,
  Dialog,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LogSheetTitle from './LogSheetTitle';
import colors from '../../assets/theme/colors';

const LogFormShell = ({
  open,
  onClose,
  title,
  subtitle,
  titleBadge,
  headerContent,
  compactTitle = false,
  children,
  footer,
  bodySx: bodySxOverride = {},
  surfaceSx: surfaceSxOverride = {},
  mobileBreakpoint = 'md',
  maxWidth = 'sm',
  forceDrawer = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));
  const useDrawer = forceDrawer || isMobile;
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const scrollNode = bodyRef.current;
    if (!scrollNode) {
      return;
    }

    requestAnimationFrame(() => {
      if (typeof scrollNode.scrollTo === "function") {
        scrollNode.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      scrollNode.scrollTop = 0;
    });
  }, [open]);

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
    ...surfaceSxOverride,
  };

  const headerSx = {
    flex: 'none',
    px: { xs: 3, sm: 4 },
    pt: { xs: 2.5, sm: 3 },
    pb: 2.25,
    borderBottom: `1px solid ${colors.app.cards.border}`,
  };

  const bodyStyles = {
    flex: '1 1 auto',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    px: { xs: 1.5, sm: 4 },
    pt: 2.75,
    pb: 2.5,
  };

  const footerSx = {
    flex: 'none',
    px: { xs: 1.5, sm: 4 },
    pb: { xs: 3, sm: 4 },
    pt: 0.5,
  };

  const content = (
    <Box className="log-form-shell-print" sx={surfaceSx}>
      <Box sx={headerSx}>
        <LogSheetTitle
          title={title}
          titleBadge={titleBadge}
          subtitle={subtitle}
          onClose={onClose}
          compactTitle={compactTitle}
        />
        {headerContent ? <Box sx={{ mt: 1.5 }}>{headerContent}</Box> : null}
      </Box>
      <Box ref={bodyRef} sx={{ ...bodyStyles, ...bodySxOverride }}>{children}</Box>
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
            overflowY: 'hidden',
            height: '85vh',
            maxHeight: '85vh',
            ...surfaceSxOverride,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1.5 }}>
          <Box
            sx={{
              width: 46,
              height: 5,
              borderRadius: 999,
              bgcolor: '#b8c0cc',
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
          overflowY: 'hidden',
          ...surfaceSxOverride,
        },
      }}
    >
      {content}
    </Dialog>
  );
};

export default LogFormShell;
