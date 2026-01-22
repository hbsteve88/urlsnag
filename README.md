# URLSNAG - Domain Marketplace Website

A modern web marketplace for buying and selling premium domains with real-time search, filtering, and offer management.

## Features

- **Marketplace**: Browse, search, and filter domain listings
- **Make Offers**: Submit offers on domains
- **Save Listings**: Save favorite domains for later
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Search**: Instant filtering as you type
- **Category Filters**: Browse by technology, ecommerce, services, health, and more

## Tech Stack

### Frontend
- **Next.js 14** (React framework)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Zustand** for state management
- **React Query** for data fetching

### Backend (Ready for integration)
- **Node.js/Express** or **Supabase** for API
- **PostgreSQL** for database
- **Authentication** (OAuth, JWT)

## Project Structure

```
urlsnag/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/                 # React components
│   ├── Header.tsx              # Navigation header
│   ├── Hero.tsx                # Hero section with search
│   ├── ListingsGrid.tsx        # Listings display
│   └── Footer.tsx              # Footer
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── next.config.js              # Next.js config
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- A code editor (VS Code recommended)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Features

### Current
- ✅ Responsive marketplace layout
- ✅ Domain listing grid with 6 mock domains
- ✅ Real-time search filtering
- ✅ Category filtering (Technology, Ecommerce, Services, Health)
- ✅ Save/favorite listings
- ✅ Make offer button
- ✅ Verified ownership badges
- ✅ Offer count display
- ✅ Mobile-friendly navigation

### Coming Soon
- [ ] User authentication
- [ ] Offer submission form
- [ ] Transaction management
- [ ] User dashboard
- [ ] Admin panel
- [ ] Payment integration
- [ ] Real-time notifications

## Mock Data

The app includes 6 mock domain listings:

| Domain | Price | Category | Verified | Offers |
|--------|-------|----------|----------|--------|
| startup.io | $25,000 | Technology | ✓ | 3 |
| webdesign.co | $15,000 | Services | - | 1 |
| ecommerce.shop | $35,000 | Ecommerce | ✓ | 5 |
| ai.app | $50,000 | Technology | ✓ | 8 |
| budget.deals | $7,500 | Ecommerce | - | 2 |
| fitness.fit | $12,000 | Health | - | 0 |

## Customization

### Colors
Edit `tailwind.config.js` to customize the color scheme:
```js
colors: {
  primary: '#0066cc',
  secondary: '#f5f5f5',
}
```

### Listings
Edit mock listings in `components/ListingsGrid.tsx`:
```tsx
const mockListings: Listing[] = [
  // Add/modify listings here
]
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean
- Heroku
- etc.

## Environment Variables

Create a `.env.local` file for environment-specific settings:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact support@urlsnag.com
