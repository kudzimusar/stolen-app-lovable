# ☁️ Cloudinary Setup Guide for Image Optimization

## Step 1: Create Cloudinary Account

### Sign Up
1. Go to [Cloudinary](https://cloudinary.com/)
2. Click "Sign Up For Free"
3. Fill in your details
4. Verify your email

## Step 2: Get Your Credentials

### Dashboard Access
1. Log in to your Cloudinary dashboard
2. You'll see your account details on the main page

### Required Information
You'll need these values:
- **Cloud Name**: Your unique cloud identifier
- **API Key**: Your API access key
- **API Secret**: Your API secret key

## Step 3: Create Upload Preset

### Create Preset
1. Go to "Settings" → "Upload"
2. Scroll down to "Upload presets"
3. Click "Add upload preset"
4. Set preset name: `stolen-app`
5. Set signing mode to "Unsigned"
6. Click "Save"

### Preset Configuration
```json
{
  "name": "stolen-app",
  "signing_mode": "unsigned",
  "allowed_formats": ["jpg", "png", "gif", "webp"],
  "max_file_size": 10485760,
  "max_image_width": 4000,
  "max_image_height": 4000
}
```

## Step 4: Update Environment Variables

Add to your `.env` file:
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=stolen-app
```

## Step 5: Test Image Upload

### Test Script
Create a test file to verify your setup:

```javascript
// test-cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test upload
cloudinary.uploader.upload(
  'https://via.placeholder.com/300x200',
  { folder: 'stolen-app/test' },
  (error, result) => {
    if (error) {
      console.error('Upload failed:', error);
    } else {
      console.log('Upload successful:', result.secure_url);
    }
  }
);
```

## Step 6: Free Tier Limits

### Cloudinary Free Plan Includes:
- 25 GB storage
- 25 GB bandwidth/month
- 25,000 transformations/month
- 25,000 uploads/month

### Monitoring Usage
1. Go to "Usage" in your dashboard
2. Monitor your monthly usage
3. Upgrade if needed

## Verification

Test your Cloudinary connection:
```bash
# Run the test script
node test-cloudinary.js
```

## Next Steps
1. Complete Cloudinary setup
2. Move to Algolia setup
3. Test image optimization in your app
