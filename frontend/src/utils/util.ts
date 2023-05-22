import { toast } from "react-toastify";

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: window.innerWidth <= 768 ? "bottom-center" : "top-right",
  });
};


export const getSelectedDateTime = (currentDate: Date, currentTime: string) => {
  return new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    parseInt(currentTime.split(":")[0]),
    parseInt(currentTime.split(":")[1])
  );
};

export const getSelectedDateTimeString = (currentDate: Date, currentTime: string) => {
  const date = getSelectedDateTime(currentDate, currentTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
