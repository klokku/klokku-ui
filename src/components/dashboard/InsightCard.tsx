import {PropsWithChildren, ReactNode, useId} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

export interface InsightState {
    isLoading: boolean;
    error: Error | null;
    onRetry: () => void;
}

const readyState: InsightState = {isLoading: false, error: null, onRetry: () => {}};

export function InsightContent({state, label, children}: PropsWithChildren<{state: InsightState; label: string}>) {
    return state.error ? (
        <div role="alert" className="flex flex-col items-start gap-3 text-sm">
            <p>Could not load {label.toLowerCase()}. Please try again.</p>
            <Button variant="outline" size="sm" onClick={state.onRetry}>Retry</Button>
        </div>
    ) : state.isLoading ? (
        <div role="status" aria-label={`Loading ${label}`} className="space-y-3">
            <Skeleton className="h-8 w-2/3"/>
            <Skeleton className="h-36 w-full"/>
        </div>
    ) : children;
}

export function InsightCard({title, description, state = readyState, footer, children, hideHeader = false}: PropsWithChildren<{
    title: string;
    description: ReactNode;
    state?: InsightState;
    footer?: ReactNode;
    hideHeader?: boolean;
}>) {
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} aria-busy={state.isLoading} className="min-w-0 h-full">
            <Card className="shadow-lg gap-4 h-full min-w-0">
                {hideHeader ? <h2 id={titleId} className="sr-only">{title}</h2> : <CardHeader>
                    <CardTitle><h2 id={titleId}>{title}</h2></CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>}
                <CardContent className="min-w-0 flex-1">
                    <InsightContent state={state} label={title}>{children}</InsightContent>
                </CardContent>
                {!state.isLoading && !state.error && footer && <CardFooter className="flex-wrap justify-between gap-3 text-sm">{footer}</CardFooter>}
            </Card>
        </section>
    );
}
