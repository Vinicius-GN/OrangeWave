
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Plus, Edit } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

interface CardData {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}

const CreditCardForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [hasCard, setHasCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const authToken = localStorage.getItem('authToken');

  const fetchCardInfo = async () => {
    if (!user || !authToken) return;
    
    setIsFetching(true);
    try {
      const response = await fetch(`${API_URL}/wallet/${user._id}/balance`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.cardNumber && data.cardNumber.length > 0) {
          setHasCard(true);
          // Display masked card number
          const maskedNumber = data.cardNumber.replace(/\d(?=\d{4})/g, '*');
          setCardData(prev => ({
            ...prev,
            cardNumber: maskedNumber
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !authToken) return;

    // Basic validation
    if (!cardData.cardNumber || !cardData.cardHolderName || !cardData.expiryDate || !cardData.cvv) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      });
      return;
    }

    // Validate card number (remove spaces and check if numeric)
    const cleanCardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCardNumber)) {
      toast({
        title: 'Invalid Card Number',
        description: 'Please enter a valid card number.',
        variant: 'destructive'
      });
      return;
    }

    // Validate expiry date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      toast({
        title: 'Invalid Expiry Date',
        description: 'Please enter date in MM/YY format.',
        variant: 'destructive'
      });
      return;
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      toast({
        title: 'Invalid CVV',
        description: 'Please enter a valid 3 or 4 digit CVV.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/wallet/${user._id}/card`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber: cleanCardNumber
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: hasCard ? 'Card updated successfully!' : 'Card added successfully!',
        });
        setHasCard(true);
        setIsEditing(false);
        await fetchCardInfo();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to save card information.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: 'Error',
        description: 'Failed to save card information.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  useEffect(() => {
    fetchCardInfo();
  }, [user, authToken]);

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
                <p className="text-sm text-muted-foreground">Registered card</p>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {hasCard ? 'Edit Payment Method' : 'Add Payment Method'}
        </CardTitle>
        <CardDescription>
          {hasCard ? 'Update your credit card information' : 'Add a credit card for deposits and withdrawals'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) => setCardData(prev => ({
                ...prev,
                cardNumber: formatCardNumber(e.target.value)
              }))}
              maxLength={19}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardHolderName">Cardholder Name</Label>
            <Input
              id="cardHolderName"
              placeholder="John Doe"
              value={cardData.cardHolderName}
              onChange={(e) => setCardData(prev => ({
                ...prev,
                cardHolderName: e.target.value
              }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => setCardData(prev => ({
                  ...prev,
                  expiryDate: formatExpiryDate(e.target.value)
                }))}
                maxLength={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => setCardData(prev => ({
                  ...prev,
                  cvv: e.target.value.replace(/\D/g, '')
                }))}
                maxLength={4}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (hasCard ? 'Update Card' : 'Add Card')}
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
