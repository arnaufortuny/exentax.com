import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Trash2, Plus, FileDown, Receipt, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function InvoiceGenerator() {
  const [, setLocation] = useLocation();
  
  // All hooks must be called before any conditional returns
  const [issuerName, setIssuerName] = useState("");
  const [issuerAddress, setIssuerAddress] = useState("");
  const [issuerEmail, setIssuerEmail] = useState("");
  const [issuerTaxId, setIssuerTaxId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientTaxId, setClientTaxId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateId(), description: "", quantity: 1, price: 0 }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check authentication - use existing cached data first
  const { data: user, isLoading: authLoading, isFetching } = useQuery<any>({
    queryKey: ["/api/user"],
    retry: 2,
    staleTime: 60000,
    gcTime: 300000,
  });
  
  // Only show loading on initial load, not refetches
  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  
  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Acceso Requerido</h2>
          <p className="text-muted-foreground text-sm mb-4">Inicia sesion para usar el generador de facturas.</p>
          <Button onClick={() => setLocation("/auth/login")} className="bg-accent text-accent-foreground rounded-full px-6">
            Iniciar Sesion
          </Button>
        </div>
      </div>
    );
  }

  const addItem = () => {
    setItems([...items, { id: generateId(), description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const currencySymbol = currency === "EUR" ? "E" : currency === "USD" ? "$" : "L";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const generatePDF = async () => {
    if (!issuerName || !clientName || items.some(i => !i.description)) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsGenerating(true);

    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFillColor(14, 18, 21);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(110, 220, 138);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURA', 20, 30);
      
      doc.setTextColor(247, 247, 245);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`No: ${invoiceNumber || '-'}`, pageWidth - 20, 20, { align: 'right' });
      doc.text(`Fecha: ${formatDate(invoiceDate)}`, pageWidth - 20, 28, { align: 'right' });
      if (dueDate) {
        doc.text(`Vence: ${formatDate(dueDate)}`, pageWidth - 20, 36, { align: 'right' });
      }

      let yPos = 60;
      
      doc.setTextColor(110, 220, 138);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('DE:', 20, yPos);
      
      doc.setTextColor(14, 18, 21);
      doc.setFontSize(11);
      doc.text(issuerName, 20, yPos + 8);
      
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let issuerY = yPos + 16;
      if (issuerAddress) {
        const addressLines = doc.splitTextToSize(issuerAddress, 70);
        doc.text(addressLines, 20, issuerY);
        issuerY += addressLines.length * 5;
      }
      if (issuerEmail) { doc.text(issuerEmail, 20, issuerY); issuerY += 5; }
      if (issuerTaxId) { doc.text(`ID Fiscal: ${issuerTaxId}`, 20, issuerY); }

      doc.setTextColor(110, 220, 138);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PARA:', 110, yPos);
      
      doc.setTextColor(14, 18, 21);
      doc.setFontSize(11);
      doc.text(clientName, 110, yPos + 8);
      
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let clientY = yPos + 16;
      if (clientAddress) {
        const addressLines = doc.splitTextToSize(clientAddress, 70);
        doc.text(addressLines, 110, clientY);
        clientY += addressLines.length * 5;
      }
      if (clientEmail) { doc.text(clientEmail, 110, clientY); clientY += 5; }
      if (clientTaxId) { doc.text(`ID Fiscal: ${clientTaxId}`, 110, clientY); }

      yPos = Math.max(issuerY, clientY) + 20;

      doc.setFillColor(247, 247, 245);
      doc.rect(15, yPos, pageWidth - 30, 10, 'F');
      
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPCION', 20, yPos + 7);
      doc.text('CANT.', 130, yPos + 7);
      doc.text('PRECIO', 150, yPos + 7);
      doc.text('TOTAL', 175, yPos + 7);

      yPos += 15;
      doc.setTextColor(14, 18, 21);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      items.forEach((item) => {
        const total = item.quantity * item.price;
        const descLines = doc.splitTextToSize(item.description, 100);
        doc.text(descLines, 20, yPos);
        doc.text(String(item.quantity), 130, yPos);
        doc.text(`${item.price.toFixed(2)}`, 150, yPos);
        doc.text(`${total.toFixed(2)}`, 175, yPos);
        yPos += Math.max(descLines.length * 5, 8);
      });

      yPos += 5;
      doc.setDrawColor(230, 233, 236);
      doc.line(15, yPos, pageWidth - 15, yPos);
      yPos += 10;

      doc.setFillColor(14, 18, 21);
      doc.rect(130, yPos, 60, 15, 'F');
      doc.setTextColor(247, 247, 245);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', 135, yPos + 10);
      doc.text(`${subtotal.toFixed(2)} ${currency}`, 185, yPos + 10, { align: 'right' });

      if (notes) {
        yPos += 30;
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTAS:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(notes, 100);
        doc.text(noteLines, 20, yPos + 6);
      }

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(7);
      doc.text('Generado con Easy US LLC', pageWidth / 2, 285, { align: 'center' });

      doc.save(`factura-${invoiceNumber || Date.now()}.pdf`);
      setIsGenerating(false);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      alert('Error al generar el PDF');
    }
  };

  return (
    <div className="min-h-screen bg-background bg-green-gradient-subtle flex flex-col overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:py-10 pb-20">
        <div className="mb-6 md:mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Volver al dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Generador de Facturas</h1>
              <p className="text-muted-foreground text-xs md:text-sm">Crea facturas profesionales</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-sm md:text-base font-semibold text-accent">Emisor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="issuerName" className="text-xs md:text-sm">Nombre / Empresa *</Label>
                  <Input
                    id="issuerName"
                    value={issuerName}
                    onChange={(e) => setIssuerName(e.target.value)}
                    placeholder="Tu nombre o empresa"
                    className="mt-1"
                    data-testid="input-issuer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="issuerAddress" className="text-xs md:text-sm">Direccion</Label>
                  <Textarea
                    id="issuerAddress"
                    value={issuerAddress}
                    onChange={(e) => setIssuerAddress(e.target.value)}
                    placeholder="Direccion completa"
                    rows={2}
                    className="mt-1 resize-none"
                    data-testid="input-issuer-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="issuerEmail" className="text-xs md:text-sm">Email</Label>
                    <Input
                      id="issuerEmail"
                      type="email"
                      value={issuerEmail}
                      onChange={(e) => setIssuerEmail(e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="mt-1"
                      data-testid="input-issuer-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuerTaxId" className="text-xs md:text-sm">ID Fiscal</Label>
                    <Input
                      id="issuerTaxId"
                      value={issuerTaxId}
                      onChange={(e) => setIssuerTaxId(e.target.value)}
                      placeholder="12345678A"
                      className="mt-1"
                      data-testid="input-issuer-tax-id"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="text-sm md:text-base font-semibold text-accent">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="clientName" className="text-xs md:text-sm">Nombre / Empresa *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="mt-1"
                    data-testid="input-client-name"
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress" className="text-xs md:text-sm">Direccion</Label>
                  <Textarea
                    id="clientAddress"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Direccion completa"
                    rows={2}
                    className="mt-1 resize-none"
                    data-testid="input-client-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="clientEmail" className="text-xs md:text-sm">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="mt-1"
                      data-testid="input-client-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientTaxId" className="text-xs md:text-sm">ID Fiscal</Label>
                    <Input
                      id="clientTaxId"
                      value={clientTaxId}
                      onChange={(e) => setClientTaxId(e.target.value)}
                      placeholder="12345678A"
                      className="mt-1"
                      data-testid="input-client-tax-id"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base font-semibold text-accent">Detalles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="invoiceNumber" className="text-xs md:text-sm">No Factura</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="2024-001"
                    className="mt-1"
                    data-testid="input-invoice-number"
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate" className="text-xs md:text-sm">Fecha *</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="mt-1"
                    data-testid="input-invoice-date"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate" className="text-xs md:text-sm">Vencimiento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1"
                    data-testid="input-due-date"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-xs md:text-sm">Moneda</Label>
                  <NativeSelect
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1"
                    data-testid="select-currency"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </NativeSelect>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 md:pb-4 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm md:text-base font-semibold text-accent">Conceptos</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="h-8 text-xs"
                data-testid="button-add-item"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Anadir
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-12 gap-3 text-xs text-muted-foreground font-medium px-1">
                  <div className="col-span-6">Descripcion *</div>
                  <div className="col-span-2">Cantidad</div>
                  <div className="col-span-3">Precio ({currencySymbol})</div>
                  <div className="col-span-1"></div>
                </div>
                {items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 md:gap-3 items-center">
                    <div className="col-span-12 md:col-span-6">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Descripcion del servicio"
                        data-testid={`input-item-description-${index}`}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        data-testid={`input-item-quantity-${index}`}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        data-testid={`input-item-price-${index}`}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <div className="text-right">
                  <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground" data-testid="text-total">
                    {subtotal.toFixed(2)} {currencySymbol}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-base font-semibold text-accent">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condiciones de pago, instrucciones..."
                rows={2}
                className="resize-none"
                data-testid="input-notes"
              />
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-3 pt-4">
            <Button
              size="lg"
              onClick={generatePDF}
              disabled={isGenerating}
              className="w-full md:w-auto px-8 h-12 text-base font-semibold"
              data-testid="button-generate-pdf"
            >
              <FileDown className="w-5 h-5 mr-2" />
              {isGenerating ? 'Generando...' : 'Descargar PDF'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              La factura se genera en tu dispositivo y no se guarda en nuestros servidores.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
