import { CreateCustomRequestInput } from "types";
import { supabase } from "./supabase";

const PRODUCT_STORAGE_BUCKET = "Products";
const CUSTOM_REQUEST_REFERENCES_FOLDER = "custom-requests";
const MAX_REFERENCE_IMAGE_SIZE = 5 * 1024 * 1024;

const getFileExtension = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension || "jpg";
};

export const customRequestService = {
    createCustomRequest: async (input: CreateCustomRequestInput): Promise<void> => {
        const { error } = await supabase.from("custom_requests").insert(input);
        if (error) {
            throw new Error(error.message);
        }
    },

    uploadReferenceImages: async (files: File[]): Promise<string[]> => {
        const uploads = files.map(async (file) => {
            if (!file.type.startsWith("image/")) {
                throw new Error("Chỉ hỗ trợ tải ảnh lên.");
            }

            if (file.size > MAX_REFERENCE_IMAGE_SIZE) {
                throw new Error("Mỗi ảnh tham khảo tối đa 5MB.");
            }

            const path = `${CUSTOM_REQUEST_REFERENCES_FOLDER}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file.name)}`;
            const { error } = await supabase.storage
                .from(PRODUCT_STORAGE_BUCKET)
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) {
                throw new Error(error.message);
            }

            const { data } = supabase.storage
                .from(PRODUCT_STORAGE_BUCKET)
                .getPublicUrl(path);

            return data.publicUrl;
        });

        return Promise.all(uploads);
    }
};
