import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useTranslation } from "react-i18next";
import { BarChart3, Package, MessageSquare, AlertCircle, Users, Receipt, Calendar, FileText, Tag, ClipboardList, Key, BellRing, Mail, CreditCard, Calculator, Shield } from "@/components/icons";
import type { Tab } from "@/components/dashboard/types";

export type AdminSubTab = 'dashboard' | 'orders' | 'communications' | 'incomplete' | 'users' | 'billing' | 'calendar' | 'docs' | 'descuentos' | 'activity' | 'roles';

export interface DashboardNavigationState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  adminSubTab: AdminSubTab;
  setAdminSubTab: (sub: AdminSubTab) => void;
  commSubTab: 'inbox' | 'agenda';
  setCommSubTab: (sub: 'inbox' | 'agenda') => void;
  usersSubTab: 'users' | 'newsletter';
  setUsersSubTab: (sub: 'users' | 'newsletter') => void;
  billingSubTab: 'invoices' | 'accounting' | 'payment-methods';
  setBillingSubTab: (sub: 'invoices' | 'accounting' | 'payment-methods') => void;
  userMenuItems: any[];
  adminMenuItems: any[];
  sidebarMainItems: any[];
  menuItems: any[];
  isPendingAccount: boolean;
  isAdminTab: boolean;
  navigateToTab: (tab: Tab, sub?: string) => void;
}

