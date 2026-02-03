# QuoteofDay.net

A modern daily quote platform with search functionality, social sharing, and cross-site network integration.

## Features

- Daily quote display with author and category information
- Full-text search across quotes, authors, and categories
- Desktop: Quote preview displayed in search bar area
- Prominent logo display (128px mobile / 160px desktop)
- Compact layout with minimal white space
- Location and weather information
- Countdown timer with "Update in" prefix
- Social sharing capabilities
- Email subscription
- Mobile responsive design (single-row header)
- PWA support with offline functionality

## Logo Configuration

The site features a large, prominent logo in the header:
- Image dimensions: 430x159 pixels
- File size: 76KB (optimized from original 1.07MB)
- Mobile: 128px height (site info flush to logo, single-row)
- Desktop: 160px height (left-aligned)
- Location: Left-aligned with site information in same row
- File: `/public/IMG_0100.jpeg`
- Format: PNG with transparent background
- Minimal padding for compact design

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # Check TypeScript types
npm run lint         # Lint code
```

## Documentation

### **Active Documentation:**
- **`MASTER-CATEGORY-IMPLEMENTATION-GUIDE.md`** - Complete guide for implementing to Jokes, Facts, Songs, Games
- **`ARCHIVE-SYSTEM-GUIDE.md`** - Archive page generation system (run `npm run generate-archives`)
- `QUICK-REFERENCE.md` - Quick configuration reference for QuoteOfDay.net
- `EXTERNAL-HEADER-FOOTER-GUIDE.md` - Network integration guide
- `SEARCHBAR-LAYOUT-RULES.md` - SearchBar layout specifications

### **Archived Documentation:**
- `docs/archive/` - Historical documentation (outdated, do not use for new implementations)
