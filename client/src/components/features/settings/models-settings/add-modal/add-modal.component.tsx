import { FC, useId, useRef, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';

import { LlmInterfaces } from '@@types';
import { useCreateModel, useKeys, useProviders } from '@api';
import { COLORS } from '@constants';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@shared';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { AddModalProps } from './add-modal.types';
import { AddModalFormData, AddModalSchema } from './add-modal.validation';

export const AddModal: FC<AddModalProps> = ({ isShow, handleClose }) => {
  const { data: keys } = useKeys();
  const { data: providers } = useProviders();

  const [llmInterface, setLlmInterface] = useState<LlmInterfaces>(LlmInterfaces.OpenAi);
  const [keyIndex, setKeyIndex] = useState(0);
  const [providerIndex, setProviderIndex] = useState(0);

  const providerLabelId = useId();
  const llmInterfaceLabelid = useId();
  const keyLabelId = useId();

  const formRef = useRef<HTMLFormElement | null>(null);
  const { mutate: createModel } = useCreateModel();

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(AddModalSchema),
    defaultValues: {
      top_p: 0,
      temperature: 1.0,
      max_tokens: 8192,
      errorDelay: 10000,
      queryDelay: 2500,
      maxRetries: 5,
    },
  });

  const modalClose = () => {
    reset();
    setKeyIndex(0);
    setProviderIndex(0);
    setLlmInterface(LlmInterfaces.OpenAi);
    handleClose();
  };

  const onSuccess = () => {
    toast.success('Модель успешно добавлена');

    modalClose();
  };

  const onError = () => {
    toast.error('Не удалось добавить модель');

    modalClose();
  };

  const onSubmit = (data: AddModalFormData) => {
    const reqData = {
      llmInterface,
      ...data,
    };

    switch (llmInterface) {
      case LlmInterfaces.Ollama:
        {
          createModel(reqData, {
            onSuccess,
            onError,
          });
        }
        break;

      case LlmInterfaces.OpenAi: {
        if (!keys || !providers) {
          return;
        }

        const { id: keyId } = keys[keyIndex];
        const { id: providerId } = providers[providerIndex];

        createModel(
          { ...reqData, keyId, providerId },
          {
            onSuccess,
            onError,
          }
        );
      }
    }
  };

  const handleClickSubmit = () => {
    const { current } = formRef;

    current?.requestSubmit();
  };

  const handleLlmInterfaceChange = (e: SelectChangeEvent<LlmInterfaces>) =>
    setLlmInterface(e.target.value as LlmInterfaces);

  const handleKeyChange = (e: SelectChangeEvent<number>) => setKeyIndex(Number(e.target.value));

  const handleProviderChange = (e: SelectChangeEvent<number>) =>
    setProviderIndex(Number(e.target.value));

  if (!keys || !providers) {
    return null;
  }

  const hasErrors = llmInterface === LlmInterfaces.OpenAi && (!keys.length || !providers.length);

  const modalBody = (
    <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" gap={2}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Название"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ width: '300px' }}
                size="small"
              />
            )}
          />

          <Controller
            name="value"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Значение"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ width: '300px' }}
                size="small"
              />
            )}
          />

          <Controller
            name="maxRetries"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Кол-во повторных попыток"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ width: '300px' }}
                size="small"
              />
            )}
          />

          <Controller
            name="queryDelay"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Задержка между запросами (мс)"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ width: '300px' }}
                size="small"
              />
            )}
          />

          <Controller
            name="errorDelay"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Задержка при ошибке (мс)"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ width: '300px' }}
                size="small"
              />
            )}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2} sx={{ ml: 3 }}>
          <Controller
            name="temperature"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Температура"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                size="small"
                sx={{ width: '300px' }}
              />
            )}
          />

          <Controller
            name="top_p"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Top_p"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                size="small"
                sx={{ width: '300px' }}
              />
            )}
          />

          <Controller
            name="max_tokens"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Max tokens"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                size="small"
                sx={{ width: '300px' }}
              />
            )}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2} sx={{ ml: 3 }}>
          <FormControl fullWidth>
            <InputLabel id={llmInterfaceLabelid}>Интерфейс</InputLabel>
            <Select
              value={llmInterface}
              onChange={handleLlmInterfaceChange}
              size="small"
              labelId={llmInterfaceLabelid}
              label="Интерфейс"
              sx={{ width: '300px' }}
            >
              <MenuItem value={LlmInterfaces.Ollama}>{LlmInterfaces.Ollama}</MenuItem>
              <MenuItem value={LlmInterfaces.OpenAi}>{LlmInterfaces.OpenAi}</MenuItem>
            </Select>
          </FormControl>

          {llmInterface === LlmInterfaces.OpenAi && (
            <>
              <FormControl fullWidth>
                <InputLabel id={keyLabelId}>Ключ</InputLabel>
                <Select
                  labelId={keyLabelId}
                  value={keyIndex}
                  onChange={handleKeyChange}
                  size="small"
                  disabled={hasErrors}
                  label="Ключ"
                  sx={{ width: '300px' }}
                >
                  {keys.map(({ id, name }, index) => (
                    <MenuItem value={index} key={id}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id={providerLabelId}>Провайдер</InputLabel>
                <Select
                  labelId={providerLabelId}
                  value={providerIndex}
                  onChange={handleProviderChange}
                  size="small"
                  disabled={hasErrors}
                  label="Провайдер"
                  sx={{ width: '300px' }}
                >
                  {providers.map(({ id, name }, index) => (
                    <MenuItem value={index} key={id}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl error={hasErrors}>
                {hasErrors && (
                  <FormHelperText>
                    Для работы с OpenAi моделями нужно создать ключи и провайдеры
                  </FormHelperText>
                )}
              </FormControl>
            </>
          )}
        </Box>
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
        disabled={hasErrors}
      >
        Создать
      </Button>
    </Box>
  );

  return (
    <Modal
      body={modalBody}
      open={isShow}
      onClose={modalClose}
      title="Добавление модели"
      footer={modalFooter}
      sx={{ width: 'auto' }}
    />
  );
};
