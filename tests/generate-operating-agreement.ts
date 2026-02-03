import { jsPDF } from "jspdf";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestLLCData {
  companyName: string;
  designator: string;
  ein: string;
  state: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerIdNumber: string;
  ownerIdType: string;
  ownerAddress: string;
  ownerCity: string;
  ownerCountry: string;
  ownerProvince: string;
  ownerPostalCode: string;
  llcCreatedDate: string;
}

interface FormData {
  memberAddress: string;
  memberPhone: string;
  capitalContribution: string;
  effectiveDate: string;
  orderId: string;
}

const testLLC: TestLLCData = {
  companyName: "ACME DIGITAL SERVICES",
  designator: "LLC",
  ein: "88-1234567",
  state: "New Mexico",
  ownerFullName: "Juan García López",
  ownerEmail: "juan.garcia@ejemplo.com",
  ownerPhone: "+34 612 345 678",
  ownerIdNumber: "12345678A",
  ownerIdType: "DNI",
  ownerAddress: "Calle Gran Vía 123, 4º Izquierda",
  ownerCity: "Madrid",
  ownerCountry: "España",
  ownerProvince: "Madrid",
  ownerPostalCode: "28013",
  llcCreatedDate: "2026-01-15",
};

const testFormData: FormData = {
  memberAddress: "Calle Gran Vía 123, 4º Izquierda, Madrid, Madrid, España 28013",
  memberPhone: "+34 612 345 678",
  capitalContribution: "10,000",
  effectiveDate: "2026-02-03",
  orderId: "NM-12345678",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(): string {
  const now = new Date();
  return now.toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function loadLogoBase64(): string | null {
  try {
    const logoPath = path.join(__dirname, "../client/src/assets/logo-icon.png");
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function generateOperatingAgreementPDF(llc: TestLLCData, formData: FormData, logoBase64: string | null): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const black: [number, number, number] = [0, 0, 0];
  const gray: [number, number, number] = [100, 100, 100];
  const lightGray: [number, number, number] = [180, 180, 180];

  const companyFullName = `${llc.companyName} ${llc.designator}`;
  const signatureDateTime = formatDateTime();

  let pageNumber = 1;

  const addHeader = () => {
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", pageWidth - margin - 18, 8, 18, 18);
      } catch {}
    }

    doc.setFontSize(7);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`Order: ${formData.orderId}`, pageWidth - margin, 30, { align: "right" });

    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, 35, pageWidth - margin, 35);
  };

  const addFooter = () => {
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFontSize(7);
    doc.setTextColor(gray[0], gray[1], gray[2]);
    doc.text("www.easyusllc.com", margin, pageHeight - 8);
    doc.text(`${pageNumber}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  };

  let yPos = 0;

  const checkNewPage = (space: number): number => {
    if (yPos + space > pageHeight - 20) {
      addFooter();
      doc.addPage();
      pageNumber++;
      addHeader();
      return 42;
    }
    return yPos;
  };

  const addSection = (num: number, title: string, content: string | string[]) => {
    yPos = checkNewPage(25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(`ARTICLE ${num} — ${title}`, margin, yPos);

    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(gray[0], gray[1], gray[2]);
    
    const contentArray = Array.isArray(content) ? content : [content];
    
    for (const text of contentArray) {
      const lines = doc.splitTextToSize(text, contentWidth);
      yPos = checkNewPage(lines.length * 4.5);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 4.5 + 4;
    }
    yPos += 4;
  };

  // ===== PAGE 1: COVER =====
  addHeader();
  yPos = 55;
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("OPERATING AGREEMENT", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text("OF", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  doc.setFontSize(16);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.setFont("helvetica", "bold");
  doc.text(companyFullName, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text("A Limited Liability Company", pageWidth / 2, yPos, { align: "center" });

  yPos += 20;
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.line(pageWidth/4, yPos, (pageWidth/4)*3, yPos);
  
  yPos += 20;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, contentWidth, 35, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(gray[0], gray[1], gray[2]);
  const col1 = margin + 8;
  const col2 = margin + contentWidth / 3 + 8;
  const col3 = margin + (contentWidth * 2) / 3 + 8;
  doc.text("STATE", col1, yPos + 10);
  doc.text("EIN", col2, yPos + 10);
  doc.text("FORMED", col3, yPos + 10);
  doc.setFontSize(11);
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text(llc.state, col1, yPos + 22);
  doc.text(llc.ein, col2, yPos + 22);
  doc.text(formatDate(llc.llcCreatedDate), col3, yPos + 22);

  addFooter();

  // ===== PAGE 2+: CONTENT =====
  doc.addPage();
  pageNumber++;
  addHeader();
  yPos = 42;

  addSection(1, "FORMATION AND EXISTENCE", [
    `1.1 Formation: This Operating Agreement ("Agreement") governs ${companyFullName}, a Limited Liability Company duly organized under the laws of the State of ${llc.state}, United States of America (the "Company").`,
    "1.2 Separate Legal Entity: The Company shall operate as a separate legal entity distinct from its Member, maintaining full liability protection as permitted by applicable law.",
    "1.3 Duration: The Company shall exist perpetually unless dissolved pursuant to this Agreement or applicable law."
  ]);

  addSection(2, "BUSINESS PURPOSE AND ACTIVITIES", [
    "2.1 General Purpose: The Company is organized to conduct any lawful business activity permitted under applicable United States law.",
    "2.2 Authorized Activities: The Company may engage in, but is not limited to: Business consulting services, Software and digital service operations, E-commerce and online commercial activities, Asset holding and investment operations, International business development, Technology and intellectual property management.",
    "2.3 Geographic Scope: The Company may operate within the United States and internationally."
  ]);

  addSection(3, "PRINCIPAL PLACE OF BUSINESS", `The principal office of the Company shall be: ${llc.ownerAddress}, ${llc.ownerCity}, ${llc.ownerProvince}, ${llc.ownerCountry} ${llc.ownerPostalCode}. The Member may change the principal place of business at any time.`);

  addSection(4, "MEMBER AND OWNERSHIP", [
    "The Company has one Member:",
    `Full Legal Name: ${llc.ownerFullName}`,
    `Identification / Passport / ID: ${llc.ownerIdNumber}`,
    `Residential Address: ${llc.ownerAddress}, ${llc.ownerCity}, ${llc.ownerProvince}, ${llc.ownerCountry} ${llc.ownerPostalCode}`,
    `Telephone: ${formData.memberPhone}`,
    `Email: ${llc.ownerEmail}`,
    `Employer Identification Number (EIN): ${llc.ein}`,
    "The Member owns 100% of the Membership Interest."
  ]);

  addSection(5, "BENEFICIAL OWNERSHIP REPRESENTATION", [
    "The Member certifies that:",
    "1. The Member is the ultimate beneficial owner of the Company.",
    "2. No undisclosed nominee, trustee, or third-party beneficial owner exists.",
    "3. The Company is not controlled directly or indirectly by any sanctioned individual or restricted entity."
  ]);

  addSection(6, "CAPITAL CONTRIBUTIONS", [
    `6.1 Initial Contributions: The Member may contribute capital in the form of: Cash, Intellectual Property, Services, Assets. Initial contribution value: $${formData.capitalContribution} USD.`,
    "6.2 Additional Contributions: Additional contributions shall be voluntary and solely determined by the Member."
  ]);

  addSection(7, "MANAGEMENT STRUCTURE", [
    "7.1 Member-Managed Company: The Company shall be managed exclusively by the Member.",
    "7.2 Authority of the Member: The Member shall have unrestricted authority to: Execute contracts, Open and manage bank accounts, Conduct financial transactions, Hire employees and contractors, Acquire or dispose of Company assets, Represent the Company before regulatory authorities, Enter strategic partnerships.",
    "7.3 Appointment of Officers: The Member may appoint officers, consultants, or advisors through written authorization."
  ]);

  addSection(8, "BANKING AND FINANCIAL OPERATIONS", [
    "8.1 Financial Accounts: The Company may maintain accounts with domestic or international financial institutions.",
    "8.2 Financial Governance: The Company shall maintain strict separation between personal and Company assets.",
    "8.3 Authorized Signatory: The Member shall serve as the primary authorized signatory unless delegated in writing."
  ]);

  addSection(9, "ACCOUNTING AND CORPORATE RECORDS", "The Company shall maintain: Financial records, Tax filings, Ownership documentation, Commercial agreements, Corporate governance documentation. Records shall be retained in accordance with regulatory and legal standards.");

  addSection(10, "PROFITS, LOSSES AND DISTRIBUTIONS", "All profits and losses shall be allocated solely to the Member. The Member may withdraw funds at their discretion provided that: The Company remains solvent and legal obligations are satisfied.");

  addSection(11, "TAX CLASSIFICATION AND REPORTING", [
    "11.1 Federal Tax Treatment: Unless otherwise elected, the Company shall be treated as a Disregarded Entity for federal tax purposes.",
    "11.2 Reporting Obligations: The Company shall comply with applicable reporting requirements including, when required: IRS Form 5472, IRS Form 1120 informational return, FBAR reporting (if applicable), and International reporting requirements."
  ]);

  addSection(12, "ANTI-MONEY LAUNDERING AND COMPLIANCE", "The Company shall operate in accordance with: Anti-Money Laundering laws, Counter Terrorism Financing regulations, Know Your Customer requirements, and Sanctions compliance standards. The Member agrees to provide compliance documentation when reasonably required by financial institutions.");

  addSection(13, "ECONOMIC SUBSTANCE REPRESENTATION", "The Member confirms that: The Company operates for legitimate commercial purposes, maintains appropriate operational control, business decisions are directed by the Member, and the Company is not formed solely for tax evasion or unlawful purposes.");

  addSection(14, "INTELLECTUAL PROPERTY OWNERSHIP", "All intellectual property developed or acquired by the Company shall be owned exclusively by the Company unless otherwise assigned in writing.");

  addSection(15, "CONFIDENTIALITY", "The Member agrees to maintain confidentiality regarding: Client information, Financial data, Trade secrets, and Business strategies.");

  addSection(16, "LIMITATION OF LIABILITY AND INDEMNIFICATION", [
    "16.1 Limited Liability: The Member shall not be personally liable for Company obligations beyond capital contributions except as required by law.",
    "16.2 Indemnification: The Company shall indemnify the Member against losses arising from lawful Company activities."
  ]);

  addSection(17, "TRANSFER OF MEMBERSHIP INTEREST", "The Member may transfer ownership interest at their sole discretion through written documentation.");

  addSection(18, "DISSOLUTION AND WINDING UP", [
    "18.1 Voluntary Dissolution: The Company may be dissolved by decision of the Member.",
    "18.2 Liquidation Process: Upon dissolution: 1. All liabilities shall be satisfied; 2. Remaining assets shall be distributed to the Member; 3. All legal filings shall be completed."
  ]);

  addSection(19, "DISPUTE RESOLUTION", "Any dispute arising under this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.");

  addSection(20, "FORCE MAJEURE", "The Company shall not be liable for delays caused by events beyond reasonable control including natural disasters, regulatory changes, or governmental restrictions.");

  addSection(21, "DIGITAL EXECUTION", "This Agreement may be executed electronically and shall be legally binding.");

  addSection(22, "GOVERNING LAW", `This Agreement shall be governed by the laws of the State of ${llc.state}.`);

  addSection(23, "ENTIRE AGREEMENT", "This Agreement constitutes the complete governing document of the Company.");

  addSection(24, "ADMINISTRATIVE PREPARATION STATEMENT", "This Operating Agreement has been prepared administratively by: Easy US LLC. Acting solely as a corporate formation and administrative services provider on behalf of its client. Easy US LLC does not assume ownership, management, fiduciary responsibility, or legal representation of the Company.");

  addSection(25, "COMPLIANCE AND REGULATORY COMMITMENT", "The Company is committed to operating with transparency, integrity, and full respect for applicable laws and regulations. The Member confirms that the Company has been created to conduct legitimate commercial activities. The Company agrees to cooperate with reasonable compliance requests.");

  addSection(26, "BANKING RELATIONSHIP REPRESENTATION", "The Company intends to establish and maintain banking service relationships. The Member acknowledges that account approval is solely at the discretion of financial institutions. The Company agrees to maintain accurate records and ensure all transactions are connected to lawful commercial activities.");

  addSection(27, "SOURCE OF FUNDS DECLARATION", "The Member confirms that funds used origin from legitimate sources including personal savings, business income, client payments, family support, or lawful investments.");

  addSection(28, "RISK MANAGEMENT PRINCIPLES", "The Company recognizes that responsible risk management is essential. It shall maintain accurate bookkeeping, monitor transactional activity, and maintain operational transparency.");

  addSection(29, "CLIENT ACCEPTANCE AND BUSINESS ETHICS", "The Company may decline business relationships that present unreasonable risk. It commits to providing services in good faith and maintaining professional standards.");

  addSection(30, "DATA PROTECTION AND CONFIDENTIALITY", "The Company respects confidentiality and shall take measures to protect sensitive information, limit data access, and comply with data protection regulations.");

  addSection(31, "COOPERATION WITH REVIEWS", "The Member understands that periodic reviews by financial institutions are standard practice and agrees to cooperate in good faith.");

  addSection(32, "RESPONSIBLE BUSINESS USE", "The Company is intended exclusively for lawful activities. Misuse of infrastructure may result in service termination.");

  addSection(33, "AUTOMATED DOCUMENT PREPARATION", "This Agreement may be generated through structured administrative preparation processes. Easy US LLC assists in preparation but does not provide legal or financial advice.");

  // ===== SIGNATURE PAGE =====
  doc.addPage();
  pageNumber++;
  addHeader();
  yPos = 50;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("OPERATING AGREEMENT MEMBER CERTIFICATION", pageWidth / 2, yPos, { align: "center" });

  yPos += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("I certify that I am the sole Member and agree to all provisions herein.", margin, yPos);

  yPos += 15;
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.line(margin, yPos, pageWidth/2, yPos);
  
  yPos += 15;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Member Name:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(llc.ownerFullName, margin + 30, yPos);

  yPos += 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("Signature:", margin, yPos);
  
  // Electronic signature box
  doc.setFillColor(245, 245, 245);
  doc.rect(margin + 25, yPos - 5, contentWidth - 30, 20, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ELECTRONICALLY SIGNED", margin + 30, yPos + 2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(`By: ${llc.ownerFullName}`, margin + 30, yPos + 8);
  
  yPos += 20;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black[0], black[1], black[2]);
  doc.text("Date:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(signatureDateTime, margin + 15, yPos);

  yPos += 15;
  doc.setFontSize(7);
  doc.text(`Order ID: ${formData.orderId}`, margin, yPos);

  addFooter();

  return Buffer.from(doc.output("arraybuffer"));
}

async function main() {
  console.log("=".repeat(60));
  console.log("OPERATING AGREEMENT - UPDATED VERSION WITH 33 ARTICLES");
  console.log("=".repeat(60));

  const logoBase64 = loadLogoBase64();
  try {
    const pdfBuffer = generateOperatingAgreementPDF(testLLC, testFormData, logoBase64);
    const outputPath = path.join(__dirname, "operating-agreement-test.pdf");
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`✓ PDF: ${outputPath}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
