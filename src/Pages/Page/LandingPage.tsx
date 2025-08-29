import { useNavigate } from "react-router-dom";
import { Button } from "../../Styles/Resources.tsx";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
            <h1>Welcome to My App</h1>
            <p>
                This is the public landing page. Click below to sign in and access the app.
            </p>
            <Button isOpen={true}
                onClick={() => navigate("/app/home")}
            >
                Enter App
            </Button>
        </div>
    );
}