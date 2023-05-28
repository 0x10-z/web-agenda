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

  useEffect(() => {
    const token = Auth.getToken();
    if (token) {
      setUser(token);
    }
  }, []);

  const apiService = new ApiService(user!);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
        className="border-dashed border-2 border-gray-400 rounded-md p-4 w-full text-center"
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        Arrastra y suelta un archivo CSV aquí
      </div>
    </ModalBase>
  );
};
