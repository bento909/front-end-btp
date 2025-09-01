import React, {useEffect, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../redux/store.tsx";
import {
    fetchMessagesThunk,
    updateMessageThunk,
    deleteMessageThunk,
} from "../../../redux/contactMessagesSlice";
import CollapsiblePanel from "../../../Styles/CollapsiblePanel.tsx";
import { canReadMessages } from "../../../Constants/constants.tsx";

const ViewMessages: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();
    const [isVisible, setIsVisible] = useState(false);
    const { messages, loading, error } = useSelector(
        (state: RootState) => state.contactMessages
    );

    useEffect(() => {
        dispatch(fetchMessagesThunk());
    }, [dispatch]);

    const toggleRead = (id: string, current: boolean) => {
        dispatch(updateMessageThunk({ id, read: !current }));
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            dispatch(deleteMessageThunk({ id }));
        }
    };

    if (loading) return <p>Loading messages...</p>;
    if (error) return <p>Error loading messages: {error}</p>;

    // Sort messages by createdAt descending
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return  user && canReadMessages(user) ? (
        <CollapsiblePanel title="Admin Messages" isOpen={isVisible} toggle={() => {setIsVisible(!isVisible);}}>
            {sortedMessages.length === 0 && <p>No messages</p>}
            <ul>
                {sortedMessages.map((msg) => (
                    <li key={msg.id} style={{ marginBottom: "12px", paddingBottom: "8px" }}>
                        <strong>{msg.name} ({msg.email})</strong>
                        <p>{msg.message}</p>
                        <p>
                            Status:{" "}
                            <span
                                style={{
                                    color: msg.read ? "green" : "red",
                                    fontWeight: "bold",
                                }}
                            >
                                {msg.read ? "Read" : "Unread"}
                            </span>
                        </p>
                        <button onClick={() => toggleRead(msg.id, msg.read)}>
                            Mark as {msg.read ? "Unread" : "Read"}
                        </button>
                        <button onClick={() => handleDelete(msg.id)} style={{ marginLeft: "8px", color: "red" }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </CollapsiblePanel>
    ) : null;
};

export default ViewMessages;
