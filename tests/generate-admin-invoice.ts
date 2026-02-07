import { generateOrderInvoice } from "../server/lib/pdf-generator";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("=".repeat(60));
  console.log("ADMIN INVOICE - TEST PDF GENERATION");
  console.log("=".repeat(60));

  const testOrder = {
    id: 1042,
    invoiceNumber: "NM-20260207-1042",
    amount: 69900,
    originalAmount: 79900,
    discountCode: "WELCOME10",
    discountAmount: 10000,
    currency: "EUR",
    status: "pending",
    createdAt: new Date("2026-02-07T10:30:00Z"),
  };

  const testProduct = {
    name: "LLC Formation - New Mexico",
    description: "Formación completa de LLC en New Mexico, incluye Registered Agent primer año, EIN, Operating Agreement y asistencia bancaria.",
    features: [
      "Registered Agent 1er año incluido",
      "Obtención de EIN",
      "Operating Agreement",
      "Asistencia apertura cuenta bancaria",
    ],
  };

  const testUser = {
    firstName: "Carlos",
    lastName: "Martínez López",
    email: "carlos.martinez@ejemplo.com",
    phone: "+34 655 123 456",
    idType: "DNI",
    idNumber: "48765432B",
    streetType: "Calle",
    address: "Avenida de la Constitución 45, 3ºA",
    city: "Barcelona",
    province: "Barcelona",
    postalCode: "08015",
    country: "España",
  };

  const testApplication = {
    ownerFullName: "Carlos Martínez López",
    ownerEmail: "carlos.martinez@ejemplo.com",
    ownerPhone: "+34 655 123 456",
    ownerIdType: "DNI",
    ownerIdNumber: "48765432B",
    ownerStreetType: "Calle",
    ownerAddress: "Avenida de la Constitución 45, 3ºA",
    ownerCity: "Barcelona",
    ownerProvince: "Barcelona",
    ownerPostalCode: "08015",
    ownerCountry: "España",
    companyName: "DIGITAL VENTURES",
    designator: "LLC",
    state: "New Mexico",
    ein: "92-7654321",
    llcCreatedDate: "2026-02-05",
    registeredAgent: "Easy US LLC",
  };

  try {
    const pdfBuffer = await generateOrderInvoice({
      order: testOrder,
      product: testProduct,
      user: testUser,
      application: testApplication,
      isMaintenance: false,
    });

    const outputPath = path.join(__dirname, "admin-invoice-test.pdf");
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`PDF generado: ${outputPath}`);
    const stats = fs.statSync(outputPath);
    console.log(`Tamaño: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
