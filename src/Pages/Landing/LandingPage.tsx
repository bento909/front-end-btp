import PersonalTraining from "../Components/PublicComponents/PersonalTraining.tsx";
import Bio from "../Components/PublicComponents/Bio.tsx";
import ContactForm from "../Components/PublicComponents/ContactForm.tsx"
import BensPlan from "../Components/PublicComponents/BensPlan.tsx"
import IntervalTimer from "../Components/PublicComponents/IntervalTimer.tsx";

export default function LandingPage() {
    return (
        <div>
            <IntervalTimer />
            <PersonalTraining />
            <BensPlan/>
            <Bio />
            <ContactForm />
        </div>
    );
}