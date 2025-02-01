import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse, NextRequest } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(req: NextRequest) {
  try {
    const { fileKey } = await req.json(); // Get the fileKey from the request body

    if (!fileKey) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    // Create a DeleteObjectCommand with the provided fileKey
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    });

    // Send the delete command to S3
    const response = await s3Client.send(command);

    // Check if the deletion was successful
    if (response.$metadata.httpStatusCode === 204) {
      return NextResponse.json({ message: "File deleted successfully" });
    }

    // If the status code is not 204, something went wrong
    return NextResponse.json(
      { error: "Failed to delete the file" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("S3 Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete file", details: error.message },
      { status: 500 }
    );
  }
}