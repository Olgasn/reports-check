import { FC, useMemo, useState } from 'react';

import { IKey } from '@@types';
import { useDeleteKey, useKeys } from '@api';
import { useModalControls } from '@hooks';
import { SettingsSection } from '@shared';
import { toast } from 'react-toastify';

import { AddModal } from './add-modal';
import { EditModal } from './edit-modal';
import { getKeysActions } from './keys-settings.constants';

export const KeysSettings: FC = () => {
  const successDelete = () => toast.success('Ключ успешно удален');
  const errorDelete = () => toast.error('Не удалось удалить элемент');

  const addModalControls = useModalControls();
  const editModalControls = useModalControls();

  const [key, setKey] = useState<IKey | null>(null);

  const { mutate: deleteKey } = useDeleteKey();
  const { data, isLoading } = useKeys();

  const actions = useMemo(
    () =>
      getKeysActions(
        (id: number) => {
          if (!data) {
            return;
          }

          const item = data.find((it) => it.id === id);

          if (!item) {
            return;
          }

          setKey(item);

          editModalControls.handleOpen();
        },
        (id: number) => {
          const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

          if (!confirmed) {
            return;
          }

          deleteKey(id, {
            onSuccess: successDelete,
            onError: errorDelete,
          });
        }
      ),
    [data]
  );

  const handleEditModalClose = () => {
    setKey(null);

    editModalControls.handleClose();
  };

  if (isLoading || !data) {
    return null;
  }

  return (
    <>
      <SettingsSection
        text="Ключи API"
        subText="Задайте здесь ключи для API."
        data={data ?? []}
        addCb={addModalControls.handleOpen}
        actions={actions}
      />

      <AddModal isShow={addModalControls.open} handleClose={addModalControls.handleClose} />

      {key && (
        <EditModal isShow={editModalControls.open} handleClose={handleEditModalClose} item={key} />
      )}
    </>
  );
};
