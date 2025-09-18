import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';

import { Box, Button, Divider, Pagination, TextField } from '@mui/material';

import { ICoursePagination } from '@@types';
import { useCourses } from '@api';
import { COLORS } from '@constants';
import { useDebounce, useModalControls } from '@hooks';
import { TopHeader } from '@shared';
import { split } from '@utils';

import { AddModal } from './add-modal';
import { CourseItem } from './course-item';

export const Courses: FC = () => {
  const addModalControls = useModalControls();

  const [searchValue, setSearchValue] = useState('');
  const debounceSearchValue = useDebounce(searchValue, 1000);

  const [pagination, setPagination] = useState<ICoursePagination>({
    page: 1,
    pageSize: 30,
    name: '',
  });

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      name: debounceSearchValue,
    }));
  }, [debounceSearchValue]);

  const { data: courses, isLoading } = useCourses(pagination);

  const coursesSplitted = useMemo(() => split(courses?.items ?? [], 3), [courses]);

  const handleOpenAddModal = () => {
    addModalControls.handleOpen();
  };

  const handlePageChange = (_: unknown, value: number) => {
    setPagination((prev) => ({
      ...prev,
      page: value,
    }));
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

  if (isLoading || !courses) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{ height: '100%', justifyContent: 'space-between' }}
    >
      <Box>
        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
          <TopHeader text="Курсы" subText="Здесь вы можете создавать и редактировать курсы." />

          <Button
            variant="contained"
            sx={{
              height: '40px',
              textTransform: 'unset',
              background: COLORS.SECONDARY,
            }}
            onClick={handleOpenAddModal}
          >
            Добавить
          </Button>
        </Box>

        <Divider flexItem sx={{ my: 2 }} />

        <TextField
          size="small"
          label="Название курса"
          sx={{ width: '100%', bgcolor: 'white' }}
          onChange={handleSearchChange}
          value={searchValue}
        />

        <Divider flexItem sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column">
          {coursesSplitted.map((line, index) => (
            <Box key={index} display="flex" flexDirection="row">
              {line.map(({ id, name, description }) => (
                <CourseItem key={id} name={name} description={description} id={id} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      <Box display="flex" justifyContent="center">
        <Pagination count={courses.total} page={pagination.page} onChange={handlePageChange} />
      </Box>

      <AddModal handleClose={addModalControls.handleClose} isShow={addModalControls.open} />
    </Box>
  );
};
