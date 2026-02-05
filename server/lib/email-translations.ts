export type EmailLanguage = 'es' | 'en' | 'ca';

interface EmailTranslations {
  common: {
    greeting: string;
    closing: string;
    doubts: string;
    client: string;
  };
  otp: {
    thanks: string;
    forSecurity: string;
    yourCode: string;
    important: string;
    personalAndConfidential: string;
    validFor: string;
    doNotShare: string;
    ignoreMessage: string;
  };
  welcome: {
    welcomeMessage: string;
    accountCreated: string;
    accessFrom: string;
    realTimeTracking: string;
    documentCenter: string;
    professionalTools: string;
    fiscalCalendar: string;
    directSupport: string;
    hereToHelp: string;
    exploreButton: string;
  };
  accountPendingVerification: {
    accountCreatedBut: string;
    actionRequired: string;
    accessAndVerify: string;
    verifyButton: string;
    whileUnverified: string;
  };
  accountUnderReview: {
    underReview: string;
    whyReview: string;
    whyReviewText: string;
    duringProcess: string;
    whatHappens: string;
    step1: string;
    step2: string;
    step3: string;
    teamReviewing: string;
    patience: string;
    closing: string;
  };
  accountVip: {
    updatedToVip: string;
    benefits: string;
    priorityAttention: string;
    preferentialTracking: string;
    fullAccess: string;
    viewDashboard: string;
  };
  accountReactivated: {
    reactivated: string;
    canAccess: string;
    viewDashboard: string;
  };
  accountDeactivated: {
    deactivated: string;
    cannotAccess: string;
    contactSupport: string;
  };
  confirmation: {
    greatNews: string;
    details: string;
    reference: string;
    service: string;
    company: string;
    state: string;
    nextSteps: string;
    step1: string;
    step2: string;
    step3: string;
    trackButton: string;
  };
  autoReply: {
    receivedMessage: string;
    ticketNumber: string;
    responding: string;
    seeMessages: string;
  };
  orderUpdate: {
    statusChanged: string;
    newStatus: string;
    trackButton: string;
  };
  orderCompleted: {
    llcReady: string;
    congratulations: string;
    accessDocuments: string;
    documentList: string;
    articlesOrg: string;
    einLetter: string;
    registeredAgent: string;
    viewDocuments: string;
    nextSteps: string;
    activateBanking: string;
    operatingAgreement: string;
    trackExpenses: string;
    hereForYou: string;
  };
  noteReceived: {
    teamNote: string;
    respondNote: string;
  };
  adminNote: {
    messageAbout: string;
    viewTicket: string;
  };
  paymentRequest: {
    paymentRequired: string;
    amount: string;
    payNow: string;
    securePayment: string;
  };
  documentRequest: {
    needDocument: string;
    documentType: string;
    important: string;
    uploadInstruction: string;
    uploadButton: string;
  };
  documentUploaded: {
    documentReceived: string;
    forOrder: string;
    reviewing: string;
    trackButton: string;
  };
  messageReply: {
    newReply: string;
    ticket: string;
    viewConversation: string;
  };
  passwordChangeOtp: {
    passwordChangeRequest: string;
    useCode: string;
    yourCode: string;
    important: string;
    validFor: string;
    doNotShare: string;
    notRequested: string;
  };
  accountLocked: {
    locked: string;
    attempts: string;
    contactSupport: string;
    unlockButton: string;
  };
  renewalReminder: {
    dueDate: string;
    daysRemaining: string;
    renewNow: string;
    whatHappens: string;
    penalties: string;
    agentExpires: string;
    goodStanding: string;
    viewCalendar: string;
  };
  registrationOtp: {
    almostDone: string;
    confirmEmail: string;
    yourCode: string;
    important: string;
    validFor: string;
    doNotShare: string;
    ignoreMessage: string;
  };
  operatingAgreementReady: {
    ready: string;
    generated: string;
    whatIs: string;
    explanation: string;
    viewDocument: string;
    tip: string;
    tipText: string;
  };
  abandonedApplication: {
    incomplete: string;
    savedDraft: string;
    continueButton: string;
    tip: string;
    tipText: string;
    expiring: string;
  };
  calculatorResults: {
    results: string;
    summary: string;
    income: string;
    expenses: string;
    autonomoTax: string;
    llcTax: string;
    savings: string;
    disclaimer: string;
  };
}

