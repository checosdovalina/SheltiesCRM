import { useAuth } from "@/hooks/useAuth";

export default function ClientsDebug() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">DEBUG - Página de Clientes</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
        <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
        <p><strong>user:</strong> {user ? JSON.stringify(user) : 'null'}</p>
      </div>
      
      {isLoading && (
        <div className="bg-yellow-100 p-4 rounded">
          Cargando...
        </div>
      )}
      
      {!isLoading && !isAuthenticated && (
        <div className="bg-red-100 p-4 rounded">
          No autenticado
        </div>
      )}
      
      {!isLoading && isAuthenticated && (
        <div className="bg-green-100 p-4 rounded">
          <h2>¡Autenticado correctamente!</h2>
          <p>Esta sería la página de clientes.</p>
        </div>
      )}
    </div>
  );
}