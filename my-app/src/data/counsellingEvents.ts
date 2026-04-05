export interface CounsellingEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  board: 'JoSAA' | 'CSAB' | 'JAC Delhi' | 'UPTU' | 'General';
}

export const upcomingEvents: CounsellingEvent[] = [
  {
    id: 'e1',
    board: 'JoSAA',
    title: 'Round 1 Seat Allocation',
    date: '2026-06-20',
    description: 'Round 1 Seat Allocation Result will be published at 10:00 AM. Pay seat acceptance fee before 24th June.'
  },
  {
    id: 'e2',
    board: 'JAC Delhi',
    title: 'Registration Deadline',
    date: '2026-06-25',
    description: 'Last date for online registration and choice filling for JAC Delhi admissions.'
  },
  {
    id: 'e3',
    board: 'JoSAA',
    title: 'Round 2 Seat Allocation',
    date: '2026-06-27',
    description: 'Round 2 Seat Allocation Result publishing.'
  },
  {
    id: 'e4',
    board: 'CSAB',
    title: 'Special Round Registration Begins',
    date: '2026-07-25',
    description: 'Registration, choice filling, and fee payment for CSAB Special Round 1 begins.'
  }
];

// Helper to get active events (e.g. today or future)
export const getActiveEvents = () => {
  const today = new Date().toISOString().split('T')[0];
  return upcomingEvents.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
};
