import { faker } from "@faker-js/faker";

function createRandomCustomer() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }),
    address: {
      line1: faker.location.streetAddress(),
      line2: faker.location.streetAddress(),
      postcode: faker.location.zipCode(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      country: faker.location.countryCode(),
    },
  };
}

export function getRandomCustomers(count: number) {
  const customers = faker.helpers.multiple(createRandomCustomer, {
    count,
  });

  return customers;
}
