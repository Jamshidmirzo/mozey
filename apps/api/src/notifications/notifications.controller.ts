import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { AdminJwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('admin/notifications')
@UseGuards(AdminJwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('send')
  async send(@Body() dto: SendNotificationDto) {
    const result = await this.notifications.sendToAll(dto);
    return { data: result };
  }
}
