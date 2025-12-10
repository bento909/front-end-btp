import React, { ChangeEvent, FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessageThunk } from "../../../redux/contactMessagesSlice.tsx";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import { CreateContactMessageInput } from "../../../graphql/ContactMessage/contactMessageTypes.ts";
import {AppDispatch} from "../../../redux/store.tsx"; 

interface FormData {
    name: string;
    email: string;
    message: string;
}

const ContactForm: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        message: "",
    });
    const dispatch = useDispatch<AppDispatch>();

    const togglePanel = () => setIsOpen(prev => !prev);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const input: CreateContactMessageInput = {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            createdAt: new Date().toISOString(),
            read: false,
        };

        try {
            const resultAction = await dispatch(addMessageThunk(input));

            if (addMessageThunk.fulfilled.match(resultAction)) {
                setFormData({ name: "", email: "", message: "" });
                alert("Message submitted successfully!");
            } else {
                console.error(resultAction.payload);
                alert("❌ Failed to submit message");
            }
        } catch (err) {
            console.error(err);
            alert("❌ Error submitting message");
        }
    };

    return (
        <CollapsiblePanel title="Contact Form" isOpen={isOpen} toggle={togglePanel}>
            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    width: '100%', // ensures inputs can expand
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                    <label htmlFor="name" style={{ width: '100px' }}>Name:</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ flex: 1, padding: '6px' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                    <label htmlFor="email" style={{ width: '100px' }}>Email:</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ flex: 1, padding: '6px' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '1rem' }}>
                    <label htmlFor="message" style={{ width: '100px', marginTop: '6px' }}>Message:</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        style={{ flex: 1, padding: '6px' }}
                    />
                </div>

                <button type="submit" style={{ alignSelf: 'flex-end', padding: '6px 12px' }}>Submit</button>
            </form>
        </CollapsiblePanel>
    );


};

export default ContactForm;
