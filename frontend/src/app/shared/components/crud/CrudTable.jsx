import TablePagination from '@mui/material/TablePagination'
import { ActionMenu } from '../ui/ActionMenu'
import { CrudFilters } from './CrudFilters'

function readValue(item, key) {
  return key.split('.').reduce((value, part) => value?.[part], item)
}

export function CrudTable({
  items,
  columns,
  loading,
  emptyMessage,
  filters,
  filterFields,
  pagination,
  getActions,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onPageChange,
  onRowsPerPageChange,
}) {
  return (
    <section className="panel">
      <CrudFilters
        fields={filterFields}
        filters={filters}
        onChange={onFilterChange}
        onApply={onApplyFilters}
        onClear={onClearFilters}
      />

      {loading ? (
        <div className="screen-state">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="screen-state">{emptyMessage}</div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} scope="col">{column.label}</th>
                ))}
                {getActions ? <th scope="col">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => {
                    const value = readValue(item, column.key)

                    return (
                      <td key={column.key}>
                        {column.render
                          ? column.render(value, item)
                          : value ?? column.emptyValue ?? 'Non renseigné'}
                      </td>
                    )
                  })}
                  {getActions ? (
                    <td>
                      <ActionMenu
                        ariaLabel={`Actions pour l'élément ${item.id}`}
                        items={getActions(item)}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && pagination?.total > 0 ? (
        <TablePagination
          component="div"
          count={pagination.total}
          page={(pagination.currentPage ?? 1) - 1}
          rowsPerPage={pagination.perPage ?? 15}
          onPageChange={(_, page) => onPageChange(page + 1)}
          onRowsPerPageChange={(event) => {
            onRowsPerPageChange(Number(event.target.value))
          }}
          rowsPerPageOptions={[10, 15, 25, 50]}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
        />
      ) : null}
    </section>
  )
}
