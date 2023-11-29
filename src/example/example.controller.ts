// 引入 Nest.js 的控制器、拦截器、异常处理等必要组件
import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

// 引入 Nest.js 的文件拦截器
import { FilesInterceptor } from '@nestjs/platform-express';

// 引入 Multer，用于文件上传
import { Multer } from 'multer';

// 引入 xlsx 库，用于处理 Excel 文件
import * as xlsx from 'xlsx';

// 定义列表项的数据类型
interface ListType {
  title: string;
  content: string;
}

// 定义最终返回的数据结构类型
interface ResType {
  title: string | undefined;
  subTitle: string | undefined;
  list: ListType[]; // 定义一个 ListType 类型的数组
}

@Controller('api') // 声明一个 API 控制器
export class UploadController {
  // 定义一个处理文件上传的方法
  @Post('upload') // 设置 POST 请求的路径
  @UseInterceptors(FilesInterceptor('files')) // 使用文件拦截器拦截名为 'files' 的文件上传
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const resultData = []; // 存储处理后的数据

    for (const file of files) {
      // 检查文件类型是否为 .xlsx
      if (!checkFileType(file)) {
        throw new BadRequestException(
          'Invalid file type. Please upload an .xlsx file.',
        );
      }
      try {
        // 读取上传的 Excel 文件
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });

        // 获取 Excel 文件的第一个 Sheet
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // 将 Sheet 数据转换为 JSON 格式
        const data = xlsx.utils.sheet_to_json(sheet);

        // 对每条数据进行处理并存储到 resultData 数组中
        const res = data.map(processDataItem);
        resultData.push(res);
      } catch (error) {
        // 在异常处理中执行特定的操作，比如记录日志或者返回特定的错误信息
        console.error('Error processing data:', error.message);
        resultData.push([]); // 在出现异常时添加空数据项，保持兼容性
      }
    }

    // 返回处理后的数据
    return { data: resultData };
  }
}

// 函数：检查文件类型是否为 .xlsx
function checkFileType(file: Express.Multer.File): boolean {
  return (
    file.mimetype ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}

// 函数：处理每条数据项的方法
function processDataItem(item: any): ResType {
  const tmp: ResType = {
    title: item['主标题'],
    subTitle: item['副标题'],
    list: [],
  };

  const dataTitles = item['列表标题'].split('\r\n');
  const dataContents = item['列表内容'].split('\r\n');
  for (let i = 0; i < dataTitles.length; ++i) {
    if (dataTitles[i] && dataTitles[i].length) {
      tmp.list.push({
        title: dataTitles[i],
        content: dataContents[i] || '', // 如果内容缺失，则默认为空字符串
      });
    }
  }

  return tmp;
}
