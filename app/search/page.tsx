"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Upload, Search as SearchIcon, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaceResults, FaceMatch } from "@/components/ui/face-results";
import { Separator } from "@/components/ui/separator";
import { findPerson } from "@/lib/api";

export default function SearchPage() {
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(
    null
  );
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FaceMatch[] | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setReferenceImage(files[0]);

      // Create URL for preview
      const url = URL.createObjectURL(files[0]);
      setReferenceImageUrl(url);

      // Clear previous results
      setSearchResults(null);
    } else {
      setReferenceImage(null);
      setReferenceImageUrl(null);
    }
  };

  const handleSearch = async () => {
    if (!referenceImage) {
      toast.error("Please upload a reference image");
      return;
    }

    setSearching(true);

    try {
      const response = await findPerson(referenceImage);

      // If you want to display a mock/demo results

      // Use actual API response or mock data for demo
      if (response && response.matches) {
        setSearchResults(response.matches);
      } else {
        // Using mock data for demonstration
        alert("Error");
      }

      toast.success("Search completed successfully!");
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for person. Please try again.");

      // Using mock data for demonstration (in case of error)
    } finally {
      setSearching(false);
    }
  };

  const resetSearch = () => {
    setReferenceImage(null);
    setReferenceImageUrl(null);
    setSearchResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Find Person"
        description="Upload a reference image to find matching faces in your group photos."
      />

      <div className="grid grid-cols-1 gap-8">
        {!searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Upload Reference Image</CardTitle>
                <CardDescription>
                  Upload a clear photo of the person you want to find in your
                  group photos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFileSelect={handleFileSelect} multiple={false} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={resetSearch}
                  disabled={!referenceImage || searching}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSearch}
                  disabled={!referenceImage || searching}
                >
                  {searching ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="mr-2 size-4" />
                      Find Person
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {searchResults && referenceImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="mb-4 flex justify-end">
              <Button variant="outline" onClick={resetSearch}>
                <Upload className="mr-2 size-4" />
                Upload New Reference
              </Button>
            </div>

            <FaceResults
              results={searchResults}
              referenceImage={referenceImageUrl}
            />
          </motion.div>
        )}
      </div>

      {!searchResults && (
        <>
          <Separator className="my-16" />

          <motion.div
            className="max-w-4xl mx-auto space-y-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our advanced facial recognition technology makes it easy to find
                people in your group photos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="size-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                    <span className="font-semibold">1</span>
                  </div>
                  <CardTitle>Upload Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Upload a clear photo of the person you want to find. Choose
                    an image where their face is clearly visible.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="size-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-2">
                    <span className="font-semibold">2</span>
                  </div>
                  <CardTitle>Search Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our system compares the reference face with all faces in
                    your uploaded group photos.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="size-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                    <span className="font-semibold">3</span>
                  </div>
                  <CardTitle>View Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    See all matching photos with confidence scores, helping you
                    find the person across your collection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
