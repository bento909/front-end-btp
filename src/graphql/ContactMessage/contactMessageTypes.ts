// Input for creating a ContactMessage
export interface CreateContactMessageInput {
    name: string;
    email: string;
    message: string;
    createdAt: string; // ISO string
    read?: boolean;    // default false
}

// Input for updating a ContactMessage (e.g. mark as read/unread)
export interface UpdateContactMessageInput {
    id: string;
    read: boolean;
}

// Input for deleting a ContactMessage
export interface DeleteContactMessageInput {
    id: string;
}

// Query to list all ContactMessages
export interface ListContactMessagesQuery {
    listContactMessages: {
        items: Array<{
            id: string;
            name: string;
            email: string;
            message: string;
            createdAt: string;
            read: boolean;
        }>;
    };
}

// Query to list only unread ContactMessages
export interface ListUnreadContactMessagesQuery {
    listContactMessages: {
        items: Array<{
            id: string;
            name: string;
            email: string;
            message: string;
            createdAt: string;
            read: boolean;
        }>;
    };
}

// Query to get a single ContactMessage
export interface GetContactMessageQuery {
    getContactMessage: {
        id: string;
        name: string;
        email: string;
        message: string;
        createdAt: string;
        read: boolean;
    };
}
