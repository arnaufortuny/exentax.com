import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAnswer {
  question: string;
  answer: string;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: quickAnswers } = useQuery<QuickAnswer[]>({
    queryKey: ["/api/ai-support/quick-answers"],
    enabled: isOpen && messages.length === 0,
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai-support/chat", {
        message,
        conversationHistory: messages
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, hubo un error. Por favor, intenta de nuevo o contacta con soporte en hola@easyusllc.com' 
      }]);
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput("");
    chatMutation.mutate(userMessage);
  };

  const handleQuickQuestion = (question: string) => {
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    chatMutation.mutate(question);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        data-testid="button-open-ai-chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] shadow-2xl z-50 flex flex-col">
      <CardHeader className="py-3 px-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Asistente LLC
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setIsOpen(false)}
            data-testid="button-close-ai-chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm">
                    Hola, soy tu asistente de Easy US LLC. Puedo ayudarte con dudas sobre:
                  </p>
                  <ul className="text-sm mt-2 space-y-1 text-muted-foreground">
                    <li>- Estados para tu LLC</li>
                    <li>- Obligaciones fiscales</li>
                    <li>- Cuentas bancarias</li>
                    <li>- Tiempos y procesos</li>
                  </ul>
                </div>
              </div>
              
              {quickAnswers && quickAnswers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Preguntas frecuentes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickAnswers.slice(0, 3).map((qa, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1.5 px-2 whitespace-normal text-left"
                        onClick={() => handleQuickQuestion(qa.question)}
                        data-testid={`button-quick-question-${index}`}
                      >
                        {qa.question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className={`rounded-lg p-3 max-w-[85%] ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {chatMutation.isPending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t flex-shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={chatMutation.isPending}
              className="flex-1"
              data-testid="input-ai-chat"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || chatMutation.isPending}
              data-testid="button-send-ai-chat"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
