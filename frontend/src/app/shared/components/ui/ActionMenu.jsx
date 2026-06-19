import { IconButton, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'

export function ActionMenu({ ariaLabel, items }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  function handleOpen(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  function handleSelect(action) {
    handleClose()
    action?.()
  }

  return (
    <div className="users-actions-menu">
      <IconButton
        size="small"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={handleOpen}
        sx={{
          width: 34,
          height: 34,
          border: '1px solid var(--border)',
          borderRadius: '8px',
          backgroundColor: '#fbfcff',
          color: 'var(--text-strong)',
          '&:hover': {
            backgroundColor: 'var(--surface-elevated)',
          },
        }}
      >
        <i className="bi bi-three-dots-vertical" aria-hidden="true" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 168,
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 14px 28px rgba(15, 23, 42, 0.10)',
            },
          },
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => handleSelect(item.onClick)}
            sx={{
              fontSize: 12,
              fontWeight: 500,
              color: item.danger ? 'var(--danger)' : 'var(--text-strong)',
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
