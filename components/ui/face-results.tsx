import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FaceLocation {
  confidence: number;
  face_location: [number, number, number, number];
  timestamp?: string;
}

export interface FaceMatch {
  filename: string;
  url?: string;
  confidence: number;
  face_location: [number, number, number, number];
}

interface FaceResultsProps {
  results: FaceMatch[];
  referenceImage: string;
  tolerance?: number;
  totalImagesChecked?: number;
}

export function FaceResults({
  results,
  referenceImage,
  tolerance,
  totalImagesChecked,
}: FaceResultsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Reference Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={referenceImage}
                alt="Reference face"
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Tolerance Level</p>
              <p className="text-2xl font-bold">{tolerance || 0.5}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Lower values mean stricter matching
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Images Analyzed</p>
              <p className="text-2xl font-bold">
                {totalImagesChecked || results.length}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Matches Found</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {results.map((result, index) => (
          <motion.div
            key={result.filename}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{result.filename}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={result.url || result.filename}
                    alt={`Match ${index + 1}`}
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Match Details</span>
                      <span className="text-sm text-muted-foreground">
                        {result.confidence}% confidence
                      </span>
                    </div>
                    <Progress value={result.confidence} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
