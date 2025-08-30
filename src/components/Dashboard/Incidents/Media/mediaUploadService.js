import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const MAX_FILE_SIZES = {
  image: 5, // 5MB
  video: 20, // 20MB  
  audio: 10, // 10MB
};

const uploadIncidentMedia = async (mediaFile, audioBlob, incidentId) => {
  const storage = getStorage();
  const mediaUrls = [];
  
  try {
    // Upload photo/video file
    if (mediaFile?.file) {
      const fileSizeMB = mediaFile.file.size / (1024 * 1024);
      const maxSize = MAX_FILE_SIZES[mediaFile.type] || 5;
      
      if (fileSizeMB > maxSize) {
        throw new Error(`${mediaFile.type} file size exceeds ${maxSize}MB limit`);
      }
      
      const fileRef = ref(
        storage, 
        `incidents/${incidentId}/media/${Date.now()}_${mediaFile.file.name}`
      );
      
      const uploadTask = uploadBytesResumable(fileRef, mediaFile.file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Media upload progress: ${progress}%`);
          },
          (error) => {
            console.error('Media upload failed:', error);
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              mediaUrls.push({ 
                url, 
                type: mediaFile.type,
                filename: mediaFile.file.name,
                uploadedAt: new Date().toISOString()
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    }
    
    // Upload audio blob
    if (audioBlob) {
      const audioSizeMB = audioBlob.size / (1024 * 1024);
      
      if (audioSizeMB > MAX_FILE_SIZES.audio) {
        throw new Error(`Audio file size exceeds ${MAX_FILE_SIZES.audio}MB limit`);
      }
      
      const audioRef = ref(
        storage, 
        `incidents/${incidentId}/audio/${Date.now()}_recording.webm`
      );
      
      const audioUploadTask = uploadBytesResumable(audioRef, audioBlob);
      
      await new Promise((resolve, reject) => {
        audioUploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Audio upload progress: ${progress}%`);
          },
          (error) => {
            console.error('Audio upload failed:', error);
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(audioUploadTask.snapshot.ref);
              mediaUrls.push({ 
                url, 
                type: 'audio',
                filename: 'voice_recording.webm',
                uploadedAt: new Date().toISOString()
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    }
    
    return mediaUrls;
  } catch (error) {
    console.error('Error uploading incident media:', error);
    throw error;
  }
};

export { uploadIncidentMedia };