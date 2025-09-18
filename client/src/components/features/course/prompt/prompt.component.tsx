import { FC, useMemo, useState } from 'react';

import { Box, Button, TextField } from '@mui/material';

import { useCreatePrompt, useUpdatePrompt } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { PopoverMenu, TopHeader } from '@shared';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { TEXT_FIELD_ROWS, TEXT_FIELD_SX } from './prompt.constants';
import { PromptSchema } from './prompt.validation';
import { PromptProps } from './prompts.types';

export const Prompt: FC<PromptProps> = ({ prompt, courseId }) => {
  const createSuccess = () => toast.success('Промпт успешно создан');
  const createError = () => toast.error('Не удалось добавить промпт');

  const editSuccess = () => toast.success('Промпт успешно обновлен');
  const editError = () => toast.error('Не удалось обновить промпт');

  const { mutate: createPrompt } = useCreatePrompt();
  const { mutate: updatePrompt } = useUpdatePrompt();

  const { control, getValues, setValue, trigger } = useForm({
    resolver: yupResolver(PromptSchema),
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  const actions = useMemo(
    () => [
      {
        text: prompt ? 'Редактировать' : 'Задать',
        icon: prompt ? <EditOutlinedIcon /> : <AddCircleOutlineOutlinedIcon />,
        cb: () => {
          setIsEditing(true);

          setValue('content', prompt?.content ?? '');
        },
      },
    ],
    [prompt]
  );

  const handleSave = async () => {
    const result = await trigger('content');

    if (!result) {
      return;
    }

    if (prompt) {
      const data = {
        id: prompt.id,
        data: {
          content: getValues('content'),
        },
      };

      updatePrompt(data, {
        onSuccess: editSuccess,
        onError: editError,
      });
    } else {
      const data = {
        courseId,
        content: getValues('content'),
      };

      createPrompt(data, {
        onSuccess: createSuccess,
        onError: createError,
      });
    }

    setIsEditing(false);
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <TopHeader
          text="Промпт для проверки"
          subText="Задайте здесь промпт, на основании которого производится провека отчетов студентов"
        />

        <PopoverMenu actions={actions} elemId={prompt?.id ?? -1} />
      </Box>

      {isEditing ? (
        <Box display="flex" flexDirection="column">
          <Controller
            name="content"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Текст промпта"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                size="small"
                multiline
                rows={TEXT_FIELD_ROWS}
                sx={TEXT_FIELD_SX}
              />
            )}
          />

          <Box display="flex" flexDirection="row" sx={{ mt: 2 }}>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                background: COLORS.SECONDARY,
              }}
            >
              Сохранить
            </Button>
            <Button
              onClick={handleCancelEditing}
              variant="contained"
              sx={{
                background: COLORS.SECONDARY,
                ml: 1,
              }}
            >
              Отменить
            </Button>
          </Box>
        </Box>
      ) : (
        prompt && (
          <TextField
            label="Текст промпта"
            size="small"
            multiline
            rows={TEXT_FIELD_ROWS}
            value={prompt.content}
            sx={TEXT_FIELD_SX}
          />
        )
      )}
    </Box>
  );
};
