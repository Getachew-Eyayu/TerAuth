"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_js_1 = __importDefault(require("../prisma.js"));
const auth_service_js_1 = require("../services/auth.service.js");
const audit_service_js_1 = require("../services/audit.service.js");
class InstitutionController {
    /**
     * Public Institution Registration
     * Creates an institution in PENDING state along with the primary administrative user account.
     */
    static async register(req, res) {
        try {
            const { institutionName, officialEmail, contactNumber, address, institutionType, adminFullName, adminUsername, adminEmail, password, } = req.body;
            // Check for existing institution email
            const existingInstitution = await prisma_js_1.default.institution.findFirst({
                where: {
                    OR: [
                        { officialEmail: officialEmail.toLowerCase().trim() },
                        { name: institutionName.trim() },
                    ],
                },
            });
            if (existingInstitution) {
                res.status(409).json({
                    success: false,
                    message: 'An institution with this official email or name already exists in the registry.',
                });
                return;
            }
            // Check for existing username or admin email
            const existingUser = await prisma_js_1.default.user.findFirst({
                where: {
                    OR: [
                        { username: adminUsername.toLowerCase().trim() },
                        { email: adminEmail.toLowerCase().trim() },
                    ],
                },
            });
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'Admin username or email is already registered.',
                });
                return;
            }
            // Generate unique human-readable Institution ID e.g. INST-8492
            const randomCode = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
            const institutionId = `INST-${randomCode}`;
            const userId = `USR-${crypto_1.default.randomBytes(3).toString('hex').toUpperCase()}`;
            const passwordHash = await auth_service_js_1.AuthService.hashPassword(password);
            // Create institution and admin user in transaction
            const result = await prisma_js_1.default.$transaction(async (tx) => {
                const institution = await tx.institution.create({
                    data: {
                        institutionId,
                        name: institutionName.trim(),
                        officialEmail: officialEmail.toLowerCase().trim(),
                        contactNumber: contactNumber?.trim() || null,
                        address: address?.trim() || null,
                        type: institutionType.trim(),
                        status: 'PENDING',
                    },
                });
                const user = await tx.user.create({
                    data: {
                        userId,
                        username: adminUsername.toLowerCase().trim(),
                        email: adminEmail.toLowerCase().trim(),
                        passwordHash,
                        role: 'INSTITUTION_ADMIN',
                        status: 'ACTIVE',
                        institutionId: institution.id,
                    },
                });
                return { institution, user };
            });
            res.status(201).json({
                success: true,
                message: 'Your institution registration has been submitted and is awaiting administrator approval.',
                data: {
                    institutionId: result.institution.institutionId,
                    name: result.institution.name,
                    status: result.institution.status,
                    adminUsername: result.user.username,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Registration failed',
            });
        }
    }
    /**
     * Super Admin: List all institutions with search & filter
     */
    static async getAll(req, res) {
        try {
            const { search, status, page = '1', limit = '20' } = req.query;
            const pageNumber = Math.max(1, parseInt(page, 10) || 1);
            const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
            const skip = (pageNumber - 1) * limitNumber;
            const where = {};
            if (status && status !== 'ALL') {
                where.status = status;
            }
            if (search) {
                where.OR = [
                    { name: { contains: search.trim() } },
                    { institutionId: { contains: search.trim() } },
                    { officialEmail: { contains: search.trim() } },
                ];
            }
            const [institutions, total] = await Promise.all([
                prisma_js_1.default.institution.findMany({
                    where,
                    skip,
                    take: limitNumber,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        _count: {
                            select: {
                                certificates: true,
                                users: true,
                            },
                        },
                    },
                }),
                prisma_js_1.default.institution.count({ where }),
            ]);
            res.status(200).json({
                success: true,
                data: institutions,
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
                message: error.message || 'Failed to fetch institutions',
            });
        }
    }
    /**
     * Get single institution details
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const institution = await prisma_js_1.default.institution.findFirst({
                where: {
                    OR: [{ id }, { institutionId: id }],
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            userId: true,
                            username: true,
                            email: true,
                            role: true,
                            status: true,
                            createdAt: true,
                        },
                    },
                    _count: {
                        select: {
                            certificates: true,
                        },
                    },
                },
            });
            if (!institution) {
                res.status(404).json({ success: false, message: 'Institution not found' });
                return;
            }
            // Authorization scoping: INSTITUTION_ADMIN can only view their own institution details
            if (req.user?.role === 'INSTITUTION_ADMIN' && req.user.institutionId !== institution.id) {
                res.status(403).json({
                    success: false,
                    message: 'Access restricted: You may only view details for your assigned institution.',
                });
                return;
            }
            res.status(200).json({ success: true, data: institution });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch institution',
            });
        }
    }
    /**
     * Super Admin: Approve institution
     */
    static async approve(req, res) {
        try {
            const { id } = req.params;
            const institution = await prisma_js_1.default.institution.findFirst({
                where: { OR: [{ id }, { institutionId: id }] },
            });
            if (!institution) {
                res.status(404).json({ success: false, message: 'Institution not found' });
                return;
            }
            const updated = await prisma_js_1.default.institution.update({
                where: { id: institution.id },
                data: {
                    status: 'APPROVED',
                    rejectionReason: null,
                },
            });
            await audit_service_js_1.AuditService.logAdminAction({
                actorId: req.user?.id,
                actorUsername: req.user?.username,
                action: 'INSTITUTION_APPROVED',
                targetType: 'INSTITUTION',
                targetId: institution.institutionId,
                ipAddress: req.ip,
            });
            res.status(200).json({
                success: true,
                message: `Institution '${updated.name}' has been successfully approved.`,
                data: updated,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Approval failed',
            });
        }
    }
    /**
     * Super Admin: Reject institution
     */
    static async reject(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const institution = await prisma_js_1.default.institution.findFirst({
                where: { OR: [{ id }, { institutionId: id }] },
            });
            if (!institution) {
                res.status(404).json({ success: false, message: 'Institution not found' });
                return;
            }
            const updated = await prisma_js_1.default.institution.update({
                where: { id: institution.id },
                data: {
                    status: 'REJECTED',
                    rejectionReason: reason || 'Application did not meet accreditation criteria',
                },
            });
            await audit_service_js_1.AuditService.logAdminAction({
                actorId: req.user?.id,
                actorUsername: req.user?.username,
                action: 'INSTITUTION_REJECTED',
                targetType: 'INSTITUTION',
                targetId: institution.institutionId,
                reason: reason || null,
                ipAddress: req.ip,
            });
            res.status(200).json({
                success: true,
                message: `Institution '${updated.name}' has been rejected.`,
                data: updated,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Rejection failed',
            });
        }
    }
    /**
     * Super Admin: Suspend or reinstate institution
     */
    static async toggleStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;
            const institution = await prisma_js_1.default.institution.findFirst({
                where: { OR: [{ id }, { institutionId: id }] },
            });
            if (!institution) {
                res.status(404).json({ success: false, message: 'Institution not found' });
                return;
            }
            const updated = await prisma_js_1.default.institution.update({
                where: { id: institution.id },
                data: {
                    status,
                    rejectionReason: reason || null,
                },
            });
            await audit_service_js_1.AuditService.logAdminAction({
                actorId: req.user?.id,
                actorUsername: req.user?.username,
                action: `INSTITUTION_STATUS_${status}`,
                targetType: 'INSTITUTION',
                targetId: institution.institutionId,
                reason: reason || null,
                ipAddress: req.ip,
            });
            res.status(200).json({
                success: true,
                message: `Institution status updated to ${status}.`,
                data: updated,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update institution status',
            });
        }
    }
    /**
     * Update institution information
     * Accessible by SUPER_ADMIN or assigned INSTITUTION_ADMIN
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, officialEmail, contactNumber, address, type } = req.body;
            const institution = await prisma_js_1.default.institution.findFirst({
                where: { OR: [{ id }, { institutionId: id }] },
            });
            if (!institution) {
                res.status(404).json({ success: false, message: 'Institution not found' });
                return;
            }
            // Scoping: INSTITUTION_ADMIN can only edit their own institution
            if (req.user?.role === 'INSTITUTION_ADMIN' && req.user.institutionId !== institution.id) {
                res.status(403).json({
                    success: false,
                    message: 'Access restricted: You may only edit information for your assigned institution.',
                });
                return;
            }
            const updated = await prisma_js_1.default.institution.update({
                where: { id: institution.id },
                data: {
                    ...(name && { name: name.trim() }),
                    ...(officialEmail && { officialEmail: officialEmail.toLowerCase().trim() }),
                    ...(contactNumber !== undefined && { contactNumber: contactNumber?.trim() || null }),
                    ...(address !== undefined && { address: address?.trim() || null }),
                    ...(type && { type: type.trim() }),
                },
            });
            await audit_service_js_1.AuditService.logAdminAction({
                actorId: req.user?.id,
                actorUsername: req.user?.username,
                action: 'INSTITUTION_UPDATED',
                targetType: 'INSTITUTION',
                targetId: institution.institutionId,
                ipAddress: req.ip,
            });
            res.status(200).json({
                success: true,
                message: 'Institution information updated successfully.',
                data: updated,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update institution information.',
            });
        }
    }
}
exports.InstitutionController = InstitutionController;
