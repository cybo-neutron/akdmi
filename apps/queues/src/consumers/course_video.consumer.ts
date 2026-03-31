import { getSignedDownloadUrl, uploadObject } from '@org/aws';
import { SQSConsumer } from '@org/queue-consumers';
import { logger } from '@org/utils';
import {
  getContentMediaByContentId,
  updateContentMediaByContentId,
} from '@org/database/repo';
import axios from 'axios';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import {
  mkdirSync,
  createWriteStream,
  promises as fsPromises,
  constants as fsConstants,
  readdirSync,
  createReadStream,
  rmSync,
  writeFileSync,
} from 'fs';
const fs = { promises: fsPromises, constants: fsConstants, ...require('fs') };
import path from 'path';
import { PassThrough } from 'stream';
import { buffer } from 'stream/consumers';

const contentBucket = process.env.CONTENT_BUCKET as string;

const resolutions = [
  {
    name: '480p',
    width: 842,
    height: 480,
    videoBitrate: '1400k',
    maxrate: '1498k',
    bufsize: '2100k',
    audioBitrate: '128k',
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    videoBitrate: '2800k',
    maxrate: '2996k',
    bufsize: '4200k',
    audioBitrate: '128k',
  },
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    videoBitrate: '5000k',
    maxrate: '5350k',
    bufsize: '7500k',
    audioBitrate: '192k',
  },
];

export async function uploadStreamToS3(
  bucket: string,
  key: string,
  stream: NodeJS.ReadableStream
) {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));

    stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        await uploadObject({
          bucket,
          objectKey: key,
          body: buffer,
          contentType: 'video/mp4',
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
    stream.on('error', (err) => reject(err));
  });
}

