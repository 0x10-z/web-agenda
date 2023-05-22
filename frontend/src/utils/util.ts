import { toast } from "react-toastify";

export const showToast = (message: string, type: "error" | "info" | "success") => {
  const prefixedMessage =
    type === "success" ? message : `${type.charAt(0).toUpperCase() + type.slice(1)}: ${message}`;

  toast[type](prefixedMessage, {
    position: window.innerWidth <= 768 ? "bottom-center" : "top-right",
  });
};


export const getCurrentIsoDate = (date: Date | null = null) => {
  if (!date){
    date = new Date();
  }

  const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;
return formattedDate;
}


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

export const getSelectedDateTimeFormattedString = (currentDate: Date) => {
  const date = currentDate;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} a las ${hours}:${minutes}`;
};
