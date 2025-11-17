
import "./globals.css";


export const metadata = {
  title: "CSE407 IoT Device Power Consumption App By Shams",
  description: "Real-Time IoT Device Power Consumption Monitoring Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
