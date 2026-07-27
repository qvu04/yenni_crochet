import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { customRequestService } from "services"
import { CreateCustomRequestInput } from "types"

interface UseCreateCustomRequestProps {
    options?: UseMutationOptions<void, Error, CreateCustomRequestInput>;
};
export const useCreateCustomRequest = ({ options }: UseCreateCustomRequestProps = {}) => {
    return useMutation({
        mutationFn: (input: CreateCustomRequestInput) => customRequestService.createCustomRequest(input),
        ...options,
    })
}

interface UseUploadCustomRequestImagesProps {
    options?: UseMutationOptions<string[], Error, File[]>;
};

export const useUploadCustomRequestImages = ({ options }: UseUploadCustomRequestImagesProps = {}) => {
    return useMutation({
        mutationFn: (files: File[]) => customRequestService.uploadReferenceImages(files),
        ...options,
    })
}
