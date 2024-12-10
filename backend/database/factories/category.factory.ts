import { setSeederFactory } from 'typeorm-extension';
import { Category } from 'src/category/category.entity';

export default setSeederFactory(Category, (faker) => {
  const category = new Category();

  category.name = faker.commerce.department();
  category.description = faker.lorem.sentence();
  category.note = faker.lorem.paragraph();
  // category.cloudProvider = faker.company.name();

  return category;
}); 