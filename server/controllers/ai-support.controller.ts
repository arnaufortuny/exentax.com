import { Request, Response } from "express";

const hasOpenAIKey = (): boolean => {
  return !!(process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
};

const getOpenAIClient = async () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  try {
    const OpenAI = (await import("openai")).default;
    return new OpenAI({ apiKey });
  } catch (e) {
    console.log("OpenAI client creation failed:", e);
    return null;
  }
};

const LLC_KNOWLEDGE_BASE = `
Eres un asistente experto en formación de LLCs en Estados Unidos para clientes hispanohablantes. Tu objetivo es ayudar a responder preguntas sobre:

ESTADOS DISPONIBLES:
1. **New Mexico** (739€):
   - Sin impuesto estatal sobre ingresos
   - Sin informe anual obligatorio
   - Privacidad máxima: no se publican nombres de miembros
   - Ideal para: freelancers, negocios online, bajo mantenimiento
   
2. **Wyoming** (899€):
   - Sin impuesto estatal sobre ingresos
   - Informe anual requerido (~$60/año)
   - Protección de activos muy fuerte
   - Ideal para: negocios con activos importantes, holding companies
   
3. **Delaware** (1.199€):
   - Sin impuesto sobre ingresos fuera de Delaware
   - Franchise Tax anual (~$300 mínimo)
   - Tribunal especializado en negocios (Court of Chancery)
   - Ideal para: startups buscando inversores, tecnología

OBLIGACIONES FISCALES (Propietarios Extranjeros):
- Form 1120: Declaración de impuestos corporativos (vence 15 de abril)
- Form 5472: Declaración de transacciones con propietarios extranjeros (vence 15 de abril)
- BOI Report: Informe de Beneficial Ownership (obligatorio desde 2024)

SERVICIOS INCLUIDOS EN CADA PAQUETE:
- Tasas estatales pagadas
- Agente Registrado (12 meses)
- Articles of Organization
- Operating Agreement personalizado
- Número EIN del IRS
- BOI Report presentado
- Declaraciones fiscales del primer año
- Soporte completo durante 12 meses

CUENTA BANCARIA:
- Mercury: Fintech para startups (más fácil de abrir)
- Relay: Otra opción fintech popular
- Bancos tradicionales: Requieren presencia física normalmente

PASARELAS DE PAGO:
- Stripe: La más popular para e-commerce
- PayPal: Amplia aceptación
- Wise Business: Buena para transferencias internacionales

Responde siempre en español, de forma clara y concisa. Si no sabes algo con certeza, recomienda contactar con el equipo de soporte.
`;

const FALLBACK_RESPONSES: Record<string, string> = {
  "estado": "Ofrecemos LLC en tres estados: New Mexico (739€) ideal para bajo mantenimiento, Wyoming (899€) para protección de activos, y Delaware (1.199€) para startups que buscan inversores. Cada uno tiene sus ventajas según tu situación.",
  "impuesto": "Como propietario extranjero, deberás presentar el Form 1120 y Form 5472 anualmente (vence el 15 de abril). Si no tienes ingresos de fuente estadounidense, generalmente no pagarás impuestos federales.",
  "banco": "Te ayudamos con Mercury o Relay, fintechs que aceptan propietarios extranjeros. El proceso es 100% online sin necesidad de viajar.",
  "tiempo": "El proceso completo tarda entre 2-5 días hábiles. New Mexico es el más rápido (2-3 días). Te entregaremos todos los documentos por email.",
  "precio": "Nuestros precios son: New Mexico 739€, Wyoming 899€, Delaware 1.199€. Todos incluyen tasas estatales, agente registrado por 12 meses, documentos legales, EIN y soporte completo.",
  "documento": "Incluimos: Articles of Organization, Operating Agreement personalizado, número EIN del IRS, BOI Report presentado, y declaraciones fiscales del primer año.",
  "default": "Gracias por tu consulta. Puedo ayudarte con información sobre estados para tu LLC, obligaciones fiscales, cuentas bancarias, y tiempos de proceso. Para consultas específicas, contacta con nuestro equipo en hola@easyusllc.com"
};

