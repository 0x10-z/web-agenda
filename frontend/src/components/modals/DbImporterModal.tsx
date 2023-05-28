import { useEffect, useState } from "react";
import { User } from "models/User";
import { Auth } from "utils/auth";
import { ApiService } from "services/ApiService";
import ModalBase from "components/modals/ModalBase";

interface DbImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DbImporterModal: React.FC<DbImporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);

  useEffect(() => {
    const token = Auth.getToken();
    if (token) {
      setUser(token);
    }
  }, []);

  const apiService = new ApiService(user!);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    await apiService.importDb(file);
  };

  return (
    <ModalBase
      size="xs"
      title="Importador de base de datos"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div
        className={`border-dashed border-2 border-gray-400 rounded-md p-4 w-full text-center 
                    transition-all duration-500 ease-in-out transform hover:scale-125 
                    ${dragging ? "bg-gray-200 scale-125" : ""}`}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
      >
        <div className="pointer-events-auto">
          Arrastra y suelta un archivo CSV aquí
        </div>
      </div>
    </ModalBase>
  );
};
