import {PropsWithChildren, useEffect} from "react";
import {paths} from "@/pages/links.ts";
import {Navigate} from "react-router";
import {getCurrentProfileId} from "@/components/auth/ProfileProvider.tsx";
import {useCurrentProfile} from "@/hooks/currentProfileContext.tsx";

type Props = {};

const ProtectedRoute = ({ children }: PropsWithChildren<Props>) => {

  const { setCurrentProfileId } = useCurrentProfile();

  function isLoggedIn(): boolean {
    return getCurrentProfileId() !== null;
  }

  useEffect(
    () => {
      if (isLoggedIn()) {
        setCurrentProfileId(getCurrentProfileId());
      }
    },
    [isLoggedIn])

  if (!isLoggedIn()) {
    return <Navigate to={paths.start.path} />
  }

  return children
};

export default ProtectedRoute;
