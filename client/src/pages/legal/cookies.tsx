import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection, LegalSubSection, LegalList, LegalHighlightBox } from "@/components/legal/legal-page-layout";

export default function Cookies() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      title={t("legalCookies.title")}
      titleHighlight={t("legalCookies.titleHighlight")}
      lastUpdated={t("legal.lastUpdated")}
      pdfUrl="/legal/politica-cookies.pdf"
    >
      <LegalSection number="01" title={t("legalCookies.s01Title")}>
        <p>{t("legalCookies.s01p1")}</p>
      </LegalSection>

      <LegalSection number="02" title={t("legalCookies.s02Title")}>
        <LegalSubSection title={t("legalCookies.s02sub1Title")}>
          <p>{t("legalCookies.s02sub1p1")}</p>
          <LegalList items={[
            t("legalCookies.s02sub1item1"),
            t("legalCookies.s02sub1item2"),
            t("legalCookies.s02sub1item3"),
            t("legalCookies.s02sub1item4"),
          ]} />
        </LegalSubSection>

        <LegalSubSection title={t("legalCookies.s02sub2Title")}>
          <p>{t("legalCookies.s02sub2p1")}</p>
          <LegalList items={[
            t("legalCookies.s02sub2item1"),
            t("legalCookies.s02sub2item2"),
            t("legalCookies.s02sub2item3"),
          ]} />
        </LegalSubSection>

        <LegalSubSection title={t("legalCookies.s02sub3Title")}>
          <p>{t("legalCookies.s02sub3p1")}</p>
          <LegalList items={[
            t("legalCookies.s02sub3item1"),
            t("legalCookies.s02sub3item2"),
            t("legalCookies.s02sub3item3"),
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="03" title={t("legalCookies.s03Title")}>
        <p>{t("legalCookies.s03p1")}</p>
        <LegalList items={[
          t("legalCookies.s03item1"),
          t("legalCookies.s03item2"),
          t("legalCookies.s03item3"),
        ]} />
        <p className="mt-4">{t("legalCookies.s03p2")}</p>
      </LegalSection>

      <LegalSection number="04" title={t("legalCookies.s04Title")}>
        <LegalSubSection title={t("legalCookies.s04sub1Title")}>
          <p>{t("legalCookies.s04sub1p1")}</p>
        </LegalSubSection>

        <LegalSubSection title={t("legalCookies.s04sub2Title")}>
          <p>{t("legalCookies.s04sub2p1")}</p>
          <LegalList items={[
            t("legalCookies.s04sub2item1"),
            t("legalCookies.s04sub2item2"),
            t("legalCookies.s04sub2item3"),
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="05" title={t("legalCookies.s05Title")}>
        <p>{t("legalCookies.s05p1")}</p>
        <LegalList items={[
          t("legalCookies.s05item1"),
          t("legalCookies.s05item2"),
          t("legalCookies.s05item3"),
        ]} />
        <LegalHighlightBox>
          <p>{t("legalCookies.s05note")}</p>
        </LegalHighlightBox>
      </LegalSection>

      <LegalSection number="06" title={t("legalCookies.s06Title")}>
        <p>{t("legalCookies.s06p1")}</p>
        <LegalList items={[
          t("legalCookies.s06item1"),
          t("legalCookies.s06item2"),
          t("legalCookies.s06item3"),
        ]} />
      </LegalSection>

      <LegalSection number="07" title={t("legalCookies.s07Title")}>
        <p>{t("legalCookies.s07p1")}</p>
      </LegalSection>

      <LegalSection number="08" title={t("legalCookies.s08Title")}>
        <LegalHighlightBox variant="dark">
          <p>{t("legalCookies.s08p1")}</p>
          <p className="mt-4">Email: hola@easyusllc.com</p>
          <p>WhatsApp: +34 614 916 910</p>
        </LegalHighlightBox>
      </LegalSection>
    </LegalPageLayout>
  );
}
