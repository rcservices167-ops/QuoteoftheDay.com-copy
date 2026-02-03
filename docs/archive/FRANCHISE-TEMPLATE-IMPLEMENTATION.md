# Franchise Template System Implementation

## 🎯 Overview

This document describes the implementation of the MyDailyInfo.com franchise template system for QuoteOfDay.net, following the standardized structure used across all 8 Daily Network sites.

---

## 📋 Franchise Template Structure

### Section #1: TOP (Implemented)

#### A. Header Component
**File:** `src/components/FranchiseHeader.tsx`

**Features:**
- Purple gradient background matching MyDailyInfo.com
- 8 network site links with emojis:
  1. 🌐 Home → mydailyinfo.com
  2. 😂 Joke → jokeofday.net
  3. 🧠 Fact → factofday.com
  4. 💬 Quote → quoteofday.net
  5. 🎵 Music → songofday.com
  6. 💰 Money → moneyofday.com
  7. 🏆 Scores → scoresofday.com
  8. 🎮 Game → gameofday.net
- "Visit all 8 sites today!" CTA button
- Responsive design for mobile/tablet/desktop

**Usage:**
```tsx
import { FranchiseHeader } from './components/FranchiseHeader';

<FranchiseHeader />
```

#### B. Site Information & Metrics
**File:** `src/components/SiteInfo.tsx`

**Components:**

1. **Site Name (Left)**
   - Large, prominent display: "QuoteOfDay.net"
   - No description (per franchise template)

2. **Useful Information Metrics (Center)**
   - 📅 Current date (Friday, November 7, 2025)
   - 📍 Location (auto-detected via geolocation)
   - ☁️ Weather (optional, can be integrated)
   - ⏰ Countdown to midnight EST (new content timer)

3. **User Loyalty Metric (Right)**
   - 🔥 Day streak counter
   - Visual badge with orange highlight
   - Tracks consecutive daily visits

**Usage:**
```tsx
import { SiteInfo } from './components/SiteInfo';

<SiteInfo
  siteName="QuoteOfDay.net"
  siteUrl="https://quoteofday.net"
/>
```

---

## 🏗️ Implementation Details

### Current Structure

```tsx
// App.tsx structure
<div className="min-h-screen flex flex-col">
  <FranchiseHeader />           {/* Section #1A: Header */}
  <SiteInfo />                   {/* Section #1B & #1C: Info + Loyalty */}
  <main className="flex-1">
    {/* Section #2: MAIN BODY CONTENT */}
    <QuoteOfTheDay />            {/* Main content with SearchBar */}

    {/* Section #3: SHARING AND ENGAGEMENT */}
    <BadgesPanel />
    <PWAInstall />
    <NotificationPrompt />
  </main>
  {/* Section #4: BOTTOM */}
  <ExternalFooter />             {/* Footer */}
</div>
```

### SearchBar Component Structure (NEW)

The SearchBar follows a **TWO ROW layout** with **flexible column widths**:

```tsx
<SearchBar>
  {/* ROW 1: LABELS */}
  <Row1>
    <Column1>PICK A DATE</Column1>
    <Column2 (expanded)>
      <Logo /> + Site Name + Current Date
    </Column2>
    <Column3>PICK A QUOTE CATEGORY</Column3>
  </Row1>

  {/* ROW 2: CONTROLS */}
  <Row2>
    <Column1 (tight wrap)>
      Date Navigation Buttons
    </Column1>
    <Column2 (EXPANDED - fills space)>
      Search Field + Clear Button
    </Column2>
    <Column3 (tight wrap)>
      Category Buttons
    </Column3>
  </Row2>
</SearchBar>
```

