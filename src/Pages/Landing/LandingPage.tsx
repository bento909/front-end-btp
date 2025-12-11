import PersonalTraining from "../Components/PublicComponents/PersonalTraining.tsx";
import Bio from "../Components/PublicComponents/Bio.tsx";
import ContactForm from "../Components/PublicComponents/ContactForm.tsx"
import BensPlan from "../Components/PublicComponents/BensPlan.tsx"
import IntervalTimerPanel from "../Components/PublicComponents/IntervalTimerPanel.tsx";

export default function LandingPage() {
    return (
        <div>
            <IntervalTimerPanel />
            <PersonalTraining />
            <BensPlan/>
            <Bio />
            <ContactForm />
        </div>
    );
}