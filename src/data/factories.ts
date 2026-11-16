import { faker } from '@faker-js/faker';
import type { Booking } from '../api/schemas';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export function buildCustomer(overrides: Partial<CustomerInfo> = {}): CustomerInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = faker.date.soon({ days: 14, refDate: checkin });

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 2000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: isoDate(checkin), checkout: isoDate(checkout) },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Airport transfer']),
    ...overrides,
  };
}
