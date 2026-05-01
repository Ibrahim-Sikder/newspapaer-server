import slugify from 'slugify';
import { nanoid } from 'nanoid';

export const createSlug = (title: string) => {
  const slug = slugify(title, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    trim: true,
  });

  return `${slug}-${nanoid(4)}`;
};
