// server/lib/mediaconvert.js

"use strict";

const {
  MediaConvertClient,
  CreateJobCommand,
  GetJobCommand,
} = require("@aws-sdk/client-mediaconvert");
const { S3Client, HeadObjectCommand } = require("@aws-sdk/client-s3");
const db = require("../db");

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const mediaConvert = new MediaConvertClient({
  region: requireEnv("AWS_REGION"),
  credentials: {
    accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
  },
});

const s3 = new S3Client({
  region: requireEnv("AWS_REGION"),
  credentials: {
    accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
  },
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function objectExists(key) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: requireEnv("S3_BUCKET"),
        Key: key,
      }),
    );
    console.log(`[S3 EXISTS] ${key} → YES`);
    return true;
  } catch (err) {
    if (err.name === "NotFound") {
      console.log(`[S3 EXISTS] ${key} → NO`);
      return false;
    }
    console.error(`[S3 EXISTS ERROR] ${key}:`, err.message || err);
    return false;
  }
}

async function createMediaConvertJob({ mediaId, originalKey }) {
  const bucket = requireEnv("S3_BUCKET");
  const roleArn = requireEnv("MEDIACONVERT_ROLE_ARN");

  const inputS3 = `s3://${bucket}/${originalKey}`;
  const base = originalKey
    .split("/")
    .pop()
    .replace(/\.[^/.]+$/, "");

  const playbackKey = `processed/video/${base}_mp4.mp4`;
  const thumbnailKey = `processed/video/${base}_poster.0000000.jpg`;
  const hlsManifestKey = `processed/video/${base}/hls/${base}.m3u8`;

  console.log(`[CREATE JOB] media ${mediaId} | input: ${inputS3}`);
  console.log(`  expected playback: ${playbackKey}`);
  console.log(`  expected thumbnail: ${thumbnailKey}`);
  console.log(`  expected HLS manifest: ${hlsManifestKey}`);

  const destination = `s3://${bucket}/processed/video/${base}`;
  const hlsDestination = `s3://${bucket}/processed/video/${base}/hls/`;

  const command = new CreateJobCommand({
    Role: roleArn,
    UserMetadata: {
      mediaId: String(mediaId),
      originalKey,
    },
    Settings: {
      Inputs: [
        {
          FileInput: inputS3,
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: "DEFAULT",
            },
          },
          VideoSelector: {
            Rotate: "AUTO",
          },
          TimecodeSource: "ZEROBASED",
        },
      ],
      OutputGroups: [
        {
          Name: "File Group",
          OutputGroupSettings: {
            Type: "FILE_GROUP_SETTINGS",
            FileGroupSettings: {
              Destination: destination,
            },
          },
          Outputs: [
            {
              NameModifier: "_mp4",
              ContainerSettings: {
                Container: "MP4",
                Mp4Settings: {},
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    SceneChangeDetect: "TRANSITION_DETECTION",
                    MaxBitrate: 5000000,
                    QvbrSettings: {
                      QvbrQualityLevel: 7,
                    },
                  },
                },
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 96000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
            },
            {
              NameModifier: "_poster",
              ContainerSettings: {
                Container: "RAW",
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: "FRAME_CAPTURE",
                  FrameCaptureSettings: {
                    FramerateNumerator: 1,
                    FramerateDenominator: 10,
                    MaxCaptures: 1,
                    Quality: 80,
                  },
                },
              },
            },
          ],
        },
        {
          Name: "Apple HLS",
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              Destination: hlsDestination,
              SegmentLength: 6,
              MinSegmentLength: 0,
            },
          },
          Outputs: [
            {
              NameModifier: "index",
              ContainerSettings: {
                Container: "M3U8",
                M3u8Settings: {},
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: {
                    RateControlMode: "QVBR",
                    SceneChangeDetect: "TRANSITION_DETECTION",
                    MaxBitrate: 3000000,
                    QvbrSettings: {
                      QvbrQualityLevel: 7,
                    },
                  },
                },
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: {
                      Bitrate: 96000,
                      CodingMode: "CODING_MODE_2_0",
                      SampleRate: 48000,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    StatusUpdateInterval: "SECONDS_10",
  });

  try {
    const resp = await mediaConvert.send(command);
    const jobId = resp.Job?.Id;
    console.log(`[JOB CREATED] ${jobId}`);
    return { jobId, playbackKey, thumbnailKey, hlsManifestKey };
  } catch (err) {
    console.error("[CREATE JOB ERROR]", err.message || err);
    throw err;
  }
}

async function markProcessed(mediaId, playbackKey, thumbnailKey, hlsKey) {
  console.log(`[DB PROCESSED] media ${mediaId}`);
  console.log(`  playback_key = ${playbackKey}`);
  console.log(`  thumbnail_key = ${thumbnailKey}`);
  console.log(`  hls_key = ${hlsKey || "none"}`);

  await db.query(
    `
    UPDATE media
    SET
      playback_key = $1,
      thumbnail_key = $2,
      hls_key = $3,
      status = 'ready',
      error_message = NULL,
      updated_at = now()
    WHERE id = $4
    `,
    [playbackKey, thumbnailKey, hlsKey || null, mediaId],
  );
}

async function markFailed(mediaId, errorMessage) {
  console.log(`[DB FAILED] media ${mediaId}: ${errorMessage}`);

  await db.query(
    `
    UPDATE media
    SET
      status = 'failed',
      error_message = $1,
      updated_at = now()
    WHERE id = $2
    `,
    [errorMessage || "Processing failed", mediaId],
  );
}

async function watchMediaConvertJob({
  mediaId,
  jobId,
  playbackKey,
  thumbnailKey,
  hlsManifestKey,
  maxAttempts = 180,
  delayMs = 10000,
}) {
  console.log(`[WATCHER START] media ${mediaId}, job ${jobId}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await mediaConvert.send(new GetJobCommand({ Id: jobId }));
      const status = resp.Job?.Status || "UNKNOWN";
      console.log(`[WATCHER] attempt ${attempt}/${maxAttempts} → ${status}`);

      if (status === "COMPLETE") {
        const playbackExists = await objectExists(playbackKey);
        const thumbExists = await objectExists(thumbnailKey);
        const hlsExists = hlsManifestKey ? await objectExists(hlsManifestKey) : false;

        if (hlsExists) {
          console.log("[WATCHER] HLS manifest found");
        } else if (hlsManifestKey) {
          console.warn("[WATCHER] HLS manifest not found — will save without HLS");
        }

        if (playbackExists && thumbExists) {
          await markProcessed(mediaId, playbackKey, thumbnailKey, hlsExists ? hlsManifestKey : null);
          console.log("[WATCHER] SUCCESS - MP4 and thumbnail exist");
        } else {
          const msg = `COMPLETE but files missing (playback: ${playbackExists}, thumb: ${thumbExists})`;
          console.error(`[WATCHER] ${msg}`);
          await markFailed(mediaId, msg);
        }
        return;
      }

      if (status === "ERROR" || status === "CANCELED") {
        const msg = resp.Job?.ErrorMessage || `Ended with ${status}`;
        console.error(`[WATCHER] Job failed: ${msg}`);
        await markFailed(mediaId, msg);
        return;
      }
    } catch (err) {
      console.error(`[WATCHER ERROR] attempt ${attempt}:`, err.message || err);
    }

    await sleep(delayMs);
  }

  const msg = `Timed out after ${maxAttempts} attempts`;
  console.error(`[WATCHER] ${msg}`);
  await markFailed(mediaId, msg);
}

module.exports = {
  createMediaConvertJob,
  watchMediaConvertJob,
};
