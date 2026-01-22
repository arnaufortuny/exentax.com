import { useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { LlcApplication, ApplicationDocument } from "@shared/schema";
import { buildUrl } from "@shared/routes";
import { api } from "@shared/routes";

import { HelpSection } from "@/components/layout/help-section";

type ApplicationWithDocuments = LlcApplication & { documents: ApplicationDocument[] };

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-gray-200 text-gray-700" },
  pending: { label: "Pendiente de revisión", color: "bg-yellow-100 text-yellow-800" },
  in_review: { label: "En revisión", color: "bg-blue-100 text-blue-800" },
  processing: { label: "Procesando", color: "bg-brand-dark/10 text-brand-dark" },
  submitted: { label: "Enviado al estado", color: "bg-indigo-100 text-indigo-800" },
  completed: { label: "Completado", color: "bg-brand-lime text-brand-dark" },
  rejected: { label: "Rechazado", color: "bg-red-100 text-red-800" },
};

import { HeroSection } from "@/components/layout/hero-section";

export default function Consulta() {
  const [requestCode, setRequestCode] = useState("");
  const [application, setApplication] = useState<ApplicationWithDocuments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!requestCode.trim()) {
      setError("Por favor, ingresa un código de solicitud");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildUrl(api.llc.getByCode.path, { code: requestCode.trim() }));
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Solicitud no encontrada. Verifica el código ingresado.");
        } else {
          setError("Error al buscar la solicitud. Intenta de nuevo.");
        }
        setApplication(null);
        return;
      }

      const data = await response.json();
      setApplication(data);
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.");
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string | null) => {
    if (!status) return statusLabels.draft;
    return statusLabels[status] || statusLabels.draft;
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "No disponible";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen font-sans bg-brand-cream">
      <Navbar />
      
      {/* Hero */}
      <HeroSection 
        title={
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-brand-dark uppercase tracking-tight leading-[1.1]">
            Consulta tu Solicitud
          </h1>
        }
        subtitle={
          <p className="text-lg sm:text-xl lg:text-2xl text-brand-dark/90 font-medium leading-relaxed max-w-2xl text-left mb-12 sm:mb-20">
            Ingresa tu código de solicitud para ver el estado de tu LLC
          </p>
        }
      />

      {/* Search Form */}
      <section className="py-8 sm:py-14">
        <div className="container max-w-2xl mx-auto px-5 sm:px-8">
          <Card className="border-brand-dark/10 bg-white">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-center">Buscar solicitud</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  data-testid="input-request-code"
                  placeholder="Ingresa tu código de solicitud (ej: REQ-ABC123)"
                  value={requestCode}
                  onChange={(e) => setRequestCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  data-testid="button-search"
                  onClick={handleSearch} 
                  disabled={loading}
                  className="rounded-full bg-brand-lime text-brand-dark font-semibold border-0"
                >
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
              {error && (
                <p data-testid="text-error" className="mt-3 text-sm text-red-600 text-center">{error}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Application Details */}
      {application && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="py-6 sm:py-10"
        >
          <div className="container max-w-4xl mx-auto px-5 sm:px-8">
            {/* Status Card */}
            <Card className="mb-6 border-brand-green/10 bg-white">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-base sm:text-lg">Estado de la Solicitud</CardTitle>
                <Badge data-testid="badge-status" className={`${getStatusInfo(application.status).color} border-0`}>
                  {getStatusInfo(application.status).label}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Código de solicitud</p>
                    <p data-testid="text-request-code" className="font-medium">{application.requestCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Última actualización</p>
                    <p data-testid="text-last-updated" className="font-medium">{formatDate(application.lastUpdated)}</p>
                  </div>
                  {application.submittedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Fecha de envío</p>
                      <p data-testid="text-submitted" className="font-medium">{formatDate(application.submittedAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="mb-6 border-brand-green/10 bg-white">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Información de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nombre de la LLC</p>
                    <p data-testid="text-company-name" className="font-medium">{application.companyName || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Categoría de negocio</p>
                    <p data-testid="text-category" className="font-medium">{application.businessCategory || "No especificada"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card className="mb-6 border-brand-green/10 bg-white">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Información del Propietario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nombre completo</p>
                    <p data-testid="text-owner-name" className="font-medium">
                      {application.ownerFullName || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p data-testid="text-owner-email" className="font-medium">{application.ownerEmail || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">País de residencia</p>
                    <p data-testid="text-owner-country" className="font-medium">{application.ownerCountry || "No especificado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="border-brand-dark/10 bg-white">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents && application.documents.length > 0 ? (
                  <div className="space-y-2">
                    {application.documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        data-testid={`document-item-${doc.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">{doc.documentType}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{doc.fileType}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p data-testid="text-no-documents" className="text-muted-foreground text-sm text-center py-4">
                    No hay documentos adjuntos
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              {application.status === "draft" && (
                <Link href={`/application/${application.id}`}>
                  <Button data-testid="button-continue-application" className="rounded-full w-full sm:w-auto">
                    Continuar solicitud
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button data-testid="button-back-home" variant="outline" className="rounded-full w-full sm:w-auto">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      {/* Help Section */}
      <HelpSection />

      <Footer />
    </div>
  );
}
