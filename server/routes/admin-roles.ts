import type { Express } from "express";
import { z } from "zod";
import { db, isAdmin, logAudit } from "./shared";
import { createLogger } from "../lib/logger";
import { staffRoles, STAFF_PERMISSIONS, users as usersTable } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const log = createLogger('admin-roles');

export function registerAdminRoleRoutes(app: Express) {
  app.get("/api/admin/roles", isAdmin, async (req, res) => {
    try {
      const roles = await db.select().from(staffRoles).orderBy(desc(staffRoles.createdAt));
      res.json(roles);
    } catch (error) {
      log.error("Error fetching roles", error);
      res.status(500).json({ message: "Error fetching roles" });
    }
  });

  app.get("/api/admin/roles/permissions", isAdmin, async (req, res) => {
    res.json(STAFF_PERMISSIONS);
  });

  app.post("/api/admin/roles", isAdmin, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        permissions: z.array(z.string()).min(1),
      });

      const data = schema.parse(req.body);

      const validPerms = data.permissions.filter(p =>
        (STAFF_PERMISSIONS as readonly string[]).includes(p)
      );

      if (validPerms.length === 0) {
        return res.status(400).json({ message: "At least one valid permission required" });
      }

      const [role] = await db.insert(staffRoles).values({
        name: data.name,
        description: data.description || null,
        permissions: validPerms as any,
      }).returning();

      logAudit({
        action: 'staff_role_created',
        userId: req.session.userId,
        details: { roleId: role.id, name: data.name, permissions: validPerms },
      });

      res.json(role);
    } catch (error: any) {
      if (error?.code === '23505') {
        return res.status(400).json({ message: "A role with this name already exists" });
      }
      log.error("Error creating role", error);
      res.status(500).json({ message: "Error creating role" });
    }
  });

  app.patch("/api/admin/roles/:id", isAdmin, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const schema = z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional().nullable(),
        permissions: z.array(z.string()).min(1).optional(),
        isActive: z.boolean().optional(),
      });

      const data = schema.parse(req.body);
      const updates: any = { updatedAt: new Date() };

      if (data.name !== undefined) updates.name = data.name;
      if (data.description !== undefined) updates.description = data.description;
      if (data.isActive !== undefined) updates.isActive = data.isActive;
      if (data.permissions) {
        updates.permissions = data.permissions.filter(p =>
          (STAFF_PERMISSIONS as readonly string[]).includes(p)
        );
      }

      const [role] = await db.update(staffRoles)
        .set(updates)
        .where(eq(staffRoles.id, roleId))
        .returning();

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      logAudit({
        action: 'staff_role_updated',
        userId: req.session.userId,
        details: { roleId, updates },
      });

      res.json(role);
    } catch (error: any) {
      if (error?.code === '23505') {
        return res.status(400).json({ message: "A role with this name already exists" });
      }
      log.error("Error updating role", error);
      res.status(500).json({ message: "Error updating role" });
    }
  });

  app.delete("/api/admin/roles/:id", isAdmin, async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);

      const usersWithRole = await db.select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.staffRoleId, roleId));

      if (usersWithRole.length > 0) {
        return res.status(400).json({
          message: `Cannot delete: ${usersWithRole.length} user(s) have this role assigned`
        });
      }

      await db.delete(staffRoles).where(eq(staffRoles.id, roleId));

      logAudit({
        action: 'staff_role_deleted',
        userId: req.session.userId,
        details: { roleId },
      });

      res.json({ success: true });
    } catch (error) {
      log.error("Error deleting role", error);
      res.status(500).json({ message: "Error deleting role" });
    }
  });

  app.post("/api/admin/users/:userId/assign-role", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const schema = z.object({
        staffRoleId: z.number().nullable(),
      });

      const data = schema.parse(req.body);

      if (data.staffRoleId !== null) {
        const [role] = await db.select().from(staffRoles)
          .where(eq(staffRoles.id, data.staffRoleId));
        if (!role) {
          return res.status(404).json({ message: "Role not found" });
        }
      }

      const updates: any = {
        staffRoleId: data.staffRoleId,
        userType: data.staffRoleId ? 'staff' : 'client',
        updatedAt: new Date(),
      };

      if (data.staffRoleId) {
        updates.isSupport = true;
      } else {
        updates.isSupport = false;
      }

      const [updatedUser] = await db.update(usersTable)
        .set(updates)
        .where(eq(usersTable.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      logAudit({
        action: 'staff_role_assigned',
        userId: req.session.userId,
        details: { targetUserId: userId, staffRoleId: data.staffRoleId },
      });

      res.json(updatedUser);
    } catch (error) {
      log.error("Error assigning role", error);
      res.status(500).json({ message: "Error assigning role" });
    }
  });

  app.get("/api/admin/staff-users", isAdmin, async (req, res) => {
    try {
      const staffUsers = await db.select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        isAdmin: usersTable.isAdmin,
        isSupport: usersTable.isSupport,
        staffRoleId: usersTable.staffRoleId,
        userType: usersTable.userType,
        accountStatus: usersTable.accountStatus,
      }).from(usersTable)
        .where(eq(usersTable.userType, 'staff'));

      res.json(staffUsers);
    } catch (error) {
      log.error("Error fetching staff users", error);
      res.status(500).json({ message: "Error fetching staff" });
    }
  });
}
