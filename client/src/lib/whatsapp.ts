import i18n from "@/lib/i18n";

const WHATSAPP_NUMBER = "34614916910";

type WhatsAppContext =
  | "dashboardSupport"
  | "dashboardLlc"
  | "footer"
  | "navbar"
  | "linktree"
  | "services"
  | "faq"
  | "contactForm"
  | "contactDirect"
  | "llcFormation";

export function getWhatsAppUrl(context: WhatsAppContext): string {
  const message = i18n.t(`whatsapp.${context}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(context: WhatsAppContext): void {
  window.open(getWhatsAppUrl(context), "_blank");
}
