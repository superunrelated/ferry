export type FerryCompany = 'Fullers' | 'Island Direct';

export type Location = 'Auckland' | 'Waiheke';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Sailing {
  time: string; // HH:MM format (24-hour)
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
  lastUpdated: string; // ISO 8601 date string
  routes: TimetableRoute[];
}
