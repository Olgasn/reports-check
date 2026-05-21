import { FC, useRef, useState } from 'react';

import { Box, Button } from '@mui/material';

import { useImportStudentsCsv } from '@api';
import { COLORS } from '@constants';
import { FileSelect, Modal } from '@shared';
import { toast } from 'react-toastify';

import { ImportCsvModalProps } from './import-csv-modal.types';

export const ImportCsvModal: FC<ImportCsvModalProps> = ({ isShow, handleClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: importStudentsCsv } = useImportStudentsCsv();

  const onSubmit = () => {
    if (!file) {
      window.alert('Выберите CSV файл!');

      return;
    }

    importStudentsCsv(
      { csvFile: file },
      {
        onSuccess: (result) => {
          toast.success(
            `Импорт завершен: добавлено ${result.createdStudents}, дубликатов ${result.duplicateStudents}, пропущено ${result.skippedRows}, создано групп ${result.createdGroups}.`,
          );
          handleClose();
        },
        onError: () => {
          toast.error('Не удалось импортировать студентов из CSV');
        },
      },
    );
  };

  const handleClickSubmit = () => {
    const { current } = formRef;

    current?.requestSubmit();
  };

  const modalBody = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      ref={formRef}
    >
      <Box display="flex" flexDirection="column">
        <FileSelect onChange={setFile} accept=".csv,text/csv" />
      </Box>
    </form>
  );

  const modalFooter = (
    <Box display="flex" flexDirection="row">
      <Button
        variant="contained"
        sx={{
          background: COLORS.MENU_BG,
          flexGrow: 1,
        }}
        onClick={handleClickSubmit}
      >
        Импортировать
      </Button>
    </Box>
  );

  return (
    <Modal
      body={modalBody}
      open={isShow}
      onClose={handleClose}
      title="Импорт студентов из CSV"
      footer={modalFooter}
      sx={{ width: '600px' }}
    />
  );
};
