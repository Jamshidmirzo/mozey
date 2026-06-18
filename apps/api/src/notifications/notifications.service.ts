import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, type App } from 'firebase-admin/app';
import { getMessaging, type Message } from 'firebase-admin/messaging';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private app: App | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const keyPath = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
    if (!keyPath) {
      this.logger.warn(
        'FIREBASE_SERVICE_ACCOUNT_PATH not set — push notifications disabled',
      );
      return;
    }

    try {
      const absPath = resolve(process.cwd(), keyPath);
      const serviceAccount = JSON.parse(readFileSync(absPath, 'utf-8'));
      this.app = initializeApp({
        credential: cert(serviceAccount),
      });
      this.logger.log('Firebase Admin initialized');
    } catch (e) {
      this.logger.error('Failed to init Firebase Admin', e);
    }
  }

  async sendToAll(
    dto: SendNotificationDto,
  ): Promise<{ success: boolean; messageId?: string }> {
    if (!this.app) {
      this.logger.warn('Firebase not initialized, skipping push');
      return { success: false };
    }

    const topic = dto.topic || 'all';

    const message: Message = {
      topic,
      notification: {
        title: dto.title,
        body: dto.body,
      },
      android: {
        priority: 'high',
        notification: { sound: 'default' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    };

    try {
      const messageId = await getMessaging(this.app).send(message);
      this.logger.log(`Push sent to topic "${topic}": ${messageId}`);
      return { success: true, messageId };
    } catch (e) {
      this.logger.error('Failed to send push', e);
      return { success: false };
    }
  }
}
