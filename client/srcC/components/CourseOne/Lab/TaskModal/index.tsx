import { ModalBtn } from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { FC } from 'react';
import Modal from 'react-bootstrap/esm/Modal';
import { TaskTextPre } from './styled';

interface Props {
  name: string;
  content: string;
  isShow: boolean;
  handleClose: () => void;
}

export const TaskModal: FC<Props> = ({ isShow, handleClose, name, content }) => {
  return (
    <>
      <Modal show={isShow} centered onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <TaskTextPre>{content}</TaskTextPre>
        </Modal.Body>

        <Modal.Footer>
          <ModalBtn onClick={handleClose}>Закрыть</ModalBtn>
        </Modal.Footer>
      </Modal>
    </>
  );
};
