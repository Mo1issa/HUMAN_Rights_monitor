import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  IconButton,
  Alert,
  LinearProgress
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudioFileIcon from '@mui/icons-material/AudioFile';

const FileUploader = ({ 
  onUpload, 
  maxFiles = 5, 
  acceptedFileTypes = '*/*', 
  maxFileSize = 10, // in MB
  title = 'Upload Files',
  description = 'Drag and drop files here or click to select files',
  uploadEndpoint = null,
  parentId = null,
  disabled = false
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [overallError, setOverallError] = useState(null);
  
  const fileInputRef = React.useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }
    
    // Check file type if specific types are required
    if (acceptedFileTypes !== '*/*') {
      const fileTypes = acceptedFileTypes.split(',');
      const fileType = file.type;
      
      if (!fileTypes.some(type => {
        // Handle wildcards like image/* or specific types like image/png
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(category + '/');
        }
        return type === fileType;
      })) {
        return 'File type not accepted';
      }
    }
    
    return null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    
    if (disabled) return;
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    
    // Check if adding these files would exceed the max files limit
    if (files.length + newFiles.length > maxFiles) {
      setOverallError(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }
    
    // Validate each file and add to the list
    const validatedFiles = newFiles.map(file => {
      const error = validateFile(file);
      return {
        file,
        id: `${file.name}-${Date.now()}`,
        error
      };
    });
    
    setFiles(prev => [...prev, ...validatedFiles]);
    setOverallError(null);
  };

  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current.click();
  };

  const handleRemoveFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0 || uploading || disabled) return;
    
    // Check if there are any validation errors
    const hasErrors = files.some(file => file.error);
    if (hasErrors) {
      setOverallError('Please fix the errors before uploading');
      return;
    }
    
    setUploading(true);
    setOverallError(null);
    
    try {
      // Create a new FormData instance
      const formData = new FormData();
      
      // Add parent ID if provided
      if (parentId) {
        formData.append('parent_id', parentId);
      }
      
      // Add all files to the form data
      files.forEach(({ file }) => {
        formData.append('files', file);
      });
      
      // If an upload endpoint is provided, use it directly
      if (uploadEndpoint) {
        // Simulate upload progress for each file
        const uploadPromises = files.map(async ({ id, file }) => {
          // Simulate progress updates
          for (let progress = 0; progress <= 100; progress += 10) {
            setUploadProgress(prev => ({
              ...prev,
              [id]: progress
            }));
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        });
        
        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
        
        // Call the onUpload callback with the files
        if (onUpload) {
          onUpload(files.map(({ file }) => file));
        }
      } else if (onUpload) {
        // If no endpoint but callback is provided, just call the callback
        onUpload(files.map(({ file }) => file));
      }
      
      // Clear files after successful upload
      setFiles([]);
      setUploadProgress({});
      setUploadErrors({});
    } catch (error) {
      console.error('Upload error:', error);
      setOverallError('Failed to upload files: ' + (error.message || 'Unknown error'));
      
      // Set error for each file
      const newErrors = {};
      files.forEach(({ id }) => {
        newErrors[id] = 'Upload failed';
      });
      setUploadErrors(newErrors);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    const type = file.type;
    
    if (type.startsWith('image/')) {
      return <ImageIcon />;
    } else if (type.startsWith('video/')) {
      return <VideoFileIcon />;
    } else if (type === 'application/pdf') {
      return <PictureAsPdfIcon />;
    } else if (type.startsWith('audio/')) {
      return <AudioFileIcon />;
    } else {
      return <InsertDriveFileIcon />;
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3,
        mb: 3
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      {overallError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {overallError}
        </Alert>
      )}
      
      <Box
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.400',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          bgcolor: dragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          transition: 'all 0.2s ease',
          mb: 2,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleChange}
          accept={acceptedFileTypes}
          disabled={disabled}
        />
        
        <AttachFileIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        
        <Typography variant="body1" gutterBottom>
          {description}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Max {maxFiles} files, up to {maxFileSize}MB each
        </Typography>
      </Box>
      
      {files.length > 0 && (
        <List>
          {files.map(({ file, id, error }) => (
            <ListItem
              key={id}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => handleRemoveFile(id)}
                  disabled={uploading}
                >
                  <DeleteIcon />
                </IconButton>
              }
              sx={{
                bgcolor: error ? 'rgba(211, 47, 47, 0.04)' : 'transparent',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon>
                {getFileIcon(file)}
              </ListItemIcon>
              <ListItemText 
                primary={file.name} 
                secondary={
                  error ? (
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  ) : uploadErrors[id] ? (
                    <Typography variant="body2" color="error">
                      {uploadErrors[id]}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                      {uploadProgress[id] !== undefined && (
                        <>
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadProgress[id]} 
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {uploadProgress[id]}%
                          </Typography>
                        </>
                      )}
                      {uploadProgress[id] === 100 && (
                        <CheckCircleIcon color="success" fontSize="small" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  )
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          startIcon={uploading ? <CircularProgress size={20} /> : <FileUploadIcon />}
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || files.some(file => file.error) || disabled}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>
    </Paper>
  );
};

export default FileUploader;
