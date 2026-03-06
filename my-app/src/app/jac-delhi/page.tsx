import { PredictorPage } from '@/components/PredictorPage';

export const metadata = {
  title: 'JAC Delhi College Predictor | Motivation Kaksha',
  description: 'Predict your college based on JAC Delhi counselling data. Enter your rank and preferences to find matching colleges.',
};

export default function JACDelhiPage() {
  return (
    <PredictorPage
      config={{
        title: 'JAC Delhi College Predictor',
        apiBase: 'https://jac-delhi.onrender.com/api',
        description: 'Find your ideal college based on JAC Delhi counselling data including DTU, IIITD, NSUT, IGDTUW.',
        accent: '#a855f7',
        optionalFilters: ['year', 'round', 'quota', 'gender', 'subCategory', 'institute', 'program'],
        hasOpeningRank: false,
        columns: [
          { key: 'details', label: 'Institute & Details' },
          { key: 'program', label: 'Program Name' },
          { key: 'closingRank', label: 'Closing Rank', align: 'right' },
        ],
      }}
    />
  );
}
