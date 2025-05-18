"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Upload, UploadCloud, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { uploadGroupPhoto, uploadBulkGroupPhotos } from '@/lib/api';

export default function UploadPage() {
  const router = useRouter();
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const handleSingleUpload = async () => {
    if (!singleFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      const response = await uploadGroupPhoto(singleFile);
      
      toast.success('Photo uploaded successfully!');
      setUploadComplete(true);
      
      // Redirect to gallery after a short delay
      setTimeout(() => {
        router.push('/gallery');
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleBulkUpload = async () => {
    if (multipleFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      const response = await uploadBulkGroupPhotos(multipleFiles);
      
      toast.success(`${multipleFiles.length} photos uploaded successfully!`);
      setUploadComplete(true);
      
      // Redirect to gallery after a short delay
      setTimeout(() => {
        router.push('/gallery');
      }, 2000);
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSingleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSingleFile(files[0]);
    } else {
      setSingleFile(null);
    }
  };
  
  const handleMultipleFileSelect = (files: File[]) => {
    setMultipleFiles(files);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Upload Photos"
        description="Upload your group photos for facial recognition processing."
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {uploadComplete ? (
          <Card className="max-w-xl mx-auto">
            <CardContent className="pt-6 px-6">
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="size-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <Check className="size-8" />
                </div>
                <h3 className="text-2xl font-semibold">Upload Successful!</h3>
                <p className="text-muted-foreground">
                  Your photos have been uploaded and are being processed.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => router.push('/gallery')}
                >
                  View in Gallery
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="single" className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="single">Single Upload</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="single">
              <Card>
                <CardHeader>
                  <CardTitle>Upload a Group Photo</CardTitle>
                  <CardDescription>
                    Upload a single group photo that contains multiple faces.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FileUpload
                      onFileSelect={handleSingleFileSelect}
                      multiple={false}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setSingleFile(null)} disabled={!singleFile || uploading}>
                    Clear
                  </Button>
                  <Button onClick={handleSingleUpload} disabled={!singleFile || uploading}>
                    {uploading ? (
                      <>
                        <Upload className="mr-2 size-4 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 size-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="bulk">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Upload Group Photos</CardTitle>
                  <CardDescription>
                    Upload multiple group photos at once for batch processing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FileUpload
                      onFileSelect={handleMultipleFileSelect}
                      multiple={true}
                      maxFiles={20}
                    />
                    
                    {multipleFiles.length > 0 && (
                      <div className="text-sm text-muted-foreground mt-2">
                        {multipleFiles.length} {multipleFiles.length === 1 ? 'file' : 'files'} selected
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setMultipleFiles([])} disabled={multipleFiles.length === 0 || uploading}>
                    Clear All
                  </Button>
                  <Button onClick={handleBulkUpload} disabled={multipleFiles.length === 0 || uploading}>
                    {uploading ? (
                      <>
                        <Upload className="mr-2 size-4 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 size-4" />
                        Upload Photos
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
      
      <Separator className="my-16" />
      
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Upload Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs">1</span>
                  </div>
                  <span>Choose clear, well-lit photos for best results</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs">2</span>
                  </div>
                  <span>Supported formats: JPEG, PNG (max 10MB per file)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs">3</span>
                  </div>
                  <span>Upload multiple photos at once using the Bulk Upload tab</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs">4</span>
                  </div>
                  <span>Photos with larger face sizes yield better recognition results</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="size-5 rounded-full bg-green-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs">1</span>
                  </div>
                  <span>Your photos will be processed for facial recognition</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-5 rounded-full bg-green-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs">2</span>
                  </div>
                  <span>View all uploaded photos in the Gallery section</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-5 rounded-full bg-green-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs">3</span>
                  </div>
                  <span>Go to the Search page to find specific people</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-5 rounded-full bg-green-500 text-white flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-xs">4</span>
                  </div>
                  <span>Upload reference images to match against your group photos</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}