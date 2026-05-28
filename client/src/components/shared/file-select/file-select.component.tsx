import { FC, useEffect, useState } from 'react';

import { Box, Button, TextField } from '@mui/material';

import { COLORS } from '@constants';
import { useFileSelect } from '@hooks';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { formatFileSize } from '@utils';

import { FileSelectProps } from './file-select.types';

export const FileSelect: FC<FileSelectProps> = ({ onChange, sx, textFieldSx, accept }) => {
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
  }, [fileControls.file, onChange]);

  return (
    <Box display="flex" flexDirection="row" sx={sx} flexGrow={1}>
      <TextField
        size="small"
        value={filename || 'Файл не выбран'}
        sx={{ flexGrow: 1, ...textFieldSx }}
        label="Выбранный файл"
      />

      <input
        type="file"
        hidden
        ref={fileControls.fileInputRef}
        onChange={fileControls.handleFileChange}
        accept={accept}
      />

      <Button
        variant="contained"
        startIcon={<FileDownloadOutlinedIcon />}
        sx={{
          background: COLORS.SECONDARY,
          textTransform: 'unset',
        }}
        onClick={fileControls.handleBtnClick}
      >
        Загрузить
      </Button>
    </Box>
  );
};
