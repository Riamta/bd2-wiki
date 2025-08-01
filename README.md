# Brown Dust 2 - Character Database

A modern, responsive web application built with Next.js to explore Brown Dust 2 characters, their stats, costumes, and skills.

## Features

- 🎮 **Complete Character Database**: Browse all Brown Dust 2 characters with detailed information
- 🔍 **Advanced Filtering**: Filter characters by attribute, attack type, and search by name or costume
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- ⚡ **Fast Performance**: Built with Next.js for optimal loading speeds
- 🖼️ **High-Quality Images**: Character artwork and costume images
- 📊 **Detailed Stats**: Complete character stats, skills, and bonuses

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel
- **Images**: Next.js Image Optimization

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bd2-characters
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
bd2-characters/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── character/[name]/ # Dynamic character detail pages
│   │   └── page.tsx         # Homepage
│   ├── components/          # Reusable React components
│   │   ├── CharacterCard.tsx
│   │   ├── CharacterFilter.tsx
│   │   └── ...
│   ├── types/              # TypeScript type definitions
│   │   └── character.ts
│   └── data/               # Data management
│       └── gameData.ts
├── public/
│   └── data.json           # Character data file
└── ...
```

## Deployment to Vercel

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect it's a Next.js project and deploy

### Environment Variables

No environment variables are required for this project as it uses static data.

## Data Management

The character data is stored in `public/data.json` and loaded dynamically. To update the data:

1. Replace the `public/data.json` file with your updated data
2. Ensure the data structure matches the TypeScript interfaces in `src/types/character.ts`
3. Redeploy to Vercel

## Customization

### Adding New Features

- **New Filters**: Update `CharacterFilter.tsx` component
- **Character Stats**: Modify `StatDisplay` component in character detail page
- **Styling**: Update Tailwind classes or add custom CSS

### Modifying Character Data Structure

1. Update TypeScript interfaces in `src/types/character.ts`
2. Update components to handle new data fields
3. Update the JSON data file structure accordingly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and community purposes. Character data and images belong to their respective owners.

## Acknowledgments

- Brown Dust 2 game developers
- Character artwork and data sources
- Next.js and Vercel teams for excellent tooling
