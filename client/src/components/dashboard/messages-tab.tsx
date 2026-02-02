import { Link } from "wouter";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
  return (
    <div key="messages" className="space-y-6">
      <div className="mb-4 md:mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Mis Consultas</h2>
            <p className="text-sm text-muted-foreground mt-1">Tu historial de mensajes con nuestro equipo</p>
          </div>
          <Link href="/contacto">
            <Button className="bg-accent text-accent-foreground font-semibold rounded-full text-xs">Nueva Consulta</Button>
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        {(!messagesData || messagesData.length === 0) ? (
          <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-zinc-900 p-6 md:p-8 text-center" data-testid="widget-support-empty">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 md:mb-2 text-center">Sin consultas activas</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">Te responderá una persona, no un bot.</p>
              </div>
              <a href="https://wa.me/34614916910?text=Hola!%20Necesito%20ayuda%20con%20mi%20cuenta" target="_blank" rel="noopener noreferrer">
                <Button className="bg-accent text-accent-foreground font-semibold rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base" data-testid="button-support-whatsapp">
                  <MessageSquare className="w-4 h-4 mr-2" /> Hablar con soporte
                </Button>
              </a>
            </div>
          </Card>
        ) : (
          messagesData.map((msg) => (
            <Card key={msg.id} className="rounded-2xl border-0 shadow-sm p-6 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h4 className="font-semibold text-foreground">{msg.subject || 'Sin asunto'}</h4>
                </div>
                <span className="text-[10px] text-muted-foreground">{msg.messageId || msg.id}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{msg.content}</p>
              {selectedMessage?.id === msg.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Escribe tu respuesta..." className="rounded-xl min-h-[80px] text-sm" data-testid="input-user-reply" />
                  <Button onClick={() => sendReplyMutation.mutate(msg.id)} disabled={!replyContent.trim() || sendReplyMutation.isPending} className="bg-accent text-accent-foreground font-semibold rounded-full px-6" data-testid="button-user-send-reply">
                    {sendReplyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Enviar Respuesta
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
