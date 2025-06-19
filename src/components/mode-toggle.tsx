/**
 * @file ModeToggle.tsx
 * @brief Component to toggle between light, dark, and system themes.
 *
 * This component renders a button that, when clicked, opens a dropdown
 * menu with three theme options:
 *  - Light: forces the light theme
 *  - Dark: forces the dark theme
 *  - System: follows the operating system setting
 *
 * It uses the `useTheme` hook from `next-themes` to update the application
 * theme in real time, and leverages the custom UI components `<Button>` and
 * `<DropdownMenu>` for the interface.
 */

import * as React from "react";
/** Hook from Next.js Themes that provides methods to read and change the current theme */
import { useTheme } from "next-themes";
/** Icons representing sun (light) and moon (dark) */
import { Moon, Sun } from "lucide-react";

/** Styled Button component used as the dropdown trigger */
import { Button } from "@/components/ui/button";
/** Components composing the custom dropdown menu */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * @brief Renders the theme toggle control.
 *
 * This component displays a button with animated sun and moon icons.
 * When clicked, it opens a right-aligned dropdown with three items:
 *  - Light: calls `setTheme("light")`
 *  - Dark: calls `setTheme("dark")`
 *  - System: calls `setTheme("system")`
 *
 * Changing the theme automatically updates components that depend on
 * the theme context (for example, Tailwind's `dark:` classes).
 *
 * @return JSX.Element A React element containing the theme dropdown.
 */
export function ModeToggle(): JSX.Element {
  /** @brief Function to change the current theme; obtained from `useTheme()`. */
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      {/**
       * @section Dropdown Trigger
       * Uses `<DropdownMenuTrigger asChild>` to wrap the Button as the trigger.
       * The Button contains two overlapping icons (Sun and Moon) that animate
       * rotation/scale based on the Tailwind `dark:` classes.
       */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {/** Sun icon, visible in light theme (default state) */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/** Moon icon, visible in dark theme */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {/** Screen-reader-only text for accessibility */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      {/**
       * @section Dropdown Content
       * Aligns the menu to the end (`align="end"`) and lists three clickable items.
       * Each `DropdownMenuItem` invokes `setTheme(...)` with the corresponding value.
       */}
      <DropdownMenuContent align="end">
        {/** Option to switch to light theme */}
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        {/** Option to switch to dark theme */}
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        {/** Option to follow the operating system theme */}
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
