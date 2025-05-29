import { useUser } from "@/hooks/use-user";

export default function AdminTest() {
  const { user } = useUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel Test</h1>
      <div className="space-y-4">
        <div>
          <strong>User Data:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Admin Status:</strong>
          <span className={`ml-2 px-2 py-1 rounded ${user?.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {user?.isAdmin ? 'Admin User' : 'Regular User'}
          </span>
        </div>
        
        <div>
          <strong>Token Status:</strong>
          <span className="ml-2">
            {localStorage.getItem('codequest_token') ? 'Token Present' : 'No Token'}
          </span>
        </div>
      </div>
    </div>
  );
}