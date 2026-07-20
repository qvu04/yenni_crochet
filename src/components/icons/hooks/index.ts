import { IconProps } from "../types";

export const useIconProps = (props: IconProps) => {
    const { size = "24px" } = props;
    return {
        ...props,
        width: props.width || size,
        height: props.height || size
    }
}