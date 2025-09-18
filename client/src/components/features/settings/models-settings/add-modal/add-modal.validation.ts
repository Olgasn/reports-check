import * as yup from 'yup';
import { InferType } from 'yup';

export const AddModalSchema = yup.object({
  name: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
  value: yup
    .string()
    .required('Обязательный параметр')
    .min(6, 'Значение должен быть не менее 6 символов'),
  top_p: yup.number().min(0.0).max(1.0).required('Обязательный параметр'),
  temperature: yup.number().min(0.0).max(2.0).required('Обязательный параметр'),
  max_tokens: yup.number().min(1).required('Обязательный параметр'),
  maxRetries: yup.number().min(5).max(30).required('Обязательный параметр'),
  queryDelay: yup.number().min(2500).required('Обязательный параметр'),
  errorDelay: yup.number().min(10000).required('Обязательный параметр'),
});

export type AddModalFormData = InferType<typeof AddModalSchema>;
