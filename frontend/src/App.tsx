import { useState, useEffect } from "react";
import "App.css";
import PageHeader from "components/PageHeader";
import Footer from "components/Footer";
import Body from "components/Body";
import { ToastContainer } from "react-toastify";
import { User } from "models/User";
import { Auth } from "utils/auth";
import LoginForm from "pages/Login";

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
    <div className="text-gray-700 overflow-hidden min-h-screen flex flex-col bg-slate-200">
      {user ? (
        <div className="p-4">
          <PageHeader handleLogout={handleLogout} />
          <Body user={user} />
          <Footer />
        </div>
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
      <ToastContainer />
    </div>
  );
}

export default App;
