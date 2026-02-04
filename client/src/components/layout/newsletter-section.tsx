import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/hooks/use-auth";

export function NewsletterSection() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Hide newsletter for logged-in users
  if (isAuthenticated) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({ 
          title: t("newsletter.success"), 
          description: t("newsletter.checkInbox"),
          variant: "success"
        });
        setEmail("");
      } else {
        toast({ title: t("newsletter.error"), description: data.message || t("newsletter.subscriptionFailed"), variant: "destructive" });
      }
    } catch (err) {
      toast({ title: t("newsletter.error"), description: t("newsletter.connectionError"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-background relative font-sans w-full">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:24px_24px]" />
      
      <div className="w-full px-5 sm:px-8 relative z-10 flex flex-col items-center justify-center">
        <div className="text-center space-y-4 md:space-y-8 w-full flex flex-col items-center">
          <div className="space-y-2 md:space-y-4 w-full text-center">
            <h2 className="text-xl md:text-4xl font-black tracking-tighter text-foreground leading-none text-center">
              {t("newsletter.joinOur")} <span className="text-primary-foreground bg-accent px-2 inline-block">{t("newsletter.newsletter")}</span>
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm font-medium max-w-lg mx-auto leading-relaxed text-center px-2">
              {t("newsletter.taxTips")}
              <span className="block mt-1">{t("newsletter.businessNews")}</span>
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="max-w-lg w-full mx-auto relative group flex flex-col items-center text-center">
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
