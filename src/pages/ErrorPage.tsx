/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouteError } from "react-router";
import ErrorSection from "@/components/errorHandler/ErrorSection.tsx";

const ErrorPage = () => {
  const error: any = useRouteError();
  console.error(error);

  return <ErrorSection message={error.statusText || error.message} />;
};

export default ErrorPage;
