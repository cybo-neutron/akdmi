import dotenv from 'dotenv';
dotenv.config();
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_LOCALSTACK } =
  process.env;

const isAWSLocalstack =
  AWS_LOCALSTACK && AWS_LOCALSTACK === 'true' ? true : false;

const s3Client = new S3Client({
  region: AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || 'test',
  },
  ...(isAWSLocalstack && {
    endpoint: 'http://localhost:4566',
    forcePathStyle: true,
  }),
});

export async function getSignedUploadUrl(
  bucketName: string,
  objectKey: string,
  contentType: string,
  expiresInSeconds: number = 3600
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType, // Important for browser uploads
  });
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });
  return signedUrl;
}

export async function getSignedDownloadUrl(
  bucketName: string,
  objectKey: string,
  expiresInSeconds: number = 3600
) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresInSeconds,
  });
  return signedUrl;
}

export async function uploadObject({
  bucket,
  objectKey,
  body,
  contentType,
}: {
  bucket: string;
  objectKey: string;
  body: ReadableStream;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
  });
  await s3Client.send(command);
}
