# Phase 2: Frontend Components Implementation Plan

## Overview
Update all frontend components to display real data from the enhanced APIs instead of mock data.

---

## Component 1: ProductDetail.tsx ✅ (Mostly Done)

### Current Status
- ✅ Already fetching real data from marketplace-listings API
- ✅ Has fallback to mock data if API fails
- ⚠️ Child components (TrustVisualization, PriceHistoryChart) use mock data

### What Needs To Be Done
1. **Pass real data to child components**:
   - `TrustVisualization` - Pass listing.verifications, listing.riskAssessment, listing.ownershipHistory
   - `PriceHistoryChart` - Pass listing.priceHistory
   - Display listing.repairs in Repairs tab
   - Display listing.certificates in Certificates tab

2. **Update data mapping**:
   - Map API response to component props
   - Remove fallback mock data once API is stable

### API Data Available
All data needed is already being returned by marketplace-listings API:
```typescript
{
  verifications: [...],
  riskAssessment: {...},
  certificates: [...],
  repairs: [...],
  ownershipHistory: [...],
  priceHistory: [...],
  seller: { rating, verification, etc. },
  trustScore: 94,
  verificationLevel: "premium"
}
```

---

## Component 2: TrustVisualization.tsx ⚠️ (Needs Update)

### Current Status
- ❌ Uses 100% mock data
- Has interfaces defined for all data types
- Well-structured component with tabs

### What Needs To Be Done
1. **Accept real data as props**:
```typescript
interface TrustVisualizationProps {
  deviceId: string;
  verifications: Verification[];
  riskAssessment: RiskAssessment;
  ownershipHistory: OwnershipRecord[];
  certificates: Certificate[];
  trustScore: number;
  verificationLevel: string;
  serialStatus: string;
  blockchainHash: string;
}
```

2. **Remove mock data generation**:
   - Delete `mockData` object
   - Use props directly

3. **Map API data to component format**:
   - Transform verifications array
   - Transform ownership history
   - Transform certificates
   - Calculate trust score display

---

## Component 3: PriceHistoryChart.tsx ⚠️ (Needs Update)

### Current Status
- ❌ Uses hardcoded mock data
- Simple recharts implementation

### What Needs To Be Done
1. **Accept real price history as props**:
```typescript
interface PriceHistoryChartProps {
  priceHistory: Array<{
    price: number;
    currency: string;
    recordedAt: string;
    changeType: string;
  }>;
}
```

2. **Transform API data for chart**:
   - Group by month
   - Calculate averages if multiple prices per month
   - Format dates for display

---

## Component 4: DeviceRegister.tsx ⚠️ (Needs Enhancement)

### Current Status
- ✅ Basic device registration working
- ⚠️ Missing new enhanced fields

### What Needs To Be Done
1. **Add new form fields**:
   - RAM (GB) - number input
   - Processor - text input
   - Screen Size (inches) - number input
   - Battery Health (%) - slider (0-100)
   - Registration Location - auto-detect or manual entry
   - Registration Location Address - text input

2. **Update form submission**:
   - Include new fields in API payload
   - register-device API already supports these fields

3. **Add field descriptions**:
   - Help text for each new field
   - Optional/required indicators
   - Validation rules

---

## Component 5: ListMyDevice.tsx ✅ (Mostly Done)

### Current Status
- ✅ Already fetching real data from my-devices API
- ✅ Displaying enhanced device data
- ✅ Shows marketplace status

### What Needs To Be Done
1. **Display additional enhanced data**:
   - Show trust scores
   - Display verification levels
   - Show certificate count
   - Display repair count
   - Show risk assessment status

2. **Add quick actions for enhanced features**:
   - "View Trust Score" button
   - "View Certificates" button
   - "View Repair History" button

---

## Implementation Priority

### High Priority (Do First)
1. ✅ **ProductDetail.tsx** - Update child component props
2. ✅ **TrustVisualization.tsx** - Replace mock data with real props
3. ✅ **PriceHistoryChart.tsx** - Use real price history

### Medium Priority (Do Next)
4. ⚠️ **DeviceRegister.tsx** - Add enhanced fields
5. ⚠️ **ListMyDevice.tsx** - Display additional enhanced data

### Low Priority (Do Later)
- Create new components for reviews submission
- Add real-time updates
- Implement advanced filtering

---

## Testing Plan

### For Each Component
1. **Test with real data**: Verify component displays API data correctly
2. **Test with missing data**: Ensure graceful handling of null/undefined
3. **Test edge cases**: Empty arrays, zero values, very long strings
4. **Test responsiveness**: Mobile, tablet, desktop views
5. **Test performance**: Large datasets (many verifications, repairs, etc.)

### Data Scenarios to Test
- Device with 0 verifications
- Device with 10+ verifications
- Device with no repairs
- Device with multiple ownership transfers
- Device with expired certificates
- Device with high risk assessment
- Device with low trust score

---

## File Structure

```
src/
├── pages/
│   └── marketplace/
│       └── ProductDetail.tsx         [UPDATE: Pass real data to children]
│   └── user/
│       └── DeviceRegister.tsx        [UPDATE: Add enhanced fields]
│       └── ListMyDevice.tsx          [UPDATE: Display enhanced data]
│   └── device/
│       └── DeviceRegister.tsx        [UPDATE: Add enhanced fields]
├── components/
│   └── marketplace/
│       ├── TrustVisualization.tsx    [UPDATE: Accept real data props]
│       ├── PriceHistoryChart.tsx     [UPDATE: Accept real price history]
│       └── ...
```

---

## Expected Outcome

After Phase 2 completion:
- ✅ **0% mock data** on Product Detail page
- ✅ **100% real data** from enhanced APIs
- ✅ All enhanced fields displayed
- ✅ Trust scores, verifications, repairs, certificates all real
- ✅ Device registration collects all enhanced data
- ✅ My Devices shows complete device profiles

---

## Timeline Estimate

- ProductDetail.tsx updates: ~30 minutes
- TrustVisualization.tsx rewrite: ~45 minutes
- PriceHistoryChart.tsx update: ~15 minutes
- DeviceRegister.tsx enhancement: ~30 minutes
- ListMyDevice.tsx enhancements: ~20 minutes
- Testing and fixes: ~30 minutes

**Total: ~3 hours**

---

## Next Steps

1. Start with TrustVisualization.tsx (biggest impact)
2. Update PriceHistoryChart.tsx (quick win)
3. Update ProductDetail.tsx to pass real data
4. Enhance DeviceRegister.tsx with new fields
5. Add enhanced data display to ListMyDevice.tsx
6. Test end-to-end flow
7. Fix any issues found during testing
