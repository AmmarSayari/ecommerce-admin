"use client";

import { useParams, useRouter } from "next/navigation";

import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BillboardColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { Copy, Edit2, MoreHorizontal, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps {
    data: BillboardColumn;
};

export const CellAction: React.FC<CellActionProps> = ({
    data
}) => {
    const router = useRouter();
    const params = useParams();

    const [loding, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Billboard Id copied to clipboard.");
    }

    const onDelete = async () => {
        try {
            
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/billboards/${data.id}`);
            router.refresh();
            toast.success("Billboard deleted.");
        } catch (error) {
            toast.error("Make sure you have no products in this billboard.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    return (
        <>
            <AlertModal 
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loding}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="h-8 w-8 p-0" variant="ghost">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>  
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        Actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onCopy(data.id)}>
                        <Copy className="mr-2 h-4 w-4 "/>
                        Copy Id
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/billboards/${data.id}`)} >
                        <Edit2 className="mr-2 h-4 w-4 "/>
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Trash className="mr-2 h-4 w-4 " color="red" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};