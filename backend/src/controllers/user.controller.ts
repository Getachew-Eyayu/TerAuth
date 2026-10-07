import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export class UserController {
  /**
   * Super Admin: List all system users
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role, search, page = '1', limit = '20' } = req.query;

      const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {};

      if (role && role !== 'ALL') {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { username: { contains: (search as string).trim() } },
          { email: { contains: (search as string).trim() } },
          { userId: { contains: (search as string).trim() } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userId: true,
            username: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            institution: {
              select: {
                id: true,
                institutionId: true,
                name: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch users',
      });
    }
  }

  /**
   * Super Admin: Toggle user status (Activate/Deactivate)
   */
  static async toggleStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }

      const user = await prisma.user.update({
        where: { id },
        data: { status },
        select: {
          id: true,
          userId: true,
          username: true,
          status: true,
        },
      });

      res.status(200).json({
        success: true,
        message: `User status updated to ${status}.`,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update user status',
      });
    }
  }
}
