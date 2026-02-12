import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { formatDate, getLocale } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Archive, Trash2, Send, Loader2 } from "@/components/icons";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdminConsultationsPanel } from "@/components/dashboard/admin-consultations-panel";
import { useConfirmDialog, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaginationControls } from "@/components/dashboard/pagination-controls";

interface AdminCommsPanelProps {
  commSubTab: 'inbox' | 'agenda';
  setCommSubTab: (sub: 'inbox' | 'agenda') => void;
  filteredAdminMessages: any[];
  adminSearchQuery: string;
  onSelectMessage: (msg: any) => void;
  onDeleteMessage: (msgId: number) => void;
  onToggleRead: (msgId: number, isRead: boolean) => void;
  pagination?: { page: number; pageSize: number; total: number; totalPages: number };
  onPageChange?: (page: number) => void;
}

export function AdminCommsPanel({
  commSubTab,
  setCommSubTab,
  filteredAdminMessages,
  adminSearchQuery,
  onSelectMessage,
  onDeleteMessage,
  onToggleRead,
  pagination,
  onPageChange,
}: AdminCommsPanelProps) {
  const { t } = useTranslation();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyFromName, setReplyFromName] = useState("");
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const { confirm: showConfirm, dialogProps: confirmDialogProps } = useConfirmDialog();

  const sendReplyMutation = useMutation({
    mutationFn: async (messageId: number) => {
      setFormMessage(null);
      const res = await apiRequest("POST", `/api/messages/${messageId}/reply`, { content: replyContent, fromName: replyFromName || undefined });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || t("dashboard.toasts.couldNotSend"));
      }
      return res.json();
    },
    onSuccess: () => {
      setReplyContent("");
      setReplyFromName("");
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.messageReplied") + ". " + t("dashboard.toasts.messageRepliedDesc") });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotSend")) });
    },
  });

  return (
    <div className="space-y-4">
      {formMessage && (
        <div className={`p-3 rounded-xl text-sm font-medium ${formMessage.type === 'success' ? 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent border border-accent/30 dark:border-accent/30' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`} data-testid="text-comms-form-message">
          {formMessage.text}
        </div>
      )}
      <div className="flex gap-2 mb-4">
        <Button
          variant={commSubTab === 'inbox' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-full text-xs font-black ${commSubTab === 'inbox' ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setCommSubTab('inbox')}
          data-testid="button-comm-inbox"
        >
          {t('dashboard.admin.communicationsSubTabs.inbox')}
        </Button>
        <Button
          variant={commSubTab === 'agenda' ? 'default' : 'outline'}
          size="sm"
          className={`rounded-full text-xs font-black ${commSubTab === 'agenda' ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setCommSubTab('agenda')}
          data-testid="button-comm-agenda"
        >
          {t('dashboard.admin.communicationsSubTabs.agenda')}
        </Button>
      </div>
      {commSubTab === 'inbox' && (
        <Card className="rounded-2xl shadow-sm p-0 overflow-hidden">
          <div className="divide-y">
            {filteredAdminMessages?.map((msg: any) => (
              <div 
                key={msg.id} 
                className="p-4 space-y-2 hover:bg-accent/5 cursor-pointer transition-colors"
                onClick={() => {
                  const next = selectedMessage?.id === msg.id ? null : msg;
                  setSelectedMessage(next);
                  onSelectMessage(next);
                }}
                data-testid={`inbox-message-${msg.id}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-xs md:text-sm">{msg.firstName} {msg.lastName}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className="text-[8px] md:text-[10px] hidden md:inline-flex">{msg.messageId || msg.id}</Badge>
                    <Badge variant={msg.status === 'archived' ? 'secondary' : 'default'} className="text-[8px] md:text-[10px]">{msg.status === 'archived' ? t('dashboard.admin.inboxSection.archived') : msg.status || t('dashboard.admin.inboxSection.pendingStatus')}</Badge>
                    {msg.status !== 'archived' && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-6 w-6 md:h-7 md:w-7 text-muted-foreground hover:text-foreground" 
                        onClick={async (e) => {
                          e.stopPropagation();
                          onToggleRead(msg.id, msg.status === 'archived');
                          try {
                            await apiRequest("PATCH", `/api/admin/messages/${msg.id}/archive`);
                            queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
                            setFormMessage({ type: 'success', text: t("dashboard.toasts.messageArchived") });
                          } catch { setFormMessage({ type: 'error', text: t("common.error") }); }
                        }}
                        data-testid={`btn-archive-msg-${msg.id}`}
                        title={t('dashboard.admin.documents.archive')}
                      >
                        <Archive className="w-3 h-3 md:w-3.5 md:h-3.5" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 md:h-7 md:w-7 text-red-500" 
                      onClick={(e) => {
                        e.stopPropagation();
                        showConfirm({
                          title: t('common.confirmAction'),
                          description: t('dashboard.admin.inboxSection.confirmDeleteMsg'),
                          onConfirm: async () => {
                            try {
                              await apiRequest("DELETE", `/api/admin/messages/${msg.id}`);
                              queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
                              setFormMessage({ type: 'success', text: t("dashboard.toasts.messageDeleted") });
                              onDeleteMessage(msg.id);
                            } catch { setFormMessage({ type: 'error', text: t("common.error") }); }
                          },
                        });
                      }}
                      data-testid={`btn-delete-msg-${msg.id}`}
                    >
                      <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs font-medium">{msg.subject}</p>
                <p className="text-xs text-muted-foreground">{msg.message}</p>
                
                {msg.replies && msg.replies.length > 0 && (
                  <div className="pl-4 border-l-2 border-accent/30 space-y-2 mt-3">
                    {msg.replies.map((reply: any) => (
                      <div key={reply.id} className="text-xs">
                        <span className={`font-semibold ${reply.isAdmin ? 'text-accent' : 'text-muted-foreground'}`}>
                          {reply.isAdmin ? (reply.authorName || t('dashboard.admin.inboxSection.adminLabel')) : t('dashboard.admin.inboxSection.clientLabel')}:
                        </span>
                        <span className="ml-2">{reply.content}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">
                          {reply.createdAt && new Date(reply.createdAt).toLocaleString(getLocale())}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-[10px] text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleString(getLocale()) : ''}</p>
                
                {selectedMessage?.id === msg.id && (
                  <div className="space-y-2 pt-3 border-t mt-2" onClick={(e) => e.stopPropagation()}>
                    <Input 
                      value={replyFromName} 
                      onChange={(e) => setReplyFromName(e.target.value)} 
                      placeholder={t('dashboard.admin.inboxSection.fromNamePlaceholder')} 
                      className="rounded-2xl text-sm"
                      maxLength={100}
                      data-testid="input-admin-from-name"
                    />
                    <Textarea value={replyContent} 
                      onChange={(e) => setReplyContent(e.target.value)} 
                      placeholder={t('dashboard.admin.inboxSection.replyPlaceholder')} 
                      className="rounded-2xl min-h-[80px] text-sm"
                      data-testid="input-admin-reply"
                    />
                    <Button onClick={() => sendReplyMutation.mutate(msg.id)} 
                      disabled={!replyContent.trim() || sendReplyMutation.isPending} 
                      className="bg-accent text-accent-foreground font-black rounded-full px-6"
                      data-testid="button-send-admin-reply"
                    >
                      {sendReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      {t('dashboard.admin.inboxSection.sendReply')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {(!filteredAdminMessages || filteredAdminMessages.length === 0) && (
              <div className="text-center py-8 text-muted-foreground text-sm">{t('dashboard.admin.inboxSection.noMessages')}</div>
            )}
          </div>
          {pagination && onPageChange && (
            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onPageChange={onPageChange}
            />
          )}
        </Card>
      )}
      {commSubTab === 'agenda' && (
        <AdminConsultationsPanel searchQuery={adminSearchQuery} />
      )}
      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
