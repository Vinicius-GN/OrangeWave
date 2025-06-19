/**
 * \file CreditCardForm.tsx
 * \brief React component for managing payment methods via credit card.
 *
 * This component allows:
 *  - Fetching and displaying information of an already registered card (if any).
 *  - Adding a new credit card.
 *  - Editing information of an existing card.
 *  - Validating form fields (number, expiration date, CVV).
 *  - Displaying loading states and feedback via toast notifications.
 *
 * Depends on the following hooks and components:
 *  - useAuth (to obtain the authenticated user)
 *  - useToast (for notifications)
 *  - UI Components: Card, CardHeader, CardContent, Button, Input, Label
 *  - Icons: CreditCard, Plus, Edit (lucide-react)
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Plus, Edit } from 'lucide-react';

/**
 * \brief Base URL for credit card management API calls.
 */
const API_URL = 'http://localhost:3001/api';

/**
 * \struct CardData
 * \brief Structure representing the credit card form fields.
 *
 * \var CardData::cardNumber       The card number (formatted with spaces).
 * \var CardData::cardHolderName   The name of the cardholder as printed on the card.
 * \var CardData::expiryDate       The expiration date in MM/YY format.
 * \var CardData::cvv              The security code (3 or 4 digits).
 */
interface CardData {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}

/**
 * \brief Main component that manages the credit card form.
 *
 * Displays different states based on:
 *  - isFetching: initial data fetch in progress
 *  - hasCard && !isEditing: shows the registered card
 *  - !hasCard && !isEditing: prompts the user to add a new card
 *  - isEditing: renders the form to add/edit a card
 *
 * \return JSX.Element  The card UI or form UI for the user.
 */
const CreditCardForm = (): JSX.Element => {
  /** \brief Authenticated user object from context. */
  const { user } = useAuth();
  /** \brief Hook to display toast notifications. */
  const { toast } = useToast();

  /** \brief State object holding form field values. */
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
  });
  /** \brief Indicates if a card is already registered. */
  const [hasCard, setHasCard] = useState<boolean>(false);
  /** \brief Indicates if the save operation is in progress. */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /** \brief Indicates if the form is in edit mode. */
  const [isEditing, setIsEditing] = useState<boolean>(false);
  /** \brief Indicates if the card data is currently being fetched. */
  const [isFetching, setIsFetching] = useState<boolean>(true);

  /** \brief Authentication token stored in localStorage. */
  const authToken = localStorage.getItem('authToken');

  /**
   * \brief Fetches the user's existing credit card information.
   *
   * If a card number is found, sets `hasCard` to true, masks the number
   * (showing only the last four digits), and updates `cardData`.
   */
  const fetchCardInfo = async (): Promise<void> => {
    if (!user || !authToken) {
      return;
    }
    setIsFetching(true);
    try {
      const response = await fetch(
        `${API_URL}/wallet/${user._id}/balance`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.cardNumber && data.cardNumber.length > 0) {
          setHasCard(true);
          const maskedNumber = data.cardNumber.replace(/\d(?=\d{4})/g, '*');
          setCardData((prev) => ({
            ...prev,
            cardNumber: maskedNumber,
          }));
        } else {
          setHasCard(false);
        }
      }
    } catch (error) {
      console.error('Error fetching card info:', error);
      setHasCard(false);
    } finally {
      setIsFetching(false);
    }
  };

  /**
   * \brief Form submission handler for credit card add/edit.
   *
   * Validates all fields before making the API call:
   *  - Ensures all fields are filled
   *  - Checks card number format and length
   *  - Validates expiration date in MM/YY format
   *  - Validates CVV as 3- or 4-digit numeric value
   * On success, shows a toast notification and re-fetches the card info.
   *
   * \param e  The React form submission event.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!user || !authToken) {
      return;
    }
    // Basic field presence validation
    if (
      !cardData.cardNumber ||
      !cardData.cardHolderName ||
      !cardData.expiryDate ||
      !cardData.cvv
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }
    // Clean spaces and validate card number digits/length
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCardNumber)) {
      toast({
        title: 'Invalid Card Number',
        description: 'Please enter a valid card number.',
        variant: 'destructive',
      });
      return;
    }
    // Validate expiration date format MM/YY
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      toast({
        title: 'Invalid Expiry Date',
        description: 'Please enter date in MM/YY format.',
        variant: 'destructive',
      });
      return;
    }
    // Validate CVV (3 or 4 digits)
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      toast({
        title: 'Invalid CVV',
        description: 'Please enter a valid 3 or 4 digit CVV.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/wallet/${user._id}/card`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cardNumber: cleanCardNumber }),
        }
      );
      if (response.ok) {
        toast({
          title: 'Success',
          description: hasCard
            ? 'Card updated successfully!'
            : 'Card added successfully!',
        });
        setHasCard(true);
        setIsEditing(false);
        await fetchCardInfo();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description:
            errorData.message || 'Failed to save card information.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: 'Error',
        description: 'Failed to save card information.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * \brief Formats the card number input by inserting spaces every 4 digits.
   *
   * \param value  The raw input string.
   * \return string The formatted string (e.g., "1234 5678 9012 3456").
   */
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  /**
   * \brief Formats the expiry date input by inserting a slash after two digits.
   *
   * \param value  The raw input string.
   * \return string The formatted string (e.g., "MM/YY").
   */
  const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  /** \brief Fetch card info when component mounts or when user/token changes. */
  useEffect(() => {
    fetchCardInfo();
  }, [user, authToken]);

  // Show skeleton card while fetching initial data
  if (isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>Loading card information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-16 bg-secondary rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Display the registered card when exists and not editing
  if (hasCard && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>Your registered credit card</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{cardData.cardNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Registered card
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prompt to add a new card when none exists
  if (!hasCard && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>No card found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No card found. Please register a credit card to enable deposits.
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Credit Card
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Form for adding or editing a card
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {hasCard ? 'Edit Payment Method' : 'Add Payment Method'}
        </CardTitle>
        <CardDescription>
          {hasCard
            ? 'Update your credit card information'
            : 'Add a credit card for deposits and withdrawals'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number Field */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) =>
                setCardData((prev) => ({
                  ...prev,
                  cardNumber: formatCardNumber(e.target.value),
                }))
              }
              maxLength={19}
            />
          </div>
          {/* Cardholder Name Field */}
          <div className="space-y-2">
            <Label htmlFor="cardHolderName">Cardholder Name</Label>
            <Input
              id="cardHolderName"
              placeholder="John Doe"
              value={cardData.cardHolderName}
              onChange={(e) =>
                setCardData((prev) => ({
                  ...prev,
                  cardHolderName: e.target.value,
                }))
              }
            />
          </div>
          {/* Expiry Date and CVV Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) =>
                  setCardData((prev) => ({
                    ...prev,
                    expiryDate: formatExpiryDate(e.target.value),
                  }))
                }
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) =>
                  setCardData((prev) => ({
                    ...prev,
                    cvv: e.target.value.replace(/\D/g, ''),
                  }))
                }
                maxLength={4}
              />
            </div>
          </div>
          {/* Action Buttons: Save or Cancel */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : hasCard
                ? 'Update Card'
                : 'Add Card'}
            </Button>
            {hasCard && isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  fetchCardInfo();
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreditCardForm;
