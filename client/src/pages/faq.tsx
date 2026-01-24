import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/hero-section";
import { NewsletterSection } from "@/components/layout/newsletter-section";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const faqCategories = [
  {
    title: "Sobre Easy US LLC",
    questions: [
      {
        q: "¿Qué hacemos en Easy US LLC?",
        a: "Creamos, estructuramos y gestionamos tu LLC en Estados Unidos de forma integral. No somos una web que te suelta unos papeles y desaparece. Somos una gestoría que te acompaña antes, durante y después del proceso. Nuestro objetivo es que tengas una empresa bien creada desde el inicio, con una estructura que funcione legalmente, evitando cualquier susto por falta de información y permitiendo que tu negocio crezca sin bloqueos operativos ni legales. Nos encargamos de toda la burocracia para que tú te centres en vender."
      },
      {
        q: "¿Qué incluye el paquete de creación?",
        a: "Incluye absolutamente todo lo necesario para que tu empresa nazca y sea plenamente operativa desde el primer día: El registro oficial de la LLC ante el estado, la redacción de los Artículos de Organización, un Operating Agreement (Acuerdo Operativo) personalizado y profesional, una dirección comercial física en Estados Unidos para recibir correspondencia oficial, el Agente Registrado obligatorio por ley, el registro inicial BOI (Informe de Beneficiarios Reales) ante el FinCEN, constitución express en 3 días hábiles y soporte con consultas ilimitadas para que nunca te sientas solo."
      },
      {
        q: "¿Qué no incluye el paquete base?",
        a: "No incluye servicios que dependen directamente de tu facturación o actividad específica: La apertura bancaria directa (aunque te guiamos paso a paso, la decisión final es del banco), las declaraciones fiscales anuales, el registro de Sales Tax (impuesto sobre las ventas), servicios de contabilidad mensual o trámites migratorios personales. Estos servicios adicionales se activan de forma modular cuando tu negocio realmente los necesita para operar a gran escala."
      },
      {
        q: "¿Me dais una dirección en Estados Unidos?",
        a: "Sí, por supuesto. Te proporcionamos una dirección comercial física real y válida para bancos, plataformas de pago (Stripe/PayPal), registros oficiales estatales y documentación fiscal ante el IRS. No es un simple buzón postal barato de reenvío; es una dirección de gestión empresarial real. Sin una dirección profesional en Estados Unidos, tu empresa no podrá superar las verificaciones de seguridad de los neobancos ni de las pasarelas de pago modernas."
      }
    ]
  },
  {
    title: "Conceptos Clave y Trámites",
    questions: [
      {
        q: "¿Qué es el EIN?",
        a: "El EIN (Employer Identification Number) es el número de identificación fiscal federal de tu empresa en Estados Unidos, equivalente al NIF o CIF en otros países. Es el documento más importante: lo necesitas obligatoriamente para abrir cuentas bancarias empresariales, facturar a clientes, contratar empleados, declarar impuestos ante el IRS y verificar tus cuentas en Stripe, PayPal, Wise y Amazon. Sin un EIN validado, tu empresa existe legalmente pero está totalmente inoperativa en el sistema financiero."
      },
      {
        q: "¿Qué es el Operating Agreement?",
        a: "Es el contrato interno fundamental de tu empresa. Este documento marca las reglas de juego: quiénes son los dueños (miembros), qué porcentaje de participación tiene cada uno, quién tiene el poder de decisión, cómo se reparten los beneficios y qué sucede legalmente si un socio quiere salir o entrar en la compañía. Los bancos estadounidenses lo exigen como requisito indispensable para abrir una cuenta y es tu principal defensa ante cualquier disputa legal o auditoría."
      },
      {
        q: "¿Qué es los Artículos de Organización?",
        a: "Es el acta de nacimiento oficial de tu empresa, el documento que presentamos ante la Secretaría de Estado para crear la entidad legal. Incluye datos públicos cruciales como el nombre de la LLC, el estado de formación (Wyoming o Nuevo México), la dirección física oficial y la identidad del Agente Registrado. Una vez sellado por el estado, este documento confirma que tu responsabilidad limitada ha comenzado y que tus activos personales están protegidos."
      },
      {
        q: "¿Qué es un Agente Registrado?",
        a: "Es una figura obligatoria por ley en todos los estados. Es la entidad o persona encargada de recibir en tu nombre todas las notificaciones oficiales del gobierno, requerimientos legales, citaciones judiciales y avisos de impuestos. Nosotros actuamos como tu Agente Registrado oficial: procesamos toda la correspondencia importante, te notificamos de inmediato y te asesoramos sobre qué acciones tomar. No contar con uno es motivo de disolución inmediata de tu empresa por parte del estado."
      },
      {
        q: "¿Qué es el BOI?",
        a: "Es el registro de 'Beneficial Ownership Information' (Información sobre los Beneficiarios Reales) exigido por el Departamento del Tesoro (FinCEN). El gobierno de Estados Unidos requiere saber quiénes son las personas físicas que poseen o controlan realmente la empresa para prevenir actividades ilícitas. No es un trámite opcional y el incumplimiento puede acarrear multas civiles extremas de hasta 500$ por cada día de retraso o sanciones penales de hasta 10.000$."
      }
    ]
  },
  {
    title: "Impuestos y Cumplimiento",
    questions: [
      {
        q: "¿Qué impuestos paga una LLC?",
        a: "La tributación depende totalmente de cómo esté estructurada la empresa y la residencia de sus dueños. La mayoría de las LLC operan como entidades 'disregarded' (transparentes), lo que significa que la empresa en sí no paga impuesto de sociedades en Estados Unidos, sino que el beneficio fluye hacia los dueños. Si no tienes presencia física ni empleados en EE.UU. y realizas servicios digitales, es muy probable que tu carga fiscal federal sea del 0%, tributando únicamente en tu país de residencia. Cada caso es único y nosotros te proporcionamos la orientación inicial necesaria."
      },
      {
        q: "¿Hay IVA en Estados Unidos?",
        a: "No, en Estados Unidos no existe el IVA (Impuesto sobre el Valor Añadido) tal como se conoce en Europa o Latinoamérica. En su lugar, existe el 'Sales Tax' (Impuesto sobre las Ventas), que es un impuesto estatal y local. Solo se recauda si vendes productos físicos a clientes finales en estados donde tu empresa tiene 'nexus' (presencia legal o económica). Para servicios digitales y software (SaaS) vendidos fuera de EE.UU., generalmente no hay impuestos indirectos que recaudar."
      },
      {
        q: "¿Qué es el CRS y FATCA?",
        a: "Estados Unidos es uno de los pocos países que no participa en el sistema de intercambio automático de información bancaria conocido como CRS (Common Reporting Standard). En su lugar, utiliza su propio sistema llamado FATCA. Esto significa que las cuentas bancarias abiertas en EE.UU. por extranjeros no se reportan automáticamente a través del sistema CRS utilizado por casi toda Europa y Latinoamérica, ofreciendo un nivel superior de privacidad financiera, siempre que el usuario cumpla con sus obligaciones legales individuales."
      },
      {
        q: "¿Qué son los Formularios 5472 y 1120?",
        a: "Son declaraciones informativas anuales obligatorias ante el IRS. El Formulario 5472 informa sobre transacciones entre la LLC y sus dueños extranjeros (préstamos, aportaciones de capital, pagos). La omisión de este formulario conlleva una multa automática mínima de 25.000$. El Formulario 1120 es la declaración de impuestos de la corporación que acompaña al 5472. Deben presentarse incluso si la empresa no ha tenido actividad comercial o facturación durante el año."
      },
      {
        q: "¿Qué es el Annual Report?",
        a: "Es un informe anual de mantenimiento que exigen estados como Wyoming para confirmar que la empresa sigue activa y que sus datos de contacto son correctos. Incluye el pago de una tasa estatal de mantenimiento. Si no presentas este informe antes de la fecha límite, el estado cambiará el estatus de tu empresa a 'Delinquent' y eventualmente la disolverá, perdiendo tú toda la protección de responsabilidad limitada."
      }
    ]
  },
  {
    title: "Operativa y Plataformas",
    questions: [
      {
        q: "¿Puedo usar mi LLC para cobrar en Stripe, PayPal o Wise?",
        a: "Sí, ese es precisamente uno de los mayores beneficios de tener una LLC. Con tu EIN federal, Operating Agreement profesional y dirección comercial certificada, puedes abrir cuentas empresariales en estas plataformas sin los bloqueos que suelen sufrir las cuentas personales de países con alto riesgo. Te asesoramos sobre cómo presentar la documentación técnica correctamente para superar los procesos de 'Know Your Customer' (KYC) y evitar retenciones de fondos injustificadas."
      },
      {
        q: "¿Qué pasa si una plataforma me bloquea la cuenta?",
        a: "Un bloqueo no siempre es definitivo, suele ser un control rutinario de seguridad. Te ayudamos a analizar qué documentos específicos están solicitando, preparamos la respuesta técnica adecuada con tus Artículos de Organización y EIN, y te indicamos cómo enviar la información para que un agente humano del soporte la apruebe. La mayoría de las cuentas se desbloquean en pocos días si la respuesta es profesional y está bien documentada."
      },
      {
        q: "¿Puedo cambiar mi LLC de estado más adelante?",
        a: "No de forma sencilla. En Easy US LLC no realizamos trámites de 'Domestication' (traslado de estado) porque es un proceso costoso y burocrático que suele generar errores fiscales. Si tu negocio cambia radicalmente y necesitas operar en otro estado diferente, lo más eficiente y seguro suele ser cerrar la entidad actual y crear una nueva LLC o registrar la actual como entidad extranjera en el nuevo estado. Por eso es vital elegir bien entre Wyoming y Nuevo México desde el primer día."
      },
      {
        q: "¿Puedo usarla viviendo en Europa?",
        a: "Sí, la LLC es la herramienta de optimización favorita para nómadas digitales y emprendedores que residen en Europa. Te permite facturar globalmente con una estructura estadounidense mientras cumples con las normativas de tu país de residencia. Es una forma perfectamente legal de separar tus activos personales de los empresariales y operar en un mercado con menos burocracia que el europeo."
      },
      {
        q: "¿Sirve para Amazon, SaaS, Freelancing, Cripto?",
        a: "Absolutamente. La LLC es una entidad extremadamente versátil que se adapta a cualquier modelo de negocio digital. Ya seas un vendedor de Amazon FBA que necesita acceso al mercado americano, un desarrollador de software con un modelo SaaS, un freelancer que factura a clientes internacionales o un invasor en criptoactivos que busca protección legal, la LLC estadounidense es la estructura de referencia a nivel mundial por su flexibilidad y prestigio."
      }
    ]
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (category: string, index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [category]: prev[category] === index ? null : index
    }));
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-white font-sans text-left overflow-x-hidden w-full relative">
      <Navbar />

      <section className="pt-24 sm:pt-32 lg:pt-40 pb-4 sm:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div 
            className="text-center mb-2 sm:mb-10 flex flex-col items-center justify-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primary uppercase tracking-tight text-center" variants={fadeIn}>
              <span className="text-accent uppercase tracking-widest text-xs sm:text-sm font-black block mb-0 text-center">FAQ</span>
              Centro de Ayuda
            </motion.h2>
            <motion.p className="hidden sm:block text-accent font-black uppercase tracking-wide text-base sm:text-lg mt-0.5 text-center" variants={fadeIn}>(Todo lo que necesitas saber)</motion.p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="mb-4 sm:mb-12 relative">
              <input
                type="text"
                placeholder="Busca tu duda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 sm:h-14 pl-10 sm:pl-14 pr-6 rounded-full border-2 border-accent/30 focus:border-accent focus:outline-none text-primary font-medium shadow-sm transition-all text-[10px] sm:text-base appearance-none"
              />
              <div className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 text-[#6EDC8A]">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <motion.div 
              className="space-y-8 sm:space-y-12"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <motion.div key={category.title} className="space-y-4 sm:space-y-6" variants={fadeIn}>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-tight flex items-center gap-3 sm:gap-4">
                      <span className="w-1.5 sm:w-2 h-8 sm:h-10 bg-accent rounded-full shrink-0" />
                      {category.title}
                    </h2>
                    <div className="grid gap-2 sm:gap-3">
                      {category.questions.map((item, i) => (
                        <div 
                          key={i} 
                          className={`group transition-all duration-200 border-2 rounded-xl sm:rounded-2xl overflow-hidden ${
                            openItems[category.title] === i 
                              ? "border-accent bg-accent/[0.03]" 
                              : "border-primary/5 hover:border-accent/30 bg-white"
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(category.title, i)}
                            className="w-full px-4 sm:px-6 py-4 sm:py-6 text-left flex items-center justify-between gap-3 sm:gap-4 touch-manipulation"
                          >
                            <span className="font-bold text-primary text-sm sm:text-lg leading-tight tracking-tight">
                              {item.q}
                            </span>
                            <span className={`text-xl sm:text-2xl transition-transform duration-200 shrink-0 ${
                              openItems[category.title] === i ? "rotate-45 text-[#6EDC8A]" : "text-primary/30"
                            }`}>
                              +
                            </span>
                          </button>
                          {(openItems[category.title] === i || searchQuery !== "") && (
                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-primary/90 text-xs sm:text-base leading-relaxed border-t border-accent/20 pt-3 sm:pt-4 animate-in fade-in slide-in-from-top-2 font-medium bg-accent/5">
                              {item.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <p className="text-primary font-bold text-lg sm:text-xl mb-2">No hemos encontrado nada</p>
                  <p className="text-muted-foreground text-sm sm:text-base">Prueba con otra palabra o contáctanos directamente.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </div>
  );
}