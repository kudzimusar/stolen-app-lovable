# 🔍 Algolia Setup Guide for Search Optimization

## Step 1: Create Algolia Account

### Sign Up
1. Go to [Algolia](https://www.algolia.com/)
2. Click "Start Free"
3. Fill in your details
4. Verify your email

## Step 2: Create Application

### Create App
1. After signup, create your first application
2. Choose a name: `stolen-app`
3. Select your region (closest to your users)
4. Click "Create Application"

## Step 3: Get API Keys

### Find Your Keys
1. Go to "API Keys" in your dashboard
2. You'll need:
   - **Application ID**: Your app identifier
   - **Search-Only API Key**: For frontend search
   - **Admin API Key**: For backend operations (keep secret!)

### Security Note
- Never expose your Admin API Key in frontend code
- Use Search-Only API Key for client-side operations
- Use Admin API Key only in secure backend environments

## Step 4: Create Search Indices

### Create Indices
You'll need these indices for your app:

1. **devices** - For device search
2. **users** - For user search  
3. **transactions** - For transaction search
4. **marketplace** - For marketplace listings
5. **insurance** - For insurance policies
6. **law-enforcement** - For law enforcement cases

### Create Each Index
1. Go to "Search" → "Index"
2. Click "Create Index"
3. Name it (e.g., `devices`)
4. Repeat for all indices

## Step 5: Configure Index Settings

### Basic Configuration
For each index, configure:

```json
{
  "searchableAttributes": [
    "name",
    "description",
    "category",
    "location"
  ],
  "attributesForFaceting": [
    "category",
    "status",
    "location",
    "priceRange"
  ],
  "ranking": [
    "typo",
    "geo",
    "words",
    "filters",
    "proximity",
    "attribute",
    "exact",
    "custom"
  ]
}
```

### Index-Specific Settings

#### Devices Index
```json
{
  "searchableAttributes": [
    "name",
    "description",
    "category",
    "brand",
    "model",
    "location"
  ],
  "attributesForFaceting": [
    "category",
    "status",
    "location",
    "brand"
  ]
}
```

#### Users Index
```json
{
  "searchableAttributes": [
    "name",
    "email",
    "phone",
    "location"
  ],
  "attributesForFaceting": [
    "role",
    "location",
    "status"
  ]
}
```

## Step 6: Update Environment Variables

Add to your `.env` file:
```bash
VITE_ALGOLIA_APP_ID=your-application-id
VITE_ALGOLIA_SEARCH_KEY=your-search-only-api-key
VITE_ALGOLIA_ADMIN_KEY=your-admin-api-key
```

## Step 7: Test Search

### Test Script
Create a test file to verify your setup:

```javascript
// test-algolia.js
import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID,
  process.env.VITE_ALGOLIA_SEARCH_KEY
);

const devicesIndex = searchClient.initIndex('devices');

// Test search
devicesIndex.search('phone').then(({ hits }) => {
  console.log('Search results:', hits);
});
```

## Step 8: Free Tier Limits

### Algolia Free Plan Includes:
- 10,000 search operations/month
- 1,000 indexing operations/month
- 1 GB storage
- 1 application
- 10 indices

### Monitoring Usage
1. Go to "Usage" in your dashboard
2. Monitor your monthly usage
3. Upgrade if needed

## Step 9: Index Your Data

### Sample Data Structure
```javascript
// Example device object
{
  objectID: 'device_123',
  name: 'iPhone 13 Pro',
  description: 'Apple iPhone 13 Pro 256GB',
  category: 'smartphone',
  brand: 'Apple',
  model: 'iPhone 13 Pro',
  status: 'lost',
  location: 'New York',
  userId: 'user_456',
  createdAt: '2024-01-15T10:30:00Z'
}
```

### Indexing Script
```javascript
// index-data.js
import algoliasearch from 'algoliasearch';

const adminClient = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID,
  process.env.VITE_ALGOLIA_ADMIN_KEY
);

const devicesIndex = adminClient.initIndex('devices');

// Index sample data
const sampleDevices = [
  {
    objectID: 'device_1',
    name: 'iPhone 13 Pro',
    description: 'Apple iPhone 13 Pro 256GB',
    category: 'smartphone',
    brand: 'Apple',
    status: 'lost',
    location: 'New York'
  }
  // Add more devices...
];

devicesIndex.saveObjects(sampleDevices).then(({ objectIDs }) => {
  console.log('Indexed objects:', objectIDs);
});
```

## Verification

Test your Algolia connection:
```bash
# Run the test script
node test-algolia.js
```

## Next Steps
1. Complete Algolia setup
2. Move to Sentry setup
3. Test search functionality in your app