async function downloadVideoFromS3(bucket: string, key: string) {
  const signedUrl = await getSignedDownloadUrl(bucket, key);
  logger.info('signed Url : ', signedUrl);

  // Ensure temp directory exists
  const tempDir = path.join('/tmp', 'temporary-media');

  await fs.promises.mkdir(tempDir, { recursive: true });

  const tempFilePath = path.join(tempDir, `temp-${Date.now()}.mp4`);
  const writer = createWriteStream(tempFilePath);

  logger.info('temp file path : ', tempFilePath);

  try {
    // Download the file with better error handling
    logger.info('---- Downloading video from S3 ----');
    const videoResponse = await axios({
      method: 'get',
      url: signedUrl,
      responseType: 'stream',
      timeout: 30000, // 30 second timeout
    });

    if (!videoResponse.data) {
      throw new Error(
        `Failed to fetch video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    await new Promise((resolve, reject) => {
      videoResponse.data.pipe(writer);

      const totalSize = videoResponse.headers['content-length'];
      let downloadedBytes = 0;
      videoResponse.data.on('data', (chunk: any) => {
        downloadedBytes += chunk.length;
        logger.debug(`Downloaded ${downloadedBytes}/${totalSize} bytes...`);
      });
      videoResponse.data.on('error', (err: any) => {
        logger.error('Error downloading video:', err);
        reject(new Error(`Failed to download video: ${err.message}`));
      });

      writer.on('finish', () => {
        logger.info('Video downloaded successfully');
        resolve(true);
      });
      writer.on('error', (err: any) => {
        logger.error('Error writing video file:', err);
        reject(
          new Error(`Failed to save video to ${tempFilePath}: ${err.message}`)
        );
      });
    });

    // Verify the file was downloaded correctly
    const stats = await fs.promises.stat(tempFilePath);
    logger.debug(`Downloaded file size: ${stats.size} bytes`);

    if (stats.size === 0) {
      throw new Error(`Downloaded file is empty: ${tempFilePath}`);
    }

    // Verify file has valid video streams
    await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
        if (err) {
          return reject(new Error(`Invalid video file: ${err.message}`));
        }

        const videoStreams = metadata.streams.filter(
          (s) => s.codec_type === 'video'
        );
        const audioStreams = metadata.streams.filter(
          (s) => s.codec_type === 'audio'
        );

        logger.debug(
          `Video streams: ${videoStreams.length}, Audio streams: ${audioStreams.length}`
        );

        if (videoStreams.length === 0) {
          return reject(
            new Error('No video streams found in the downloaded file')
          );
        }

        resolve(metadata);
      });
    });
  } catch (error) {
    logger.error('Error : ', error);
    // Clean up the temp file if it exists
    try {
      if (
        await fs.promises
          .access(tempFilePath)
          .then(() => true)
          .catch(() => false)
      ) {
        await fs.promises.unlink(tempFilePath);
      }
    } catch (cleanupError) {
      logger.warn('Failed to clean up temp file:', cleanupError);
    }
    throw error;
  }

  // Verify the file was downloaded correctly
  const stats = await fs.promises.stat(tempFilePath).catch(() => null);
  if (!stats || stats.size === 0) {
    throw new Error(
      `Downloaded file is empty or doesn't exist: ${tempFilePath}`
    );
  }

  // Add input validation
  try {
    await fs.promises.access(tempFilePath, fs.constants.R_OK);
  } catch (err: any) {
    throw new Error(
      `Cannot access input file: ${tempFilePath}. Error: ${err.message}`
    );
  }

  return { downloadedFilePath: tempFilePath };
}

async function createMasterPlaylist(outputDir: string) {
  const lines = ['#EXTM3U', '#EXT-X-VERSION:3'];

  for (const v of resolutions) {
    lines.push(
      `#EXT-X-STREAM-INF:BANDWIDTH=${v.videoBitrate},RESOLUTION=${v.width}x${v.height}`
    );
    lines.push(`${v.name}_playlist.m3u8`);
  }

  // await fs.writeFile(path.join(outputDir, 'master.m3u8'), lines.join('\n'));
  writeFileSync(path.join(outputDir, 'master.m3u8'), lines.join('\n'));
}

async function uploadTranscodedFilesToS3(
  dirToRead: string,
  keyWithoutExtension: string
) {
  await createMasterPlaylist(dirToRead);
  const files = readdirSync(dirToRead);
  if (!contentBucket) {
    throw new Error('CONTENT_BUCKET is not defined');
  }
  logger.info('master playlist created');

  const s3BaseDir = `processed/${keyWithoutExtension}`;

  for (const file of files) {
    const filePath = path.join(dirToRead, file);
    const s3Key = `${s3BaseDir}/${file}`;
    const readStream = createReadStream(filePath);
    await uploadObject({
      bucket: contentBucket,
      objectKey: s3Key,
      body: readStream,
      contentType: file.endsWith('.m3u8')
        ? 'application/x-mpegURL'
        : 'video/mp2t',
    });
  }

  const key_code = keyWithoutExtension.split('/').at(-1);
  if (key_code) {
    const contentId = key_code.split('_').at(0);
    const url = `${contentBucket}::${s3BaseDir}/master.m3u8`;
    if (contentId) {
      logger.info('contentId : ', contentId);

      const content = await getContentMediaByContentId(Number(contentId));
      logger.info('Media content searched : ', content);
      if (!content) {
        throw new Error('Content not found');
      }
      await updateContentMediaByContentId(Number(contentId), {
        url,
      });
    }
  }
}

async function cleanup(dir: string) {
  rmSync(dir, {
    recursive: true,
  });
}

async function transcodeVideo({
  resolution,
  outputDir,
  downloadedFilePath,
  keyWithoutExtension,
}: {
  resolution: any;
  outputDir: string;
  downloadedFilePath: string;
  keyWithoutExtension: string;
}) {
  const outputM3U8 = path.join(outputDir, `${resolution.name}_playlist.m3u8`);

  const outputs = path.join(outputDir, `${resolution.name}_%03d.ts`);

  // Log FFmpeg command for debugging
  const ffmpegCommand = [
    '-vf',
    `scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=decrease`,
    '-c:a',
    'aac',
    '-ar',
    '48000',
    '-c:v',
    'h264',
    '-profile:v',
    'main',
    '-crf',
    '20',
    '-sc_threshold',
    '0',
    '-g',
    '48',
    '-keyint_min',
    '48',
    '-hls_time',
    '10',
    '-hls_playlist_type',
    'vod',
    '-b:v',
    resolution.videoBitrate,
    '-maxrate',
    resolution.maxrate,
    '-bufsize',
    resolution.bufsize,
    '-b:a',
    resolution.audioBitrate,
    '-hls_segment_filename',
    outputs,
  ];

  // logger.debug(
  //   `FFmpeg command: ffmpeg -i ${tempFilePath} ${ffmpegCommand.join(" ")} ${outputM3U8}`
  // );

  try {
    // run the conversion
    await new Promise((resolve, reject) => {
      const ff = ffmpeg()
        .input(downloadedFilePath)
        .on('start', (commandLine) => {
          logger.info('FFmpeg command started:', commandLine);
        })
        .outputOptions(ffmpegCommand)
        .output(outputM3U8)
        .on('end', async () => {
          logger.info(`\n✅ ${resolution.name} done.`);
          resolve(true);
        })
        .on('error', (err: any, stdout: any, stderr: any) => {
          const errorMessage =
            `FFmpeg error in ${resolution.name}: ${err.message}\n` +
            `FFmpeg stderr: ${stderr || 'No stderr output'}\n` +
            `FFmpeg stdout: ${stdout || 'No stdout output'}`;

          logger.error(errorMessage, {
            error: {
              message: err.message,
              code: err.code,
              stack: err.stack,
            },
            resolution: resolution.name,
            inputFile: downloadedFilePath,
            outputDir: outputDir,
          });

          reject(new Error(errorMessage));
        })
        .run();
    });
  } catch (error: any) {
    logger.error(`Failed to process ${resolution.name}`, {
      error: {
        message: error.message,
        stack: error.stack,
      },
      inputFile: downloadedFilePath,
      outputDir: outputDir,
    });
    // throw error;
  } finally {
  }
}

async function processEvent(event: any) {
  const message = event.Message;
  let messageJson: any;
  try {
    messageJson = JSON.parse(message);
  } catch (error) {
    // TODO : may be push it to DLQ
    logger.error('Error parsing message:', error);
    return;
  }

  // logger.info('Processing message:', messageJson);

  if (messageJson.Records) {
    for (const record of messageJson.Records) {
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      if (!key) {
        break;
      }
      const keyWithoutExtension = key.split('.').slice(0, -1).join('');

      const isUploadedToVideoDirectory = key.startsWith('video/');
      if (!isUploadedToVideoDirectory) {
        continue;
      }

      const bucket = record.s3.bucket.name;

      const { downloadedFilePath } = await downloadVideoFromS3(bucket, key);

      // Verify FFmpeg is available
      if (!ffmpegPath) {
        throw new Error(
          'FFmpeg not found. Please ensure FFmpeg is installed and available in your PATH.'
        );
      }

      // Create output directory to keep the processed files
      const outputDir = path.join('/tmp', 'processed', keyWithoutExtension);
      mkdirSync(outputDir, { recursive: true });

      for (const resolution of resolutions) {
        try {
          await transcodeVideo({
            resolution,
            outputDir,
            downloadedFilePath,
            keyWithoutExtension,
          });
        } catch (error: any) {
          logger.error(`Failed to process ${resolution.name}`, {
            error: {
              message: error.message,
              stack: error.stack,
            },
            inputFile: downloadedFilePath,
            outputDir: outputDir,
          });
          // throw error;
        }
      }

      logger.info('📤 uploading files to S3');
      await uploadTranscodedFilesToS3(outputDir, keyWithoutExtension);
      logger.info('✅ files uploaded to S3');

      // await cleanup(outputDir);

      // Clean up the temporary file
      // try {
      //   if (
      //     await fs.promises
      //       .access(tempFilePath)
      //       .then(() => true)
      //       .catch(() => false)
      //   ) {
      //     await fs.promises.unlink(tempFilePath);
      //     logger.debug(`Cleaned up temporary file: ${tempFilePath}`);
      //   }
      // } catch (cleanupError) {
      //   logger.warn("Failed to clean up temporary file:", cleanupError);
      // }
    }
  }
}

export async function initializeVideoConsumer(): Promise<
  (() => Promise<void>) | undefined
> {
  if (process.env.SQS_VIDEO_CONSUMER_QUEUE_URL) {
    const videoProcessingConsumer = new SQSConsumer(
      {
        queueUrl: process.env.SQS_VIDEO_CONSUMER_QUEUE_URL as string,
      },
      {
        processEvent,
      }
    );
    logger.info('Video consumer initializing');
    await videoProcessingConsumer.init();
    return () => videoProcessingConsumer.stop();
  }
  return undefined;
}