export function useDashboardNavigation(user: any): DashboardNavigationState {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const searchString = useSearch();

  const isAdmin = !!user?.isAdmin;
  const isSupport = !!user?.isSupport;
  const isPendingAccount = user?.accountStatus === 'pending';

  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const urlTab = params.get('tab') as Tab | null;
  const urlSubTab = params.get('subtab') as AdminSubTab | null;

  const defaultTab: Tab = isAdmin ? 'admin' : 'services';
  const defaultAdminSub: AdminSubTab = isSupport && !isAdmin ? 'orders' : 'dashboard';

  const [activeTab, setActiveTabRaw] = useState<Tab>(urlTab || defaultTab);
  const [adminSubTab, setAdminSubTabRaw] = useState<AdminSubTab>(urlSubTab || defaultAdminSub);
  const [commSubTab, setCommSubTab] = useState<'inbox' | 'agenda'>('inbox');
  const [usersSubTab, setUsersSubTab] = useState<'users' | 'newsletter'>('users');
  const [billingSubTab, setBillingSubTab] = useState<'invoices' | 'accounting' | 'payment-methods'>('invoices');
  const initialSync = useRef(false);

  useEffect(() => {
    if (!initialSync.current && urlTab) {
      setActiveTabRaw(urlTab);
      if (urlSubTab) setAdminSubTabRaw(urlSubTab);
      initialSync.current = true;
    }
  }, [urlTab, urlSubTab]);

  const updateUrl = useCallback((tab: Tab, sub?: string) => {
    const p = new URLSearchParams();
    p.set('tab', tab);
    if (tab === 'admin' && sub) p.set('subtab', sub);
    const newSearch = p.toString();
    const currentPath = window.location.pathname;
    const targetUrl = `${currentPath}?${newSearch}`;
    window.history.replaceState(null, '', targetUrl);
  }, []);

  const setActiveTab = useCallback((tab: Tab) => {
    setActiveTabRaw(tab);
    if (tab === 'admin') {
      updateUrl(tab, adminSubTab);
    } else {
      updateUrl(tab);
    }
  }, [adminSubTab, updateUrl]);

  const setAdminSubTab = useCallback((sub: AdminSubTab) => {
    setAdminSubTabRaw(sub);
    updateUrl('admin', sub);
  }, [updateUrl]);

  const navigateToTab = useCallback((tab: Tab, sub?: string) => {
    setActiveTabRaw(tab);
    if (tab === 'admin' && sub) {
      setAdminSubTabRaw(sub as AdminSubTab);
      updateUrl(tab, sub);
    } else {
      updateUrl(tab);
    }
  }, [updateUrl]);

  useEffect(() => {
    if (isPendingAccount && !['services', 'notifications', 'profile'].includes(activeTab)) {
      setActiveTab('services');
    }
  }, [isPendingAccount, activeTab, setActiveTab]);

  useEffect(() => {
    if (isAdmin && activeTab !== 'admin') {
      setActiveTab('admin');
      setAdminSubTab('dashboard');
    }
  }, [isAdmin]);

  const pendingAllowedTabs = ['services', 'notifications', 'profile'];

  const userMenuItems = useMemo(() => [
    { id: 'services', label: t('dashboard.tabs.services'), icon: Package, mobileLabel: t('dashboard.tabs.servicesMobile'), tour: 'orders' },
    { id: 'consultations', label: t('dashboard.tabs.consultations'), icon: MessageSquare, mobileLabel: t('dashboard.tabs.consultationsMobile') },
    { id: 'notifications', label: t('dashboard.tabs.notifications'), icon: BellRing, mobileLabel: t('dashboard.tabs.notificationsMobile') },
    { id: 'messages', label: t('dashboard.tabs.messages'), icon: Mail, mobileLabel: t('dashboard.tabs.messagesMobile'), tour: 'messages' },
    { id: 'documents', label: t('dashboard.tabs.documents'), icon: FileText, mobileLabel: t('dashboard.tabs.documentsMobile') },
    { id: 'payments', label: t('dashboard.tabs.payments'), icon: CreditCard, mobileLabel: t('dashboard.tabs.paymentsMobile') },
    { id: 'calendar', label: t('dashboard.tabs.calendar'), icon: Calendar, mobileLabel: t('dashboard.tabs.calendarMobile'), tour: 'calendar' },
    { id: 'tools', label: t('dashboard.tabs.tools'), icon: Calculator, mobileLabel: t('dashboard.tabs.toolsMobile') },
    { id: 'profile', label: t('dashboard.tabs.profile'), icon: Users, mobileLabel: t('dashboard.tabs.profileMobile'), tour: 'profile' },
  ], [t]);

  const adminMenuItems = useMemo(() => {
    const allItems = [
      { id: 'admin-dashboard', subTab: 'dashboard', label: t('dashboard.admin.tabs.metrics'), icon: BarChart3, mobileLabel: t('dashboard.admin.tabs.metrics'), adminOnly: true },
      { id: 'admin-orders', subTab: 'orders', label: t('dashboard.admin.tabs.orders'), icon: Package, mobileLabel: t('dashboard.admin.tabs.orders'), adminOnly: false },
      { id: 'admin-comms', subTab: 'communications', label: t('dashboard.admin.tabs.communications'), icon: MessageSquare, mobileLabel: t('dashboard.admin.tabs.communications'), adminOnly: false },
      { id: 'admin-incomplete', subTab: 'incomplete', label: t('dashboard.admin.tabs.incomplete'), icon: AlertCircle, mobileLabel: t('dashboard.admin.tabs.incomplete'), adminOnly: true },
      { id: 'admin-users', subTab: 'users', label: t('dashboard.admin.tabs.clients'), icon: Users, mobileLabel: t('dashboard.admin.tabs.clients'), adminOnly: true },
      { id: 'admin-billing', subTab: 'billing', label: t('dashboard.admin.tabs.billing'), icon: Receipt, mobileLabel: t('dashboard.admin.tabs.billing'), adminOnly: true },
      { id: 'admin-calendar', subTab: 'calendar', label: t('dashboard.calendar.dates'), icon: Calendar, mobileLabel: t('dashboard.calendar.dates'), adminOnly: false },
      { id: 'admin-docs', subTab: 'docs', label: t('dashboard.admin.tabs.docs'), icon: FileText, mobileLabel: t('dashboard.admin.tabs.docs'), adminOnly: false },
      { id: 'admin-discounts', subTab: 'descuentos', label: t('dashboard.admin.tabs.discounts'), icon: Tag, mobileLabel: t('dashboard.admin.tabs.discounts'), adminOnly: true },
      { id: 'admin-activity', subTab: 'activity', label: t('dashboard.admin.tabs.activity'), icon: ClipboardList, mobileLabel: t('dashboard.admin.tabs.activity'), adminOnly: true },
      { id: 'admin-roles', subTab: 'roles', label: t('dashboard.admin.tabs.roles') || 'Roles', icon: Key, mobileLabel: t('dashboard.admin.tabs.roles') || 'Roles', adminOnly: true },
    ];
    return allItems.filter(item => isAdmin || !item.adminOnly);
  }, [t, isAdmin]);

  const sidebarMainItems = useMemo(() => {
    if (isAdmin) return adminMenuItems;
    const items = userMenuItems.filter(item => item.id !== 'profile');
    if (isPendingAccount) return items.filter(item => pendingAllowedTabs.includes(item.id));
    return items;
  }, [isAdmin, adminMenuItems, userMenuItems, isPendingAccount]);

  const menuItems = isAdmin ? adminMenuItems : (isPendingAccount ? userMenuItems.filter(item => pendingAllowedTabs.includes(item.id)) : userMenuItems);

  const isAdminTab = activeTab === 'admin';

  return {
    activeTab,
    setActiveTab,
    adminSubTab,
    setAdminSubTab,
    commSubTab,
    setCommSubTab,
    usersSubTab,
    setUsersSubTab,
    billingSubTab,
    setBillingSubTab,
    userMenuItems,
    adminMenuItems,
    sidebarMainItems,
    menuItems,
    isPendingAccount,
    isAdminTab,
    navigateToTab,
  };
}
