import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export async function seedRolesAndPermissions() {
  console.log("🌱 Seeding roles and permissions...");

  try {
    // === 1️⃣ Roles ===
    const roles = [
      {
        id: "roles_super_admin",
        name: "Super Admin",
        description: "Memiliki semua akses dan kontrol penuh terhadap sistem.",
        level: 0,
      },
      {
        id: "roles_admin",
        name: "Direktur Utama",
        description: "Mengelola pengguna, tugas, dan pengaturan umum.",
        level: 1,
      },
      {
        id: "roles_team_leader",
        name: "Direktur Operasional",
        description: "Memantau kinerja tim dan mengelola tugas bawahan.",
        level: 2,
      },
      {
        id: "roles_team_member",
        name: "Karyawan",
        description: "Melaksanakan tugas yang diberikan oleh pimpinan tim.",
        level: 3,
      },
      {
        id: "roles_unassigned",
        name: "Unassigned",
        description: "Pengguna baru tanpa peran aktif.",
        level: 4,
      },
    ];

    await db.insert(schema.roles).values(roles).onConflictDoNothing();
    console.log("✅ Roles seeded.");

    // === 2️⃣ Permissions ===
    const permissions = [
      // --- Super Admin has all permissions implicitly, no need to define ---

      // Direktur Utama (Admin)
      { roleId: "roles_admin", action: "manage_users", allowed: true },
      { roleId: "roles_admin", action: "manage_tasks", allowed: true },
      { roleId: "roles_admin", action: "manage_settings", allowed: true },
      { roleId: "roles_admin", action: "validate_reports", allowed: true },

      // Direktur Operasional (Team Leader)
      { roleId: "roles_team_leader", action: "manage_users", allowed: true }, // Can manage team members
      { roleId: "roles_team_leader", action: "manage_tasks", allowed: true },
      { roleId: "roles_team_leader", action: "manage_settings", allowed: false },
      { roleId: "roles_team_leader", action: "validate_reports", allowed: false },

      // Karyawan (Team Member)
      { roleId: "roles_team_member", action: "manage_users", allowed: false },
      { roleId: "roles_team_member", action: "manage_tasks", allowed: false }, // Can only manage OWN tasks, handled in logic
      { roleId: "roles_team_member", action: "manage_settings", allowed: false },
      { roleId: "roles_team_member", action: "validate_reports", allowed: false },

      // Unassigned
      { roleId: "roles_unassigned", action: "manage_users", allowed: false },
      { roleId: "roles_unassigned", action: "manage_tasks", allowed: false },
      { roleId: "roles_unassigned", action: "manage_settings", allowed: false },
      { roleId: "roles_unassigned", action: "validate_reports", allowed: false },
    ];

    await db.insert(schema.permissions).values(permissions).onConflictDoNothing();
    console.log("✅ Permissions seeded.");

    console.log("🎉 Seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding roles and permissions:", err);
  } finally {
    await pool.end();
  }
}

// Allow running this script directly
if (require.main === module) {
  seedRolesAndPermissions();
}
