import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { S3Client, PutObjectCommand } from "https://cdn.skypack.dev/@aws-sdk/client-s3@3.347.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AWS_ACCESS_KEY_ID = 'bI9fdJ6JUzKWqPcSTpr6ssjBfbOhqtsPrT2ZSmy';
const AWS_SECRET_ACCESS_KEY = 'ySt2rMi8Mq3FMVNZAfu2G4YqbBlghXSl8gfqfgr2';
const AWS_REGION = 'us-east-1';
const S3_BUCKET = 'stolen-app';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileContent, contentType, bucket } = await req.json();

    console.log('📤 Uploading to S3:', fileName);

    // Initialize S3 client
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });

    // Convert base64 to Uint8Array
    const binaryData = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucket || S3_BUCKET,
      Key: fileName,
      Body: binaryData,
      ContentType: contentType,
      ACL: 'public-read'
    });

    await s3Client.send(command);

    // Generate public URL
    const publicUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;

    console.log('✅ File uploaded successfully:', publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        key: fileName,
        bucket: S3_BUCKET
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Upload failed"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
