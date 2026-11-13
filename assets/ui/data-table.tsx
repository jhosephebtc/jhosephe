import { useId, useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ShaderSurface } from './shader-surface';
import { cn } from './utils';
import { normalizeSurfaceMaterial, surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface DataTableColumn<T extends Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  numeric?: boolean;
  render?: (row: T) => ReactNode;
}

/** Semantic responsive data table with sortable columns, sticky headers, and container card fallback. */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  caption,
  label = 'Data table',
  initialSortKey,
  initialSortDirection = 'asc',
  stickyHeader = true,
  material = 'solid',
  className,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey?: (row: T, index: number) => string;
  caption?: string;
  label?: string;
  initialSortKey?: keyof T & string;
  initialSortDirection?: 'asc' | 'desc';
  stickyHeader?: boolean;
  material?: SurfaceMaterial;
  className?: string;
}) {
  const captionId = `jh-table-caption-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey ?? null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSortDirection);

  const finish = normalizeSurfaceMaterial(material);
  const matAttr = surfaceMaterialAttr(material);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(current => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div
      className={cn(
        'jh-data-table',
        stickyHeader && 'jh-data-table--sticky',
        finish === 'liquid' && 'jh-data-table--liquid',
        className,
      )}
      data-jh-material={matAttr}
    >
      {finish === 'liquid' ? <ShaderSurface /> : null}
      <div
        className="jh-data-table__scroll"
        role="region"
        tabIndex={0}
        aria-labelledby={caption ? captionId : undefined}
        aria-label={caption ? undefined : label}
      >
        <table className="jh-data-table__table">
          {caption ? (
            <caption id={captionId} className="jh-data-table__caption">
              <span className="jh-data-table__caption-inner">
                <span>{caption}</span>
                <span className="jh-data-table__count">{rows.length} rows</span>
              </span>
            </caption>
          ) : null}
          <thead>
            <tr>
              {columns.map(col => {
                const isSorted = sortKey === col.key;
                const ariaSort = col.sortable
                  ? isSorted
                    ? sortDir === 'asc' ? 'ascending' : 'descending'
                    : 'none'
                  : undefined;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      'jh-data-table__th',
                      col.align === 'right' && 'is-right',
                      col.numeric && 'is-numeric',
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className={cn('jh-data-table__sort', isSorted && 'is-active')}
                        onClick={() => toggleSort(col.key)}
                      >
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortDir === 'asc'
                            ? <ArrowUp size={12} strokeWidth={1.8} aria-hidden="true" />
                            : <ArrowDown size={12} strokeWidth={1.8} aria-hidden="true" />
                        ) : (
                          <ArrowUpDown size={12} strokeWidth={1.6} aria-hidden="true" className="jh-data-table__sort-idle" />
                        )}
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => (
              <tr key={rowKey ? rowKey(row, rowIndex) : String(rowIndex)} className="jh-data-table__row">
                {columns.map((col, colIndex) => {
                  const raw = row[col.key];
                  const cellContent = col.render ? col.render(row) : raw === null || raw === undefined ? '—' : String(raw);
                  const cellClass = cn(
                    'jh-data-table__cell',
                    col.align === 'right' && 'is-right',
                    col.numeric && 'is-numeric',
                  );
                  if (colIndex === 0) {
                    return (
                      <th key={col.key} scope="row" data-label={col.label} className={cellClass}>
                        {cellContent}
                      </th>
                    );
                  }
                  return (
                    <td key={col.key} data-label={col.label} className={cellClass}>
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
