import { PredictorPage } from '@/components/PredictorPage';

export const metadata = {
  title: 'CSAB College Predictor | Motivation Kaksha',
  description: 'Predict your college based on CSAB counselling data. Enter your rank and preferences to find matching colleges.',
};

export default function CSABPage() {
  return (
    <PredictorPage
      config={{
        title: 'CSAB College Predictor',
        apiBase: 'https://csabapi.onrender.com/api',
        description: 'Find your ideal college based on CSAB special round counselling data.',
        accent: '#3b82f6',
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
