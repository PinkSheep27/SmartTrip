import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import HomePage from './components/HomePage';
import FlightPage from "./components/FlightPage";

function App() {
  return (
  <>
    <HomePage />

    <div className="min-h-screen flex items-center justify-center bg-gray-50">
     <div className="flex gap-6">
      <LoginForm />
      <SignUpForm />
     </div>
   </div>

  <FlightPage />
 </>
  );
}

export default App;
