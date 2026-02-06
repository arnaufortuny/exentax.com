import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, CheckCircle, XCircle, Plus, Edit, Trash2, User, ChevronUp, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConsultationType, ConsultationBooking, getConsultationStatusLabel } from "./types";

interface BookingWithDetails {
  booking: ConsultationBooking;
  consultationType: ConsultationType;
  user: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    clientId?: string | null;
  };
}

interface AvailabilitySlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BlockedDate {
  id: number;
  date: string;
  reason?: string | null;
}

interface ConsultationStats {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}

const getDays = (t: any) => [
  t('consultations.admin.days.sunday', 'Domingo'),
  t('consultations.admin.days.monday', 'Lunes'),
  t('consultations.admin.days.tuesday', 'Martes'),
  t('consultations.admin.days.wednesday', 'Miércoles'),
  t('consultations.admin.days.thursday', 'Jueves'),
  t('consultations.admin.days.friday', 'Viernes'),
  t('consultations.admin.days.saturday', 'Sábado')
];

export function AdminConsultationsPanel() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'types' | 'availability' | 'blocked'>('bookings');
  const [editingType, setEditingType] = useState<ConsultationType | null>(null);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const [meetingLinkValue, setMeetingLinkValue] = useState('');
  const [typeForm, setTypeForm] = useState({
    name: '', nameEs: '', nameEn: '', nameCa: '',
    description: '', descriptionEs: '', descriptionEn: '', descriptionCa: '',
    duration: 30, price: 0, isActive: true
  });
  const [slotForm, setSlotForm] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' });
  const [blockedDateForm, setBlockedDateForm] = useState({ date: '', reason: '' });

  const { data: stats } = useQuery<ConsultationStats>({
    queryKey: ["/api/admin/consultations/stats"],
  });

  const { data: bookings = [] } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/admin/consultations/bookings"],
  });

  const { data: types = [] } = useQuery<ConsultationType[]>({
    queryKey: ["/api/admin/consultations/types"],
  });

  const { data: availability = [] } = useQuery<AvailabilitySlot[]>({
    queryKey: ["/api/admin/consultations/availability"],
  });

  const { data: blockedDates = [] } = useQuery<BlockedDate[]>({
    queryKey: ["/api/admin/consultations/blocked-dates"],
  });

  const createTypeMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/consultations/types", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/types"] });
      toast({ title: t('consultations.admin.toasts.typeCreated', 'Tipo creado correctamente') });
      setShowTypeForm(false);
      resetTypeForm();
    },
    onError: (err: any) => toast({ title: t('common.error', 'Error'), description: err.message, variant: "destructive" })
  });

  const updateTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/consultations/types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/types"] });
      toast({ title: t('consultations.admin.toasts.typeUpdated', 'Tipo actualizado') });
      setShowTypeForm(false);
      resetTypeForm();
    }
  });

  const deleteTypeMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/consultations/types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/types"] });
      toast({ title: t('consultations.admin.toasts.typeDeleted', 'Tipo eliminado') });
    }
  });

  const createSlotMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/consultations/availability", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/availability"] });
      toast({ title: t('consultations.admin.toasts.scheduleAdded', 'Horario añadido') });
      setShowSlotForm(false);
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/consultations/availability/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/availability"] });
      toast({ title: t('consultations.admin.toasts.scheduleRemoved', 'Horario eliminado') });
    }
  });

  const addBlockedDateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/consultations/blocked-dates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/blocked-dates"] });
      toast({ title: t('consultations.admin.toasts.dateBlocked', 'Fecha bloqueada') });
      setBlockedDateForm({ date: '', reason: '' });
    }
  });

  const deleteBlockedDateMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/consultations/blocked-dates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/blocked-dates"] });
      toast({ title: t('consultations.admin.toasts.dateUnblocked', 'Fecha desbloqueada') });
    }
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/consultations/bookings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/stats"] });
      toast({ title: t('consultations.admin.toasts.bookingUpdated', 'Reserva actualizada') });
      setExpandedBookingId(null);
    }
  });

  const resetTypeForm = () => {
    setEditingType(null);
    setTypeForm({
      name: '', nameEs: '', nameEn: '', nameCa: '',
      description: '', descriptionEs: '', descriptionEn: '', descriptionCa: '',
      duration: 30, price: 0, isActive: true
    });
  };

  const handleEditType = (type: ConsultationType) => {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      nameEs: type.nameEs,
      nameEn: type.nameEn,
      nameCa: type.nameCa,
      description: type.description || '',
      descriptionEs: type.descriptionEs || '',
      descriptionEn: type.descriptionEn || '',
      descriptionCa: type.descriptionCa || '',
      duration: type.duration,
      price: type.price,
      isActive: type.isActive
    });
    setShowTypeForm(true);
  };

  const handleSaveType = () => {
    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.id, data: typeForm });
    } else {
      createTypeMutation.mutate(typeForm);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLocalizedName = (type: ConsultationType) => {
    const lang = i18n.language;
    if (lang === 'es') return type.nameEs;
    if (lang === 'ca') return type.nameCa;
    return type.nameEn;
  };

  const handleExpandBooking = (bookingId: number, meetingLink?: string | null) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(bookingId);
      setMeetingLinkValue(meetingLink || '');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">{t('consultations.admin.stats.pending', 'Pendientes')}</div>
          <div className="text-2xl font-black text-yellow-600">{stats?.pending || 0}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">{t('consultations.admin.stats.confirmed', 'Confirmadas')}</div>
          <div className="text-2xl font-black text-blue-600">{stats?.confirmed || 0}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">{t('consultations.admin.stats.completed', 'Completadas')}</div>
          <div className="text-2xl font-black text-green-600">{stats?.completed || 0}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">{t('consultations.admin.stats.total', 'Total')}</div>
          <div className="text-2xl font-black">{stats?.total || 0}</div>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['bookings', 'types', 'availability', 'blocked'] as const).map(tab => (
          <Button
            key={tab}
            variant={activeSubTab === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSubTab(tab)}
            className={activeSubTab === tab ? 'bg-accent text-primary rounded-full' : 'rounded-full'}
          >
            {tab === 'bookings' && t('consultations.admin.tabs.bookings', 'Reservas')}
            {tab === 'types' && t('consultations.admin.tabs.types', 'Tipos')}
            {tab === 'availability' && t('consultations.admin.tabs.availability', 'Horarios')}
            {tab === 'blocked' && t('consultations.admin.tabs.blocked', 'Bloqueados')}
          </Button>
        ))}
      </div>

      {activeSubTab === 'bookings' && (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y">
            {bookings.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                {t('consultations.admin.noBookings', 'No hay reservas de consultas')}
              </div>
            ) : (
              bookings.map(({ booking, consultationType, user }) => {
                const statusInfo = getConsultationStatusLabel(booking.status, t);
                const isExpanded = expandedBookingId === booking.id;
                return (
                  <div key={booking.id} className="hover:bg-muted/50">
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold">{getLocalizedName(consultationType)}</span>
                            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-full">{booking.bookingCode}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(booking.scheduledDate)} {booking.scheduledTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {user.firstName} {user.lastName} ({user.email})
                            </span>
                          </div>
                          {booking.mainTopic && (
                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                              {t('consultations.admin.topic', 'Tema')}: {booking.mainTopic}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 rounded-full"
                              onClick={() => updateBookingMutation.mutate({ id: booking.id, data: { status: 'confirmed' } })}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t('consultations.admin.confirm', 'Confirmar')}
                            </Button>
                          )}
                          {['pending', 'confirmed'].includes(booking.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 rounded-full"
                              onClick={() => updateBookingMutation.mutate({ id: booking.id, data: { status: 'cancelled' } })}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {t('consultations.cancel', 'Cancelar')}
                            </Button>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => updateBookingMutation.mutate({ id: booking.id, data: { status: 'completed' } })}
                            >
                              {t('consultations.admin.complete', 'Completar')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                            onClick={() => handleExpandBooking(booking.id, booking.meetingLink)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                        <div className="pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.code', 'Código')}</Label>
                              <div className="font-mono font-bold">{booking.bookingCode}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.client', 'Cliente')}</Label>
                              <div>{user.firstName} {user.lastName}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('common.email', 'Email')}</Label>
                              <div>{user.email}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.date', 'Fecha')}</Label>
                              <div>{formatDate(booking.scheduledDate)} {booking.scheduledTime}</div>
                            </div>
                          </div>
                          {booking.mainTopic && (
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.mainTopic', 'Tema principal')}</Label>
                              <div className="text-sm">{booking.mainTopic}</div>
                            </div>
                          )}
                          {booking.additionalNotes && (
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.clientNotes', 'Notas del cliente')}</Label>
                              <div className="text-sm">{booking.additionalNotes}</div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>{t('consultations.admin.meetingLink', 'Link de reunión')}</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder={t('consultations.admin.meetingLinkPlaceholder', 'https://meet.google.com/...')}
                                value={meetingLinkValue}
                                onChange={(e) => setMeetingLinkValue(e.target.value)}
                                className="flex-1 rounded-full"
                              />
                              <Button
                                onClick={() => updateBookingMutation.mutate({ id: booking.id, data: { meetingLink: meetingLinkValue } })}
                                className="bg-accent text-primary font-bold rounded-full"
                              >
                                {t('consultations.admin.save', 'Guardar')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {activeSubTab === 'types' && (
        <div className="space-y-4">
          {!showTypeForm && (
            <Button onClick={() => { resetTypeForm(); setShowTypeForm(true); }} className="bg-accent text-primary font-bold rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('consultations.admin.newType', 'Nuevo Tipo')}
            </Button>
          )}
          
          {showTypeForm && (
            <Card className="p-4 border-2 border-accent/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">
                  {editingType ? t('consultations.admin.editType', 'Editar Tipo') : t('consultations.admin.newConsultationType', 'Nuevo Tipo de Consulta')}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowTypeForm(false); resetTypeForm(); }} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.nameEs', 'Nombre (ES)')}</Label>
                    <Input className="rounded-full" value={typeForm.nameEs} onChange={(e) => setTypeForm({ ...typeForm, nameEs: e.target.value, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.nameEn', 'Nombre (EN)')}</Label>
                    <Input className="rounded-full" value={typeForm.nameEn} onChange={(e) => setTypeForm({ ...typeForm, nameEn: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('consultations.admin.nameCa', 'Nombre (CA)')}</Label>
                  <Input className="rounded-full" value={typeForm.nameCa} onChange={(e) => setTypeForm({ ...typeForm, nameCa: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('consultations.admin.descriptionEs', 'Descripción (ES)')}</Label>
                  <Textarea className="rounded-xl" value={typeForm.descriptionEs} onChange={(e) => setTypeForm({ ...typeForm, descriptionEs: e.target.value, description: e.target.value })} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.durationMin', 'Duración (min)')}</Label>
                    <Input type="number" className="rounded-full" value={typeForm.duration} onChange={(e) => setTypeForm({ ...typeForm, duration: parseInt(e.target.value) || 30 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.priceCents', 'Precio (cents)')}</Label>
                    <Input type="number" className="rounded-full" value={typeForm.price} onChange={(e) => setTypeForm({ ...typeForm, price: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" className="rounded-full" onClick={() => { setShowTypeForm(false); resetTypeForm(); }}>
                    {t('consultations.cancel', 'Cancelar')}
                  </Button>
                  <Button onClick={handleSaveType} className="bg-accent text-primary font-black rounded-full">
                    {editingType ? t('consultations.admin.save', 'Guardar') : t('consultations.admin.create', 'Crear')}
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          <div className="grid gap-3">
            {types.map(type => (
              <Card key={type.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{type.nameEs}</span>
                      <Badge variant={type.isActive ? 'default' : 'secondary'}>
                        {type.isActive ? t('consultations.admin.active', 'Activo') : t('consultations.admin.inactive', 'Inactivo')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {type.duration} min • {(type.price / 100).toFixed(2)}€
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => handleEditType(type)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 rounded-full" onClick={() => deleteTypeMutation.mutate(type.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'availability' && (
        <div className="space-y-4">
          {!showSlotForm && (
            <Button onClick={() => setShowSlotForm(true)} className="bg-accent text-primary font-bold rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('consultations.admin.addSchedule', 'Añadir Horario')}
            </Button>
          )}
          
          {showSlotForm && (
            <Card className="p-4 border-2 border-accent/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">{t('consultations.admin.addSchedule', 'Añadir Horario')}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSlotForm(false)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('consultations.admin.day', 'Día')}</Label>
                  <NativeSelect className="rounded-full" value={slotForm.dayOfWeek.toString()} onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: parseInt(e.target.value) })}>
                    {getDays(t).map((day, idx) => (
                      <NativeSelectItem key={idx} value={idx.toString()}>{day}</NativeSelectItem>
                    ))}
                  </NativeSelect>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.start', 'Inicio')}</Label>
                    <Input type="time" className="rounded-full" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.end', 'Fin')}</Label>
                    <Input type="time" className="rounded-full" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" className="rounded-full" onClick={() => setShowSlotForm(false)}>
                    {t('consultations.cancel', 'Cancelar')}
                  </Button>
                  <Button onClick={() => createSlotMutation.mutate(slotForm)} className="bg-accent text-primary font-black rounded-full">
                    {t('consultations.admin.add', 'Añadir')}
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          <div className="grid gap-2">
            {getDays(t).map((day, dayIndex) => {
              const daySlots = availability.filter(s => s.dayOfWeek === dayIndex);
              if (daySlots.length === 0) return null;
              return (
                <Card key={dayIndex} className="p-3">
                  <div className="font-bold text-sm mb-2">{day}</div>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map(slot => (
                      <Badge key={slot.id} variant="outline" className="flex items-center gap-1 rounded-full">
                        {slot.startTime} - {slot.endTime}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-4 w-4 ml-1 rounded-full"
                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                        >
                          <XCircle className="w-3 h-3 text-red-500" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'blocked' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex gap-2 flex-wrap">
              <Input
                type="date"
                value={blockedDateForm.date}
                onChange={(e) => setBlockedDateForm({ ...blockedDateForm, date: e.target.value })}
                className="w-40 rounded-full"
              />
              <Input
                placeholder={t('consultations.admin.reasonOptional', 'Motivo (opcional)')}
                value={blockedDateForm.reason}
                onChange={(e) => setBlockedDateForm({ ...blockedDateForm, reason: e.target.value })}
                className="flex-1 rounded-full"
              />
              <Button
                onClick={() => addBlockedDateMutation.mutate(blockedDateForm)}
                disabled={!blockedDateForm.date}
                className="bg-accent text-primary font-bold rounded-full"
              >
                {t('consultations.admin.block', 'Bloquear')}
              </Button>
            </div>
          </Card>
          <div className="grid gap-2">
            {blockedDates.map(blocked => (
              <Card key={blocked.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold">{formatDate(blocked.date)}</span>
                  {blocked.reason && <span className="text-sm text-muted-foreground ml-2">- {blocked.reason}</span>}
                </div>
                <Button size="sm" variant="ghost" className="text-red-600 rounded-full" onClick={() => deleteBlockedDateMutation.mutate(blocked.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
