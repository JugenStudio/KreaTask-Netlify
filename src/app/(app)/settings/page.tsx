
import { UserTable } from "@/components/settings/user-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { users } from "@/lib/data";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your team and application settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User Management</CardTitle>
          <CardDescription>
            Assign roles and manage team member permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="w-full overflow-x-auto">
                <UserTable initialUsers={users} />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
