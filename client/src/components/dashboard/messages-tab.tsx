import { MessageSquare, Loader2, Eye, MessageCircle, Send, PlusCircle, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MessagesTabProps {
  messagesData: any[] | undefined;
  selectedMessage: any;
  setSelectedMessage: (msg: any) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  sendReplyMutation: { mutate: (id: number) => void; isPending: boolean };
  user: any;
  setFormMessage: (msg: { type: 'error' | 'success' | 'info', text: string } | null) => void;
}

export function MessagesTab({ 
  messagesData, 
  selectedMessage, 
  setSelectedMessage,
  replyContent,
  setReplyContent,
  sendReplyMutation,
  user,
  setFormMessage
}: MessagesTabProps) {
  const { t } = useTranslation();
  const [showNewInquiry, setShowNewInquiry] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryReason, setInquiryReason] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");

  const REASON_OPTIONS = [
    { value: "create_company", label: t("contact.subjects.createCompany", "Create a company") },
    { value: "llc_help", label: t("contact.subjects.llcHelp", "Help with my LLC") },
    { value: "close_company", label: t("contact.subjects.closeCompany", "Close company") },
    { value: "bank_payments", label: t("contact.subjects.bankPayments", "Banking & Payments") },
    { value: "question", label: t("contact.subjects.question", "General question") },
    { value: "other", label: t("contact.subjects.other", "Other") },
  ];

  const sendInquiryMutation = useMutation({
    mutationFn: async () => {
      const reasonLabel = REASON_OPTIONS.find(r => r.value === inquiryReason)?.label || inquiryReason;
      const fullSubject = `${inquirySubject} [${reasonLabel}]`;
      const res = await apiRequest("POST", "/api/messages", {
        name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Client',
        email: user?.email || '',
        phone: user?.phone || '',
        contactByWhatsapp: false,
        subject: fullSubject,
        content: inquiryMessage,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Error sending message");
      }
      return res.json();
    },
    onSuccess: (data) => {
      const ticketId = data?.messageId || data?.id || '';
      setFormMessage({ type: 'success', text: `${t('dashboard.support.messageSent', 'Message sent successfully')}. Ticket #${ticketId}` });
      setShowNewInquiry(false);
      setInquirySubject("");
      setInquiryReason("");
      setInquiryMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: error.message });
    }
  });

  const canSubmitInquiry = inquirySubject.trim().length >= 3 && inquiryReason && inquiryMessage.trim().length >= 10;
  
  return (
    <div key="messages" className="space-y-6">
      <div className="mb-4 md:mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.support.title')}</h2>
          <p className="text-base text-muted-foreground mt-1">{t('dashboard.support.subtitle')}</p>
        </div>
        {!showNewInquiry && (
          <Button 
            onClick={() => setShowNewInquiry(true)} 
            className="bg-accent text-accent-foreground font-black rounded-full shrink-0"
            size="sm"
            data-testid="button-open-new-inquiry"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            {t('dashboard.support.newInquiry', 'New inquiry')}
          </Button>
        )}
      </div>

      {showNewInquiry && (
        <Card className="rounded-2xl border-2 border-accent/30 shadow-md bg-white dark:bg-card" data-testid="card-new-inquiry">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-black text-foreground text-sm md:text-base">{t('dashboard.support.newInquiry', 'New inquiry')}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-muted-foreground shrink-0"
                onClick={() => setShowNewInquiry(false)}
                data-testid="button-close-new-inquiry"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">{t('dashboard.support.inquiryTitle', 'Title')}</Label>
              <Input 
                value={inquirySubject} 
                onChange={(e) => setInquirySubject(e.target.value)} 
                placeholder={t('dashboard.support.inquiryTitlePlaceholder', 'Briefly describe your inquiry')}
                className="rounded-full h-11 px-5 border-2 border-gray-200 dark:border-border bg-white dark:bg-muted text-sm"
                maxLength={120}
                data-testid="input-inquiry-subject"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">{t('dashboard.support.inquiryReason', 'Reason')}</Label>
              <NativeSelect
                value={inquiryReason}
                onValueChange={setInquiryReason}
                className="w-full rounded-full h-11 px-5 border-2 border-gray-200 dark:border-border bg-white dark:bg-muted"
                data-testid="select-inquiry-reason"
              >
                <NativeSelectItem value="" disabled>{t('dashboard.support.selectReason', 'Select a reason')}</NativeSelectItem>
                {REASON_OPTIONS.map((opt) => (
                  <NativeSelectItem key={opt.value} value={opt.value}>{opt.label}</NativeSelectItem>
                ))}
              </NativeSelect>
            </div>

            <div>
              <Label className="text-xs font-bold text-muted-foreground mb-1.5 block">{t('dashboard.support.inquiryMessage', 'Message')}</Label>
              <Textarea 
                value={inquiryMessage} 
                onChange={(e) => setInquiryMessage(e.target.value)} 
                placeholder={t('dashboard.support.inquiryMessagePlaceholder', 'Describe your question or request in detail...')}
                className="rounded-xl min-h-[120px] text-sm border-2 border-gray-200 dark:border-border bg-white dark:bg-muted"
                style={{ fontSize: '16px' }}
                data-testid="input-inquiry-message"
              />
            </div>

            <Button 
              onClick={() => sendInquiryMutation.mutate()} 
              disabled={!canSubmitInquiry || sendInquiryMutation.isPending}
              className="w-full bg-accent text-accent-foreground font-black rounded-full h-12"
              data-testid="button-send-inquiry"
            >
              {sendInquiryMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {sendInquiryMutation.isPending ? t('common.sending', 'Sending...') : t('dashboard.support.sendInquiry', 'Send inquiry')}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {(!messagesData || messagesData.length === 0) && !showNewInquiry ? (
          <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="widget-support-empty">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-accent" />
              <div>
                <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.support.empty')}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.support.emptyDescription')}</p>
              </div>
              <Button 
                onClick={() => setShowNewInquiry(true)} 
                className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" 
                data-testid="button-support-new-inquiry"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {t('dashboard.support.newInquiry', 'New inquiry')}
              </Button>
            </div>
          </Card>
        ) : (
          messagesData?.map((msg) => (
            <Card key={msg.id} className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card" data-testid={`card-message-${msg.id}`}>
              <CardContent className="p-4 md:p-5">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-4 h-4 text-accent shrink-0" />
                    <h4 className="font-black text-foreground text-xs sm:text-sm truncate">{msg.subject || t('dashboard.support.noSubject')}</h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {msg.messageId && (
                      <Badge variant="outline" className="text-[10px] font-bold">#{msg.messageId}</Badge>
                    )}
                    <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate text-[10px] font-bold ${msg.status === 'replied' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : msg.status === 'read' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                      {msg.status === 'replied' ? t('dashboard.support.statusReplied', 'Replied') : msg.status === 'read' ? t('dashboard.support.statusRead', 'Read') : t('dashboard.support.statusPending', 'Pending')}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{msg.content}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-accent text-xs px-2" 
                  onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                  data-testid={`button-view-message-${msg.id}`}
                >
                  <Eye className="w-3 h-3 mr-1" /> {selectedMessage?.id === msg.id ? t('dashboard.support.hide', 'Hide') : t('dashboard.support.view')}
                </Button>
                {selectedMessage?.id === msg.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border space-y-3">
                    {msg.replies && msg.replies.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('dashboard.support.replies')}</p>
                        {msg.replies.map((reply: any, idx: number) => (
                          <div key={idx} className={`p-3 rounded-xl text-sm ${reply.isFromAdmin ? 'bg-accent/10 border-l-2 border-accent' : 'bg-muted/50'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-foreground">{reply.isFromAdmin ? t('dashboard.support.teamEasyUS') : t('dashboard.support.you')}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-muted-foreground text-xs sm:text-sm">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Textarea 
                      value={replyContent} 
                      onChange={(e) => setReplyContent(e.target.value)} 
                      placeholder={t('dashboard.support.replyPlaceholder')} 
                      className="rounded-xl min-h-[80px] text-sm" 
                      data-testid="input-user-reply" 
                    />
                    <Button 
                      onClick={() => sendReplyMutation.mutate(msg.id)} 
                      disabled={!replyContent.trim() || sendReplyMutation.isPending} 
                      className="bg-accent text-accent-foreground font-black rounded-full px-6" 
                      data-testid="button-user-send-reply"
                    >
                      {sendReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {t('dashboard.support.sendReply')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
