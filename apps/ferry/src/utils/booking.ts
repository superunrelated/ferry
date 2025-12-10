import { FerryCompany, Location } from '../types/timetable';

export function getBookingUrl(
  company: FerryCompany,
  departureLocation: Location | null | undefined
): string | undefined {
  if (!departureLocation) return undefined;

  if (company === 'Island Direct') {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateParam = `${day}-${month}-${year}`;
    const product =
      departureLocation === 'Auckland' ? 'AW-ONEWAY' : 'WA-ONEWAY';
    return `https://bookings.islanddirect.co.nz/BookingCat/Calendar/?Product=${product}&Date=${dateParam}&GroupSize=1`;
  }

  if (company === 'Fullers') {
    const from = departureLocation === 'Auckland' ? 'AUCK' : 'WAIH';
    const to = departureLocation === 'Auckland' ? 'WAIH' : 'AUCK';
    return `https://www.fullers.co.nz/booking/?from=${from}&to=${to}`;
  }

  return undefined;
}
