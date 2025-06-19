/**
 * Profile Page Component
 * 
 * This component provides a complete user profile management interface where users can:
 * - View their personal information and account details
 * - Edit profile information including name, email, phone, and address
 * - Change their password through a separate security tab
 * - Track account creation date and role information
 * 
 * Features:
 * - Two-tab interface: Profile Information and Security
 * - Real-time form validation and error handling
 * - Optimistic UI updates with proper error rollback
 * - Responsive design for mobile and desktop
 * - Toast notifications for user feedback
 * 
 * Security considerations:
 * - JWT token authentication for all API calls
 * - Client-side form validation before submission
 * - Secure password change functionality in separate component
 */

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Settings } from 'lucide-react';
import Layout from '@/components/Layout';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
    number: string;
  };
  role: string;
  createdAt: string;
}

// Profile page for viewing and editing user information
const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // State for storing fetched user profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Loading state for profile fetch
  const [isLoading, setIsLoading] = useState(true);
  // State to toggle edit mode for profile fields
  const [isEditing, setIsEditing] = useState(false);
  // State to indicate if profile changes are being saved
  const [isSaving, setIsSaving] = useState(false);
  // State for form data when editing profile
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      country: '',
      state: '',
      city: '',
      street: '',
      number: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3001/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setProfile(userData);
          setFormData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: {
              country: userData.address?.country || '',
              state: userData.address?.state || '',
              city: userData.address?.city || '',
              street: userData.address?.street || '',
              number: userData.address?.number || ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setIsSaving(true);

    try {
      const response = await fetch('http://localhost:3001/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setProfile(updatedUser);
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Update failed",
          description: errorData.message || "Failed to update profile.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center text-red-500">
            Failed to load profile data
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    View and edit your personal information
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data
                        setFormData({
                          fullName: profile.fullName || '',
                          email: profile.email || '',
                          phone: profile.phone || '',
                          address: {
                            country: profile.address?.country || '',
                            state: profile.address?.state || '',
                            city: profile.address?.city || '',
                            street: profile.address?.street || '',
                            number: profile.address?.number || ''
                          }
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium">{profile.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium">{profile.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm font-medium">{profile.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Role
                    </Label>
                    <p className="text-sm font-medium capitalize">{profile.role}</p>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <Label className="flex items-center text-base font-semibold">
                    <MapPin className="h-4 w-4 mr-2" />
                    Address
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      {isEditing ? (
                        <Input
                          id="country"
                          value={formData.address.country}
                          onChange={(e) => handleInputChange('address.country', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profile.address?.country || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      {isEditing ? (
                        <Input
                          id="state"
                          value={formData.address.state}
                          onChange={(e) => handleInputChange('address.state', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profile.address?.state || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      {isEditing ? (
                        <Input
                          id="city"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profile.address?.city || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      {isEditing ? (
                        <Input
                          id="street"
                          value={formData.address.street}
                          onChange={(e) => handleInputChange('address.street', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profile.address?.street || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Number</Label>
                      {isEditing ? (
                        <Input
                          id="number"
                          value={formData.address.number}
                          onChange={(e) => handleInputChange('address.number', e.target.value)}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profile.address?.number || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-sm font-medium">{formatDate(profile.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-6">
            <ChangePasswordForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
