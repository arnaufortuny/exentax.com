import { Link } from "wouter";
import { MessageSquare, Loader2, Eye, MessageCircle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { getWhatsAppUrl } from "@/lib/whatsapp";

interface MessagesTabProps {
  messagesData: any[] | undefined;
  selectedMessage: any;
  setSelectedMessage: (msg: any) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  sendReplyMutation: { mutate: (id: number) => void; isPending: boolean };
}

export function MessagesTab({ 
  messagesData, 
  selectedMessage, 
  setSelectedMessage,
  replyContent,
  setReplyContent,
  sendReplyMutation
}: MessagesTabProps) {
  const { t } = useTranslation();
  
  return (
    <div key="messages" className="space-y-6">
      <div className="mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.support.title')}</h2>
          <p className="text-base text-muted-foreground mt-1">{t('dashboard.support.subtitle')}</p>
        </div>
      </div>
      <div className="space-y-4">
        {(!messagesData || messagesData.length === 0) ? (
          <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="widget-support-empty">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-accent" />
              <div>
                <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t('dashboard.support.empty')}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t('dashboard.support.emptyDescription')}</p>
              </div>
              <a href={getWhatsAppUrl("dashboardSupport")} target="_blank" rel="noopener noreferrer">
                <Button className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-support-whatsapp">
                  {t('dashboard.support.newQuery')}
                </Button>
              </a>
            </div>
          </Card>
        ) : (
          messagesData.map((msg) => (
            <Card key={msg.id} className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h4 className="font-black text-foreground">{msg.subject || t('dashboard.support.noSubject')}</h4>
                </div>
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 text-xs px-2 h-7" onClick={(e) => { e.stopPropagation(); setSelectedMessage(selectedMessage?.id === msg.id ? null : msg); }}>
                  <Eye className="w-3 h-3 mr-1" /> {t('dashboard.support.view')}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{msg.content}</p>
              {selectedMessage?.id === msg.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-border space-y-4" onClick={(e) => e.stopPropagation()}>
                  {msg.replies && msg.replies.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('dashboard.support.replies')}</p>
                      {msg.replies.map((reply: any, idx: number) => (
                        <div key={idx} className={`p-3 rounded-xl text-sm ${reply.isFromAdmin ? 'bg-accent/10 border-l-2 border-accent' : 'bg-muted/50'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-foreground">{reply.isFromAdmin ? t('dashboard.support.teamEasyUS') : t('dashboard.support.you')}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-muted-foreground">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={t('dashboard.support.replyPlaceholder')} className="rounded-xl min-h-[80px] text-sm" data-testid="input-user-reply" />
                  <Button onClick={() => sendReplyMutation.mutate(msg.id)} disabled={!replyContent.trim() || sendReplyMutation.isPending} className="bg-accent text-accent-foreground font-black rounded-full px-6" data-testid="button-user-send-reply">
                    {sendReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t('dashboard.support.sendReply')}
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
