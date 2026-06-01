import { FileService } from './file.service';
import * as path from 'path';
import * as fs from 'fs';

// Mock external parsers
jest.mock('pdf-parse', () => jest.fn().mockResolvedValue({ text: 'parsed pdf content' }));
jest.mock('mammoth', () => ({
  extractRawText: jest.fn().mockResolvedValue({ value: 'parsed docx content' }),
}));

describe('FileService', () => {
  let service: FileService;

  beforeEach(() => {
    service = new FileService();
    jest.clearAllMocks();
  });

  // ─── writeFile ───────────────────────────────────────────────
  describe('writeFile', () => {
    it('creates directory if it does not exist and writes the file', () => {
      const existsSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined as any);
      const writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

      const result = service.writeFile({
        name: 'test.txt',
        folder: 'test_logs',
        content: 'hello world',
      });

      expect(existsSyncSpy).toHaveBeenCalled();
      expect(mkdirSyncSpy).toHaveBeenCalledWith(expect.stringContaining('test_logs'), {
        recursive: true,
      });
      expect(writeFileSyncSpy).toHaveBeenCalledWith(
        expect.stringContaining(path.join('test_logs', 'test.txt')),
        'hello world',
        { encoding: 'utf-8' },
      );
      expect(result).toContain('test.txt');
    });

    it('skips mkdir if directory already exists', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync');
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

      service.writeFile({ name: 'f.txt', folder: 'logs', content: 'data' });

      expect(mkdirSyncSpy).not.toHaveBeenCalled();
    });
  });

  // ─── parseFile ───────────────────────────────────────────────
  describe('parseFile', () => {
    it('parses .pdf files via pdf-parse', async () => {
      const pdfParse = require('pdf-parse');
      const buffer = Buffer.from('fake pdf');

      const result = await service.parseFile('report.pdf', buffer);

      expect(pdfParse).toHaveBeenCalledWith(buffer);
      expect(result).toBe('parsed pdf content');
    });

    it('parses .docx files via mammoth', async () => {
      const mammoth = require('mammoth');
      const buffer = Buffer.from('fake docx');

      const result = await service.parseFile('report.docx', buffer);

      expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer });
      expect(result).toBe('parsed docx content');
    });

    it('reads .txt files as UTF-8 string', async () => {
      const buffer = Buffer.from('plain text content', 'utf-8');

      const result = await service.parseFile('notes.txt', buffer);

      expect(result).toBe('plain text content');
    });

    it('treats unknown extensions as UTF-8 text', async () => {
      const buffer = Buffer.from('some data', 'utf-8');

      const result = await service.parseFile('file.dat', buffer);

      expect(result).toBe('some data');
    });
  });

  // ─── parseStudentFromFilename ────────────────────────────────
  describe('parseStudentFromFilename', () => {
    it('extracts surname, name, middlename from standard filename', () => {
      const result = service.parseStudentFromFilename('Иванов Иван Иванович_ЛР1.pdf');

      expect(result).toEqual({
        name: 'Иван',
        surname: 'Иванов',
        middlename: 'Иванович',
      });
    });

    it('throws if filename has no underscore separator and info is empty', () => {
      // path.parse('_something.pdf') => { name: '', ext: '.pdf' }
      // split('_') on empty => [''], info = '' which is falsy → throws
      expect(() => service.parseStudentFromFilename('_.pdf')).toThrow(
        'Не удалось извлечь ФИО студента из имени файла',
      );
    });

    it('throws if filename is just an underscore prefix', () => {
      // path.parse('_Иванов Иван Иванович.pdf') => { name: '_Иванов Иван Иванович', ext: '.pdf' }
      // split('_') => ['', 'Иванов Иван Иванович'], info = '' → throws
      expect(() => service.parseStudentFromFilename('_Иванов Иван Иванович.pdf')).toThrow(
        'Не удалось извлечь ФИО студента из имени файла',
      );
    });

    it('throws if not all three name parts are present', () => {
      expect(() => service.parseStudentFromFilename('Иванов Иван_ЛР1.pdf')).toThrow(
        'задайте имя файла в формате "Фамилия Имя Отчество_..."',
      );
    });

    it('handles extra whitespace between name parts', () => {
      const result = service.parseStudentFromFilename(
        'Петров  Петр  Петрович_ЛР2.docx',
      );

      expect(result).toEqual({
        name: 'Петр',
        surname: 'Петров',
        middlename: 'Петрович',
      });
    });

    it('handles filename without extension', () => {
      const result = service.parseStudentFromFilename('Сидоров Сидор Сидорович_задание1');

      expect(result).toEqual({
        name: 'Сидор',
        surname: 'Сидоров',
        middlename: 'Сидорович',
      });
    });
  });

  // ─── parseFolderName ─────────────────────────────────────────
  describe('parseFolderName', () => {
    it('extracts student info and num from standard Moodle folder name', () => {
      const result = service.parseFolderName('Иванов Иван Иванович_12345_assignsubmission');

      expect(result).toEqual({
        name: 'Иван',
        surname: 'Иванов',
        middlename: 'Иванович',
        num: '12345',
      });
    });

    it('works with minimal folder name (Фамилия Имя Отчество_num)', () => {
      const result = service.parseFolderName('Петров Петр Петрович_1');

      expect(result).toEqual({
        name: 'Петр',
        surname: 'Петров',
        middlename: 'Петрович',
        num: '1',
      });
    });
  });

  // ─── extractFolderContent ────────────────────────────────────
  describe('extractFolderContent', () => {
    it('picks the first .pdf file in the folder and parses it', async () => {
      jest.spyOn(fs, 'readdirSync').mockReturnValue([
        'report.pdf' as any,
        'notes.txt' as any,
      ] as any);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('pdf data'));

      const result = await service.extractFolderContent('/fake/folder');

      expect(result).toBe('parsed pdf content');
    });

    it('picks .docx over .doc when both present (first match wins)', async () => {
      jest.spyOn(fs, 'readdirSync').mockReturnValue([
        'report.docx' as any,
        'backup.doc' as any,
      ] as any);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('docx data'));

      const result = await service.extractFolderContent('/fake/folder');

      expect(result).toBe('parsed docx content');
    });

    it('picks .doc files', async () => {
      jest.spyOn(fs, 'readdirSync').mockReturnValue(['report.doc' as any] as any);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('doc data'));

      const result = await service.extractFolderContent('/fake/folder');

      // .doc is not .pdf or .docx, so falls through to UTF-8 text
      expect(result).toBe('doc data');
    });
  });

  // ─── parseSingleReport ───────────────────────────────────────
  describe('parseSingleReport', () => {
    const makeFile = (
      originalname: string,
      content: string,
    ): Express.Multer.File =>
      ({
        originalname,
        buffer: Buffer.from(content),
      }) as Express.Multer.File;

    it('parses a .pdf single report and extracts student from filename', async () => {
      const file = makeFile('Иванов Иван Иванович_ЛР1.pdf', 'pdf content');

      const reports = await service.parseSingleReport(file);

      expect(reports).toHaveLength(1);
      expect(reports[0].name).toBe('Иван');
      expect(reports[0].surname).toBe('Иванов');
      expect(reports[0].middlename).toBe('Иванович');
      expect(reports[0].num).toBe('Иванов Иван Иванович_ЛР1');
      expect(reports[0].content).toBe('parsed pdf content');
    });

    it('uses provided student info instead of parsing filename', async () => {
      const file = makeFile('some_file.docx', 'docx content');
      const student = { name: 'Анна', surname: 'Смирнова', middlename: 'Алексеевна' };

      const reports = await service.parseSingleReport(file, student);

      expect(reports[0].name).toBe('Анна');
      expect(reports[0].surname).toBe('Смирнова');
      expect(reports[0].middlename).toBe('Алексеевна');
    });

    it('throws for unsupported file extensions', async () => {
      const file = makeFile('report.xlsx', 'xlsx data');

      await expect(service.parseSingleReport(file)).rejects.toThrow(
        'Одиночная проверка поддерживает только файлы .pdf, .docx и .txt',
      );
    });

    it('parses .txt files as plain text', async () => {
      const file = makeFile('Петров Петр Петрович_отчет.txt', 'мой отчет');

      const reports = await service.parseSingleReport(file);

      expect(reports[0].content).toBe('мой отчет');
      expect(reports[0].name).toBe('Петр');
    });
  });

  // ─── parseStudentsFromFile (ZIP student list) ────────────────
  describe('parseStudentsFromFile', () => {
    it('parses student names from flat ZIP file structure', async () => {
      const JSZip = require('jszip');
      const mockZip = {
        files: {
          'Иванов Иван Иванович_12345_assignsubmission/report.pdf': { dir: false },
          'Петров Петр Петрович_67890_assignsubmission/lab.docx': { dir: false },
          'some_folder/': { dir: true },
        },
      };
      JSZip.loadAsync = jest.fn().mockResolvedValue(mockZip);

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined as any);
      jest.spyOn(fs, 'rmSync').mockImplementation(() => {});

      const result = await service.parseStudentsFromFile(Buffer.from('fake zip'));

      expect(result.students).toHaveLength(2);
      expect(result.students[0].surname).toBe('Иванов');
      expect(result.students[0].name).toBe('Иван');
      expect(result.students[0].middlename).toBe('Иванович');
      expect(result.students[0].id).toBeDefined();
      expect(result.students[1].surname).toBe('Петров');
    });

    it('cleans up temp directory in finally block', async () => {
      const JSZip = require('jszip');
      JSZip.loadAsync = jest.fn().mockResolvedValue({ files: {} });

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined as any);
      const rmSyncSpy = jest.spyOn(fs, 'rmSync').mockImplementation(() => {});

      await service.parseStudentsFromFile(Buffer.from('fake zip'));

      expect(rmSyncSpy).toHaveBeenCalledWith(
        expect.stringContaining('temp'),
        { recursive: true, force: true },
      );
    });
  });

  // ─── parseArchive ────────────────────────────────────────────
  describe('parseArchive', () => {
    it('extracts ZIP, processes folders and cleans up temp dir', async () => {
      const JSZip = require('jszip');
      const mockZipFile = {
        async: jest.fn().mockResolvedValue(Buffer.from('file content')),
        name: 'Иванов Иван Иванович_1/report.pdf',
        dir: false,
      };
      const mockZip = {
        files: {
          'Иванов Иван Иванович_1/': { dir: true, name: 'Иванов Иван Иванович_1/' },
          'Иванов Иван Иванович_1/report.pdf': mockZipFile,
        },
      };
      JSZip.loadAsync = jest.fn().mockResolvedValue(mockZip);

      let dirExists = false;
      jest.spyOn(fs, 'existsSync').mockImplementation(() => dirExists);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {
        dirExists = true;
        return undefined as any;
      });

      // processFolders calls readdirSync with { withFileTypes: true } → returns Dirent-like objects
      const makeDirent = (name: string, isDir: boolean) =>
        ({ isDirectory: () => isDir, name }) as any;

      jest.spyOn(fs, 'readdirSync').mockImplementation((dirPath: any, options?: any) => {
        if (options?.withFileTypes) {
          // Called from processFolders
          return [makeDirent('Иванов Иван Иванович_1', true)];
        }
        // Called from extractFolderContent — returns strings
        return ['report.pdf'];
      });

      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('pdf data'));
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      const rmSyncSpy = jest.spyOn(fs, 'rmSync').mockImplementation(() => {});

      const result = await service.parseArchive(Buffer.from('fake zip'));

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Иван');
      expect(result[0].surname).toBe('Иванов');
      expect(rmSyncSpy).toHaveBeenCalledWith(
        expect.stringContaining('temp'),
        { recursive: true, force: true },
      );
    });
  });

  // ─── processFolders ──────────────────────────────────────────
  describe('processFolders', () => {
    it('skips items that are not directories', () => {
      const makeDirent = (name: string, isDir: boolean) =>
        ({ isDirectory: () => isDir, name }) as any;

      jest.spyOn(fs, 'readdirSync').mockReturnValue([
        makeDirent('file.txt', false),
      ]);

      const resultPromise = service.processFolders('/root');

      // Since no directories, result should be empty
      return expect(resultPromise).resolves.toEqual([]);
    });

    it('skips folders with unparseable names (no underscore → num is undefined but still processes)', async () => {
      const makeDirent = (name: string, isDir: boolean) =>
        ({ isDirectory: () => isDir, name }) as any;

      let readdirCallCount = 0;
      jest.spyOn(fs, 'readdirSync').mockImplementation((dirPath: any, options?: any) => {
        readdirCallCount++;
        if (options?.withFileTypes) {
          // processFolders call
          return [makeDirent('badfolder', true)];
        }
        // extractFolderContent call — must return a matching file
        return ['report.pdf'];
      });

      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('some content'));

      const result = await service.processFolders('/root');
      expect(result).toHaveLength(1);
    });
  });
});
