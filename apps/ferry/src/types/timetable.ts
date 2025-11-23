export type FerryCompany = 'Fullers' | 'Island Direct';

export type Location = 'Auckland' | 'Waiheke';

export type DayGroup =
  | 'monday-tuesday'
  | 'wednesday'
  | 'wednesday-friday'
  | 'thursday-friday'
  | 'saturday'
  | 'sunday';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// New data format types
export interface Sailing {
  time: string; // HH:MM format
  company: FerryCompany;
  slow?: boolean; // true if sailing via Devonport/Rangitoto
}

export interface DaySchedule {
  monday: Sailing[];
  tuesday: Sailing[];
  wednesday: Sailing[];
  thursday: Sailing[];
  friday: Sailing[];
  saturday: Sailing[];
  sunday: Sailing[];
}

export interface TimetableRoute {
  from: Location;
  to: Location;
  schedule: DaySchedule;
}

export interface TimetableData {
  lastUpdated: string;
  routes: TimetableRoute[];
}

// Legacy types (for backward compatibility if needed)
export interface Schedule {
  [key: string]: string[]; // day group -> array of times in HH:MM format
}

export interface Route {
  from: Location;
  to: Location;
  schedule: Schedule;
  notes?: string[];
}

export interface FerryDeparture {
  time: string; // HH:MM format
  company: FerryCompany;
  from: Location;
  to: Location;
  notes?: string[];
  dayGroup?: DayGroup;
}

