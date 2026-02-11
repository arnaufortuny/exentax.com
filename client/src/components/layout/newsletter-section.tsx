import { useState, useEffect } from "react";
import { Send, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { getCsrfToken } from "@/lib/queryClient";
import { validateEmail } from "@/lib/validation";

import { useAuth } from "@/hooks/use-auth";

export function NewsletterSection() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  // Hide newsletter for logged-in users
  if (isAuthenticated) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setFormMessage({ type: 'error', text: t("validation.invalidEmail") });
      return;
    }

    setFormMessage(null);
    setLoading(true);
    try {
      let token = await getCsrfToken();
      let response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (response.status === 403) {
        const body = await response.json().catch(() => ({}));
        if (body.code === 'CSRF_INVALID') {
          token = await getCsrfToken(true);
          response = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
            body: JSON.stringify({ email }),
            credentials: "include",
          });
        }
      }

      const data = await response.json();

      if (response.ok) {
        setFormMessage({ type: 'success', text: `${t("newsletter.success")}. ${t("newsletter.checkInbox")}` });
        setEmail("");
      } else {
        setFormMessage({ type: 'error', text: t("newsletter.subscriptionFailed") });
      }
    } catch (err) {
      setFormMessage({ type: 'error', text: `${t("newsletter.error")}. ${t("newsletter.connectionError")}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10 md:py-14 bg-background relative overflow-hidden font-sans w-full">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:24px_24px]" />
      
      <div className="w-full px-5 sm:px-8 relative z-10 flex flex-col items-center justify-center">
        <div className="text-center space-y-3 md:space-y-5 w-full flex flex-col items-center">
          <div className="space-y-1.5 md:space-y-2 w-full text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground leading-[1.1] text-center">
              {t("newsletter.joinOur")} <span className="text-primary-foreground bg-accent px-2 inline-block">{t("newsletter.newsletter")}</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed text-center px-2">
              {t("newsletter.taxTips")}
              <span className="block mt-1">{t("newsletter.businessNews")}</span>
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-lg w-full mx-auto relative group flex flex-col items-center text-center">
            {formMessage && (
              <div className={`mb-4 p-3 rounded-xl text-center text-sm font-medium w-full ${
                formMessage.type === 'error' 
                  ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
                  : formMessage.type === 'success'
                  ? 'bg-accent/10 border border-accent/20 text-accent'
                  : 'bg-accent/5 dark:bg-accent/10 border border-accent/20 dark:border-accent/30 text-accent dark:text-accent'
              }`} data-testid="form-message">
                {formMessage.text}
              </div>
            )}
            <div className="relative w-full">
              <Input 
                type="email" 
                inputMode="email"
                placeholder={t("newsletter.placeholder")} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 md:h-14 pl-4 pr-12 rounded-full border-2 border-border bg-background text-foreground placeholder:text-muted-foreground text-xs md:text-base font-black focus:border-accent focus:bg-background focus:ring-0 transition-all shadow-inner w-full text-left"
                required
              />
              <Button 
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1.5 h-7 w-7 md:h-11 md:w-11 rounded-full bg-accent text-primary-foreground p-0 hover:scale-110 active:scale-90 transition-all shadow-lg flex items-center justify-center border-0"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-5 md:h-5 transform group-hover:translate-x-0.5 transition-transform">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
