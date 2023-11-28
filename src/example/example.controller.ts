// Nest.js 控制器
import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
import * as xlsx from 'xlsx';

@Controller('api')
export class UploadController {
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const resultData = [];

    for (const file of files) {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      // 将 data 转换成你想要的指定结构
      // 这里可以根据需要对 data 进行处理

      resultData.push(data);
    }

    return { processedData: resultData };
  }
}
