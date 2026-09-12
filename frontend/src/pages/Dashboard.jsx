import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <h1>Welcome, {user?.name}</h1>
      <p>This is your VITVerse dashboard. Features will show up here as they're built.</p>
    </AppLayout>
  );
}
