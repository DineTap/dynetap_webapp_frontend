"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Icons } from "~/components/Icons";
import { useToast } from "~/components/ui/use-toast";

export const ScanMenuButton = () => {
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = () => {
        if (files.length === 0) return;

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setOpen(false);
            toast({
                title: "Success",
                description: `Menu scan initiated with ${files.length} images.`,
            });
            setFiles([]);
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Icons.image className="h-4 w-4" />
                    Scan Menu
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Scan Menu</DialogTitle>
                    <DialogDescription>
                        Upload pictures of your menu to automatically generate dishes.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="menu-picture">Menu Pictures</Label>
                        <Input
                            id="menu-picture"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                        {files.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <Label className="text-muted-foreground">Selected files:</Label>
                                <ul className="list-inside list-disc text-sm text-muted-foreground">
                                    {files.map((file, index) => (
                                        <li key={index} className="truncate">
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpload} disabled={files.length === 0 || isLoading}>
                        {isLoading ? (
                            <>
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                Processing
                            </>
                        ) : (
                            "Generate Menu"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
