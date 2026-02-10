export type EmailLanguage = 'es' | 'en' | 'ca' | 'fr' | 'de' | 'it' | 'pt';

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
    ipDetected: string;
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
  accountDeactivatedByUser: {
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
    currentStatus: string;
    inReview: string;
    whatNow: string;
    validatingInfo: string;
    nextSteps: string;
    step1: string;
    step2: string;
    step3: string;
    trackButton: string;
    questionRef: string;
  };
  autoReply: {
    receivedMessage: string;
    ticketNumber: string;
    estimatedResponse: string;
    responding: string;
    seeMessages: string;
  };
  orderUpdate: {
    statusChanged: string;
    orderLabel: string;
    newStatus: string;
    statusPending: string;
    statusProcessing: string;
    statusPaid: string;
    statusFiled: string;
    statusDocumentsReady: string;
    statusCompleted: string;
    statusCancelled: string;
    clarification: string;
    trackButton: string;
  };
  orderCompleted: {
    llcReady: string;
    congratulations: string;
    docsReady: string;
    accessDocuments: string;
    whatYouFind: string;
    documentList: string;
    articlesOrg: string;
    einLetter: string;
    registeredAgent: string;
    additionalGuides: string;
    viewDocuments: string;
    nextSteps: string;
    activateBanking: string;
    operatingAgreement: string;
    trackExpenses: string;
    hereForYou: string;
    feedbackRequest: string;
  };
  noteReceived: {
    teamNote: string;
    relatedToOrder: string;
    respondNote: string;
    viewClientArea: string;
  };
  adminNote: {
    messageAbout: string;
    viewTicket: string;
    viewClientArea: string;
  };
  paymentRequest: {
    paymentRequired: string;
    messageLabel: string;
    amount: string;
    payNow: string;
    buttonFallback: string;
    securePayment: string;
  };
  documentRequest: {
    needDocument: string;
    messageLabel: string;
    documentType: string;
    referenceTicket: string;
    important: string;
    uploadInstruction: string;
    uploadButton: string;
  };
  documentUploaded: {
    documentReceived: string;
    forOrder: string;
    accessDownload: string;
    reviewing: string;
    viewDocuments: string;
    trackButton: string;
  };
  messageReply: {
    newReply: string;
    repliedToQuery: string;
    ticket: string;
    viewConversation: string;
    viewClientArea: string;
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
  profileChangeOtp: {
    title: string;
    sensitiveChangeRequest: string;
    yourCode: string;
    important: string;
    personalAndConfidential: string;
    validFor: string;
    doNotShare: string;
    ignoreMessage: string;
  };
  accountLocked: {
    locked: string;
    attempts: string;
    verifyIdentity: string;
    idRequirement: string;
    birthDateConfirm: string;
    referenceTicket: string;
    contactSupport: string;
    resetPassword: string;
    unlockButton: string;
  };
  renewalReminder: {
    reminderText: string;
    expiresIn: string;
    dueDate: string;
    daysRemaining: string;
    withoutMaintenance: string;
    registeredAgentActive: string;
    annualReports: string;
    taxCompliance: string;
    legalAddress: string;
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
    clientIdLabel: string;
    ignoreMessage: string;
  };
  operatingAgreementReady: {
    ready: string;
    generated: string;
    llcData: string;
    companyLabel: string;
    stateLabel: string;
    einLabel: string;
    whatIs: string;
    explanation: string;
    fullExplanation: string;
    reason1: string;
    reason2: string;
    reason3: string;
    reason4: string;
    generateButton: string;
    autoGenerated: string;
    viewDocument: string;
    tip: string;
    tipText: string;
  };
  documentApproved: {
    title: string;
    approved: string;
    reviewedAndApproved: string;
    viewDocuments: string;
  };
  documentRejected: {
    title: string;
    rejected: string;
    reviewedAndRejected: string;
    reason: string;
    pleaseReupload: string;
    viewDocuments: string;
  };
  profileChangesVerified: {
    title: string;
    client: string;
    email: string;
    clientId: string;
    fieldsModified: string;
    verifiedWithOtp: string;
  };
  abandonedApplication: {
    incomplete: string;
    noticeText: string;
    importantNote: string;
    draftDeletion: string;
    understandDoubts: string;
    questionsHelp: string;
    whyChoose: string;
    reason1: string;
    reason2: string;
    reason3: string;
    reason4: string;
    reason5: string;
    noMoreReminders: string;
    savedDraft: string;
    continueButton: string;
    tip: string;
    tipText: string;
    expiring: string;
    llcFormation: string;
    maintenancePack: string;
    dontLoseProgress: string;
    lastHours: string;
    autoDeleteWarning: string;
  };
  calculatorResults: {
    results: string;
    introText: string;
    summary: string;
    income: string;
    expenses: string;
    autonomoTax: string;
    llcTax: string;
    potentialSavings: string;
    savings: string;
    withLLC: string;
    learnMore: string;
    viewServices: string;
    disclaimer: string;
  };
  newsletter: {
    confirmed: string;
    willReceive: string;
    unsubscribe: string;
  };
  orderEvent: {
    update: string;
    date: string;
    viewDetails: string;
  };
  identityVerificationRequest: {
    subject: string;
    intro: string;
    whyTitle: string;
    whyText: string;
    whatNeedTitle: string;
    whatNeedText: string;
    acceptedDocs: string;
    doc1: string;
    doc2: string;
    doc3: string;
    howToUploadTitle: string;
    howStep1: string;
    howStep2: string;
    howStep3: string;
    uploadButton: string;
    duringProcess: string;
    adminNotes: string;
    teamMessage: string;
    closing: string;
  };
  identityVerificationApproved: {
    subject: string;
    intro: string;
    verified: string;
    accessRestored: string;
    viewDashboard: string;
    closing: string;
  };
  identityVerificationRejected: {
    subject: string;
    intro: string;
    notApproved: string;
    reason: string;
    whatToDo: string;
    reuploadStep: string;
    uploadButton: string;
    needHelp: string;
    closing: string;
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
      ignoreMessage: "Si no has solicitado este código, puedes ignorar este mensaje con total tranquilidad.",
      ipDetected: "Intento de acceso detectado desde la IP:"
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
    accountDeactivatedByUser: {
      deactivated: "Hemos recibido tu solicitud para eliminar tu cuenta. Tu cuenta ha sido desactivada y será eliminada en breve.",
      cannotAccess: "A partir de ahora no podrás acceder a tu Área Cliente ni realizar gestiones a través de nuestra plataforma.",
      contactSupport: "Si has cambiado de opinión o crees que se trata de un error, contacta con nuestro equipo de soporte respondiendo a este correo lo antes posible."
    },
    confirmation: {
      greatNews: "¡Excelente noticia! Hemos recibido correctamente tu solicitud y ya estamos trabajando en ella. A partir de ahora, nuestro equipo se encargará de todo.",
      details: "Detalles de tu Solicitud",
      reference: "Referencia:",
      service: "Servicio:",
      company: "Empresa:",
      state: "Estado:",
      currentStatus: "Estado actual:",
      inReview: "En revisión",
      whatNow: "¿Qué pasa ahora?",
      validatingInfo: "Nuestro equipo está validando toda la información que nos proporcionaste. En las próximas horas recibirás actualizaciones sobre el progreso de tu solicitud directamente en tu correo. También podrás seguir el estado en tiempo real desde tu Área Cliente.",
      nextSteps: "Próximos Pasos",
      step1: "Verificaremos que toda la información es correcta",
      step2: "Iniciaremos los trámites con las autoridades correspondientes",
      step3: "Te mantendremos informado en cada etapa del proceso",
      trackButton: "Ver Estado de mi Solicitud",
      questionRef: "¿Tienes alguna pregunta? Simplemente responde a este correo mencionando tu referencia y te ayudaremos encantados."
    },
    autoReply: {
      receivedMessage: "Tu mensaje ha sido recibido correctamente.",
      ticketNumber: "Número de ticket",
      estimatedResponse: "Tiempo estimado de respuesta: <strong>24-48 horas laborables</strong>",
      responding: "Nuestro equipo revisará tu consulta y te responderá lo antes posible. Si necesitas añadir información adicional, responde directamente a este correo.",
      seeMessages: "Ver Mensajes"
    },
    orderUpdate: {
      statusChanged: "El estado de tu pedido ha sido actualizado.",
      orderLabel: "Pedido:",
      newStatus: "Nuevo estado:",
      statusPending: "Pendiente",
      statusProcessing: "En proceso",
      statusPaid: "Pagado",
      statusFiled: "Presentado",
      statusDocumentsReady: "Documentos listos",
      statusCompleted: "Completado",
      statusCancelled: "Cancelado",
      clarification: "Para cualquier aclaración sobre esta actualización, responde directamente a este correo.",
      trackButton: "Ver detalles completos"
    },
    orderCompleted: {
      llcReady: "¡Tu LLC está lista!",
      congratulations: "¡Felicidades! Tu pedido ha sido completado con éxito. Todo está listo para que puedas empezar a operar con tu empresa en Estados Unidos.",
      docsReady: "Tu documentación está lista",
      accessDocuments: "Ya puedes acceder y descargar todos los documentos de tu empresa desde tu Centro de Documentación.",
      whatYouFind: "¿Qué encontrarás?",
      documentList: "Documentos disponibles:",
      articlesOrg: "Articles of Organization (documento de constitución)",
      einLetter: "Carta del EIN del IRS",
      registeredAgent: "Información del agente registrado",
      additionalGuides: "Guías y documentos adicionales según tu servicio",
      viewDocuments: "Ver Mis Documentos",
      nextSteps: "Próximos pasos:",
      activateBanking: "Activar cuenta bancaria (si solicitado)",
      operatingAgreement: "Generar tu Operating Agreement",
      trackExpenses: "Comenzar a registrar ingresos y gastos",
      hereForYou: "Recuerda que seguimos aquí para ayudarte en todo lo que necesites. Si tienes dudas sobre los siguientes pasos, como abrir una cuenta bancaria o configurar tu pasarela de pagos, no dudes en escribirnos.",
      feedbackRequest: "Tu experiencia es muy importante para nosotros. Si tienes un momento, nos encantaría conocer tu opinión sobre nuestro servicio."
    },
    noteReceived: {
      teamNote: "Tienes un nuevo mensaje de nuestro equipo",
      relatedToOrder: "relacionado con tu pedido",
      respondNote: "Puedes responder directamente a este correo o acceder a tu Área Cliente para ver el historial completo.",
      viewClientArea: "Ver Mi Área Cliente"
    },
    adminNote: {
      messageAbout: "Tienes un mensaje importante sobre tu solicitud:",
      viewTicket: "Ver Ticket",
      viewClientArea: "Ver Mi Área Cliente"
    },
    paymentRequest: {
      paymentRequired: "Se ha generado una solicitud de pago para continuar con tu trámite",
      messageLabel: "Mensaje:",
      amount: "por un valor de",
      payNow: "Realizar Pago",
      buttonFallback: "Si el botón no funciona, copia y pega este enlace:",
      securePayment: "El pago se procesa de forma segura a través de Stripe."
    },
    documentRequest: {
      needDocument: "Nuestro equipo requiere que subas el siguiente documento:",
      messageLabel: "Mensaje:",
      documentType: "Documento solicitado:",
      referenceTicket: "Ticket de referencia:",
      important: "Importante:",
      uploadInstruction: "Por favor, sube el documento solicitado lo antes posible para evitar retrasos en el proceso.",
      uploadButton: "Subir Documento"
    },
    documentUploaded: {
      documentReceived: "Hemos añadido un nuevo documento a tu expediente:",
      forOrder: "Pedido:",
      accessDownload: "Puedes acceder y descargar este documento desde tu Área Cliente.",
      reviewing: "Nuestro equipo lo revisará y te notificaremos si es necesaria alguna acción adicional.",
      viewDocuments: "Ver Mis Documentos",
      trackButton: "Ver estado de mi solicitud"
    },
    messageReply: {
      newReply: "Tienes una nueva respuesta en tu conversación:",
      repliedToQuery: "Hemos respondido a tu consulta",
      ticket: "Ticket:",
      viewConversation: "Ver conversación",
      viewClientArea: "Ver Mi Área Cliente"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "Has solicitado cambiar tu contraseña. Usa este código para verificar tu identidad:",
      useCode: "Utiliza el siguiente código para confirmar el cambio:",
      yourCode: "Tu código de verificación:",
      important: "Importante:",
      validFor: "Este código expira en <strong>10 minutos</strong>",
      doNotShare: "No lo compartas con nadie",
      notRequested: "Si no solicitaste este cambio, ignora este mensaje."
    },
    profileChangeOtp: {
      title: "Verificación de Identidad",
      sensitiveChangeRequest: "Se ha solicitado un cambio en los datos sensibles de tu perfil. Para confirmar tu identidad, utiliza el siguiente código de verificación:",
      yourCode: "Tu código de verificación:",
      important: "Importante:",
      personalAndConfidential: "Este código es personal y confidencial",
      validFor: "Tiene una validez de <strong>24 horas</strong>",
      doNotShare: "No lo compartas con nadie",
      ignoreMessage: "Si no has solicitado este cambio, puedes ignorar este mensaje con total tranquilidad."
    },
    accountLocked: {
      locked: "Por su seguridad, su cuenta ha sido temporalmente bloqueada tras detectar múltiples intentos de acceso fallidos.",
      attempts: "Para desbloquear su cuenta y verificar su identidad, necesitamos que nos envíe:",
      verifyIdentity: "Para desbloquear su cuenta y verificar su identidad, necesitamos que nos envíe:",
      idRequirement: "Imagen del DNI/Pasaporte de alta resolución (ambas caras)",
      birthDateConfirm: "Su fecha de nacimiento confirmada",
      referenceTicket: "Su Ticket ID de referencia es:",
      contactSupport: "Para desbloquear tu cuenta, contacta con nuestro equipo de soporte:",
      resetPassword: "Restablecer contraseña",
      unlockButton: "Contactar Soporte"
    },
    renewalReminder: {
      reminderText: "Te recordamos que el pack de mantenimiento de tu LLC",
      expiresIn: "Vence en",
      dueDate: "Fecha de vencimiento:",
      daysRemaining: "Días restantes:",
      withoutMaintenance: "Sin el pack de mantenimiento activo, tu LLC puede perder su buen estado legal. Esto incluye:",
      registeredAgentActive: "Agente registrado activo",
      annualReports: "Presentación de informes anuales",
      taxCompliance: "Cumplimiento fiscal (IRS 1120/5472)",
      legalAddress: "Domicilio legal en Estados Unidos",
      renewNow: "Renovar Ahora",
      whatHappens: "¿Qué pasa si no renuevo?",
      penalties: "Posibles penalizaciones y recargos",
      agentExpires: "Tu registered agent expirará",
      goodStanding: "Tu LLC podría perder el buen estado",
      viewCalendar: "Ver calendario fiscal"
    },
    registrationOtp: {
      almostDone: "Gracias por registrarte en Easy US LLC. Tu código de verificación es:",
      confirmEmail: "Para completar el registro de tu cuenta, introduce el siguiente código de verificación:",
      yourCode: "Tu código de verificación:",
      important: "Importante:",
      validFor: "Este código expira en",
      doNotShare: "No lo compartas con nadie",
      clientIdLabel: "Tu ID de cliente es:",
      ignoreMessage: "Si no has creado una cuenta con nosotros, puedes ignorar este mensaje."
    },
    operatingAgreementReady: {
      ready: "¡Tu Operating Agreement está listo!",
      generated: "Tenemos excelentes noticias para ti.",
      llcData: "Datos de tu LLC",
      companyLabel: "Empresa:",
      stateLabel: "Estado:",
      einLabel: "EIN:",
      whatIs: "¿Qué es el Operating Agreement?",
      explanation: "Es el documento legal que establece las reglas de funcionamiento de tu LLC, incluyendo la estructura de propiedad, distribución de beneficios y responsabilidades de los miembros.",
      fullExplanation: "Es el documento legal fundamental de tu LLC. Define cómo se gestiona tu empresa, las responsabilidades del propietario y las reglas de operación. Aunque en algunos estados no es obligatorio, es altamente recomendable tenerlo porque:",
      reason1: "Refuerza la separación entre tus finanzas personales y las de la empresa",
      reason2: "Es requerido por bancos y procesadores de pago como Stripe",
      reason3: "Proporciona protección legal adicional para ti como propietario",
      reason4: "Documenta oficialmente la estructura de tu negocio",
      generateButton: "Generar mi Operating Agreement",
      autoGenerated: "El documento se generará automáticamente con los datos de tu LLC y se guardará en tu Centro de Documentación para que puedas descargarlo cuando lo necesites.",
      viewDocument: "Ver mi documento",
      tip: "Consejo:",
      tipText: "Guarda una copia firmada de este documento junto con tus otros archivos importantes de la empresa."
    },
    documentApproved: {
      title: "Documento Aprobado",
      approved: "Aprobado",
      reviewedAndApproved: "Tu documento ha sido revisado y aprobado correctamente.",
      viewDocuments: "Ver mis documentos"
    },
    documentRejected: {
      title: "Documento Rechazado - Acción Requerida",
      rejected: "Rechazado",
      reviewedAndRejected: "Tu documento ha sido revisado y rechazado.",
      reason: "Motivo",
      pleaseReupload: "Por favor, accede a tu panel de cliente y sube nuevamente el documento corregido.",
      viewDocuments: "Ver mis documentos"
    },
    profileChangesVerified: {
      title: "Cambios de Perfil Verificados con OTP",
      client: "Cliente",
      email: "Email",
      clientId: "ID de Cliente",
      fieldsModified: "Campos modificados",
      verifiedWithOtp: "Cambio verificado con OTP"
    },
    abandonedApplication: {
      incomplete: "Tu solicitud está incompleta",
      noticeText: "Hemos notado que empezaste a completar tu solicitud de",
      importantNote: "Nota importante:",
      draftDeletion: "Tu borrador se eliminará automáticamente si no lo completas. Por motivos de seguridad y protección de datos, no podemos mantener solicitudes incompletas indefinidamente.",
      understandDoubts: "Entendemos que dar el paso de crear una LLC puede generar algunas dudas. Queremos que sepas que estamos aquí para ayudarte en cada paso del proceso.",
      questionsHelp: "Si tienes alguna pregunta o necesitas asistencia para completar tu solicitud, simplemente responde a este correo y te ayudaremos encantados.",
      whyChoose: "¿Por qué elegir Easy US LLC?",
      reason1: "Formación completa en 48-72 horas",
      reason2: "Asistencia en español durante todo el proceso",
      reason3: "Obtención del EIN incluida",
      reason4: "Ayuda con apertura de cuenta bancaria",
      reason5: "Soporte continuo post-formación",
      noMoreReminders: "Si finalmente decides no continuar, no te enviaremos más recordatorios sobre esta solicitud. Tu privacidad es importante para nosotros.",
      savedDraft: "No te preocupes, hemos guardado todo tu progreso para que puedas continuar exactamente donde lo dejaste.",
      continueButton: "Continuar mi Solicitud",
      tip: "Consejo:",
      tipText: "Completa tu solicitud para que podamos empezar a trabajar en tu LLC lo antes posible.",
      expiring: "Tu borrador expirará en 48 horas si no lo completas.",
      llcFormation: "constitución de tu LLC",
      maintenancePack: "paquete de mantenimiento",
      dontLoseProgress: "No pierdas tu progreso. Retoma tu solicitud ahora y completa el proceso en pocos minutos.",
      lastHours: "últimas horas",
      autoDeleteWarning: "Tu solicitud se eliminará automáticamente si no la completas."
    },
    calculatorResults: {
      results: "Resultados de tu cálculo",
      introText: "Aquí tienes el resumen de tu comparación fiscal que solicitaste. Hemos analizado los números y queremos que tengas toda la información para tomar la mejor decisión para tu negocio.",
      summary: "Resumen de tu Análisis",
      income: "Ingresos anuales:",
      expenses: "Gastos deducibles:",
      autonomoTax: "Impuestos como autónomo:",
      llcTax: "Impuestos con LLC:",
      potentialSavings: "Tu ahorro potencial:",
      savings: "Ahorro estimado:",
      withLLC: "Con una LLC en Estados Unidos, podrías optimizar significativamente tu carga fiscal mientras operas de forma completamente legal. Este ahorro se mantiene año tras año, lo que puede suponer una diferencia importante para tu negocio a largo plazo.",
      learnMore: "¿Te gustaría saber más sobre cómo funciona? Estaremos encantados de resolver todas tus dudas sin ningún compromiso.",
      viewServices: "Ver Nuestros Servicios",
      disclaimer: "Este cálculo es orientativo y se basa en los datos que proporcionaste. Para un análisis personalizado de tu situación, no dudes en contactarnos."
    },
    newsletter: {
      confirmed: "Tu suscripción ha sido confirmada correctamente.",
      willReceive: "Recibirás información relevante sobre servicios, actualizaciones y novedades relacionadas con Easy US LLC.",
      unsubscribe: "Puedes darte de baja en cualquier momento desde el enlace incluido en nuestros correos."
    },
    orderEvent: {
      update: "Tu pedido tiene una actualización:",
      date: "Fecha:",
      viewDetails: "Ver Detalles"
    },
    identityVerificationRequest: {
      subject: "Verificación de identidad requerida | Easy US LLC",
      intro: "Necesitamos verificar tu identidad para garantizar la seguridad de tu cuenta y cumplir con nuestras políticas de protección de datos.",
      whyTitle: "¿Por qué es necesario?",
      whyText: "En Easy US LLC nos tomamos muy en serio la seguridad de nuestros clientes. Esta verificación es un paso esencial para proteger tu información personal y garantizar que solo tú tengas acceso a tu cuenta.",
      whatNeedTitle: "¿Qué necesitamos?",
      whatNeedText: "Te pedimos que subas un documento de identidad oficial válido y vigente. Acepta los siguientes formatos:",
      acceptedDocs: "Documentos aceptados:",
      doc1: "DNI / Cédula de identidad (ambas caras)",
      doc2: "Pasaporte (página principal con foto)",
      doc3: "NIE / Tarjeta de residencia (ambas caras)",
      howToUploadTitle: "¿Cómo subir tu documento?",
      howStep1: "Accede a tu Área Cliente desde el botón de abajo",
      howStep2: "Verás una sección para cargar tu documento de identidad",
      howStep3: "Sube una foto clara y legible de tu documento (PDF, JPG o PNG, máximo 5 MB)",
      uploadButton: "Subir Documento de Identidad",
      duringProcess: "Mientras se procesa tu verificación, las funciones de tu cuenta estarán temporalmente limitadas. No podrás realizar nuevos pedidos ni modificar información existente, pero no te preocupes: tus trámites en curso no se verán afectados.",
      adminNotes: "Nota del equipo:",
      teamMessage: "Nuestro equipo revisará tu documento en un plazo de 24-48 horas laborables. Te notificaremos por correo electrónico en cuanto la verificación haya sido completada.",
      closing: "Gracias por tu colaboración y paciencia. Estamos aquí para ayudarte."
    },
    identityVerificationApproved: {
      subject: "Identidad verificada correctamente | Easy US LLC",
      intro: "¡Excelentes noticias! Tu identidad ha sido verificada correctamente.",
      verified: "Nuestro equipo ha revisado tu documentación y todo está en orden. Tu cuenta ha sido reactivada y ya puedes utilizar todos nuestros servicios con normalidad.",
      accessRestored: "El acceso completo a tu cuenta ha sido restaurado. Ya puedes realizar pedidos, modificar tu perfil y acceder a todos los servicios disponibles.",
      viewDashboard: "Ir a Mi Área Cliente",
      closing: "Gracias por tu paciencia y colaboración. Estamos encantados de seguir ayudándote."
    },
    identityVerificationRejected: {
      subject: "Verificación de identidad: se requiere nueva documentación | Easy US LLC",
      intro: "Hemos revisado la documentación que nos enviaste, pero lamentablemente no hemos podido verificar tu identidad con el documento proporcionado.",
      notApproved: "El documento enviado no cumple con los requisitos necesarios para completar la verificación.",
      reason: "Motivo:",
      whatToDo: "¿Qué debes hacer?",
      reuploadStep: "Accede a tu Área Cliente y sube un nuevo documento de identidad que cumpla con los requisitos. Asegúrate de que la imagen sea clara, legible y muestre toda la información necesaria.",
      uploadButton: "Subir Nuevo Documento",
      needHelp: "Si tienes dudas o necesitas ayuda, no dudes en contactar con nuestro equipo de soporte. Estamos aquí para ayudarte.",
      closing: "Gracias por tu comprensión y colaboración."
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
      ignoreMessage: "If you did not request this code, you can safely ignore this message.",
      ipDetected: "Login attempt detected from IP:"
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
    accountDeactivatedByUser: {
      deactivated: "We have received your request to delete your account. Your account has been deactivated and will be deleted shortly.",
      cannotAccess: "From now on, you will not be able to access your Client Area or perform any operations through our platform.",
      contactSupport: "If you have changed your mind or believe this is an error, please contact our support team by replying to this email as soon as possible."
    },
    confirmation: {
      greatNews: "Great news! We have received your request and are already working on it. From now on, our team will take care of everything.",
      details: "Request Details",
      reference: "Reference:",
      service: "Service:",
      company: "Company:",
      state: "State:",
      currentStatus: "Current status:",
      inReview: "Under review",
      whatNow: "What happens now?",
      validatingInfo: "Our team is validating all the information you provided. In the next few hours you will receive updates on the progress of your request directly to your email. You can also track the status in real time from your Client Area.",
      nextSteps: "Next Steps",
      step1: "We will verify that all information is correct",
      step2: "We will begin the procedures with the corresponding authorities",
      step3: "We will keep you informed at every stage of the process",
      trackButton: "View My Request Status",
      questionRef: "Have any questions? Simply reply to this email mentioning your reference and we'll be happy to help."
    },
    autoReply: {
      receivedMessage: "Your message has been received successfully.",
      ticketNumber: "Ticket number",
      estimatedResponse: "Estimated response time: <strong>24-48 business hours</strong>",
      responding: "Our team will review your inquiry and respond as soon as possible. If you need to add additional information, reply directly to this email.",
      seeMessages: "View Messages"
    },
    orderUpdate: {
      statusChanged: "Your order status has been updated.",
      orderLabel: "Order:",
      newStatus: "New status:",
      statusPending: "Pending",
      statusProcessing: "Processing",
      statusPaid: "Paid",
      statusFiled: "Filed",
      statusDocumentsReady: "Documents ready",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled",
      clarification: "For any clarification about this update, reply directly to this email.",
      trackButton: "View full details"
    },
    orderCompleted: {
      llcReady: "Your LLC is ready!",
      congratulations: "Congratulations! Your order has been completed successfully. Everything is ready for you to start operating your business in the United States.",
      docsReady: "Your documentation is ready",
      accessDocuments: "You can now access and download all your company documents from your Documentation Center.",
      whatYouFind: "What will you find?",
      documentList: "Available documents:",
      articlesOrg: "Articles of Organization (formation document)",
      einLetter: "EIN Letter from the IRS",
      registeredAgent: "Registered agent information",
      additionalGuides: "Guides and additional documents based on your service",
      viewDocuments: "View My Documents",
      nextSteps: "Next steps:",
      activateBanking: "Activate bank account (if requested)",
      operatingAgreement: "Generate your Operating Agreement",
      trackExpenses: "Start tracking income and expenses",
      hereForYou: "Remember we're still here to help you with anything you need. If you have questions about next steps, like opening a bank account or setting up your payment gateway, don't hesitate to contact us.",
      feedbackRequest: "Your experience is very important to us. If you have a moment, we'd love to hear your opinion about our service."
    },
    noteReceived: {
      teamNote: "You have a new message from our team",
      relatedToOrder: "related to your order",
      respondNote: "You can reply directly to this email or access your Client Area to view the complete history.",
      viewClientArea: "View My Client Area"
    },
    adminNote: {
      messageAbout: "You have an important message about your request:",
      viewTicket: "View Ticket",
      viewClientArea: "View My Client Area"
    },
    paymentRequest: {
      paymentRequired: "A payment request has been generated to continue with your process",
      messageLabel: "Message:",
      amount: "for an amount of",
      payNow: "Make Payment",
      buttonFallback: "If the button doesn't work, copy and paste this link:",
      securePayment: "Payment is processed securely through Stripe."
    },
    documentRequest: {
      needDocument: "Our team requires you to upload the following document:",
      messageLabel: "Message:",
      documentType: "Requested document:",
      referenceTicket: "Reference ticket:",
      important: "Important:",
      uploadInstruction: "Please upload the requested document as soon as possible to avoid delays in the process.",
      uploadButton: "Upload Document"
    },
    documentUploaded: {
      documentReceived: "We have added a new document to your file:",
      forOrder: "Order:",
      accessDownload: "You can access and download this document from your Client Area.",
      reviewing: "Our team will review it and notify you if any additional action is required.",
      viewDocuments: "View My Documents",
      trackButton: "View request status"
    },
    messageReply: {
      newReply: "You have a new reply in your conversation:",
      repliedToQuery: "We have responded to your inquiry",
      ticket: "Ticket:",
      viewConversation: "View conversation",
      viewClientArea: "View My Client Area"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "You have requested to change your password. Use the following code to verify your identity:",
      useCode: "Use the following code to confirm the change:",
      yourCode: "Your verification code:",
      important: "Important:",
      validFor: "This code expires in <strong>10 minutes</strong>",
      doNotShare: "Do not share it with anyone",
      notRequested: "If you did not request this change, ignore this message."
    },
    profileChangeOtp: {
      title: "Identity Verification",
      sensitiveChangeRequest: "A change to sensitive profile data has been requested. To confirm your identity, use the following verification code:",
      yourCode: "Your verification code:",
      important: "Important:",
      personalAndConfidential: "This code is personal and confidential",
      validFor: "Valid for <strong>24 hours</strong>",
      doNotShare: "Do not share it with anyone",
      ignoreMessage: "If you did not request this change, you can safely ignore this message."
    },
    accountLocked: {
      locked: "For your security, your account has been temporarily locked after detecting multiple failed access attempts.",
      attempts: "To unlock your account and verify your identity, we need you to send us:",
      verifyIdentity: "To unlock your account and verify your identity, we need you to send us:",
      idRequirement: "High-resolution ID/Passport image (both sides)",
      birthDateConfirm: "Your confirmed date of birth",
      referenceTicket: "Your reference Ticket ID is:",
      contactSupport: "To unlock your account, contact our support team:",
      resetPassword: "Reset Password",
      unlockButton: "Contact Support"
    },
    renewalReminder: {
      reminderText: "We remind you that the maintenance pack for your LLC",
      expiresIn: "Expires in",
      dueDate: "Due date:",
      daysRemaining: "Days remaining:",
      withoutMaintenance: "Without an active maintenance pack, your LLC may lose its good legal standing. This includes:",
      registeredAgentActive: "Active registered agent",
      annualReports: "Annual report filings",
      taxCompliance: "Tax compliance (IRS 1120/5472)",
      legalAddress: "Legal address in the United States",
      renewNow: "Renew Now",
      whatHappens: "What happens if I don't renew?",
      penalties: "Possible penalties and surcharges",
      agentExpires: "Your registered agent will expire",
      goodStanding: "Your LLC could lose good standing",
      viewCalendar: "View fiscal calendar"
    },
    registrationOtp: {
      almostDone: "Thank you for registering at Easy US LLC. Your verification code is:",
      confirmEmail: "To complete your account registration, enter the following verification code:",
      yourCode: "Your verification code:",
      important: "Important:",
      validFor: "This code expires in",
      doNotShare: "Do not share it with anyone",
      clientIdLabel: "Your client ID is:",
      ignoreMessage: "If you didn't create an account with us, you can ignore this message."
    },
    operatingAgreementReady: {
      ready: "Your Operating Agreement is ready!",
      generated: "We have great news for you.",
      llcData: "Your LLC Details",
      companyLabel: "Company:",
      stateLabel: "State:",
      einLabel: "EIN:",
      whatIs: "What is the Operating Agreement?",
      explanation: "It is the legal document that establishes the operating rules of your LLC, including ownership structure, profit distribution, and member responsibilities.",
      fullExplanation: "It is the fundamental legal document of your LLC. It defines how your company is managed, owner responsibilities, and operating rules. Although not mandatory in some states, it is highly recommended because:",
      reason1: "It reinforces the separation between your personal and business finances",
      reason2: "It is required by banks and payment processors like Stripe",
      reason3: "It provides additional legal protection for you as an owner",
      reason4: "It officially documents your business structure",
      generateButton: "Generate my Operating Agreement",
      autoGenerated: "The document will be automatically generated with your LLC data and saved in your Documentation Center so you can download it whenever you need it.",
      viewDocument: "View my document",
      tip: "Tip:",
      tipText: "Keep a signed copy of this document along with your other important company files."
    },
    documentApproved: {
      title: "Document Approved",
      approved: "Approved",
      reviewedAndApproved: "Your document has been reviewed and approved successfully.",
      viewDocuments: "View my documents"
    },
    documentRejected: {
      title: "Document Rejected - Action Required",
      rejected: "Rejected",
      reviewedAndRejected: "Your document has been reviewed and rejected.",
      reason: "Reason",
      pleaseReupload: "Please access your client dashboard and upload the corrected document again.",
      viewDocuments: "View my documents"
    },
    profileChangesVerified: {
      title: "Profile Changes Verified with OTP",
      client: "Client",
      email: "Email",
      clientId: "Client ID",
      fieldsModified: "Fields modified",
      verifiedWithOtp: "Change verified with OTP"
    },
    abandonedApplication: {
      incomplete: "Your application is incomplete",
      noticeText: "We noticed that you started completing your application for",
      importantNote: "Important note:",
      draftDeletion: "Your draft will be automatically deleted if you don't complete it. For security and data protection reasons, we cannot keep incomplete applications indefinitely.",
      understandDoubts: "We understand that taking the step to create an LLC can raise some questions. We want you to know that we are here to help you at every step of the process.",
      questionsHelp: "If you have any questions or need assistance completing your application, simply reply to this email and we'll be happy to help.",
      whyChoose: "Why choose Easy US LLC?",
      reason1: "Complete formation in 48-72 hours",
      reason2: "Spanish-language assistance throughout the process",
      reason3: "EIN obtainment included",
      reason4: "Help with bank account opening",
      reason5: "Ongoing post-formation support",
      noMoreReminders: "If you ultimately decide not to continue, we won't send you any more reminders about this application. Your privacy is important to us.",
      savedDraft: "Don't worry, we've saved all your progress so you can continue exactly where you left off.",
      continueButton: "Continue my Application",
      tip: "Tip:",
      tipText: "Complete your application so we can start working on your LLC as soon as possible.",
      expiring: "Your draft will expire in 48 hours if not completed.",
      llcFormation: "your LLC formation",
      maintenancePack: "maintenance package",
      dontLoseProgress: "Don't lose your progress. Resume your application now and complete the process in a few minutes.",
      lastHours: "last hours",
      autoDeleteWarning: "Your application will be automatically deleted if you don't complete it."
    },
    calculatorResults: {
      results: "Your calculation results",
      introText: "Here is the summary of the tax comparison you requested. We've analyzed the numbers and want you to have all the information to make the best decision for your business.",
      summary: "Your Analysis Summary",
      income: "Annual income:",
      expenses: "Deductible expenses:",
      autonomoTax: "Taxes as freelancer:",
      llcTax: "Taxes with LLC:",
      potentialSavings: "Your potential savings:",
      savings: "Estimated savings:",
      withLLC: "With an LLC in the United States, you could significantly optimize your tax burden while operating completely legally. These savings are maintained year after year, which can make an important difference for your business in the long run.",
      learnMore: "Would you like to know more about how it works? We'll be happy to answer all your questions with no commitment.",
      viewServices: "View Our Services",
      disclaimer: "This calculation is indicative and based on the data you provided. For a personalized analysis of your situation, don't hesitate to contact us."
    },
    newsletter: {
      confirmed: "Your subscription has been confirmed successfully.",
      willReceive: "You will receive relevant information about services, updates, and news related to Easy US LLC.",
      unsubscribe: "You can unsubscribe at any time from the link included in our emails."
    },
    orderEvent: {
      update: "Your order has an update:",
      date: "Date:",
      viewDetails: "View Details"
    },
    identityVerificationRequest: {
      subject: "Identity verification required | Easy US LLC",
      intro: "We need to verify your identity to ensure the security of your account and comply with our data protection policies.",
      whyTitle: "Why is this necessary?",
      whyText: "At Easy US LLC, we take our clients' security very seriously. This verification is an essential step to protect your personal information and ensure that only you have access to your account.",
      whatNeedTitle: "What do we need?",
      whatNeedText: "We ask you to upload a valid and current official identity document. The following formats are accepted:",
      acceptedDocs: "Accepted documents:",
      doc1: "National ID card (both sides)",
      doc2: "Passport (main page with photo)",
      doc3: "Residence card / Permit (both sides)",
      howToUploadTitle: "How to upload your document?",
      howStep1: "Access your Client Area from the button below",
      howStep2: "You will see a section to upload your identity document",
      howStep3: "Upload a clear and legible photo of your document (PDF, JPG or PNG, maximum 5 MB)",
      uploadButton: "Upload Identity Document",
      duringProcess: "While your verification is being processed, your account functions will be temporarily limited. You won't be able to place new orders or modify existing information, but don't worry: your ongoing processes will not be affected.",
      adminNotes: "Team note:",
      teamMessage: "Our team will review your document within 24-48 business hours. We will notify you by email as soon as the verification has been completed.",
      closing: "Thank you for your cooperation and patience. We are here to help you."
    },
    identityVerificationApproved: {
      subject: "Identity successfully verified | Easy US LLC",
      intro: "Great news! Your identity has been successfully verified.",
      verified: "Our team has reviewed your documentation and everything is in order. Your account has been reactivated and you can now use all our services normally.",
      accessRestored: "Full access to your account has been restored. You can now place orders, modify your profile and access all available services.",
      viewDashboard: "Go to My Client Area",
      closing: "Thank you for your patience and cooperation. We are delighted to continue helping you."
    },
    identityVerificationRejected: {
      subject: "Identity verification: new documentation required | Easy US LLC",
      intro: "We have reviewed the documentation you sent us, but unfortunately we were unable to verify your identity with the document provided.",
      notApproved: "The submitted document does not meet the requirements necessary to complete the verification.",
      reason: "Reason:",
      whatToDo: "What should you do?",
      reuploadStep: "Access your Client Area and upload a new identity document that meets the requirements. Make sure the image is clear, legible and shows all necessary information.",
      uploadButton: "Upload New Document",
      needHelp: "If you have questions or need help, don't hesitate to contact our support team. We are here to help you.",
      closing: "Thank you for your understanding and cooperation."
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
      ignoreMessage: "Si no has sol·licitat aquest codi, pots ignorar aquest missatge amb total tranquil·litat.",
      ipDetected: "Intent d'accés detectat des de la IP:"
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
    accountDeactivatedByUser: {
      deactivated: "Hem rebut la teva sol·licitud per eliminar el teu compte. El teu compte ha estat desactivat i serà eliminat en breu.",
      cannotAccess: "A partir d'ara no podràs accedir a la teva Àrea Client ni realitzar gestions a través de la nostra plataforma.",
      contactSupport: "Si has canviat d'opinió o creus que es tracta d'un error, contacta amb el nostre equip de suport responent a aquest correu el més aviat possible."
    },
    confirmation: {
      greatNews: "Excel·lent notícia! Hem rebut correctament la teva sol·licitud i ja estem treballant en ella. A partir d'ara, el nostre equip s'encarregarà de tot.",
      details: "Detalls de la teva Sol·licitud",
      reference: "Referència:",
      service: "Servei:",
      company: "Empresa:",
      state: "Estat:",
      currentStatus: "Estat actual:",
      inReview: "En revisió",
      whatNow: "Què passa ara?",
      validatingInfo: "El nostre equip està validant tota la informació que ens vas proporcionar. En les properes hores rebràs actualitzacions sobre el progrés de la teva sol·licitud directament al teu correu. També podràs seguir l'estat en temps real des de la teva Àrea Client.",
      nextSteps: "Propers Passos",
      step1: "Verificarem que tota la informació és correcta",
      step2: "Iniciarem els tràmits amb les autoritats corresponents",
      step3: "Et mantindrem informat en cada etapa del procés",
      trackButton: "Veure Estat de la meva Sol·licitud",
      questionRef: "Tens alguna pregunta? Simplement respon a aquest correu esmentant la teva referència i t'ajudarem encantats."
    },
    autoReply: {
      receivedMessage: "El teu missatge ha estat rebut correctament.",
      ticketNumber: "Número de ticket",
      estimatedResponse: "Temps estimat de resposta: <strong>24-48 hores laborables</strong>",
      responding: "El nostre equip revisarà la teva consulta i et respondrà el més aviat possible. Si necessites afegir informació addicional, respon directament a aquest correu.",
      seeMessages: "Veure Missatges"
    },
    orderUpdate: {
      statusChanged: "L'estat de la teva comanda ha estat actualitzat.",
      orderLabel: "Comanda:",
      newStatus: "Nou estat:",
      statusPending: "Pendent",
      statusProcessing: "En procés",
      statusPaid: "Pagat",
      statusFiled: "Presentat",
      statusDocumentsReady: "Documents llestos",
      statusCompleted: "Completat",
      statusCancelled: "Cancel·lat",
      clarification: "Per a qualsevol aclariment sobre aquesta actualització, respon directament a aquest correu.",
      trackButton: "Veure detalls complets"
    },
    orderCompleted: {
      llcReady: "La teva LLC està llesta!",
      congratulations: "Felicitats! La teva comanda ha estat completada amb èxit. Tot està llest perquè puguis començar a operar amb la teva empresa als Estats Units.",
      docsReady: "La teva documentació està llesta",
      accessDocuments: "Ja pots accedir i descarregar tots els documents de la teva empresa des del teu Centre de Documentació.",
      whatYouFind: "Què trobaràs?",
      documentList: "Documents disponibles:",
      articlesOrg: "Articles of Organization (document de constitució)",
      einLetter: "Carta de l'EIN de l'IRS",
      registeredAgent: "Informació de l'agent registrat",
      additionalGuides: "Guies i documents addicionals segons el teu servei",
      viewDocuments: "Veure Els Meus Documents",
      nextSteps: "Propers passos:",
      activateBanking: "Activar compte bancari (si sol·licitat)",
      operatingAgreement: "Generar el teu Operating Agreement",
      trackExpenses: "Començar a registrar ingressos i despeses",
      hereForYou: "Recorda que seguim aquí per ajudar-te en tot el que necessitis. Si tens dubtes sobre els propers passos, com obrir un compte bancari o configurar la teva passarel·la de pagaments, no dubtis a escriure'ns.",
      feedbackRequest: "La teva experiència és molt important per a nosaltres. Si tens un moment, ens encantaria conèixer la teva opinió sobre el nostre servei."
    },
    noteReceived: {
      teamNote: "Tens un nou missatge del nostre equip",
      relatedToOrder: "relacionat amb la teva comanda",
      respondNote: "Pots respondre directament a aquest correu o accedir a la teva Àrea Client per veure l'historial complet.",
      viewClientArea: "Veure la Meva Àrea Client"
    },
    adminNote: {
      messageAbout: "Tens un missatge important sobre la teva sol·licitud:",
      viewTicket: "Veure Ticket",
      viewClientArea: "Veure la Meva Àrea Client"
    },
    paymentRequest: {
      paymentRequired: "S'ha generat una sol·licitud de pagament per continuar amb el teu tràmit",
      messageLabel: "Missatge:",
      amount: "per un valor de",
      payNow: "Realitzar Pagament",
      buttonFallback: "Si el botó no funciona, copia i enganxa aquest enllaç:",
      securePayment: "El pagament es processa de forma segura a través de Stripe."
    },
    documentRequest: {
      needDocument: "El nostre equip requereix que pugis el següent document:",
      messageLabel: "Missatge:",
      documentType: "Document sol·licitat:",
      referenceTicket: "Ticket de referència:",
      important: "Important:",
      uploadInstruction: "Si us plau, puja el document sol·licitat el més aviat possible per evitar retards en el procés.",
      uploadButton: "Pujar Document"
    },
    documentUploaded: {
      documentReceived: "Hem afegit un nou document al teu expedient:",
      forOrder: "Comanda:",
      accessDownload: "Pots accedir i descarregar aquest document des de la teva Àrea Client.",
      reviewing: "El nostre equip el revisarà i et notificarem si és necessària alguna acció addicional.",
      viewDocuments: "Veure Els Meus Documents",
      trackButton: "Veure estat de la meva sol·licitud"
    },
    messageReply: {
      newReply: "Tens una nova resposta a la teva conversa:",
      repliedToQuery: "Hem respost a la teva consulta",
      ticket: "Ticket:",
      viewConversation: "Veure conversa",
      viewClientArea: "Veure la Meva Àrea Client"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "Has sol·licitat canviar la teva contrasenya. Utilitza el següent codi per verificar la teva identitat:",
      useCode: "Utilitza el següent codi per confirmar el canvi:",
      yourCode: "El teu codi de verificació:",
      important: "Important:",
      validFor: "Aquest codi expira en <strong>10 minuts</strong>",
      doNotShare: "No el comparteixis amb ningú",
      notRequested: "Si no has sol·licitat aquest canvi, ignora aquest missatge."
    },
    profileChangeOtp: {
      title: "Verificació d'Identitat",
      sensitiveChangeRequest: "S'ha sol·licitat un canvi en les dades sensibles del teu perfil. Per confirmar la teva identitat, utilitza el següent codi de verificació:",
      yourCode: "El teu codi de verificació:",
      important: "Important:",
      personalAndConfidential: "Aquest codi és personal i confidencial",
      validFor: "Té una validesa de <strong>24 hores</strong>",
      doNotShare: "No el comparteixis amb ningú",
      ignoreMessage: "Si no has sol·licitat aquest canvi, pots ignorar aquest missatge amb total tranquil·litat."
    },
    accountLocked: {
      locked: "Per la teva seguretat, el teu compte ha estat temporalment bloquejat després de detectar múltiples intents d'accés fallits.",
      attempts: "Per desbloquejar el teu compte i verificar la teva identitat, necessitem que ens enviïs:",
      verifyIdentity: "Per desbloquejar el teu compte i verificar la teva identitat, necessitem que ens enviïs:",
      idRequirement: "Imatge del DNI/Passaport d'alta resolució (ambdues cares)",
      birthDateConfirm: "La teva data de naixement confirmada",
      referenceTicket: "El teu Ticket ID de referència és:",
      contactSupport: "Per desbloquejar el teu compte, contacta amb el nostre equip de suport:",
      resetPassword: "Restablir contrasenya",
      unlockButton: "Contactar Suport"
    },
    renewalReminder: {
      reminderText: "Et recordem que el pack de manteniment de la teva LLC",
      expiresIn: "Venç en",
      dueDate: "Data de venciment:",
      daysRemaining: "Dies restants:",
      withoutMaintenance: "Sense el pack de manteniment actiu, la teva LLC pot perdre el seu bon estat legal. Això inclou:",
      registeredAgentActive: "Agent registrat actiu",
      annualReports: "Presentació d'informes anuals",
      taxCompliance: "Compliment fiscal (IRS 1120/5472)",
      legalAddress: "Domicili legal als Estats Units",
      renewNow: "Renovar Ara",
      whatHappens: "Què passa si no renovo?",
      penalties: "Possibles penalitzacions i recàrrecs",
      agentExpires: "El teu registered agent expirarà",
      goodStanding: "La teva LLC podria perdre el bon estat",
      viewCalendar: "Veure calendari fiscal"
    },
    registrationOtp: {
      almostDone: "Gràcies per registrar-te a Easy US LLC. El teu codi de verificació és:",
      confirmEmail: "Per completar el registre del teu compte, introdueix el següent codi de verificació:",
      yourCode: "El teu codi de verificació:",
      important: "Important:",
      validFor: "Aquest codi expira en",
      doNotShare: "No el comparteixis amb ningú",
      clientIdLabel: "El teu ID de client és:",
      ignoreMessage: "Si no has creat un compte amb nosaltres, pots ignorar aquest missatge."
    },
    operatingAgreementReady: {
      ready: "El teu Operating Agreement està llest!",
      generated: "Tenim excel·lents notícies per a tu.",
      llcData: "Dades de la teva LLC",
      companyLabel: "Empresa:",
      stateLabel: "Estat:",
      einLabel: "EIN:",
      whatIs: "Què és l'Operating Agreement?",
      explanation: "És el document legal que estableix les regles de funcionament de la teva LLC, incloent l'estructura de propietat, distribució de beneficis i responsabilitats dels membres.",
      fullExplanation: "És el document legal fonamental de la teva LLC. Defineix com es gestiona la teva empresa, les responsabilitats del propietari i les regles d'operació. Tot i que en alguns estats no és obligatori, és altament recomanable tenir-lo perquè:",
      reason1: "Reforça la separació entre les teves finances personals i les de l'empresa",
      reason2: "És requerit per bancs i processadors de pagament com Stripe",
      reason3: "Proporciona protecció legal addicional per a tu com a propietari",
      reason4: "Documenta oficialment l'estructura del teu negoci",
      generateButton: "Generar el meu Operating Agreement",
      autoGenerated: "El document es generarà automàticament amb les dades de la teva LLC i es guardarà al teu Centre de Documentació perquè puguis descarregar-lo quan ho necessitis.",
      viewDocument: "Veure el meu document",
      tip: "Consell:",
      tipText: "Guarda una còpia signada d'aquest document juntament amb els teus altres arxius importants de l'empresa."
    },
    documentApproved: {
      title: "Document Aprovat",
      approved: "Aprovat",
      reviewedAndApproved: "El teu document ha estat revisat i aprovat correctament.",
      viewDocuments: "Veure els meus documents"
    },
    documentRejected: {
      title: "Document Rebutjat - Acció Requerida",
      rejected: "Rebutjat",
      reviewedAndRejected: "El teu document ha estat revisat i rebutjat.",
      reason: "Motiu",
      pleaseReupload: "Si us plau, accedeix al teu panell de client i puja novament el document corregit.",
      viewDocuments: "Veure els meus documents"
    },
    profileChangesVerified: {
      title: "Canvis de Perfil Verificats amb OTP",
      client: "Client",
      email: "Email",
      clientId: "ID de Client",
      fieldsModified: "Camps modificats",
      verifiedWithOtp: "Canvi verificat amb OTP"
    },
    abandonedApplication: {
      incomplete: "La teva sol·licitud està incompleta",
      noticeText: "Hem notat que vas començar a completar la teva sol·licitud de",
      importantNote: "Nota important:",
      draftDeletion: "El teu esborrany s'eliminarà automàticament si no el completes. Per motius de seguretat i protecció de dades, no podem mantenir sol·licituds incompletes indefinidament.",
      understandDoubts: "Entenem que fer el pas de crear una LLC pot generar alguns dubtes. Volem que sàpigues que estem aquí per ajudar-te en cada pas del procés.",
      questionsHelp: "Si tens alguna pregunta o necessites assistència per completar la teva sol·licitud, simplement respon a aquest correu i t'ajudarem encantats.",
      whyChoose: "Per què triar Easy US LLC?",
      reason1: "Formació completa en 48-72 hores",
      reason2: "Assistència en espanyol durant tot el procés",
      reason3: "Obtenció de l'EIN inclosa",
      reason4: "Ajuda amb obertura de compte bancari",
      reason5: "Suport continu post-formació",
      noMoreReminders: "Si finalment decideixes no continuar, no t'enviarem més recordatoris sobre aquesta sol·licitud. La teva privacitat és important per a nosaltres.",
      savedDraft: "No et preocupis, hem guardat tot el teu progrés perquè puguis continuar exactament on ho vas deixar.",
      continueButton: "Continuar la meva Sol·licitud",
      tip: "Consell:",
      tipText: "Completa la teva sol·licitud perquè puguem començar a treballar en la teva LLC el més aviat possible.",
      expiring: "El teu esborrany expirarà en 48 hores si no el completes.",
      llcFormation: "constitució de la teva LLC",
      maintenancePack: "paquet de manteniment",
      dontLoseProgress: "No perdis el teu progrés. Reprèn la teva sol·licitud ara i completa el procés en pocs minuts.",
      lastHours: "últimes hores",
      autoDeleteWarning: "La teva sol·licitud s'eliminarà automàticament si no la completes."
    },
    calculatorResults: {
      results: "Resultats del teu càlcul",
      introText: "Aquí tens el resum de la teva comparació fiscal que vas sol·licitar. Hem analitzat els números i volem que tinguis tota la informació per prendre la millor decisió per al teu negoci.",
      summary: "Resum de la teva Anàlisi",
      income: "Ingressos anuals:",
      expenses: "Despeses deduïbles:",
      autonomoTax: "Impostos com a autònom:",
      llcTax: "Impostos amb LLC:",
      potentialSavings: "El teu estalvi potencial:",
      savings: "Estalvi estimat:",
      withLLC: "Amb una LLC als Estats Units, podries optimitzar significativament la teva càrrega fiscal mentre operes de forma completament legal. Aquest estalvi es manté any rere any, el que pot suposar una diferència important per al teu negoci a llarg termini.",
      learnMore: "T'agradaria saber més sobre com funciona? Estarem encantats de resoldre tots els teus dubtes sense cap compromís.",
      viewServices: "Veure Els Nostres Serveis",
      disclaimer: "Aquest càlcul és orientatiu i es basa en les dades que vas proporcionar. Per a una anàlisi personalitzada de la teva situació, no dubtis a contactar-nos."
    },
    newsletter: {
      confirmed: "La teva subscripció ha estat confirmada correctament.",
      willReceive: "Rebràs informació rellevant sobre serveis, actualitzacions i novetats relacionades amb Easy US LLC.",
      unsubscribe: "Pots donar-te de baixa en qualsevol moment des de l'enllaç inclòs als nostres correus."
    },
    orderEvent: {
      update: "La teva comanda té una actualització:",
      date: "Data:",
      viewDetails: "Veure Detalls"
    },
    identityVerificationRequest: {
      subject: "Verificació d'identitat requerida | Easy US LLC",
      intro: "Necessitem verificar la teva identitat per garantir la seguretat del teu compte i complir amb les nostres polítiques de protecció de dades.",
      whyTitle: "Per què és necessari?",
      whyText: "A Easy US LLC ens prenem molt seriosament la seguretat dels nostres clients. Aquesta verificació és un pas essencial per protegir la teva informació personal i garantir que només tu tinguis accés al teu compte.",
      whatNeedTitle: "Què necessitem?",
      whatNeedText: "Et demanem que pugis un document d'identitat oficial vàlid i vigent. S'accepten els següents formats:",
      acceptedDocs: "Documents acceptats:",
      doc1: "DNI / Cèdula d'identitat (ambdues cares)",
      doc2: "Passaport (pàgina principal amb foto)",
      doc3: "NIE / Targeta de residència (ambdues cares)",
      howToUploadTitle: "Com pujar el teu document?",
      howStep1: "Accedeix a la teva Àrea Client des del botó de sota",
      howStep2: "Veuràs una secció per carregar el teu document d'identitat",
      howStep3: "Puja una foto clara i llegible del teu document (PDF, JPG o PNG, màxim 5 MB)",
      uploadButton: "Pujar Document d'Identitat",
      duringProcess: "Mentre es processa la teva verificació, les funcions del teu compte estaran temporalment limitades. No podràs realitzar noves comandes ni modificar informació existent, però no et preocupis: els teus tràmits en curs no es veuran afectats.",
      adminNotes: "Nota de l'equip:",
      teamMessage: "El nostre equip revisarà el teu document en un termini de 24-48 hores laborables. Et notificarem per correu electrònic en quan la verificació hagi estat completada.",
      closing: "Gràcies per la teva col·laboració i paciència. Estem aquí per ajudar-te."
    },
    identityVerificationApproved: {
      subject: "Identitat verificada correctament | Easy US LLC",
      intro: "Excel·lents notícies! La teva identitat ha estat verificada correctament.",
      verified: "El nostre equip ha revisat la teva documentació i tot està en ordre. El teu compte ha estat reactivat i ja pots utilitzar tots els nostres serveis amb normalitat.",
      accessRestored: "L'accés complet al teu compte ha estat restaurat. Ja pots realitzar comandes, modificar el teu perfil i accedir a tots els serveis disponibles.",
      viewDashboard: "Anar a La Meva Àrea Client",
      closing: "Gràcies per la teva paciència i col·laboració. Estem encantats de seguir ajudant-te."
    },
    identityVerificationRejected: {
      subject: "Verificació d'identitat: es requereix nova documentació | Easy US LLC",
      intro: "Hem revisat la documentació que ens vas enviar, però malauradament no hem pogut verificar la teva identitat amb el document proporcionat.",
      notApproved: "El document enviat no compleix amb els requisits necessaris per completar la verificació.",
      reason: "Motiu:",
      whatToDo: "Què has de fer?",
      reuploadStep: "Accedeix a la teva Àrea Client i puja un nou document d'identitat que compleixi amb els requisits. Assegura't que la imatge sigui clara, llegible i mostri tota la informació necessària.",
      uploadButton: "Pujar Nou Document",
      needHelp: "Si tens dubtes o necessites ajuda, no dubtis a contactar amb el nostre equip de suport. Estem aquí per ajudar-te.",
      closing: "Gràcies per la teva comprensió i col·laboració."
    }
  },
  fr: {
    common: {
      greeting: "Bonjour",
      closing: "Cordialement,",
      doubts: "Si vous avez des questions, répondez directement à cet e-mail.",
      client: "Client"
    },
    otp: {
      thanks: "Merci de poursuivre votre démarche chez Easy US LLC.",
      forSecurity: "Pour garantir la sécurité de votre compte, utilisez le code de vérification suivant :",
      yourCode: "Votre code OTP :",
      important: "Important :",
      personalAndConfidential: "Ce code est personnel et confidentiel",
      validFor: "Il est valable <strong>15 minutes</strong> pour des raisons de sécurité",
      doNotShare: "Ne le partagez avec personne",
      ignoreMessage: "Si vous n'avez pas demandé ce code, vous pouvez ignorer ce message en toute tranquillité.",
      ipDetected: "Tentative de connexion détectée depuis l'IP :"
    },
    welcome: {
      welcomeMessage: "Bienvenue chez Easy US LLC ! Nous sommes ravis de vous compter parmi nous.",
      accountCreated: "Votre compte a été créé avec succès et vous pouvez commencer à explorer tout ce que nous pouvons faire ensemble. Depuis votre Espace Client, vous aurez accès à :",
      accessFrom: "Depuis votre Espace Client, vous aurez accès à :",
      realTimeTracking: "Suivi en temps réel de vos demandes",
      documentCenter: "Centre de documentation pour télécharger tous vos fichiers",
      professionalTools: "Outils professionnels comme le générateur de factures",
      fiscalCalendar: "Calendrier fiscal avec vos dates importantes",
      directSupport: "Communication directe avec notre équipe de support",
      hereToHelp: "Nous sommes là pour vous accompagner à chaque étape de votre aventure entrepreneuriale aux États-Unis. Si vous avez des questions, n'hésitez pas à nous écrire.",
      exploreButton: "Explorer Mon Espace Client"
    },
    accountPendingVerification: {
      accountCreatedBut: "Votre compte a été créé avec succès, mais vous devez vérifier votre e-mail pour l'activer complètement.",
      actionRequired: "Action requise :",
      accessAndVerify: "Accédez à votre Espace Client et vérifiez votre e-mail pour activer votre compte et accéder à toutes les fonctionnalités.",
      verifyButton: "Vérifier mon e-mail",
      whileUnverified: "Tant que votre e-mail n'est pas vérifié, votre compte restera en cours de révision."
    },
    accountUnderReview: {
      underReview: "Nous souhaitons vous informer que votre compte est entré dans un bref processus de vérification. Ne vous inquiétez pas, c'est tout à fait routinier et fait partie de nos normes de sécurité pour protéger vos informations et garantir une expérience sûre.",
      whyReview: "Pourquoi faisons-nous cela ?",
      whyReviewText: "Chez Easy US LLC, nous prenons très au sérieux la sécurité de nos clients. Ce processus nous permet de vérifier que toutes les informations sont correctes et que votre compte est correctement protégé.",
      duringProcess: "Pendant cette brève période, les fonctions de votre compte seront temporairement limitées. Cela signifie que vous ne pourrez pas passer de nouvelles commandes ni modifier les informations existantes, mais ne vous inquiétez pas : cette situation est temporaire et n'affectera aucune démarche déjà en cours.",
      whatHappens: "Que va-t-il se passer maintenant ?",
      step1: "Notre équipe examinera les informations de votre compte (généralement sous 24 à 48 heures ouvrables)",
      step2: "Nous vous notifierons par ce même e-mail dès que la vérification sera terminée",
      step3: "Si nous avons besoin de documents supplémentaires, nous vous le ferons savoir clairement et simplement",
      teamReviewing: "En attendant, si vous avez des questions ou besoin d'aide, n'hésitez pas à répondre à cet e-mail. Nous sommes là pour vous aider dans tout ce dont vous avez besoin.",
      patience: "Merci pour votre patience et votre confiance. Nous savons que votre temps est précieux et nous ferons tout notre possible pour résoudre cela le plus rapidement possible.",
      closing: "Chaleureusement, l'équipe Easy US LLC"
    },
    accountVip: {
      updatedToVip: "Votre compte a été mis à niveau au statut VIP.",
      benefits: "Avantages VIP :",
      priorityAttention: "Attention prioritaire et traitement accéléré",
      preferentialTracking: "Suivi préférentiel par notre équipe",
      fullAccess: "Accès complet à tous les services",
      viewDashboard: "Voir Mon Espace Client"
    },
    accountReactivated: {
      reactivated: "Votre compte a été réactivé avec succès.",
      canAccess: "Vous pouvez maintenant accéder à votre Espace Client et utiliser tous nos services normalement.",
      viewDashboard: "Voir Mon Espace Client"
    },
    accountDeactivated: {
      deactivated: "Nous avons le regret de vous informer que votre compte a été désactivé.",
      cannotAccess: "Tant que votre compte reste dans cet état, vous ne pourrez pas accéder à votre Espace Client ni effectuer d'opérations via notre plateforme.",
      contactSupport: "Si vous pensez qu'il s'agit d'une erreur ou souhaitez obtenir plus d'informations, veuillez contacter notre équipe de support en répondant à cet e-mail."
    },
    accountDeactivatedByUser: {
      deactivated: "Nous avons reçu votre demande de suppression de compte. Votre compte a été désactivé et sera supprimé sous peu.",
      cannotAccess: "À partir de maintenant, vous ne pourrez plus accéder à votre Espace Client ni effectuer d'opérations via notre plateforme.",
      contactSupport: "Si vous avez changé d'avis ou pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe de support en répondant à cet e-mail dès que possible."
    },
    confirmation: {
      greatNews: "Excellente nouvelle ! Nous avons bien reçu votre demande et nous travaillons déjà dessus. À partir de maintenant, notre équipe s'occupe de tout.",
      details: "Détails de votre demande",
      reference: "Référence :",
      service: "Service :",
      company: "Entreprise :",
      state: "État :",
      currentStatus: "Statut actuel :",
      inReview: "En cours de révision",
      whatNow: "Que se passe-t-il maintenant ?",
      validatingInfo: "Notre équipe valide toutes les informations que vous avez fournies. Dans les prochaines heures, vous recevrez des mises à jour sur l'avancement de votre demande directement par e-mail. Vous pouvez également suivre le statut en temps réel depuis votre Espace Client.",
      nextSteps: "Prochaines étapes",
      step1: "Nous vérifierons que toutes les informations sont correctes",
      step2: "Nous entamerons les démarches auprès des autorités compétentes",
      step3: "Nous vous tiendrons informé à chaque étape du processus",
      trackButton: "Voir le statut de ma demande",
      questionRef: "Vous avez des questions ? Répondez simplement à cet e-mail en mentionnant votre référence et nous serons ravis de vous aider."
    },
    autoReply: {
      receivedMessage: "Votre message a été reçu avec succès.",
      ticketNumber: "Numéro de ticket",
      estimatedResponse: "Temps de réponse estimé : <strong>24-48 heures ouvrables</strong>",
      responding: "Notre équipe examinera votre demande et vous répondra dans les plus brefs délais. Si vous devez ajouter des informations supplémentaires, répondez directement à cet e-mail.",
      seeMessages: "Voir les messages"
    },
    orderUpdate: {
      statusChanged: "Le statut de votre commande a été mis à jour.",
      orderLabel: "Commande :",
      newStatus: "Nouveau statut :",
      statusPending: "En attente",
      statusProcessing: "En cours de traitement",
      statusPaid: "Payé",
      statusFiled: "Déposé",
      statusDocumentsReady: "Documents prêts",
      statusCompleted: "Terminé",
      statusCancelled: "Annulé",
      clarification: "Pour toute clarification concernant cette mise à jour, répondez directement à cet e-mail.",
      trackButton: "Voir les détails complets"
    },
    orderCompleted: {
      llcReady: "Votre LLC est prête !",
      congratulations: "Félicitations ! Votre commande a été complétée avec succès. Tout est prêt pour que vous puissiez commencer à exploiter votre entreprise aux États-Unis.",
      docsReady: "Votre documentation est prête",
      accessDocuments: "Vous pouvez maintenant accéder et télécharger tous les documents de votre entreprise depuis votre Centre de Documentation.",
      whatYouFind: "Que trouverez-vous ?",
      documentList: "Documents disponibles :",
      articlesOrg: "Articles of Organization (document de constitution)",
      einLetter: "Lettre EIN de l'IRS",
      registeredAgent: "Informations sur l'agent enregistré",
      additionalGuides: "Guides et documents supplémentaires selon votre service",
      viewDocuments: "Voir Mes Documents",
      nextSteps: "Prochaines étapes :",
      activateBanking: "Activer le compte bancaire (si demandé)",
      operatingAgreement: "Générer votre Operating Agreement",
      trackExpenses: "Commencer à suivre les revenus et les dépenses",
      hereForYou: "N'oubliez pas que nous sommes toujours là pour vous aider dans tout ce dont vous avez besoin. Si vous avez des questions sur les prochaines étapes, comme l'ouverture d'un compte bancaire ou la configuration de votre passerelle de paiement, n'hésitez pas à nous contacter.",
      feedbackRequest: "Votre expérience est très importante pour nous. Si vous avez un moment, nous serions ravis de connaître votre avis sur notre service."
    },
    noteReceived: {
      teamNote: "Vous avez un nouveau message de notre équipe",
      relatedToOrder: "concernant votre commande",
      respondNote: "Vous pouvez répondre directement à cet e-mail ou accéder à votre Espace Client pour voir l'historique complet.",
      viewClientArea: "Voir Mon Espace Client"
    },
    adminNote: {
      messageAbout: "Vous avez un message important concernant votre demande :",
      viewTicket: "Voir le ticket",
      viewClientArea: "Voir Mon Espace Client"
    },
    paymentRequest: {
      paymentRequired: "Une demande de paiement a été générée pour poursuivre votre démarche",
      messageLabel: "Message :",
      amount: "pour un montant de",
      payNow: "Effectuer le paiement",
      buttonFallback: "Si le bouton ne fonctionne pas, copiez et collez ce lien :",
      securePayment: "Le paiement est traité de manière sécurisée via Stripe."
    },
    documentRequest: {
      needDocument: "Notre équipe vous demande de télécharger le document suivant :",
      messageLabel: "Message :",
      documentType: "Document demandé :",
      referenceTicket: "Ticket de référence :",
      important: "Important :",
      uploadInstruction: "Veuillez télécharger le document demandé dès que possible pour éviter les retards dans le processus.",
      uploadButton: "Télécharger le document"
    },
    documentUploaded: {
      documentReceived: "Nous avons ajouté un nouveau document à votre dossier :",
      forOrder: "Commande :",
      accessDownload: "Vous pouvez accéder et télécharger ce document depuis votre Espace Client.",
      reviewing: "Notre équipe l'examinera et vous informera si une action supplémentaire est nécessaire.",
      viewDocuments: "Voir Mes Documents",
      trackButton: "Voir le statut de ma demande"
    },
    messageReply: {
      newReply: "Vous avez une nouvelle réponse dans votre conversation :",
      repliedToQuery: "Nous avons répondu à votre demande",
      ticket: "Ticket :",
      viewConversation: "Voir la conversation",
      viewClientArea: "Voir Mon Espace Client"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "Vous avez demandé à changer votre mot de passe. Utilisez le code suivant pour vérifier votre identité :",
      useCode: "Utilisez le code suivant pour confirmer le changement :",
      yourCode: "Votre code de vérification :",
      important: "Important :",
      validFor: "Ce code expire dans <strong>10 minutes</strong>",
      doNotShare: "Ne le partagez avec personne",
      notRequested: "Si vous n'avez pas demandé ce changement, ignorez ce message."
    },
    profileChangeOtp: {
      title: "Vérification d'Identité",
      sensitiveChangeRequest: "Un changement des données sensibles de votre profil a été demandé. Pour confirmer votre identité, utilisez le code de vérification suivant :",
      yourCode: "Votre code de vérification :",
      important: "Important :",
      personalAndConfidential: "Ce code est personnel et confidentiel",
      validFor: "Valable pendant <strong>24 heures</strong>",
      doNotShare: "Ne le partagez avec personne",
      ignoreMessage: "Si vous n'avez pas demandé ce changement, vous pouvez ignorer ce message en toute sécurité."
    },
    accountLocked: {
      locked: "Pour votre sécurité, votre compte a été temporairement verrouillé après la détection de plusieurs tentatives d'accès échouées.",
      attempts: "Pour déverrouiller votre compte et vérifier votre identité, nous avons besoin que vous nous envoyiez :",
      verifyIdentity: "Pour déverrouiller votre compte et vérifier votre identité, nous avons besoin que vous nous envoyiez :",
      idRequirement: "Image haute résolution de la pièce d'identité/passeport (recto-verso)",
      birthDateConfirm: "Votre date de naissance confirmée",
      referenceTicket: "Votre numéro de ticket de référence est :",
      contactSupport: "Pour déverrouiller votre compte, contactez notre équipe de support :",
      resetPassword: "Réinitialiser le mot de passe",
      unlockButton: "Contacter le support"
    },
    renewalReminder: {
      reminderText: "Nous vous rappelons que le pack de maintenance de votre LLC",
      expiresIn: "Expire dans",
      dueDate: "Date d'échéance :",
      daysRemaining: "Jours restants :",
      withoutMaintenance: "Sans le pack de maintenance actif, votre LLC peut perdre son bon état juridique. Cela inclut :",
      registeredAgentActive: "Agent enregistré actif",
      annualReports: "Dépôt des rapports annuels",
      taxCompliance: "Conformité fiscale (IRS 1120/5472)",
      legalAddress: "Adresse légale aux États-Unis",
      renewNow: "Renouveler maintenant",
      whatHappens: "Que se passe-t-il si je ne renouvelle pas ?",
      penalties: "Pénalités et frais supplémentaires possibles",
      agentExpires: "Votre agent enregistré expirera",
      goodStanding: "Votre LLC pourrait perdre son bon état",
      viewCalendar: "Voir le calendrier fiscal"
    },
    registrationOtp: {
      almostDone: "Merci de vous être inscrit chez Easy US LLC. Votre code de vérification est :",
      confirmEmail: "Pour compléter l'inscription de votre compte, entrez le code de vérification suivant :",
      yourCode: "Votre code de vérification :",
      important: "Important :",
      validFor: "Ce code expire dans",
      doNotShare: "Ne le partagez avec personne",
      clientIdLabel: "Votre identifiant client est :",
      ignoreMessage: "Si vous n'avez pas créé de compte chez nous, vous pouvez ignorer ce message."
    },
    operatingAgreementReady: {
      ready: "Votre Operating Agreement est prêt !",
      generated: "Nous avons d'excellentes nouvelles pour vous.",
      llcData: "Données de votre LLC",
      companyLabel: "Entreprise :",
      stateLabel: "État :",
      einLabel: "EIN :",
      whatIs: "Qu'est-ce que l'Operating Agreement ?",
      explanation: "C'est le document juridique qui établit les règles de fonctionnement de votre LLC, y compris la structure de propriété, la répartition des bénéfices et les responsabilités des membres.",
      fullExplanation: "C'est le document juridique fondamental de votre LLC. Il définit la gestion de votre entreprise, les responsabilités du propriétaire et les règles de fonctionnement. Bien que non obligatoire dans certains États, il est fortement recommandé car :",
      reason1: "Il renforce la séparation entre vos finances personnelles et celles de l'entreprise",
      reason2: "Il est exigé par les banques et les processeurs de paiement comme Stripe",
      reason3: "Il fournit une protection juridique supplémentaire pour vous en tant que propriétaire",
      reason4: "Il documente officiellement la structure de votre entreprise",
      generateButton: "Générer mon Operating Agreement",
      autoGenerated: "Le document sera généré automatiquement avec les données de votre LLC et sauvegardé dans votre Centre de Documentation pour que vous puissiez le télécharger quand vous en avez besoin.",
      viewDocument: "Voir mon document",
      tip: "Conseil :",
      tipText: "Conservez une copie signée de ce document avec vos autres fichiers importants de l'entreprise."
    },
    documentApproved: {
      title: "Document Approuvé",
      approved: "Approuvé",
      reviewedAndApproved: "Votre document a été examiné et approuvé avec succès.",
      viewDocuments: "Voir mes documents"
    },
    documentRejected: {
      title: "Document Rejeté - Action Requise",
      rejected: "Rejeté",
      reviewedAndRejected: "Votre document a été examiné et rejeté.",
      reason: "Raison",
      pleaseReupload: "Veuillez accéder à votre tableau de bord client et télécharger à nouveau le document corrigé.",
      viewDocuments: "Voir mes documents"
    },
    profileChangesVerified: {
      title: "Modifications de Profil Vérifiées avec OTP",
      client: "Client",
      email: "Email",
      clientId: "ID Client",
      fieldsModified: "Champs modifiés",
      verifiedWithOtp: "Modification vérifiée avec OTP"
    },
    abandonedApplication: {
      incomplete: "Votre demande est incomplète",
      noticeText: "Nous avons remarqué que vous avez commencé à remplir votre demande de",
      importantNote: "Note importante :",
      draftDeletion: "Votre brouillon sera automatiquement supprimé si vous ne le complétez pas. Pour des raisons de sécurité et de protection des données, nous ne pouvons pas conserver les demandes incomplètes indéfiniment.",
      understandDoubts: "Nous comprenons que créer une LLC peut soulever quelques questions. Sachez que nous sommes là pour vous accompagner à chaque étape du processus.",
      questionsHelp: "Si vous avez des questions ou besoin d'aide pour compléter votre demande, répondez simplement à cet e-mail et nous serons ravis de vous aider.",
      whyChoose: "Pourquoi choisir Easy US LLC ?",
      reason1: "Formation complète en 48-72 heures",
      reason2: "Assistance en espagnol tout au long du processus",
      reason3: "Obtention de l'EIN incluse",
      reason4: "Aide à l'ouverture d'un compte bancaire",
      reason5: "Support continu après la formation",
      noMoreReminders: "Si vous décidez finalement de ne pas continuer, nous ne vous enverrons plus de rappels concernant cette demande. Votre vie privée est importante pour nous.",
      savedDraft: "Ne vous inquiétez pas, nous avons sauvegardé toute votre progression pour que vous puissiez reprendre exactement là où vous vous êtes arrêté.",
      continueButton: "Continuer ma demande",
      tip: "Conseil :",
      tipText: "Complétez votre demande pour que nous puissions commencer à travailler sur votre LLC le plus rapidement possible.",
      expiring: "Votre brouillon expirera dans 48 heures s'il n'est pas complété.",
      llcFormation: "la constitution de votre LLC",
      maintenancePack: "pack de maintenance",
      dontLoseProgress: "Ne perdez pas votre progression. Reprenez votre demande maintenant et complétez le processus en quelques minutes.",
      lastHours: "dernières heures",
      autoDeleteWarning: "Votre demande sera automatiquement supprimée si vous ne la complétez pas."
    },
    calculatorResults: {
      results: "Résultats de votre calcul",
      introText: "Voici le résumé de votre comparaison fiscale demandée. Nous avons analysé les chiffres et souhaitons que vous ayez toutes les informations pour prendre la meilleure décision pour votre entreprise.",
      summary: "Résumé de votre analyse",
      income: "Revenus annuels :",
      expenses: "Dépenses déductibles :",
      autonomoTax: "Impôts en tant qu'indépendant :",
      llcTax: "Impôts avec LLC :",
      potentialSavings: "Vos économies potentielles :",
      savings: "Économies estimées :",
      withLLC: "Avec une LLC aux États-Unis, vous pourriez optimiser considérablement votre charge fiscale tout en opérant de manière parfaitement légale. Ces économies se maintiennent année après année, ce qui peut représenter une différence importante pour votre entreprise à long terme.",
      learnMore: "Souhaitez-vous en savoir plus sur le fonctionnement ? Nous serons ravis de répondre à toutes vos questions sans engagement.",
      viewServices: "Voir nos services",
      disclaimer: "Ce calcul est indicatif et basé sur les données que vous avez fournies. Pour une analyse personnalisée de votre situation, n'hésitez pas à nous contacter."
    },
    newsletter: {
      confirmed: "Votre abonnement a été confirmé avec succès.",
      willReceive: "Vous recevrez des informations pertinentes sur les services, mises à jour et nouveautés liées à Easy US LLC.",
      unsubscribe: "Vous pouvez vous désabonner à tout moment via le lien inclus dans nos e-mails."
    },
    orderEvent: {
      update: "Votre commande a une mise à jour :",
      date: "Date :",
      viewDetails: "Voir les détails"
    },
    identityVerificationRequest: {
      subject: "Vérification d'identité requise | Easy US LLC",
      intro: "Nous devons vérifier votre identité pour garantir la sécurité de votre compte et respecter nos politiques de protection des données.",
      whyTitle: "Pourquoi est-ce nécessaire ?",
      whyText: "Chez Easy US LLC, nous prenons très au sérieux la sécurité de nos clients. Cette vérification est une étape essentielle pour protéger vos informations personnelles et garantir que vous seul avez accès à votre compte.",
      whatNeedTitle: "De quoi avons-nous besoin ?",
      whatNeedText: "Nous vous demandons de télécharger un document d'identité officiel valide et en cours de validité. Les formats suivants sont acceptés :",
      acceptedDocs: "Documents acceptés :",
      doc1: "Carte d'identité nationale (recto et verso)",
      doc2: "Passeport (page principale avec photo)",
      doc3: "Titre de séjour / Carte de résident (recto et verso)",
      howToUploadTitle: "Comment télécharger votre document ?",
      howStep1: "Accédez à votre Espace Client depuis le bouton ci-dessous",
      howStep2: "Vous verrez une section pour télécharger votre document d'identité",
      howStep3: "Téléchargez une photo claire et lisible de votre document (PDF, JPG ou PNG, maximum 5 Mo)",
      uploadButton: "Télécharger le Document d'Identité",
      duringProcess: "Pendant le traitement de votre vérification, les fonctions de votre compte seront temporairement limitées. Vous ne pourrez pas passer de nouvelles commandes ni modifier les informations existantes, mais ne vous inquiétez pas : vos procédures en cours ne seront pas affectées.",
      adminNotes: "Note de l'équipe :",
      teamMessage: "Notre équipe examinera votre document dans un délai de 24 à 48 heures ouvrables. Nous vous notifierons par e-mail dès que la vérification sera terminée.",
      closing: "Merci pour votre coopération et votre patience. Nous sommes là pour vous aider."
    },
    identityVerificationApproved: {
      subject: "Identité vérifiée avec succès | Easy US LLC",
      intro: "Excellente nouvelle ! Votre identité a été vérifiée avec succès.",
      verified: "Notre équipe a examiné votre documentation et tout est en ordre. Votre compte a été réactivé et vous pouvez désormais utiliser tous nos services normalement.",
      accessRestored: "L'accès complet à votre compte a été restauré. Vous pouvez maintenant passer des commandes, modifier votre profil et accéder à tous les services disponibles.",
      viewDashboard: "Accéder à Mon Espace Client",
      closing: "Merci pour votre patience et votre coopération. Nous sommes ravis de continuer à vous aider."
    },
    identityVerificationRejected: {
      subject: "Vérification d'identité : nouvelle documentation requise | Easy US LLC",
      intro: "Nous avons examiné la documentation que vous nous avez envoyée, mais malheureusement nous n'avons pas pu vérifier votre identité avec le document fourni.",
      notApproved: "Le document soumis ne répond pas aux exigences nécessaires pour compléter la vérification.",
      reason: "Raison :",
      whatToDo: "Que devez-vous faire ?",
      reuploadStep: "Accédez à votre Espace Client et téléchargez un nouveau document d'identité conforme aux exigences. Assurez-vous que l'image soit claire, lisible et montre toutes les informations nécessaires.",
      uploadButton: "Télécharger un Nouveau Document",
      needHelp: "Si vous avez des questions ou besoin d'aide, n'hésitez pas à contacter notre équipe d'assistance. Nous sommes là pour vous aider.",
      closing: "Merci pour votre compréhension et votre coopération."
    }
  },
  de: {
    common: {
      greeting: "Hallo",
      closing: "Mit freundlichen Grüßen,",
      doubts: "Bei Fragen antworten Sie bitte direkt auf diese E-Mail.",
      client: "Kunde"
    },
    otp: {
      thanks: "Vielen Dank, dass Sie Ihren Prozess bei Easy US LLC fortsetzen.",
      forSecurity: "Um die Sicherheit Ihres Kontos zu gewährleisten, verwenden Sie bitte den folgenden Verifizierungscode:",
      yourCode: "Ihr OTP-Code:",
      important: "Wichtig:",
      personalAndConfidential: "Dieser Code ist persönlich und vertraulich",
      validFor: "Er ist aus Sicherheitsgründen <strong>15 Minuten</strong> gültig",
      doNotShare: "Teilen Sie ihn mit niemandem",
      ignoreMessage: "Wenn Sie diesen Code nicht angefordert haben, können Sie diese Nachricht bedenkenlos ignorieren.",
      ipDetected: "Anmeldeversuch erkannt von IP:"
    },
    welcome: {
      welcomeMessage: "Willkommen bei Easy US LLC! Wir freuen uns sehr, Sie bei uns zu haben.",
      accountCreated: "Ihr Konto wurde erfolgreich erstellt und Sie können alles erkunden, was wir gemeinsam erreichen können. Über Ihren Kundenbereich haben Sie Zugang zu:",
      accessFrom: "Über Ihren Kundenbereich haben Sie Zugang zu:",
      realTimeTracking: "Echtzeit-Verfolgung Ihrer Anfragen",
      documentCenter: "Dokumentencenter zum Herunterladen aller Ihrer Dateien",
      professionalTools: "Professionelle Tools wie den Rechnungsgenerator",
      fiscalCalendar: "Steuerkalender mit Ihren wichtigen Terminen",
      directSupport: "Direkte Kommunikation mit unserem Support-Team",
      hereToHelp: "Wir sind hier, um Sie bei jedem Schritt Ihres geschäftlichen Abenteuers in den Vereinigten Staaten zu unterstützen. Wenn Sie Fragen haben, zögern Sie nicht, uns zu kontaktieren.",
      exploreButton: "Meinen Kundenbereich erkunden"
    },
    accountPendingVerification: {
      accountCreatedBut: "Ihr Konto wurde erfolgreich erstellt, aber Sie müssen Ihre E-Mail-Adresse verifizieren, um es vollständig zu aktivieren.",
      actionRequired: "Aktion erforderlich:",
      accessAndVerify: "Greifen Sie auf Ihren Kundenbereich zu und verifizieren Sie Ihre E-Mail, um Ihr Konto zu aktivieren und auf alle Funktionen zuzugreifen.",
      verifyButton: "Meine E-Mail verifizieren",
      whileUnverified: "Solange Ihre E-Mail nicht verifiziert ist, bleibt Ihr Konto in Überprüfung."
    },
    accountUnderReview: {
      underReview: "Wir möchten Sie darüber informieren, dass Ihr Konto einen kurzen Überprüfungsprozess durchläuft. Keine Sorge, dies ist völlig routinemäßig und gehört zu unseren Sicherheitsstandards zum Schutz Ihrer Daten und zur Gewährleistung einer sicheren Erfahrung.",
      whyReview: "Warum tun wir das?",
      whyReviewText: "Bei Easy US LLC nehmen wir die Sicherheit unserer Kunden sehr ernst. Dieser Prozess ermöglicht es uns zu überprüfen, ob alle Informationen korrekt sind und Ihr Konto ordnungsgemäß geschützt ist.",
      duringProcess: "Während dieser kurzen Phase werden die Funktionen Ihres Kontos vorübergehend eingeschränkt. Das bedeutet, dass Sie keine neuen Bestellungen aufgeben oder bestehende Informationen ändern können, aber keine Sorge: Diese Situation ist vorübergehend und beeinträchtigt keine bereits laufenden Verfahren.",
      whatHappens: "Was passiert jetzt?",
      step1: "Unser Team wird Ihre Kontoinformationen überprüfen (normalerweise innerhalb von 24-48 Geschäftstagen)",
      step2: "Wir werden Sie per E-Mail benachrichtigen, sobald die Überprüfung abgeschlossen ist",
      step3: "Wenn wir zusätzliche Dokumente benötigen, werden wir Sie klar und einfach darüber informieren",
      teamReviewing: "In der Zwischenzeit, wenn Sie Fragen haben oder Hilfe benötigen, zögern Sie nicht, auf diese E-Mail zu antworten. Wir sind hier, um Ihnen bei allem zu helfen, was Sie brauchen.",
      patience: "Vielen Dank für Ihre Geduld und Ihr Vertrauen. Wir wissen, dass Ihre Zeit wertvoll ist, und werden alles tun, um dies so schnell wie möglich zu klären.",
      closing: "Herzliche Grüße vom Easy US LLC Team"
    },
    accountVip: {
      updatedToVip: "Ihr Konto wurde auf den VIP-Status aktualisiert.",
      benefits: "VIP-Vorteile:",
      priorityAttention: "Prioritäre Betreuung und beschleunigte Bearbeitung",
      preferentialTracking: "Bevorzugte Nachverfolgung durch unser Team",
      fullAccess: "Vollständiger Zugang zu allen Diensten",
      viewDashboard: "Meinen Kundenbereich anzeigen"
    },
    accountReactivated: {
      reactivated: "Ihr Konto wurde erfolgreich reaktiviert.",
      canAccess: "Sie können jetzt auf Ihren Kundenbereich zugreifen und alle unsere Dienste normal nutzen.",
      viewDashboard: "Meinen Kundenbereich anzeigen"
    },
    accountDeactivated: {
      deactivated: "Wir bedauern, Ihnen mitteilen zu müssen, dass Ihr Konto deaktiviert wurde.",
      cannotAccess: "Solange Ihr Konto in diesem Zustand bleibt, können Sie nicht auf Ihren Kundenbereich zugreifen oder Vorgänge über unsere Plattform durchführen.",
      contactSupport: "Wenn Sie glauben, dass dies ein Fehler ist, oder weitere Informationen wünschen, kontaktieren Sie bitte unser Support-Team, indem Sie auf diese E-Mail antworten."
    },
    accountDeactivatedByUser: {
      deactivated: "Wir haben Ihre Anfrage zur Kontolöschung erhalten. Ihr Konto wurde deaktiviert und wird in Kürze gelöscht.",
      cannotAccess: "Ab sofort können Sie nicht mehr auf Ihren Kundenbereich zugreifen oder Vorgänge über unsere Plattform durchführen.",
      contactSupport: "Wenn Sie Ihre Meinung geändert haben oder glauben, dass es sich um einen Fehler handelt, kontaktieren Sie bitte unser Support-Team, indem Sie so schnell wie möglich auf diese E-Mail antworten."
    },
    confirmation: {
      greatNews: "Großartige Neuigkeiten! Wir haben Ihre Anfrage erhalten und arbeiten bereits daran. Ab jetzt kümmert sich unser Team um alles.",
      details: "Anfrage-Details",
      reference: "Referenz:",
      service: "Dienst:",
      company: "Unternehmen:",
      state: "Staat:",
      currentStatus: "Aktueller Status:",
      inReview: "In Überprüfung",
      whatNow: "Was passiert jetzt?",
      validatingInfo: "Unser Team überprüft alle von Ihnen bereitgestellten Informationen. In den nächsten Stunden erhalten Sie Updates zum Fortschritt Ihrer Anfrage direkt per E-Mail. Sie können den Status auch in Echtzeit über Ihren Kundenbereich verfolgen.",
      nextSteps: "Nächste Schritte",
      step1: "Wir werden überprüfen, ob alle Informationen korrekt sind",
      step2: "Wir werden die Verfahren bei den zuständigen Behörden einleiten",
      step3: "Wir werden Sie in jeder Phase des Prozesses auf dem Laufenden halten",
      trackButton: "Meinen Anfragestatus anzeigen",
      questionRef: "Haben Sie Fragen? Antworten Sie einfach auf diese E-Mail unter Angabe Ihrer Referenz und wir helfen Ihnen gerne."
    },
    autoReply: {
      receivedMessage: "Ihre Nachricht wurde erfolgreich empfangen.",
      ticketNumber: "Ticket-Nummer",
      estimatedResponse: "Geschätzte Antwortzeit: <strong>24-48 Geschäftstage</strong>",
      responding: "Unser Team wird Ihre Anfrage prüfen und so schnell wie möglich antworten. Wenn Sie zusätzliche Informationen hinzufügen möchten, antworten Sie direkt auf diese E-Mail.",
      seeMessages: "Nachrichten anzeigen"
    },
    orderUpdate: {
      statusChanged: "Der Status Ihrer Bestellung wurde aktualisiert.",
      orderLabel: "Bestellung:",
      newStatus: "Neuer Status:",
      statusPending: "Ausstehend",
      statusProcessing: "In Bearbeitung",
      statusPaid: "Bezahlt",
      statusFiled: "Eingereicht",
      statusDocumentsReady: "Dokumente bereit",
      statusCompleted: "Abgeschlossen",
      statusCancelled: "Storniert",
      clarification: "Für Rückfragen zu dieser Aktualisierung antworten Sie bitte direkt auf diese E-Mail.",
      trackButton: "Vollständige Details anzeigen"
    },
    orderCompleted: {
      llcReady: "Ihre LLC ist fertig!",
      congratulations: "Herzlichen Glückwunsch! Ihre Bestellung wurde erfolgreich abgeschlossen. Alles ist bereit, damit Sie Ihr Unternehmen in den Vereinigten Staaten betreiben können.",
      docsReady: "Ihre Dokumentation ist bereit",
      accessDocuments: "Sie können jetzt alle Dokumente Ihres Unternehmens über Ihr Dokumentencenter abrufen und herunterladen.",
      whatYouFind: "Was werden Sie finden?",
      documentList: "Verfügbare Dokumente:",
      articlesOrg: "Articles of Organization (Gründungsdokument)",
      einLetter: "EIN-Brief vom IRS",
      registeredAgent: "Informationen zum registrierten Vertreter",
      additionalGuides: "Leitfäden und zusätzliche Dokumente basierend auf Ihrem Service",
      viewDocuments: "Meine Dokumente anzeigen",
      nextSteps: "Nächste Schritte:",
      activateBanking: "Bankkonto aktivieren (falls angefordert)",
      operatingAgreement: "Ihren Operating Agreement erstellen",
      trackExpenses: "Einnahmen und Ausgaben erfassen",
      hereForYou: "Denken Sie daran, dass wir weiterhin für Sie da sind, um Ihnen bei allem zu helfen, was Sie brauchen. Wenn Sie Fragen zu den nächsten Schritten haben, wie die Eröffnung eines Bankkontos oder die Einrichtung Ihres Zahlungs-Gateways, zögern Sie nicht, uns zu kontaktieren.",
      feedbackRequest: "Ihre Erfahrung ist uns sehr wichtig. Wenn Sie einen Moment Zeit haben, würden wir uns über Ihre Meinung zu unserem Service freuen."
    },
    noteReceived: {
      teamNote: "Sie haben eine neue Nachricht von unserem Team",
      relatedToOrder: "bezüglich Ihrer Bestellung",
      respondNote: "Sie können direkt auf diese E-Mail antworten oder über Ihren Kundenbereich den vollständigen Verlauf einsehen.",
      viewClientArea: "Meinen Kundenbereich anzeigen"
    },
    adminNote: {
      messageAbout: "Sie haben eine wichtige Nachricht zu Ihrer Anfrage:",
      viewTicket: "Ticket anzeigen",
      viewClientArea: "Meinen Kundenbereich anzeigen"
    },
    paymentRequest: {
      paymentRequired: "Eine Zahlungsanforderung wurde erstellt, um mit Ihrem Verfahren fortzufahren",
      messageLabel: "Nachricht:",
      amount: "in Höhe von",
      payNow: "Jetzt bezahlen",
      buttonFallback: "Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn ein:",
      securePayment: "Die Zahlung wird sicher über Stripe abgewickelt."
    },
    documentRequest: {
      needDocument: "Unser Team benötigt, dass Sie folgendes Dokument hochladen:",
      messageLabel: "Nachricht:",
      documentType: "Angefordertes Dokument:",
      referenceTicket: "Referenz-Ticket:",
      important: "Wichtig:",
      uploadInstruction: "Bitte laden Sie das angeforderte Dokument so schnell wie möglich hoch, um Verzögerungen im Prozess zu vermeiden.",
      uploadButton: "Dokument hochladen"
    },
    documentUploaded: {
      documentReceived: "Wir haben ein neues Dokument zu Ihrer Akte hinzugefügt:",
      forOrder: "Bestellung:",
      accessDownload: "Sie können dieses Dokument über Ihren Kundenbereich abrufen und herunterladen.",
      reviewing: "Unser Team wird es überprüfen und Sie benachrichtigen, wenn weitere Maßnahmen erforderlich sind.",
      viewDocuments: "Meine Dokumente anzeigen",
      trackButton: "Anfragestatus anzeigen"
    },
    messageReply: {
      newReply: "Sie haben eine neue Antwort in Ihrer Konversation:",
      repliedToQuery: "Wir haben auf Ihre Anfrage geantwortet",
      ticket: "Ticket:",
      viewConversation: "Konversation anzeigen",
      viewClientArea: "Meinen Kundenbereich anzeigen"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "Sie haben die Änderung Ihres Passworts beantragt. Verwenden Sie den folgenden Code zur Verifizierung Ihrer Identität:",
      useCode: "Verwenden Sie den folgenden Code, um die Änderung zu bestätigen:",
      yourCode: "Ihr Verifizierungscode:",
      important: "Wichtig:",
      validFor: "Dieser Code läuft in <strong>10 Minuten</strong> ab",
      doNotShare: "Teilen Sie ihn mit niemandem",
      notRequested: "Wenn Sie diese Änderung nicht beantragt haben, ignorieren Sie diese Nachricht."
    },
    profileChangeOtp: {
      title: "Identitätsverifizierung",
      sensitiveChangeRequest: "Eine Änderung sensibler Profildaten wurde angefordert. Um Ihre Identität zu bestätigen, verwenden Sie den folgenden Verifizierungscode:",
      yourCode: "Ihr Verifizierungscode:",
      important: "Wichtig:",
      personalAndConfidential: "Dieser Code ist persönlich und vertraulich",
      validFor: "Gültig für <strong>24 Stunden</strong>",
      doNotShare: "Teilen Sie ihn mit niemandem",
      ignoreMessage: "Wenn Sie diese Änderung nicht angefordert haben, können Sie diese Nachricht bedenkenlos ignorieren."
    },
    accountLocked: {
      locked: "Zu Ihrer Sicherheit wurde Ihr Konto nach mehreren fehlgeschlagenen Zugriffsversuchen vorübergehend gesperrt.",
      attempts: "Um Ihr Konto zu entsperren und Ihre Identität zu verifizieren, benötigen wir Folgendes von Ihnen:",
      verifyIdentity: "Um Ihr Konto zu entsperren und Ihre Identität zu verifizieren, benötigen wir Folgendes von Ihnen:",
      idRequirement: "Hochauflösendes Bild des Ausweises/Reisepasses (beide Seiten)",
      birthDateConfirm: "Ihr bestätigtes Geburtsdatum",
      referenceTicket: "Ihre Referenz-Ticket-ID lautet:",
      contactSupport: "Um Ihr Konto zu entsperren, kontaktieren Sie unser Support-Team:",
      resetPassword: "Passwort zurücksetzen",
      unlockButton: "Support kontaktieren"
    },
    renewalReminder: {
      reminderText: "Wir erinnern Sie daran, dass das Wartungspaket Ihrer LLC",
      expiresIn: "Läuft ab in",
      dueDate: "Fälligkeitsdatum:",
      daysRemaining: "Verbleibende Tage:",
      withoutMaintenance: "Ohne aktives Wartungspaket kann Ihre LLC ihren guten rechtlichen Status verlieren. Dazu gehört:",
      registeredAgentActive: "Aktiver registrierter Vertreter",
      annualReports: "Einreichung der Jahresberichte",
      taxCompliance: "Steuerkonformität (IRS 1120/5472)",
      legalAddress: "Rechtsadresse in den Vereinigten Staaten",
      renewNow: "Jetzt erneuern",
      whatHappens: "Was passiert, wenn ich nicht erneuere?",
      penalties: "Mögliche Strafen und Zuschläge",
      agentExpires: "Ihr registrierter Vertreter läuft ab",
      goodStanding: "Ihre LLC könnte den guten Status verlieren",
      viewCalendar: "Steuerkalender anzeigen"
    },
    registrationOtp: {
      almostDone: "Vielen Dank für Ihre Registrierung bei Easy US LLC. Ihr Verifizierungscode lautet:",
      confirmEmail: "Um die Registrierung Ihres Kontos abzuschließen, geben Sie den folgenden Verifizierungscode ein:",
      yourCode: "Ihr Verifizierungscode:",
      important: "Wichtig:",
      validFor: "Dieser Code läuft ab in",
      doNotShare: "Teilen Sie ihn mit niemandem",
      clientIdLabel: "Ihre Kunden-ID lautet:",
      ignoreMessage: "Wenn Sie kein Konto bei uns erstellt haben, können Sie diese Nachricht ignorieren."
    },
    operatingAgreementReady: {
      ready: "Ihr Operating Agreement ist fertig!",
      generated: "Wir haben großartige Neuigkeiten für Sie.",
      llcData: "Ihre LLC-Daten",
      companyLabel: "Unternehmen:",
      stateLabel: "Staat:",
      einLabel: "EIN:",
      whatIs: "Was ist das Operating Agreement?",
      explanation: "Es ist das rechtliche Dokument, das die Betriebsregeln Ihrer LLC festlegt, einschließlich der Eigentumsstruktur, Gewinnverteilung und Verantwortlichkeiten der Mitglieder.",
      fullExplanation: "Es ist das grundlegende Rechtsdokument Ihrer LLC. Es definiert, wie Ihr Unternehmen geführt wird, die Verantwortlichkeiten des Eigentümers und die Betriebsregeln. Obwohl es in einigen Staaten nicht obligatorisch ist, wird es dringend empfohlen, weil:",
      reason1: "Es verstärkt die Trennung zwischen Ihren persönlichen und geschäftlichen Finanzen",
      reason2: "Es wird von Banken und Zahlungsanbietern wie Stripe verlangt",
      reason3: "Es bietet Ihnen als Eigentümer zusätzlichen Rechtsschutz",
      reason4: "Es dokumentiert offiziell die Struktur Ihres Unternehmens",
      generateButton: "Mein Operating Agreement erstellen",
      autoGenerated: "Das Dokument wird automatisch mit Ihren LLC-Daten erstellt und in Ihrem Dokumentencenter gespeichert, damit Sie es jederzeit herunterladen können.",
      viewDocument: "Mein Dokument anzeigen",
      tip: "Tipp:",
      tipText: "Bewahren Sie eine unterzeichnete Kopie dieses Dokuments zusammen mit Ihren anderen wichtigen Unternehmensunterlagen auf."
    },
    documentApproved: {
      title: "Dokument Genehmigt",
      approved: "Genehmigt",
      reviewedAndApproved: "Ihr Dokument wurde überprüft und erfolgreich genehmigt.",
      viewDocuments: "Meine Dokumente anzeigen"
    },
    documentRejected: {
      title: "Dokument Abgelehnt - Aktion Erforderlich",
      rejected: "Abgelehnt",
      reviewedAndRejected: "Ihr Dokument wurde überprüft und abgelehnt.",
      reason: "Grund",
      pleaseReupload: "Bitte greifen Sie auf Ihr Kunden-Dashboard zu und laden Sie das korrigierte Dokument erneut hoch.",
      viewDocuments: "Meine Dokumente anzeigen"
    },
    profileChangesVerified: {
      title: "Profiländerungen mit OTP Verifiziert",
      client: "Kunde",
      email: "E-Mail",
      clientId: "Kunden-ID",
      fieldsModified: "Geänderte Felder",
      verifiedWithOtp: "Änderung mit OTP verifiziert"
    },
    abandonedApplication: {
      incomplete: "Ihr Antrag ist unvollständig",
      noticeText: "Wir haben bemerkt, dass Sie begonnen haben, Ihren Antrag für",
      importantNote: "Wichtiger Hinweis:",
      draftDeletion: "Ihr Entwurf wird automatisch gelöscht, wenn Sie ihn nicht abschließen. Aus Sicherheits- und Datenschutzgründen können wir unvollständige Anträge nicht unbegrenzt aufbewahren.",
      understandDoubts: "Wir verstehen, dass die Gründung einer LLC einige Fragen aufwerfen kann. Wir möchten, dass Sie wissen, dass wir Ihnen bei jedem Schritt des Prozesses zur Seite stehen.",
      questionsHelp: "Wenn Sie Fragen haben oder Hilfe beim Ausfüllen Ihres Antrags benötigen, antworten Sie einfach auf diese E-Mail und wir helfen Ihnen gerne.",
      whyChoose: "Warum Easy US LLC wählen?",
      reason1: "Vollständige Gründung in 48-72 Stunden",
      reason2: "Spanischsprachige Unterstützung während des gesamten Prozesses",
      reason3: "EIN-Beschaffung inklusive",
      reason4: "Hilfe bei der Kontoeröffnung",
      reason5: "Fortlaufender Support nach der Gründung",
      noMoreReminders: "Wenn Sie sich letztendlich entscheiden, nicht fortzufahren, werden wir Ihnen keine weiteren Erinnerungen zu diesem Antrag senden. Ihre Privatsphäre ist uns wichtig.",
      savedDraft: "Keine Sorge, wir haben Ihren gesamten Fortschritt gespeichert, damit Sie genau dort weitermachen können, wo Sie aufgehört haben.",
      continueButton: "Meinen Antrag fortsetzen",
      tip: "Tipp:",
      tipText: "Schließen Sie Ihren Antrag ab, damit wir so schnell wie möglich mit Ihrer LLC beginnen können.",
      expiring: "Ihr Entwurf läuft in 48 Stunden ab, wenn er nicht abgeschlossen wird.",
      llcFormation: "Ihre LLC-Gründung",
      maintenancePack: "Wartungspaket",
      dontLoseProgress: "Verlieren Sie nicht Ihren Fortschritt. Setzen Sie Ihren Antrag jetzt fort und schließen Sie den Prozess in wenigen Minuten ab.",
      lastHours: "letzte Stunden",
      autoDeleteWarning: "Ihr Antrag wird automatisch gelöscht, wenn Sie ihn nicht abschließen."
    },
    calculatorResults: {
      results: "Ihre Berechnungsergebnisse",
      introText: "Hier ist die Zusammenfassung Ihres angeforderten Steuervergleichs. Wir haben die Zahlen analysiert und möchten, dass Sie alle Informationen haben, um die beste Entscheidung für Ihr Unternehmen zu treffen.",
      summary: "Ihre Analysezusammenfassung",
      income: "Jahreseinkommen:",
      expenses: "Abzugsfähige Ausgaben:",
      autonomoTax: "Steuern als Freiberufler:",
      llcTax: "Steuern mit LLC:",
      potentialSavings: "Ihre möglichen Einsparungen:",
      savings: "Geschätzte Einsparungen:",
      withLLC: "Mit einer LLC in den Vereinigten Staaten könnten Sie Ihre Steuerlast erheblich optimieren und dabei völlig legal operieren. Diese Einsparungen bleiben Jahr für Jahr bestehen, was einen wichtigen Unterschied für Ihr Unternehmen langfristig ausmachen kann.",
      learnMore: "Möchten Sie mehr darüber erfahren, wie es funktioniert? Wir beantworten gerne alle Ihre Fragen unverbindlich.",
      viewServices: "Unsere Dienste anzeigen",
      disclaimer: "Diese Berechnung ist indikativ und basiert auf den von Ihnen bereitgestellten Daten. Für eine personalisierte Analyse Ihrer Situation zögern Sie nicht, uns zu kontaktieren."
    },
    newsletter: {
      confirmed: "Ihr Abonnement wurde erfolgreich bestätigt.",
      willReceive: "Sie erhalten relevante Informationen über Dienste, Updates und Neuigkeiten rund um Easy US LLC.",
      unsubscribe: "Sie können sich jederzeit über den Link in unseren E-Mails abmelden."
    },
    orderEvent: {
      update: "Ihre Bestellung hat ein Update:",
      date: "Datum:",
      viewDetails: "Details anzeigen"
    },
    identityVerificationRequest: {
      subject: "Identitätsverifizierung erforderlich | Easy US LLC",
      intro: "Wir müssen Ihre Identität verifizieren, um die Sicherheit Ihres Kontos zu gewährleisten und unsere Datenschutzrichtlinien einzuhalten.",
      whyTitle: "Warum ist das notwendig?",
      whyText: "Bei Easy US LLC nehmen wir die Sicherheit unserer Kunden sehr ernst. Diese Verifizierung ist ein wesentlicher Schritt, um Ihre persönlichen Daten zu schützen und sicherzustellen, dass nur Sie Zugang zu Ihrem Konto haben.",
      whatNeedTitle: "Was benötigen wir?",
      whatNeedText: "Wir bitten Sie, ein gültiges und aktuelles amtliches Ausweisdokument hochzuladen. Die folgenden Formate werden akzeptiert:",
      acceptedDocs: "Akzeptierte Dokumente:",
      doc1: "Personalausweis (Vorder- und Rückseite)",
      doc2: "Reisepass (Hauptseite mit Foto)",
      doc3: "Aufenthaltstitel / Aufenthaltskarte (Vorder- und Rückseite)",
      howToUploadTitle: "Wie laden Sie Ihr Dokument hoch?",
      howStep1: "Greifen Sie über die Schaltfläche unten auf Ihren Kundenbereich zu",
      howStep2: "Sie sehen einen Bereich zum Hochladen Ihres Ausweisdokuments",
      howStep3: "Laden Sie ein klares und lesbares Foto Ihres Dokuments hoch (PDF, JPG oder PNG, maximal 5 MB)",
      uploadButton: "Ausweisdokument Hochladen",
      duringProcess: "Während Ihre Verifizierung bearbeitet wird, sind die Funktionen Ihres Kontos vorübergehend eingeschränkt. Sie können keine neuen Bestellungen aufgeben oder bestehende Informationen ändern, aber keine Sorge: Ihre laufenden Vorgänge werden nicht beeinträchtigt.",
      adminNotes: "Hinweis des Teams:",
      teamMessage: "Unser Team wird Ihr Dokument innerhalb von 24-48 Geschäftsstunden prüfen. Wir werden Sie per E-Mail benachrichtigen, sobald die Verifizierung abgeschlossen ist.",
      closing: "Vielen Dank für Ihre Zusammenarbeit und Geduld. Wir sind hier, um Ihnen zu helfen."
    },
    identityVerificationApproved: {
      subject: "Identität erfolgreich verifiziert | Easy US LLC",
      intro: "Großartige Neuigkeiten! Ihre Identität wurde erfolgreich verifiziert.",
      verified: "Unser Team hat Ihre Dokumentation geprüft und alles ist in Ordnung. Ihr Konto wurde reaktiviert und Sie können nun alle unsere Dienste normal nutzen.",
      accessRestored: "Der vollständige Zugang zu Ihrem Konto wurde wiederhergestellt. Sie können jetzt Bestellungen aufgeben, Ihr Profil ändern und auf alle verfügbaren Dienste zugreifen.",
      viewDashboard: "Zum Kundenbereich",
      closing: "Vielen Dank für Ihre Geduld und Zusammenarbeit. Wir freuen uns, Ihnen weiterhin helfen zu können."
    },
    identityVerificationRejected: {
      subject: "Identitätsverifizierung: neue Dokumentation erforderlich | Easy US LLC",
      intro: "Wir haben die von Ihnen gesendete Dokumentation geprüft, konnten Ihre Identität jedoch leider nicht mit dem bereitgestellten Dokument verifizieren.",
      notApproved: "Das eingereichte Dokument erfüllt nicht die Anforderungen zur Durchführung der Verifizierung.",
      reason: "Grund:",
      whatToDo: "Was sollten Sie tun?",
      reuploadStep: "Greifen Sie auf Ihren Kundenbereich zu und laden Sie ein neues Ausweisdokument hoch, das den Anforderungen entspricht. Stellen Sie sicher, dass das Bild klar, lesbar und alle notwendigen Informationen zeigt.",
      uploadButton: "Neues Dokument Hochladen",
      needHelp: "Wenn Sie Fragen haben oder Hilfe benötigen, zögern Sie nicht, unser Support-Team zu kontaktieren. Wir sind hier, um Ihnen zu helfen.",
      closing: "Vielen Dank für Ihr Verständnis und Ihre Zusammenarbeit."
    }
  },
  it: {
    common: {
      greeting: "Ciao",
      closing: "Cordiali saluti,",
      doubts: "Se hai domande, rispondi direttamente a questa e-mail.",
      client: "Cliente"
    },
    otp: {
      thanks: "Grazie per continuare il tuo processo con Easy US LLC.",
      forSecurity: "Per garantire la sicurezza del tuo account, utilizza il seguente codice di verifica:",
      yourCode: "Il tuo codice OTP:",
      important: "Importante:",
      personalAndConfidential: "Questo codice è personale e confidenziale",
      validFor: "È valido per <strong>15 minuti</strong> per motivi di sicurezza",
      doNotShare: "Non condividerlo con nessuno",
      ignoreMessage: "Se non hai richiesto questo codice, puoi ignorare questo messaggio in tutta tranquillità.",
      ipDetected: "Tentativo di accesso rilevato dall'IP:"
    },
    welcome: {
      welcomeMessage: "Benvenuto in Easy US LLC! Siamo felici di averti con noi.",
      accountCreated: "Il tuo account è stato creato con successo e puoi iniziare a esplorare tutto ciò che possiamo fare insieme. Dalla tua Area Cliente avrai accesso a:",
      accessFrom: "Dalla tua Area Cliente avrai accesso a:",
      realTimeTracking: "Monitoraggio in tempo reale delle tue richieste",
      documentCenter: "Centro documentazione per scaricare tutti i tuoi file",
      professionalTools: "Strumenti professionali come il generatore di fatture",
      fiscalCalendar: "Calendario fiscale con le tue date importanti",
      directSupport: "Comunicazione diretta con il nostro team di supporto",
      hereToHelp: "Siamo qui per aiutarti in ogni fase della tua avventura imprenditoriale negli Stati Uniti. Se hai domande, non esitare a scriverci.",
      exploreButton: "Esplora la Mia Area Cliente"
    },
    accountPendingVerification: {
      accountCreatedBut: "Il tuo account è stato creato con successo, ma devi verificare la tua e-mail per attivarlo completamente.",
      actionRequired: "Azione richiesta:",
      accessAndVerify: "Accedi alla tua Area Cliente e verifica la tua e-mail per attivare il tuo account e accedere a tutte le funzionalità.",
      verifyButton: "Verifica la mia e-mail",
      whileUnverified: "Finché la tua e-mail non sarà verificata, il tuo account rimarrà in fase di revisione."
    },
    accountUnderReview: {
      underReview: "Vogliamo informarti che il tuo account è entrato in un breve processo di verifica. Non preoccuparti, è completamente di routine e fa parte dei nostri standard di sicurezza per proteggere le tue informazioni e garantire un'esperienza sicura.",
      whyReview: "Perché lo facciamo?",
      whyReviewText: "In Easy US LLC prendiamo molto seriamente la sicurezza dei nostri clienti. Questo processo ci permette di verificare che tutte le informazioni siano corrette e che il tuo account sia adeguatamente protetto.",
      duringProcess: "Durante questo breve periodo, le funzioni del tuo account saranno temporaneamente limitate. Ciò significa che non potrai effettuare nuovi ordini o modificare le informazioni esistenti, ma non preoccuparti: questa situazione è temporanea e non influirà su nessuna procedura già in corso.",
      whatHappens: "Cosa succede ora?",
      step1: "Il nostro team esaminerà le informazioni del tuo account (solitamente entro 24-48 ore lavorative)",
      step2: "Ti notificheremo tramite questa stessa e-mail non appena la verifica sarà completata",
      step3: "Se avremo bisogno di documenti aggiuntivi, te lo comunicheremo in modo chiaro e semplice",
      teamReviewing: "Nel frattempo, se hai domande o hai bisogno di aiuto, non esitare a rispondere a questa e-mail. Siamo qui per aiutarti in tutto ciò di cui hai bisogno.",
      patience: "Grazie per la tua pazienza e fiducia. Sappiamo che il tuo tempo è prezioso e faremo tutto il possibile per risolvere la questione il prima possibile.",
      closing: "Un caro saluto dal team di Easy US LLC"
    },
    accountVip: {
      updatedToVip: "Il tuo account è stato aggiornato allo stato VIP.",
      benefits: "Vantaggi VIP:",
      priorityAttention: "Attenzione prioritaria e gestione accelerata",
      preferentialTracking: "Monitoraggio preferenziale da parte del nostro team",
      fullAccess: "Accesso completo a tutti i servizi",
      viewDashboard: "Visualizza la Mia Area Cliente"
    },
    accountReactivated: {
      reactivated: "Il tuo account è stato riattivato con successo.",
      canAccess: "Ora puoi accedere alla tua Area Cliente e utilizzare tutti i nostri servizi normalmente.",
      viewDashboard: "Visualizza la Mia Area Cliente"
    },
    accountDeactivated: {
      deactivated: "Ci dispiace informarti che il tuo account è stato disattivato.",
      cannotAccess: "Finché il tuo account rimarrà in questo stato, non potrai accedere alla tua Area Cliente né effettuare operazioni tramite la nostra piattaforma.",
      contactSupport: "Se ritieni che si tratti di un errore o desideri maggiori informazioni, contatta il nostro team di supporto rispondendo a questa e-mail."
    },
    accountDeactivatedByUser: {
      deactivated: "Abbiamo ricevuto la tua richiesta di eliminazione dell'account. Il tuo account è stato disattivato e verrà eliminato a breve.",
      cannotAccess: "Da questo momento non potrai più accedere alla tua Area Cliente né effettuare operazioni tramite la nostra piattaforma.",
      contactSupport: "Se hai cambiato idea o ritieni che si tratti di un errore, contatta il nostro team di supporto rispondendo a questa e-mail il prima possibile."
    },
    confirmation: {
      greatNews: "Ottime notizie! Abbiamo ricevuto la tua richiesta e stiamo già lavorando. Da questo momento, il nostro team si occuperà di tutto.",
      details: "Dettagli della richiesta",
      reference: "Riferimento:",
      service: "Servizio:",
      company: "Azienda:",
      state: "Stato:",
      currentStatus: "Stato attuale:",
      inReview: "In revisione",
      whatNow: "Cosa succede ora?",
      validatingInfo: "Il nostro team sta verificando tutte le informazioni che hai fornito. Nelle prossime ore riceverai aggiornamenti sull'avanzamento della tua richiesta direttamente via e-mail. Puoi anche seguire lo stato in tempo reale dalla tua Area Cliente.",
      nextSteps: "Prossimi passi",
      step1: "Verificheremo che tutte le informazioni siano corrette",
      step2: "Avvieremo le procedure presso le autorità competenti",
      step3: "Ti terremo informato in ogni fase del processo",
      trackButton: "Visualizza lo stato della mia richiesta",
      questionRef: "Hai domande? Rispondi semplicemente a questa e-mail indicando il tuo riferimento e saremo felici di aiutarti."
    },
    autoReply: {
      receivedMessage: "Il tuo messaggio è stato ricevuto con successo.",
      ticketNumber: "Numero di ticket",
      estimatedResponse: "Tempo di risposta stimato: <strong>24-48 ore lavorative</strong>",
      responding: "Il nostro team esaminerà la tua richiesta e risponderà il prima possibile. Se hai bisogno di aggiungere informazioni supplementari, rispondi direttamente a questa e-mail.",
      seeMessages: "Visualizza messaggi"
    },
    orderUpdate: {
      statusChanged: "Lo stato del tuo ordine è stato aggiornato.",
      orderLabel: "Ordine:",
      newStatus: "Nuovo stato:",
      statusPending: "In attesa",
      statusProcessing: "In elaborazione",
      statusPaid: "Pagato",
      statusFiled: "Depositato",
      statusDocumentsReady: "Documenti pronti",
      statusCompleted: "Completato",
      statusCancelled: "Annullato",
      clarification: "Per qualsiasi chiarimento su questo aggiornamento, rispondi direttamente a questa e-mail.",
      trackButton: "Visualizza dettagli completi"
    },
    orderCompleted: {
      llcReady: "La tua LLC è pronta!",
      congratulations: "Congratulazioni! Il tuo ordine è stato completato con successo. Tutto è pronto per iniziare a operare con la tua azienda negli Stati Uniti.",
      docsReady: "La tua documentazione è pronta",
      accessDocuments: "Ora puoi accedere e scaricare tutti i documenti della tua azienda dal tuo Centro Documentazione.",
      whatYouFind: "Cosa troverai?",
      documentList: "Documenti disponibili:",
      articlesOrg: "Articles of Organization (atto costitutivo)",
      einLetter: "Lettera EIN dall'IRS",
      registeredAgent: "Informazioni sull'agente registrato",
      additionalGuides: "Guide e documenti aggiuntivi in base al tuo servizio",
      viewDocuments: "Visualizza I Miei Documenti",
      nextSteps: "Prossimi passi:",
      activateBanking: "Attivare il conto bancario (se richiesto)",
      operatingAgreement: "Generare il tuo Operating Agreement",
      trackExpenses: "Iniziare a registrare entrate e spese",
      hereForYou: "Ricorda che siamo sempre qui per aiutarti in tutto ciò di cui hai bisogno. Se hai domande sui prossimi passi, come aprire un conto bancario o configurare il tuo gateway di pagamento, non esitare a contattarci.",
      feedbackRequest: "La tua esperienza è molto importante per noi. Se hai un momento, ci farebbe piacere conoscere la tua opinione sul nostro servizio."
    },
    noteReceived: {
      teamNote: "Hai un nuovo messaggio dal nostro team",
      relatedToOrder: "relativo al tuo ordine",
      respondNote: "Puoi rispondere direttamente a questa e-mail o accedere alla tua Area Cliente per visualizzare lo storico completo.",
      viewClientArea: "Visualizza la Mia Area Cliente"
    },
    adminNote: {
      messageAbout: "Hai un messaggio importante riguardo alla tua richiesta:",
      viewTicket: "Visualizza ticket",
      viewClientArea: "Visualizza la Mia Area Cliente"
    },
    paymentRequest: {
      paymentRequired: "È stata generata una richiesta di pagamento per procedere con la tua pratica",
      messageLabel: "Messaggio:",
      amount: "per un importo di",
      payNow: "Effettua il pagamento",
      buttonFallback: "Se il pulsante non funziona, copia e incolla questo link:",
      securePayment: "Il pagamento viene elaborato in modo sicuro tramite Stripe."
    },
    documentRequest: {
      needDocument: "Il nostro team richiede che tu carichi il seguente documento:",
      messageLabel: "Messaggio:",
      documentType: "Documento richiesto:",
      referenceTicket: "Ticket di riferimento:",
      important: "Importante:",
      uploadInstruction: "Per favore, carica il documento richiesto il prima possibile per evitare ritardi nel processo.",
      uploadButton: "Carica documento"
    },
    documentUploaded: {
      documentReceived: "Abbiamo aggiunto un nuovo documento al tuo fascicolo:",
      forOrder: "Ordine:",
      accessDownload: "Puoi accedere e scaricare questo documento dalla tua Area Cliente.",
      reviewing: "Il nostro team lo esaminerà e ti notificherà se è necessaria un'azione aggiuntiva.",
      viewDocuments: "Visualizza I Miei Documenti",
      trackButton: "Visualizza stato della richiesta"
    },
    messageReply: {
      newReply: "Hai una nuova risposta nella tua conversazione:",
      repliedToQuery: "Abbiamo risposto alla tua richiesta",
      ticket: "Ticket:",
      viewConversation: "Visualizza conversazione",
      viewClientArea: "Visualizza la Mia Area Cliente"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "Hai richiesto di cambiare la tua password. Usa il seguente codice per verificare la tua identità:",
      useCode: "Usa il seguente codice per confermare la modifica:",
      yourCode: "Il tuo codice di verifica:",
      important: "Importante:",
      validFor: "Questo codice scade tra <strong>10 minuti</strong>",
      doNotShare: "Non condividerlo con nessuno",
      notRequested: "Se non hai richiesto questa modifica, ignora questo messaggio."
    },
    profileChangeOtp: {
      title: "Verifica dell'Identità",
      sensitiveChangeRequest: "È stata richiesta una modifica ai dati sensibili del tuo profilo. Per confermare la tua identità, utilizza il seguente codice di verifica:",
      yourCode: "Il tuo codice di verifica:",
      important: "Importante:",
      personalAndConfidential: "Questo codice è personale e riservato",
      validFor: "Valido per <strong>24 ore</strong>",
      doNotShare: "Non condividerlo con nessuno",
      ignoreMessage: "Se non hai richiesto questa modifica, puoi ignorare questo messaggio in tutta sicurezza."
    },
    accountLocked: {
      locked: "Per la tua sicurezza, il tuo account è stato temporaneamente bloccato dopo aver rilevato molteplici tentativi di accesso falliti.",
      attempts: "Per sbloccare il tuo account e verificare la tua identità, abbiamo bisogno che ci invii:",
      verifyIdentity: "Per sbloccare il tuo account e verificare la tua identità, abbiamo bisogno che ci invii:",
      idRequirement: "Immagine ad alta risoluzione del documento d'identità/passaporto (fronte e retro)",
      birthDateConfirm: "La tua data di nascita confermata",
      referenceTicket: "Il tuo ID ticket di riferimento è:",
      contactSupport: "Per sbloccare il tuo account, contatta il nostro team di supporto:",
      resetPassword: "Reimposta password",
      unlockButton: "Contatta il supporto"
    },
    renewalReminder: {
      reminderText: "Ti ricordiamo che il pacchetto di manutenzione della tua LLC",
      expiresIn: "Scade tra",
      dueDate: "Data di scadenza:",
      daysRemaining: "Giorni rimanenti:",
      withoutMaintenance: "Senza il pacchetto di manutenzione attivo, la tua LLC potrebbe perdere il suo buono stato legale. Questo include:",
      registeredAgentActive: "Agente registrato attivo",
      annualReports: "Presentazione dei rapporti annuali",
      taxCompliance: "Conformità fiscale (IRS 1120/5472)",
      legalAddress: "Indirizzo legale negli Stati Uniti",
      renewNow: "Rinnova ora",
      whatHappens: "Cosa succede se non rinnovo?",
      penalties: "Possibili penalità e sovrattasse",
      agentExpires: "Il tuo agente registrato scadrà",
      goodStanding: "La tua LLC potrebbe perdere il buono stato",
      viewCalendar: "Visualizza calendario fiscale"
    },
    registrationOtp: {
      almostDone: "Grazie per esserti registrato su Easy US LLC. Il tuo codice di verifica è:",
      confirmEmail: "Per completare la registrazione del tuo account, inserisci il seguente codice di verifica:",
      yourCode: "Il tuo codice di verifica:",
      important: "Importante:",
      validFor: "Questo codice scade tra",
      doNotShare: "Non condividerlo con nessuno",
      clientIdLabel: "Il tuo ID cliente è:",
      ignoreMessage: "Se non hai creato un account con noi, puoi ignorare questo messaggio."
    },
    operatingAgreementReady: {
      ready: "Il tuo Operating Agreement è pronto!",
      generated: "Abbiamo ottime notizie per te.",
      llcData: "Dati della tua LLC",
      companyLabel: "Azienda:",
      stateLabel: "Stato:",
      einLabel: "EIN:",
      whatIs: "Cos'è l'Operating Agreement?",
      explanation: "È il documento legale che stabilisce le regole di funzionamento della tua LLC, inclusa la struttura proprietaria, la distribuzione degli utili e le responsabilità dei membri.",
      fullExplanation: "È il documento legale fondamentale della tua LLC. Definisce come viene gestita la tua azienda, le responsabilità del proprietario e le regole operative. Sebbene in alcuni stati non sia obbligatorio, è altamente raccomandato perché:",
      reason1: "Rafforza la separazione tra le tue finanze personali e quelle aziendali",
      reason2: "È richiesto da banche e processori di pagamento come Stripe",
      reason3: "Fornisce una protezione legale aggiuntiva per te come proprietario",
      reason4: "Documenta ufficialmente la struttura della tua attività",
      generateButton: "Genera il mio Operating Agreement",
      autoGenerated: "Il documento sarà generato automaticamente con i dati della tua LLC e salvato nel tuo Centro Documentazione per poterlo scaricare quando ne avrai bisogno.",
      viewDocument: "Visualizza il mio documento",
      tip: "Consiglio:",
      tipText: "Conserva una copia firmata di questo documento insieme agli altri file importanti della tua azienda."
    },
    documentApproved: {
      title: "Documento Approvato",
      approved: "Approvato",
      reviewedAndApproved: "Il tuo documento è stato esaminato e approvato con successo.",
      viewDocuments: "Visualizza i miei documenti"
    },
    documentRejected: {
      title: "Documento Rifiutato - Azione Richiesta",
      rejected: "Rifiutato",
      reviewedAndRejected: "Il tuo documento è stato esaminato e rifiutato.",
      reason: "Motivo",
      pleaseReupload: "Per favore, accedi al tuo pannello cliente e carica nuovamente il documento corretto.",
      viewDocuments: "Visualizza i miei documenti"
    },
    profileChangesVerified: {
      title: "Modifiche Profilo Verificate con OTP",
      client: "Cliente",
      email: "Email",
      clientId: "ID Cliente",
      fieldsModified: "Campi modificati",
      verifiedWithOtp: "Modifica verificata con OTP"
    },
    abandonedApplication: {
      incomplete: "La tua richiesta è incompleta",
      noticeText: "Abbiamo notato che hai iniziato a compilare la tua richiesta per",
      importantNote: "Nota importante:",
      draftDeletion: "La tua bozza verrà eliminata automaticamente se non la completi. Per motivi di sicurezza e protezione dei dati, non possiamo conservare le richieste incomplete a tempo indeterminato.",
      understandDoubts: "Capiamo che fare il passo di creare una LLC possa generare alcune domande. Vogliamo che tu sappia che siamo qui per aiutarti in ogni fase del processo.",
      questionsHelp: "Se hai domande o hai bisogno di assistenza per completare la tua richiesta, rispondi semplicemente a questa e-mail e saremo felici di aiutarti.",
      whyChoose: "Perché scegliere Easy US LLC?",
      reason1: "Costituzione completa in 48-72 ore",
      reason2: "Assistenza in spagnolo durante tutto il processo",
      reason3: "Ottenimento dell'EIN incluso",
      reason4: "Aiuto con l'apertura del conto bancario",
      reason5: "Supporto continuo dopo la costituzione",
      noMoreReminders: "Se alla fine decidi di non continuare, non ti invieremo più promemoria su questa richiesta. La tua privacy è importante per noi.",
      savedDraft: "Non preoccuparti, abbiamo salvato tutti i tuoi progressi in modo che tu possa riprendere esattamente da dove ti eri fermato.",
      continueButton: "Continua la mia richiesta",
      tip: "Consiglio:",
      tipText: "Completa la tua richiesta in modo che possiamo iniziare a lavorare sulla tua LLC il prima possibile.",
      expiring: "La tua bozza scadrà tra 48 ore se non la completi.",
      llcFormation: "la costituzione della tua LLC",
      maintenancePack: "pacchetto di manutenzione",
      dontLoseProgress: "Non perdere i tuoi progressi. Riprendi la tua richiesta ora e completa il processo in pochi minuti.",
      lastHours: "ultime ore",
      autoDeleteWarning: "La tua richiesta verrà eliminata automaticamente se non la completi."
    },
    calculatorResults: {
      results: "Risultati del tuo calcolo",
      introText: "Ecco il riepilogo del confronto fiscale che hai richiesto. Abbiamo analizzato i numeri e vogliamo che tu abbia tutte le informazioni per prendere la migliore decisione per la tua attività.",
      summary: "Riepilogo della tua analisi",
      income: "Reddito annuale:",
      expenses: "Spese deducibili:",
      autonomoTax: "Tasse come lavoratore autonomo:",
      llcTax: "Tasse con LLC:",
      potentialSavings: "Il tuo risparmio potenziale:",
      savings: "Risparmio stimato:",
      withLLC: "Con una LLC negli Stati Uniti, potresti ottimizzare significativamente il tuo carico fiscale operando in modo completamente legale. Questi risparmi si mantengono anno dopo anno, il che può fare una differenza importante per la tua attività a lungo termine.",
      learnMore: "Vorresti saperne di più su come funziona? Saremo felici di rispondere a tutte le tue domande senza impegno.",
      viewServices: "Visualizza i nostri servizi",
      disclaimer: "Questo calcolo è indicativo e si basa sui dati che hai fornito. Per un'analisi personalizzata della tua situazione, non esitare a contattarci."
    },
    newsletter: {
      confirmed: "La tua iscrizione è stata confermata con successo.",
      willReceive: "Riceverai informazioni pertinenti su servizi, aggiornamenti e novità relative a Easy US LLC.",
      unsubscribe: "Puoi annullare l'iscrizione in qualsiasi momento tramite il link incluso nelle nostre e-mail."
    },
    orderEvent: {
      update: "Il tuo ordine ha un aggiornamento:",
      date: "Data:",
      viewDetails: "Visualizza dettagli"
    },
    identityVerificationRequest: {
      subject: "Verifica dell'identità richiesta | Easy US LLC",
      intro: "Dobbiamo verificare la tua identità per garantire la sicurezza del tuo account e rispettare le nostre politiche di protezione dei dati.",
      whyTitle: "Perché è necessario?",
      whyText: "In Easy US LLC prendiamo molto seriamente la sicurezza dei nostri clienti. Questa verifica è un passo essenziale per proteggere le tue informazioni personali e garantire che solo tu abbia accesso al tuo account.",
      whatNeedTitle: "Di cosa abbiamo bisogno?",
      whatNeedText: "Ti chiediamo di caricare un documento di identità ufficiale valido e in corso di validità. Sono accettati i seguenti formati:",
      acceptedDocs: "Documenti accettati:",
      doc1: "Carta d'identità nazionale (fronte e retro)",
      doc2: "Passaporto (pagina principale con foto)",
      doc3: "Permesso di soggiorno / Carta di soggiorno (fronte e retro)",
      howToUploadTitle: "Come caricare il tuo documento?",
      howStep1: "Accedi alla tua Area Cliente dal pulsante sottostante",
      howStep2: "Vedrai una sezione per caricare il tuo documento d'identità",
      howStep3: "Carica una foto chiara e leggibile del tuo documento (PDF, JPG o PNG, massimo 5 MB)",
      uploadButton: "Carica Documento d'Identità",
      duringProcess: "Durante l'elaborazione della tua verifica, le funzioni del tuo account saranno temporaneamente limitate. Non potrai effettuare nuovi ordini né modificare le informazioni esistenti, ma non preoccuparti: le tue pratiche in corso non saranno interessate.",
      adminNotes: "Nota del team:",
      teamMessage: "Il nostro team esaminerà il tuo documento entro 24-48 ore lavorative. Ti avviseremo via e-mail non appena la verifica sarà completata.",
      closing: "Grazie per la tua collaborazione e pazienza. Siamo qui per aiutarti."
    },
    identityVerificationApproved: {
      subject: "Identità verificata con successo | Easy US LLC",
      intro: "Ottime notizie! La tua identità è stata verificata con successo.",
      verified: "Il nostro team ha esaminato la tua documentazione e tutto è in ordine. Il tuo account è stato riattivato e ora puoi utilizzare tutti i nostri servizi normalmente.",
      accessRestored: "L'accesso completo al tuo account è stato ripristinato. Ora puoi effettuare ordini, modificare il tuo profilo e accedere a tutti i servizi disponibili.",
      viewDashboard: "Vai alla Mia Area Cliente",
      closing: "Grazie per la tua pazienza e collaborazione. Siamo lieti di continuare ad aiutarti."
    },
    identityVerificationRejected: {
      subject: "Verifica dell'identità: nuova documentazione richiesta | Easy US LLC",
      intro: "Abbiamo esaminato la documentazione che ci hai inviato, ma purtroppo non siamo riusciti a verificare la tua identità con il documento fornito.",
      notApproved: "Il documento inviato non soddisfa i requisiti necessari per completare la verifica.",
      reason: "Motivo:",
      whatToDo: "Cosa devi fare?",
      reuploadStep: "Accedi alla tua Area Cliente e carica un nuovo documento d'identità che soddisfi i requisiti. Assicurati che l'immagine sia chiara, leggibile e mostri tutte le informazioni necessarie.",
      uploadButton: "Carica Nuovo Documento",
      needHelp: "Se hai domande o hai bisogno di aiuto, non esitare a contattare il nostro team di supporto. Siamo qui per aiutarti.",
      closing: "Grazie per la tua comprensione e collaborazione."
    }
  },
  pt: {
    common: {
      greeting: "Olá",
      closing: "Atenciosamente,",
      doubts: "Se tiver alguma dúvida, responda diretamente a este e-mail.",
      client: "Cliente"
    },
    otp: {
      thanks: "Obrigado por continuar com o seu processo na Easy US LLC.",
      forSecurity: "Para garantir a segurança da sua conta, utilize o seguinte código de verificação:",
      yourCode: "O seu código OTP:",
      important: "Importante:",
      personalAndConfidential: "Este código é pessoal e confidencial",
      validFor: "É válido por <strong>15 minutos</strong> por razões de segurança",
      doNotShare: "Não o partilhe com ninguém",
      ignoreMessage: "Se não solicitou este código, pode ignorar esta mensagem com toda a tranquilidade.",
      ipDetected: "Tentativa de acesso detetada a partir do IP:"
    },
    welcome: {
      welcomeMessage: "Bem-vindo à Easy US LLC! Estamos muito felizes por tê-lo connosco.",
      accountCreated: "A sua conta foi criada com sucesso e pode começar a explorar tudo o que podemos fazer juntos. A partir da sua Área de Cliente terá acesso a:",
      accessFrom: "A partir da sua Área de Cliente terá acesso a:",
      realTimeTracking: "Acompanhamento em tempo real dos seus pedidos",
      documentCenter: "Centro de documentação para descarregar todos os seus ficheiros",
      professionalTools: "Ferramentas profissionais como o gerador de faturas",
      fiscalCalendar: "Calendário fiscal com as suas datas importantes",
      directSupport: "Comunicação direta com a nossa equipa de suporte",
      hereToHelp: "Estamos aqui para ajudá-lo em cada passo da sua aventura empresarial nos Estados Unidos. Se tiver alguma dúvida, não hesite em contactar-nos.",
      exploreButton: "Explorar a Minha Área de Cliente"
    },
    accountPendingVerification: {
      accountCreatedBut: "A sua conta foi criada com sucesso, mas precisa de verificar o seu e-mail para a ativar completamente.",
      actionRequired: "Ação necessária:",
      accessAndVerify: "Aceda à sua Área de Cliente e verifique o seu e-mail para ativar a sua conta e aceder a todas as funcionalidades.",
      verifyButton: "Verificar o meu e-mail",
      whileUnverified: "Enquanto o seu e-mail não estiver verificado, a sua conta permanecerá em revisão."
    },
    accountUnderReview: {
      underReview: "Queremos informá-lo de que a sua conta entrou num breve processo de verificação. Não se preocupe, é completamente rotineiro e faz parte dos nossos padrões de segurança para proteger as suas informações e garantir uma experiência segura.",
      whyReview: "Porque fazemos isto?",
      whyReviewText: "Na Easy US LLC, levamos muito a sério a segurança dos nossos clientes. Este processo permite-nos verificar que todas as informações estão corretas e que a sua conta está devidamente protegida.",
      duringProcess: "Durante este breve período, as funções da sua conta estarão temporariamente limitadas. Isto significa que não poderá fazer novos pedidos nem modificar informações existentes, mas não se preocupe: esta situação é temporária e não afetará nenhum processo já em curso.",
      whatHappens: "O que acontece agora?",
      step1: "A nossa equipa irá rever as informações da sua conta (normalmente dentro de 24-48 horas úteis)",
      step2: "Notificá-lo-emos por este mesmo e-mail assim que a verificação estiver concluída",
      step3: "Se precisarmos de documentos adicionais, informá-lo-emos de forma clara e simples",
      teamReviewing: "Entretanto, se tiver alguma dúvida ou precisar de ajuda, não hesite em responder a este e-mail. Estamos aqui para ajudá-lo em tudo o que precisar.",
      patience: "Obrigado pela sua paciência e confiança. Sabemos que o seu tempo é valioso e faremos tudo o possível para resolver isto o mais rapidamente possível.",
      closing: "Com carinho, a equipa da Easy US LLC"
    },
    accountVip: {
      updatedToVip: "A sua conta foi atualizada para o estado VIP.",
      benefits: "Benefícios VIP:",
      priorityAttention: "Atenção prioritária e processamento acelerado",
      preferentialTracking: "Acompanhamento preferencial pela nossa equipa",
      fullAccess: "Acesso completo a todos os serviços",
      viewDashboard: "Ver a Minha Área de Cliente"
    },
    accountReactivated: {
      reactivated: "A sua conta foi reativada com sucesso.",
      canAccess: "Agora pode aceder à sua Área de Cliente e utilizar todos os nossos serviços normalmente.",
      viewDashboard: "Ver a Minha Área de Cliente"
    },
    accountDeactivated: {
      deactivated: "Lamentamos informar que a sua conta foi desativada.",
      cannotAccess: "Enquanto a sua conta permanecer neste estado, não poderá aceder à sua Área de Cliente nem realizar operações através da nossa plataforma.",
      contactSupport: "Se acredita que se trata de um erro ou deseja obter mais informações, contacte a nossa equipa de suporte respondendo a este e-mail."
    },
    accountDeactivatedByUser: {
      deactivated: "Recebemos o seu pedido de eliminação de conta. A sua conta foi desativada e será eliminada em breve.",
      cannotAccess: "A partir de agora não poderá aceder à sua Área de Cliente nem realizar operações através da nossa plataforma.",
      contactSupport: "Se mudou de ideias ou acredita que se trata de um erro, contacte a nossa equipa de suporte respondendo a este e-mail o mais rapidamente possível."
    },
    confirmation: {
      greatNews: "Ótimas notícias! Recebemos o seu pedido e já estamos a trabalhar nele. A partir de agora, a nossa equipa trata de tudo.",
      details: "Detalhes do pedido",
      reference: "Referência:",
      service: "Serviço:",
      company: "Empresa:",
      state: "Estado:",
      currentStatus: "Estado atual:",
      inReview: "Em revisão",
      whatNow: "O que acontece agora?",
      validatingInfo: "A nossa equipa está a validar todas as informações que forneceu. Nas próximas horas receberá atualizações sobre o progresso do seu pedido diretamente no seu e-mail. Também pode acompanhar o estado em tempo real a partir da sua Área de Cliente.",
      nextSteps: "Próximos passos",
      step1: "Verificaremos que todas as informações estão corretas",
      step2: "Iniciaremos os procedimentos junto das autoridades competentes",
      step3: "Mantê-lo-emos informado em cada etapa do processo",
      trackButton: "Ver o estado do meu pedido",
      questionRef: "Tem alguma dúvida? Responda simplesmente a este e-mail mencionando a sua referência e teremos todo o prazer em ajudar."
    },
    autoReply: {
      receivedMessage: "A sua mensagem foi recebida com sucesso.",
      ticketNumber: "Número do ticket",
      estimatedResponse: "Tempo de resposta estimado: <strong>24-48 horas úteis</strong>",
      responding: "A nossa equipa analisará a sua consulta e responderá o mais brevemente possível. Se precisar de adicionar informações adicionais, responda diretamente a este e-mail.",
      seeMessages: "Ver mensagens"
    },
    orderUpdate: {
      statusChanged: "O estado da sua encomenda foi atualizado.",
      orderLabel: "Encomenda:",
      newStatus: "Novo estado:",
      statusPending: "Pendente",
      statusProcessing: "Em processamento",
      statusPaid: "Pago",
      statusFiled: "Registado",
      statusDocumentsReady: "Documentos prontos",
      statusCompleted: "Concluído",
      statusCancelled: "Cancelado",
      clarification: "Para qualquer esclarecimento sobre esta atualização, responda diretamente a este e-mail.",
      trackButton: "Ver detalhes completos"
    },
    orderCompleted: {
      llcReady: "A sua LLC está pronta!",
      congratulations: "Parabéns! A sua encomenda foi concluída com sucesso. Tudo está pronto para começar a operar a sua empresa nos Estados Unidos.",
      docsReady: "A sua documentação está pronta",
      accessDocuments: "Agora pode aceder e descarregar todos os documentos da sua empresa a partir do seu Centro de Documentação.",
      whatYouFind: "O que vai encontrar?",
      documentList: "Documentos disponíveis:",
      articlesOrg: "Articles of Organization (documento de constituição)",
      einLetter: "Carta EIN do IRS",
      registeredAgent: "Informações do agente registado",
      additionalGuides: "Guias e documentos adicionais de acordo com o seu serviço",
      viewDocuments: "Ver Os Meus Documentos",
      nextSteps: "Próximos passos:",
      activateBanking: "Ativar conta bancária (se solicitado)",
      operatingAgreement: "Gerar o seu Operating Agreement",
      trackExpenses: "Começar a registar receitas e despesas",
      hereForYou: "Lembre-se de que continuamos aqui para ajudá-lo em tudo o que precisar. Se tiver dúvidas sobre os próximos passos, como abrir uma conta bancária ou configurar o seu gateway de pagamento, não hesite em contactar-nos.",
      feedbackRequest: "A sua experiência é muito importante para nós. Se tiver um momento, adoraríamos conhecer a sua opinião sobre o nosso serviço."
    },
    noteReceived: {
      teamNote: "Tem uma nova mensagem da nossa equipa",
      relatedToOrder: "relacionada com a sua encomenda",
      respondNote: "Pode responder diretamente a este e-mail ou aceder à sua Área de Cliente para ver o histórico completo.",
      viewClientArea: "Ver a Minha Área de Cliente"
    },
    adminNote: {
      messageAbout: "Tem uma mensagem importante sobre o seu pedido:",
      viewTicket: "Ver ticket",
      viewClientArea: "Ver a Minha Área de Cliente"
    },
    paymentRequest: {
      paymentRequired: "Foi gerado um pedido de pagamento para prosseguir com o seu processo",
      messageLabel: "Mensagem:",
      amount: "no valor de",
      payNow: "Efetuar pagamento",
      buttonFallback: "Se o botão não funcionar, copie e cole este link:",
      securePayment: "O pagamento é processado de forma segura através do Stripe."
    },
    documentRequest: {
      needDocument: "A nossa equipa necessita que carregue o seguinte documento:",
      messageLabel: "Mensagem:",
      documentType: "Documento solicitado:",
      referenceTicket: "Ticket de referência:",
      important: "Importante:",
      uploadInstruction: "Por favor, carregue o documento solicitado o mais brevemente possível para evitar atrasos no processo.",
      uploadButton: "Carregar documento"
    },
    documentUploaded: {
      documentReceived: "Adicionámos um novo documento ao seu processo:",
      forOrder: "Encomenda:",
      accessDownload: "Pode aceder e descarregar este documento a partir da sua Área de Cliente.",
      reviewing: "A nossa equipa irá analisá-lo e notificá-lo-á se for necessária alguma ação adicional.",
      viewDocuments: "Ver Os Meus Documentos",
      trackButton: "Ver estado do pedido"
    },
    messageReply: {
      newReply: "Tem uma nova resposta na sua conversa:",
      repliedToQuery: "Respondemos à sua consulta",
      ticket: "Ticket:",
      viewConversation: "Ver conversa",
      viewClientArea: "Ver a Minha Área de Cliente"
    },
    passwordChangeOtp: {
      passwordChangeRequest: "Solicitou a alteração da sua palavra-passe. Utilize o seguinte código para verificar a sua identidade:",
      useCode: "Utilize o seguinte código para confirmar a alteração:",
      yourCode: "O seu código de verificação:",
      important: "Importante:",
      validFor: "Este código expira em <strong>10 minutos</strong>",
      doNotShare: "Não o partilhe com ninguém",
      notRequested: "Se não solicitou esta alteração, ignore esta mensagem."
    },
    profileChangeOtp: {
      title: "Verificação de Identidade",
      sensitiveChangeRequest: "Foi solicitada uma alteração nos dados sensíveis do seu perfil. Para confirmar a sua identidade, utilize o seguinte código de verificação:",
      yourCode: "O seu código de verificação:",
      important: "Importante:",
      personalAndConfidential: "Este código é pessoal e confidencial",
      validFor: "Válido por <strong>24 horas</strong>",
      doNotShare: "Não o partilhe com ninguém",
      ignoreMessage: "Se não solicitou esta alteração, pode ignorar esta mensagem com total tranquilidade."
    },
    accountLocked: {
      locked: "Para sua segurança, a sua conta foi temporariamente bloqueada após a deteção de múltiplas tentativas de acesso falhadas.",
      attempts: "Para desbloquear a sua conta e verificar a sua identidade, precisamos que nos envie:",
      verifyIdentity: "Para desbloquear a sua conta e verificar a sua identidade, precisamos que nos envie:",
      idRequirement: "Imagem de alta resolução do documento de identidade/passaporte (frente e verso)",
      birthDateConfirm: "A sua data de nascimento confirmada",
      referenceTicket: "O seu ID de ticket de referência é:",
      contactSupport: "Para desbloquear a sua conta, contacte a nossa equipa de suporte:",
      resetPassword: "Redefinir palavra-passe",
      unlockButton: "Contactar suporte"
    },
    renewalReminder: {
      reminderText: "Lembramos que o pacote de manutenção da sua LLC",
      expiresIn: "Expira em",
      dueDate: "Data de vencimento:",
      daysRemaining: "Dias restantes:",
      withoutMaintenance: "Sem o pacote de manutenção ativo, a sua LLC pode perder o seu bom estado legal. Isto inclui:",
      registeredAgentActive: "Agente registado ativo",
      annualReports: "Apresentação de relatórios anuais",
      taxCompliance: "Conformidade fiscal (IRS 1120/5472)",
      legalAddress: "Morada legal nos Estados Unidos",
      renewNow: "Renovar agora",
      whatHappens: "O que acontece se não renovar?",
      penalties: "Possíveis penalizações e sobretaxas",
      agentExpires: "O seu agente registado expirará",
      goodStanding: "A sua LLC pode perder o bom estado",
      viewCalendar: "Ver calendário fiscal"
    },
    registrationOtp: {
      almostDone: "Obrigado por se registar na Easy US LLC. O seu código de verificação é:",
      confirmEmail: "Para completar o registo da sua conta, introduza o seguinte código de verificação:",
      yourCode: "O seu código de verificação:",
      important: "Importante:",
      validFor: "Este código expira em",
      doNotShare: "Não o partilhe com ninguém",
      clientIdLabel: "O seu ID de cliente é:",
      ignoreMessage: "Se não criou uma conta connosco, pode ignorar esta mensagem."
    },
    operatingAgreementReady: {
      ready: "O seu Operating Agreement está pronto!",
      generated: "Temos ótimas notícias para si.",
      llcData: "Dados da sua LLC",
      companyLabel: "Empresa:",
      stateLabel: "Estado:",
      einLabel: "EIN:",
      whatIs: "O que é o Operating Agreement?",
      explanation: "É o documento legal que estabelece as regras de funcionamento da sua LLC, incluindo a estrutura de propriedade, distribuição de lucros e responsabilidades dos membros.",
      fullExplanation: "É o documento legal fundamental da sua LLC. Define como a sua empresa é gerida, as responsabilidades do proprietário e as regras de operação. Embora em alguns estados não seja obrigatório, é altamente recomendável porque:",
      reason1: "Reforça a separação entre as suas finanças pessoais e as da empresa",
      reason2: "É exigido por bancos e processadores de pagamento como o Stripe",
      reason3: "Proporciona proteção legal adicional para si como proprietário",
      reason4: "Documenta oficialmente a estrutura do seu negócio",
      generateButton: "Gerar o meu Operating Agreement",
      autoGenerated: "O documento será gerado automaticamente com os dados da sua LLC e guardado no seu Centro de Documentação para que possa descarregá-lo quando precisar.",
      viewDocument: "Ver o meu documento",
      tip: "Dica:",
      tipText: "Guarde uma cópia assinada deste documento junto com os outros ficheiros importantes da sua empresa."
    },
    documentApproved: {
      title: "Documento Aprovado",
      approved: "Aprovado",
      reviewedAndApproved: "O seu documento foi revisto e aprovado com sucesso.",
      viewDocuments: "Ver os meus documentos"
    },
    documentRejected: {
      title: "Documento Rejeitado - Ação Necessária",
      rejected: "Rejeitado",
      reviewedAndRejected: "O seu documento foi revisto e rejeitado.",
      reason: "Motivo",
      pleaseReupload: "Por favor, aceda ao seu painel de cliente e carregue novamente o documento corrigido.",
      viewDocuments: "Ver os meus documentos"
    },
    profileChangesVerified: {
      title: "Alterações de Perfil Verificadas com OTP",
      client: "Cliente",
      email: "Email",
      clientId: "ID de Cliente",
      fieldsModified: "Campos modificados",
      verifiedWithOtp: "Alteração verificada com OTP"
    },
    abandonedApplication: {
      incomplete: "O seu pedido está incompleto",
      noticeText: "Reparámos que começou a preencher o seu pedido de",
      importantNote: "Nota importante:",
      draftDeletion: "O seu rascunho será automaticamente eliminado se não o completar. Por razões de segurança e proteção de dados, não podemos manter pedidos incompletos indefinidamente.",
      understandDoubts: "Compreendemos que dar o passo de criar uma LLC pode gerar algumas dúvidas. Queremos que saiba que estamos aqui para ajudá-lo em cada passo do processo.",
      questionsHelp: "Se tiver alguma dúvida ou precisar de assistência para completar o seu pedido, responda simplesmente a este e-mail e teremos todo o prazer em ajudar.",
      whyChoose: "Porquê escolher a Easy US LLC?",
      reason1: "Constituição completa em 48-72 horas",
      reason2: "Assistência em espanhol durante todo o processo",
      reason3: "Obtenção do EIN incluída",
      reason4: "Ajuda com a abertura de conta bancária",
      reason5: "Suporte contínuo após a constituição",
      noMoreReminders: "Se decidir não continuar, não lhe enviaremos mais lembretes sobre este pedido. A sua privacidade é importante para nós.",
      savedDraft: "Não se preocupe, guardámos todo o seu progresso para que possa continuar exatamente de onde parou.",
      continueButton: "Continuar o meu pedido",
      tip: "Dica:",
      tipText: "Complete o seu pedido para que possamos começar a trabalhar na sua LLC o mais rapidamente possível.",
      expiring: "O seu rascunho expirará em 48 horas se não o completar.",
      llcFormation: "a constituição da sua LLC",
      maintenancePack: "pacote de manutenção",
      dontLoseProgress: "Não perca o seu progresso. Retome o seu pedido agora e complete o processo em poucos minutos.",
      lastHours: "últimas horas",
      autoDeleteWarning: "O seu pedido será automaticamente eliminado se não o completar."
    },
    calculatorResults: {
      results: "Resultados do seu cálculo",
      introText: "Aqui está o resumo da sua comparação fiscal solicitada. Analisámos os números e queremos que tenha toda a informação para tomar a melhor decisão para o seu negócio.",
      summary: "Resumo da sua análise",
      income: "Rendimento anual:",
      expenses: "Despesas dedutíveis:",
      autonomoTax: "Impostos como trabalhador independente:",
      llcTax: "Impostos com LLC:",
      potentialSavings: "A sua poupança potencial:",
      savings: "Poupança estimada:",
      withLLC: "Com uma LLC nos Estados Unidos, poderia otimizar significativamente a sua carga fiscal enquanto opera de forma completamente legal. Esta poupança mantém-se ano após ano, o que pode representar uma diferença importante para o seu negócio a longo prazo.",
      learnMore: "Gostaria de saber mais sobre como funciona? Teremos todo o prazer em responder a todas as suas dúvidas sem qualquer compromisso.",
      viewServices: "Ver os nossos serviços",
      disclaimer: "Este cálculo é indicativo e baseia-se nos dados que forneceu. Para uma análise personalizada da sua situação, não hesite em contactar-nos."
    },
    newsletter: {
      confirmed: "A sua subscrição foi confirmada com sucesso.",
      willReceive: "Receberá informações relevantes sobre serviços, atualizações e novidades relacionadas com a Easy US LLC.",
      unsubscribe: "Pode cancelar a subscrição a qualquer momento através do link incluído nos nossos e-mails."
    },
    orderEvent: {
      update: "A sua encomenda tem uma atualização:",
      date: "Data:",
      viewDetails: "Ver detalhes"
    },
    identityVerificationRequest: {
      subject: "Verificação de identidade necessária | Easy US LLC",
      intro: "Precisamos verificar a sua identidade para garantir a segurança da sua conta e cumprir as nossas políticas de proteção de dados.",
      whyTitle: "Por que é necessário?",
      whyText: "Na Easy US LLC, levamos a segurança dos nossos clientes muito a sério. Esta verificação é um passo essencial para proteger as suas informações pessoais e garantir que apenas você tenha acesso à sua conta.",
      whatNeedTitle: "Do que precisamos?",
      whatNeedText: "Pedimos que carregue um documento de identidade oficial válido e vigente. Os seguintes formatos são aceites:",
      acceptedDocs: "Documentos aceites:",
      doc1: "Cartão de cidadão / Bilhete de identidade (frente e verso)",
      doc2: "Passaporte (página principal com foto)",
      doc3: "Título de residência / Autorização de residência (frente e verso)",
      howToUploadTitle: "Como carregar o seu documento?",
      howStep1: "Aceda à sua Área de Cliente a partir do botão abaixo",
      howStep2: "Verá uma secção para carregar o seu documento de identidade",
      howStep3: "Carregue uma foto clara e legível do seu documento (PDF, JPG ou PNG, máximo 5 MB)",
      uploadButton: "Carregar Documento de Identidade",
      duringProcess: "Enquanto a sua verificação está a ser processada, as funções da sua conta estarão temporariamente limitadas. Não poderá fazer novas encomendas nem modificar informações existentes, mas não se preocupe: os seus processos em curso não serão afetados.",
      adminNotes: "Nota da equipa:",
      teamMessage: "A nossa equipa irá analisar o seu documento num prazo de 24 a 48 horas úteis. Notificá-lo-emos por e-mail assim que a verificação estiver concluída.",
      closing: "Obrigado pela sua colaboração e paciência. Estamos aqui para ajudá-lo."
    },
    identityVerificationApproved: {
      subject: "Identidade verificada com sucesso | Easy US LLC",
      intro: "Excelentes notícias! A sua identidade foi verificada com sucesso.",
      verified: "A nossa equipa analisou a sua documentação e tudo está em ordem. A sua conta foi reativada e já pode utilizar todos os nossos serviços normalmente.",
      accessRestored: "O acesso completo à sua conta foi restaurado. Já pode fazer encomendas, modificar o seu perfil e aceder a todos os serviços disponíveis.",
      viewDashboard: "Ir para a Minha Área de Cliente",
      closing: "Obrigado pela sua paciência e colaboração. Estamos encantados por continuar a ajudá-lo."
    },
    identityVerificationRejected: {
      subject: "Verificação de identidade: nova documentação necessária | Easy US LLC",
      intro: "Analisámos a documentação que nos enviou, mas infelizmente não conseguimos verificar a sua identidade com o documento fornecido.",
      notApproved: "O documento enviado não cumpre os requisitos necessários para completar a verificação.",
      reason: "Motivo:",
      whatToDo: "O que deve fazer?",
      reuploadStep: "Aceda à sua Área de Cliente e carregue um novo documento de identidade que cumpra os requisitos. Certifique-se de que a imagem é clara, legível e mostra toda a informação necessária.",
      uploadButton: "Carregar Novo Documento",
      needHelp: "Se tiver dúvidas ou precisar de ajuda, não hesite em contactar a nossa equipa de suporte. Estamos aqui para ajudá-lo.",
      closing: "Obrigado pela sua compreensão e colaboração."
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
    ca: "Benvingut a Easy US LLC!",
    fr: "Bienvenue chez Easy US LLC !",
    de: "Willkommen bei Easy US LLC!",
    it: "Benvenuto in Easy US LLC!",
    pt: "Bem-vindo à Easy US LLC!"
  };
  return titles[lang] || titles.es;
}

export function getWelcomeNotificationMessage(lang: EmailLanguage = 'es'): string {
  const messages: Record<EmailLanguage, string> = {
    es: "Gracias por confiar en nosotros para crear tu empresa en EE.UU. Explora tu panel para comenzar.",
    en: "Thank you for trusting us to create your US business. Explore your dashboard to get started.",
    ca: "Gràcies per confiar en nosaltres per crear la teva empresa als EUA. Explora el teu panell per començar.",
    fr: "Merci de nous faire confiance pour créer votre entreprise aux États-Unis. Explorez votre tableau de bord pour commencer.",
    de: "Vielen Dank, dass Sie uns mit der Gründung Ihres US-Unternehmens vertrauen. Erkunden Sie Ihr Dashboard, um loszulegen.",
    it: "Grazie per aver scelto noi per creare la tua azienda negli USA. Esplora la tua dashboard per iniziare.",
    pt: "Obrigado por confiar em nós para criar a sua empresa nos EUA. Explore o seu painel para começar."
  };
  return messages[lang] || messages.es;
}

export function getWelcomeEmailSubject(lang: EmailLanguage = 'es'): string {
  const subjects: Record<EmailLanguage, string> = {
    es: "¡Bienvenido a Easy US LLC!",
    en: "Welcome to Easy US LLC!",
    ca: "Benvingut a Easy US LLC!",
    fr: "Bienvenue chez Easy US LLC !",
    de: "Willkommen bei Easy US LLC!",
    it: "Benvenuto in Easy US LLC!",
    pt: "Bem-vindo à Easy US LLC!"
  };
  return subjects[lang] || subjects.es;
}

export function getRegistrationOtpSubject(lang: EmailLanguage = 'es'): string {
  const subjects: Record<EmailLanguage, string> = {
    es: "Bienvenido a Easy US LLC - Verifica tu cuenta",
    en: "Welcome to Easy US LLC - Verify your account",
    ca: "Benvingut a Easy US LLC - Verifica el teu compte",
    fr: "Bienvenue chez Easy US LLC - Vérifiez votre compte",
    de: "Willkommen bei Easy US LLC - Verifizieren Sie Ihr Konto",
    it: "Benvenuto in Easy US LLC - Verifica il tuo account",
    pt: "Bem-vindo à Easy US LLC - Verifique a sua conta"
  };
  return subjects[lang] || subjects.es;
}

export function getOtpSubject(lang: EmailLanguage = 'es'): string {
  const subjects: Record<EmailLanguage, string> = {
    es: "Tu código de verificación | Easy US LLC",
    en: "Your verification code | Easy US LLC",
    ca: "El teu codi de verificació | Easy US LLC",
    fr: "Votre code de vérification | Easy US LLC",
    de: "Ihr Verifizierungscode | Easy US LLC",
    it: "Il tuo codice di verifica | Easy US LLC",
    pt: "O seu código de verificação | Easy US LLC"
  };
  return subjects[lang] || subjects.es;
}

export function getSecurityOtpSubject(lang: EmailLanguage = 'es'): string {
  const subjects: Record<EmailLanguage, string> = {
    es: "Verificación de seguridad - Easy US LLC",
    en: "Security verification - Easy US LLC",
    ca: "Verificació de seguretat - Easy US LLC",
    fr: "Vérification de sécurité - Easy US LLC",
    de: "Sicherheitsverifizierung - Easy US LLC",
    it: "Verifica di sicurezza - Easy US LLC",
    pt: "Verificação de segurança - Easy US LLC"
  };
  return subjects[lang] || subjects.es;
}

export function getPasswordResetSubject(lang: EmailLanguage = 'es'): string {
  const subjects: Record<EmailLanguage, string> = {
    es: "Código de verificación - Easy US LLC",
    en: "Verification code - Easy US LLC",
    ca: "Codi de verificació - Easy US LLC",
    fr: "Code de vérification - Easy US LLC",
    de: "Verifizierungscode - Easy US LLC",
    it: "Codice di verifica - Easy US LLC",
    pt: "Código de verificação - Easy US LLC"
  };
  return subjects[lang] || subjects.es;
}

export function getVerifyEmailSubject(lang: EmailLanguage = 'es'): string {
  const subjects: Record<EmailLanguage, string> = {
    es: "Verifica tu email - Easy US LLC",
    en: "Verify your email - Easy US LLC",
    ca: "Verifica el teu email - Easy US LLC",
    fr: "Vérifiez votre email - Easy US LLC",
    de: "Verifizieren Sie Ihre E-Mail - Easy US LLC",
    it: "Verifica la tua email - Easy US LLC",
    pt: "Verifique o seu email - Easy US LLC"
  };
  return subjects[lang] || subjects.es;
}

export function getAdminNewRegistrationSubject(lang: EmailLanguage = 'es'): string {
  return `[NUEVA CUENTA]`;
}
