import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse, NextRequest } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Prefix: `${userId}/`,
  });

  try {
    const response = await s3Client.send(command);

    if (!response.Contents) {
      return NextResponse.json({ files: [] });
    }

    const files = response.Contents.map((file) => ({
        fileName: file.Key?.split("/").pop(),
        fileKey: file.Key,
        lastModified: file.LastModified,
        size: file.Size,
    }));

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("S3 API Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve files", details: error.message },
      { status: 500 }
    );
  }
}
