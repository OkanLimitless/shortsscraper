import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "../components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "KVK PDF Generator",
  description: "Generate legal documents based on Dutch Chamber of Commerce templates",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-blue-700 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">KVK Document Generator</h1>
          </div>
        </header>
        <Navigation />
        {children}
        <footer className="bg-gray-100 p-4 mt-8">
          <div className="container mx-auto text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} KVK Document Generator - For legal purposes only</p>
            <p className="mt-1">This tool creates documents that mimic the style of Dutch Chamber of Commerce extracts.</p>
          </div>
        </footer>
      </body>
    </html>
  );
} 