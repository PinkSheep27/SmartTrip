import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex gap-8">
        <LoginForm></LoginForm>
        <SignUpForm></SignUpForm>
      </div>
    </div>
  );
}

export default App;
