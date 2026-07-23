"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import {
    CldUploadWidget,
    type CloudinaryUploadWidgetResults,
} from "next-cloudinary";

import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

    const onUpload = (result: CloudinaryUploadWidgetResults) => {
        if (typeof result.info === "object" && "secure_url" in result.info) {
            onChange(result.info.secure_url);
        }
    }

    if (!isMounted) return null;


    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden" >
                        <div className="z-10 absolute top-2 right-2">
                            <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon" >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image 
                            fill
                            sizes="200px"
                            className="object-cover"
                            alt="Image"
                            src={url}
                        />
                    </div>
                ))}
            </div>
            {isCloudinaryConfigured ? (
                <CldUploadWidget
                    onSuccess={onUpload}
                    uploadPreset={uploadPreset}
                    config={{ cloud: { cloudName } }}
                >
                    {({open}) => {
                        const onClick = () => {
                            open();
                        }
                        return (
                            <Button
                                type="button"
                                disabled={disabled}
                                variant="secondary"
                                onClick={onClick}
                            >
                                <ImagePlus className="h-4 w-4 mr-2"/>
                                Upload image
                            </Button>
                        )
                    }}
                </CldUploadWidget>
            ) : (
                <Button
                    type="button"
                    disabled
                    title="Cloudinary upload is not configured"
                    variant="secondary"
                >
                    <ImagePlus className="h-4 w-4 mr-2"/>
                    Upload image
                </Button>
            )}
        </div>
    )
};

export default ImageUpload;
