'use client'

import React from 'react'
import { DataTable } from './DataTable'
import type { Column } from './DataTable'

/**
 * RendererDataTable — bridge between the renderer pipeline and the typed DataTable.
 *
 * The renderer wireframe defines columns as string[] (column keys).
 * DataTable expects Column<T>[] with { key, header, render? }.
 *
 * This adapter auto-generates Column<T>[] from string column names using
 * camelCase → Title Case conversion, then delegates to DataTable.
 */

function toTitleCase(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
}

interface RendererDataTableProps {
  /** Array of row objects from API data, injected via dataKey */
  data?: unknown[]
  /** Column keys — derived from wireframe block props */
  columns?: string[]
  /** Optional row click handler */
  onRowClick?: (row: Record<string, unknown>) => void
  /** Custom empty message */
  emptyMessage?: string
  loading?: boolean
}

export function RendererDataTable({
  data = [],
  columns = [],
  onRowClick,
  emptyMessage,
  loading = false,
}: RendererDataTableProps) {
  const rows = (data as Record<string, unknown>[]) ?? []

  // If no explicit columns given, derive from first row keys
  const colKeys: string[] = columns.length > 0
    ? columns
    : rows.length > 0
      ? Object.keys(rows[0]).slice(0, 8) // cap at 8 auto-derived columns
      : []

  const typedColumns: Column<Record<string, unknown>>[] = colKeys.map(key => ({
    key,
    header: toTitleCase(key),
  }))

  return (
    <DataTable
      columns={typedColumns}
      rows={rows}
      loading={loading}
      emptyMessage={emptyMessage}
      onRowClick={onRowClick}
    />
  )
}
