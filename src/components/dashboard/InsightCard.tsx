import {PropsWithChildren, ReactNode, useId} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";

export interface InsightState {
    isLoading: boolean;
    error: Error | null;
    onRetry: () => void;
}

export function InsightCard({title, description, state, footer, children}: PropsWithChildren<{
    title: string;
    description: ReactNode;
    state: InsightState;
    footer?: ReactNode;
}>) {
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} aria-busy={state.isLoading} className="min-w-0 h-full">
            <Card className="shadow-lg gap-4 h-full min-w-0">
                <CardHeader>
                    <CardTitle><h2 id={titleId}>{title}</h2></CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="min-w-0 flex-1">
                    {state.error ? (
                        <div role="alert" className="flex flex-col items-start gap-3 text-sm">
                            <p>Could not load this panel. Please try again.</p>
                            <Button variant="outline" size="sm" onClick={state.onRetry}>Retry</Button>
                        </div>
                    ) : state.isLoading ? (
                        <div role="status" aria-label={`Loading ${title}`} className="space-y-3">
                            <Skeleton className="h-8 w-2/3"/>
                            <Skeleton className="h-36 w-full"/>
                        </div>
                    ) : children}
                </CardContent>
                {!state.isLoading && !state.error && footer && <CardFooter className="flex-wrap justify-between gap-3 text-sm">{footer}</CardFooter>}
            </Card>
        </section>
    );
}
