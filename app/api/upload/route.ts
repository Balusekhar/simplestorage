import { NextRequest, NextResponse } from "next/server";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface File {
  name: string;
  type: string;
}

const s3ClientConfig: S3ClientConfig = {
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};

const s3Client = new S3Client(s3ClientConfig);

// Post Route to get Presigned Urls
export async function POST(req: NextRequest) {
  const { files, userId } = await req.json();
  console.log("files",files)
  console.log("userId",userId)

  try {
    const presignedUrls = await Promise.all(
      files.map(async (file: File) => {
        const myKey = `${userId}/${file.name}`;
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: myKey,
          ContentType: file.type,
        });
        const signedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          fileName: file.name,
          signedUrl,
        };
      })
    );
    return NextResponse.json({ presignedUrls });
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URLs" },
      { status: 500 }
    );
  }
}

// Lists and retrieves files using secure, temporary download URLs.
// export async function GET(req: Request) {
//     const searchParams = new URL(req.url).searchParams;
//     const folderId = searchParams.get('folderId');

//     if (!folderId) {
//         return NextResponse.json({ error: "Missing folderId parameter" }, { status: 400 });
//     }

//     try {
//         const params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Prefix: `${folderId}/`, // Ensure the prefix ends with a slash
//         };

//         // Step 1: List all objects in the specified folder
//         const command = new ListObjectsV2Command(params);
//         const response = await s3Client.send(command);
//         const objects = response.Contents;

//         if (!objects) {
//             return NextResponse.json({ message: "No objects found in the specified folder." });
//         }

//         // Step 2: Filter and generate presigned URLs for each file in the folder
//         const expirationTime = 60 * 60; // Expiration time in seconds (1 hour)
//         const folderObjects = objects.filter(
//             object => object.Key?.startsWith(`${folderId}/`) && !object.Key.endsWith('/')
//         );

//         const presignedUrls = await Promise.all(
//             folderObjects.map(async (object) => {
//                 const getObjectParams = {
//                     Bucket: process.env.AWS_BUCKET_NAME,
//                     Key: object.Key,
//                 };

//                 // Generate a presigned URL for each object
//                 const url = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), {
//                     expiresIn: expirationTime,
//                 });

//                 return {
//                     url,
//                     fileName: object.Key?.split('/').pop(),
//                 };
//             })
//         );

//         // Step 3: Return presigned URLs in the response
//         return NextResponse.json({ presignedUrls });
//     } catch (error) {
//         console.error("Error listing objects or generating presigned URLs:", error);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// }
