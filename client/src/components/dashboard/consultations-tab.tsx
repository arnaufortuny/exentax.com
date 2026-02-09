import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MessageSquare, ChevronDown, ChevronUp } from "@/components/icons";
import { ConsultationType, ConsultationBooking, getConsultationStatusLabel, Tab } from "./types";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConsultationsTabProps {
  setActiveTab: (tab: Tab) => void;
}

export function ConsultationsTab({ setActiveTab }: ConsultationsTabProps) {
  const { t, i18n } = useTranslation();
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    hasLlc: "",
    llcState: "",
    estimatedRevenue: "",
    countryOfResidence: "",
    mainTopic: "",
    additionalNotes: ""
  });

  const { data: consultationTypes = [] } = useQuery<ConsultationType[]>({
    queryKey: ["/api/consultations/types"],
  });

  const { data: myBookings = [] } = useQuery<{ booking: ConsultationBooking; consultationType: ConsultationType }[]>({
    queryKey: ["/api/consultations/my"],
  });

  const { data: availability } = useQuery<{ available: boolean; slots: { startTime: string; endTime: string }[] }>({
    queryKey: ["/api/consultations/availability", selectedDate],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/consultations/availability?date=${selectedDate}`);
      return res.json();
    },
    enabled: !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/consultations/book", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations/my"] });
      setFormMessage({ type: 'success', text: t("consultations.bookingSuccess") + ". " + t("consultations.bookingSuccessDesc") });
      setShowBookingPanel(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormMessage({ type: 'error', text: t("consultations.bookingError") + ". " + err.message });
    }
  });

  const resetForm = () => {
    setSelectedType(null);
    setSelectedDate("");
    setSelectedTime("");
    setFormData({
      hasLlc: "",
      llcState: "",
      estimatedRevenue: "",
      countryOfResidence: "",
      mainTopic: "",
      additionalNotes: ""
    });
  };

  const getLocalizedName = (type: ConsultationType) => {
    const lang = i18n.language;
    if (lang === 'es') return type.nameEs;
    if (lang === 'ca') return type.nameCa;
    return type.nameEn;
  };

  const handleBook = () => {
    setFormMessage(null);
    if (!selectedType || !selectedDate || !selectedTime) {
      setFormMessage({ type: 'error', text: t("consultations.selectAll") });
      return;
    }

    bookMutation.mutate({
      consultationTypeId: selectedType.id,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      ...formData
    });
  };

  const upcomingBookings = myBookings.filter(b => 
    ['pending', 'confirmed'].includes(b.booking.status) && 
    new Date(b.booking.scheduledDate) >= new Date()
  );

  const pastBookings = myBookings.filter(b => 
    !['pending', 'confirmed'].includes(b.booking.status) || 
    new Date(b.booking.scheduledDate) < new Date()
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
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
      <div>
        <h2 className="text-base sm:text-xl md:text-2xl font-black tracking-tight">
          {t("consultations.title")}
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          {t("consultations.subtitle")}
        </p>
      </div>

      <Collapsible open={showBookingPanel} onOpenChange={setShowBookingPanel}>
        <CollapsibleTrigger asChild className="sr-only">
          <button aria-label={t("consultations.bookNew")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="border-2 border-accent/20 bg-accent/5 dark:bg-accent/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black">{t("consultations.bookNew")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("consultations.bookingDescription")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-sm">{t("consultations.selectType")}</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {consultationTypes.map(type => (
                    <Button
                      key={type.id}
                      variant={selectedType?.id === type.id ? "default" : "outline"}
                      className={`justify-start h-auto py-3 px-4 rounded-full ${selectedType?.id === type.id ? 'bg-accent text-primary border-accent' : 'bg-white dark:bg-card'}`}
                      onClick={() => setSelectedType(type)}
                      data-testid={`button-select-type-${type.id}`}
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <div className="text-left">
                          <div className="font-bold">{getLocalizedName(type)}</div>
                          <div className="text-xs opacity-75">{type.duration} min</div>
                        </div>
                        {type.price > 0 && (
                          <div className="text-right flex-shrink-0">
                            <div className="font-black text-sm">{(type.price / 100).toFixed(0)}€</div>
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedType && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-bold text-sm">{t("consultations.selectDate")}</Label>
                      <Input type="date"
                        min={getTomorrowDate()}
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedTime("");
                        }}
                        className="rounded-full bg-white dark:bg-card"
                        data-testid="input-consultation-date"
                      />
                    </div>

                    {selectedDate && availability && (
                      <div className="space-y-2">
                        <Label className="font-bold text-sm">{t("consultations.selectTime")}</Label>
                        {availability.slots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availability.slots.map(slot => (
                              <Button
                                key={slot.startTime}
                                variant={selectedTime === slot.startTime ? "default" : "outline"}
                                size="sm"
                                className={`rounded-full ${selectedTime === slot.startTime ? 'bg-accent text-primary' : 'bg-white dark:bg-card'}`}
                                onClick={() => setSelectedTime(slot.startTime)}
                                data-testid={`button-time-${slot.startTime}`}
                              >
                                {slot.startTime}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground py-2">{t("consultations.noAvailability")}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-4">
                    <h4 className="font-black text-sm">{t("consultations.questionnaire")}</h4>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm">{t("consultations.form.hasLlc")}</Label>
                        <NativeSelect
                          value={formData.hasLlc}
                          onChange={(e) => setFormData({ ...formData, hasLlc: e.target.value })}
                          className="bg-white dark:bg-card"
                        >
                          <NativeSelectItem value="">{t("consultations.form.select")}</NativeSelectItem>
                          <NativeSelectItem value="yes">{t("common.yes")}</NativeSelectItem>
                          <NativeSelectItem value="no">{t("common.no")}</NativeSelectItem>
                        </NativeSelect>
                      </div>

                      {formData.hasLlc === 'yes' && (
                        <div className="space-y-2">
                          <Label className="text-sm">{t("consultations.form.llcState")}</Label>
                          <NativeSelect
                            value={formData.llcState}
                            onChange={(e) => setFormData({ ...formData, llcState: e.target.value })}
                            className="bg-white dark:bg-card"
                          >
                            <NativeSelectItem value="">{t("consultations.form.select")}</NativeSelectItem>
                            <NativeSelectItem value="New Mexico">New Mexico</NativeSelectItem>
                            <NativeSelectItem value="Wyoming">Wyoming</NativeSelectItem>
                            <NativeSelectItem value="Delaware">Delaware</NativeSelectItem>
                            <NativeSelectItem value="Other">{t("consultations.form.other")}</NativeSelectItem>
                          </NativeSelect>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm">{t("consultations.form.estimatedRevenue")}</Label>
                        <NativeSelect
                          value={formData.estimatedRevenue}
                          onChange={(e) => setFormData({ ...formData, estimatedRevenue: e.target.value })}
                          className="bg-white dark:bg-card"
                        >
                          <NativeSelectItem value="">{t("consultations.form.select")}</NativeSelectItem>
                          <NativeSelectItem value="0-50k">$0 - $50,000</NativeSelectItem>
                          <NativeSelectItem value="50k-100k">$50,000 - $100,000</NativeSelectItem>
                          <NativeSelectItem value="100k-500k">$100,000 - $500,000</NativeSelectItem>
                          <NativeSelectItem value="500k+">$500,000+</NativeSelectItem>
                        </NativeSelect>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">{t("consultations.form.countryOfResidence")}</Label>
                        <Input value={formData.countryOfResidence}
                          onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
                          placeholder={t("consultations.form.countryPlaceholder")}
                          className="rounded-full bg-white dark:bg-card"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">{t("consultations.form.mainTopic")}</Label>
                      <Textarea value={formData.mainTopic}
                        onChange={(e) => setFormData({ ...formData, mainTopic: e.target.value })}
                        placeholder={t("consultations.form.topicPlaceholder")}
                        rows={2}
                        className="rounded-3xl bg-white dark:bg-card"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">{t("consultations.form.additionalNotes")}</Label>
                      <Textarea value={formData.additionalNotes}
                        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                        placeholder={t("consultations.form.notesPlaceholder")}
                        rows={2}
                        className="rounded-3xl bg-white dark:bg-card"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="outline" 
                      onClick={() => {
                        setShowBookingPanel(false);
                        resetForm();
                      }}
                      className="rounded-full"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button 
                      onClick={handleBook}
                      disabled={!selectedType || !selectedDate || !selectedTime || bookMutation.isPending}
                      className="bg-accent text-primary font-black rounded-full flex-1 sm:flex-none"
                      data-testid="button-confirm-booking"
                    >
                      {bookMutation.isPending ? t("common.loading") : t("consultations.confirmBooking")}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {upcomingBookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black text-lg">{t("consultations.upcoming")}</h3>
          <div className="grid gap-4">
            {upcomingBookings.map(({ booking, consultationType }) => {
              const statusInfo = getConsultationStatusLabel(booking.status, t);
              return (
                <Card key={booking.id} className="overflow-hidden" data-testid={`card-consultation-${booking.id}`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h4 className="font-black text-base sm:text-lg">
                            {getLocalizedName(consultationType)}
                          </h4>
                          <Badge className={statusInfo.className}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span>{formatDate(booking.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span>{booking.scheduledTime} ({booking.duration} min)</span>
                          </div>
                          <div className="text-xs mt-2">
                            {t("consultations.code")}: <span className="font-mono font-bold">{booking.bookingCode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black text-lg">{t("consultations.past")}</h3>
          <div className="grid gap-3">
            {pastBookings.map(({ booking, consultationType }) => {
              const statusInfo = getConsultationStatusLabel(booking.status, t);
              return (
                <Card key={booking.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{getLocalizedName(consultationType)}</span>
                          <Badge className={statusInfo.className} variant="secondary">
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDate(booking.scheduledDate)} - {booking.scheduledTime}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {myBookings.length === 0 && !showBookingPanel && (
        <Card className="rounded-2xl border-0 shadow-sm bg-white dark:bg-card p-6 md:p-8 text-center" data-testid="card-empty-consultations">
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-accent" />
            <div>
              <h3 className="text-base md:text-lg font-black text-foreground mb-1 md:mb-2 text-center tracking-tight">{t("consultations.noBookings")}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 text-center">{t("consultations.noBookingsDesc")}</p>
            </div>
            <Button onClick={() => setShowBookingPanel(true)}
              className="bg-accent text-accent-foreground font-black rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base"
              data-testid="button-book-first"
            >
              {t("consultations.bookFirst")}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
