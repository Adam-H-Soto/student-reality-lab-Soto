# Testing & API Examples

## API Endpoint Testing

### Test: Fetch All States
```bash
curl -X GET "http://localhost:3000/api/states"
```

**Expected Response**: Array of 50 states with complete UnifiedStateData

---

### Test: Fetch Single State
```bash
curl -X GET "http://localhost:3000/api/states?state=California"
```

**Expected Response**:
```json
{
  "data": {
    "state": "California",
    "state_code": "CA",
    "taxes": {
      "income_tax_rate": 9.3,
      "sales_tax_rate": 7.25,
      "property_tax_rate": 0.76
    },
    "income": {
      "median_household_income": 91879,
      "data_source": "US Census Bureau",
      "year": 2023
    },
    "housing": {
      "median_home_price": 1250000,
      "data_source": "Real Estate Market Data"
    },
    "lifestyle": {
      "nightlife_score": 56.7,
      "top_industries": ["Technology", "Entertainment", "Agriculture"],
      "safety_index": 42.5,
      "crime_rate": 425,
      "data_source": "FBI Crime Data & Bureau of Labor Statistics"
    },
    "food_insecurity_rate": 12.2,
    "median_grocery_cost_index": 99.5,
    "last_updated": "2026-03-19T10:30:00Z",
    "data_completeness": 1.0
  }
}
```

---

### Test: Get Cache Status
```bash
curl -X GET "http://localhost:3000/api/states?cache=true"
```

**Expected Response**:
```json
{
  "data": [...],
  "count": 50,
  "timestamp": "2026-03-19T10:30:00Z",
  "cache_status": {
    "isCached": true,
    "isValid": true,
    "ageMs": 120000,
    "ageMinutes": 2,
    "ttlMinutes": 1440,
    "dataPoints": 50
  }
}
```

---

### Test: Refresh Cache
```bash
curl -X POST "http://localhost:3000/api/states?action=refresh"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Cache refreshed successfully",
  "data_points": 50,
  "timestamp": "2026-03-19T10:35:00Z"
}
```

---

## Chatbot Test Cases

### Test 1: Basic State Information
```
User: "Tell me about Texas"

Expected Response (from chatbot):
• Texas (TX) State Information Summary
  - Taxes
    • Income Tax: 0.00%
    • Sales Tax: 6.25%
    • Property Tax: 1.80%
  - Income
    • Median Household: $85,432
    • Source: US Census Bureau (2023)
  - Housing
    • Median Home Price: $475,000
  - Safety
    • Safety Index: 58.4/100
    • Crime Rate: 415 per 100k
  - Top Industries: Energy, Technology, Agriculture
  - Food Insecurity: 14.1%
```

### Test 2: Specific Data Query
```
User: "What's the crime rate in California?"

Expected Response:
• California Crime Rate
  - Value: 425 per 100,000 population
  - Safety Index: 42.5/100
  - Source: FBI Crime Data & Bureau of Labor Statistics
  - Last Updated: 2026-03-19
```

### Test 3: Comparison Query
```
User: "Compare taxes in California and Texas"

Expected Response:
• California vs Texas Tax Comparison
  - California (CA)
    • Income Tax: 9.30%
    • Sales Tax: 7.25%
    • Property Tax: 0.76%
  - Texas (TX)
    • Income Tax: 0.00%
    • Sales Tax: 6.25%
    • Property Tax: 1.80%
  - Total Tax Burden: California (17.31%) vs Texas (8.05%)
```

### Test 4: Data Unavailable Handling
```
User: "What's the exact population of Alaska?"

Expected Response:
• Alaska Population
  - This information is not currently available in my dataset
  - Available data for Alaska includes: tax rates, median income, housing prices, and safety metrics
  - Please ask about: "Tell me about Alaska" for all available information
```

---

## Validation Tests

### Test: Verify All 50 States
```javascript
// In browser console or test file
fetch('/api/states')
  .then(r => r.json())
  .then(d => {
    console.log(`Total states: ${d.count}`);
    console.log('All state names:', d.data.map(s => s.state).sort());
    const missingData = d.data.filter(s => s.data_completeness < 0.8);
    console.log('States with <80% data:', missingData);
  });
```

**Expected**:
- `count` = 50
- All 50 states present
- Data completeness >= 0.8 for most states

### Test: Verify Data Formatting
```javascript
fetch('/api/states?state=California')
  .then(r => r.json())
  .then(d => {
    const s = d.data;
    // Check JSON structure
    console.assert(s.state === "California");
    console.assert(s.state_code === "CA");
    console.assert(typeof s.taxes.income_tax_rate === 'number');
    console.assert(typeof s.income.median_household_income === 'number');
    console.assert(Array.isArray(s.lifestyle.top_industries));
    console.log('✓ Data structure valid');
  });
```

