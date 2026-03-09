/**
 * Notifications Service — Platform Notification Management
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    ) { }

    /** Create a notification for a specific user */
    async create(userId: string, type: NotificationType, message: string, referenceId?: string): Promise<Notification> {
        const notification = this.notifRepo.create({
            user: { id: userId } as any,
            type,
            message,
            referenceId: referenceId ?? undefined,
        });
        return this.notifRepo.save(notification);
    }

    /** Shortcut: notify about order status */
    async notifyOrderStatus(userId: string, orderId: string, message: string): Promise<Notification> {
        return this.create(userId, NotificationType.ORDER_STATUS, message, orderId);
    }

    /** Shortcut: notify about dispute events */
    async notifyDisputeUpdate(userId: string, disputeId: string, message: string): Promise<Notification> {
        return this.create(userId, NotificationType.DISPUTE_UPDATE, message, disputeId);
    }

    /** Get notifications for a user (paginated, newest first) */
    async findByUser(userId: string, page = 1, limit = 20) {
        const [notifications, total] = await this.notifRepo.findAndCount({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const unread = await this.notifRepo.count({ where: { user: { id: userId }, isRead: false } });
        return { notifications, total, unread };
    }

    /** Mark a single notification as read */
    async markRead(notificationId: string, userId: string): Promise<void> {
        const notif = await this.notifRepo.findOne({ where: { id: notificationId, user: { id: userId } } });
        if (!notif) throw new NotFoundException('Notification not found');
        notif.isRead = true;
        await this.notifRepo.save(notif);
    }

    /** Mark all as read */
    async markAllRead(userId: string): Promise<void> {
        await this.notifRepo.update({ user: { id: userId }, isRead: false }, { isRead: true });
    }

    /** Get unread count for badge */
    async getUnreadCount(userId: string): Promise<number> {
        return this.notifRepo.count({ where: { user: { id: userId }, isRead: false } });
    }
}
