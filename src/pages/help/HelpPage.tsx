import {ExternalLinkIcon} from "lucide-react";

const DISCORD_INVITE = "https://discord.gg/RXU78auckN";

function DiscordSection() {
    return (
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
            <p className="font-medium">Join the community on Discord</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Get help, share ideas, and connect with other Klokku users.
            </p>
            <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline w-fit"
            >
                discord.gg/RXU78auckN
                <ExternalLinkIcon className="size-3.5"/>
            </a>
        </div>
    );
}

function HelpCommunityPage() {
    return (
        <div className="space-y-6 p-4 max-w-xl">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Help & Feedback</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Need help or want to share feedback? Join our community on Discord.
                </p>
            </div>
            <DiscordSection/>
        </div>
    );
}

export function HelpPage() {
    return <HelpCommunityPage/>;
}
