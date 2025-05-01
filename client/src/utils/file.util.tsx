import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export const prepareFormData = (data: object) => {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (!value && typeof value !== 'boolean') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        formData.append(key, item.toString());
      }
    } else if (value instanceof File || typeof value === 'string') {
      formData.append(key, value);
    } else if (typeof value === 'number') {
      formData.append(key, value.toString());
    } else {
      throw new Error('Unsupported form data type');
    }
  }

  return formData;
};

export const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

  return `${value} ${sizes[i]}`.replace(/\.0+$/, '');
};

export const getFileIcon = (filename: string) => {
  const p = filename.split('.');

  if (!p.length || p.length === 1) {
    return <InsertDriveFileOutlinedIcon />;
  }

  const ext = p[p.length - 1];

  switch (ext) {
    case '.doc':
    case '.docx':
      return <DescriptionOutlinedIcon />;
    case '.txt':
      return <TextSnippetOutlinedIcon />;
    case '.pdf':
      return <PictureAsPdfIcon />;
    default:
      return <InsertDriveFileOutlinedIcon />;
  }
};
