/**
 * NotFound (404) Page Component
 * 
 * This component handles 404 errors when users navigate to non-existent routes in the
 * OrangeWave trading platform. It provides a user-friendly error page with navigation
 * options to guide users back to valid pages.
 * 
 * Features:
 * - Clean, centered 404 error display
 * - User-friendly error messaging
 * - Navigation link back to homepage
 * - Error logging for debugging and analytics
 * - Responsive design that works on all devices
 * - Professional branding consistent with the platform
 */

// React hooks and routing
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * NotFound Component
 * 
 * 404 error page component that handles:
 * - Display of user-friendly 404 error message
 * - Error logging for development and monitoring
 * - Navigation assistance to guide users back
 * - Responsive layout for all device types
 * 
 * @returns JSX.Element - The complete 404 error page
 */
const NotFound = () => {
  // Get current location for error logging
  const location = useLocation();

  /**
   * Error logging effect
   * 
   * Logs 404 errors to console for debugging purposes.
   * In production, this could be extended to send analytics
   * data to monitoring services for tracking broken links.
   */
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    // TODO: In production, consider sending this to analytics service
  }, [location.pathname]);

  return (
    // Full-screen container with centered content
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        {/* Large 404 number for immediate recognition */}
        <h1 className="text-4xl font-bold mb-4">404</h1>
        
        {/* User-friendly error message */}
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        
        {/* Navigation link back to safety */}
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
