import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STOLENLogo } from "@/components/ui/STOLENLogo";
import { ArrowLeft, Shield, User, Clock, MapPin, Smartphone, AlertTriangle, CheckCircle, Upload, X, FileText, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
// Form persistence temporarily disabled to fix hot reload issues
// import { useFormPersistence } from "@/hooks/useFormPersistence";
// import AutocompleteInput from "@/components/shared/AutocompleteInput";

const ClaimDevice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthToken } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fetchingRef = useRef(false);
  const initialFormData = {
    serialNumber: "",
    imeiNumber: "",
    purchaseDate: "",
    purchaseLocation: "",
    additionalProof: "",
    contactEmail: "",
    contactPhone: "",
    fullName: "",
    receiptFile: null as File | null,
    policeReportFile: null as File | null,
    additionalFiles: [] as File[]
  };

  // Temporarily disable form persistence to fix hot reload issues
  const [formData, setFormData] = useState(initialFormData);
  
  const updateFormData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };
  
  const clearSavedData = () => {
    setFormData(initialFormData);
  };

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (fetchingRef.current) return; // Prevent multiple simultaneous fetches
      
      try {
        fetchingRef.current = true;
        console.log('🔍 Fetching post details for claim form, ID:', id);
        setLoading(true);
        
        // Fetch post details using Supabase
        const { data: postData, error: postError } = await supabase
          .from('lost_found_reports' as any)
          .select('*')
          .eq('id', id)
          .single();

        if (postError) {
          throw new Error(postError.message);
        }

        console.log('✅ Post details for claim:', postData);

        if (postData) {
          const data = postData as any;
          
          // Check if user has already claimed this device
          let alreadyClaimed = false;
          let existingClaimStatus = 'none';
          if (user) {
            const { data: existingClaim, error: claimError } = await supabase
              .from('device_claims')
              .select('id, claim_status')
              .eq('report_id', id)
              .eq('claimant_user_id', user.id)
              .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no claim exists
            
            if (!claimError && existingClaim) {
              alreadyClaimed = true;
              existingClaimStatus = existingClaim.claim_status || 'pending';
            }
          }
          
          setPost({
            id: data.id,
            type: data.report_type,
            device: data.device_model || data.device_category,
            description: data.description,
            location: data.location_address || 'Location not specified',
            timeAgo: formatTimeAgo(data.created_at),
            reward: data.reward_amount ? `R${data.reward_amount}` : null,
            verified: data.verification_status === 'verified',
            user: 'Anonymous', // We'll need to join with users table if needed
            claimed: alreadyClaimed || data.claim_status === 'claimed',
            claimStatus: existingClaimStatus !== 'none' ? existingClaimStatus : (data.claim_status || 'none')
          });
        } else {
          console.error('❌ Failed to load post for claim');
          toast.error("Failed to load device details");
          navigate("/lost-found");
        }
      } catch (error) {
        console.error('Error fetching post for claim:', error);
        toast.error("Error loading device details");
        navigate("/lost-found");
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    if (id) {
      fetchPostDetails();
    }
  }, [id]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serialNumber || !formData.fullName || !formData.contactEmail) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      console.log('📋 Submitting ownership claim...');
      
      if (!user) {
        toast.error("Please log in to submit a claim");
        return;
      }

      // Upload files to Supabase Storage first
      let receiptUrl = null;
      let policeReportUrl = null;
      const additionalFileUrls: string[] = [];

      // Upload receipt file with size validation
      if (formData.receiptFile) {
        if (formData.receiptFile.size > 10 * 1024 * 1024) {
          toast.error(`Receipt file is too large. Maximum size is 10MB.`);
        } else {
          const receiptFileName = `receipt_${Date.now()}_${formData.receiptFile.name}`;
          const { data: receiptData, error: receiptError } = await supabase.storage
            .from('lost-found-photos')
            .upload(receiptFileName, formData.receiptFile);
          
          if (receiptError) {
            console.error('Receipt upload error:', receiptError);
            toast.error(`Failed to upload receipt: ${receiptError.message}`);
          } else {
            receiptUrl = receiptData.path;
          }
        }
      }

      // Upload police report file with size validation
      if (formData.policeReportFile) {
        if (formData.policeReportFile.size > 10 * 1024 * 1024) {
          toast.error(`Police report file is too large. Maximum size is 10MB.`);
        } else {
          const policeFileName = `police_${Date.now()}_${formData.policeReportFile.name}`;
          const { data: policeData, error: policeError } = await supabase.storage
            .from('lost-found-photos')
            .upload(policeFileName, formData.policeReportFile);
          
          if (policeError) {
            console.error('Police report upload error:', policeError);
            toast.error(`Failed to upload police report: ${policeError.message}`);
          } else {
            policeReportUrl = policeData.path;
          }
        }
      }

      // Upload additional files with size validation
      for (const file of formData.additionalFiles) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }
        
        const additionalFileName = `additional_${Date.now()}_${file.name}`;
        const { data: additionalData, error: additionalError } = await supabase.storage
          .from('lost-found-photos')
          .upload(additionalFileName, file);
        
        if (additionalError) {
          console.error('Additional file upload error:', additionalError);
          toast.error(`Failed to upload ${file.name}: ${additionalError.message}`);
        } else {
          additionalFileUrls.push(additionalData.path);
        }
      }

      // Submit the claim using the Edge Function
      const claimPayload = {
        report_id: id,
        claimant_name: formData.fullName,
        claimant_email: formData.contactEmail,
        claimant_phone: formData.contactPhone,
        claim_type: 'ownership_claim',
        device_serial_provided: formData.serialNumber,
        device_imei_provided: formData.imeiNumber,
        device_mac_provided: formData.macAddress,
        ownership_proof: formData.additionalProof,
        claim_description: `Ownership claim for device. Purchase date: ${formData.purchaseDate}, Location: ${formData.purchaseLocation}. Receipt: ${receiptUrl ? 'Yes' : 'No'}, Police report: ${policeReportUrl ? 'Yes' : 'No'}, Additional files: ${additionalFileUrls.length}`
      };

      console.log('📤 Submitting claim via Edge Function...');
      const claimResponse = await fetch('/api/v1/submit-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(claimPayload)
      });

      const claimResult = await claimResponse.json();

      if (!claimResponse.ok) {
        throw new Error(claimResult.error || 'Failed to submit claim');
      }

      console.log('✅ Claim submitted successfully via Edge Function:', claimResult);

      // Send email notifications
      try {
        console.log('📧 Sending email notifications...');
        
        // Send notification to claimant
        const emailResponse = await fetch('/api/v1/send-contact-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            to_email: formData.contactEmail,
            to_name: formData.fullName,
            subject: 'Device Ownership Claim Submitted - STOLEN App',
            message: `Dear ${formData.fullName},\n\nYour ownership claim for the device has been successfully submitted and is now under review.\n\nClaim Details:\n- Device ID: ${id}\n- Serial Number: ${formData.serialNumber}\n- Submitted: ${new Date().toLocaleString()}\n\nYou will be notified once the admin reviews your claim. This process typically takes 1-3 business days.\n\nThank you for using STOLEN App.\n\nBest regards,\nSTOLEN Team`,
            notification_type: 'claim_submitted'
          })
        });

        if (emailResponse.ok) {
          console.log('✅ Email notification sent to claimant');
        } else {
          console.warn('⚠️ Failed to send email notification');
        }
      } catch (emailError) {
        console.warn('⚠️ Email notification error:', emailError);
      }

      toast.success("✅ Claim submitted successfully! Your claim is under review.");
      toast.info("📧 You'll receive an email confirmation shortly.");
      
      // Clear saved form data
      clearSavedData();
      
      // Update local state to show claim has been submitted
      setPost(prev => prev ? { ...prev, claimed: true, claimStatus: 'pending' } : prev);
      
      // Navigate back to community board
      setTimeout(() => {
        navigate("/lost-found");
      }, 2000);
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Device Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested device could not be found.</p>
          <Button onClick={() => navigate('/community-board')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community Board
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(`/lost-found/details/${id}`)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <STOLENLogo />
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Claim Device</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Device Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{post.device}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                Found by {post.user}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {post.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.timeAgo}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{post.description}</p>
            {post.reward && (
              <div className="mt-2">
                <span className="text-green-600 font-semibold">Reward: {post.reward}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ownership Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Prove Ownership</CardTitle>
            <p className="text-muted-foreground">
              To claim this device, please provide proof of ownership. This information will be verified by our admin team.
            </p>
          </CardHeader>
          <CardContent>
            {post.claimed ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold mb-2">Claim Already Submitted</p>
                <p className="text-sm">You have already submitted a claim for this device.</p>
                {post.claimStatus === 'pending' && (
                  <p className="text-sm mt-2 text-orange-600">Status: Under Review</p>
                )}
                {post.claimStatus === 'approved' && (
                  <p className="text-sm mt-2 text-green-600">Status: Approved</p>
                )}
                {post.claimStatus === 'rejected' && (
                  <p className="text-sm mt-2 text-red-600">Status: Rejected</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="+27 82 123 4567"
                />
              </div>

              {/* Device Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Device Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serialNumber">Serial Number *</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                      placeholder="Enter device serial number"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be verified against the device record
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="imeiNumber">IMEI Number</Label>
                    <Input
                      id="imeiNumber"
                      value={formData.imeiNumber}
                      onChange={(e) => handleInputChange("imeiNumber", e.target.value)}
                      placeholder="Enter IMEI number (if available)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchaseLocation">Purchase Location</Label>
                    <Input
                      id="purchaseLocation"
                      value={formData.purchaseLocation}
                      onChange={(e) => handleInputChange("purchaseLocation", e.target.value)}
                      placeholder="Store name or location"
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Proof Documents</h3>
                
                <div className="space-y-6">
                  {/* Purchase Receipt Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Purchase Receipt</Label>
                    <div className="relative p-4 border-2 border-dashed border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-primary/60 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload receipt, invoice, or proof of purchase
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('receiptFile')?.click()}
                          className="h-9 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        {formData.receiptFile && (
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">
                              {formData.receiptFile.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, receiptFile: null }))}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <input
                        id="receiptFile"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData(prev => ({ ...prev, receiptFile: file }));
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  {/* Police Report Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Police Report (if applicable)</Label>
                    <div className="relative p-4 border-2 border-dashed border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all">
                      <div className="text-center">
                        <FileText className="w-6 h-6 text-primary/60 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload police report if device was stolen
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('policeReportFile')?.click()}
                          className="h-9 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        {formData.policeReportFile && (
                          <div className="mt-2 flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">
                              {formData.policeReportFile.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, policeReportFile: null }))}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <input
                        id="policeReportFile"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData(prev => ({ ...prev, policeReportFile: file }));
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  {/* Additional Documents Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Additional Documents</Label>
                    <div className="relative p-4 border-2 border-dashed border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all">
                      <div className="text-center">
                        <FolderOpen className="w-6 h-6 text-primary/60 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Upload any other relevant documents (warranty, insurance, etc.)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('additionalFiles')?.click()}
                          className="h-9 border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </Button>
                        {formData.additionalFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {formData.additionalFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">
                                  {file.name}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newFiles = formData.additionalFiles.filter((_, i) => i !== index);
                                    setFormData(prev => ({ ...prev, additionalFiles: newFiles }));
                                  }}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        id="additionalFiles"
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setFormData(prev => ({ ...prev, additionalFiles: files }));
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Proof */}
              <div>
                <Label htmlFor="additionalProof">Additional Proof of Ownership</Label>
                <Textarea
                  id="additionalProof"
                  value={formData.additionalProof}
                  onChange={(e) => handleInputChange("additionalProof", e.target.value)}
                  placeholder="Describe any additional proof you have (receipt details, unique features, device history, etc.)"
                  rows={4}
                />
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Security Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      All information provided will be verified by our admin team. False claims may result in account suspension.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearSavedData}
                  className="px-6"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Form
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Claim...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Ownership Claim
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/lost-found/details/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>

        {/* Process Information */}
        <Card>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll verify your serial number and review your claim
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Admin Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Our admin team will review your claim within 24-48 hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Contact</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll contact you with the next steps or arrange device pickup
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClaimDevice;
