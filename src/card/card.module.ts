import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { Card } from './entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from 'src/list/entities/list.entity';
import { Shared } from 'src/user/entities/shared.entity';
import { MulterModule } from '@nestjs/platform-express';
import mime from 'mime';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import s3Storage, * as multerS3 from 'multer-s3'
import { BoardModule } from 'src/board/board.module';
import { ListModule } from 'src/list/list.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, List, Shared]),BoardModule, ListModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const s3 = new S3Client({
          region: configService.get('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get('AWS_S3_ACCESS_KEY'),
            secretAccessKey: configService.get('AWS_S3_SECRET_ACCESS_KEY'),
          },
        })

        return {
          storage: s3Storage({
            s3,
            bucket: configService.get('AWS_S3_BUCKET'),
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
              cb(null, `${new Date().getTime()}.${mime.extension(file.mimetype)}`)
            },
          }),
          limits: {
            fileSize: 1024 * 1024 * 5, // 5 MB
            files: 1,
          },
          fileFilter(req, file, callback) {
            callback(null, true)
          },
        }
      },
    }),
  ],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService]
})
export class CardModule { }
