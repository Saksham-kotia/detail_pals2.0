// ─── Detail Pals V2 — Admin Utilities ───────────────────────────────

export function formatCurrency(value: number | string): string {
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric',
      year:  'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month:  'short',
      day:    'numeric',
      year:   'numeric',
      hour:   'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
