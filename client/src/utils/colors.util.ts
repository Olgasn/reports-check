import { SxProps } from '@mui/material';

export const textToColor = (text: string) => {
  let hash = 0;
  let i;

  for (i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;

    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

export const stringAvatar = (name: string, sx?: SxProps) => {
  let text = name;
  const splitted = text.split(' ');

  if (splitted.length >= 2) {
    text = `${splitted[0][0]}${splitted[1][0]}`;
  } else {
    text = `${text[0]}${text[0]}`;
  }

  const bgcolor = textToColor(name);

  return {
    sx: {
      bgcolor,
      ...sx,
    },
    children: text,
  };
};
