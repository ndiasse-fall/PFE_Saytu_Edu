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
      className="users-drawer-root"
      slotProps={{
        paper: {
          className: 'users-drawer-paper',
        },
      }}
    >
      <Box className="panel users-drawer-panel" style={{ width }}>
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
