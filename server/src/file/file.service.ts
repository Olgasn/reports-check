import { Injectable } from '@nestjs/common';
import * as JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import { ReportCheck } from 'src/types/reports.types';
import { StudentParsedDto, StudentsParsedDto } from 'src/reports/dto/students-parsed.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  writeFile(data: { name: string; folder: string; content: string }) {
    const dir = path.join(process.cwd(), data.folder);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fullpath = path.join(dir, data.name);

    fs.writeFileSync(fullpath, data.content, { encoding: 'utf-8' });

    return fullpath;
  }

  async parseStudentsFromFile(zipBuffer: Buffer) {
    const dir = path.join(process.cwd(), 'temp');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const zip = await JSZip.loadAsync(zipBuffer);
    const extractDir = path.join(dir, `extracted_${Date.now()}`);

    try {
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }

      const students: StudentParsedDto[] = [];

      Object.keys(zip.files).forEach((filename) => {
        const file = zip.files[filename];

        if (!file.dir) {
          const [surname, name, middlename] = filename.split('_')[0].split(' ');

          const st = new StudentParsedDto();

          st.name = name;
          st.surname = surname;
          st.middlename = middlename;
          st.id = uuidv4();

          students.push(st);
        }
      });

      const parsedStudents = new StudentsParsedDto();

      parsedStudents.students = students;

      return parsedStudents;
    } finally {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  }

  async parseArchive(zipBuffer: Buffer) {
    const dir = path.join(process.cwd(), 'temp');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const zip = await JSZip.loadAsync(zipBuffer);
    const extractDir = path.join(dir, `extracted_${Date.now()}`);

    try {
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }

      await Promise.all(
        Object.keys(zip.files).map(async (filename) => {
          const file = zip.files[filename];
          const outputPath = path.join(extractDir, file.name);

          if (file.dir) {
            fs.mkdirSync(outputPath, { recursive: true });
          } else {
            const data = await file.async('nodebuffer');

            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, data);
          }
        }),
      );

      return await this.processFolders(extractDir);
    } finally {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  }

  async processFolders(rootDir: string) {
    const items = fs.readdirSync(rootDir, { withFileTypes: true });
    const results: ReportCheck[] = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const folderPath = path.join(rootDir, item.name);
        const parsedData = this.parseFolderName(item.name);

        if (parsedData) {
          const content = await this.extractFolderContent(folderPath);

          results.push({ ...parsedData, content });
        }
      }
    }

    return results;
  }

  parseFolderName(folderName: string) {
    const data = folderName.split('_');
    const [info, num] = data;
    const [surname, name, middlename] = info.split(' ');

    return {
      name,
      surname,
      middlename,
      num,
    };
  }

  async extractFolderContent(folderPath: string): Promise<string> {
    const files = fs.readdirSync(folderPath);
    const [targetFile] = files.filter(
      (f) => f.endsWith('.pdf') || f.endsWith('.docx') || f.endsWith('.doc'),
    );

    const filePath = path.join(folderPath, targetFile);
    const buffer = fs.readFileSync(filePath);

    const content = await this.parseFile(targetFile, buffer);

    return content;
  }

  async parseFile(name: string, content: Buffer) {
    switch (path.extname(name).toLowerCase()) {
      case '.pdf': {
        return this.extractPDF(content);
      }

      case '.docx': {
        return this.extractDOCX(content);
      }

      default: {
        return content.toString('utf-8');
      }
    }
  }

  async extractPDF(buffer: Buffer) {
    const data = await pdf(buffer);

    return data.text;
  }

  async extractDOCX(buffer: Buffer) {
    const result = await mammoth.extractRawText({ buffer });

    return result.value;
  }
}
