import * as yup from 'yup';
import { InferType } from 'yup';

export const EditModalSchema = yup.object({
  name: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
  value: yup
    .string()
    .required('Обязательный параметр')
    .min(6, 'Значение должен быть не менее 6 символов'),
});

export type EditModalFormData = InferType<typeof EditModalSchema>;
