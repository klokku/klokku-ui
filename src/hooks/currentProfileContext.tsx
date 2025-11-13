import {createContext, PropsWithChildren, useContext, useState} from "react";

type CurrentProfileContextType = {
    currentProfileUid: string | null;
    setCurrentProfileUid: (id: string | null) => void;
}

const CurrentProfileContext = createContext<CurrentProfileContextType | undefined>(undefined)

export const CurrentProfileProvider = ({children}: PropsWithChildren<{}>) => {
    const [currentProfileUid, setCurrentProfileUid] = useState<string | null>(null);

    return (
        <CurrentProfileContext.Provider value={{ currentProfileUid, setCurrentProfileUid}}>
            {children}
        </CurrentProfileContext.Provider>
    )
};

export const useCurrentProfile = () => {
    const context = useContext(CurrentProfileContext);
    if (!context) {
        throw new Error('useCurrentProfile must be used within a CurrentProfileProvider');
    }
    return context;
};
