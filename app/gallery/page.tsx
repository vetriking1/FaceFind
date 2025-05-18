"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LoaderCircle, UploadCloud, UserX, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ImageGrid } from "@/components/ui/image-grid";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { listGroupPhotos } from "@/lib/api";

export default function GalleryPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const data = await listGroupPhotos();
        const photos = data.photos;
        const urlsImg: string[] = [];

        // API response format might vary, adjust accordingly
        if (data.photos && Array.isArray(data.photos)) {
          photos.map(({ url }) => {
            urlsImg.push(url);
          });
          setPhotos(urlsImg);
        } else {
          // For demo, show some placeholder images if API doesn't return expected format
          setPhotos([
            "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            "https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            "https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            "https://images.pexels.com/photos/6121448/pexels-photo-6121448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          ]);
        }
      } catch (error) {
        console.error("Error fetching photos:", error);
        toast.error("Failed to load photos");

        // For demo, show placeholder images
        setPhotos([
          "https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/6121448/pexels-photo-6121448.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handleDeletePhoto = (photoUrl: string) => {
    setPhotoToDelete(photoUrl);
  };

  const confirmDelete = () => {
    if (photoToDelete) {
      // In a real app, you would call an API to delete the photo
      setPhotos(photos.filter((photo) => photo !== photoToDelete));
      toast.success("Photo deleted successfully");
      setPhotoToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Photo Gallery"
        description="Browse and manage your uploaded group photos."
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={() => router.push("/upload")} className="gap-2">
            <UploadCloud className="size-4" />
            Upload More Photos
          </Button>
          <Button variant="outline" onClick={() => router.push("/search")}>
            Search Photos
          </Button>
        </div>
      </PageHeader>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoaderCircle className="size-12 text-primary animate-spin mb-4" />
            <p className="text-lg text-muted-foreground">
              Loading your photos...
            </p>
          </div>
        ) : photos.length > 0 ? (
          <ImageGrid images={photos} onDeleteImage={handleDeletePhoto} />
        ) : (
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <UserX className="size-16 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No Photos Found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                You haven't uploaded any group photos yet. Start by uploading
                your first photo.
              </p>
              <Button onClick={() => router.push("/upload")}>
                Upload Photos
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <AlertDialog
        open={!!photoToDelete}
        onOpenChange={(open) => !open && setPhotoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
