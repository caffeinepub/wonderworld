import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

const RouterContext = createContext({
  path: "/",
  navigate: (_to: string) => {},
});

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const [path, setPath] = useState(window.location.pathname);

  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export const Route = ({
  path,
  element,
}: {
  path: string;
  element: React.ReactElement;
}) => {
  const { path: currentPath } = useRouter();
  return currentPath === path ? element : null;
};

export const Link = ({
  to,
  children,
  className,
}: {
  to: string;
  children: React.ReactNode;
  className: string;
}) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};
