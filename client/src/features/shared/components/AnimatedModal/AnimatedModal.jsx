// features/shared/components/AnimatedModal/AnimatedModal.jsx
import React, { useRef, useEffect } from "react";

const AnimatedModal = ({
  isOpen,
  onClose,
  children,
  size = "medium",
  className = "",
  showOverlay = true,
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const lastOpenState = useRef(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    // Добавляем классы для анимации появления
    const timer = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.classList.add("nt-modal__overlay--visible");
      }
      if (modalRef.current) {
        modalRef.current.classList.add("nt-modal--animate-in");
      }
    }, 10); // Небольшая задержка для корректной анимации

    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    // Сбрасываем анимацию при изменении состояния
    if (lastOpenState.current !== isOpen) {
      lastOpenState.current = isOpen;

      if (!isOpen && overlayRef.current && modalRef.current) {
        overlayRef.current.classList.remove("nt-modal__overlay--visible");
        modalRef.current.classList.remove("nt-modal--animate-in");
      }
    }
  }, [isOpen]);

  const handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`nt-modal__overlay ${
        showOverlay ? "" : "nt-modal__overlay--transparent"
      }`}
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose(e);
      }}
    >
      <div
        className={`nt-modal nt-modal--${size} ${className}`}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default AnimatedModal;
