import { useAuthContext } from "@asgardeo/auth-react";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const { state, signIn, signOut, getBasicUserInfo } = useAuthContext();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (state.isAuthenticated) {
      getBasicUserInfo().then((response) => setUserInfo(response));
    }
  }, [state.isAuthenticated, getBasicUserInfo]);

  return (
    <div className="App" style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>📚 Library Portal</h1>
      <p>A second simple React app to demonstrate WSO2 Asgardeo SSO.</p>
      
      {state.isAuthenticated ? (
        <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
          <h2>Welcome back, {userInfo?.username || userInfo?.email || "Student"}!</h2>
          <p>Because you were logged into the Student Portal, Asgardeo logged you in here automatically! (SSO)</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button 
              onClick={() => signOut()}
              style={{ padding: '10px 15px', cursor: 'pointer', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Log Out
            </button>
            <a 
              href="http://localhost:5173" 
              style={{ padding: '10px 15px', background: '#16a34a', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}
            >
              Return to Student Portal
            </a>
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <p>Please log in to access the Library catalog.</p>
          <button 
            onClick={() => signIn()}
            style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', background: '#ff5000', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Login with Asgardeo
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
