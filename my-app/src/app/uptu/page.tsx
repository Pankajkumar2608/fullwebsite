import { PredictorPage } from '@/components/PredictorPage';

export const metadata = {
  title: 'UPTU / AKTU College Predictor | Motivation Kaksha',
  description: 'Predict your college based on UPTU / AKTU counselling data. Enter your rank and preferences to find matching colleges.',
};

export default function UPTUPage() {
  return (
    <PredictorPage
      config={{
        title: 'UPTU / AKTU College Predictor',
        apiBase: 'https://uptuapi.onrender.com/api',
        description: 'Find your ideal college based on UPTU / AKTU counselling data for UP state engineering colleges.',
        accent: '#f97316',
        optionalFilters: ['year', 'round', 'quota', 'gender', 'institute', 'program'],
        hasOpeningRank: true,
        columns: [
          { key: 'details', label: 'Institute & Details' },
          { key: 'program', label: 'Program Name' },
          { key: 'openingRank', label: 'Opening Rank', align: 'right' },
          { key: 'closingRank', label: 'Closing Rank', align: 'right' },
        ],
      }}
    />
  );
}
