# SearchBar Layout Rules - CRITICAL REFERENCE

**Last Updated:** December 4, 2025
**Version:** 5.0 (Two Separate Components - SiteInfo + SearchBar)

---

## 🎯 THE GOLDEN RULES

### **CRITICAL: Two Separate Components**

**SITEINFO COMPONENT (separate component, NOT in SearchBar)**
- Logo replaces "QuoteOfDay.net" text (left)
- Location, Date, Time, Weather, Countdown (right)
- Logo appears ONLY once on entire page (in SiteInfo)
- NEVER duplicate logo in SearchBar

**SEARCHBAR COMPONENT (TWO rows only)**

**ROW 1: LABELS**
- Left: "PICK DATE" label
- Center: "QUOTE FOR [ACTUAL_DATE]" label (shows actual date like "Dec 4")
- Right: "PICK CATEGORY" label

**ROW 2: CONTROLS**
- Left: Date buttons (←, 🎲, 📅, →)
- Center: Search field + clear button
- Right: Category buttons (icons)

---

## 📐 Layout Structure

### **Desktop:**
```
┌───────────────────────────────────────────────────────────┐
│ [LOGO]  📍Immokalee  📅Monday, Dec 4, 2025  ⏱️ 8:37:08   │  ← SiteInfo Component (separate)
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ PICK DATE        QUOTE FOR DEC 4         PICK CATEGORY    │  ← SearchBar Row 1: Labels
│ [←][🎲][📅][→]  [🔍 Search quotes...]   [🔥][💼][✨]     │  ← SearchBar Row 2: Controls
└───────────────────────────────────────────────────────────┘
```

### **Mobile:**
```
┌─────────────────────────────┐
│ [LOGO] 📍Immokalee 📅 ⏱️   │  ← SiteInfo Component (separate)
└─────────────────────────────┘

┌─────────────────────────────┐
│   📅       🔍        💬     │  ← SearchBar Row 1: Labels (icons)
│ [←][🎲][📅][→]              │  ← SearchBar Row 2: Controls (stacked)
│ [🔍 Search..]               │
│ [🔥][💼][✨]                │
└─────────────────────────────┘
```

---

## 🔧 Technical Implementation

### **SiteInfo Component (SEPARATE):**
- **Container:** `<div className="bg-white border-b border-gray-200">`
- **Logo:** Replaces text when `logoImage` prop is provided
- **No duplication:** Logo appears ONLY here, never in SearchBar

### **SearchBar Row 1 (Labels):**
- **Container:** `grid grid-cols-3 gap-2 mb-2`
- **Desktop:** Full text labels ("PICK DATE", "QUOTE FOR DEC 4", "PICK CATEGORY")
- **Mobile:** Icon labels only (📅, 🔍, 💬)

### **SearchBar Row 2 (Controls):**
- **Container:** `grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3`
- **Button Compression:** `px-2 py-2 text-xs` with icons
- **Search Field:** `flex-1` (takes remaining space in center column)
- **Gap:** `gap-1` between buttons (minimal spacing)

---

## 🚫 WHAT NOT TO DO

❌ **NEVER** stack buttons vertically (even on mobile)
❌ **NEVER** prioritize search field width over button visibility
❌ **NEVER** use large padding on buttons (no px-4 or larger)
❌ **NEVER** use full text labels on mobile
❌ **NEVER** waste horizontal space with gaps or margins

---

## ✅ WHAT TO DO

✅ **ALWAYS** compress buttons as much as possible
✅ **ALWAYS** use icons instead of text where possible
✅ **ALWAYS** keep all buttons in one horizontal row
✅ **ALWAYS** let search field be flexible and adapt
✅ **ALWAYS** use title attributes for accessibility

---

## 📊 Responsive Breakpoints

```tsx
// Desktop (md:640px+)
<span className="hidden md:inline">← PREV</span>
<span className="md:hidden">←</span>

// Mobile (<640px)
- Show icon only: ←, →, 🎲, 📅
- Categories: Icon only
- Search: Shrinks to available space
```

---

## 🎨 Class Reference

### **Date Button (Left Group):**
```tsx
className="px-2 py-2 bg-gradient-to-r from-sky-500 to-sky-600
           text-white rounded-lg font-bold hover:from-sky-600
           hover:to-sky-700 transition-all shadow-lg hover:shadow-xl
           disabled:opacity-50 disabled:cursor-not-allowed text-xs
           whitespace-nowrap"
```

### **Category Button (Right Group):**
```tsx
className="px-2 py-2 rounded-lg font-bold transition-all shadow-lg
           text-xs whitespace-nowrap"
// Active state:
className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white scale-105"
// Inactive state:
className="bg-white text-sky-900 hover:bg-sky-50"
```

### **Search Input:**
```tsx
className="flex-1 px-3 py-2 text-sm rounded-lg border-2 border-sky-500
           focus:border-sky-700 focus:outline-none focus:ring-2
           focus:ring-sky-300 shadow"
```

---

## 🔄 Update History

**Version 5.0 (Dec 4, 2025):**
- FINAL CORRECT: SiteInfo (separate component) + SearchBar (2 rows ONLY)
- SiteInfo: Logo replaces text, NO duplication
- SearchBar: Labels row + Controls row ONLY
- Removed duplicate site info from SearchBar

**Version 4.0 (Dec 4, 2025):**
- Incorrect: Added site info row inside SearchBar (duplication error)

**Version 3.0 (Dec 4, 2025):**
- Attempted single-row layout (incorrect)

**Version 2.0 (Dec 4, 2025):**
- Compressed layout with controls

**Version 1.0:**
- Original multi-row layout

---

## 📋 Quick Checklist for New Categories

When replicating to a new category:

- [ ] Logo file created and placed in `/public/`
- [ ] **SiteInfo Component:** Logo replaces text (separate component, NOT in SearchBar)
- [ ] **SearchBar Component:** Only 2 rows (Labels + Controls)
- [ ] **SearchBar Row 1 (Labels):** "PICK DATE" | "QUOTE FOR [DATE]" | "PICK CATEGORY"
- [ ] **SearchBar Row 2 (Controls):** Date buttons | Search field | Category buttons
- [ ] NO duplication of logo, date, or time anywhere
- [ ] Date buttons: 4 buttons (←, 🎲, 📅, →)
- [ ] Search field: `flex-1` in center
- [ ] Category buttons: Icons only
- [ ] Desktop: Full text labels, icon buttons
- [ ] Mobile: Icon labels, icon buttons, stacked controls
- [ ] Build succeeds without errors
- [ ] Test on mobile device (< 640px width)

---

**This is the definitive reference for SearchBar layout across all franchise categories.**
