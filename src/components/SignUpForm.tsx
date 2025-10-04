function SignUpForm() {
  return (
    <div className="container">
      <h2 className="">Login Into Your Account</h2>
      <div> Enter your email to sign up for this app</div>
      <form>
        <input className="email"></input>
        <input className="password"></input>
        <button>Sign up with email</button>
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

export default SignUpForm;
