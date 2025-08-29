import { useNavigate } from "react-router-dom";
import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "../../Styles/Resources.tsx";

interface FormData {
    name: string;
    email: string;
    message: string;
}



export default function LandingPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        message: "",
    });
    
    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log("Form Submitted:", formData);
        setFormData({ name: "", email: "", message: ""})
    }
    
    return (
        <div>
            {/* Bio Section */}
            <section>
                <h1>Welcome to My App</h1>
                <p>
                    This is the public landing page. Learn more about the app below or
                    sign in to access your dashboard.
                </p>
                <Button isOpen={true} onClick={() => navigate("/app/home")}>
                    Enter App
                </Button>
            </section>

            {/* Bio / About */}
            <section>
                <h2>About</h2>
                <p>
                    My App helps you stay organized and productive by providing simple,
                    powerful tools for managing your tasks and goals.
                </p>
            </section>

            {/* Contact Form */}
            <section>
                <h2>Contact</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <Button isOpen={true} type="submit">
                        Submit
                    </Button>
                </form>
            </section>
        </div>
    );
}