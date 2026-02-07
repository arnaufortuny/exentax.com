import { jsPDF } from "jspdf";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testData = {
  issuerName: "DIGITAL VENTURES LLC",
  issuerAddress: "1209 Mountain Road Place NE, STE R\nAlbuquerque, NM 87110, USA",
  issuerEmail: "contact@digitalventures.com",
  issuerTaxId: "EIN: 92-7654321",
  clientName: "Sofía Rodríguez Fernández",
  clientAddress: "Calle Mayor 28, 2ºB\nMadrid 28013, España",
  clientEmail: "sofia.rodriguez@email.com",
  clientTaxId: "NIE: Y1234567X",
  invoiceNumber: "INV-2026-0042",
  invoiceDate: "2026-02-07",
  dueDate: "2026-03-07",
  currency: "EUR",
  taxRate: 21,
  notes: "Pago mediante transferencia bancaria. Incluir número de factura como referencia.",
  items: [
    { description: "Consultoría estrategia digital - Febrero 2026", quantity: 1, price: 2500 },
    { description: "Diseño y desarrollo landing page corporativa", quantity: 1, price: 1800 },
    { description: "Gestión redes sociales (paquete mensual)", quantity: 2, price: 450 },
    { description: "Campaña Google Ads - Setup + gestión", quantity: 1, price: 750 },
  ],
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function generateToolsInvoicePDF(): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const currencySymbol = testData.currency === "EUR" ? "€" : "$";

  const subtotal = testData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = subtotal * (testData.taxRate / 100);
  const total = subtotal + taxAmount;

  doc.setFillColor(110, 220, 138);
  doc.rect(0, 0, pageWidth, 8, "F");

  doc.setTextColor(14, 18, 21);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURA", 20, 35);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(pageWidth - 75, 18, 55, 28, 3, 3, "F");

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Nº Factura", pageWidth - 70, 26);
  doc.text("Fecha", pageWidth - 70, 34);
  if (testData.dueDate) doc.text("Vencimiento", pageWidth - 70, 42);

  doc.setTextColor(14, 18, 21);
  doc.setFont("helvetica", "bold");
  doc.text(testData.invoiceNumber, pageWidth - 25, 26, { align: "right" });
  doc.text(formatDate(testData.invoiceDate), pageWidth - 25, 34, { align: "right" });
  if (testData.dueDate) doc.text(formatDate(testData.dueDate), pageWidth - 25, 42, { align: "right" });

  let yPos = 60;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, yPos - 5, 82, 45, 3, 3, "F");

  doc.setTextColor(110, 220, 138);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("EMISOR", 20, yPos + 2);

  doc.setTextColor(14, 18, 21);
  doc.setFontSize(11);
  doc.text(testData.issuerName, 20, yPos + 12);

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let issuerY = yPos + 20;
  if (testData.issuerAddress) {
    const addressLines = doc.splitTextToSize(testData.issuerAddress, 75);
    doc.text(addressLines, 20, issuerY);
    issuerY += addressLines.length * 4;
  }
  if (testData.issuerEmail) { doc.text(testData.issuerEmail, 20, issuerY); issuerY += 4; }
  if (testData.issuerTaxId) { doc.text(testData.issuerTaxId, 20, issuerY); }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(103, yPos - 5, 82, 45, 3, 3, "F");

  doc.setTextColor(110, 220, 138);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE", 108, yPos + 2);

  doc.setTextColor(14, 18, 21);
  doc.setFontSize(11);
  doc.text(testData.clientName, 108, yPos + 12);

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  let clientY = yPos + 20;
  if (testData.clientAddress) {
    const addressLines = doc.splitTextToSize(testData.clientAddress, 75);
    doc.text(addressLines, 108, clientY);
    clientY += addressLines.length * 4;
  }
  if (testData.clientEmail) { doc.text(testData.clientEmail, 108, clientY); clientY += 4; }
  if (testData.clientTaxId) { doc.text(testData.clientTaxId, 108, clientY); }

  yPos = 115;

  doc.setFillColor(110, 220, 138);
  doc.roundedRect(15, yPos, pageWidth - 30, 12, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CONCEPTO", 20, yPos + 8);
  doc.text("UDS", 125, yPos + 8);
  doc.text("PRECIO", 145, yPos + 8);
  doc.text("IMPORTE", 175, yPos + 8);

  yPos += 18;
  doc.setTextColor(14, 18, 21);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  testData.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 253);
      doc.rect(15, yPos - 5, pageWidth - 30, 10, "F");
    }
    const descLines = doc.splitTextToSize(item.description, 95);
    doc.text(descLines, 20, yPos);
    doc.text(String(item.quantity), 128, yPos);
    doc.text(`${item.price.toFixed(2)} ${currencySymbol}`, 160, yPos, { align: "right" });
    const itemTotal = item.quantity * item.price;
    doc.text(`${itemTotal.toFixed(2)} ${currencySymbol}`, 188, yPos, { align: "right" });
    yPos += Math.max(descLines.length * 6, 10);
  });

  yPos += 8;

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 140, yPos);
  doc.setTextColor(14, 18, 21);
  doc.text(`${subtotal.toFixed(2)} ${currencySymbol}`, 183, yPos, { align: "right" });

  if (testData.taxRate > 0) {
    yPos += 8;
    doc.setTextColor(107, 114, 128);
    doc.text(`IVA (${testData.taxRate}%):`, 140, yPos);
    doc.setTextColor(14, 18, 21);
    doc.text(`${taxAmount.toFixed(2)} ${currencySymbol}`, 183, yPos, { align: "right" });
  }

  yPos += 10;

  doc.setFillColor(14, 18, 21);
  doc.roundedRect(130, yPos - 2, 60, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 135, yPos + 8);
  doc.text(`${total.toFixed(2)} ${currencySymbol}`, 185, yPos + 8, { align: "right" });

  if (testData.notes) {
    yPos += 30;
    doc.setTextColor(110, 220, 138);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("NOTAS", 20, yPos);
    yPos += 6;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(testData.notes, pageWidth - 40);
    doc.text(noteLines, 20, yPos);
  }

  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Generado con Easy US LLC - Herramientas", 20, pageHeight - 10);
  doc.text(formatDate(testData.invoiceDate), pageWidth - 20, pageHeight - 10, { align: "right" });

  return Buffer.from(doc.output("arraybuffer"));
}

async function main() {
  console.log("=".repeat(60));
  console.log("TOOLS INVOICE - TEST PDF (CLIENT-SIDE STYLE)");
  console.log("=".repeat(60));

  try {
    const pdfBuffer = generateToolsInvoicePDF();
    const outputPath = path.join(__dirname, "tools-invoice-test.pdf");
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`PDF generado: ${outputPath}`);
    const stats = fs.statSync(outputPath);
    console.log(`Tamaño: ${(stats.size / 1024).toFixed(1)} KB`);

    console.log("\nDatos de la factura:");
    console.log(`  Emisor: ${testData.issuerName}`);
    console.log(`  Cliente: ${testData.clientName}`);
    console.log(`  Nº: ${testData.invoiceNumber}`);
    console.log(`  Items: ${testData.items.length}`);
    const subtotal = testData.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const tax = subtotal * (testData.taxRate / 100);
    console.log(`  Subtotal: ${subtotal.toFixed(2)} €`);
    console.log(`  IVA (${testData.taxRate}%): ${tax.toFixed(2)} €`);
    console.log(`  Total: ${(subtotal + tax).toFixed(2)} €`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
