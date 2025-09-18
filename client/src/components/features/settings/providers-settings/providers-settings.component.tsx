import { FC, useMemo, useState } from 'react';

import { IProvider } from '@@types';
import { useDeleteProvider, useProviders } from '@api';
import { useModalControls } from '@hooks';
import { getDefaultActions, SettingsSection } from '@shared';
import { toast } from 'react-toastify';

import { AddModal } from './add-modal';
import { EditModal } from './edit-modal';
import { mapProvidersToList } from './providers-settings.utils';

export const ProvidersSettings: FC = () => {
  const successDelete = () => toast.success('Провайдер успешно удален');
  const errorDelete = () => toast.error('Не удалось удалить провайдера');

  const addModalControls = useModalControls();
  const editModalControls = useModalControls();

  const [provider, setProvider] = useState<IProvider | null>(null);

  const { mutate: deleteProvider } = useDeleteProvider();
  const { data, isLoading } = useProviders();

  const actions = useMemo(
    () =>
      getDefaultActions(
        (id: number) => {
          if (!data) {
            return;
          }

          const item = data.find((it) => it.id === id);

          if (!item) {
            return;
          }

          setProvider(item);

          editModalControls.handleOpen();
        },
        (id: number) => {
          const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

          if (!confirmed) {
            return;
          }

          deleteProvider(id, {
            onSuccess: successDelete,
            onError: errorDelete,
          });
        }
      ),
    [data]
  );

  const handleEditModalClose = () => {
    setProvider(null);

    editModalControls.handleClose();
  };

  if (isLoading || !data) {
    return null;
  }

  const providers = mapProvidersToList(data);

  return (
    <>
      <SettingsSection
        text="Провайдеры"
        subText="Задайте провайдеров здесь"
        data={providers}
        addCb={addModalControls.handleOpen}
        actions={actions}
      />

      <AddModal isShow={addModalControls.open} handleClose={addModalControls.handleClose} />

      {provider && (
        <EditModal
          isShow={editModalControls.open}
          handleClose={handleEditModalClose}
          item={provider}
        />
      )}
    </>
  );
};
