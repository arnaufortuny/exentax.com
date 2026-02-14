import { memo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { AlertCircle, ChevronRight, Calendar, FileText, CheckCircle2, Clock, AlertTriangle, Building2, MapPin, Users, Shield, Package } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LLCProgressWidget } from "@/components/llc-progress-widget";
import { getOrderStatusLabel } from "./types";
import { formatDate } from "@/lib/utils";

interface ServicesTabProps {
  orders: any[] | undefined;
  draftOrders: any[];
  activeOrders: any[];
  userName?: string;
}

function getAgentStatusBadge(status: string | null | undefined, t: any) {
  switch (status) {
    case 'active':
      return <Badge className="bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent text-[9px]" data-testid="badge-agent-active"><CheckCircle2 className="w-3 h-3 mr-1" />{t('dashboard.llcDetails.agentActive')}</Badge>;
    case 'pending_renewal':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-[9px]" data-testid="badge-agent-pending"><Clock className="w-3 h-3 mr-1" />{t('dashboard.llcDetails.agentPendingRenewal')}</Badge>;
    case 'expired':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-[9px]" data-testid="badge-agent-expired"><AlertTriangle className="w-3 h-3 mr-1" />{t('dashboard.llcDetails.agentExpired')}</Badge>;
    default:
      return <Badge className="bg-muted text-foreground dark:bg-muted dark:text-muted-foreground text-[9px]" data-testid="badge-agent-unknown">{t('dashboard.llcDetails.agentPending')}</Badge>;
  }
}

function getBoiStatusBadge(status: string | null | undefined, t: any) {
  switch (status) {
    case 'filed':
      return <Badge className="bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent text-[9px]" data-testid="badge-boi-filed"><CheckCircle2 className="w-3 h-3 mr-1" />{t('dashboard.llcDetails.boiFiled')}</Badge>;
    case 'update_required':
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-[9px]" data-testid="badge-boi-update"><AlertTriangle className="w-3 h-3 mr-1" />{t('dashboard.llcDetails.boiUpdateRequired')}</Badge>;
    case 'exempt':
      return <Badge className="bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent text-[9px]" data-testid="badge-boi-exempt"><Shield className="w-3 h-3 mr-1" />{t('dashboard.llcDetails.boiExempt')}</Badge>;
    default:
      return <Badge className="bg-muted text-foreground dark:bg-muted dark:text-muted-foreground text-[9px]" data-testid="badge-boi-pending"><Clock className="w-3 h-3 mr-1" />{t('dashboard.llcDetails.boiPending')}</Badge>;
  }
}

