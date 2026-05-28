import { useCallback, useMemo, useState } from 'react';

export const useModalControls = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return useMemo(
    () => ({
      open,
      handleOpen,
      handleClose,
    }),
    [handleClose, handleOpen, open]
  );
};
