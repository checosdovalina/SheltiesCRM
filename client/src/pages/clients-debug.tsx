import { useAuth } from "@/hooks/useAuth";

export default function ClientsDebug() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '20px',
      right: '20px',
      bottom: '80px',
      backgroundColor: 'white',
      border: '2px solid red',
      padding: '20px',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>
        🔍 DEBUG - Página de Clientes
      </h1>
      
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', marginBottom: '15px', border: '1px solid #ccc' }}>
        <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
        <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
        <p><strong>user:</strong> {user ? JSON.stringify(user) : 'null'}</p>
      </div>
      
      {isLoading && (
        <div style={{ backgroundColor: '#fff3cd', padding: '15px', border: '1px solid #ffeaa7' }}>
          🔄 Cargando...
        </div>
      )}
      
      {!isLoading && !isAuthenticated && (
        <div style={{ backgroundColor: '#f8d7da', padding: '15px', border: '1px solid #f5c6cb' }}>
          ❌ No autenticado
        </div>
      )}
      
      {!isLoading && isAuthenticated && (
        <div style={{ backgroundColor: '#d1f2eb', padding: '15px', border: '1px solid #76d7c4' }}>
          <h2 style={{ color: 'green' }}>✅ ¡Autenticado correctamente!</h2>
          <p>Esta sería la página de clientes.</p>
          <p>Usuario: {user?.firstName} {user?.lastName}</p>
          <p>Email: {user?.email}</p>
          <p>Rol: {user?.role}</p>
        </div>
      )}
    </div>
  );
}