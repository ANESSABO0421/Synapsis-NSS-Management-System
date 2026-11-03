import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import EmotionRegistry from "@/components/EmotionRegistry";
import { SocketProvider } from "@/context/SocketContext";
import ApiSetup from "@/components/ApiSetup";

export const metadata = {
  title: "Synapsis-NSS management System",
  description: "NSS volunteer, event and mentorship management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <ApiSetup />
          <SocketProvider>
            <ToastContainer position="top-center" autoClose={3000} />
            {children}
          </SocketProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
