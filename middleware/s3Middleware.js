const aws = require("aws-sdk");
const asyncHandler = require("express-async-handler");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

// const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region: "eu-west-3",
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

const s3Client = new S3Client({
  region: "eu-west-3",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const getSignedViewURL = asyncHandler(async (mediaKey) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: mediaKey,
  });
  const signedURL = await getSignedUrl(s3Client, command);

  return signedURL;
});

const uploadS3Object = asyncHandler(async (uploadConfig) => {
  await s3Client.send(new PutObjectCommand(uploadConfig));
});

const deleteS3Object = asyncHandler(async (imgName) => {
  const deleteParams = {
    Bucket: bucketName,
    Key: imgName,
  };

  return s3Client.send(new DeleteObjectCommand(deleteParams));
});

module.exports = { getSignedViewURL, deleteS3Object, uploadS3Object };
