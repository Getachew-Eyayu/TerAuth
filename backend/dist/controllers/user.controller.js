"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const prisma_js_1 = __importDefault(require("../prisma.js"));
class UserController {
    /**
     * Super Admin: List all system users
     */
    static async getAll(req, res) {
        try {
            const { role, search, page = '1', limit = '20' } = req.query;
            const pageNumber = Math.max(1, parseInt(page, 10) || 1);
            const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
            const skip = (pageNumber - 1) * limitNumber;
            const where = {};
            if (role && role !== 'ALL') {
                where.role = role;
            }
            if (search) {
                where.OR = [
                    { username: { contains: search.trim() } },
                    { email: { contains: search.trim() } },
                    { userId: { contains: search.trim() } },
                ];
            }
            const [users, total] = await Promise.all([
                prisma_js_1.default.user.findMany({
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
                prisma_js_1.default.user.count({ where }),
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch users',
            });
        }
    }
    /**
     * Super Admin: Toggle user status (Activate/Deactivate)
     */
    static async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!['ACTIVE', 'INACTIVE'].includes(status)) {
                res.status(400).json({ success: false, message: 'Invalid status' });
                return;
            }
            const user = await prisma_js_1.default.user.update({
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update user status',
            });
        }
    }
}
exports.UserController = UserController;
