import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import useClickUp from "@/api/useClickUp";
import {ClickUpConfiguration} from "@/pages/integrations/ClickUpConfiguration.tsx";

export function IntegrationsPage() {
    const {isAuthenticated, authLogin} = useClickUp();

    const handleClickUpAuth = async () => {
        try {
            const { redirectUrl } = await authLogin();
            window.location.href = redirectUrl;
        } catch (error) {
            console.error("Error authenticating with ClickUp:", error);
        }
    };

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-2xl font-bold">Integrations</h1>

            <Card>
                <CardHeader>
                    <CardTitle>ClickUp Integration</CardTitle>
                    <CardDescription>
                        Connect your ClickUp account to sync tasks with Klokku budgets.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isAuthenticated && (
                        <div className="flex flex-col items-start space-y-4">
                            <p>
                                Connect your ClickUp account to sync tasks with Klokku budgets.
                                You'll need to authenticate with ClickUp to get started.
                            </p>
                            <Button onClick={handleClickUpAuth}>
                                Connect to ClickUp
                            </Button>
                        </div>
                    )}
                    {isAuthenticated && (
                        <ClickUpConfiguration />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