### Test: Verify No Nulls (except intentional)
```javascript
fetch('/api/states')
  .then(r => r.json())
  .then(d => {
    d.data.forEach(state => {
      // Tax rates should not be null
      if (state.taxes.income_tax_rate === null) {
        console.warn(`${state.state}: income_tax_rate is null`);
      }
      // Check for completeness
      if (state.data_completeness === 0) {
        console.warn(`${state.state}: no data available`);
      }
    });
    console.log('✓ Null validation complete');
  });
```

---

## Format Validation Tests

### Test: Currency Formatting
```typescript
import { formatCurrency } from '@/lib/formatData';

// Test cases
formatCurrency(91879);           // Expected: "$91,879"
formatCurrency(1250000);         // Expected: "$1,250,000"
formatCurrency(425);             // Expected: "$425"
formatCurrency(null);            // Expected: "Data unavailable"
```

### Test: Percentage Formatting
```typescript
import { formatPercentage } from '@/lib/formatData';

// Test cases
formatPercentage(9.3);           // Expected: "9.30%"
formatPercentage(0.0);           // Expected: "0.00%"
formatPercentage(15.625, 1);     // Expected: "15.6%"
formatPercentage(null);          // Expected: "Data unavailable"
```

### Test: Score Formatting
```typescript
import { formatScore } from '@/lib/formatData';

// Test cases
formatScore(75.5);               // Expected: "75.5/100"
formatScore(42.3333, 2);         // Expected: "42.33/100"
formatScore(100);                // Expected: "100.0/100"
formatScore(null);               // Expected: "Data unavailable"
```

---

## Performance Tests

### Test 1: First Load Time (No Cache)
```javascript
const startTime = Date.now();
fetch('/api/states', { cache: 'no-store' })
  .then(r => r.json())
  .then(() => {
    console.log(`First load: ${Date.now() - startTime}ms`);
    // Expected: 2000-3000ms
  });
```

### Test 2: Cached Load Time
```javascript
// First request (cached)
await fetch('/api/states');

// Second request (should be fast)
const startTime = Date.now();
fetch('/api/states')
  .then(r => r.json())
  .then(() => {
    console.log(`Cached load: ${Date.now() - startTime}ms`);
    // Expected: <100ms
  });
```

### Test 3: Cache Hit Ratio
```javascript
// Check cache status
fetch('/api/states?cache=true')
  .then(r => r.json())
  .then(d => {
    const { cache_status: cs } = d;
    console.log(`Cache Status:
      - Is Cached: ${cs.isCached}
      - Is Valid: ${cs.isValid}
      - Age: ${cs.ageMinutes} minutes
      - TTL: ${cs.ttlMinutes} minutes
      - Data Points: ${cs.dataPoints}
    `);
  });
```

---

## Integration Tests

### Test: Map Modal Integration
```typescript
// Test that modal receives proper state data
const state = await getSingleStateData('California');

// Verify all required fields
expect(state.state).toBe('California');
expect(state.state_code).toBe('CA');
expect(state.taxes).toBeDefined();
expect(state.income).toBeDefined();
expect(state.housing).toBeDefined();
expect(state.lifestyle).toBeDefined();
expect(state.food_insecurity_rate).toBeDefined();

// Verify formatting works
const formatted = formatStateDataForDisplay(state);
expect(formatted.income.medianHouseholdIncome).toContain('$');
expect(formatted.taxes.incomeTax).toContain('%');
```

### Test: Chatbot Data Consistency
```javascript
// Fetch API data
const apiState = await fetch('/api/states?state=California')
  .then(r => r.json())
  .then(d => d.data);

// Ask chatbot same question
const chatResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: "What's California's income tax rate?" }
    ]
  })
}).then(r => r.json());

// Verify response includes API data
expect(chatResponse.message).toContain('9.3');
expect(chatResponse.message).toContain('%');
expect(chatResponse.message).toContain('California');
```

---

## Error Handling Tests

### Test: Non-existent State
```bash
curl -X GET "http://localhost:3000/api/states?state=InvalidState"
```

**Expected Response** (404):
```json
{
  "error": "State not found: InvalidState"
}
```

### Test: Invalid Action
```bash
curl -X POST "http://localhost:3000/api/states?action=invalid"
```

**Expected Response** (400):
```json
{
  "error": "Unknown action"
}
```

---

## Chatbot Anti-Hallucination Tests

### Test 1: Refuses Speculation
```
User: "Will housing prices increase in California?"
Expected: "Data unavailable for price predictions"
```

### Test 2: Cites Sources
```
User: "What's Texas's median income?"
Expected Response to contain: "Source: US Census Bureau (2023)"
```

### Test 3: Refuses Estimates
```
User: "Approximately how much does housing cost in New York?"
Expected: Exact value, not "approximately"
```

### Test 4: Honest About Missing Data
```
User: "What's the unemployment rate in Colorado?"
Expected: "Data unavailable" (not in dataset)
```

---

## Summary

All tests should pass to validate:
- [x] API returns all 50 states
- [x] Data structure is consistent
- [x] Formatting functions work correctly
- [x] Cache system functions
- [x] Chatbot uses correct data
- [x] No hallucination occurs
- [x] Error handling works
- [x] Performance is acceptable

**Run these tests to verify the implementation is working correctly!**
