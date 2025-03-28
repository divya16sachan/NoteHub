import { ImageIcon, Loader2, Upload, X } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { FileDrop } from 'react-file-drop';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useImageStore } from '@/stores/useImageStore';
import { toast } from 'sonner';

const FileDropZone = ({ editor }) => {
    const { getImages, imageUrls, isImageUrlsLoading, uploadImage, removeImage } = useImageStore();
    useEffect(() => {
        getImages();
    }, []);

    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = (droppedFiles, event) => {
        event.preventDefault();
        const file = droppedFiles[0];
        if (!file) return;
        if (isUploading) return toast.error('wait till uploading');
        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const imageBase64 = reader.result;
            await uploadImage(imageBase64);
            setIsUploading(false);
        };
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (isUploading) return toast.error('wait till uploading');


        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const imageBase64 = reader.result;
            await uploadImage(imageBase64);
            setIsUploading(false);
        };
    };

    const handleRemove = async (url) => {
        setIsRemoving(url);
        const success = await removeImage(url);
        setIsRemoving(null);
    };

    const handleSetImage = useCallback((url) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const imageCount = localStorage.getItem("imageCount") || 3;
    const skeletons = [];
    for(let i = 0; i < imageCount; ++i){
        skeletons.push(<Skeleton key={i} className={"aspect-square"} />)
    }

    return (
        <div className="file-drop-container m-1 space-y-4">

            <FileDrop
                onDrop={handleDrop}
                onDragOver={() => setIsDragOver(true)}
                onDragLeave={() => setIsDragOver(false)}
            >
                <div
                    className={`${isDragOver && !isUploading
                        && 'bg-secondary/50 text-primary border-muted-foreground/30'
                        } text-muted-foreground w-full py-10 p-8 flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg transition-colors`}
                >
                    <ImageIcon className="size-12 mb-4" />
                    <p className="text-sm mb-2">Drag and drop or</p>
                    <Button disabled={isUploading || isRemoving} className="pointer">
                        <label htmlFor="upload-photo" className="p-4 flex items-center gap-2 cursor-pointer">
                            <Upload /> {isUploading ? "uploading..." : "Upload an image"}
                            <input
                                type="file"
                                hidden
                                id="upload-photo"
                                accept="image/*"
                                onChange={handleInputChange}
                            />
                        </label>
                    </Button>
                </div>
            </FileDrop>
            <div className='max-h-[300px] grid grid-cols-3 gap-1 overflow-auto'>
                {isUploading && (<Skeleton className={"aspect-square"} />)}
                {
                    isImageUrlsLoading ?
                        skeletons
                        :
                        imageUrls.map((url, index) => (
                            <div
                                key={index}
                                className='relative rounded aspect-square bg-muted/30 overflow-hidden flex items-center justify-center group'
                            >
                                <img src={url}
                                    onClick={() => handleSetImage(url)}
                                    className='w-full h-full object-cover' alt="note" />
                                {isRemoving === url && (
                                    <div className='absolute z-10 inset-0 bg-black/50 flex items-center justify-center gap-2 text-white/70'>
                                        Removing <Loader2 className='size-5 animate-spin' />
                                    </div>
                                )}
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    disabled={isRemoving}
                                    className="cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity size-6 absolute top-0 right-0"
                                    onClick={() => handleRemove(url)}
                                >
                                    <X />
                                </Button>
                            </div>
                        ))
                }
            </div>
        </div>
    );
};

export default FileDropZone;
