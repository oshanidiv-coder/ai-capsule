import { Link } from "react-router-dom";

function Landing() {
    return (
        <div>
            <h1>AI Capsule</h1>

            <h2>Your Private AI Prompt Library</h2>

            <p>
                Save, review and improve useful prompts for tools such as
                ChatGPT, Copilot, Gemini and Claude.
            </p>

            <Link to="/login">
                Sign In
            </Link>
        </div>
    );
}

export default Landing;