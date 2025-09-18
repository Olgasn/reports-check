import { useRef, useState } from 'react';

export const useFileSelect = () => {
  const [file, setFile] = useState<File | undefined>(undefined);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFile(file);
    }
  };

  const handleBtnClick = () => {
    if (!fileInputRef.current) {
      return;
    }

    fileInputRef.current.click();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFile = () => {
    setFile(undefined);
  };

  return {
    file,
    fileInputRef,
    handleBtnClick,
    handleFileChange,
    resetFile,
  };
};
