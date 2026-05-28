import { useEffect } from "react";

export default function ErrorBoundary({ children }) {
  // Перехват ошибок
  useEffect(() => {
    const handleError = (event) => {
      event.preventDefault();
      console.error("[ErrorBoundary] Перехвачена ошибка:", event.error);
    };

    const handleUnhandledRejection = (event) => {
      event.preventDefault();
      console.error(
        "[ErrorBoundary] Перехвачено unhandled rejection:",
        event.reason,
      );
    };

    // Предотвращаем перезагрузку при ошибках
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return children;
}
