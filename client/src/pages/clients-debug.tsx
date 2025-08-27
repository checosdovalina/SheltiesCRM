export default function ClientsDebug() {
  return (
    <div style={{
      position: 'fixed',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
      backgroundColor: 'red',
      color: 'white',
      fontSize: '30px',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1>🚨 COMPONENTE DE DEBUG FUNCIONANDO 🚨</h1>
      <p>Si ves esto, React funciona</p>
      <p>El problema está en otro lado</p>
    </div>
  );
}