const translations: Record<EmailLanguage, EmailTranslations> = {
  es: {
    common: {
      greeting: "Hola",
      closing: "Saludos,",
      doubts: "Si tienes cualquier duda, responde directamente a este correo.",
      client: "Cliente"
    },
    otp: {
      thanks: "Gracias por continuar con tu proceso en Easy US LLC.",
      forSecurity: "Para garantizar la seguridad de tu cuenta, utiliza el siguiente código de verificación:",
      yourCode: "Tu código OTP:",
      important: "Importante:",
      personalAndConfidential: "Este código es personal y confidencial",
      validFor: "Tiene una validez limitada a <strong>15 minutos</strong> por motivos de seguridad",
      doNotShare: "No lo compartas con nadie",
      ignoreMessage: "Si no has solicitado este código, puedes ignorar este mensaje con total tranquilidad."
    },
    welcome: {
      welcomeMessage: "¡Bienvenido a Easy US LLC! Nos alegra mucho tenerte con nosotros.",
      accountCreated: "Tu cuenta ha sido creada correctamente y ya puedes empezar a explorar todo lo que podemos hacer juntos. Desde tu Área Cliente tendrás acceso a:",
      accessFrom: "Desde tu Área Cliente tendrás acceso a:",
      realTimeTracking: "Seguimiento en tiempo real de tus solicitudes",
      documentCenter: "Centro de documentación para descargar todos tus archivos",
      professionalTools: "Herramientas profesionales como generador de facturas",
      fiscalCalendar: "Calendario fiscal con tus fechas importantes",
      directSupport: "Comunicación directa con nuestro equipo de soporte",
      hereToHelp: "Estamos aquí para ayudarte en cada paso de tu aventura empresarial en Estados Unidos. Si tienes cualquier pregunta, no dudes en escribirnos.",
      exploreButton: "Explorar Mi Área Cliente"
    },
    accountPendingVerification: {
      accountCreatedBut: "Tu cuenta ha sido creada correctamente, pero necesitas verificar tu email para activarla completamente.",
      actionRequired: "Acción requerida:",
      accessAndVerify: "Accede a tu Área Cliente y verifica tu email para activar tu cuenta y acceder a todas las funciones.",
      verifyButton: "Verificar mi email",
      whileUnverified: "Mientras tu email no esté verificado, tu cuenta permanecerá en estado de revisión."
    },
    accountUnderReview: {
      underReview: "Queremos informarte de que tu cuenta ha entrado en un breve proceso de revisión. No te preocupes, esto es algo completamente rutinario y forma parte de nuestros estándares de seguridad para proteger tu información y garantizar una experiencia segura.",
      whyReview: "¿Por qué hacemos esto?",
      whyReviewText: "En Easy US LLC nos tomamos muy en serio la seguridad de nuestros clientes. Este proceso nos permite verificar que toda la información está correcta y que tu cuenta está debidamente protegida.",
      duringProcess: "Durante este breve período, las funciones de tu cuenta estarán temporalmente limitadas. Esto significa que no podrás realizar nuevos pedidos ni modificar información existente, pero no te preocupes: esta situación es temporal y no afectará a ningún trámite que ya esté en curso.",
      whatHappens: "¿Qué pasará ahora?",
      step1: "Nuestro equipo revisará la información de tu cuenta (normalmente en 24-48 horas laborables)",
      step2: "Te notificaremos por este mismo correo en cuanto la revisión haya finalizado",
      step3: "Si necesitamos algún documento adicional, te lo haremos saber de forma clara y sencilla",
      teamReviewing: "Mientras tanto, si tienes cualquier pregunta o necesitas ayuda, no dudes en responder a este correo. Estamos aquí para ayudarte en todo lo que necesites.",
      patience: "Gracias por tu paciencia y confianza. Sabemos que tu tiempo es valioso y haremos todo lo posible para resolver esto lo antes posible.",
      closing: "Un abrazo del equipo de Easy US LLC"
    },
    accountVip: {
      updatedToVip: "Tu cuenta ha sido actualizada al estado VIP.",
      benefits: "Beneficios VIP:",
      priorityAttention: "Atención prioritaria y gestión acelerada",
      preferentialTracking: "Seguimiento preferente por nuestro equipo",
      fullAccess: "Acceso completo a todos los servicios",
      viewDashboard: "Ver Mi Área Cliente"
    },
    accountReactivated: {
      reactivated: "Tu cuenta ha sido reactivada correctamente.",
      canAccess: "Ya puedes acceder a tu Área Cliente y utilizar todos nuestros servicios con normalidad.",
      viewDashboard: "Ver Mi Área Cliente"
    },
    accountDeactivated: {
      deactivated: "Lamentamos informarte de que tu cuenta ha sido desactivada.",
      cannotAccess: "Mientras tu cuenta permanezca en este estado, no podrás acceder a tu Área Cliente ni realizar gestiones a través de nuestra plataforma.",
      contactSupport: "Si crees que esto es un error o deseas obtener más información, por favor contacta con nuestro equipo de soporte respondiendo a este correo."
    },
    confirmation: {
      greatNews: "¡Excelente noticia! Hemos recibido correctamente tu solicitud y ya estamos trabajando en ella. A partir de ahora, nuestro equipo se encargará de todo.",
      details: "Detalles de tu Solicitud",
      reference: "Referencia:",
      service: "Servicio:",
      company: "Empresa:",
      state: "Estado:",
      nextSteps: "Próximos Pasos",
      step1: "Verificaremos que toda la información es correcta",
      step2: "Iniciaremos los trámites con las autoridades correspondientes",
      step3: "Te mantendremos informado en cada etapa del proceso",
      trackButton: "Seguir mi solicitud"
    },
    autoReply: {
      receivedMessage: "Hemos recibido tu mensaje correctamente y nuestro equipo lo revisará lo antes posible.",
      ticketNumber: "Número de ticket:",
      responding: "Nos pondremos en contacto contigo a través de este hilo de conversación. Puedes responder directamente a este correo para añadir más información.",
      seeMessages: "Ver Mensajes"
    },
    orderUpdate: {
      statusChanged: "El estado de tu solicitud ha cambiado.",
      newStatus: "Nuevo estado:",
      trackButton: "Ver detalles completos"
    },
    orderCompleted: {
      llcReady: "¡Tu LLC está lista!",
      congratulations: "¡Enhorabuena! Tu LLC ha sido constituida correctamente y ya está activa. A partir de ahora, puedes operar legalmente con tu empresa estadounidense.",
      accessDocuments: "Ya puedes acceder a tus documentos oficiales desde tu Área Cliente:",
      documentList: "Documentos disponibles:",
      articlesOrg: "Articles of Organization",
      einLetter: "EIN Letter (IRS)",
      registeredAgent: "Certificado de Registered Agent",
      viewDocuments: "Ver mis documentos",
      nextSteps: "Próximos pasos:",
      activateBanking: "Activar cuenta bancaria (si solicitado)",
      operatingAgreement: "Generar tu Operating Agreement",
      trackExpenses: "Comenzar a registrar ingresos y gastos",
      hereForYou: "Estamos aquí para acompañarte en esta nueva etapa. Si tienes cualquier duda, no dudes en escribirnos."
    },
    noteReceived: {
      teamNote: "Nuestro equipo te ha enviado un mensaje:",
      respondNote: "Puedes responder directamente a este correo o acceder a tu Área Cliente para ver el historial completo."
    },
    adminNote: {
      messageAbout: "Tienes un mensaje importante sobre tu solicitud:",
      viewTicket: "Ver Ticket"
    },
    paymentRequest: {
      paymentRequired: "Se requiere un pago para continuar con tu servicio:",
      amount: "Importe:",
      payNow: "Pagar ahora",
      securePayment: "El pago se procesa de forma segura a través de Stripe."
    },
    documentRequest: {
      needDocument: "Necesitamos documentación adicional para continuar con tu solicitud:",
      documentType: "Documento solicitado:",
      important: "Importante:",
      uploadInstruction: "Por favor, sube el documento solicitado lo antes posible para evitar retrasos en el proceso.",
      uploadButton: "Subir documento"
    },
    documentUploaded: {
      documentReceived: "Hemos recibido correctamente tu documento.",
      forOrder: "Para la solicitud:",
      reviewing: "Nuestro equipo lo revisará y te notificaremos si es necesaria alguna acción adicional.",
      trackButton: "Ver estado de mi solicitud"
    },
    messageReply: {
      newReply: "Tienes una nueva respuesta en tu conversación:",
      ticket: "Ticket:",
      viewConversation: "Ver conversación"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "Has solicitado cambiar tu contraseña. Utiliza el siguiente código para confirmar:",
      useCode: "Utiliza el siguiente código para confirmar el cambio:",
      yourCode: "Tu código de verificación:",
      important: "Importante:",
      validFor: "Este código es válido durante <strong>15 minutos</strong>",
      doNotShare: "No lo compartas con nadie",
      notRequested: "Si no has solicitado este cambio, ignora este mensaje y tu contraseña permanecerá sin cambios."
    },
    accountLocked: {
      locked: "Tu cuenta ha sido bloqueada temporalmente por seguridad.",
      attempts: "Hemos detectado múltiples intentos de acceso fallidos. Para proteger tu cuenta, hemos activado un bloqueo temporal.",
      contactSupport: "Para desbloquear tu cuenta, contacta con nuestro equipo de soporte:",
      unlockButton: "Contactar Soporte"
    },
    renewalReminder: {
      dueDate: "Fecha de vencimiento:",
      daysRemaining: "Días restantes:",
      renewNow: "Renovar ahora",
      whatHappens: "¿Qué pasa si no renuevo?",
      penalties: "Posibles penalizaciones y recargos",
      agentExpires: "Tu registered agent expirará",
      goodStanding: "Tu LLC podría perder el buen estado",
      viewCalendar: "Ver calendario fiscal"
    },
    registrationOtp: {
      almostDone: "¡Ya casi está! Solo falta confirmar tu email.",
      confirmEmail: "Para completar el registro de tu cuenta, introduce el siguiente código de verificación:",
      yourCode: "Tu código de verificación:",
      important: "Importante:",
      validFor: "Este código expira en <strong>15 minutos</strong>",
      doNotShare: "No lo compartas con nadie",
      ignoreMessage: "Si no has creado una cuenta con nosotros, puedes ignorar este mensaje."
    },
    operatingAgreementReady: {
      ready: "¡Tu Operating Agreement está listo!",
      generated: "Hemos generado tu Operating Agreement personalizado. Ya está disponible en tu Área Cliente.",
      whatIs: "¿Qué es el Operating Agreement?",
      explanation: "Es el documento legal que establece las reglas de funcionamiento de tu LLC, incluyendo la estructura de propiedad, distribución de beneficios y responsabilidades de los miembros.",
      viewDocument: "Ver mi documento",
      tip: "Consejo:",
      tipText: "Guarda una copia firmada de este documento junto con tus otros archivos importantes de la empresa."
    },
    abandonedApplication: {
      incomplete: "Tu solicitud está incompleta",
      savedDraft: "Hemos guardado tu progreso. Puedes continuar donde lo dejaste en cualquier momento.",
      continueButton: "Continuar mi solicitud",
      tip: "Consejo:",
      tipText: "Completa tu solicitud para que podamos empezar a trabajar en tu LLC lo antes posible.",
      expiring: "Tu borrador expirará en 48 horas si no lo completas."
    },
    calculatorResults: {
      results: "Resultados de tu cálculo",
      summary: "Resumen fiscal:",
      income: "Ingresos anuales:",
      expenses: "Gastos deducibles:",
      autonomoTax: "Impuestos como autónomo:",
      llcTax: "Impuestos con LLC:",
      savings: "Ahorro estimado:",
      disclaimer: "Estos cálculos son orientativos y pueden variar según tu situación fiscal específica. Consulta con un asesor fiscal cualificado."
    }
  },
  en: {
    common: {
      greeting: "Hello",
      closing: "Best regards,",
      doubts: "If you have any questions, reply directly to this email.",
      client: "Client"
    },
    otp: {
      thanks: "Thank you for continuing with your process at Easy US LLC.",
      forSecurity: "To ensure the security of your account, use the following verification code:",
      yourCode: "Your OTP code:",
      important: "Important:",
      personalAndConfidential: "This code is personal and confidential",
      validFor: "It is valid for <strong>15 minutes</strong> for security reasons",
      doNotShare: "Do not share it with anyone",
      ignoreMessage: "If you did not request this code, you can safely ignore this message."
    },
    welcome: {
      welcomeMessage: "Welcome to Easy US LLC! We're thrilled to have you with us.",
      accountCreated: "Your account has been created successfully and you can start exploring everything we can do together. From your Client Area you'll have access to:",
      accessFrom: "From your Client Area you'll have access to:",
      realTimeTracking: "Real-time tracking of your requests",
      documentCenter: "Documentation center to download all your files",
      professionalTools: "Professional tools like invoice generator",
      fiscalCalendar: "Fiscal calendar with your important dates",
      directSupport: "Direct communication with our support team",
      hereToHelp: "We're here to help you at every step of your business journey in the United States. If you have any questions, don't hesitate to contact us.",
      exploreButton: "Explore My Client Area"
    },
    accountPendingVerification: {
      accountCreatedBut: "Your account has been created successfully, but you need to verify your email to fully activate it.",
      actionRequired: "Action required:",
      accessAndVerify: "Access your Client Area and verify your email to activate your account and access all features.",
      verifyButton: "Verify my email",
      whileUnverified: "While your email is not verified, your account will remain under review."
    },
    accountUnderReview: {
      underReview: "We wanted to let you know that your account has entered a brief review process. Don't worry, this is completely routine and is part of our security standards to protect your information and ensure a safe experience.",
      whyReview: "Why do we do this?",
      whyReviewText: "At Easy US LLC, we take our clients' security very seriously. This process allows us to verify that all information is correct and that your account is properly protected.",
      duringProcess: "During this brief period, your account functions will be temporarily limited. This means you won't be able to place new orders or modify existing information, but don't worry: this situation is temporary and won't affect any procedures already in progress.",
      whatHappens: "What happens now?",
      step1: "Our team will review your account information (usually within 24-48 business hours)",
      step2: "We'll notify you by this same email once the review is complete",
      step3: "If we need any additional documents, we'll let you know clearly and simply",
      teamReviewing: "In the meantime, if you have any questions or need help, don't hesitate to reply to this email. We're here to help you with whatever you need.",
      patience: "Thank you for your patience and trust. We know your time is valuable and we'll do everything possible to resolve this as quickly as possible.",
      closing: "Warm regards from the Easy US LLC team"
    },
    accountVip: {
      updatedToVip: "Your account has been upgraded to VIP status.",
      benefits: "VIP Benefits:",
      priorityAttention: "Priority attention and expedited processing",
      preferentialTracking: "Preferential tracking by our team",
      fullAccess: "Full access to all services",
      viewDashboard: "View My Client Area"
    },
    accountReactivated: {
      reactivated: "Your account has been successfully reactivated.",
      canAccess: "You can now access your Client Area and use all our services normally.",
      viewDashboard: "View My Client Area"
    },
    accountDeactivated: {
      deactivated: "We regret to inform you that your account has been deactivated.",
      cannotAccess: "While your account remains in this state, you will not be able to access your Client Area or perform any operations through our platform.",
      contactSupport: "If you believe this is an error or would like more information, please contact our support team by replying to this email."
    },
    confirmation: {
      greatNews: "Great news! We have received your request and are already working on it. From now on, our team will take care of everything.",
      details: "Request Details",
      reference: "Reference:",
      service: "Service:",
      company: "Company:",
      state: "State:",
      nextSteps: "Next Steps",
      step1: "We will verify that all information is correct",
      step2: "We will begin the procedures with the corresponding authorities",
      step3: "We will keep you informed at every stage of the process",
      trackButton: "Track my request"
    },
    autoReply: {
      receivedMessage: "We have received your message correctly and our team will review it as soon as possible.",
      ticketNumber: "Ticket number:",
      responding: "We will contact you through this conversation thread. You can reply directly to this email to add more information.",
      seeMessages: "View Messages"
    },
    orderUpdate: {
      statusChanged: "The status of your request has changed.",
      newStatus: "New status:",
      trackButton: "View full details"
    },
    orderCompleted: {
      llcReady: "Your LLC is ready!",
      congratulations: "Congratulations! Your LLC has been successfully formed and is now active. From now on, you can legally operate with your US company.",
      accessDocuments: "You can now access your official documents from your Client Area:",
      documentList: "Available documents:",
      articlesOrg: "Articles of Organization",
      einLetter: "EIN Letter (IRS)",
      registeredAgent: "Registered Agent Certificate",
      viewDocuments: "View my documents",
      nextSteps: "Next steps:",
      activateBanking: "Activate bank account (if requested)",
      operatingAgreement: "Generate your Operating Agreement",
      trackExpenses: "Start tracking income and expenses",
      hereForYou: "We're here to accompany you in this new stage. If you have any questions, don't hesitate to contact us."
    },
    noteReceived: {
      teamNote: "Our team has sent you a message:",
      respondNote: "You can reply directly to this email or access your Client Area to view the complete history."
    },
    adminNote: {
      messageAbout: "You have an important message about your request:",
      viewTicket: "View Ticket"
    },
    paymentRequest: {
      paymentRequired: "A payment is required to continue with your service:",
      amount: "Amount:",
      payNow: "Pay now",
      securePayment: "Payment is processed securely through Stripe."
    },
    documentRequest: {
      needDocument: "We need additional documentation to continue with your request:",
      documentType: "Requested document:",
      important: "Important:",
      uploadInstruction: "Please upload the requested document as soon as possible to avoid delays in the process.",
      uploadButton: "Upload document"
    },
    documentUploaded: {
      documentReceived: "We have successfully received your document.",
      forOrder: "For request:",
      reviewing: "Our team will review it and notify you if any additional action is required.",
      trackButton: "View request status"
    },
    messageReply: {
      newReply: "You have a new reply in your conversation:",
      ticket: "Ticket:",
      viewConversation: "View conversation"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "You have requested to change your password. Use the following code to confirm:",
      useCode: "Use the following code to confirm the change:",
      yourCode: "Your verification code:",
      important: "Important:",
      validFor: "This code is valid for <strong>15 minutes</strong>",
      doNotShare: "Do not share it with anyone",
      notRequested: "If you did not request this change, ignore this message and your password will remain unchanged."
    },
    accountLocked: {
      locked: "Your account has been temporarily locked for security.",
      attempts: "We have detected multiple failed access attempts. To protect your account, we have activated a temporary lock.",
      contactSupport: "To unlock your account, contact our support team:",
      unlockButton: "Contact Support"
    },
    renewalReminder: {
      dueDate: "Due date:",
      daysRemaining: "Days remaining:",
      renewNow: "Renew now",
      whatHappens: "What happens if I don't renew?",
      penalties: "Possible penalties and surcharges",
      agentExpires: "Your registered agent will expire",
      goodStanding: "Your LLC could lose good standing",
      viewCalendar: "View fiscal calendar"
    },
    registrationOtp: {
      almostDone: "Almost done! Just need to confirm your email.",
      confirmEmail: "To complete your account registration, enter the following verification code:",
      yourCode: "Your verification code:",
      important: "Important:",
      validFor: "This code expires in <strong>15 minutes</strong>",
      doNotShare: "Do not share it with anyone",
      ignoreMessage: "If you didn't create an account with us, you can ignore this message."
    },
    operatingAgreementReady: {
      ready: "Your Operating Agreement is ready!",
      generated: "We have generated your personalized Operating Agreement. It is now available in your Client Area.",
      whatIs: "What is the Operating Agreement?",
      explanation: "It is the legal document that establishes the operating rules of your LLC, including ownership structure, profit distribution, and member responsibilities.",
      viewDocument: "View my document",
      tip: "Tip:",
      tipText: "Keep a signed copy of this document along with your other important company files."
    },
    abandonedApplication: {
      incomplete: "Your application is incomplete",
      savedDraft: "We have saved your progress. You can continue where you left off at any time.",
      continueButton: "Continue my application",
      tip: "Tip:",
      tipText: "Complete your application so we can start working on your LLC as soon as possible.",
      expiring: "Your draft will expire in 48 hours if not completed."
    },
    calculatorResults: {
      results: "Your calculation results",
      summary: "Tax summary:",
      income: "Annual income:",
      expenses: "Deductible expenses:",
      autonomoTax: "Taxes as freelancer:",
      llcTax: "Taxes with LLC:",
      savings: "Estimated savings:",
      disclaimer: "These calculations are indicative and may vary depending on your specific tax situation. Consult with a qualified tax advisor."
    }
  },
  ca: {
    common: {
      greeting: "Hola",
      closing: "Salutacions,",
      doubts: "Si tens qualsevol dubte, respon directament a aquest correu.",
      client: "Client"
    },
    otp: {
      thanks: "Gràcies per continuar amb el teu procés a Easy US LLC.",
      forSecurity: "Per garantir la seguretat del teu compte, utilitza el següent codi de verificació:",
      yourCode: "El teu codi OTP:",
      important: "Important:",
      personalAndConfidential: "Aquest codi és personal i confidencial",
      validFor: "Té una validesa limitada a <strong>15 minuts</strong> per motius de seguretat",
      doNotShare: "No el comparteixis amb ningú",
      ignoreMessage: "Si no has sol·licitat aquest codi, pots ignorar aquest missatge amb total tranquil·litat."
    },
    welcome: {
      welcomeMessage: "Benvingut a Easy US LLC! Ens alegra molt tenir-te amb nosaltres.",
      accountCreated: "El teu compte s'ha creat correctament i ja pots començar a explorar tot el que podem fer junts. Des de la teva Àrea Client tindràs accés a:",
      accessFrom: "Des de la teva Àrea Client tindràs accés a:",
      realTimeTracking: "Seguiment en temps real de les teves sol·licituds",
      documentCenter: "Centre de documentació per descarregar tots els teus arxius",
      professionalTools: "Eines professionals com generador de factures",
      fiscalCalendar: "Calendari fiscal amb les teves dates importants",
      directSupport: "Comunicació directa amb el nostre equip de suport",
      hereToHelp: "Som aquí per ajudar-te en cada pas de la teva aventura empresarial als Estats Units. Si tens qualsevol pregunta, no dubtis a escriure'ns.",
      exploreButton: "Explorar la Meva Àrea Client"
    },
    accountPendingVerification: {
      accountCreatedBut: "El teu compte s'ha creat correctament, però necessites verificar el teu email per activar-lo completament.",
      actionRequired: "Acció requerida:",
      accessAndVerify: "Accedeix a la teva Àrea Client i verifica el teu email per activar el teu compte i accedir a totes les funcions.",
      verifyButton: "Verificar el meu email",
      whileUnverified: "Mentre el teu email no estigui verificat, el teu compte romandrà en estat de revisió."
    },
    accountUnderReview: {
      underReview: "Volem informar-te que el teu compte ha entrat en un breu procés de revisió. No et preocupis, això és completament rutinari i forma part dels nostres estàndards de seguretat per protegir la teva informació i garantir una experiència segura.",
      whyReview: "Per què fem això?",
      whyReviewText: "A Easy US LLC ens prenem molt seriosament la seguretat dels nostres clients. Aquest procés ens permet verificar que tota la informació és correcta i que el teu compte està degudament protegit.",
      duringProcess: "Durant aquest breu període, les funcions del teu compte estaran temporalment limitades. Això significa que no podràs realitzar noves comandes ni modificar informació existent, però no et preocupis: aquesta situació és temporal i no afectarà cap tràmit que ja estigui en curs.",
      whatHappens: "Què passarà ara?",
      step1: "El nostre equip revisarà la informació del teu compte (normalment en 24-48 hores laborables)",
      step2: "Et notificarem per aquest mateix correu quan la revisió hagi finalitzat",
      step3: "Si necessitem algun document addicional, t'ho farem saber de forma clara i senzilla",
      teamReviewing: "Mentrestant, si tens qualsevol pregunta o necessites ajuda, no dubtis a respondre a aquest correu. Estem aquí per ajudar-te en tot el que necessitis.",
      patience: "Gràcies per la teva paciència i confiança. Sabem que el teu temps és valuós i farem tot el possible per resoldre això el més aviat possible.",
      closing: "Una abraçada de l'equip d'Easy US LLC"
    },
    accountVip: {
      updatedToVip: "El teu compte ha estat actualitzat a l'estat VIP.",
      benefits: "Beneficis VIP:",
      priorityAttention: "Atenció prioritària i gestió accelerada",
      preferentialTracking: "Seguiment preferent pel nostre equip",
      fullAccess: "Accés complet a tots els serveis",
      viewDashboard: "Veure la Meva Àrea Client"
    },
    accountReactivated: {
      reactivated: "El teu compte ha estat reactivat correctament.",
      canAccess: "Ja pots accedir a la teva Àrea Client i utilitzar tots els nostres serveis amb normalitat.",
      viewDashboard: "Veure la Meva Àrea Client"
    },
    accountDeactivated: {
      deactivated: "Lamentem informar-te que el teu compte ha estat desactivat.",
      cannotAccess: "Mentre el teu compte romangui en aquest estat, no podràs accedir a la teva Àrea Client ni realitzar gestions a través de la nostra plataforma.",
      contactSupport: "Si creus que això és un error o desitges obtenir més informació, si us plau contacta amb el nostre equip de suport responent a aquest correu."
    },
    confirmation: {
      greatNews: "Excel·lent notícia! Hem rebut correctament la teva sol·licitud i ja estem treballant en ella. A partir d'ara, el nostre equip s'encarregarà de tot.",
      details: "Detalls de la teva Sol·licitud",
      reference: "Referència:",
      service: "Servei:",
      company: "Empresa:",
      state: "Estat:",
      nextSteps: "Propers Passos",
      step1: "Verificarem que tota la informació és correcta",
      step2: "Iniciarem els tràmits amb les autoritats corresponents",
      step3: "Et mantindrem informat en cada etapa del procés",
      trackButton: "Seguir la meva sol·licitud"
    },
    autoReply: {
      receivedMessage: "Hem rebut el teu missatge correctament i el nostre equip el revisarà el més aviat possible.",
      ticketNumber: "Número de ticket:",
      responding: "Ens posarem en contacte amb tu a través d'aquest fil de conversa. Pots respondre directament a aquest correu per afegir més informació.",
      seeMessages: "Veure Missatges"
    },
    orderUpdate: {
      statusChanged: "L'estat de la teva sol·licitud ha canviat.",
      newStatus: "Nou estat:",
      trackButton: "Veure detalls complets"
    },
    orderCompleted: {
      llcReady: "La teva LLC està llesta!",
      congratulations: "Felicitats! La teva LLC ha estat constituïda correctament i ja està activa. A partir d'ara, pots operar legalment amb la teva empresa estatunidenca.",
      accessDocuments: "Ja pots accedir als teus documents oficials des de la teva Àrea Client:",
      documentList: "Documents disponibles:",
      articlesOrg: "Articles of Organization",
      einLetter: "EIN Letter (IRS)",
      registeredAgent: "Certificat de Registered Agent",
      viewDocuments: "Veure els meus documents",
      nextSteps: "Propers passos:",
      activateBanking: "Activar compte bancari (si sol·licitat)",
      operatingAgreement: "Generar el teu Operating Agreement",
      trackExpenses: "Començar a registrar ingressos i despeses",
      hereForYou: "Som aquí per acompanyar-te en aquesta nova etapa. Si tens qualsevol dubte, no dubtis a escriure'ns."
    },
    noteReceived: {
      teamNote: "El nostre equip t'ha enviat un missatge:",
      respondNote: "Pots respondre directament a aquest correu o accedir a la teva Àrea Client per veure l'historial complet."
    },
    adminNote: {
      messageAbout: "Tens un missatge important sobre la teva sol·licitud:",
      viewTicket: "Veure Ticket"
    },
    paymentRequest: {
      paymentRequired: "Es requereix un pagament per continuar amb el teu servei:",
      amount: "Import:",
      payNow: "Pagar ara",
      securePayment: "El pagament es processa de forma segura a través de Stripe."
    },
    documentRequest: {
      needDocument: "Necessitem documentació addicional per continuar amb la teva sol·licitud:",
      documentType: "Document sol·licitat:",
      important: "Important:",
      uploadInstruction: "Si us plau, puja el document sol·licitat el més aviat possible per evitar retards en el procés.",
      uploadButton: "Pujar document"
    },
    documentUploaded: {
      documentReceived: "Hem rebut correctament el teu document.",
      forOrder: "Per a la sol·licitud:",
      reviewing: "El nostre equip el revisarà i et notificarem si és necessària alguna acció addicional.",
      trackButton: "Veure estat de la meva sol·licitud"
    },
    messageReply: {
      newReply: "Tens una nova resposta a la teva conversa:",
      ticket: "Ticket:",
      viewConversation: "Veure conversa"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "Has sol·licitat canviar la teva contrasenya. Utilitza el següent codi per confirmar:",
      useCode: "Utilitza el següent codi per confirmar el canvi:",
      yourCode: "El teu codi de verificació:",
      important: "Important:",
      validFor: "Aquest codi és vàlid durant <strong>15 minuts</strong>",
      doNotShare: "No el comparteixis amb ningú",
      notRequested: "Si no has sol·licitat aquest canvi, ignora aquest missatge i la teva contrasenya romandrà sense canvis."
    },
    accountLocked: {
      locked: "El teu compte ha estat bloquejat temporalment per seguretat.",
      attempts: "Hem detectat múltiples intents d'accés fallits. Per protegir el teu compte, hem activat un bloqueig temporal.",
      contactSupport: "Per desbloquejar el teu compte, contacta amb el nostre equip de suport:",
      unlockButton: "Contactar Suport"
    },
    renewalReminder: {
      dueDate: "Data de venciment:",
      daysRemaining: "Dies restants:",
      renewNow: "Renovar ara",
      whatHappens: "Què passa si no renovo?",
      penalties: "Possibles penalitzacions i recàrrecs",
      agentExpires: "El teu registered agent expirarà",
      goodStanding: "La teva LLC podria perdre el bon estat",
      viewCalendar: "Veure calendari fiscal"
    },
    registrationOtp: {
      almostDone: "Ja gairebé està! Només falta confirmar el teu email.",
      confirmEmail: "Per completar el registre del teu compte, introdueix el següent codi de verificació:",
      yourCode: "El teu codi de verificació:",
      important: "Important:",
      validFor: "Aquest codi expira en <strong>15 minuts</strong>",
      doNotShare: "No el comparteixis amb ningú",
      ignoreMessage: "Si no has creat un compte amb nosaltres, pots ignorar aquest missatge."
    },
    operatingAgreementReady: {
      ready: "El teu Operating Agreement està llest!",
      generated: "Hem generat el teu Operating Agreement personalitzat. Ja està disponible a la teva Àrea Client.",
      whatIs: "Què és l'Operating Agreement?",
      explanation: "És el document legal que estableix les regles de funcionament de la teva LLC, incloent l'estructura de propietat, distribució de beneficis i responsabilitats dels membres.",
      viewDocument: "Veure el meu document",
      tip: "Consell:",
      tipText: "Guarda una còpia signada d'aquest document juntament amb els teus altres arxius importants de l'empresa."
    },
    abandonedApplication: {
      incomplete: "La teva sol·licitud està incompleta",
      savedDraft: "Hem guardat el teu progrés. Pots continuar on ho vas deixar en qualsevol moment.",
      continueButton: "Continuar la meva sol·licitud",
      tip: "Consell:",
      tipText: "Completa la teva sol·licitud perquè puguem començar a treballar en la teva LLC el més aviat possible.",
      expiring: "El teu esborrany expirarà en 48 hores si no el completes."
    },
    calculatorResults: {
      results: "Resultats del teu càlcul",
      summary: "Resum fiscal:",
      income: "Ingressos anuals:",
      expenses: "Despeses deduïbles:",
      autonomoTax: "Impostos com a autònom:",
      llcTax: "Impostos amb LLC:",
      savings: "Estalvi estimat:",
      disclaimer: "Aquests càlculs són orientatius i poden variar segons la teva situació fiscal específica. Consulta amb un assessor fiscal qualificat."
    }
  }
};

