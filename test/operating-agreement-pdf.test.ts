import { describe, it, expect } from "vitest";
import { jsPDF } from "jspdf";
import * as fs from "fs";
import * as path from "path";

const mockLLC = {
  id: 1,
  orderId: 12345678,
  companyName: "Tech Ventures",
  ein: "12-3456789",
  state: "New Mexico",
  ownerFullName: "Juan Garcia Rodriguez",
  ownerEmail: "juan@example.com",
  ownerPhone: "+34 612 345 678",
  ownerIdNumber: "12345678A",
  ownerIdType: "Passport",
  ownerAddress: "Calle Principal 123",
  ownerCity: "Madrid",
  ownerCountry: "Spain",
  ownerProvince: "Madrid",
  ownerPostalCode: "28001",
  llcCreatedDate: "2025-01-15",
  designator: "LLC",
};

const mockFormData = {
  memberAddress: "Calle Principal 123, Madrid, Madrid, Spain 28001",
  memberPhone: "+34 612 345 678",
  capitalContribution: "1000",
  effectiveDate: "2025-02-04",
};

describe("Operating Agreement PDF Generation", () => {
  it("should generate a valid Operating Agreement PDF", async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - margin * 2;

    const accentColor: [number, number, number] = [110, 220, 138];
    const darkColor: [number, number, number] = [14, 18, 21];
    const grayColor: [number, number, number] = [107, 114, 128];
    const lightGray: [number, number, number] = [229, 231, 235];

    const companyFullName = `${mockLLC.companyName} ${mockLLC.designator}`;
    let pageNumber = 1;
    let yPos = 0;

    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    const addPageFooter = () => {
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("Documento generado por Easy US LLC", margin, pageHeight - 10);
      doc.text(`Pagina ${pageNumber}`, pageWidth - margin, pageHeight - 10, {
        align: "right",
      });
    };

    const addPageHeader = () => {
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 0, pageWidth, 4, "F");
      doc.setFontSize(8);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(companyFullName, margin, 12);
      doc.text("Operating Agreement", pageWidth - margin, 12, {
        align: "right",
      });
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, 16, pageWidth - margin, 16);
    };

    const checkNewPage = (requiredSpace: number): number => {
      if (yPos + requiredSpace > pageHeight - 30) {
        addPageFooter();
        doc.addPage();
        pageNumber++;
        addPageHeader();
        return 25;
      }
      return yPos;
    };

    const addSectionTitle = (num: number, title: string) => {
      yPos = checkNewPage(20);
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.roundedRect(margin, yPos, 8, 8, 1, 1, "F");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(String(num), margin + 4, yPos + 5.5, { align: "center" });
      doc.setFontSize(13);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(title, margin + 12, yPos + 6);
      yPos += 14;
    };

    const addParagraph = (text: string) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      const lines = doc.splitTextToSize(text, contentWidth);
      yPos = checkNewPage(lines.length * 5 + 5);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 5 + 6;
    };

    const addLabelValue = (label: string, value: string) => {
      yPos = checkNewPage(12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(label, margin + 8, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(value, margin + 8 + doc.getTextWidth(label) + 3, yPos);
      yPos += 6;
    };

    const addBulletPoint = (text: string) => {
      yPos = checkNewPage(8);
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.circle(margin + 10, yPos - 1.5, 1.5, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      const lines = doc.splitTextToSize(text, contentWidth - 20);
      doc.text(lines, margin + 16, yPos);
      yPos += lines.length * 5 + 3;
    };

    // ===== COVER PAGE =====
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 0, pageWidth, 8, "F");

    // Logo placeholder
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth / 2 - 30, 35, 60, 20, 3, 3, "F");
    doc.setFontSize(10);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Easy US LLC", pageWidth / 2, 47, { align: "center" });

    yPos = 80;

    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("OPERATING AGREEMENT", pageWidth / 2, yPos, { align: "center" });

    yPos += 12;
    doc.setFontSize(14);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("of", pageWidth / 2, yPos, { align: "center" });

    yPos += 16;
    doc.setFontSize(22);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(companyFullName, pageWidth / 2, yPos, { align: "center" });

    yPos += 25;
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(2);
    doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);

    yPos += 25;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const introText =
      "This Operating Agreement establishes the terms and conditions that govern the operation, management, and ownership structure of the limited liability company.";
    const introLines = doc.splitTextToSize(introText, contentWidth - 40);
    doc.text(introLines, pageWidth / 2, yPos, { align: "center" });

    yPos += introLines.length * 6 + 20;

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin + 20, yPos, contentWidth - 40, 30, 4, 4, "F");

    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Effective Date:", pageWidth / 2, yPos + 12, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(formatDate(mockFormData.effectiveDate), pageWidth / 2, yPos + 24, {
      align: "center",
    });

    addPageFooter();

    // ===== CONTENT PAGES =====
    doc.addPage();
    pageNumber++;
    addPageHeader();
    yPos = 25;

    // Section 1 - Company Overview
    addSectionTitle(1, "COMPANY OVERVIEW");
    addParagraph(
      `This Operating Agreement is entered into by ${mockLLC.ownerFullName} as the sole member of ${companyFullName}, a limited liability company formed under the laws of the State of ${mockLLC.state}.`
    );

    // Section 2 - Company Details
    addSectionTitle(2, "COMPANY DETAILS");
    yPos += 2;
    addLabelValue("Legal Name:", companyFullName);
    addLabelValue("State of Formation:", mockLLC.state);
    addLabelValue("Formation Date:", formatDate(mockLLC.llcCreatedDate));
    addLabelValue("EIN:", mockLLC.ein || "");
    yPos += 4;
    addLabelValue("Registered Address:", "");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("701 Brazos Street, Suite 500", margin + 8, yPos);
    yPos += 5;
    doc.text("Austin, TX 78701", margin + 8, yPos);
    yPos += 5;
    doc.text("United States", margin + 8, yPos);
    yPos += 10;

    // Section 3 - Ownership
    addSectionTitle(3, "OWNERSHIP STRUCTURE");
    addParagraph(
      "The Company has one member who holds 100% of the membership interests:"
    );
    yPos += 2;
    addLabelValue("Member Name:", mockLLC.ownerFullName);
    addLabelValue(
      "Government ID:",
      `${mockLLC.ownerIdType} ${mockLLC.ownerIdNumber}`
    );
    addLabelValue("Residential Address:", mockFormData.memberAddress);
    if (mockFormData.memberPhone) {
      addLabelValue("Telephone:", mockFormData.memberPhone);
    }
    addLabelValue("Email:", mockLLC.ownerEmail);
    addLabelValue("Ownership Percentage:", "100%");
    yPos += 4;

    // Section 4 - Business Purpose
    addSectionTitle(4, "BUSINESS PURPOSE");
    addParagraph(
      "The Company is organized for the following purposes and may engage in any lawful business activity:"
    );
    addBulletPoint("E-commerce and online sales");
    addBulletPoint("Digital services and consulting");
    addBulletPoint("Software development and technology services");
    addBulletPoint("Marketing and advertising services");
    addBulletPoint("Any other lawful business activity");

    // Section 5 - Management Structure
    addSectionTitle(5, "MANAGEMENT STRUCTURE");
    addParagraph(
      "The Company shall be member-managed. The Member has full authority to:"
    );
    addBulletPoint("Execute contracts and agreements on behalf of the Company");
    addBulletPoint("Open and manage bank accounts");
    addBulletPoint("Hire employees and contractors");
    addBulletPoint("Make all business and financial decisions");
    addBulletPoint("Represent the Company in legal matters");
    addBulletPoint("Distribute profits and manage Company funds");

    // Section 6 - Capital Contribution
    addSectionTitle(6, "CAPITAL CONTRIBUTION");
    addParagraph(
      "The Member has made or agrees to make a capital contribution to the Company."
    );
    if (mockFormData.capitalContribution) {
      addLabelValue(
        "Initial Contribution:",
        `$${mockFormData.capitalContribution} USD`
      );
    }
    addParagraph(
      "Additional contributions may be made at the discretion of the Member."
    );

    // Section 7 - Profits and Distributions
    addSectionTitle(7, "PROFITS AND DISTRIBUTIONS");
    addParagraph(
      "All profits and losses of the Company shall be allocated 100% to the Member. Distributions may be made at any time at the sole discretion of the Member."
    );

    // Section 8 - Tax Treatment
    addSectionTitle(8, "TAX TREATMENT");
    addParagraph(
      "The Company shall be treated as a disregarded entity for U.S. federal tax purposes. The Member is responsible for all applicable tax filings, including:"
    );
    addBulletPoint("IRS Form 1120");
    addBulletPoint("IRS Form 5472");
    addBulletPoint("Federal and state tax returns as required");

    // Section 9 - Financial Responsibility
    addSectionTitle(9, "FINANCIAL RESPONSIBILITY");
    addParagraph(
      "The Member shall maintain separate bank accounts for the Company and shall not commingle personal and business funds. The Member is responsible for maintaining adequate records of all financial transactions."
    );

    // Section 10 - Liability Protection
    addSectionTitle(10, "LIABILITY PROTECTION");
    addParagraph(
      "The Member shall not be personally liable for the debts, obligations, or liabilities of the Company. The liability of the Member is limited to the Member's capital contribution and any undistributed profits."
    );

    // Section 11 - Record Keeping
    addSectionTitle(11, "RECORD KEEPING");
    addParagraph("The Company shall maintain the following records:");
    addBulletPoint("Articles of Organization and amendments");
    addBulletPoint("This Operating Agreement and amendments");
    addBulletPoint("Financial statements and tax returns");
    addBulletPoint("Bank statements and transaction records");
    addBulletPoint("Contracts and business agreements");
    addParagraph(
      "Records shall be maintained for a minimum of seven (7) years."
    );

    // Section 12 - Transfer of Ownership
    addSectionTitle(12, "TRANSFER OF OWNERSHIP");
    addParagraph(
      "The Member may transfer all or part of their membership interest at any time. Any transfer must be documented in writing and filed with the appropriate state authorities if required."
    );

    // Section 13 - Dissolution
    addSectionTitle(13, "DISSOLUTION");
    addParagraph(
      "The Company may be dissolved at any time by the Member's written decision. Upon dissolution, the Company's assets shall be liquidated, debts paid, and remaining assets distributed to the Member."
    );

    // Section 14 - Source of Funds
    addSectionTitle(14, "SOURCE OF FUNDS DECLARATION");
    addParagraph(
      "The Member certifies that the initial capital contribution and all future contributions to the Company originate from lawful sources, including but not limited to:"
    );
    addBulletPoint("Personal savings and investments");
    addBulletPoint("Income from employment or self-employment");
    addBulletPoint("Proceeds from lawful business activities");
    addBulletPoint("Family transfers or gifts (where applicable)");
    addParagraph(
      "The Member agrees to provide documentation of source of funds upon request."
    );

    // Section 15 - Preparation
    addSectionTitle(15, "DOCUMENT PREPARATION");
    addParagraph(
      "This Operating Agreement was prepared by Easy US LLC, a corporate services provider, at the request of the Member. Easy US LLC does not provide legal or tax advice and recommends consulting with qualified professionals for specific legal or tax questions."
    );

    // Section 16 - Governing Law
    addSectionTitle(16, "GOVERNING LAW");
    addParagraph(
      `This Operating Agreement shall be governed by and construed in accordance with the laws of the State of ${mockLLC.state}, without regard to conflicts of law principles.`
    );

    // ===== SIGNATURE PAGE =====
    yPos = checkNewPage(100);
    if (yPos < 50) {
      doc.addPage();
      pageNumber++;
      addPageHeader();
      yPos = 30;
    }

    yPos += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text("MEMBER CONFIRMATION", margin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    const confirmText =
      "By signing below, the undersigned Member acknowledges that they have read, understood, and agree to all terms and conditions set forth in this Operating Agreement.";
    const confirmLines = doc.splitTextToSize(confirmText, contentWidth);
    doc.text(confirmLines, margin, yPos);
    yPos += confirmLines.length * 5 + 15;

    // Signature box
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, "S");

    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Member Name:", margin + 8, yPos + 12);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(mockLLC.ownerFullName, margin + 8, yPos + 20);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Signature:", margin + 8, yPos + 35);
    doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.line(
      margin + 8 + doc.getTextWidth("Signature:") + 5,
      yPos + 35,
      margin + contentWidth / 2 - 10,
      yPos + 35
    );

    doc.text("Date:", margin + contentWidth / 2 + 10, yPos + 35);
    doc.line(
      margin + contentWidth / 2 + 10 + doc.getTextWidth("Date:") + 5,
      yPos + 35,
      margin + contentWidth - 8,
      yPos + 35
    );

    yPos += 70;

    // Prepared by section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, "F");

    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Prepared by:", margin + 8, yPos + 10);

    doc.setFontSize(12);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("Easy US LLC", margin + 8, yPos + 20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Corporate Formation Services", margin + 8, yPos + 27);

    doc.text("hola@easyusllc.com", margin + contentWidth - 70, yPos + 20);
    doc.text("+1 (512) 123-4567", margin + contentWidth - 8, yPos + 20, {
      align: "right",
    });

    addPageFooter();

    // Save the PDF to the test folder
    const pdfOutput = doc.output("arraybuffer");
    const outputPath = path.resolve(
      __dirname,
      "Operating_Agreement_Test.pdf"
    );
    fs.writeFileSync(outputPath, Buffer.from(pdfOutput));

    // Verify the PDF was created
    expect(fs.existsSync(outputPath)).toBe(true);

    // Verify PDF has content (minimum size check)
    const stats = fs.statSync(outputPath);
    expect(stats.size).toBeGreaterThan(10000); // PDF should be at least 10KB

    console.log(`PDF generated successfully at: ${outputPath}`);
  });
});