**Key Features:**
- ✅ Two rows strict (non-negotiable)
- ✅ Flexible column widths per row (don't stack vertically)
- ✅ Search field expanded to signal database size
- ✅ Logo displayed in Row 1, Column 2
- ✅ Mobile: Same structure with icons/shorthand

### Removed Components

The following were removed per franchise template requirements:

1. ❌ **Old ExternalHeader**
   - Replaced with standardized FranchiseHeader
   - Ensures consistency across all network sites

2. ❌ **Non-standard navigation elements**
   - All navigation now follows franchise template

3. ❌ **Custom header styles**
   - Using MyDailyInfo.com purple gradient theme

---

## 🎨 Design System

### Colors

**Primary (Franchise Purple):**
- Header: `gradient-to-r from-purple-600 via-blue-600 to-purple-600`
- Hover states: `bg-white/20` on purple background

**SearchBar (Sky Blue Theme):**
- Background: `gradient-to-br from-sky-100 to-sky-200`
- Border: `border-8 border-sky-600`
- Buttons: `gradient-to-r from-sky-500 to-sky-600`
- Text: `text-sky-900` (headings), `text-sky-700` (body)

**Accent Colors:**
- Blue: Information metrics (#2563eb)
- Orange: User loyalty (#ea580c)
- Red: Clear button (#ef4444)
- White: Text on colored backgrounds

### Typography

- Site name (in SearchBar): `text-2xl md:text-3xl font-bold`
- SearchBar labels: `text-lg md:text-xl font-bold`
- Navigation: `text-sm font-medium`
- Info metrics: `text-sm text-gray-700`
- Search input: `text-base md:text-lg`

### Spacing

- Header padding: `py-3 px-4`
- SiteInfo padding: `py-4 px-4`
- SearchBar padding: `p-6`
- Gap between rows: `mb-4`
- Gap between columns: `gap-4`
- Button spacing: `gap-2`

### Logo Specifications

- File location: `public/[category].png`
- Display height: `h-12` (48px) mobile, `h-16` (64px) desktop
- Width: Auto-scaled to maintain aspect ratio
- Format: PNG (transparent or solid background)
- Recommended dimensions: 400-600px wide × 150-250px tall

**Background Treatment:**
- Container background: White (`bg-white`) - CRITICAL for rounded logos
- Rationale: Prevents visual artifacts where rounded corners meet colored backgrounds
- White/transparent backgrounds create seamless integration with logo corners
- Colored gradients cause mismatched corner areas on rounded logos

---

## 📱 Responsive Design

### Breakpoints

**Mobile (< 768px):**
- Stacked layout
- Simplified navigation with icons
- SearchBar: Column layout (date buttons → search → category buttons)
- Text abbreviated (e.g., "← PREV" instead of "← PREVIOUS")
- Logo displays at h-12 (48px)
- Category buttons show icon only

**Tablet (768px - 1024px):**
- Flexible row layout
- Wrapped navigation items
- SearchBar: Two-row layout engaged
- Logo displays at h-16 (64px)
- Full text labels visible

**Desktop (> 1024px):**
- Full horizontal layout
- All elements visible
- SearchBar: Full two-row layout with expanded search field
- "Visit all 8 sites" CTA shown in header
- Maximum visual hierarchy

---

## 🔧 Configuration

### Site-Specific Settings

To adapt for other franchise sites, change:

```tsx
// For JokeOfDay.net
<SiteInfo
  siteName="JokeOfDay.net"
  siteUrl="https://jokeofday.net"
/>

// For FactOfDay.com
<SiteInfo
  siteName="FactOfDay.com"
  siteUrl="https://factofday.com"
/>

// For SongOfDay.com
<SiteInfo
  siteName="SongOfDay.com"
  siteUrl="https://songofday.com"
/>
```

### Network Links

All 8 sites use the same header. Links are centrally defined in `FranchiseHeader.tsx`:

```typescript
const networkSites: NetworkSite[] = [
  { name: 'Home', url: 'https://mydailyinfo.com', emoji: '🌐' },
  { name: 'Joke', url: 'https://jokeofday.net', emoji: '😂' },
  // ... etc
];
```

---

## 🚀 Features Implemented

### 1. Real-time Countdown Timer
- Updates every second
- Shows hours:minutes:seconds until midnight EST
- Displays when new content becomes available

### 2. Geolocation Detection
- Auto-detects user's city
- Falls back to "Naples" if permission denied
- Uses BigDataCloud reverse geocoding API

### 3. User Streak Tracking
- Displays consecutive day count
- Visual "fire" emoji indicator
- Stored in localStorage (can be moved to database)

### 4. Weather Integration (Ready)
- Component structure prepared
- Can integrate with weather API
- Displays temperature and conditions

---

## 📊 Data Persistence

### LocalStorage (Current)
```typescript
// User streak
localStorage.setItem('dayStreak', '1');

// Last visit date
localStorage.setItem('lastVisit', new Date().toDateString());
```

### Supabase (Recommended for Production)

Create table:
```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  site_name TEXT NOT NULL,
  last_visit DATE NOT NULL,
  day_streak INTEGER DEFAULT 1,
  total_visits INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user ON user_activity(user_id);
CREATE INDEX idx_user_activity_site ON user_activity(site_name);
```

---

## 🔄 Update Strategy

### Centralized Updates (Future)

Per franchise template document, future updates should:

1. **Header changes** → Update FranchiseHeader.tsx only
2. **Info widgets** → Update SiteInfo.tsx only
3. **Footer changes** → Update ExternalFooter only
4. **Main content** → Update per-site components only

This ensures:
- ✅ Consistency across all 8 sites
- ✅ Faster development
- ✅ Reduced errors
- ✅ Easier maintenance

### External Template Loading (Phase 2)

Future implementation can load from MyDailyInfo.com:

```tsx
// Future approach
<RemoteHeader src="https://mydailyinfo.com/api/header" />
<RemoteInfo src="https://mydailyinfo.com/api/info-widgets" />
<RemoteFooter src="https://mydailyinfo.com/api/footer" />
```

Benefits:
- Single source of truth
- Instant updates across all sites
- No code changes needed per site

---

## ✅ Verification Checklist

### Visual Check
- [ ] Purple gradient header matches MyDailyInfo.com
- [ ] All 8 network sites visible in navigation
- [ ] Emojis display correctly
- [ ] Site name "QuoteOfDay.net" is prominent
- [ ] Logo displays in SearchBar Row 1, Column 2
- [ ] Info metrics in single row
- [ ] User streak badge visible
- [ ] Countdown timer updates every second
- [ ] SearchBar has exactly TWO rows
- [ ] Search field is expanded and prominent
- [ ] Side columns (date/category buttons) are tight-wrapped

### Functional Check
- [ ] All navigation links work
- [ ] Geolocation requests permission
- [ ] Countdown shows correct time until midnight
- [ ] Search functionality works with debouncing
- [ ] Clear button appears in search mode
- [ ] Date navigation buttons work
- [ ] Category buttons work
- [ ] Responsive on mobile/tablet/desktop
- [ ] No old header components visible
- [ ] Logo loads correctly

### Layout Check (SearchBar)
- [ ] Row 1 has three flexible columns (labels)
- [ ] Row 2 has three flexible columns (controls)
- [ ] Columns DON'T align vertically between rows
- [ ] Search field takes up maximum available space
- [ ] Mobile shows icons/shorthand text
- [ ] Desktop shows full text labels
- [ ] No wasted space in layout

### Code Quality
- [ ] No duplicate header code
- [ ] Clean component structure
- [ ] TypeScript types defined
- [ ] Responsive classes applied
- [ ] Accessible (ARIA labels, semantic HTML)
- [ ] Logo path is correct

---

## 🐛 Troubleshooting

### Issue: Geolocation not working

**Solution:**
```typescript
// Ensure HTTPS is enabled
// Browser blocks geolocation on HTTP

// Check permissions
navigator.permissions.query({ name: 'geolocation' })
  .then(result => console.log(result.state));
```

### Issue: Countdown timer incorrect

**Solution:**
```typescript
// Ensure timezone is set to EST
const midnight = new Date();
midnight.setHours(24, 0, 0, 0); // Local midnight

// For EST specifically:
const estMidnight = new Date(
  midnight.toLocaleString('en-US', { timeZone: 'America/New_York' })
);
```

### Issue: Header not matching template

**Solution:**
- Compare colors: should be purple gradient
- Check all 8 site links present
- Verify emojis rendering correctly
- Ensure "Visit all 8 sites" CTA visible on desktop

---

## 📈 Future Enhancements

### Phase 1 (Current) ✅
- [x] Implement FranchiseHeader
- [x] Add SiteInfo with metrics
- [x] User loyalty streak
- [x] Countdown timer
- [x] Geolocation

### Phase 2 (Next)
- [ ] Weather API integration
- [ ] Database-backed user streaks
- [ ] Cross-site streak tracking
- [ ] Achievements/badges system
- [ ] Social sharing from header

### Phase 3 (Future)
- [ ] Remote template loading from MyDailyInfo.com
- [ ] A/B testing for header variations
- [ ] Personalized content recommendations
- [ ] Multi-language support
- [ ] Dark mode toggle

---

## 📚 Related Documentation

- `FRANCHISE-TEMPLATE-SYSTEM.txt` - Original franchise template spec
- `src/components/FranchiseHeader.tsx` - Header component code
- `src/components/SiteInfo.tsx` - Info widgets code
- `src/App.tsx` - Main application structure

---

## 🎯 Success Metrics

### User Engagement
- Track daily streak completion rate
- Monitor cross-site navigation clicks
- Measure time on site improvement

### Technical Performance
- Header load time < 100ms
- Countdown updates smooth (no jank)
- Geolocation response < 1s

### Consistency Score
- 100% visual match with MyDailyInfo.com
- All 8 sites use identical header
- Zero variation in layout/colors

---

**Implementation Date:** November 8, 2025
**Version:** 1.0
**Status:** ✅ Production Ready
