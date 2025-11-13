import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Profile} from "@/api/types.ts";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";

type Props = {
    profile: Profile
    onClick: () => void
}

export function ProfileCard({profile, onClick}: Props) {

    const firstLetters = (name: string) => name.split(' ').map(word => word[0]).join('');

    return (
        <Card className="shadow-card w-72 cursor-pointer hover:bg-gray-50" onClick={onClick}>
            <CardHeader className="flex-row items-center gap-5">
                <Avatar className="w-12 h-12 rounded-xl">
                    <AvatarImage src={`/api/user/${profile.uid}/photo`} />
                    <AvatarFallback>{firstLetters(profile.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{profile.displayName}</CardTitle>
                    <CardDescription>@{profile.username}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    )
}
