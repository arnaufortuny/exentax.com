import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useDashboardNavigation, type DashboardNavigationState } from "./hooks/useDashboardNavigation";
import { useDashboardSearch, type DashboardSearchState } from "./hooks/useDashboardSearch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getCsrfToken, setStoredAuthToken } from "@/lib/queryClient";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Tab, AdminUserData, DiscountCode } from "@/components/dashboard/types";

export interface FormMessage {
  type: 'error' | 'success' | 'info';
  text: string;
}

export interface DashboardContextValue {
  user: any;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: any;
  refetchAuth: () => void;
  isAdmin: boolean;
  isSupport: boolean;
  isStaff: boolean;
  canEdit: boolean;
  formMessage: FormMessage | null;
  setFormMessage: (msg: FormMessage | null) => void;
  nav: DashboardNavigationState;
  search: DashboardSearchState;
  orders: any[] | undefined;
  ordersLoading: boolean;
  clientInvoices: any[] | undefined;
  messagesData: any[] | undefined;
  notifications: any[] | undefined;
  notificationsLoading: boolean;
  userDocuments: any[] | undefined;
  selectedOrderEvents: any[] | undefined;
  adminOrders: any[] | undefined;
  adminUsers: any[] | undefined;
  adminMessages: any[] | undefined;
  adminDocuments: any[] | undefined;
  adminInvoices: any[] | undefined;
  adminStats: any;
  incompleteApps: any;
  discountCodes: DiscountCode[] | undefined;
  guestVisitors: any;
  paymentAccountsList: any[] | undefined;
  adminNewsletterSubs: any[] | undefined;
  refetchDiscountCodes: () => void;
  refetchPaymentAccounts: () => void;
  refetchNewsletterSubs: () => void;
  refetchGuests: () => void;
  tn: (text: string) => string;
  showConfirm: any;
  confirmDialogProps: any;
  handleLogout: () => void;
  draftOrders: any[];
  activeOrders: any[];
}

