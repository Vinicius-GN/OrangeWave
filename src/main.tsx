// Main entry point for the OrangeWave React application
// This file initializes the React DOM and renders the root App component

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create React root and render the main App component
// The non-null assertion (!) is safe here as the root element is guaranteed to exist in index.html
createRoot(document.getElementById("root")!).render(<App />);
