// ============================================================================
// FIX FOR CLAIM DEVICE LOOPING ISSUE
// ============================================================================
// This is a patch to fix the infinite loading loop in ClaimDevice.tsx
// ============================================================================

// Add this to the ClaimDevice.tsx component around line 50-103:

useEffect(() => {
  const fetchPostDetails = async () => {
    if (fetchingRef.current) return; // Prevent multiple simultaneous fetches
    
    try {
      fetchingRef.current = true;
      console.log('🔍 Fetching post details for claim form, ID:', id);
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('❌ Request timeout - record may not exist');
        setLoading(false);
        fetchingRef.current = false;
        toast.error("Device record not found or request timed out");
        navigate("/community-board");
      }, 10000); // 10 second timeout
      
      // Fetch post details using Supabase
      const { data: postData, error: postError } = await supabase
        .from('lost_found_reports' as any)
        .select('*')
        .eq('id', id)
        .single();

      clearTimeout(timeoutId); // Clear timeout if request completes

      if (postError) {
        console.error('❌ Database error:', postError);
        throw new Error(postError.message);
      }

      console.log('✅ Post details for claim:', postData);

      if (postData) {
        const data = postData as any;
        setPost({
          id: data.id,
          type: data.report_type,
          device: data.device_model || data.device_category,
          description: data.description,
          location: data.location_address || 'Location not specified',
          timeAgo: formatTimeAgo(data.created_at),
          reward: data.reward_amount ? `R${data.reward_amount}` : null,
          verified: data.verification_status === 'verified',
          user: 'Anonymous' // We'll need to join with users table if needed
        });
      } else {
        console.error('❌ No data returned for ID:', id);
        toast.error("Device record not found");
        navigate("/community-board");
      }
    } catch (error) {
      console.error('❌ Error fetching post for claim:', error);
      toast.error("Error loading device details: " + (error as Error).message);
      navigate("/community-board");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  if (id) {
    fetchPostDetails();
  } else {
    console.error('❌ No ID provided for claim form');
    toast.error("Invalid device ID");
    navigate("/community-board");
  }
}, [id, navigate]); // Add navigate to dependencies

// ============================================================================
// ALTERNATIVE: Add this check at the beginning of the component
// ============================================================================

// Add this right after the component starts:
useEffect(() => {
  // Validate the ID format
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    console.error('❌ Invalid UUID format:', id);
    toast.error("Invalid device ID format");
    navigate("/community-board");
    return;
  }
}, [id, navigate]);
