import { getUsers } from './lib/db';
import UserList from './components/UserList';

export default async function Home() {
  const users = await getUsers();

  return (
    <div className="container mx-auto py-8">
      <UserList users={users} />
    </div>
  );
}
