import { useEffect, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

interface UseFormDraftOptions<T extends Record<string, unknown>> {
  form: UseFormReturn<T>;
  storageKey: string;
  debounceMs?: number;
  defaultValues?: Partial<T>;
}

export function useFormDraft<T extends Record<string, unknown>>({
  form,
  storageKey,
  debounceMs = 1000,
  defaultValues = {},
}: UseFormDraftOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const saveDraft = useCallback((data: T) => {
    try {
      const draftData = {
        data,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
    } catch (error) {
      console.warn("Error saving form draft:", error);
    }
  }, [storageKey]);

  const loadDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data as T;
      }
    } catch (error) {
      console.warn("Error loading form draft:", error);
    }
    return null;
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Error clearing form draft:", error);
    }
  }, [storageKey]);

  const hasDraft = useCallback((): boolean => {
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      const savedDraft = loadDraft();
      if (savedDraft) {
        const currentValues = form.getValues();
        const isFormPristine = !form.formState.isDirty;
        
        const hasUserModifications = Object.entries(currentValues).some(([key, val]) => {
          const defaultVal = defaultValues[key as keyof T];
          if (val === defaultVal) return false;
          if (val === "" || val === false || val === null || val === undefined) return false;
          return true;
        });
        
        if (isFormPristine && !hasUserModifications) {
          form.reset(savedDraft);
        }
      }
      isInitializedRef.current = true;
    }
  }, [form, loadDraft, defaultValues]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        saveDraft(data as T);
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [form, saveDraft, debounceMs]);

  return {
    loadDraft,
    clearDraft,
    hasDraft,
    saveDraft,
  };
}
