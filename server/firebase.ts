import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "pubinventory-654db",
  private_key_id: "7c36b92940ee5697261e127dabbe055bdf5975f9",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYX56ufFYdN1qz\nTghbQW/3VPncvJVbrMy9qlwIDDAWHzz2ubMNrJaeUVjaGbibiQiODggIz5zHFqJ9\n7zYcQ3aFNWei3ik0SniKJO4wR8NoqOwuS+zYp983U9cCStVegVzSstSvrA8BOPkO\nEBVgdCfQBkM5QtoDlHJWCKjxDunbT7GgfdwEVlRIQ0tKJuLZtGdGxMPu6kEYmwJA\n74cI/EDhrZh6SMw93K7OkIZlqGrx5qNQynnWCpP4Ft44y8cfOjSS147eIso7ny41\ngr/Hymk+aI476VBZEf1S3iq2xf+FeEtahcCaPY/6zAufhGGxB6x5lzDNopf6YJ+S\n1N7HDztNAgMBAAECggEABCHDUnquXE13zm/BihiUTklRoiz5vy/sEv0jV8X/zxRW\nojGGoU6365sLEtMl6tZxkuDit2RbjpO4k6YTRvPk2gNckMgkSkrXxW+SGtrr+N4s\n8G9jvPlrsk9IDlOmgnD++EkQ9a/X84KGgwW8msRtFDRiaUAFEMdvbYQp0byiq5zv\ne460ebZzfSRIzVaPJrpfSbv+srKdnzVegJO0tQVyzIwYiZjTI4ArwfEdkp4sMWYA\nzgQbqcsEjSHT7/BWUuKZFMDMwAsSDDyd0xzVkPv5KysWxQTEoqQR4zmqvui9MB+4\niX9UpuEOH3DDczCHiUpyxYYr7tqcDfezEKFRRIWUEQKBgQD4J2HNZ6oMSTmVW1XU\nERG/qHm7xM0Udvt6RurIyWLos9XJzXdz/s0bUpPxIFxgNtS/uGWirUb4p882shV2\n4gBLBeSElNKjqBO7gDgwqyxksux5T8GXurgNdPPxh3p3Ia1xfFwkls0bWQQkAj6f\ncWFxa1uBRNtNG0pS/xbacQk0WQKBgQDfNwAGwOTm0Ff22pgXayYuF1TdRVuZseMX\n5EsNQyWadKPvd3UK26+wggwGIxYUBf++kSZqJuLVRi3dx+iusqgSY8GJjSjbi1Q0\nrmf6cBFAwdfwfWGUH8rYYo6w75RVlgd38Z9MztOP1q51yhL7qbbJbmKpfqTyLmb9\nPqvvTL9wFQKBgQCsz4gdae6Sxb+TElrv5r8scB/uMfv7H2y7V32TPCNkGDBua2af\nYbbmKxiZl8acvjJkHP6yTecZrIrx9QxbkMFRfZYI+jbB/39WWNFImzu8GJnzVSZl\nCoO341UqQwV2xv4pBMiKNnY5cEEg7ms7z9JjELdVi2UJClM0/y2kC4m0aQKBgF+P\nc1Jw2E48WbxT3xL/i0vmLy2/mLSW5GsBEGRwH7QdRWWqlY/9dxywwCcMdFJEMzXJ\nfFGrriayMcal4+aOk8ezr1KM/TXoUzduhxM/URORKTpK4zB/3959aysyliWB4lam\nOZWvYgFNXkkNJs1Y3ekkedaoYkNQPEUkxIThLX/1AoGAe0ZQBZuZZcNqMbcKw65K\neYudDAW/HhC48I4uhAQDc3CHZsQ4W9olaT7XT3rfZjEKxGhfgavseEy9jNlSWdJO\naynrFRR/hy1IzJz2yvQEuC2BZ8h+AC0x0UprRCDtS1DizbLKH4boJK9PIZwzAqMt\nosKx9lUttGt/Qr1sUaR6eyk=\n-----END PRIVATE KEY-----\n",
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