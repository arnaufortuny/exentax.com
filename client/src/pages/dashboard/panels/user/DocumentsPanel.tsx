import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getCsrfToken } from "@/lib/queryClient";
import { FileText, Clock, Download, Send, FileUp, Upload, X, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";

interface DocumentsPanelProps {
  user: any;
  notifications: any[];
  userDocuments: any[];
  canEdit: boolean;
  setFormMessage: (msg: { type: 'error' | 'success' | 'info'; text: string } | null) => void;
  tn: (text: string) => string;
  formatDate: (date: string | Date) => string;
}

export function DocumentsPanel({ user, notifications, userDocuments, canEdit, setFormMessage, tn, formatDate }: DocumentsPanelProps) {
  const { t } = useTranslation();
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; file: File | null }>({ open: false, file: null });
  const [uploadDocType, setUploadDocType] = useState("passport");
  const [uploadNotes, setUploadNotes] = useState("");

  const deleteDocMutation = useMutation({
    mutationFn: async (docId: number) => {
      setFormMessage(null);
      const endpoint = user?.isAdmin ? `/api/admin/documents/${docId}` : `/api/user/documents/${docId}`;
      const res = await apiRequest("DELETE", endpoint);
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotDelete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents"] });
      setFormMessage({ type: 'success', text: t("dashboard.toasts.documentDeleted") });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error?.message || t("dashboard.toasts.couldNotDelete")) });
    }
  });

  return (
    <div key="documents" className="space-y-6">
      <div className="mb-4 md:mb-6">
        <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">{t('dashboard.documents.title')}</h2>
        <p className="text-base text-muted-foreground mt-1">{t('dashboard.documents.subtitle')}</p>
      </div>
      
      {(() => {
        const actionRequiredNotifs = notifications?.filter((n: any) => n.type === 'action_required') || [];
        const docInReviewNotifs = notifications?.filter((n: any) => n.type === 'info' && (n.title || '').includes('docInReview')) || [];
        const hasActionRequired = actionRequiredNotifs.length > 0;
        const hasDocInReview = docInReviewNotifs.length > 0;
        
        if ((hasActionRequired || hasDocInReview) && user?.accountStatus !== 'deactivated') {
          return (
            <Card className={`rounded-2xl shadow-sm p-4 mb-4 ${hasActionRequired ? 'border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30' : 'border-2 border-accent/30 dark:border-accent/30 bg-accent/5 dark:bg-accent/10'}`} data-testid="card-doc-action-required">
              <div className="flex items-start gap-3">
                {hasActionRequired ? (
                  <FileUp className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-accent mt-0.5" />
                )}
                <div className="flex-1">
                  {hasActionRequired ? (
                    <>
                      <h4 className="font-black text-foreground text-sm">{t('dashboard.documents.requestedDocuments')}</h4>
                      <div className="mt-2 space-y-1">
                        {actionRequiredNotifs.map((n: any) => (
                          <p key={n.id} className="text-xs text-muted-foreground">{tn(n.message)}</p>
                        ))}
                      </div>
                      <div className="mt-3">
                        <label className="cursor-pointer">
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadDialog({ open: false, file });
                                setUploadDocType("other");
                                setUploadNotes("");
                              }
                            }}
                            data-testid="input-upload-document"
                          />
                          <Button variant="outline" className="rounded-full text-xs border-accent/50 dark:border-accent text-accent dark:text-accent" asChild>
                            <span><FileUp className="w-3 h-3 mr-1" /> {t('dashboard.documents.uploadDocument')}</span>
                          </Button>
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 className="font-black text-foreground text-sm">{t('dashboard.documents.underReview')}</h4>
                      <p className="text-xs text-muted-foreground mt-2">{t('dashboard.documents.underReviewDesc')}</p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        }
        return null;
      })()}
      
      {/* Subir documento inline sin dialogo */}
      <Card className="rounded-2xl border-2 border-dashed border-accent/50 bg-accent/5 p-4 md:p-6 mb-4">
        {!uploadDialog.file ? (
          <label className="cursor-pointer w-full block">
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadDialog({ open: false, file });
                  setUploadDocType("passport");
                  setUploadNotes("");
                }
              }}
              data-testid="input-upload-new-document"
            />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                <Upload className="w-7 h-7 md:w-8 md:h-8 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-foreground text-base md:text-lg">{t('dashboard.documents.uploadDocument')}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{t('dashboard.documents.maxSize')}</p>
              </div>
              <Button size="lg" className="rounded-full font-black bg-accent text-primary shrink-0" asChild>
                <span>
                  <FileUp className="w-5 h-5 md:mr-2" />
                  <span className="hidden md:inline">{t('dashboard.documents.uploadButton')}</span>
                </span>
              </Button>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-card rounded-xl">
              <FileUp className="w-8 h-8 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-foreground">{uploadDialog.file.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadDialog.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setUploadDialog({ open: false, file: null })}
                className="shrink-0 text-muted-foreground hover:text-red-500"
                data-testid="button-clear-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">{t('dashboard.documents.documentType')}</Label>
              <NativeSelect 
                value={uploadDocType} 
                onValueChange={setUploadDocType}
                className="w-full rounded-full h-11 px-4 border border-border dark:border-border bg-white dark:bg-card"
                data-testid="select-upload-doc-type-inline"
              >
                <NativeSelectItem value="passport">{t('dashboard.documents.passport')}</NativeSelectItem>
                <NativeSelectItem value="address_proof">{t('dashboard.documents.addressProof')}</NativeSelectItem>
                <NativeSelectItem value="tax_id">{t('dashboard.documents.taxId')}</NativeSelectItem>
                <NativeSelectItem value="other">{t('dashboard.documents.otherDocument')}</NativeSelectItem>
              </NativeSelect>
            </div>
            
            {uploadDocType === "other" && (
              <div>
                <Label className="text-xs font-semibold text-foreground mb-2 block">{t('dashboard.documents.description')}</Label>
                <Textarea value={uploadNotes} 
                  onChange={(e) => setUploadNotes(e.target.value)} 
                  placeholder={t('dashboard.documents.describePlaceholder')}
                  className="min-h-[70px] rounded-2xl border-border bg-background dark:bg-card text-base"
                  style={{ fontSize: '16px' }}
                  data-testid="input-upload-notes-inline"
                />
              </div>
            )}
            
            <Button onClick={async () => {
                if (!uploadDialog.file) return;
                const formData = new FormData();
                formData.append('file', uploadDialog.file);
                formData.append('documentType', uploadDocType);
                if (uploadDocType === 'other' && uploadNotes) {
                  formData.append('notes', uploadNotes);
                }
                try {
                  const csrfToken = await getCsrfToken();
                  const res = await fetch('/api/user/documents/upload', {
                    method: 'POST',
                    headers: { 'X-CSRF-Token': csrfToken },
                    body: formData,
                    credentials: 'include'
                  });
                  if (res.ok) {
                    setFormMessage({ type: 'success', text: t("dashboard.toasts.documentUploadedClient") + ". " + t("dashboard.toasts.documentUploadedClientDesc") });
                    queryClient.invalidateQueries({ queryKey: ['/api/user/documents'] });
                    setUploadDialog({ open: false, file: null });
                  } else {
                    const data = await res.json();
                    setFormMessage({ type: 'error', text: t("common.error") + ". " + (data.message || t("dashboard.toasts.couldNotUpload")) });
                  }
                } catch {
                  setFormMessage({ type: 'error', text: t("common.error") + ". " + t("dashboard.toasts.connectionError") });
                }
              }}
              disabled={uploadDocType === 'other' && !uploadNotes.trim()}
              className="w-full bg-accent text-accent-foreground font-black rounded-full h-12"
              data-testid="button-send-document"
            >
              <Send className="w-4 h-4 mr-2" /> {t('dashboard.documents.sendDocument')}
            </Button>
          </div>
        )}
      </Card>
      
      {userDocuments && userDocuments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-foreground">{t('dashboard.documents.myDocuments')}</h3>
          {userDocuments.map((doc: any) => {
            const docTypeLabels: Record<string, string> = {
              passport: t('dashboard.documents.passport'),
              address_proof: t('dashboard.documents.addressProof'),
              tax_id: t('dashboard.documents.taxId'),
              articles_of_organization: t('dashboard.documents.articlesOfOrg'),
              ein_letter: t('dashboard.documents.einLetter'),
              operating_agreement: t('dashboard.documents.operatingAgreement'),
              other: t('dashboard.documents.otherDocument'),
            };
            const statusConfig: Record<string, { label: string; className: string }> = {
              pending: { label: t('dashboard.documents.statusPending'), className: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' },
              approved: { label: t('dashboard.documents.statusApproved'), className: 'bg-accent/5 dark:bg-accent/10 text-accent dark:text-accent' },
              rejected: { label: t('dashboard.documents.statusRejected'), className: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
            };
            const status = statusConfig[doc.reviewStatus] || statusConfig.pending;
            const isRejected = doc.reviewStatus === 'rejected';
            
            return (
              <Card key={doc.id} className="rounded-xl md:rounded-2xl shadow-sm bg-white dark:bg-card" data-testid={`card-document-${doc.id}`}>
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-black text-foreground text-xs sm:text-sm truncate">{doc.fileName}</h4>
                        <Badge variant="secondary" className={`no-default-hover-elevate no-default-active-elevate text-[10px] font-bold shrink-0 ${status.className}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground mb-2 flex-wrap">
                        <span>{docTypeLabels[doc.documentType] || doc.documentType}</span>
                        <span>{formatDate(doc.uploadedAt || doc.createdAt)}</span>
                        {doc.uploader && (
                          <span className="text-accent">{doc.uploader.firstName} {doc.uploader.lastName}</span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="rounded-full font-bold text-[10px] md:text-xs" onClick={() => window.open(doc.fileUrl, "_blank")} data-testid={`button-download-doc-${doc.id}`}>
                          <Download className="w-3 h-3 mr-1" /> {t('dashboard.documents.download')}
                        </Button>
                        {isRejected && canEdit && (
                          <label className="cursor-pointer">
                            <input 
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('documentType', doc.documentType);
                                try {
                                  const csrfToken = await getCsrfToken();
                                  const res = await fetch('/api/user/documents/upload', {
                                    method: 'POST',
                                    headers: { 'X-CSRF-Token': csrfToken },
                                    body: formData,
                                    credentials: 'include'
                                  });
                                  if (res.ok) {
                                    setFormMessage({ type: 'success', text: t("dashboard.toasts.documentUploadedClient") });
                                    queryClient.invalidateQueries({ queryKey: ['/api/user/documents'] });
                                  } else {
                                    setFormMessage({ type: 'error', text: t("dashboard.toasts.couldNotUpload") });
                                  }
                                } catch {
                                  setFormMessage({ type: 'error', text: t("dashboard.toasts.connectionError") });
                                }
                              }}
                              data-testid={`input-reupload-doc-${doc.id}`}
                            />
                            <Button variant="outline" size="sm" className="rounded-full font-bold text-[10px] md:text-xs border-accent/50 dark:border-accent text-accent dark:text-accent" asChild>
                              <span><Upload className="w-3 h-3 mr-1" /> {t('dashboard.documents.uploadAgain')}</span>
                            </Button>
                          </label>
                        )}
                        {user?.isAdmin && (
                          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground shrink-0" onClick={() => deleteDocMutation.mutate(doc.id)} disabled={deleteDocMutation.isPending} data-testid={`button-delete-doc-${doc.id}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
