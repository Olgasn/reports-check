import { FC, useMemo, useState } from 'react';

import { IModel } from '@@types';
import { useDeleteModel, useModels } from '@api';
import { useModalControls } from '@hooks';
import { SettingsSection } from '@shared';
import { toast } from 'react-toastify';

import { AddModal } from './add-modal';
import { EditModal } from './edit-modal';
import { getModelsActions } from './models-settings.constants';

export const ModelsSettings: FC = () => {
  const onDeleteSuccess = () => toast.success('Модель успешно удалена');
  const onDeleteError = () => toast.error('Не удалось удалить модель');

  const { data } = useModels();

  const [model, setModel] = useState<IModel | null>();

  const addModalControls = useModalControls();
  const editModalControls = useModalControls();

  const { mutate: deleteModel } = useDeleteModel();

  const actions = useMemo(
    () =>
      getModelsActions(
        (id: number) => {
          if (!data) {
            return;
          }

          const item = data.find((d) => d.id === id);

          if (!item) {
            return;
          }

          setModel(item);

          editModalControls.handleOpen();
        },
        (id: number) => {
          const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

          if (!confirmed) {
            return;
          }

          deleteModel(id, {
            onSuccess: onDeleteSuccess,
            onError: onDeleteError,
          });
        }
      ),
    [data]
  );

  const handleEditClose = () => {
    setModel(null);

    editModalControls.handleClose();
  };

  return (
    <>
      <SettingsSection
        addCb={addModalControls.handleOpen}
        text="Модели"
        subText="Задайте модели для работы."
        data={data ?? []}
        actions={actions}
      />

      <AddModal isShow={addModalControls.open} handleClose={addModalControls.handleClose} />

      {model && (
        <EditModal isShow={editModalControls.open} handleClose={handleEditClose} item={model} />
      )}
    </>
  );
};
