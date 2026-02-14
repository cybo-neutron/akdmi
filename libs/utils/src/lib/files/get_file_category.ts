const fileCategory = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  video: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/3gpp',
    'video/3gpp2',
  ],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/3gpp',
    'audio/3gpp2',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
};

export const getFileCategory = (type: string) => {
  if (fileCategory.image.includes(type)) {
    return 'image';
  } else if (fileCategory.video.includes(type)) {
    return 'video';
  } else if (fileCategory.audio.includes(type)) {
    return 'audio';
  } else if (fileCategory.document.includes(type)) {
    return 'document';
  } else {
    return 'unknown';
  }
};
