import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection, LegalSubSection, LegalList, LegalHighlightBox } from "@/components/legal/legal-page-layout";
import { usePageTitle } from "@/hooks/use-page-title";
import { CONTACT_PHONE_DISPLAY } from "@/lib/constants";

export default function Reembolsos() {
  const { t } = useTranslation();
  usePageTitle();

  return (
    <LegalPageLayout
      title={t("legalRefunds.title")}
      titleHighlight={t("legalRefunds.titleHighlight")}
      lastUpdated={t("legal.lastUpdated")}
      pdfUrl="/legal/politica-reembolsos.pdf"
    >
      <LegalSection number="01" title={t("legalRefunds.s01Title")}>
        <p>{t("legalRefunds.s01p1")}</p>
        <p>{t("legalRefunds.s01p2")}</p>
      </LegalSection>

      <LegalSection number="02" title={t("legalRefunds.s02Title")}>
        <p>{t("legalRefunds.s02p1")}</p>
        <LegalList items={[
          t("legalRefunds.s02item1"),
          t("legalRefunds.s02item2"),
          t("legalRefunds.s02item3"),
          t("legalRefunds.s02item4"),
          t("legalRefunds.s02item5"),
          t("legalRefunds.s02item6"),
          t("legalRefunds.s02item7"),
        ]} />
      </LegalSection>

      <LegalSection number="03" title={t("legalRefunds.s03Title")}>
        <p>{t("legalRefunds.s03p1")}</p>
        <LegalList items={[
          t("legalRefunds.s03item1"),
          t("legalRefunds.s03item2"),
          t("legalRefunds.s03item3"),
        ]} />
        <p className="mt-4">{t("legalRefunds.s03p2")}</p>
      </LegalSection>

      <LegalSection number="04" title={t("legalRefunds.s04Title")}>
        <p>{t("legalRefunds.s04p1")}</p>
        <LegalList items={[
          t("legalRefunds.s04item1"),
          t("legalRefunds.s04item2"),
          t("legalRefunds.s04item3"),
          t("legalRefunds.s04item4"),
        ]} />
        <p className="mt-4">{t("legalRefunds.s04p2")}</p>
      </LegalSection>

      <LegalSection number="05" title={t("legalRefunds.s05Title")}>
        <p>{t("legalRefunds.s05p1")}</p>
        <LegalList items={[
          t("legalRefunds.s05item1"),
          t("legalRefunds.s05item2"),
          t("legalRefunds.s05item3"),
          t("legalRefunds.s05item4"),
        ]} />
      </LegalSection>

      <LegalSection number="06" title={t("legalRefunds.s06Title")}>
        <p>{t("legalRefunds.s06p1")}</p>
        <LegalHighlightBox>
          <p>Email: hola@exentax.com</p>
          <p>WhatsApp: {CONTACT_PHONE_DISPLAY}</p>
          <p className="mt-4 text-sm opacity-70">{t("legalRefunds.s06p2")}</p>
        </LegalHighlightBox>
        <p className="mt-4">{t("legalRefunds.s06p3")}</p>
      </LegalSection>

      <LegalSection number="07" title={t("legalRefunds.s07Title")}>
        <LegalHighlightBox variant="dark">
          <p>{t("legalRefunds.s07p1")}</p>
        </LegalHighlightBox>
      </LegalSection>
    </LegalPageLayout>
  );
}
