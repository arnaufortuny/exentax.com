import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, getCsrfToken } from "@/lib/queryClient";
import type { TFunction } from "i18next";
import type { ProfileData } from "@/components/dashboard/types";

export function useUserProfileState(user: any, t: TFunction, canEdit: boolean) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    businessActivity: '',
    address: '',
    streetType: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    idNumber: '',
    idType: '',
    birthDate: ''
  });
  const [formMessage, setFormMessage] = useState<{ type: 'error' | 'success' | 'info', text: string } | null>(null);

  const [deleteOwnAccountDialog, setDeleteOwnAccountDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState<{ open: boolean; file: File | null }>({ open: false, file: null });
  const [uploadDocType, setUploadDocType] = useState("passport");
  const [uploadNotes, setUploadNotes] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'form' | 'otp'>('form');
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [profileOtpStep, setProfileOtpStep] = useState<'idle' | 'otp'>('idle');
  const [profileOtp, setProfileOtp] = useState("");
  const [pendingProfileData, setPendingProfileData] = useState<Record<string, any> | null>(null);

  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isResendingCode, setIsResendingCode] = useState(false);

  useEffect(() => {
    if (user && !isEditing) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        businessActivity: user.businessActivity || '',
        address: user.address || '',
        streetType: user.streetType || '',
        city: user.city || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        idNumber: user.idNumber || '',
        idType: user.idType || '',
        birthDate: user.birthDate || ''
      });
    }
  }, [user, isEditing]);

  useEffect(() => {
    if (formMessage) {
      const timer = setTimeout(() => setFormMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [formMessage]);

  const updateProfile = useMutation({
    retry: false,
    mutationFn: async (data: typeof profileData) => {
      setFormMessage(null);
      if (!canEdit) {
        throw new Error(t("dashboard.toasts.cannotModifyAccountState"));
      }
      if (data.idNumber && data.idNumber.trim()) {
        const digits = data.idNumber.replace(/\D/g, '');
        if (digits.length > 0 && digits.length < 7) {
          throw new Error(t("validation.idNumberMinDigits"));
        }
      }
      if (data.birthDate) {
        const birthDate = new Date(data.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          throw new Error(t("validation.ageMinimum"));
        }
      }
      const token = await getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["X-CSRF-Token"] = token;
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === "OTP_REQUIRED") {
          setPendingProfileData(err.pendingChanges || {});
          setProfileOtpStep('otp');
          setIsEditing(false);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          setFormMessage({ type: 'success', text: t("profile.otpSentTitle") + ". " + t("profile.otpSentDesc") });
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
          throw new Error("OTP_REQUIRED_SILENT");
        }
        throw new Error(err.message || t("dashboard.toasts.couldNotSave"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      setFormMessage({ type: 'success', text: t("dashboard.toasts.changesSaved") + ". " + t("dashboard.toasts.changesSavedDesc") });
    },
    onError: (error: any) => {
      if (error.message === "OTP_REQUIRED_SILENT") return;
      setFormMessage({ type: 'error', text: t("common.error") + ". " + error.message });
    }
  });

  const confirmProfileWithOtp = useMutation({
    mutationFn: async () => {
      setFormMessage(null);
      if (!profileOtp || profileOtp.length !== 6) throw new Error(t("dashboard.errors.invalidOtp"));
      const res = await apiRequest("POST", "/api/user/profile/confirm-otp", { otpCode: profileOtp });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.code === "ACCOUNT_UNDER_REVIEW") {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          setProfileOtpStep('idle');
          setProfileOtp("");
          setPendingProfileData(null);
        }
        const attemptsMsg = err.attemptsRemaining !== undefined && err.attemptsRemaining > 0
          ? ` (${err.attemptsRemaining} ${t('profile.attemptsRemaining')})`
          : '';
        throw new Error((err.message || t("dashboard.toasts.couldNotSave")) + attemptsMsg);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      setProfileOtpStep('idle');
      setProfileOtp("");
      setPendingProfileData(null);
      setFormMessage({ type: 'success', text: t("dashboard.toasts.changesSaved") + ". " + t("dashboard.toasts.changesSavedDesc") });
    },
    onError: (error: any) => {
      setProfileOtp("");
      setFormMessage({ type: 'error', text: error.message });
    }
  });

  const cancelPendingChanges = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/profile/cancel-pending");
      if (!res.ok) throw new Error(t("dashboard.errors.failedToCancel"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setProfileOtpStep('idle');
      setProfileOtp("");
      setPendingProfileData(null);
      setFormMessage(null);
    }
  });

  const resendProfileOtp = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/profile/resend-otp");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("common.error"));
      }
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("profile.otpResent") });
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: error.message });
    }
  });

  const deleteOwnAccountMutation = useMutation({
    mutationFn: async () => {
      setFormMessage(null);
      try {
        await apiRequest("DELETE", "/api/user/account");
      } catch (e: any) {
        if (e?.message?.includes("CSRF") || e?.message?.includes("authenticated") || e?.message?.includes("Not authenticated")) {
          return;
        }
        throw e;
      }
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("dashboard.toasts.accountDeleted") + ". " + t("dashboard.toasts.accountDeletedDesc") });
      window.location.href = "/";
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error?.message || t("dashboard.toasts.couldNotDelete")) });
    }
  });

  const requestPasswordOtpMutation = useMutation({
    mutationFn: async () => {
      setFormMessage(null);
      const res = await apiRequest("POST", "/api/user/request-password-otp");
      if (!res.ok) throw new Error(t("dashboard.toasts.couldNotSend"));
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("dashboard.toasts.codeSent") + ". " + t("dashboard.toasts.codeSentDesc") });
      setPasswordStep('otp');
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotSend")) });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; otp: string }) => {
      setFormMessage(null);
      const res = await apiRequest("POST", "/api/user/change-password", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t("dashboard.toasts.couldNotUpdate"));
      }
    },
    onSuccess: () => {
      setFormMessage({ type: 'success', text: t("dashboard.toasts.passwordUpdated") + ". " + t("dashboard.toasts.passwordUpdatedDesc") });
      setShowPasswordForm(false);
      setPasswordStep('form');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOtp("");
    },
    onError: (error: any) => {
      setFormMessage({ type: 'error', text: t("common.error") + ". " + (error.message || t("dashboard.toasts.couldNotUpdate")) });
    }
  });

  return {
    isEditing,
    setIsEditing,
    profileData,
    setProfileData,
    formMessage,
    setFormMessage,
    deleteOwnAccountDialog,
    setDeleteOwnAccountDialog,
    uploadDialog,
    setUploadDialog,
    uploadDocType,
    setUploadDocType,
    uploadNotes,
    setUploadNotes,
    showPasswordForm,
    setShowPasswordForm,
    passwordStep,
    setPasswordStep,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordOtp,
    setPasswordOtp,
    profileOtpStep,
    setProfileOtpStep,
    profileOtp,
    setProfileOtp,
    pendingProfileData,
    setPendingProfileData,
    showEmailVerification,
    setShowEmailVerification,
    emailVerificationCode,
    setEmailVerificationCode,
    isVerifyingEmail,
    setIsVerifyingEmail,
    isResendingCode,
    setIsResendingCode,
    updateProfile,
    confirmProfileWithOtp,
    cancelPendingChanges,
    resendProfileOtp,
    deleteOwnAccountMutation,
    requestPasswordOtpMutation,
    changePasswordMutation,
  };
}
