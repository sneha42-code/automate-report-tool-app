
import NeuralGobal from "./NeuralGobal";

const AuthLeftSection = () => (
  <div
    className="auth-svg-left"
    style={{
      flex: '1',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 0 0 0',
      margin: 0,
      overflow: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
      borderRadius: '24px'
    }}
  >
  <div 
      style={{
        background: 'black',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}
    >
     <NeuralGobal></NeuralGobal>
    </div>
  </div>
);

export default AuthLeftSection;