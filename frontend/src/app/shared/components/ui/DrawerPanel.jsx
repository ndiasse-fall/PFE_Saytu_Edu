import { Box, Drawer } from '@mui/material'

export function DrawerPanel({
  open,
  onClose,
  width = 460,
  title,
  subtitle = '',
  headerAction = null,
  children,
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', sm: 'auto' },
            minWidth: { sm: 400 },
            maxWidth: { sm: 800 },
            backgroundColor: 'var(--bg)',
            p: { xs: 1.5, sm: 2.5 },
            borderLeft: '1px solid var(--border)',
          },
        },
      }}
    >
      <Box className="panel users-drawer-panel" sx={{ minHeight: { xs: 'calc(100vh - 24px)', sm: 'calc(100vh - 40px)' }, width: '100%', boxShadow: 'none', m: 0 }}>
        <div className="panel-header">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p className="muted">{subtitle}</p> : null}
          </div>
          {headerAction}
        </div>
        {children}
      </Box>
    </Drawer>
  )
}
