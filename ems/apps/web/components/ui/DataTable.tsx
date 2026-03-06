import React from 'react'
import styles from './DataTable.module.css'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  width?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  keyField?: keyof T
  emptyMessage?: string
  loading?: boolean
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  keyField = 'id' as keyof T,
  emptyMessage = 'No records found.',
  loading = false,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} style={{ width: col.width }}>{col.header}</th>
              ))}
            </tr>
          </thead>
        </table>
        <div className={styles.skeletonRows}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className={styles.empty}>{emptyMessage}</div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} style={{ width: col.width }}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? styles.clickable : ''}
            >
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as keyof T] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
