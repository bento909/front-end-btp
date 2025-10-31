import { gql } from "graphql-tag";

// Mutation to create a ContactMessage
export const createContactMessage = gql`
  mutation CreateContactMessage($input: CreateContactMessageInput!) {
    createContactMessage(input: $input) {
      id
      name
      email
      message
      createdAt
      read
    }
  }
`;

// Mutation to update a ContactMessage (e.g. mark as read/unread)
export const updateContactMessage = gql`
  mutation UpdateContactMessage($input: UpdateContactMessageInput!) {
    updateContactMessage(input: $input) {
      id
      read
    }
  }
`;

// Mutation to delete a ContactMessage
export const deleteContactMessage = gql`
  mutation DeleteContactMessage($input: DeleteContactMessageInput!) {
    deleteContactMessage(input: $input) {
      id
    }
  }
`;
