import { FC, useMemo } from 'react';

import { IconButton, Tooltip } from '@mui/material';

import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

import { CheckCopyBtnProps } from './check-copy-btn.types';
import { formatCheckToText } from './check-copy-btn.utils';

export const CheckCopyBtn: FC<CheckCopyBtnProps> = (props) => {
  const textToCopy = useMemo(() => formatCheckToText(props), [props]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error('Не удалось скопировать текст: ', err);
    }
  };

  return (
    <Tooltip title="Скопировать рецензию">
      <IconButton onClick={handleCopy}>
        <ContentCopyOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};
