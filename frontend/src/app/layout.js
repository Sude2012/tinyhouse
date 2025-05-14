import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

export const metadata = {
  title: "Tiny House App",
  description: "Reservation System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <page />
        <Footer />
      </body>
    </html>
  );
}
