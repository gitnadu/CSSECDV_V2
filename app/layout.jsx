import "./globals.css";
import { SessionProvider } from "@/context/SessionProvider";

export const metadata = {
  title: "Enrollment System",
  description: "Distributed Online Enrollment Web App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