const DashboardCtx = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, error: authError, refetch: refetchAuth } = useAuth();
  const { t } = useTranslation();

  const [formMessage, setFormMessage] = useState<FormMessage | null>(null);
  const { confirm: showConfirm, dialogProps: confirmDialogProps } = useConfirmDialog();

  const nav = useDashboardNavigation(user);
  const isAdmin = !!user?.isAdmin;
  const isSupport = !!user?.isSupport;
  const isStaff = isAdmin || isSupport;
  const canEdit = user?.accountStatus === 'active' || user?.accountStatus === 'vip';

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const tn = useCallback((text: string) => {
    if (!text || !text.startsWith('i18n:')) return text;
    const rest = text.substring(5);
    const sepIdx = rest.indexOf('::');
    if (sepIdx > -1) {
      const key = rest.substring(0, sepIdx);
      try {
        const params = JSON.parse(rest.substring(sepIdx + 2));
        const resolvedParams: Record<string, string> = {};
        for (const [k, v] of Object.entries(params)) {
          if (typeof v === 'string' && v.startsWith('@')) {
            const nestedKey = v.substring(1);
            const translated = t(nestedKey);
            resolvedParams[k] = typeof translated === 'string' && translated !== nestedKey ? translated : v.substring(1);
          } else {
            resolvedParams[k] = String(v);
          }
        }
        const result = t(key, resolvedParams);
        return typeof result === 'string' && result !== key ? result : text;
      } catch {
        const result = t(key);
        return typeof result === 'string' && result !== key ? result : text;
      }
    }
    const result = t(rest);
    return typeof result === 'string' && result !== rest ? result : text;
  }, [t]);

  const handleLogout = useCallback(() => {
    setStoredAuthToken(null);
    apiRequest("POST", "/api/auth/logout").then(() => window.location.href = "/");
  }, []);

  const [isTabFocused, setIsTabFocused] = useState(() => typeof document !== 'undefined' ? document.hasFocus() : true);
  useEffect(() => {
    const onFocus = () => setIsTabFocused(true);
    const onBlur = () => setIsTabFocused(false);
    const onVisChange = () => setIsTabFocused(!document.hidden);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  const isAdminTab = nav.isAdminTab;

  const { data: orders, isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const { data: clientInvoices } = useQuery<any[]>({
    queryKey: ["/api/user/invoices"],
    enabled: isAuthenticated && !isAdmin,
    refetchInterval: isTabFocused && nav.activeTab === 'payments' ? 30000 : false,
  });

  const { data: messagesData } = useQuery<any[]>({
    queryKey: ["/api/messages"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const selectedOrderId = orders?.[0]?.id;
  const { data: selectedOrderEvents } = useQuery<any[]>({
    queryKey: ["/api/orders", selectedOrderId, "events"],
    enabled: !!selectedOrderId,
    staleTime: 1000 * 60 * 2,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<any[]>({
    queryKey: ["/api/user/notifications"],
    enabled: isAuthenticated,
    refetchInterval: isTabFocused && nav.activeTab === 'notifications' ? 30000 : false,
  });

  const { data: userDocuments } = useQuery<any[]>({
    queryKey: ["/api/user/documents"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminOrders } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: isStaff && (isAdminTab && (nav.adminSubTab === 'orders' || nav.adminSubTab === 'dashboard' || nav.adminSubTab === 'calendar')),
    staleTime: 1000 * 60 * 2,
  });

  const { data: incompleteApps } = useQuery<{ llc: any[]; maintenance: any[] }>({
    queryKey: ["/api/admin/incomplete-applications"],
    enabled: isAdmin && isAdminTab && nav.adminSubTab === 'incomplete',
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin && isAdminTab && (nav.adminSubTab === 'users' || nav.adminSubTab === 'dashboard' || nav.adminSubTab === 'orders'),
    staleTime: 1000 * 60 * 3,
  });

  const { data: adminNewsletterSubs, refetch: refetchNewsletterSubs } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletter"],
    enabled: isAdmin && isAdminTab && nav.adminSubTab === 'communications',
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminDocuments } = useQuery<any[]>({
    queryKey: ["/api/admin/documents"],
    enabled: isStaff && isAdminTab && (nav.adminSubTab === 'docs' || nav.adminSubTab === 'dashboard'),
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminInvoices } = useQuery<any[]>({
    queryKey: ["/api/admin/invoices"],
    enabled: isAdmin && isAdminTab && (nav.adminSubTab === 'billing' || nav.adminSubTab === 'orders'),
    refetchInterval: isTabFocused && nav.adminSubTab === 'billing' ? 30000 : false,
  });

  const { data: adminStats } = useQuery<any>({
    queryKey: ["/api/admin/system-stats"],
    enabled: isAdmin && isAdminTab && nav.adminSubTab === 'dashboard',
    staleTime: 1000 * 60 * 2,
  });

  const { data: adminMessages } = useQuery<any[]>({
    queryKey: ["/api/admin/messages"],
    enabled: isStaff && isAdminTab && (nav.adminSubTab === 'communications' || nav.adminSubTab === 'dashboard'),
    staleTime: 1000 * 60 * 2,
  });

  const { data: discountCodes, refetch: refetchDiscountCodes } = useQuery<DiscountCode[]>({
    queryKey: ["/api/admin/discount-codes"],
    enabled: isAdmin && isAdminTab && nav.adminSubTab === 'descuentos',
    staleTime: 1000 * 60 * 2,
  });

  const { data: guestVisitors, refetch: refetchGuests } = useQuery({
    queryKey: ["/api/admin/guests"],
    enabled: isAdmin && isAdminTab && nav.adminSubTab === 'dashboard',
    staleTime: 1000 * 60 * 2,
  });

  const { data: paymentAccountsList, refetch: refetchPaymentAccounts } = useQuery<any[]>({
    queryKey: ["/api/admin/payment-accounts"],
    enabled: isAdmin && isAdminTab && (nav.adminSubTab === 'billing' || nav.adminSubTab === 'orders'),
    staleTime: 1000 * 60 * 2,
  });

  const searchState = useDashboardSearch(adminOrders, adminUsers, adminMessages, adminDocuments);

  const draftOrders = useMemo(() =>
    orders?.filter(o => o.status === 'draft' || o.application?.status === 'draft' || o.maintenanceApplication?.status === 'draft') || [],
    [orders]
  );

  const activeOrders = useMemo(() =>
    orders?.filter(o => o.status !== 'cancelled' && o.status !== 'completed').slice(0, 4) || [],
    [orders]
  );

  const value = useMemo<DashboardContextValue>(() => ({
    user,
    isAuthenticated,
    authLoading,
    authError,
    refetchAuth,
    isAdmin,
    isSupport,
    isStaff,
    canEdit,
    formMessage,
    setFormMessage,
    nav,
    search: searchState,
    orders,
    ordersLoading,
    clientInvoices,
    messagesData,
    notifications,
    notificationsLoading,
    userDocuments,
    selectedOrderEvents,
    adminOrders,
    adminUsers,
    adminMessages,
    adminDocuments,
    adminInvoices,
    adminStats,
    incompleteApps,
    discountCodes,
    guestVisitors,
    paymentAccountsList,
    adminNewsletterSubs,
    refetchDiscountCodes,
    refetchPaymentAccounts,
    refetchNewsletterSubs,
    refetchGuests,
    tn,
    showConfirm,
    confirmDialogProps,
    handleLogout,
    draftOrders,
    activeOrders,
  }), [
    user, isAuthenticated, authLoading, authError, refetchAuth,
    isAdmin, isSupport, isStaff, canEdit,
    formMessage, nav, searchState,
    orders, ordersLoading, clientInvoices, messagesData,
    notifications, notificationsLoading, userDocuments, selectedOrderEvents,
    adminOrders, adminUsers, adminMessages, adminDocuments,
    adminInvoices, adminStats, incompleteApps, discountCodes,
    guestVisitors, paymentAccountsList, adminNewsletterSubs,
    refetchDiscountCodes, refetchPaymentAccounts, refetchNewsletterSubs, refetchGuests,
    tn, showConfirm, confirmDialogProps, handleLogout,
    draftOrders, activeOrders,
  ]);

  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}
