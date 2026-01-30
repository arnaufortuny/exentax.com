import { useCallback, useRef } from "react";

const prefetchedRoutes = new Set<string>();

const routeModules: Record<string, () => Promise<unknown>> = {
  "/": () => import("@/pages/home"),
  "/servicios": () => import("@/pages/servicios"),
  "/faq": () => import("@/pages/faq"),
  "/contacto": () => import("@/pages/contacto"),
  "/maintenance": () => import("@/pages/maintenance"),
  "/llc/formation": () => import("@/pages/llc-formation"),
  "/dashboard": () => import("@/pages/dashboard"),
  "/auth/login": () => import("@/pages/auth/login"),
  "/auth/register": () => import("@/pages/auth/register"),
  "/login": () => import("@/pages/auth/login"),
  "/register": () => import("@/pages/auth/register"),
};

export function usePrefetch() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefetch = useCallback((route: string) => {
    if (prefetchedRoutes.has(route)) return;
    
    const moduleLoader = routeModules[route];
    if (moduleLoader) {
      prefetchedRoutes.add(route);
      moduleLoader().catch(() => {
        prefetchedRoutes.delete(route);
      });
    }
  }, []);

  const prefetchOnHover = useCallback((route: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      prefetch(route);
    }, 100);
  }, [prefetch]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    prefetch,
    prefetchOnHover,
    cancelPrefetch,
  };
}

export function prefetchRoute(route: string) {
  if (prefetchedRoutes.has(route)) return;
  
  const moduleLoader = routeModules[route];
  if (moduleLoader) {
    prefetchedRoutes.add(route);
    moduleLoader().catch(() => {
      prefetchedRoutes.delete(route);
    });
  }
}
