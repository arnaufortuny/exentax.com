import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "@/hooks/use-page-title";
import { validateEmail } from "@/lib/validation";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

import { Loader2, Calendar, Clock, User, Mail, Briefcase, ChevronLeft, ChevronRight, Globe, FileText } from "@/components/icons";
import { SuccessCheckmark } from "@/components/ui/success-checkmark";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectItem } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { StepProgress } from "@/components/ui/step-progress";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_STEPS = 5;

const INPUT_CLASS = "h-11 md:h-12 px-5 border-2 border-border dark:border-border focus:border-accent bg-white dark:bg-card transition-colors font-medium text-foreground dark:text-white text-base placeholder:text-muted-foreground rounded-full";
const SELECT_CLASS = "w-full rounded-full h-11 md:h-12 px-5 border-2 border-border dark:border-border focus:border-accent bg-white dark:bg-card transition-colors font-medium text-foreground text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20";
const TEXTAREA_CLASS = "px-5 py-3 border-2 border-border dark:border-border focus:border-accent bg-white dark:bg-card transition-colors font-medium text-foreground dark:text-white text-base placeholder:text-muted-foreground rounded-2xl";
const LABEL_CLASS = "text-xs md:text-sm font-bold text-foreground";

const createFormSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(1, t("validation.required")),
  lastName: z.string().min(1, t("validation.required")),
  email: z.string().email(t("validation.invalidEmail")),
  phone: z.string()
    .min(1, t("validation.required"))
    .refine(
      (val) => {
        if (!val.startsWith('+')) return false;
        if (/[a-zA-Z]/.test(val)) return false;
        const digitsOnly = val.replace(/\D/g, '');
        return digitsOnly.length >= 6;
      },
      { message: t("validation.phoneFormat") }
    ),
  countryOfResidence: z.string().min(1, t("validation.required")),
  scheduledDate: z.string().min(1, t("validation.required")),
  scheduledTime: z.string().min(1, t("validation.required")),
  hasExistingBusiness: z.string().optional(),
  businessActivity: z.string().optional(),
  estimatedRevenue: z.string().optional(),
  preferredState: z.string().optional(),
  mainTopic: z.string().min(1, t("validation.required")),
  additionalNotes: z.string().optional(),
  dataProcessingConsent: z.boolean().refine(val => val === true, t("contact.consent.mustAccept")),
});

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ConsultationSettingsResponse {
  availableDaysWindow: number;
  slotStartHour: number;
  slotEndHour: number;
  slotIntervalMinutes: number;
  allowWeekends: boolean;
  timezone: string;
  availableDates: string[];
}

