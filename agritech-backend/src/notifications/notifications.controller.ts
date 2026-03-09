/**
 * Notifications Controller — REST API for User Notifications
 */
import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findMyNotifications(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
        return this.notificationsService.findByUser(req.user.sub, page || 1, limit || 20);
    }

    @Get('unread')
    async getUnreadCount(@Request() req: any) {
        const count = await this.notificationsService.getUnreadCount(req.user.sub);
        return { unread: count };
    }

    @Patch(':id/read')
    async markRead(@Param('id') id: string, @Request() req: any) {
        await this.notificationsService.markRead(id, req.user.sub);
        return { success: true };
    }

    @Patch('read-all')
    async markAllRead(@Request() req: any) {
        await this.notificationsService.markAllRead(req.user.sub);
        return { success: true };
    }
}
