import { AiOutlineClose, AiOutlineQuestionCircle, AiOutlinePicture } from 'react-icons/ai';
import { CustomRequestInput, CustomRequestInputSchema } from 'schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getUserInfo } from 'zmp-sdk/apis';
import { useZaloPhoneNumber } from 'hooks/useZaloPhoneNumber';
import { useCreateCustomRequest, useUploadCustomRequestImages } from 'queries';
import { ModalSuccess, Spinner, ConfirmDialog } from 'components/ui';
import { useNavigate } from 'react-router-dom';
import { getDefaultFormValues } from 'utils';

const occasionOptions = [
    { label: "Sinh nhật", value: "birthday" },
    { label: "Kỷ niệm", value: "anniversary" },
    { label: "Dịp lễ", value: "holiday" },
    { label: "Khác", value: "other" },
] as const;

const RequiredMark = () => <span className="text-[#B91C1C]">*</span>;

export const CustomRequestForm = () => {
    const fieldClassName =
        "block w-full min-w-0 max-w-full rounded-2xl border border-white bg-white px-4 py-3 text-sm text-text-main shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/35";

    const { getPhone, isLoading: isGettingPhone, error: phoneError } = useZaloPhoneNumber();
    const navigate = useNavigate();
    const [submitConfirmValues, setSubmitConfirmValues] = useState<CustomRequestInput | null>(null);
    const {
        mutate: createCustomRequest,
        isPending,
        isSuccess,
        error,
        reset: resetMutation,
    } = useCreateCustomRequest();
    const {
        mutate: uploadReferenceImages,
        isPending: isUploadingImages,
        error: uploadError,
    } = useUploadCustomRequestImages();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset: resetForm,
    } = useForm<CustomRequestInput>({
        resolver: zodResolver(CustomRequestInputSchema),
        defaultValues: getDefaultFormValues(),
    });

    const selectedOccasion = watch("occasion");
    const referenceImages = watch("reference_images") ?? [];

    useEffect(() => {
        getUserInfo({ autoRequestPermission: true })
            .then(({ userInfo }) => {
                if (userInfo.name) {
                    setValue("customer_name", userInfo.name, {
                        shouldDirty: false,
                        shouldValidate: true,
                    });
                }
            })
            .catch(() => { });
    }, [setValue]);

    const handleGetPhone = () => {
        getPhone().then((phoneNumber) => {
            if (phoneNumber) {
                setValue("phone", phoneNumber, { shouldDirty: true, shouldValidate: true });
            }
        });
    };

    const handleReferenceImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        event.target.value = "";

        if (selectedFiles.length === 0) return;

        const availableSlots = Math.max(0, 3 - referenceImages.length);
        const filesToUpload = selectedFiles.slice(0, availableSlots);

        if (filesToUpload.length === 0) return;

        uploadReferenceImages(filesToUpload, {
            onSuccess: (uploadedUrls) => {
                setValue("reference_images", [...referenceImages, ...uploadedUrls], {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            },
        });
    };

    const handleRemoveReferenceImage = (url: string) => {
        setValue(
            "reference_images",
            referenceImages.filter((imageUrl) => imageUrl !== url),
            { shouldDirty: true, shouldValidate: true },
        );
    };

    const submitCustomRequest = (values: CustomRequestInput) => {
        createCustomRequest(values, {
            onSuccess: () => {
                resetForm(getDefaultFormValues());
            },
        });
    };

    const handleConfirmSubmit = (values: CustomRequestInput) => {
        if (isPending || isUploadingImages) return;
        setSubmitConfirmValues(values);
    };

    return (
        <>
            <form onSubmit={handleSubmit(handleConfirmSubmit)} className="space-y-5">
                <div>
                    <label className="mb-1 block text-sm font-semibold text-text-main">
                        Tên của bạn <RequiredMark />
                    </label>
                    <input
                        {...register("customer_name")}
                        placeholder="Nguyễn Văn A"
                        className={fieldClassName}
                    />
                    {errors.customer_name && (
                        <p className="mt-1 text-xs text-[#B91C1C]">{errors.customer_name.message}</p>
                    )}
                </div>

                <div>
                    <div className="mb-1 flex items-center justify-between gap-3">
                        <label className="block text-sm font-semibold text-text-main">
                            Số điện thoại <RequiredMark />
                        </label>
                        <button
                            type="button"
                            onClick={handleGetPhone}
                            disabled={isGettingPhone}
                            className="text-xs font-semibold text-title-text disabled:text-text-muted"
                        >
                            {isGettingPhone ? "Đang lấy..." : "Lấy từ Zalo"}
                        </button>
                    </div>
                    <input
                        {...register("phone")}
                        placeholder={isGettingPhone ? "Đang lấy từ Zalo..." : "09xxxxxxxx"}
                        inputMode="tel"
                        className={fieldClassName}
                    />
                    {phoneError && (
                        <p className="mt-1 text-xs text-[#B91C1C]">
                            Hiện tại chưa phát triển tính năng tự lấy SĐT từ Zalo, bạn giúp shop nhập tay nhé.
                        </p>
                    )}
                    {errors.phone && (
                        <p className="mt-1 text-xs text-[#B91C1C]">{errors.phone.message}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-semibold text-text-main">
                        Số lượng mong muốn <RequiredMark />
                    </label>
                    <input
                        {...register("quantity", { valueAsNumber: true })}
                        type='number'
                        min={1}
                        placeholder="Ví dụ: 2"
                        className={fieldClassName}
                    />
                    {errors.quantity && (
                        <p className="mt-1 text-xs text-[#B91C1C]">{errors.quantity.message}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-semibold text-text-main">
                        Bạn muốn làm món gì? <RequiredMark />
                    </label>
                    <textarea
                        {...register("description")}
                        rows={5}
                        placeholder="Ví dụ: móc khóa capybara áo xanh, bó hoa len tone hồng..."
                        className={fieldClassName}
                    />
                    {errors.description && (
                        <p className="mt-1 text-xs text-[#B91C1C]">{errors.description.message}</p>
                    )}
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="block text-sm font-semibold text-text-main">
                            Ảnh tham khảo <span className="font-medium text-text-muted">(nếu có)</span>
                        </label>
                        <span className="text-xs font-semibold text-text-muted">
                            {referenceImages.length}/3
                        </span>
                    </div>

                    <label
                        className={`flex min-h-24 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-text-main/15 bg-white/75 px-4 py-4 text-center shadow-sm transition ${isUploadingImages ? "opacity-70" : "active:scale-[0.99]"
                            }`}
                    >
                        <AiOutlinePicture className="h-7 w-7 text-title-text" />
                        <span className="mt-2 text-sm font-semibold text-text-main">
                            {isUploadingImages ? "Đang tải ảnh..." : "Thêm ảnh mẫu"}
                        </span>
                        <span className="mt-1 text-xs text-text-muted">
                            Tối đa 3 ảnh bạn nhé!
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={isUploadingImages || referenceImages.length >= 3}
                            onChange={handleReferenceImagesChange}
                            className="hidden"
                        />
                    </label>

                    {referenceImages.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {referenceImages.map((imageUrl) => (
                                <div key={imageUrl} className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
                                    <img
                                        src={imageUrl}
                                        alt="Ảnh tham khảo"
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveReferenceImage(imageUrl)}
                                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-text-main shadow-sm"
                                    >
                                        <AiOutlineClose className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {uploadError && (
                        <p className="mt-1 text-xs text-[#B91C1C]">
                            Tải ảnh thất bại: {uploadError.message}
                        </p>
                    )}
                    {errors.reference_images && (
                        <p className="mt-1 text-xs text-[#B91C1C]">
                            {errors.reference_images.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-text-main">
                        Dịp tặng <span className="font-medium text-text-muted">(nếu có)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {occasionOptions.map((option) => {
                            const isSelected = selectedOccasion === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        setValue("occasion", isSelected ? undefined : option.value, {
                                            shouldDirty: true,
                                        })
                                    }
                                    className={`rounded-full px-3 py-2 text-sm font-semibold transition ${isSelected
                                        ? "bg-primary text-text-main shadow-sm"
                                        : "bg-white/80 text-text-muted ring-1 ring-text-main/5"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-semibold text-text-main">
                        Tone màu yêu thích <span className="font-medium text-text-muted">(nếu có)</span>
                    </label>
                    <input
                        {...register("preferred_colors")}
                        placeholder="Ví dụ: hồng pastel, xanh mint, trắng kem"
                        className={fieldClassName}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-semibold text-text-main">
                        Ghi chú thêm <span className="font-medium text-text-muted">(nếu có)</span>
                    </label>
                    <textarea
                        {...register("note")}
                        rows={3}
                        placeholder="Kích thước, tên cần thêu, mẫu tương tự..."
                        className={fieldClassName}
                    />
                    {errors.note && (
                        <p className="mt-1 text-xs text-[#B91C1C]">{errors.note.message}</p>
                    )}
                </div>

                {error && (
                    <p className="rounded-2xl bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
                        Gửi yêu cầu thất bại, thử lại nhé: {error.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isPending || isUploadingImages}
                    className="w-full rounded-2xl bg-primary py-3 text-base font-bold text-text-main disabled:bg-text-muted disabled:text-white"
                >
                    {isPending ? <Spinner label='Đang gửi yêu cầu...' variant='inline' /> : isUploadingImages ? <Spinner label='Đang tải ảnh...' variant='inline' /> : "Gửi yêu cầu"}
                </button>
            </form>
            <ModalSuccess
                visible={isSuccess}
                heading="Đã gửi yêu cầu!"
                title="Yenni Crochet sẽ liên hệ để tư vấn giá và thời gian làm sớm nhất."
                primaryAction={{
                    label: "Về trang chủ",
                    onClick: () => navigate("/"),
                }}
                secondaryAction={{
                    label: "Gửi yêu cầu khác",
                    onClick: () => {
                        resetMutation();
                        resetForm();
                    },
                }}
            />
            <ConfirmDialog
                visible={Boolean(submitConfirmValues)}
                icon={<AiOutlineQuestionCircle />}
                title="Xác nhận yêu cầu?"
                description={`Bạn chắc chắn với các thông tin bạn đã điền và xác nhận gửi cho shop chứ?`}
                confirmText="Gửi yêu cầu"
                cancelText="Kiểm tra lại"
                isLoading={isPending}
                onCancel={() => setSubmitConfirmValues(null)}
                onConfirm={() => {
                    if (submitConfirmValues) {
                        submitCustomRequest(submitConfirmValues);
                        setSubmitConfirmValues(null);
                    }
                }}
            />
        </>
    )
}
