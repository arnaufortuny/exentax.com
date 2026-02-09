import { useState, useEffect, useMemo } from "react";
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
import { Calendar, CheckCircle, XCircle, Plus, Edit, Trash2, User, ChevronUp, X } from "@/components/icons";
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
  t('consultations.admin.days.sunday'),
  t('consultations.admin.days.monday'),
  t('consultations.admin.days.tuesday'),
  t('consultations.admin.days.wednesday'),
  t('consultations.admin.days.thursday'),
  t('consultations.admin.days.friday'),
  t('consultations.admin.days.saturday')
];

interface AdminConsultationsPanelProps {
  searchQuery?: string;
}

export function AdminConsultationsPanel({ searchQuery = '' }: AdminConsultationsPanelProps) {
  const { t, i18n } = useTranslation();
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

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
      setFormMessage({ type: 'success', text: t('consultations.admin.toasts.typeCreated') });
      setShowTypeForm(false);
      resetTypeForm();
    },
    onError: (err: any) => setFormMessage({ type: 'error', text: t('common.error') + ". " + err.message })
  });

  const updateTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/consultations/types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/types"] });
      setFormMessage({ type: 'success', text: t('consultations.admin.toasts.typeUpdated') });
      setShowTypeForm(false);
      resetTypeForm();
    }
  });

  const deleteTypeMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/consultations/types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/types"] });
      setFormMessage({ type: 'success', text: t('consultations.admin.toasts.typeDeleted') });
    }
  });

  const createSlotMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/consultations/availability", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/availability"] });
      setFormMessage({ type: 'success', text: t('consultations.admin.toasts.scheduleAdded') });
      setShowSlotForm(false);
    }
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/consultations/availability/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/availability"] });
      setFormMessage({ type: 'success', text: t('consultations.admin.toasts.scheduleRemoved') });
    }
  });

  const addBlockedDateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/consultations/blocked-dates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/blocked-dates"] });
      setFormMessage({ type: 'success', text: t('consultations.admin.toasts.dateBlocked') });
      setBlockedDateForm({ date: '', reason: '' });
    }
  });

  const deleteBlockedDateMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/consultations/blocked-dates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/blocked-dates"] });
      setFormMessage({ type: 'success', text: t('consultations.admin.toasts.dateUnblocked') });
    }
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/consultations/bookings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/consultations/stats"] });
      setFormMessage({ type: 'success', text: t('consultations.admin.toasts.bookingUpdated') });
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

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const query = searchQuery.toLowerCase().trim();
    return bookings.filter(({ booking, user }) => {
      const code = (booking.bookingCode || '').toLowerCase();
      const clientId = (user.clientId || '').toLowerCase();
      const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const topic = (booking.mainTopic || '').toLowerCase();
      return code.includes(query) || clientId.includes(query) || name.includes(query) || email.includes(query) || topic.includes(query);
    });
  }, [bookings, searchQuery]);

  return (
    <div className="space-y-4">
      {formMessage && (
        <div className={`mb-4 p-3 rounded-xl text-center text-sm font-medium ${
          formMessage.type === 'error' 
            ? 'bg-destructive/10 border border-destructive/20 text-destructive' 
            : formMessage.type === 'success'
            ? 'bg-accent/10 border border-accent/20 text-accent'
            : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
        }`} data-testid="form-message">
          {formMessage.text}
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 border-2 border-green-500/30 rounded-xl" data-testid="stat-pending">
          <div className="text-xs text-muted-foreground">{t('consultations.admin.stats.pending')}</div>
          <div className="text-2xl font-black text-yellow-600">{stats?.pending || 0}</div>
        </Card>
        <Card className="p-3 border-2 border-green-500/30 rounded-xl" data-testid="stat-confirmed">
          <div className="text-xs text-muted-foreground">{t('consultations.admin.stats.confirmed')}</div>
          <div className="text-2xl font-black text-blue-600">{stats?.confirmed || 0}</div>
        </Card>
        <Card className="p-3 border-2 border-green-500/30 rounded-xl" data-testid="stat-completed">
          <div className="text-xs text-muted-foreground">{t('consultations.admin.stats.completed')}</div>
          <div className="text-2xl font-black text-green-600">{stats?.completed || 0}</div>
        </Card>
        <Card className="p-3 border-2 border-green-500/30 rounded-xl" data-testid="stat-total">
          <div className="text-xs text-muted-foreground">{t('consultations.admin.stats.total')}</div>
          <div className="text-2xl font-black">{stats?.total || 0}</div>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['bookings', 'types', 'availability', 'blocked'] as const).map(tab => (
          <Button key={tab}
            variant={activeSubTab === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSubTab(tab)}
            className={activeSubTab === tab ? 'bg-accent text-primary rounded-full' : 'rounded-full'}
          >
            {tab === 'bookings' && t('consultations.admin.tabs.bookings')}
            {tab === 'types' && t('consultations.admin.tabs.types')}
            {tab === 'availability' && t('consultations.admin.tabs.availability')}
            {tab === 'blocked' && t('consultations.admin.tabs.blocked')}
          </Button>
        ))}
      </div>

      {activeSubTab === 'bookings' && (
        <div className="space-y-3">
        <Card className="p-0 overflow-hidden">
          <div className="divide-y">
            {filteredBookings.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                {t('consultations.admin.noBookings')}
              </div>
            ) : (
              filteredBookings.map(({ booking, consultationType, user }) => {
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
                              {t('consultations.admin.topic')}: {booking.mainTopic}
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
                              {t('consultations.admin.confirm')}
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
                              {t('consultations.cancel')}
                            </Button>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => updateBookingMutation.mutate({ id: booking.id, data: { status: 'completed' } })}
                            >
                              {t('consultations.admin.complete')}
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
                              <Label className="text-muted-foreground">{t('consultations.admin.code')}</Label>
                              <div className="font-mono font-bold">{booking.bookingCode}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.client')}</Label>
                              <div>{user.firstName} {user.lastName}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('common.email')}</Label>
                              <div>{user.email}</div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.date')}</Label>
                              <div>{formatDate(booking.scheduledDate)} {booking.scheduledTime}</div>
                            </div>
                          </div>
                          {booking.mainTopic && (
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.mainTopic')}</Label>
                              <div className="text-sm">{booking.mainTopic}</div>
                            </div>
                          )}
                          {booking.additionalNotes && (
                            <div>
                              <Label className="text-muted-foreground">{t('consultations.admin.clientNotes')}</Label>
                              <div className="text-sm">{booking.additionalNotes}</div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>{t('consultations.admin.meetingLink')}</Label>
                            <div className="flex gap-2">
                              <Input placeholder={t('consultations.admin.meetingLinkPlaceholder')}
                                value={meetingLinkValue}
                                onChange={(e) => setMeetingLinkValue(e.target.value)}
                                className="flex-1 rounded-full"
                              />
                              <Button onClick={() => updateBookingMutation.mutate({ id: booking.id, data: { meetingLink: meetingLinkValue } })}
                                className="bg-accent text-primary font-black rounded-full"
                              >
                                {t('consultations.admin.save')}
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
        </div>
      )}

      {activeSubTab === 'types' && (
        <div className="space-y-4">
          {!showTypeForm && (
            <Button onClick={() => { resetTypeForm(); setShowTypeForm(true); }} className="bg-accent text-primary font-black rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('consultations.admin.newType')}
            </Button>
          )}
          
          {showTypeForm && (
            <Card className="p-4 border-2 border-accent/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">
                  {editingType ? t('consultations.admin.editType') : t('consultations.admin.newConsultationType')}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => { setShowTypeForm(false); resetTypeForm(); }} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.nameEs')}</Label>
                    <Input className="rounded-full" value={typeForm.nameEs} onChange={(e) => setTypeForm({ ...typeForm, nameEs: e.target.value, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.nameEn')}</Label>
                    <Input className="rounded-full" value={typeForm.nameEn} onChange={(e) => setTypeForm({ ...typeForm, nameEn: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('consultations.admin.nameCa')}</Label>
                  <Input className="rounded-full" value={typeForm.nameCa} onChange={(e) => setTypeForm({ ...typeForm, nameCa: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t('consultations.admin.descriptionEs')}</Label>
                  <Textarea className="rounded-3xl" value={typeForm.descriptionEs} onChange={(e) => setTypeForm({ ...typeForm, descriptionEs: e.target.value, description: e.target.value })} rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.durationMin')}</Label>
                    <Input type="number" className="rounded-full" value={typeForm.duration} onChange={(e) => setTypeForm({ ...typeForm, duration: parseInt(e.target.value) || 30 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.priceEur')}</Label>
                    <Input type="number" className="rounded-full" value={typeForm.price} onChange={(e) => setTypeForm({ ...typeForm, price: parseInt(e.target.value) || 0 })} placeholder="0" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" className="rounded-full" onClick={() => { setShowTypeForm(false); resetTypeForm(); }}>
                    {t('consultations.cancel')}
                  </Button>
                  <Button onClick={handleSaveType} className="bg-accent text-primary font-black rounded-full">
                    {editingType ? t('consultations.admin.save') : t('consultations.admin.create')}
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
                        {type.isActive ? t('consultations.admin.active') : t('consultations.admin.inactive')}
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
            <Button onClick={() => setShowSlotForm(true)} className="bg-accent text-primary font-black rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('consultations.admin.addSchedule')}
            </Button>
          )}
          
          {showSlotForm && (
            <Card className="p-4 border-2 border-accent/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">{t('consultations.admin.addSchedule')}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSlotForm(false)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('consultations.admin.day')}</Label>
                  <NativeSelect className="rounded-full" value={slotForm.dayOfWeek.toString()} onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: parseInt(e.target.value) })}>
                    {getDays(t).map((day, idx) => (
                      <NativeSelectItem key={idx} value={idx.toString()}>{day}</NativeSelectItem>
                    ))}
                  </NativeSelect>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.start')}</Label>
                    <Input type="time" className="rounded-full" value={slotForm.startTime} onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('consultations.admin.end')}</Label>
                    <Input type="time" className="rounded-full" value={slotForm.endTime} onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" className="rounded-full" onClick={() => setShowSlotForm(false)}>
                    {t('consultations.cancel')}
                  </Button>
                  <Button onClick={() => createSlotMutation.mutate(slotForm)} className="bg-accent text-primary font-black rounded-full">
                    {t('consultations.admin.add')}
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
              <Input type="date"
                value={blockedDateForm.date}
                onChange={(e) => setBlockedDateForm({ ...blockedDateForm, date: e.target.value })}
                className="w-40 rounded-full"
              />
              <Input placeholder={t('consultations.admin.reasonOptional')}
                value={blockedDateForm.reason}
                onChange={(e) => setBlockedDateForm({ ...blockedDateForm, reason: e.target.value })}
                className="flex-1 rounded-full"
              />
              <Button onClick={() => addBlockedDateMutation.mutate(blockedDateForm)}
                disabled={!blockedDateForm.date}
                className="bg-accent text-primary font-black rounded-full"
              >
                {t('consultations.admin.block')}
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
