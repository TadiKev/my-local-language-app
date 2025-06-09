// src/components/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-green-800 text-green-200">
    <div className="container mx-auto py-6 px-6 flex flex-col md:flex-row items-center justify-between">
      <p className="text-sm">&copy; {new Date().getFullYear()} LocalLang. All rights reserved.</p>
      <div className="space-x-4 mt-4 md:mt-0">
        <Link to="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link to="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
