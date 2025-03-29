import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { FC, useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, deleteModel, RootState, setAddModelsModal, setModelsModal } from '@store';
import { ModelAddModal } from './ModelAddModal';
import { Model } from '@@types';
import { ModelEditModal } from './ModelEditModal';

export const ModelsSettings: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { models, addModelsModalOpen, keys, modelsModalOpen } = useSelector(
    (state: RootState) => state.settings
  );
  const [model, setModel] = useState<null | Model>(null);

  const handleOpenAddModal = () => {
    if (!keys.length) {
      window.alert('Чтобы добавить модель, вам нужно добавить хотя бы один ключ API');

      return;
    }

    dispatch(setAddModelsModal(true));
  };

  const handleCloseAddModal = () => {
    dispatch(setAddModelsModal(false));
  };

  const handleCloseModelsModal = () => {
    dispatch(setModelsModal(false));
  };

  return (
    <>
      <SettingsSection
        addCb={handleOpenAddModal}
        text={'Модели'}
        subText={'Задайте модели для работы.'}
        data={models}
        actions={[
          {
            text: 'Редактировать',
            icon: faPenToSquare,
            cb: (id: number) => {
              const model = models.find((m) => m.id === id);

              if (!model) {
                return;
              }

              setModel(model);

              dispatch(setModelsModal(true));
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

              dispatch(deleteModel(id));
            },
          },
        ]}
      />
      <ModelAddModal isShow={addModelsModalOpen} handleClose={handleCloseAddModal} />
      {model && (
        <ModelEditModal
          item={model}
          isShow={modelsModalOpen}
          handleClose={handleCloseModelsModal}
        />
      )}
    </>
  );
};
