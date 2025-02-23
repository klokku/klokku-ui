import {createContext, PropsWithChildren, useContext, useState} from "react";

type CurrentProfileContextType = {
    currentProfileId: number | null;
    setCurrentProfileId: (id: number | null) => void;
}

const CurrentProfileContext = createContext<CurrentProfileContextType | undefined>(undefined)

export const CurrentProfileProvider = ({children}: PropsWithChildren<{}>) => {
    const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);

    return (
        <CurrentProfileContext.Provider value={{ currentProfileId, setCurrentProfileId}}>
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
