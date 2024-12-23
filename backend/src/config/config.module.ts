import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { SamlMetadataService } from './saml-metadata.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  providers: [AppConfigService, SamlMetadataService],
  exports: [AppConfigService, SamlMetadataService],
})
export class AppConfigModule {} 