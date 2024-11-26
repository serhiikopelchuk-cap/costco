import { setSeederFactory } from 'typeorm-extension';
import { Period } from 'src/period/period.entity';

export default setSeederFactory(Period, (faker) => {
  const period = new Period();
  period.name = `Period ${faker.number.int({ min: 1, max: 100 })}`;
  period.isFrozen = false;
  return period;
}); 