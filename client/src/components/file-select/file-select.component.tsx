import { FC, useEffect, useState } from 'react';
import { FileSelectProps } from './file-select.types';
import { useFileSelect } from '@hooks';
import { Box, Button, TextField } from '@mui/material';
import { COLORS } from '@constants';
import { formatFileSize } from '@utils';

export const FileSelect: FC<FileSelectProps> = ({ onChange, sx }) => {
  const fileControls = useFileSelect();
  const [filename, setFilename] = useState('');

  useEffect(() => {
    const file = fileControls.file || null;

    if (!file) {
      return;
    }

    onChange(file);

    const fileSize = formatFileSize(file.size);

    setFilename(`${file.name} (${fileSize})`);
  }, [fileControls.file]);

  return (
    <Box display="flex" flexDirection="column" sx={sx}>
      <TextField size="small" value={filename || 'Файл не выбран'} />

      <input
        type="file"
        hidden
        ref={fileControls.fileInputRef}
        onChange={fileControls.handleFileChange}
      />

      <Button
        variant="contained"
        sx={{
          background: COLORS.SECONDARY,
          textTransform: 'unset',
        }}
        onClick={fileControls.handleBtnClick}
      >
        Выбрать
      </Button>
    </Box>
  );
};
