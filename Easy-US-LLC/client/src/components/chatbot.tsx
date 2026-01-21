import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  isContact?: boolean;
  options?: { label: string; value: string }[];
}

const knowledgeBase: Record<string, any> = {
  "precio": {
    keywords: ["precio", "costo", "cuanto", "vale", "dinero", "tarifa", "pago"],
    text: "Nuestros paquetes principales son:\n• New Mexico: 639€ (Todo incluido)\n• Wyoming: 799€ (Todo incluido)\n• Delaware: 999€ (Todo incluido)\n\n¿Te gustaría ver qué incluye cada uno?",
    options: [
      { label: "Incluye New Mexico", value: "precio_nm" },
      { label: "Incluye Wyoming", value: "precio_wy" }
    ]
  },
  "banco": {
    keywords: ["banco", "cuenta", "mercury", "relay", "finanzas", "dinero", "cobrar", "tarjeta"],
    text: "Trabajamos con Mercury y Relay Financial. Te ayudamos con la apertura 100% remota. ¿Cuál te interesa más?",
    options: [
      { label: "Mercury", value: "banco_mercury" },
      { label: "Relay", value: "banco_relay" }
    ]
  },
  "tiempo": {
    keywords: ["tiempo", "tarda", "cuando", "dia", "plazo", "rapido", "demora"],
    text: "¡Somos rápidos! Tu LLC estará lista en 2-3 días hábiles aproximadamente.",
    options: [
      { label: "Empezar ahora", value: "start_form" },
      { label: "Otra duda", value: "hola" }
    ]
  },
  "impuestos": {
    keywords: ["impuesto", "tax", "hacienda", "fiscal", "irs", "tributacion", "iva"],
    text: "Con tu LLC Americana reducimos tu carga fiscal al mínimo legal. Si no resides en USA, tu LLC suele ser fiscalmente transparente.",
    options: [
      { label: "Quiero saber más", value: "whatsapp" },
      { label: "Volver", value: "hola" }
    ]
  }
};

const formSteps = [
  { id: "name", question: "¿Cuál es el nombre que has pensado para tu LLC?" },
  { id: "state", question: "¿En qué estado prefieres constituir? (New Mexico o Wyoming)", options: [{ label: "New Mexico", value: "NM" }, { label: "Wyoming", value: "WY" }] },
  { id: "email", question: "Por último, ¿cuál es tu correo electrónico para enviarte el borrador?" }
];

function findBestResponse(input: string): { text: string; options?: { label: string; value: string }[]; isError?: boolean } {
  const lowerInput = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  for (const key in knowledgeBase) {
    const entry = knowledgeBase[key];
    if (entry.keywords.some((k: string) => lowerInput.includes(k))) {
      return entry;
    }
  }

  return {
    text: "Lo siento, no he entendido tu consulta. ¿Podrías intentar reformularla con otras palabras o elegir una opción?",
    isError: true,
    options: [
      { label: "Precios", value: "precio" },
      { label: "Bancos", value: "banco" },
      { label: "Constituir LLC", value: "start_form" }
    ]
  };
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "¡Hola! Bienvenido a Easy US LLC. Soy tu asistente 24/7. ¿En qué puedo ayudarte?", 
      isBot: true,
      options: [
        { label: "Precios", value: "precio" },
        { label: "Bancos", value: "banco" },
        { label: "Constituir LLC", value: "start_form" }
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

  const handleSend = (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      isBot: false
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textOverride) setInput("");

    setTimeout(() => {
      if (textToSend.toLowerCase() === "start_form") {
        setIsFormActive(true);
        setFormStep(0);
        const firstStep = formSteps[0];
        setMessages(prev => [...prev, { id: Date.now() + 1, text: firstStep.question, isBot: true }]);
        return;
      }

      if (isFormActive) {
        const currentStep = formSteps[formStep];
        const nextStepIndex = formStep + 1;
        const updatedFormData = { ...formData, [currentStep.id]: textToSend };
        setFormData(updatedFormData);

        if (nextStepIndex < formSteps.length) {
          setFormStep(nextStepIndex);
          const nextStep = formSteps[nextStepIndex];
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: nextStep.question, 
            isBot: true,
            options: nextStep.options
          }]);
        } else {
          setIsFormActive(false);
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: "¡Perfecto! Hemos recibido tus datos. Un asesor te contactará en breve para finalizar el proceso.", 
            isBot: true,
            options: [{ label: "Hablar por WhatsApp", value: "whatsapp" }]
          }]);
        }
        return;
      }

      const responseData = findBestResponse(textToSend);
      
      if (responseData.isError) {
        const newErrorCount = errorCount + 1;
        setErrorCount(newErrorCount);
        if (newErrorCount >= 2) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: "Parece que no puedo ayudarte con esto. Te estoy redirigiendo a WhatsApp para hablar con un asesor.",
            isBot: true,
            isContact: true
          }]);
          setTimeout(() => {
            window.open("https://wa.me/34614916910", "_blank");
            setIsOpen(false);
            setErrorCount(0);
          }, 3000);
          return;
        }
      } else {
        setErrorCount(0);
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: responseData.text,
        isBot: true,
        options: responseData.options
      }]);
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="md:hidden">
        <style>{`
          body:has([data-mobile-menu-open="true"]) .chatbot-trigger {
            display: none !important;
          }
        `}</style>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-80 max-w-md bg-white rounded-2xl shadow-2xl border border-brand-dark/10 overflow-hidden z-50 flex flex-col max-h-[500px]"
          >
            <div className="bg-brand-lime p-4 text-brand-dark border-b border-brand-dark/10 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black uppercase tracking-tight text-sm">EASY US LLC</p>
                  <p className="text-[10px] font-bold opacity-70 leading-none uppercase">Asistente 24/7</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-brand-dark/10 flex items-center justify-center hover:bg-brand-dark/20 transition-colors text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line font-medium leading-relaxed ${
                        msg.isBot
                          ? "bg-white border border-brand-dark/10 text-brand-dark shadow-sm"
                          : "bg-brand-lime text-brand-dark shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  {msg.isBot && msg.options && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(opt.value)}
                          className="text-[10px] font-bold bg-white border-2 border-brand-lime text-brand-dark px-3 py-2 rounded-full hover:bg-brand-lime transition-all active:scale-95 shadow-sm"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe tu duda..."
                  className="flex-grow resize-none border border-gray-200 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-brand-lime h-11 font-medium"
                />
                <Button 
                  onClick={() => handleSend()}
                  className="bg-brand-lime text-brand-dark hover:bg-brand-lime/90 active:bg-brand-lime rounded-full h-11 w-11 p-0 shadow-md transition-all active:scale-90 shrink-0 border-0"
                >
                  →
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 bg-brand-lime text-brand-dark rounded-full shadow-2xl flex items-center justify-center z-50 border-0 chatbot-trigger active:bg-brand-lime transition-colors"
      >
        {isOpen ? (
          <span className="text-2xl font-black">✕</span>
        ) : (
          <span className="text-2xl font-black">?</span>
        )}
      </motion.button>
    </>
  );
}
