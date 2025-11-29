import useProfiles from "@/api/useProfiles.ts";
import {PlusIcon} from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ProfileCard} from "@/pages/start/ProfileCard.tsx";
import HeaderLogo from "@/components/headerLogo/HeaderLogo.tsx";
import {useNavigate} from "react-router-dom";
import {paths} from "@/pages/links.ts";
import {setCurrentProfileUid} from "@/components/auth/ProfileProvider.tsx";


export function StartPage() {

    const {allProfiles} = useProfiles();
    const navigate = useNavigate();

    return (
        <div className="h-screen bg-cover bg-center"
             style={{
                 backgroundImage: `url(klokku-strips.png)`,
                 backgroundSize: '80%',
                 backgroundRepeat: 'no-repeat',
                 backgroundPosition: 'left',
             }}
        >
            <div className="w-full h-16 pl-4 flex items-center">
                <HeaderLogo className="h-8" dark={false}/>
            </div>
            <div className="flex flex-col w-screen h-full items-center justify-center">
                <div className="flex flex-col gap-3 items-center">
                    {allProfiles && allProfiles.map(profile => (
                        <ProfileCard key={profile.uid} profile={profile} onClick={() => {
                            if (profile.uid) {
                                setCurrentProfileUid(profile.uid);
                                navigate(paths.root.path);
                            }
                        }}/>
                    ))}

                    <Card className="shadow-card cursor-pointer hover:bg-gray-50 border-0 bg-white/0" role="button" onClick={() => {
                        navigate(paths.createProfile.path)
                    }}>
                        <CardHeader className="flex items-center gap-5 w-72">
                            <PlusIcon className="w-12 h-12"/>
                            <div>
                                <CardTitle>New profile</CardTitle>
                                <CardDescription>Create new profile</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    )
}
