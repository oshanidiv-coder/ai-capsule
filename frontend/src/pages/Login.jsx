import { Link } from "react-router-dom";

function Login() {

    const loginWithGitHub = () => {
        window.location.href =
            "http://localhost:5000/auth/github";
    };

    return (
        <div>
            <h1>AI Capsule</h1>

            <h2>Sign In</h2>

            <p>
                Sign in to access your private prompt library.
            </p>

            <button onClick={loginWithGitHub}>
                Continue with GitHub
            </button>

            <p>
                <Link to="/">
                    Back to Home
                </Link>
            </p>
        </div>
    );
}

export default Login;