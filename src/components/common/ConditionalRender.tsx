import { PullToRefresh } from "antd-mobile";
import { Emptier, Spinner } from "components/ui";
import { ReactNode } from "react";

interface ConditionalRenderProps {
    isLoading?: boolean;
    loadingRender?: ReactNode;
    isError?: boolean;
    errorRender?: ReactNode;
    isEmpty?: boolean;
    emptyRender?: ReactNode;
    onRefresh?: () => Promise<unknown> | unknown;
    children: ReactNode;
}

export const ConditionalRender = ({
    isLoading,
    loadingRender,
    isError,
    errorRender,
    isEmpty,
    emptyRender,
    onRefresh,
    children,
}: ConditionalRenderProps) => {
    const content = (() => {
        if (isLoading) {
            return loadingRender ?? <Spinner label="Đang tải dữ liệu..." />;
        }

        if (isError) {
            return (
                errorRender ?? (
                    <Emptier
                        title="Không tải được dữ liệu"
                        description={onRefresh ? "Bạn thử tải lại nhé." : "Bạn thử lại sau nhé."}
                        action={onRefresh ? { label: "Thử lại", onClick: onRefresh } : undefined}
                    />
                )
            );
        }

        if (isEmpty) {
            return emptyRender ?? <Emptier />;
        }

        return children;
    })();

    if (!onRefresh) {
        return <>{content}</>;
    }

    return (
        <PullToRefresh
            pullingText="Kéo xuống để làm mới"
            canReleaseText="Thả tay để làm mới"
            refreshingText="Đang làm mới..."
            completeText="Đã cập nhật"
            onRefresh={async () => { await onRefresh(); }}
        >
            {content}
        </PullToRefresh>
    );
};
