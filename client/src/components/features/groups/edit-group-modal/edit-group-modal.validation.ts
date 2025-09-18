import * as yup from 'yup';
import { InferType } from 'yup';

export const EditGroupSchema = yup.object({
  name: yup
    .string()
    .required('Обязательный параметр')
    .min(2, 'Название должен быть не менее 2 символов'),
});

export type EditGroupFormData = InferType<typeof EditGroupSchema>;
