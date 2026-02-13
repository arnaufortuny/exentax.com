import { useTranslation } from "react-i18next";
import { LegalPageLayout, LegalSection, LegalSubSection, LegalList, LegalHighlightBox } from "@/components/legal/legal-page-layout";
import { usePageTitle } from "@/hooks/use-page-title";
import { CONTACT_PHONE_DISPLAY } from "@/lib/constants";

export default function Privacidad() {
  const { t } = useTranslation();
  usePageTitle();

  return (
    <LegalPageLayout
      title={t("legalPrivacy.title")}
      titleHighlight={t("legalPrivacy.titleHighlight")}
      lastUpdated={t("legal.lastUpdated")}
      pdfUrl="/legal/politica-privacidad.pdf"
    >
      <LegalSection number="01" title={t("legalPrivacy.s01Title")}>
        <LegalSubSection title={t("legalPrivacy.s01sub1Title")}>
          <p>{t("legalPrivacy.s01sub1p1")}</p>
          <LegalHighlightBox>
            <p className="font-black text-brand-dark dark:text-zinc-400 text-xs tracking-widest opacity-50">{t("legalPrivacy.s01LegalEntity")}</p>
            <p className="font-black text-xl text-brand-dark dark:text-white">Exentax Holdings LLC</p>
            <p>{t("legalPrivacy.s01TradeName")}: Exentax</p>
            <p>{t("legalPrivacy.s01RegisteredAddress")}: 1209 Mountain Road Pl NE, STE R, Albuquerque, New Mexico 87110, {t("legalPrivacy.s01Country")}</p>
            <p>Email: hola@exentax.com</p>
            <p>WhatsApp: {CONTACT_PHONE_DISPLAY}</p>
          </LegalHighlightBox>
        </LegalSubSection>

        <LegalSubSection title={t("legalPrivacy.s01sub2Title")}>
          <p>{t("legalPrivacy.s01sub2p1")}</p>
          <LegalList items={[
            t("legalPrivacy.s01sub2item1"),
            t("legalPrivacy.s01sub2item2"),
            t("legalPrivacy.s01sub2item3"),
            t("legalPrivacy.s01sub2item4"),
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="02" title={t("legalPrivacy.s02Title")}>
        <LegalSubSection title={t("legalPrivacy.s02sub1Title")}>
          <p>{t("legalPrivacy.s02sub1p1")}</p>
          <LegalList items={[
            t("legalPrivacy.s02sub1item1"),
            t("legalPrivacy.s02sub1item2"),
            t("legalPrivacy.s02sub1item3"),
            t("legalPrivacy.s02sub1item4"),
            t("legalPrivacy.s02sub1item5"),
            t("legalPrivacy.s02sub1item6"),
          ]} />
        </LegalSubSection>

        <LegalSubSection title={t("legalPrivacy.s02sub2Title")}>
          <p>{t("legalPrivacy.s02sub2p1")}</p>
          <LegalList items={[
            t("legalPrivacy.s02sub2item1"),
            t("legalPrivacy.s02sub2item2"),
            t("legalPrivacy.s02sub2item3"),
            t("legalPrivacy.s02sub2item4"),
            t("legalPrivacy.s02sub2item5"),
            t("legalPrivacy.s02sub2item6"),
          ]} />
        </LegalSubSection>

        <LegalSubSection title={t("legalPrivacy.s02sub3Title")}>
          <LegalList items={[
            t("legalPrivacy.s02sub3item1"),
            t("legalPrivacy.s02sub3item2"),
            t("legalPrivacy.s02sub3item3"),
            t("legalPrivacy.s02sub3item4"),
            t("legalPrivacy.s02sub3item5"),
            t("legalPrivacy.s02sub3item6"),
            t("legalPrivacy.s02sub3item7"),
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="03" title={t("legalPrivacy.s03Title")}>
        <LegalSubSection title={t("legalPrivacy.s03sub1Title")}>
          <LegalList items={[
            t("legalPrivacy.s03sub1item1"),
            t("legalPrivacy.s03sub1item2"),
            t("legalPrivacy.s03sub1item3"),
            t("legalPrivacy.s03sub1item4"),
            t("legalPrivacy.s03sub1item5"),
            t("legalPrivacy.s03sub1item6"),
            t("legalPrivacy.s03sub1item7"),
            t("legalPrivacy.s03sub1item8"),
          ]} />
        </LegalSubSection>

        <LegalSubSection title={t("legalPrivacy.s03sub2Title")}>
          <LegalList items={[
            t("legalPrivacy.s03sub2item1"),
            t("legalPrivacy.s03sub2item2"),
            t("legalPrivacy.s03sub2item3"),
            t("legalPrivacy.s03sub2item4"),
            t("legalPrivacy.s03sub2item5"),
            t("legalPrivacy.s03sub2item6"),
            t("legalPrivacy.s03sub2item7"),
          ]} />
        </LegalSubSection>
      </LegalSection>

      <LegalSection number="04" title={t("legalPrivacy.s04Title")}>
        <p>{t("legalPrivacy.s04p1")}</p>
        <LegalList items={[
          t("legalPrivacy.s04item1"),
          t("legalPrivacy.s04item2"),
          t("legalPrivacy.s04item3"),
          t("legalPrivacy.s04item4"),
          t("legalPrivacy.s04item5"),
          t("legalPrivacy.s04item6"),
        ]} />
      </LegalSection>

      <LegalSection number="05" title={t("legalPrivacy.s05Title")}>
        <p>{t("legalPrivacy.s05p1")}</p>
        <LegalList items={[
          t("legalPrivacy.s05item1"),
          t("legalPrivacy.s05item2"),
          t("legalPrivacy.s05item3"),
          t("legalPrivacy.s05item4"),
          t("legalPrivacy.s05item5"),
          t("legalPrivacy.s05item6"),
        ]} />
      </LegalSection>

      <LegalSection number="06" title={t("legalPrivacy.s06Title")}>
        <p>{t("legalPrivacy.s06p1")}</p>
        <LegalList items={[
          t("legalPrivacy.s06item1"),
          t("legalPrivacy.s06item2"),
          t("legalPrivacy.s06item3"),
          t("legalPrivacy.s06item4"),
          t("legalPrivacy.s06item5"),
          t("legalPrivacy.s06item6"),
          t("legalPrivacy.s06item7"),
        ]} />
        <p className="mt-4">{t("legalPrivacy.s06p2")}</p>
      </LegalSection>

      <LegalSection number="07" title={t("legalPrivacy.s07Title")}>
        <p>{t("legalPrivacy.s07p1")}</p>
      </LegalSection>

      <LegalSection number="08" title={t("legalPrivacy.s08Title")}>
        <LegalHighlightBox variant="dark">
          <p>{t("legalPrivacy.s08p1")}</p>
          <p className="mt-4">Email: hola@exentax.com</p>
          <p>WhatsApp: {CONTACT_PHONE_DISPLAY}</p>
        </LegalHighlightBox>
      </LegalSection>
    </LegalPageLayout>
  );
}
