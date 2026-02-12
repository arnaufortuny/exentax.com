import { useState, useMemo, useCallback } from "react";
import { formatDateShort, formatDateLong } from "@/lib/utils";

export type SearchFilter = 'all' | 'name' | 'email' | 'date' | 'invoiceId';

export interface DashboardSearchState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchFilter: SearchFilter;
  setSearchFilter: (f: SearchFilter) => void;
  matchesFilter: (fields: Record<string, string>, query: string, filter: SearchFilter) => boolean;
  filteredAdminOrders: any[] | undefined;
  filteredAdminUsers: any[] | undefined;
  filteredAdminMessages: any[] | undefined;
  filteredAdminDocuments: any[] | undefined;
}

export function useDashboardSearch(
  adminOrders: any[] | undefined,
  adminUsers: any[] | undefined,
  adminMessages: any[] | undefined,
  adminDocuments: any[] | undefined,
): DashboardSearchState {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');

  const matchesFilter = useCallback((fields: Record<string, string>, query: string, filter: SearchFilter) => {
    if (filter === 'all') return Object.values(fields).some(v => v.includes(query));
    if (filter === 'name') return (fields.name || '').includes(query);
    if (filter === 'email') return (fields.email || '').includes(query);
    if (filter === 'date') return (fields.date || '').includes(query) || (fields.dateLong || '').includes(query);
    if (filter === 'invoiceId') return (fields.invoiceId || '').includes(query) || (fields.orderId || '').includes(query);
    return false;
  }, []);

  const filteredAdminOrders = useMemo(() => {
    if (!searchQuery.trim() || !adminOrders) return adminOrders;
    const query = searchQuery.toLowerCase().trim();
    return adminOrders.filter((order: any) => {
      const app = order.application || order.maintenanceApplication;
      const fields: Record<string, string> = {
        name: ((order.user?.firstName || '') + ' ' + (order.user?.lastName || '')).toLowerCase(),
        email: (order.user?.email || '').toLowerCase(),
        date: order.createdAt ? formatDateShort(order.createdAt) : '',
        dateLong: order.createdAt ? formatDateLong(order.createdAt) : '',
        invoiceId: (order.invoiceNumber || '').toLowerCase(),
        orderId: (order.id?.toString() || ''),
        requestCode: (app?.requestCode || '').toLowerCase(),
        clientId: (order.user?.clientId || '').toLowerCase(),
        companyName: (app?.companyName || '').toLowerCase(),
      };
      return matchesFilter(fields, query, searchFilter);
    });
  }, [adminOrders, searchQuery, searchFilter, matchesFilter]);

  const filteredAdminUsers = useMemo(() => {
    if (!searchQuery.trim() || !adminUsers) return adminUsers;
    const query = searchQuery.toLowerCase().trim();
    return adminUsers.filter((u: any) => {
      const fields: Record<string, string> = {
        name: ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase(),
        email: (u.email || '').toLowerCase(),
        date: u.createdAt ? formatDateShort(u.createdAt) : '',
        clientId: (u.clientId || '').toLowerCase(),
        orderId: (u.id?.toString() || ''),
        invoiceId: '',
        phone: (u.phone || '').toLowerCase(),
      };
      return matchesFilter(fields, query, searchFilter);
    });
  }, [adminUsers, searchQuery, searchFilter, matchesFilter]);

  const filteredAdminMessages = useMemo(() => {
    if (!searchQuery.trim() || !adminMessages) return adminMessages;
    const query = searchQuery.toLowerCase().trim();
    return adminMessages.filter((msg: any) => {
      const fields: Record<string, string> = {
        name: (msg.name || '').toLowerCase(),
        email: (msg.email || '').toLowerCase(),
        date: msg.createdAt ? formatDateShort(msg.createdAt) : '',
        invoiceId: (msg.messageId || '').toLowerCase(),
        orderId: '',
        subject: (msg.subject || '').toLowerCase(),
      };
      return matchesFilter(fields, query, searchFilter);
    });
  }, [adminMessages, searchQuery, searchFilter, matchesFilter]);

  const filteredAdminDocuments = useMemo(() => {
    if (!searchQuery.trim() || !adminDocuments) return adminDocuments;
    const query = searchQuery.toLowerCase().trim();
    return adminDocuments.filter((doc: any) => {
      const fields: Record<string, string> = {
        name: ((doc.user?.firstName || '') + ' ' + (doc.user?.lastName || '')).toLowerCase(),
        email: (doc.user?.email || '').toLowerCase(),
        date: doc.uploadedAt ? formatDateShort(doc.uploadedAt) : '',
        invoiceId: (doc.fileName || '').toLowerCase(),
        orderId: (doc.id?.toString() || ''),
        companyName: (doc.application?.companyName || '').toLowerCase(),
      };
      return matchesFilter(fields, query, searchFilter);
    });
  }, [adminDocuments, searchQuery, searchFilter, matchesFilter]);

  return {
    searchQuery,
    setSearchQuery,
    searchFilter,
    setSearchFilter,
    matchesFilter,
    filteredAdminOrders,
    filteredAdminUsers,
    filteredAdminMessages,
    filteredAdminDocuments,
  };
}
