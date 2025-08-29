import React, { ChangeEvent, FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessageThunk } from "../../../redux/contactMessagesSlice";
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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const input: CreateContactMessageInput = {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            createdAt: new Date().toISOString(),
            read: false,
        };

        dispatch(addMessageThunk(input));

        setFormData({ name: "", email: "", message: "" });
        alert("Message submitted successfully!");
    };

    return (
        <CollapsiblePanel title="Contact Form" isOpen={isOpen} toggle={togglePanel}>
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
                <button type="submit">Submit</button>
            </form>
        </CollapsiblePanel>
    );
};

export default ContactForm;
