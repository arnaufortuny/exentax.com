export function getOrderStatusLabel(status: string, t: (key: string) => string): { label: string; className: string } {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: t('dashboard.orders.status.pending'), className: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' },
    paid: { label: t('dashboard.orders.status.paid'), className: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
    processing: { label: t('dashboard.orders.status.processing'), className: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' },
    documents_ready: { label: t('dashboard.orders.status.documents_ready'), className: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300' },
    completed: { label: t('dashboard.orders.status.completed'), className: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
    cancelled: { label: t('dashboard.orders.status.cancelled'), className: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 font-black' },
    filed: { label: t('dashboard.orders.status.filed'), className: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300' },
    draft: { label: t('dashboard.orders.status.draft'), className: 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300' },
  };
  return statusMap[status] || { label: status, className: 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300' };
}

export function formatDate(dateString: string, locale: string = 'es-ES'): string {
  return new Date(dateString).toLocaleDateString(locale);
}

export function calculateHoursRemaining(abandonedAt: string): number | null {
  if (!abandonedAt) return null;
  return Math.max(0, Math.round((48 - ((Date.now() - new Date(abandonedAt).getTime()) / 3600000))));
}
