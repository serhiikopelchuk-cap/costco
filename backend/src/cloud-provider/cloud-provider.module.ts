import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudProvider } from './cloud-provider.entity';
import { CloudProviderService } from './cloud-provider.service';
import { CloudProviderController } from './cloud-provider.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CloudProvider])],
  providers: [CloudProviderService],
  controllers: [CloudProviderController],
  exports: [CloudProviderService],
})
export class CloudProviderModule {} 