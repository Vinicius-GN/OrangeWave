// Tailwind CSS configuration for the OrangeWave trading platform
// This config defines the design system including colors, animations, and responsive breakpoints
import type { Config } from "tailwindcss";

export default {
	// Enable dark mode using CSS classes (toggle via 'dark' class on HTML element)
	darkMode: ["class"],
	
	// Define which files Tailwind should scan for class usage
	content: [
		"./pages/**/*.{ts,tsx}",     // Next.js pages directory
		"./components/**/*.{ts,tsx}", // React components
		"./app/**/*.{ts,tsx}",       // App directory (Next.js 13+)
		"./src/**/*.{ts,tsx}",       // Source files
	],
	
	// No custom prefix for utility classes
	prefix: "",
	
	theme: {
		// Container configuration for responsive layouts
		container: {
			center: true,              // Center containers by default
			padding: '1.5rem',         // Add horizontal padding
			screens: {
				'2xl': '1400px'        // Max width for 2xl breakpoint
			}
		},
		extend: {
			// Custom color palette for OrangeWave brand and UI components
			colors: {
				// CSS variable-based colors for dynamic theming
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',           // Focus ring color
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				// Brand orange color palette (primary brand color)
				orange: {
					DEFAULT: '#FF7700',    // Main orange brand color
					50: '#FFF2E5',        // Lightest orange tint
					100: '#FFE5CC',       // Very light orange
					200: '#FFCB99',       // Light orange
					300: '#FFB266',       // Medium-light orange
					400: '#FF9833',       // Medium orange
					500: '#FF7700',       // Base orange (same as DEFAULT)
					600: '#CC5F00',       // Dark orange
					700: '#994700',       // Darker orange
					800: '#663000',       // Very dark orange
					900: '#331800'        // Darkest orange
				},
				
				// Semantic color tokens using CSS variables for theme switching
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',      // Error/danger states
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',           // Subdued content
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',          // Accent/highlight color
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',         // Popover backgrounds
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',            // Card backgrounds
					foreground: 'hsl(var(--card-foreground))'
				}
			},
			
			// Custom border radius values using CSS variables
			borderRadius: {
				lg: 'var(--radius)',                        // Large radius
				md: 'calc(var(--radius) - 2px)',            // Medium radius
				sm: 'calc(var(--radius) - 4px)'             // Small radius
			},
			
			// Custom keyframe animations for UI interactions
			keyframes: {
				// Accordion expand animation (for collapsible content)
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				// Accordion collapse animation
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				// Simple fade-in animation for smooth content reveals
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				}
			},
			
			// Animation utility classes using the defined keyframes
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',  // Quick accordion expand
				'accordion-up': 'accordion-up 0.2s ease-out',      // Quick accordion collapse  
				'fade-in': 'fade-in 0.3s ease-out'                 // Smooth fade-in transition
			}
		}
	},
	
	// Include the tailwindcss-animate plugin for additional animation utilities
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
