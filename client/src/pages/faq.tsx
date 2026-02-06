import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/use-page-title";

export default function FAQ() {
  const { t } = useTranslation();
  usePageTitle();
  const [openItems, setOpenItems] = useState<Record<string, number | null>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = useMemo(() => [
    {
      key: "aboutUs",
      title: t("faq.categories.aboutUs.title"),
      questions: [
        { q: t("faq.categories.aboutUs.q1"), a: t("faq.categories.aboutUs.a1") },
        { q: t("faq.categories.aboutUs.q2"), a: t("faq.categories.aboutUs.a2") },
        { q: t("faq.categories.aboutUs.q3"), a: t("faq.categories.aboutUs.a3") },
        { q: t("faq.categories.aboutUs.q4"), a: t("faq.categories.aboutUs.a4") }
      ]
    },
    {
      key: "keyConcepts",
      title: t("faq.categories.keyConcepts.title"),
      questions: [
        { q: t("faq.categories.keyConcepts.q1"), a: t("faq.categories.keyConcepts.a1") },
        { q: t("faq.categories.keyConcepts.q2"), a: t("faq.categories.keyConcepts.a2") },
        { q: t("faq.categories.keyConcepts.q3"), a: t("faq.categories.keyConcepts.a3") },
        { q: t("faq.categories.keyConcepts.q4"), a: t("faq.categories.keyConcepts.a4") },
        { q: t("faq.categories.keyConcepts.q5"), a: t("faq.categories.keyConcepts.a5") }
      ]
    },
    {
      key: "taxes",
      title: t("faq.categories.taxes.title"),
      questions: [
        { q: t("faq.categories.taxes.q1"), a: t("faq.categories.taxes.a1") },
        { q: t("faq.categories.taxes.q2"), a: t("faq.categories.taxes.a2") },
        { q: t("faq.categories.taxes.q3"), a: t("faq.categories.taxes.a3") },
        { q: t("faq.categories.taxes.q4"), a: t("faq.categories.taxes.a4") },
        { q: t("faq.categories.taxes.q5"), a: t("faq.categories.taxes.a5") },
        { q: t("faq.categories.taxes.q6"), a: t("faq.categories.taxes.a6") },
        { q: t("faq.categories.taxes.q7"), a: t("faq.categories.taxes.a7") }
      ]
    },
    {
      key: "taxExtensions",
      title: t("faq.categories.taxExtensions.title"),
      questions: [
        { q: t("faq.categories.taxExtensions.q1"), a: t("faq.categories.taxExtensions.a1") },
        { q: t("faq.categories.taxExtensions.q2"), a: t("faq.categories.taxExtensions.a2") },
        { q: t("faq.categories.taxExtensions.q3"), a: t("faq.categories.taxExtensions.a3") }
      ]
    },
    {
      key: "operations",
      title: t("faq.categories.operations.title"),
      questions: [
        { q: t("faq.categories.operations.q1"), a: t("faq.categories.operations.a1") },
        { q: t("faq.categories.operations.q2"), a: t("faq.categories.operations.a2") },
        { q: t("faq.categories.operations.q3"), a: t("faq.categories.operations.a3") },
        { q: t("faq.categories.operations.q4"), a: t("faq.categories.operations.a4") },
        { q: t("faq.categories.operations.q5"), a: t("faq.categories.operations.a5") },
        { q: t("faq.categories.operations.q6"), a: t("faq.categories.operations.a6") },
        { q: t("faq.categories.operations.q7"), a: t("faq.categories.operations.a7") },
        { q: t("faq.categories.operations.q8"), a: t("faq.categories.operations.a8") },
        { q: t("faq.categories.operations.q9"), a: t("faq.categories.operations.a9") }
      ]
    }
  ], [t]);

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
    <div className="min-h-screen bg-background font-sans text-left w-full relative animate-page-in">
      <Navbar />

      <section className="pt-16 sm:pt-24 lg:pt-28 pb-4 sm:py-20 bg-background">
        <div className="container max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-8 sm:mb-12 flex flex-col items-center justify-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-center leading-[1.1]">
              <span className="text-foreground">{t("faq.title")}</span>{" "}
              <span className="text-accent">{t("faq.titleHighlight")}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 text-center max-w-2xl">{t("faq.subtitle")}</p>
            <div className="w-24 h-1 bg-accent mt-6" />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8 sm:mb-12 relative">
              <input
                type="text"
                placeholder={t("faq.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 sm:h-14 pl-10 sm:pl-14 pr-6 rounded-full border-2 border-accent/30 focus:border-accent focus:outline-none text-primary font-medium shadow-sm transition-all text-xs sm:text-base appearance-none bg-background"
                data-testid="input-faq-search"
              />
              <div className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 text-[#6EDC8A]">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="space-y-8 sm:space-y-12">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div key={category.key} className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter flex items-center gap-3 sm:gap-4">
                      <span className="w-1.5 sm:w-2 h-8 sm:h-10 bg-accent rounded-full shrink-0" />
                      {category.title}
                    </h2>
                    <div className="grid gap-2 sm:gap-3">
                      {category.questions.map((item, i) => (
                        <div 
                          key={i} 
                          className={`group transition-all duration-200 border-2 rounded-2xl sm:rounded-3xl overflow-hidden ${
                            openItems[category.key] === i 
                              ? "border-accent bg-accent/[0.03]" 
                              : "border-primary/5 hover:border-accent/30 bg-white dark:bg-card"
                          }`}
                          data-testid={`faq-item-${category.key}-${i}`}
                        >
                          <button
                            onClick={() => toggleItem(category.key, i)}
                            className="w-full px-4 sm:px-6 py-4 sm:py-6 text-left flex items-center justify-between gap-3 sm:gap-4 touch-manipulation"
                            data-testid={`button-faq-toggle-${category.key}-${i}`}
                          >
                            <span className="font-black text-foreground text-sm sm:text-lg leading-tight tracking-tighter">
                              {item.q}
                            </span>
                            <span className={`text-xl sm:text-2xl transition-transform duration-200 shrink-0 ${
                              openItems[category.key] === i ? "rotate-45 text-[#6EDC8A]" : "text-primary/30"
                            }`}>
                              +
                            </span>
                          </button>
                          {(openItems[category.key] === i || searchQuery !== "") && (
                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-muted-foreground text-sm sm:text-base leading-relaxed border-t border-accent/20 pt-3 sm:pt-4 animate-in fade-in slide-in-from-top-2 font-medium bg-accent/5">
                              {item.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <p className="text-primary font-black text-lg sm:text-xl mb-2" data-testid="text-faq-no-results">{t("faq.noResults")}</p>
                  <p className="text-muted-foreground text-sm sm:text-base">{t("faq.noResultsHint")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Help Center Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-accent/10 border-2 border-accent/30 rounded-3xl p-8 sm:p-10 text-center">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-3 text-center">
                {t("faq.helpCenter.title")}
              </h3>
              <p className="text-muted-foreground font-medium mb-6 text-center">
                {t("faq.helpCenter.description")}
              </p>
              <Button
                asChild
                className="bg-[#25D366] hover:bg-[#25D366]/90 text-white font-black rounded-full px-8 h-12 shadow-lg transition-colors"
                data-testid="button-whatsapp-help"
              >
                <a 
                  href="https://wa.me/34614916910?text=Hola!%20He%20estado%20revisando%20las%20FAQ%20pero%20tengo%20una%20duda%20que%20no%20encuentro.%20%C2%BFPodemos%20hablar%3F" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <SiWhatsapp className="w-5 h-5" />
                  {t("faq.helpCenter.button")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
