import { useState, useEffect } from "react";
import "./App.css";
import PageHeader from "./components/PageHeader";
import Footer from "./components/Footer";
import Body from "./components/Body";
import { ToastContainer } from "react-toastify";
import { ApiService } from "services/ApiService";
import { User } from "./models/User";
import { Auth } from "./utils/auth";
import LoginForm from "./pages/Login";

const apiService = new ApiService();

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Auth.getToken();
    if (token) {
      // const userFromToken = JSON.parse(token);
      setUser(token);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    Auth.setToken(JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    Auth.removeToken();
  };
  return (
    <div
      className="text-gray-700 overflow-hidden min-h-screen flex flex-col bg-slate-200"
      suppressHydrationWarning={true}
    >
      {user ? (
        <>
          <PageHeader handleLogout={handleLogout} />
          <Body user={user} />
          <Footer />
          <ToastContainer />
        </>
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
