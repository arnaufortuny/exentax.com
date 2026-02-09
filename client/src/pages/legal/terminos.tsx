import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection, LegalSubSection, LegalList, LegalHighlightBox } from "@/components/legal/legal-page-layout";
import { getFormationPriceFormatted } from "@shared/config/pricing";

export default function Terminos() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      title={t("legalTerms.title")}
      titleHighlight={t("legalTerms.titleHighlight")}
      lastUpdated={t("legal.lastUpdated")}
      pdfUrl="/legal/terminos-condiciones.pdf"
    >
      <LegalSection number="01" title={t("legalTerms.s01Title")}>
        <p>{t("legalTerms.s01p1")}</p>
        <LegalHighlightBox>
          <p className="text-xs text-muted-foreground mb-1">{t("legalTerms.s01LegalEntity")}</p>
          <p className="font-bold text-base text-foreground">Fortuny Consulting LLC</p>
          <p className="text-sm text-muted-foreground">Domestic Limited Liability Company · Nº 0008072199</p>
          <p className="text-sm text-muted-foreground">{t("legalTerms.s01Address")}: 1209 Mountain Road Pl NE, STE R, Albuquerque, NM 87110, USA</p>
        </LegalHighlightBox>
        <p>{t("legalTerms.s01p2")}</p>
        <p>{t("legalTerms.s01ContactEmail")}: hola@easyusllc.com | {t("legalTerms.s01ContactPhone")}: +34 614 916 910</p>
      </LegalSection>

      <LegalSection number="02" title={t("legalTerms.s02Title")}>
        <p>{t("legalTerms.s02p1")}</p>
        <p>{t("legalTerms.s02p2")}</p>
      </LegalSection>

      <LegalSection number="03" title={t("legalTerms.s03Title")}>
        <p>{t("legalTerms.s03p1")}</p>
        <LegalList items={[
          t("legalTerms.s03item1"),
          t("legalTerms.s03item2"),
          t("legalTerms.s03item3"),
          t("legalTerms.s03item4"),
          t("legalTerms.s03item5"),
          t("legalTerms.s03item6"),
          t("legalTerms.s03item7"),
          t("legalTerms.s03item8"),
          t("legalTerms.s03item9"),
        ]} />
        <p className="text-sm opacity-70 italic mt-6">{t("legalTerms.s03note")}</p>
      </LegalSection>

      <LegalSection number="04" title={t("legalTerms.s04Title")}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-card p-8 rounded-2xl border-2 border-accent/20 text-center shadow-sm">
            <p className="text-3xl font-black text-brand-dark dark:text-white">{getFormationPriceFormatted("newMexico")}</p>
            <p className="text-xs font-black tracking-widest text-brand-dark/60 dark:text-zinc-400 mt-2 uppercase">Pack New Mexico</p>
          </div>
          <div className="bg-white dark:bg-card p-8 rounded-2xl border-2 border-accent/20 text-center shadow-sm">
            <p className="text-3xl font-black text-brand-dark dark:text-white">{getFormationPriceFormatted("wyoming")}</p>
            <p className="text-xs font-black tracking-widest text-brand-dark/60 dark:text-zinc-400 mt-2 uppercase">Pack Wyoming</p>
          </div>
          <div className="bg-white dark:bg-card p-8 rounded-2xl border-2 border-accent/20 text-center shadow-sm">
            <p className="text-3xl font-black text-brand-dark dark:text-white">{getFormationPriceFormatted("delaware")}</p>
            <p className="text-xs font-black tracking-widest text-brand-dark/60 dark:text-zinc-400 mt-2 uppercase">Pack Delaware</p>
          </div>
        </div>
        <p className="text-base sm:text-lg opacity-80 mt-6">{t("legalTerms.s04p1")}</p>
      </LegalSection>

      <LegalSection number="05" title={t("legalTerms.s05Title")}>
        <p>{t("legalTerms.s05p1")}</p>
        <p>{t("legalTerms.s05p2")}</p>
      </LegalSection>

      <LegalSection number="06" title={t("legalTerms.s06Title")}>
        <p>{t("legalTerms.s06p1")}</p>
      </LegalSection>

      <LegalSection number="07" title={t("legalTerms.s07Title")}>
        <p>{t("legalTerms.s07p1")}</p>
        <p>{t("legalTerms.s07p2")}</p>
      </LegalSection>

      <LegalSection number="08" title={t("legalTerms.s08Title")}>
        <p>{t("legalTerms.s08p1")}</p>
        <p>{t("legalTerms.s08p2")}</p>
      </LegalSection>

      <LegalSection number="09" title={t("legalTerms.s09Title")}>
        <p>{t("legalTerms.s09p1")}</p>
        <p>{t("legalTerms.s09p2")}</p>
        <p>{t("legalTerms.s09p3")}</p>
      </LegalSection>

      <LegalSection number="10" title={t("legalTerms.s10Title")}>
        <p>{t("legalTerms.s10p1")}</p>
        <LegalList items={[
          t("legalTerms.s10item1"),
          t("legalTerms.s10item2"),
          t("legalTerms.s10item3"),
          t("legalTerms.s10item4"),
        ]} />
      </LegalSection>

      <LegalSection number="11" title={t("legalTerms.s11Title")}>
        <p>{t("legalTerms.s11p1")}</p>
        <LegalList items={[
          t("legalTerms.s11item1"),
          t("legalTerms.s11item2"),
          t("legalTerms.s11item3"),
          t("legalTerms.s11item4"),
        ]} />
        <p>{t("legalTerms.s11p2")}</p>
      </LegalSection>

      <LegalSection number="12" title={t("legalTerms.s12Title")}>
        <LegalHighlightBox variant="dark">
          <p>{t("legalTerms.s12p1")}</p>
        </LegalHighlightBox>
      </LegalSection>
    </LegalPageLayout>
  );
}
