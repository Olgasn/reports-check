import { CheckInfo } from '@components/LabCheck/CheckInfo';
import { CheckResultsDiv } from '@components/LabCheck/styled';
import { ModalBtn } from '@components/Settings/KeysSettings/KeyEditModal/styled';
import { useLabChecks } from '@hooks';
import { FC } from 'react';
import Modal from 'react-bootstrap/esm/Modal';

interface Props {
  name: string;
  labId: number;
  isShow: boolean;
  handleClose: () => void;
}

export const LabCheckModal: FC<Props> = ({ isShow, handleClose, name, labId }) => {
  const checks = useLabChecks(labId);

  return (
    <>
      <Modal show={isShow} centered onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <CheckResultsDiv>
            {checks.map((r) => (
              <CheckInfo data={r} key={r.id} />
            ))}
          </CheckResultsDiv>
        </Modal.Body>

        <Modal.Footer>
          <ModalBtn onClick={handleClose}>Закрыть</ModalBtn>
        </Modal.Footer>
      </Modal>
    </>
  );
};
