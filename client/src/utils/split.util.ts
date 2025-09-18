export const split = <T>(items: T[], count: number) => {
  const splitted: T[][] = [];
  let line: T[] = [];
  let len = 1;

  for (let i = 0; i < items.length; i++) {
    if (len != 0 && len % count === 0) {
      line.push(items[i]);

      splitted.push(line);

      line = [];
      len = 1;
    } else {
      line.push(items[i]);
      len++;
    }
  }

  if (line.length) {
    splitted.push(line);
  }

  return splitted;
};
