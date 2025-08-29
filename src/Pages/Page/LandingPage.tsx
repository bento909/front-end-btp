import PersonalTraining from "./LandingPageComponents/PersonalTraining.tsx";
import Bio from "./LandingPageComponents/Bio.tsx";
import ContactForm from "./LandingPageComponents/ContactForm.tsx"

export default function LandingPage() {
    return (
        <div>
            <Bio />
            <PersonalTraining />
            <ContactForm />
        </div>
    );
}