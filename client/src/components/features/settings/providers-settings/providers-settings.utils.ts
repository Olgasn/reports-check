import { IProvider } from '@@types';

export const mapProvidersToList = (data: IProvider[]) => {
  const providersMapped = data.map(({ id, name, url }) => ({ id, name, value: url }));

  return providersMapped;
};