export const ServicesTab = memo(function ServicesTab({ orders, draftOrders, activeOrders, userName }: ServicesTabProps) {
  const { t } = useTranslation();
  
  const completedOrders = orders?.filter(o => o.status === 'completed' && o.application) || [];
  const inProgressOrders = orders?.filter(o => 
    o.status !== 'completed' && o.status !== 'cancelled' && o.status !== 'draft'
  ) || [];

  return (
    <div key="services" className="space-y-6">
      {userName && (
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight" data-testid="text-welcome-greeting">
          {t('dashboard.welcome', { name: userName })}
        </h1>
      )}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.services.title')}</h2>
        <p className="text-base text-muted-foreground mt-1">{t('dashboard.services.subtitle')}</p>
      </div>
      
      {draftOrders.map((order) => {
        const abandonedAt = order.application?.abandonedAt || order.maintenanceApplication?.abandonedAt;
        const hoursRemaining = abandonedAt ? Math.max(0, Math.round((48 - ((Date.now() - new Date(abandonedAt).getTime()) / 3600000)))) : null;
        return (
        <div key={`draft-banner-${order.id}`} className="rounded-2xl shadow-md bg-gradient-to-r from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/15 overflow-hidden flex" data-testid={`banner-pending-application-${order.id}`}>
          <div className="w-1 bg-yellow-500 flex-shrink-0" />
          <div className="p-4 md:p-5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-base font-black text-foreground">{t('dashboard.services.pendingApplication')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.maintenanceApplication 
                      ? `${t('dashboard.services.maintenance')} ${order.maintenanceApplication.state || ''}`
                      : order.application?.companyName 
                        ? (order.application.companyName.trim().toUpperCase().endsWith('LLC') ? order.application.companyName : `${order.application.companyName} LLC`)
                        : `${order.application?.state || t('dashboard.services.yourLLC')}`
                    }
                    {hoursRemaining !== null && (
                      <span className="text-yellow-600 dark:text-yellow-400 font-black ml-2">
                        · {t('dashboard.services.deletedIn', { hours: hoursRemaining })}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Link href={order.maintenanceApplication ? "/llc/maintenance" : "/llc/formation"} data-testid={`link-continue-application-${order.id}`}>
                <Button className="bg-accent text-primary font-black rounded-full" size="sm" data-testid={`button-continue-application-${order.id}`}>
                  {t('dashboard.services.continueApplication')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );})}
      
      {(!orders || orders.length === 0) ? (
        <Card className="rounded-2xl shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="card-empty-services">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-accent" />
            <div>
              <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight" data-testid="text-empty-title">{t('dashboard.services.empty')}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center" data-testid="text-empty-description">{t('dashboard.services.emptyDescription')}</p>
            </div>
            <Link href="/servicios#pricing" data-testid="link-view-plans">
              <Button className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-view-packs">
                {t('dashboard.services.viewPlans')}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Completed LLCs - Full Details */}
          {completedOrders.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" />
                {t('dashboard.llcDetails.myLLCs')}
              </h3>
              
              {completedOrders.map((order) => {
                const app = order.application;
                return (
                  <Card key={`completed-${order.id}`} className="rounded-2xl shadow-md bg-white dark:bg-card overflow-hidden" data-testid={`card-completed-llc-${order.id}`}>
                    <div className="bg-gradient-to-r from-accent/5 to-accent/10 dark:from-accent/10 dark:to-accent/15 p-4 border-b border-accent/20 dark:border-accent/20">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-5 h-5 text-accent dark:text-accent" />
                            <h4 className="text-lg font-black text-foreground" data-testid={`text-company-name-${order.id}`}>{app.companyName?.trim().toUpperCase().endsWith('LLC') ? app.companyName : `${app.companyName} LLC`}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground" data-testid={`text-llc-info-${order.id}`}>
                            <span data-testid={`text-state-${order.id}`}>{app.state}</span> · {t('dashboard.llcDetails.orderCode')}: <span data-testid={`text-order-code-${order.id}`}>{app.requestCode}</span>
                          </p>
                        </div>
                        <Badge className="bg-accent text-white font-bold text-xs self-start sm:self-auto" data-testid={`badge-completed-${order.id}`}>
                          {t('dashboard.llcDetails.active')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {/* LLC Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {app.ein && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted dark:bg-muted/50" data-testid={`llc-ein-${order.id}`}>
                            <FileText className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('dashboard.llcDetails.ein')}</p>
                              <p className="text-sm font-bold text-foreground">{app.ein}</p>
                            </div>
                          </div>
                        )}
                        
                        {app.registrationNumber && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted dark:bg-muted/50" data-testid={`llc-registration-${order.id}`}>
                            <FileText className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('dashboard.llcDetails.registrationNumber')}</p>
                              <p className="text-sm font-bold text-foreground">{app.registrationNumber}</p>
                            </div>
                          </div>
                        )}
                        
                        {app.llcAddress && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted dark:bg-muted/50 sm:col-span-2" data-testid={`llc-address-${order.id}`}>
                            <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('dashboard.llcDetails.address')}</p>
                              <p className="text-sm font-medium text-foreground">{app.llcAddress}</p>
                            </div>
                          </div>
                        )}
                        
                        {app.ownerSharePercentage && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted dark:bg-muted/50" data-testid={`llc-shares-${order.id}`}>
                            <Users className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{t('dashboard.llcDetails.ownership')}</p>
                              <p className="text-sm font-bold text-foreground">{app.ownerSharePercentage}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">{t('dashboard.llcDetails.registeredAgent')}:</span>
                          {getAgentStatusBadge(app.agentStatus, t)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">{t('dashboard.llcDetails.boi')}:</span>
                          {getBoiStatusBadge(app.boiStatus, t)}
                        </div>
                      </div>
                      
                      {/* Important Dates */}
                      {(app.llcCreatedDate || app.agentRenewalDate || app.irs1120DueDate) && (
                        <div className="border-t pt-3">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t('dashboard.llcDetails.importantDates')}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {app.llcCreatedDate && (
                              <div data-testid={`date-created-${order.id}`}>
                                <p className="text-muted-foreground">{t('dashboard.llcDetails.formed')}</p>
                                <p className="font-semibold text-foreground">{formatDate(app.llcCreatedDate)}</p>
                              </div>
                            )}
                            {app.agentRenewalDate && (
                              <div data-testid={`date-agent-${order.id}`}>
                                <p className="text-muted-foreground">{t('dashboard.llcDetails.agentRenewal')}</p>
                                <p className="font-semibold text-foreground">{formatDate(app.agentRenewalDate)}</p>
                              </div>
                            )}
                            {app.irs1120DueDate && (
                              <div data-testid={`date-irs1120-${order.id}`}>
                                <p className="text-muted-foreground">IRS 1120</p>
                                <p className="font-semibold text-foreground">{formatDate(app.irs1120DueDate)}</p>
                              </div>
                            )}
                            {app.annualReportDueDate && (
                              <div data-testid={`date-annual-${order.id}`}>
                                <p className="text-muted-foreground">{t('dashboard.llcDetails.annualReport')}</p>
                                <p className="font-semibold text-foreground">{formatDate(app.annualReportDueDate)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Link href="/dashboard?tab=documents">
                          <Button variant="outline" size="sm" className="text-xs rounded-full" data-testid={`button-documents-${order.id}`}>
                            <FileText className="w-3 h-3 mr-1" />
                            {t('dashboard.llcDetails.myDocuments')}
                          </Button>
                        </Link>
                        {app.ein && (
                          <Link href="/tools/operating-agreement">
                            <Button variant="outline" size="sm" className="text-xs rounded-full" data-testid={`button-operating-${order.id}`}>
                              {t('dashboard.llcDetails.generateAgreement')}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* All Orders List */}
          {orders && orders.length > 0 && (
            <div>
              <h3 className="text-xs md:text-sm font-black text-muted-foreground mb-2 md:mb-3">{t('dashboard.services.allOrders')}</h3>
              <div className="space-y-2 md:space-y-3">
                {orders.map((order) => (
                  <Card key={order.id} className="rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-card overflow-hidden" data-testid={`card-order-${order.id}`}>
                    <div className="flex items-center justify-between p-3 md:p-4 gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-[9px] md:text-[10px] font-bold text-accent uppercase tracking-wider">
                            {order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber || `#${order.id}`}
                          </p>
                          <Badge className={`${getOrderStatusLabel(order.status, t).className} font-bold uppercase text-[8px] md:text-[9px] px-1.5 py-0`} data-testid={`badge-order-status-${order.id}`}>
                            {getOrderStatusLabel(order.status, t).label}
                          </Badge>
                          {order.status === 'completed' && order.application?.ein && (
                            <Badge className="bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent text-[8px] px-1.5 py-0" data-testid={`badge-ein-${order.id}`}>
                              EIN: {order.application.ein}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm md:text-base font-black text-primary break-words">
                          {order.maintenanceApplication 
                            ? `${t('dashboard.services.maintenance')} ${order.maintenanceApplication.state || ''}`
                            : order.application?.companyName 
                              ? (order.application.companyName.trim().toUpperCase().endsWith('LLC') ? order.application.companyName : `${order.application.companyName} LLC`)
                              : order.product?.name || t('dashboard.services.pendingLLC')
                          }
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground">
                          {order.application?.state || order.maintenanceApplication?.state || ''}
                          {order.createdAt && ` · ${formatDate(order.createdAt)}`}
                        </p>
                      </div>
                      {order.status === 'pending' && order.application && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[9px] md:text-[10px] h-7 md:h-8 px-2 md:px-3 rounded-full font-bold shrink-0"
                          onClick={() => window.location.href = `/llc/formation?edit=${order.application.id}`}
                          data-testid={`button-modify-order-${order.id}`}
                        >
                          {t('dashboard.services.modify')}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* In Progress Orders */}
          {inProgressOrders.length > 0 && (
            <div className="space-y-3 mt-4 md:mt-6">
              <h3 className="text-xs md:text-sm font-black text-muted-foreground">{t('dashboard.services.inProgress')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {inProgressOrders.map((order) => (
                  <LLCProgressWidget 
                    key={`progress-${order.id}`}
                    status={order.status}
                    serviceName={
                      order.maintenanceApplication 
                        ? `${t('dashboard.services.maintenance')} ${order.maintenanceApplication.state || order.product?.name?.replace(' LLC', '') || ''}`
                        : order.application?.companyName 
                          ? (order.application.companyName.trim().toUpperCase().endsWith('LLC') ? order.application.companyName : `${order.application.companyName} LLC`)
                          : order.product?.name || t('dashboard.services.yourLLC')
                    }
                    state={order.application?.state || order.maintenanceApplication?.state}
                    requestCode={order.application?.requestCode || order.maintenanceApplication?.requestCode || order.invoiceNumber}
                    isMaintenance={!!order.maintenanceApplication}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});
