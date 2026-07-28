import { CustomRequestInput } from 'schemas';
export const getTodayInputValue = () => {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};
export const getDefaultFormValues = (): Partial<CustomRequestInput> => ({
    quantity: 1,
    reference_images: [],
});
