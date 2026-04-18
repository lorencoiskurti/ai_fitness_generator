import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>
            © {currentYear} AI Fitness Generator. All rights reserved.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link to="/plans" className="text-gray-600 hover:text-gray-900 transition-colors">
              My Plans
            </Link>
            <Link to="/generate" className="text-gray-600 hover:text-gray-900 transition-colors">
              Generate Plan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}