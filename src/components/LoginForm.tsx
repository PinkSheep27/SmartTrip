import { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="container">
      <h2 className="">Login Into Your Account</h2>
      <form>
        <input
          type="email"
          placeholder="email@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="email"
        ></input>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="password"
        ></input>
        <button>Login</button>
        <button>Create Account</button>
        <div>or continue with</div>
        <button className="google">
          <span>
            <img src="" alt="google icon"></img>
          </span>
          <span>Google</span>
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
