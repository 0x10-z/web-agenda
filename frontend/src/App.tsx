import React from "react";
import "./App.css";
import PageHeader from "./components/PageHeader";
import Footer from "./components/Footer";
import Body from "./components/Body";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div
      className="text-gray-700 overflow-hidden min-h-screen flex flex-col bg-slate-200"
      suppressHydrationWarning={true}
    >
      <PageHeader />
      <Body />
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App;
