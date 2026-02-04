import { useCallback, useRef } from "react";

const prefetchedRoutes = new Set<string>();

export function usePrefetch() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetch = useCallback((path: string) => {
    if (prefetchedRoutes.has(path)) return;

    const routeLoaders: Record<string, () => Promise<unknown>> = {
      "/": () => import("../pages/home"),
      "/servicios": () => import("../pages/servicios"),
      "/faq": () => import("../pages/faq"),
      "/contacto": () => import("../pages/contacto"),
      "/llc/maintenance": () => import("../pages/maintenance"),
      "/llc/formation": () => import("../pages/llc-formation"),
      "/dashboard": () => import("../pages/dashboard"),
      "/auth/login": () => import("../pages/auth/login"),
      "/auth/register": () => import("../pages/auth/register"),
      "/legal/terminos": () => import("../pages/legal/terminos"),
      "/legal/privacidad": () => import("../pages/legal/privacidad"),
    };

    timeoutRef.current = setTimeout(() => {
      const loader = routeLoaders[path];
      if (loader) {
        loader()
          .then(() => {
            prefetchedRoutes.add(path);
          })
          .catch(() => {});
      }
    }, 50);
  }, []);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { prefetch, prefetchOnHover: prefetch, cancelPrefetch };
}

interface PrefetchLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function PrefetchLink({ 
  href, 
  children, 
  className,
  onClick,
  ...props 
}: PrefetchLinkProps) {
  const { prefetch, cancelPrefetch } = usePrefetch();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={() => prefetch(href)}
      onMouseLeave={cancelPrefetch}
      onFocus={() => prefetch(href)}
      onBlur={cancelPrefetch}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}
