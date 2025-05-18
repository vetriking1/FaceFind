"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Maximize2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageGridProps {
  images: string[];
  onImageClick?: (imageUrl: string) => void;
  onDeleteImage?: (imageUrl: string) => void;
  className?: string;
}

export function ImageGrid({
  images,
  onImageClick,
  onDeleteImage,
  className,
}: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [columns, setColumns] = useState(3);
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});

  // Adjust columns based on number of images
  useEffect(() => {
    if (images.length <= 2) {
      setColumns(1);
    } else if (images.length <= 4) {
      setColumns(2);
    } else {
      setColumns(3);
    }
  }, [images.length]);

  // Load image dimensions
  useEffect(() => {
    const loadDimensions = async () => {
      const dimensions: Record<string, { width: number; height: number }> = {};
      await Promise.all(
        images.map((img) => {
          return new Promise<void>((resolve) => {
            const image = new Image();
            image.src = img;
            image.onload = () => {
              dimensions[img] = {
                width: image.width,
                height: image.height,
              };
              resolve();
            };
            image.onerror = () => {
              dimensions[img] = { width: 1, height: 1 }; // Fallback
              resolve();
            };
          });
        })
      );
      setImageDimensions(dimensions);
    };

    loadDimensions();
  }, [images]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    if (onImageClick) {
      onImageClick(imageUrl);
    }
  };

  const getImageClass = (imageUrl: string) => {
    const dimensions = imageDimensions[imageUrl];
    if (!dimensions) return "object-cover w-full h-full";

    const isPortrait = dimensions.height > dimensions.width;
    return isPortrait
      ? "object-cover w-full h-full max-h-[400px] mx-auto"
      : "object-cover w-full h-full";
  };

  return (
    <>
      <motion.div
        className={cn(
          `grid gap-4`,
          columns === 1
            ? "grid-cols-1"
            : columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {images.map((image, index) => (
          <motion.div
            key={image}
            className="group relative rounded-lg overflow-hidden bg-black/5 border border-border min-h-[200px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={image}
                alt={`Group photo ${index + 1}`}
                className={getImageClass(image)}
                style={{
                  maxHeight: "400px",
                  maxWidth: "100%",
                }}
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center">
                <p className="text-white text-sm font-medium truncate">
                  Photo {index + 1}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8 bg-white/20 hover:bg-white/30 border-none"
                    onClick={() => handleImageClick(image)}
                  >
                    <Maximize2 className="size-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/80 backdrop-blur-sm">
          {selectedImage && (
            <div className="relative w-full max-h-[80vh] flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Full size preview"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
