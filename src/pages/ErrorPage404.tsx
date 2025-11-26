import { paths } from "./links";
import { NavLink } from "react-router";

const ErrorPage404 = () => (
  <section className="bg-white">
    <div className="py-8 px-4 mx-auto max-w-(--breakpoint-xl) lg:py-16 lg:px-6">
      <div className="mx-auto max-w-(--breakpoint-sm) text-center">
        <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600">
          😿️
        </h1>
        <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl">
          Oops!
        </p>
        <p className="mb-4 text-lg font-light text-gray-500">
          Whatever you were looking for, we couldn't find it.
        </p>
        <NavLink
          to={paths.root.path}
          className="bg-white inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100"
        >
          Go back to main page
        </NavLink>
      </div>
    </div>
  </section>
);

export default ErrorPage404;
