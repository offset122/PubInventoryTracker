import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "pubinventory-654db",
  private_key_id: "7c36b92940ee5697261e127dabbe055bdf5975f9",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYX56ufFYdN1qz\nTghbQW/3VPncvJVbrMy9qlwIDDAWHzz2ubMNrJaeUVjaGbibiQiODggIz5zHFqJ9\n7zYcQ3aFNWei3ik0SniKJO4wR8NoqOwuS+zYp983U9cCStVegVzSstSvrA8BOPkO\nEBVgdCfQBkM5QtoDlHJWCKjxDunbT7GgfdwEVlRIQ0tKJuLZtGdGxMPu6kEYmwJA\n74cI/EDhrZh6SMw93K7OkIZlqGrx5qNQynnWCpP4Ft44y8cfOjSS147eIso7ny41\ngr/Hymk+aI476VBZEf1S3iq2xf+FeEtahcCaPY/6zAufhGGxB6x5lzDNopf6YJ+S\n1N7HDztNAgMBAAECggEABCHDUnquXE13zm/BihiUTkxNQ5mMfEO1+J1EvbMHWfKL\nLHQ7YgGRbzK0K8rNrFc8t0LV9EcP/1hZSF8fJ8aDkP1Yl9EH8N6jIH0fq5H8wErg\nPmqNqVHFj+hGtq8kRjYQHi6Wh5GgRzRJsQ+YUc2OqsOO4oWJKUyB7JgDEVBdAdKY\n4QK6VtLiPj0lIhKhJOJuG3OUQLc2iWHRbKfHe8jZ5Jt3/BpqS4kTkl8/C9NHs6Jt\n9sJqfJ6jVgTvjEh1Y6QKx8HN3jIEe2S1b5lFT8K9cF7Q8H/Gq+rCpTsIR8lWHhqB\neLnXN9EjVLmMgY2R7JhKnM8V2K1V7N6JJq5z7+f1fv6k0eX9sHFLrE8b6t8V4QKB\ngQDvQ5oI8EqjJnF8Y9J8i9/0K8rBQ6m5I5pJ6K8F9sJnF5t7w4gP1vLsN3pE9dGJ\np1fT9oK9jLkO6FhE8D8Q2Y7m8E9V4Q4yKP/gQ5h8x9v2qJWqGkPQ6FEq9X3F7XT7\nOJo8UO9rN2vG8EqsK6tR9K5B8+QLqE9jR+Hf2q3gXCR1xwKBgQDp1Y8JLd9VsHJh\nD4vY6Q5m8J4I5XJ8v1N2t8rF5+J1f9V5oC6hR8dNq6+P2J8gKLo9F7rV8cE4U8J1\n1gFrK8wJ+9nH7B4LQe3lKL7i8F9rK7A8k4q8VgEq2J8N8K8I3J5H8fL2vK6P8Q2Y\n8j5N8fR1Q8oE8N2cG6m8uT8E1q3wJ/",
  client_email: "firebase-adminsdk-fbsvc@pubinventory-654db.iam.gserviceaccount.com",
  client_id: "109349987763703960748",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pubinventory-654db.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: "pubinventory-654db"
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

// Collection references
export const collections = {
  users: db.collection('users'),
  products: db.collection('products'),
  purchases: db.collection('purchases'),
  sales: db.collection('sales'),
  sessions: db.collection('sessions')
};