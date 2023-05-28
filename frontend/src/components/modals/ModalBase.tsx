import React, { ReactNode } from "react";
import "react-calendar/dist/Calendar.css";
import "react-toastify/dist/ReactToastify.css";

export type ModalSize = "xs" | "md" | "lg";

interface ModalBaseProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children?: ReactNode;
}

export const ModalBase: React.FC<ModalBaseProps> = ({
  title,
  isOpen,
  onClose,
  size = "md",
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.id === "modal-overlay") {
      onClose();
    }
  };

  let widthClasses = "md:w-1/2";
  if (size === "xs") {
    widthClasses = "sm:w-1/2 md:w-1/3 lg:w-1/4";
  } else if (size === "lg") {
    widthClasses = "sm:w-3/4 md:w-2/3 lg:w-1/2";
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50"
      id="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white p-16 flex flex-col justify-center items-center rounded-md shadow-md ${widthClasses}`}
      >
        <h1 className="font-bold text-2xl text-gray-800 text-center pb-4">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};

export default ModalBase;
