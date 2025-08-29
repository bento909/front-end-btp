import { gql } from "graphql-tag";

// Query to list all ContactMessages
export const listContactMessages = gql`
  query ListContactMessages {
    listContactMessages {
      items {
        id
        name
        email
        message
        createdAt
      }
    }
  }
`;

export const listUnreadContactMessages = gql`
  query ListUnreadContactMessages {
    listContactMessages(filter: { read: { eq: false } }) {
      items {
        id
        name
        email
        message
        createdAt
        read
      }
    }
  }
`;

