import { toast } from "react-toastify";

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: window.innerWidth <= 768 ? "bottom-center" : "top-right",
  });
};
