"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Upload, Search, ImageIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [hoverFeature, setHoverFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'upload',
      title: 'Upload Photos',
      description: 'Upload individual or multiple group photos for facial recognition processing.',
      icon: Upload,
      href: '/upload',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      id: 'gallery',
      title: 'Browse Gallery',
      description: 'View all your uploaded group photos in one place to manage and organize.',
      icon: ImageIcon,
      href: '/gallery',
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      id: 'search',
      title: 'Find People',
      description: 'Upload a reference image to find matching faces across all your group photos.',
      icon: Search,
      href: '/search',
      color: 'bg-green-500/10 text-green-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-500/10 to-transparent dark:from-blue-950/20" />
        
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Find Faces in Group Photos with <span className="text-primary">FaceFind</span>
              </h1>
            </motion.div>
            
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Upload group photos, then search for specific people using our advanced facial recognition technology.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/upload" passHref>
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="size-4" />
                </Button>
              </Link>
              
              <Link href="/search" passHref>
                <Button variant="outline" size="lg">
                  Find Someone
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our facial recognition technology makes it easy to find people in your photos.
          </p>
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id}
              variants={itemVariants}
              onMouseEnter={() => setHoverFeature(feature.id)}
              onMouseLeave={() => setHoverFeature(null)}
            >
              <Link href={feature.href} className="block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <CardHeader>
                    <div className={`inline-flex size-12 rounded-lg ${feature.color} items-center justify-center mb-2`}>
                      <feature.icon className="size-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="gap-2 ml-auto">
                      Get Started <ArrowRight className="size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      {/* Demo Section */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Powerful Facial Recognition Technology
              </h2>
              <p className="text-lg text-muted-foreground">
                Our advanced algorithms can identify faces with high accuracy, even in challenging lighting conditions or with partial face visibility.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Accurate Face Detection</p>
                    <p className="text-muted-foreground">Precisely detects faces in group photos regardless of orientation or lighting.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Fast Processing</p>
                    <p className="text-muted-foreground">Quickly processes large batches of photos without sacrificing accuracy.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Confidence Scores</p>
                    <p className="text-muted-foreground">Each match comes with a confidence percentage to assess reliability.</p>
                  </div>
                </li>
              </ul>
              <div className="pt-4">
                <Link href="/search" passHref>
                  <Button size="lg">Try it now</Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-xl overflow-hidden border border-border shadow-lg">
                <img 
                  src="https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Group photo with facial recognition"
                  className="w-full h-auto rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-semibold">
                    Find the people that matter in your group photos
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}