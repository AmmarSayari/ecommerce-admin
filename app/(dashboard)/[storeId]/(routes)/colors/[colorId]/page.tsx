import prismadb from "@/lib/prismadb";
import { ColorForm } from "./components/color-form";

const ColorPage = async (
    props: {
        params: Promise<{ colorId: string }>;
    }
) => {
    const params = await props.params;
    const color = params.colorId === "new"
        ? null
        : await prismadb.color.findUnique({
            where: {
                id: params.colorId
            }
        });


    return (
        <div>
            <div className="flex-col">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <ColorForm 
                    initialData={color}
                    />
                </div>
            </div>
        </div>
    );
}

export default ColorPage;
