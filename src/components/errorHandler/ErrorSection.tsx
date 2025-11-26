type Props = {
  message?: string;
};

const ErrorSection = ({ message }: Props) => (
  <section className="bg-white">
    <div className="py-8 px-4 mx-auto max-w-(--breakpoint-xl) lg:py-16 lg:px-6">
      <div className="mx-auto max-w-(--breakpoint-sm) text-center">
        <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600">
          🙈
        </h1>
        <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl">
          Oops!
        </p>
        <p className="mb-4 text-lg font-light text-gray-500">
          Wystąpił nieoczekiwany błąd!
        </p>
        <p>
          <i>{message}</i>
        </p>
        <a
          href="/"
          className="inline-flex bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-hidden focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-4"
        >
          Powrót do strony głównej
        </a>
      </div>
    </div>
  </section>
);

export default ErrorSection;
