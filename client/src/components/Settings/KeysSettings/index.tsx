import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FC, useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, deleteKey, RootState, setAddKeysModal, setKeysModal } from '@store';
import { ApiKey } from '@@types';
import { KeyEditModal } from './KeyEditModal';
import { KeyAddModal } from './KeyAddModal';

export const KeysSettings: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { keys, keysModalOpen, keysAddModalOpen } = useSelector(
    (state: RootState) => state.settings
  );
  const [key, setKey] = useState<null | ApiKey>(null);

  const handleModalClose = () => {
    dispatch(setKeysModal(false));
  };

  const handleAddModalOpen = () => {
    dispatch(setAddKeysModal(true));
  };

  const handleAddModalClose = () => {
    dispatch(setAddKeysModal(false));
  };

  return (
    <>
      <SettingsSection
        text={'Ключи API'}
        subText={'Задайте здесь ключи для API.'}
        data={keys}
        addCb={handleAddModalOpen}
        actions={[
          {
            text: 'Редактировать',
            icon: faPenToSquare,
            cb: (id: number) => {
              const keyFound = keys.find((k) => k.id === id);

              if (!keyFound) {
                return;
              }

              setKey(keyFound);

              dispatch(setKeysModal(true));
            },
          },
          {
            text: 'Удалить',
            icon: faTrashCan,
            cb: (id: number) => {
              const confirmed = window.confirm('Вы действительно хотите удалить элемент?');

              if (!confirmed) {
                return;
              }

              dispatch(deleteKey(id));
            },
          },
        ]}
      />

      <KeyAddModal isShow={keysAddModalOpen} handleClose={handleAddModalClose} />
      {key && <KeyEditModal isShow={keysModalOpen} item={key} handleClose={handleModalClose} />}
    </>
  );
};