export function getEmailTranslations(lang: EmailLanguage = 'es'): EmailTranslations {
  return translations[lang] || translations.es;
}

export function getCommonDoubtsText(lang: EmailLanguage = 'es'): string {
  const t = getEmailTranslations(lang);
  return t.common.doubts;
}

export function getDefaultClientName(lang: EmailLanguage = 'es'): string {
  const t = getEmailTranslations(lang);
  return t.common.client;
}

export function getWelcomeNotificationTitle(lang: EmailLanguage = 'es'): string {
  const titles: Record<EmailLanguage, string> = {
    es: "¡Bienvenido a Easy US LLC!",
    en: "Welcome to Easy US LLC!",
    ca: "Benvingut a Easy US LLC!"
  };
  return titles[lang] || titles.es;
}

export function getWelcomeNotificationMessage(lang: EmailLanguage = 'es'): string {
  const messages: Record<EmailLanguage, string> = {
    es: "Gracias por confiar en nosotros para crear tu empresa en EE.UU. Explora tu panel para comenzar.",
    en: "Thank you for trusting us to create your US business. Explore your dashboard to get started.",
    ca: "Gràcies per confiar en nosaltres per crear la teva empresa als EUA. Explora el teu panell per començar."
  };
  return messages[lang] || messages.es;
}

export function getWelcomeEmailSubject(lang: EmailLanguage = 'es'): string {
  const subjects: Record<EmailLanguage, string> = {
    es: "¡Bienvenido a Easy US LLC!",
    en: "Welcome to Easy US LLC!",
    ca: "Benvingut a Easy US LLC!"
  };
  return subjects[lang] || subjects.es;
}
