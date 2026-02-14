import { useTranslation } from "react-i18next";
import { User as UserIcon, Shield, LogOut } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Tab } from "@/components/dashboard";

interface DashboardSidebarProps {
  isAdmin: boolean | undefined;
  isSupport: boolean | undefined;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  adminSubTab: string;
  setAdminSubTab: (sub: string) => void;
  sidebarMainItems: any[];
  adminMenuItems: any[];
  userMenuItems: any[];
  user: any;
  handleLogout: () => void;
}

export function DashboardSidebar({
  isAdmin,
  isSupport,
  activeTab,
  setActiveTab,
  adminSubTab,
  setAdminSubTab,
  sidebarMainItems,
  adminMenuItems,
  userMenuItems,
  user,
  handleLogout,
}: DashboardSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="hidden lg:flex lg:flex-col h-full w-64 shrink-0 border-r border-border/50 bg-card z-40">
        <div className="flex flex-col h-full">
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {isAdmin ? (
              <>
                {sidebarMainItems.map((item: any) => {
                  const isActive = activeTab === 'admin' && adminSubTab === item.subTab;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab('admin' as Tab); setAdminSubTab(item.subTab); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        isActive 
                        ? 'bg-accent text-accent-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      data-testid={`button-sidebar-${item.id}`}
                    >
                      <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent-foreground' : 'text-accent'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                {sidebarMainItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      activeTab === item.id 
                      ? 'bg-accent text-accent-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                    data-testid={`button-sidebar-${item.id}`}
                    {...('tour' in item && item.tour ? { 'data-tour': item.tour } : {})}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'text-accent-foreground' : 'text-accent'}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
                
                {isSupport && (
                  <>
                    <div className="pt-2 pb-1 px-4">
                      <div className="border-t border-border/30" />
                    </div>
                    <button
                      onClick={() => setActiveTab('admin' as Tab)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        activeTab === 'admin' 
                        ? 'bg-accent text-accent-foreground shadow-sm' 
                        : 'text-accent hover:bg-accent/10'
                      }`}
                      data-testid="button-sidebar-admin"
                    >
                      <Shield className={`w-5 h-5 shrink-0 ${activeTab === 'admin' ? 'text-accent-foreground' : 'text-accent'}`} />
                      <span>{t('dashboard.menu.support')}</span>
                    </button>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="border-t border-border/30 px-3 py-3 space-y-1">
            <button
              onClick={() => setActiveTab('profile' as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                activeTab === 'profile' 
                ? 'bg-accent text-accent-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
              data-testid="button-sidebar-profile"
              data-tour="profile"
            >
              <UserIcon className={`w-5 h-5 shrink-0 ${activeTab === 'profile' ? 'text-accent-foreground' : 'text-accent'}`} />
              <span>{t('dashboard.tabs.profile')}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 dark:text-red-400 hover-elevate transition-colors"
              data-testid="button-sidebar-logout"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>{t("nav.logout")}</span>
            </button>

            <div className="flex items-center gap-3 px-4 py-3 mt-1 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-muted-foreground font-black text-sm">
                  {(user?.firstName || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
  );
}
