import { uniqueSorted } from '../../utils/arrays';

export const unionOptions = (baseOptions = [], fromData = [], { locale = 'pl', sensitivity = 'base' } = {}) =>
  uniqueSorted([...baseOptions, ...fromData].filter(Boolean), { locale, sensitivity });
