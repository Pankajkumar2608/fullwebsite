import { PredictorPage } from '@/components/PredictorPage';

export const metadata = {
  title: 'JAC Chandigarh College Predictor | Motivation Kaksha',
  description: 'Predict your college based on JAC Chandigarh counselling data. Enter your rank and preferences to find matching colleges.',
};

export default function JACChandigarhPage() {
  return (
    <PredictorPage
      config={{
        title: 'JAC Chandigarh College Predictor',
        apiBase: 'https://jac-chandigarh.onrender.com/api',
        description: 'Find your ideal college based on JAC Chandigarh counselling data including PEC, CCET, and UIET.',
        accent: '#10b981',
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