export default function AsesoriaGratis() {
  const { user, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  usePageTitle();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const formSchema = useMemo(() => createFormSchema(t), [t]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      countryOfResidence: "",
      scheduledDate: "",
      scheduledTime: "",
      hasExistingBusiness: "",
      businessActivity: "",
      estimatedRevenue: "",
      preferredState: "",
      mainTopic: "",
      additionalNotes: "",
      dataProcessingConsent: false,
    },
  });

  const watchedTime = form.watch("scheduledTime");

  useEffect(() => {
    if (isAuthenticated && user) {
      form.reset({
        ...form.getValues(),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        countryOfResidence: form.getValues("countryOfResidence"),
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const settingsQuery = useQuery<ConsultationSettingsResponse>({
    queryKey: ['/api/consultations/settings'],
  });

  const availableDatesSet = useMemo(() => {
    return new Set(settingsQuery.data?.availableDates || []);
  }, [settingsQuery.data]);

  const slotsQuery = useQuery<TimeSlot[]>({
    queryKey: ['/api/consultations/free-slots', selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/consultations/free-slots?date=${selectedDate}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch slots');
      const data = await res.json();
      if (!data.available || !data.slots) return [];
      return data.slots.map((s: { startTime: string; endTime: string }) => ({
        time: s.startTime,
        available: true,
      }));
    },
    enabled: !!selectedDate && availableDatesSet.has(selectedDate),
  });

  const generateCalendarDays = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days: { date: Date; isCurrentMonth: boolean; isDisabled: boolean }[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false, isDisabled: true });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isAvailable = availableDatesSet.has(dateStr);
      days.push({ date: d, isCurrentMonth: true, isDisabled: !isAvailable });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, isDisabled: true });
    }

    return days;
  }, [currentMonth, availableDatesSet]);

  const calendarDays = useMemo(() => generateCalendarDays(), [generateCalendarDays]);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    form.setValue("scheduledDate", dateStr);
    form.setValue("scheduledTime", "");
  };

  const handleTimeSelect = (time: string) => {
    form.setValue("scheduledTime", time, { shouldValidate: true });
  };

  const nextStep = async () => {
    const validations: Record<number, (keyof FormValues)[]> = {
      0: ["firstName", "lastName", "email", "phone", "countryOfResidence"],
      1: ["scheduledDate", "scheduledTime"],
      2: ["mainTopic"],
      3: [],
      4: ["dataProcessingConsent"],
    };

    const fields = validations[step];
    if (fields && fields.length > 0) {
      const isValid = await form.trigger(fields);
      if (!isValid) return;
    }

    if (step === 0) {
      const email = form.getValues("email");
      if (!validateEmail(email)) {
        form.setError("email", { message: t("validation.invalidEmail") });
        return;
      }
      try {
        const checkRes = await apiRequest("POST", "/api/consultations/check-email", { email });
        const checkData = await checkRes.json();
        if (checkData.deactivated) {
          window.location.href = "/auth/login";
          return;
        }
      } catch {
      }
    }

    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setFormMessage(null);
    try {
      const res = await apiRequest("POST", "/api/consultations/book-free", {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        countryOfResidence: values.countryOfResidence,
        scheduledDate: values.scheduledDate,
        scheduledTime: values.scheduledTime,
        hasExistingBusiness: values.hasExistingBusiness || undefined,
        businessActivity: values.businessActivity || undefined,
        estimatedRevenue: values.estimatedRevenue || undefined,
        preferredState: values.preferredState || undefined,
        mainTopic: values.mainTopic,
        additionalNotes: values.additionalNotes || undefined,
        preferredLanguage: i18n.language,
      });
      const data = await res.json();
      setBookingCode(data.bookingCode);
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err?.message || t("freeConsultation.error");
      setFormMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayNames = useMemo(() => {
    const lang = i18n.language;
    const locale = lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : lang === 'pt' ? 'pt-PT' : lang === 'ca' ? 'ca-ES' : 'es-ES';
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(2024, 0, i);
      days.push(d.toLocaleDateString(locale, { weekday: 'short' }).substring(0, 2).toUpperCase());
    }
    return days;
  }, [i18n.language]);

  const monthLabel = useMemo(() => {
    const lang = i18n.language;
    const locale = lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : lang === 'pt' ? 'pt-PT' : lang === 'ca' ? 'ca-ES' : 'es-ES';
    return currentMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }, [currentMonth, i18n.language]);

  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const lang = i18n.language;
    const locale = lang === 'en' ? 'en-GB' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : lang === 'pt' ? 'pt-PT' : lang === 'ca' ? 'ca-ES' : 'es-ES';
    return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="max-w-lg w-full">
              <CardContent className="p-8 text-center space-y-6">
                <SuccessCheckmark size={100} />
                <h2 className="text-2xl font-bold" data-testid="text-booking-confirmed">
                  {t("freeConsultation.success.title")}
                </h2>
                <p className="text-muted-foreground">
                  {t("freeConsultation.success.description")}
                </p>
                {bookingCode && (
                  <div className="bg-muted rounded-md p-4">
                    <p className="text-sm text-muted-foreground mb-1">{t("freeConsultation.success.codeLabel")}</p>
                    <p className="text-lg font-mono font-bold" data-testid="text-booking-code">{bookingCode}</p>
                  </div>
                )}
                <div className="bg-muted rounded-md p-4 text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-sm">{formatSelectedDate(form.getValues("scheduledDate"))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-sm">{form.getValues("scheduledTime")} (Madrid)</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("freeConsultation.success.emailSent")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 pt-20 pb-8 sm:pt-20 lg:pt-28 md:pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 md:mb-10 flex flex-col items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }} data-testid="text-page-title">
              <span className="text-accent">{t("freeConsultation.titleFree")}</span>{" "}
              <span className="text-foreground">{t("freeConsultation.titleConsultation")}</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
              {t("freeConsultation.subtitle")}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">
                {t("freeConsultation.duration")}
              </span>
            </div>
          </div>

          <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} className="mb-8" />

          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardContent className="p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                      {step === 0 && (
                        <div className="space-y-6">
                          <div className="mb-6">
                            <h2 className="text-xl font-semibold">{t("freeConsultation.steps.personal.title")}</h2>
                            <p className="text-sm text-muted-foreground">{t("freeConsultation.steps.personal.subtitle")}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.firstName")}</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-first-name" placeholder={t("freeConsultation.fields.firstNamePlaceholder")} autoComplete="given-name" {...field} className={INPUT_CLASS} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px' }} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.lastName")}</FormLabel>
                                <FormControl>
                                  <Input data-testid="input-last-name" placeholder={t("freeConsultation.fields.lastNamePlaceholder")} autoComplete="family-name" {...field} className={INPUT_CLASS} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px' }} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.email")}</FormLabel>
                              <FormControl>
                                <Input data-testid="input-email" type="email" autoComplete="email" placeholder={t("freeConsultation.fields.emailPlaceholder")} {...field} className={INPUT_CLASS} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px' }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.phone")}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel"
                                  className={INPUT_CLASS}
                                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px' }}
                                  data-testid="input-phone"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">{t("application.fields.phoneMustStartWithPlus")}</p>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="countryOfResidence" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.country")}</FormLabel>
                              <FormControl>
                                <Input data-testid="input-country" placeholder={t("freeConsultation.fields.countryPlaceholder")} {...field} className={INPUT_CLASS} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16px' }} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}

                      {step === 1 && (
                        <div className="space-y-6">
                          <div className="mb-6">
                            <h2 className="text-xl font-semibold">{t("freeConsultation.steps.schedule.title")}</h2>
                            <p className="text-sm text-muted-foreground">{t("freeConsultation.steps.schedule.subtitle")}</p>
                          </div>

                          {settingsQuery.isLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-6 h-6 animate-spin text-accent" />
                            </div>
                          ) : (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                data-testid="button-prev-month"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </Button>
                              <span className="font-semibold capitalize">{monthLabel}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                data-testid="button-next-month"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 mb-2">
                              {dayNames.map((d, i) => (
                                <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                              ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {calendarDays.map((day, i) => {
                                const dateStr = day.date.toISOString().split('T')[0];
                                const isSelected = selectedDate === dateStr;
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={day.isDisabled}
                                    onClick={() => !day.isDisabled && handleDateSelect(dateStr)}
                                    data-testid={`button-date-${dateStr}`}
                                    className={`
                                      aspect-square flex items-center justify-center text-sm rounded-md transition-colors
                                      ${!day.isCurrentMonth ? 'text-muted-foreground/30' : ''}
                                      ${day.isDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover-elevate'}
                                      ${isSelected ? 'bg-accent text-white font-bold ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}
                                      ${!isSelected && !day.isDisabled && day.isCurrentMonth ? 'text-foreground' : ''}
                                    `}
                                  >
                                    {day.date.getDate()}
                                  </button>
                                );
                              })}
                            </div>

                          {selectedDate && (
                            <div className="mt-6">
                              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent" />
                                {t("freeConsultation.steps.schedule.availableSlots")} — {formatSelectedDate(selectedDate)}
                              </p>
                              {slotsQuery.isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                                </div>
                              ) : slotsQuery.data && slotsQuery.data.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {slotsQuery.data.map((slot) => {
                                    const isSelected = watchedTime === slot.time;
                                    return (
                                      <button
                                        key={slot.time}
                                        type="button"
                                        disabled={!slot.available}
                                        onClick={() => slot.available && handleTimeSelect(slot.time)}
                                        data-testid={`button-time-${slot.time}`}
                                        className={`
                                          py-2.5 px-3 rounded-full text-sm font-medium transition-colors border
                                          ${!slot.available ? 'opacity-40 cursor-not-allowed border-muted text-muted-foreground line-through' : 'cursor-pointer'}
                                          ${isSelected ? 'bg-accent text-white border-accent font-bold ring-2 ring-accent ring-offset-1 ring-offset-background' : ''}
                                          ${slot.available && !isSelected ? 'border-border hover-elevate' : ''}
                                        `}
                                      >
                                        {slot.time}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                  {t("freeConsultation.steps.schedule.noSlots")}
                                </p>
                              )}
                              {form.formState.errors.scheduledTime && (
                                <p className="text-sm text-destructive mt-2">{form.formState.errors.scheduledTime.message}</p>
                              )}
                            </div>
                          )}
                          {form.formState.errors.scheduledDate && !selectedDate && (
                            <p className="text-sm text-destructive">{form.formState.errors.scheduledDate.message}</p>
                          )}
                          </div>
                          )}
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-6">
                          <div className="mb-6">
                            <h2 className="text-xl font-semibold">{t("freeConsultation.steps.questionnaire.title")}</h2>
                            <p className="text-sm text-muted-foreground">{t("freeConsultation.steps.questionnaire.subtitle")}</p>
                          </div>

                          <FormField control={form.control} name="mainTopic" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.mainTopic")}</FormLabel>
                              <FormControl>
                                <NativeSelect data-testid="select-main-topic" placeholder={t("freeConsultation.fields.mainTopicPlaceholder")} value={field.value} onValueChange={field.onChange}>
                                  <NativeSelectItem value="llc_formation">{t("freeConsultation.topics.llcFormation")}</NativeSelectItem>
                                  <NativeSelectItem value="tax_planning">{t("freeConsultation.topics.taxPlanning")}</NativeSelectItem>
                                  <NativeSelectItem value="banking">{t("freeConsultation.topics.banking")}</NativeSelectItem>
                                  <NativeSelectItem value="compliance">{t("freeConsultation.topics.compliance")}</NativeSelectItem>
                                  <NativeSelectItem value="ecommerce">{t("freeConsultation.topics.ecommerce")}</NativeSelectItem>
                                  <NativeSelectItem value="other">{t("freeConsultation.topics.other")}</NativeSelectItem>
                                </NativeSelect>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="hasExistingBusiness" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.hasExistingBusiness")}</FormLabel>
                              <FormControl>
                                <NativeSelect data-testid="select-has-business" placeholder={t("freeConsultation.fields.select")} value={field.value} onValueChange={field.onChange}>
                                  <NativeSelectItem value="yes">{t("freeConsultation.fields.yes")}</NativeSelectItem>
                                  <NativeSelectItem value="no">{t("freeConsultation.fields.no")}</NativeSelectItem>
                                  <NativeSelectItem value="planning">{t("freeConsultation.fields.planning")}</NativeSelectItem>
                                </NativeSelect>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="businessActivity" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.businessActivity")}</FormLabel>
                              <FormControl>
                                <NativeSelect data-testid="select-business-activity" placeholder={t("freeConsultation.fields.businessActivityPlaceholder")} value={field.value} onValueChange={field.onChange}>
                                  <NativeSelectItem value="ecommerce">{t("auth.register.businessActivities.ecommerce")}</NativeSelectItem>
                                  <NativeSelectItem value="dropshipping">{t("auth.register.businessActivities.dropshipping")}</NativeSelectItem>
                                  <NativeSelectItem value="consulting">{t("auth.register.businessActivities.consulting")}</NativeSelectItem>
                                  <NativeSelectItem value="marketing">{t("auth.register.businessActivities.marketing")}</NativeSelectItem>
                                  <NativeSelectItem value="software">{t("auth.register.businessActivities.software")}</NativeSelectItem>
                                  <NativeSelectItem value="saas">{t("auth.register.businessActivities.saas")}</NativeSelectItem>
                                  <NativeSelectItem value="apps">{t("auth.register.businessActivities.apps")}</NativeSelectItem>
                                  <NativeSelectItem value="ai">{t("auth.register.businessActivities.ai")}</NativeSelectItem>
                                  <NativeSelectItem value="investments">{t("auth.register.businessActivities.investments")}</NativeSelectItem>
                                  <NativeSelectItem value="tradingEducation">{t("auth.register.businessActivities.tradingEducation")}</NativeSelectItem>
                                  <NativeSelectItem value="financial">{t("auth.register.businessActivities.financial")}</NativeSelectItem>
                                  <NativeSelectItem value="crypto">{t("auth.register.businessActivities.crypto")}</NativeSelectItem>
                                  <NativeSelectItem value="realestate">{t("auth.register.businessActivities.realestate")}</NativeSelectItem>
                                  <NativeSelectItem value="import">{t("auth.register.businessActivities.import")}</NativeSelectItem>
                                  <NativeSelectItem value="coaching">{t("auth.register.businessActivities.coaching")}</NativeSelectItem>
                                  <NativeSelectItem value="content">{t("auth.register.businessActivities.content")}</NativeSelectItem>
                                  <NativeSelectItem value="affiliate">{t("auth.register.businessActivities.affiliate")}</NativeSelectItem>
                                  <NativeSelectItem value="freelance">{t("auth.register.businessActivities.freelance")}</NativeSelectItem>
                                  <NativeSelectItem value="gaming">{t("auth.register.businessActivities.gaming")}</NativeSelectItem>
                                  <NativeSelectItem value="digitalProducts">{t("auth.register.businessActivities.digitalProducts")}</NativeSelectItem>
                                  <NativeSelectItem value="other">{t("auth.register.businessActivities.other")}</NativeSelectItem>
                                </NativeSelect>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="estimatedRevenue" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.estimatedRevenue")}</FormLabel>
                              <FormControl>
                                <NativeSelect data-testid="select-revenue" placeholder={t("freeConsultation.fields.select")} value={field.value} onValueChange={field.onChange}>
                                  <NativeSelectItem value="0-10k">$0 - $10,000</NativeSelectItem>
                                  <NativeSelectItem value="10k-50k">$10,000 - $50,000</NativeSelectItem>
                                  <NativeSelectItem value="50k-100k">$50,000 - $100,000</NativeSelectItem>
                                  <NativeSelectItem value="100k-500k">$100,000 - $500,000</NativeSelectItem>
                                  <NativeSelectItem value="500k+">$500,000+</NativeSelectItem>
                                </NativeSelect>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="preferredState" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.preferredState")}</FormLabel>
                              <FormControl>
                                <NativeSelect data-testid="select-state" placeholder={t("freeConsultation.fields.select")} value={field.value} onValueChange={field.onChange}>
                                  <NativeSelectItem value="new_mexico">New Mexico</NativeSelectItem>
                                  <NativeSelectItem value="wyoming">Wyoming</NativeSelectItem>
                                  <NativeSelectItem value="delaware">Delaware</NativeSelectItem>
                                  <NativeSelectItem value="not_sure">{t("freeConsultation.fields.notSure")}</NativeSelectItem>
                                </NativeSelect>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-6">
                          <div className="mb-6">
                            <h2 className="text-xl font-semibold">{t("freeConsultation.steps.notes.title")}</h2>
                            <p className="text-sm text-muted-foreground">{t("freeConsultation.steps.notes.subtitle")}</p>
                          </div>

                          <FormField control={form.control} name="additionalNotes" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={LABEL_CLASS}>{t("freeConsultation.fields.additionalNotes")}</FormLabel>
                              <FormControl>
                                <Textarea
                                  data-testid="textarea-notes"
                                  placeholder={t("freeConsultation.fields.additionalNotesPlaceholder")}
                                  className={`min-h-[120px] resize-none ${TEXTAREA_CLASS}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <div className="bg-muted rounded-md p-4 space-y-3">
                            <h3 className="text-sm font-semibold">{t("freeConsultation.steps.notes.summary")}</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <User className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                <span>{form.getValues("firstName")} {form.getValues("lastName")}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Mail className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                <span>{form.getValues("email")}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                <span>{formatSelectedDate(form.getValues("scheduledDate"))}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                <span>{form.getValues("scheduledTime")} (Madrid)</span>
                              </div>
                              {form.getValues("mainTopic") && (
                                <div className="flex items-start gap-2">
                                  <Briefcase className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                  <span>{t(`freeConsultation.topics.${form.getValues("mainTopic")}`) || form.getValues("mainTopic")}</span>
                                </div>
                              )}
                              {form.getValues("countryOfResidence") && (
                                <div className="flex items-start gap-2">
                                  <Globe className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                  <span>{form.getValues("countryOfResidence")}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {step === 4 && (
                        <div className="space-y-6">
                          <div className="mb-6">
                            <h2 className="text-xl font-semibold">{t("freeConsultation.steps.confirm.title")}</h2>
                            <p className="text-sm text-muted-foreground">{t("freeConsultation.steps.confirm.subtitle")}</p>
                          </div>

                          <div className="bg-muted rounded-md p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("freeConsultation.fields.firstName")}</p>
                                <p className="font-medium">{form.getValues("firstName")} {form.getValues("lastName")}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("freeConsultation.fields.email")}</p>
                                <p className="font-medium">{form.getValues("email")}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("freeConsultation.steps.schedule.title")}</p>
                                <p className="font-medium">{formatSelectedDate(form.getValues("scheduledDate"))}</p>
                                <p className="text-sm text-accent font-semibold">{form.getValues("scheduledTime")} (Madrid)</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("freeConsultation.fields.mainTopic")}</p>
                                <p className="font-medium">{t(`freeConsultation.topics.${form.getValues("mainTopic")}`) || form.getValues("mainTopic")}</p>
                              </div>
                            </div>
                          </div>

                          <FormField control={form.control} name="dataProcessingConsent" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  data-testid="checkbox-consent"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  {t("freeConsultation.consent")}
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )} />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {formMessage && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${formMessage.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
                      {formMessage.text}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-8">
                    {step > 0 ? (
                      <Button type="button" variant="outline" onClick={prevStep} data-testid="button-prev-step" className="rounded-full font-bold h-12 border-border">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t("freeConsultation.navigation.back")}
                      </Button>
                    ) : (
                      <div />
                    )}
                    {step < TOTAL_STEPS - 1 ? (
                      <Button type="button" onClick={nextStep} data-testid="button-next-step" className="bg-accent text-white font-bold rounded-full h-12 shadow-lg shadow-accent/20">
                        {t("freeConsultation.navigation.next")}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting} data-testid="button-submit-booking" className="bg-accent text-white font-bold rounded-full h-12 shadow-lg shadow-accent/20 disabled:opacity-50">
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t("freeConsultation.navigation.confirm")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