const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("estado") || lowerMessage.includes("new mexico") || lowerMessage.includes("wyoming") || lowerMessage.includes("delaware") || lowerMessage.includes("mejor")) {
    return FALLBACK_RESPONSES.estado;
  }
  if (lowerMessage.includes("impuesto") || lowerMessage.includes("fiscal") || lowerMessage.includes("tax") || lowerMessage.includes("1120") || lowerMessage.includes("5472")) {
    return FALLBACK_RESPONSES.impuesto;
  }
  if (lowerMessage.includes("banco") || lowerMessage.includes("cuenta") || lowerMessage.includes("mercury") || lowerMessage.includes("bancaria")) {
    return FALLBACK_RESPONSES.banco;
  }
  if (lowerMessage.includes("tiempo") || lowerMessage.includes("tarda") || lowerMessage.includes("cuánto") || lowerMessage.includes("dias") || lowerMessage.includes("rápido")) {
    return FALLBACK_RESPONSES.tiempo;
  }
  if (lowerMessage.includes("precio") || lowerMessage.includes("cuesta") || lowerMessage.includes("coste") || lowerMessage.includes("€") || lowerMessage.includes("pagar")) {
    return FALLBACK_RESPONSES.precio;
  }
  if (lowerMessage.includes("documento") || lowerMessage.includes("incluye") || lowerMessage.includes("articles") || lowerMessage.includes("operating")) {
    return FALLBACK_RESPONSES.documento;
  }
  
  return FALLBACK_RESPONSES.default;
};

export const handleAIChat = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: "Mensaje requerido" });
    }

    if (!hasOpenAIKey()) {
      const fallbackResponse = getFallbackResponse(message);
      return res.json({ 
        response: fallbackResponse,
        isFallback: true
      });
    }

    const openaiClient = await getOpenAIClient();
    if (!openaiClient) {
      const fallbackResponse = getFallbackResponse(message);
      return res.json({ 
        response: fallbackResponse,
        isFallback: true
      });
    }

    type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
    
    const messages: ChatMessage[] = [
      { role: "system", content: LLC_KNOWLEDGE_BASE },
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || getFallbackResponse(message);

    res.json({ 
      response: assistantMessage,
      usage: response.usage
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    
    if (error?.status === 429) {
      return res.status(429).json({ 
        message: "Demasiadas solicitudes. Por favor, espera un momento." 
      });
    }
    
    const fallbackResponse = getFallbackResponse(req.body?.message || "");
    res.json({ 
      response: fallbackResponse,
      isFallback: true
    });
  }
};

export const getQuickAnswers = async (_req: Request, res: Response) => {
  const quickAnswers = [
    {
      question: "¿Cuál es el mejor estado para mi LLC?",
      answer: "Depende de tu situación. New Mexico es ideal si buscas bajo coste y privacidad. Wyoming ofrece mejor protección de activos. Delaware es preferido por startups que buscan inversores."
    },
    {
      question: "¿Cuánto tiempo tarda el proceso?",
      answer: "El proceso completo suele tardar entre 2-5 días hábiles dependiendo del estado. New Mexico es el más rápido (2-3 días). Te entregaremos todos los documentos por email."
    },
    {
      question: "¿Necesito viajar a Estados Unidos?",
      answer: "No, todo el proceso se realiza 100% online. No necesitas visa ni estar presente físicamente en ningún momento."
    },
    {
      question: "¿Qué impuestos debo pagar?",
      answer: "Como propietario extranjero, deberás presentar el Form 1120 y Form 5472 anualmente. Si no tienes ingresos de fuente estadounidense, generalmente no pagarás impuestos federales, pero siempre consulta con un contador."
    },
    {
      question: "¿Cómo abro una cuenta bancaria?",
      answer: "Te ayudamos con Mercury o Relay, que son fintechs que aceptan propietarios extranjeros. El proceso se hace online sin necesidad de viajar."
    }
  ];
  
  res.json(quickAnswers);
};
