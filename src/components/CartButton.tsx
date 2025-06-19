/**
 * @file CartButton.tsx
 * @brief React component that renders the shopping cart icon with item count badge
 *        and handles user sign-out logic via AuthContext.
 *
 * This component provides a visual button that:
 *  - Links to the cart page (`/cart`)
 *  - Displays the current number of items in the cart as a badge
 *  - Uses authentication context to access user info and logout function
 *  - Navigates to home on successful sign-out
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

/**
 * @brief CartButton component definition.
 *
 * Uses React hooks and context to display:
 *  - Cart icon button linking to the cart page
 *  - Item count badge when cartCount > 0
 *  - (Optional) User dropdown for profile and logout, currently disabled
 *
 * @return JSX.Element Rendered cart button UI.
 */
const CartButton = (): JSX.Element => {
  /**
   * @brief Authentication context providing user object and logout method.
   * @const user   The current authenticated user object or null if not logged in.
   * @const logout Function to sign the user out.
   */
  const { user, logout } = useAuth();

  /**
   * @brief Cart context providing the number of items in the cart.
   * @const cartCount Integer count of items currently in the shopping cart.
   */
  const { cartCount } = useCart();

  /**
   * @brief React Router hook for imperative navigation.
   * @const navigate Function to programmatically change route.
   */
  const navigate = useNavigate();

  /**
   * @brief Local state to control dropdown open/close (unused here but set up).
   * @const dropdownOpen Boolean flag indicating if the dropdown menu is open.
   * @const setDropdownOpen Setter function to update dropdownOpen state.
   */
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  /**
   * @brief Handles user sign-out by calling logout() and navigating home.
   *
   * Wraps the logout call in try/catch to handle potential errors.
   * On success, redirects the user to the root path ('/').
   *
   * @async
   * @function handleSignOut
   */
  const handleSignOut = async (): Promise<void> => {
    try {
      // Invoke the logout method from AuthContext
      await logout();
      // Navigate to the homepage after successful logout
      navigate('/');
    } catch (error) {
      // Log error if sign-out fails
      console.error('Error signing out:', error);
    }
  };

  /**
   * @brief Renders the CartButton component UI.
   *
   * The structure includes:
   *  - <Link> wrapping a <Button> linking to "/cart"
   *  - <ShoppingCart> icon inside the button
   *  - Conditional <Badge> showing cartCount when > 0
   *
   * @returns JSX.Element
   */
  return (
    <div className="flex gap-2">
      {/** Link to the cart page */}
      <Link to="/cart">
        {/** Icon button for the cart */}
        <Button variant="ghost" size="icon" className="relative">
          {/** Shopping cart icon from lucide-react */}
          <ShoppingCart className="h-5 w-5" />
          {/** If cartCount is greater than zero, display badge */}
          {cartCount > 0 && (
            /**
             * Badge component from UI library
             * Positioned absolutely at top-right corner of the button
             * Displays the numeric cartCount
             */
            <Badge
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-orange-500 text-white"
              variant="outline"
            >
              {cartCount}
            </Badge>
          )}
        </Button>
      </Link>

      {/**
       * Uncomment the section below to enable a user dropdown menu
       * that shows profile and logout options.
       */}
      {/*
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link to="/profile" className="flex items-center gap-2">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      */}
    </div>
  );
};

export default CartButton;
