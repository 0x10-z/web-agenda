import { useState } from "react";
import { ApiService } from "services/ApiService";
import { showToast } from "utils/util";
import { User } from "models/User";
import Footer from "components/Footer";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

function LoginForm({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const user = await ApiService.login(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        showToast(
          "El nombre de usuario o contraseña son incorrectos.",
          "error"
        );
      }
    } catch (error: any) {
      alert(`Ocurrió un error: ${error.message}`);
    }
  };

  return (
    <div className="flex h-full flex-col min-h-screen bg-gray-100 sm:justify-center items-center pt-6 sm:pt-0 overflow-y-hidden max-w-screen">
      <div className="flex-grow w-full sm:max-w-md mt-6 px-6 py-4 overflow-hidden sm:rounded-lg flex flex-col justify-center">
        <h2 className="text-center font-semibold text-3xl lg:text-4xl text-gray-800 mb-4">
          Iniciar sesión
        </h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="username"
            >
              Usuario
            </label>
            <input
              autoFocus
              className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
              id="username"
              type="username"
              name="username"
              placeholder="Ingresa tu username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
              id="password"
              type="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-pink-500 w-full hover:bg-pink-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Iniciar sesión
            </button>
          </div>
        </form>
      </div>
      <div className="flex items-end">
        <Footer />
      </div>
    </div>
  );
}

export default LoginForm;
